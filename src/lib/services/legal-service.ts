import fs from "fs";
import path from "path";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { LegalPageItem, ContactMessage, DEFAULT_LEGAL_PAGES } from "@/lib/types/legal";

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const STORE_FILE = path.join(DATA_DIR, "news-store.json");

function readRawStore(): any {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading news-store.json in legal-service:", err);
  }
  return null;
}

function writeRawStore(store: any): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing news-store.json in legal-service:", err);
    return false;
  }
}

/**
 * Tüm yasal sayfaları diskten okur. Eksik olan sayfalar DEFAULT_LEGAL_PAGES ile tamamlanır ve kaydedilir.
 */
export async function getLegalPages(): Promise<LegalPageItem[]> {
  noStore();
  const store = readRawStore();
  let pages: LegalPageItem[] = store?.legalPages;

  if (!pages || !Array.isArray(pages) || pages.length === 0) {
    pages = JSON.parse(JSON.stringify(DEFAULT_LEGAL_PAGES));
    if (store) {
      store.legalPages = pages;
      writeRawStore(store);
    }
    return pages;
  }

  // DEFAULT_LEGAL_PAGES içinde olup store'da bulunmayan eksik sayfaları tamamla
  let updated = false;
  const existingIds = new Set(pages.map((p) => p.id));
  for (const def of DEFAULT_LEGAL_PAGES) {
    if (!existingIds.has(def.id)) {
      pages.push({ ...def });
      updated = true;
    }
  }

  if (updated && store) {
    store.legalPages = pages;
    writeRawStore(store);
  }

  return pages;
}

/**
 * Belirli bir slug'a göre yasal sayfayı döner.
 */
export async function getLegalPageBySlug(slug: string): Promise<LegalPageItem | null> {
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const pages = await getLegalPages();
  const found = pages.find((p) => p.slug === normalizedSlug || p.slug === slug);
  return found || null;
}

/**
 * Belirli bir ID'ye göre yasal sayfayı döner.
 */
export async function getLegalPageById(id: string): Promise<LegalPageItem | null> {
  const pages = await getLegalPages();
  const found = pages.find((p) => p.id === id);
  return found || null;
}

/**
 * Yasal sayfayı günceller ve disk store'a kaydeder.
 */
export async function saveLegalPage(page: Partial<LegalPageItem> & { id: string }): Promise<LegalPageItem> {
  noStore();
  const store = readRawStore() || {};
  let pages: LegalPageItem[] = store.legalPages || JSON.parse(JSON.stringify(DEFAULT_LEGAL_PAGES));

  const existingIndex = pages.findIndex((p) => p.id === page.id);
  const now = new Date().toISOString();

  let savedPage: LegalPageItem;

  if (existingIndex >= 0) {
    pages[existingIndex] = {
      ...pages[existingIndex],
      ...page,
      updatedAt: now,
    };
    savedPage = pages[existingIndex];
  } else {
    // Yeni sayfa oluştur
    savedPage = {
      id: page.id,
      title: page.title || "Yasal Sayfa",
      slug: page.slug || `/${page.id}`,
      content: page.content || "<p></p>",
      description: page.description || "",
      updatedAt: now,
    };
    pages.push(savedPage);
  }

  store.legalPages = pages;
  writeRawStore(store);

  // Önbellekleri tazele
  try {
    revalidatePath("/admin/kurumsal-sayfalar");
    revalidatePath("/kunye");
    revalidatePath("/iletisim");
    revalidatePath("/kvkk/aydinlatma-metni");
    revalidatePath("/kvkk/cerez-politikasi");
    revalidatePath("/kvkk/saklama-ve-imha");
    revalidatePath("/kvkk/kamera-aydinlatma");
    revalidatePath("/kvkk/basvuru-formu");
    if (savedPage.slug) {
      revalidatePath(savedPage.slug);
    }
  } catch (err) {
    console.warn("revalidatePath warning in saveLegalPage:", err);
  }

  return savedPage;
}

/**
 * İletişim mesajlarını diskten okur.
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  noStore();
  const store = readRawStore();
  const messages: ContactMessage[] = store?.contactMessages || [];
  // En yeni mesajlar en üstte
  return [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Yeni bir iletişim mesajı kaydeder.
 */
export async function saveContactMessage(
  data: Omit<ContactMessage, "id" | "createdAt" | "isRead">
): Promise<ContactMessage> {
  noStore();
  const store = readRawStore() || {};
  const messages: ContactMessage[] = store.contactMessages || [];

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || "",
    subject: data.subject.trim(),
    message: data.message.trim(),
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  messages.unshift(newMessage);
  store.contactMessages = messages;
  writeRawStore(store);

  try {
    revalidatePath("/admin/kurumsal-sayfalar");
  } catch (err) {
    console.warn("revalidatePath warning in saveContactMessage:", err);
  }

  return newMessage;
}

/**
 * İletişim mesajının okundu/okunmadı durumunu günceller.
 */
export async function markContactMessageAsRead(id: string, isRead: boolean = true): Promise<boolean> {
  noStore();
  const store = readRawStore();
  if (!store || !Array.isArray(store.contactMessages)) return false;

  const msg = store.contactMessages.find((m: ContactMessage) => m.id === id);
  if (!msg) return false;

  msg.isRead = isRead;
  writeRawStore(store);

  try {
    revalidatePath("/admin/kurumsal-sayfalar");
  } catch (err) {}

  return true;
}

/**
 * İletişim mesajını siler.
 */
export async function deleteContactMessage(id: string): Promise<boolean> {
  noStore();
  const store = readRawStore();
  if (!store || !Array.isArray(store.contactMessages)) return false;

  const initialLen = store.contactMessages.length;
  store.contactMessages = store.contactMessages.filter((m: ContactMessage) => m.id !== id);

  if (store.contactMessages.length !== initialLen) {
    writeRawStore(store);
    try {
      revalidatePath("/admin/kurumsal-sayfalar");
    } catch (err) {}
    return true;
  }

  return false;
}
