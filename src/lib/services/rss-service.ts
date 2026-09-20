import fs from "fs";
import path from "path";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { NewsAgency, RssParsedItem, RssFetchResult, RssFetchOptions } from "@/lib/types/agency";
import { NewsItem } from "@/types/news";
import { createNews, getAllNews } from "@/lib/news-service";

const STORE_PATH = path.join(process.cwd(), "src", "lib", "data", "news-store.json");

// Varsayılan Hazır Ajanslar
export const DEFAULT_AGENCIES: NewsAgency[] = [
  {
    id: "agency-aa",
    name: "Anadolu Ajansı (AA)",
    slug: "anadolu-ajansi",
    websiteUrl: "https://www.aa.com.tr",
    rssUrl: "https://www.aa.com.tr/tr/rss/default?cat=guncel",
    logoUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=200&q=80",
    status: "active",
    defaultCategory: "gundem",
    autoPublish: false,
    fetchedCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "agency-trthaber",
    name: "TRT Haber - Gündem",
    slug: "trt-haber",
    websiteUrl: "https://www.trthaber.com",
    rssUrl: "https://www.trthaber.com/gundem_articles.rss",
    logoUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=200&q=80",
    status: "active",
    defaultCategory: "gundem",
    autoPublish: false,
    fetchedCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "agency-bbcturkce",
    name: "BBC Türkçe",
    slug: "bbc-turkce",
    websiteUrl: "https://www.bbc.com/turkce",
    rssUrl: "https://feeds.bbci.co.uk/turkce/rss.xml",
    logoUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=200&q=80",
    status: "active",
    defaultCategory: "dunya",
    autoPublish: false,
    fetchedCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "agency-bloomberg",
    name: "Bloomberg HT - Ekonomi",
    slug: "bloomberg-ht",
    websiteUrl: "https://www.bloomberght.com",
    rssUrl: "https://www.bloomberght.com/rss",
    logoUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=200&q=80",
    status: "active",
    defaultCategory: "ekonomi",
    autoPublish: false,
    fetchedCount: 0,
    createdAt: new Date().toISOString(),
  },
];

function readRawStore(): any {
  try {
    if (!fs.existsSync(STORE_PATH)) return {};
    const content = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("RSS service read store error:", err);
    return {};
  }
}

function writeRawStore(store: any): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("RSS service write store error:", err);
  }
}

/**
 * Tüm ajansları getirir. Henüz depoda yoksa varsayılanları başlatır.
 */
export async function getAllAgencies(): Promise<NewsAgency[]> {
  noStore();
  const store = readRawStore();
  if (!store.agencies || !Array.isArray(store.agencies) || store.agencies.length === 0) {
    store.agencies = [...DEFAULT_AGENCIES];
    writeRawStore(store);
    return store.agencies;
  }
  return store.agencies;
}

/**
 * ID'ye göre ajans getirir.
 */
export async function getAgencyById(id: string): Promise<NewsAgency | null> {
  const agencies = await getAllAgencies();
  return agencies.find((a) => a.id === id) || null;
}

/**
 * Yeni ajans kaydeder.
 */
export async function createAgency(data: Omit<NewsAgency, "id" | "createdAt" | "fetchedCount">): Promise<NewsAgency> {
  const store = readRawStore();
  const agencies: NewsAgency[] = store.agencies && Array.isArray(store.agencies) ? store.agencies : [...DEFAULT_AGENCIES];

  const newAgency: NewsAgency = {
    ...data,
    id: `agency-${Date.now()}`,
    fetchedCount: 0,
    createdAt: new Date().toISOString(),
  };

  store.agencies = [newAgency, ...agencies];
  writeRawStore(store);

  try {
    revalidatePath("/admin/ajanslar");
  } catch {}

  return newAgency;
}

/**
 * Ajansı günceller.
 */
export async function updateAgency(id: string, updates: Partial<NewsAgency>): Promise<NewsAgency | null> {
  const store = readRawStore();
  const agencies: NewsAgency[] = store.agencies && Array.isArray(store.agencies) ? store.agencies : [...DEFAULT_AGENCIES];
  const idx = agencies.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  agencies[idx] = {
    ...agencies[idx],
    ...updates,
  };

  store.agencies = agencies;
  writeRawStore(store);

  try {
    revalidatePath("/admin/ajanslar");
  } catch {}

  return agencies[idx];
}

/**
 * Ajansı siler.
 */
export async function deleteAgency(id: string): Promise<boolean> {
  const store = readRawStore();
  const agencies: NewsAgency[] = store.agencies && Array.isArray(store.agencies) ? store.agencies : [...DEFAULT_AGENCIES];
  const initial = agencies.length;
  store.agencies = agencies.filter((a) => a.id !== id);
  writeRawStore(store);

  try {
    revalidatePath("/admin/ajanslar");
  } catch {}

  return store.agencies.length < initial;
}

/**
 * CDATA ve HTML etiketlerini temizleme yardımcısı
 */
function cleanXmlText(text: string): string {
  if (!text) return "";
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * XML içinden etiket içeriğini çeker (CDATA uyumlu)
 */
function extractTagContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? cleanXmlText(match[1]) : "";
}

/**
 * Ham HTML/XML içeriğini koruyarak çeker (Zengin içerik için)
 */
function extractRawTagContent(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(regex);
  if (!match) return "";
  let content = match[1];
  if (content.includes("<![CDATA[")) {
    content = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  }
  return content.trim();
}

/**
 * RSS item içinden görsel URL'si ayıklar
 */
function extractImageUrl(itemXml: string): string | undefined {
  // 1. Enclosure
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i);
  if (enclosureMatch && enclosureMatch[1]) return enclosureMatch[1];

  // 2. Media:content
  const mediaContentMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["'][^>]*>/i);
  if (mediaContentMatch && mediaContentMatch[1]) return mediaContentMatch[1];

  // 3. Media:thumbnail
  const thumbnailMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*>/i);
  if (thumbnailMatch && thumbnailMatch[1]) return thumbnailMatch[1];

  // 4. Description içindeki <img> etiketi
  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

  return undefined;
}

/**
 * RSS/XML Adresini Çeker ve Ayrıştırır
 */
export async function fetchAndParseRss(rssUrl: string, agencyName?: string): Promise<RssParsedItem[]> {
  try {
    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Gündem360-RssBot/1.0",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`RSS kaynağına ulaşılamadı (HTTP ${res.status}): ${rssUrl}`);
    }

    const xmlText = await res.text();
    return parseRssXmlString(xmlText, agencyName);
  } catch (error: any) {
    console.error("fetchAndParseRss error:", error);
    throw new Error(`RSS akışı taranırken hata: ${error.message}`);
  }
}

/**
 * Ham XML metnini ayrıştıran regex tabanlı parser motoru
 */
export function parseRssXmlString(xmlText: string, agencyName?: string): RssParsedItem[] {
  const items: RssParsedItem[] = [];

  // Mevcut haberleri alarak duplicate (daha önce eklenmiş) kontrolü yap
  const existingNews = readRawStore().news || [];
  const existingUrls = new Set(
    existingNews.map((n: NewsItem) => (n.sourceUrl || "").trim()).filter(Boolean)
  );

  // <item> (RSS 2.0) veya <entry> (Atom) bloklarını bul
  const itemMatches = xmlText.match(/<(?:item|entry)[\s>][\s\S]*?<\/(?:item|entry)>/gi) || [];

  for (const itemXml of itemMatches) {
    const title = extractTagContent(itemXml, "title");
    if (!title) continue;

    // Link ayrıştırma
    let link = "";
    const linkTagMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    if (linkTagMatch && linkTagMatch[1]) {
      link = cleanXmlText(linkTagMatch[1]);
    } else {
      const linkHrefMatch = itemXml.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
      if (linkHrefMatch && linkHrefMatch[1]) {
        link = linkHrefMatch[1].trim();
      }
    }

    // Guid veya id
    const guid = extractTagContent(itemXml, "guid") || extractTagContent(itemXml, "id") || link || title;

    // Description / Summary
    const description =
      extractTagContent(itemXml, "description") ||
      extractTagContent(itemXml, "summary") ||
      title;

    // Content (Zengin Metin)
    const rawContent =
      extractRawTagContent(itemXml, "content:encoded") ||
      extractRawTagContent(itemXml, "content") ||
      description;

    // Yayın Tarihi
    const rawDate =
      extractTagContent(itemXml, "pubDate") ||
      extractTagContent(itemXml, "published") ||
      extractTagContent(itemXml, "updated") ||
      extractTagContent(itemXml, "dc:date");

    let formattedDate = new Date().toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } catch {}
    }

    // Kapak Görseli
    const imageUrl = extractImageUrl(itemXml);

    // Kategori
    const category = extractTagContent(itemXml, "category");

    // Duplicate Check
    const isImported = existingUrls.has(link.trim());

    items.push({
      guid,
      title,
      link,
      description: description.slice(0, 300),
      content: rawContent,
      pubDate: formattedDate,
      imageUrl,
      category,
      sourceAgency: agencyName,
      isImported,
    });
  }

  return items;
}

/**
 * RSS Akışını tarar, ayrıştırır ve istenirse yeni haberleri otomatik sisteme kaydeder.
 */
export async function fetchAndImportAgencyFeed(
  agencyId: string,
  options: RssFetchOptions = {}
): Promise<RssFetchResult> {
  const agency = await getAgencyById(agencyId);
  if (!agency) {
    throw new Error(`Ajans bulunamadı: ${agencyId}`);
  }

  const items = await fetchAndParseRss(agency.rssUrl, agency.name);
  const targetCategory = options.targetCategory || agency.defaultCategory || "gundem";
  const limit = options.limit || 25;

  const candidateItems = items.slice(0, limit);
  const newItems = candidateItems.filter((i) => !i.isImported);

  // Sadece önizleme isteniyorsa kaydetme
  if (options.previewOnly) {
    return {
      agency,
      totalFound: items.length,
      newItemsCount: newItems.length,
      items: candidateItems,
      importedCount: 0,
    };
  }

  // Eğer kullanıcı belirli haberleri seçtiyse sadece seçilenleri sisteme aktar
  let itemsToImport = newItems;
  if (options.selectedGuids && options.selectedGuids.length > 0) {
    const guidSet = new Set(options.selectedGuids);
    itemsToImport = candidateItems.filter(
      (i) => guidSet.has(i.guid) || guidSet.has(i.link)
    );
  } else if (options.selectedLinks && options.selectedLinks.length > 0) {
    const linkSet = new Set(options.selectedLinks);
    itemsToImport = candidateItems.filter((i) => linkSet.has(i.link));
  }

  // Mevcut sistem kategorilerini oku (Başlık eşleştirmesi için)
  const store = readRawStore();
  const availableCategories: any[] = store.categories || [];
  const defaultGlobalCategory = options.targetCategory || agency.defaultCategory || "gundem";

  // Yeni haberleri sisteme kaydet
  let importedCount = 0;
  for (const item of itemsToImport) {
    try {
      // Dinamik kategori belirle: Tekil atama varsa onu al, yoksa genel seçilen kategoriyi al
      const itemCatKey =
        options.itemCategories?.[item.guid] ||
        options.itemCategories?.[item.link] ||
        defaultGlobalCategory;

      const categorySlug = itemCatKey.toLowerCase().trim();
      const matchedCat = availableCategories.find(
        (c) => c.key.toLowerCase() === categorySlug
      );
      const categoryTitle = matchedCat ? matchedCat.name.toUpperCase() : categorySlug.toUpperCase();

      const slug =
        item.title
          .toLowerCase()
          .trim()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") +
        "-" +
        Date.now().toString().slice(-4);

      await createNews({
        title: item.title,
        slug,
        summary: item.description || item.title,
        content: item.content || `<p>${item.description}</p>`,
        category: categorySlug,
        categoryTitle: categoryTitle,
        imageUrl:
          item.imageUrl ||
          "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
        headlineType: agency.autoPublish ? "main" : "normal",
        author: {
          id: agency.id,
          name: agency.name,
          role: "Ajans Muhabiri",
          avatar: agency.logoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        },
        readTimeMinutes: 3,
        tags: [agency.name, categoryTitle, "Ajans Haberi"],
        imageBadgeText: "AJANS HABERİ",
        imageBadgeColor: "bg-zinc-900",
        sourceUrl: item.link,
        agencyId: agency.id,
      });

      importedCount++;
    } catch (err) {
      console.error("Haber RSS'ten kaydedilirken hata:", err);
    }
  }

  // Ajans sayaçlarını güncelle
  await updateAgency(agency.id, {
    lastFetchedAt: new Date().toLocaleString("tr-TR"),
    fetchedCount: (agency.fetchedCount || 0) + importedCount,
  });

  try {
    revalidatePath("/", "page");
    revalidatePath("/", "layout");
    revalidatePath("/admin/haberler");
    revalidatePath("/admin/ajanslar");
  } catch {}

  return {
    agency,
    totalFound: items.length,
    newItemsCount: newItems.length,
    items: candidateItems,
    importedCount,
  };
}
