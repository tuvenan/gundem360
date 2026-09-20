import fs from "fs";
import path from "path";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { LayoutBlock, DEFAULT_HOMEPAGE_LAYOUT } from "@/lib/types/layout";

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const STORE_FILE = path.join(DATA_DIR, "news-store.json");

function readRawStore(): any {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading news-store.json in layout-service:", err);
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
    console.error("Error writing news-store.json in layout-service:", err);
  }
  return false;
}

/**
 * Ana sayfa blok düzenini döner. Henüz kaydedilmiş düzen yoksa DEFAULT_HOMEPAGE_LAYOUT döner.
 * noStore() → Next.js Request Memoization önbelleğini devre dışı bırakır; her istekte disk okunur.
 */
export async function getHomepageLayout(): Promise<LayoutBlock[]> {
  noStore(); // Her render'da taze disk verisi oku
  const store = readRawStore();
  const savedBlocks = store?.homepageLayout;

  if (Array.isArray(savedBlocks) && savedBlocks.length > 0) {
    // Kayıtlı bloklar ile varsayılan blokları eşleştir, yeni eklenen varsayılan blok varsa eksik kalmasın
    const savedMap = new Map<string, LayoutBlock>();
    savedBlocks.forEach((b: LayoutBlock) => savedMap.set(b.id, b));

    const mergedBlocks: LayoutBlock[] = [];
    
    // Önce kayıtlı olanları sırasına göre ekle
    savedBlocks.forEach((b: LayoutBlock) => {
      mergedBlocks.push(b);
    });

    // Eğer varsayılanlar içinde henüz depoda olmayan yeni blok varsa sonuna ekle
    DEFAULT_HOMEPAGE_LAYOUT.forEach((defBlock) => {
      if (!savedMap.has(defBlock.id)) {
        mergedBlocks.push({
          ...defBlock,
          order: mergedBlocks.length + 1,
        });
      }
    });

    return mergedBlocks.sort((a, b) => a.order - b.order);
  }

  return [...DEFAULT_HOMEPAGE_LAYOUT];
}

/**
 * Ana sayfa blok dizisini kaydeder ve Next.js önbelleğini yeniler.
 */
export async function saveHomepageLayout(blocks: LayoutBlock[]): Promise<LayoutBlock[]> {
  const store = readRawStore() || {};

  // Sıra numaralarını 1'den başlayarak garantiye al
  const normalizedBlocks: LayoutBlock[] = blocks.map((block, index) => ({
    ...block,
    order: index + 1,
  }));

  store.homepageLayout = normalizedBlocks;
  writeRawStore(store);

  try {
    // 'page'   → yalnızca o URL'nin statik render önbelleğini siler
    // 'layout' → o segment ve tüm alt segment ağacının önbelleğini siler
    revalidatePath("/", "page");
    revalidatePath("/", "layout");
    revalidatePath("/admin/sayfa-duzeni", "page");
    revalidatePath("/admin/sayfa-duzeni", "layout");
  } catch (err) {
    // revalidatePath build-time veya test ortamında hata vermesin
  }

  return normalizedBlocks;
}

/**
 * Ana sayfa düzenini varsayılan fabrika ayarlarına sıfırlar.
 */
export async function resetHomepageLayout(): Promise<LayoutBlock[]> {
  return saveHomepageLayout(DEFAULT_HOMEPAGE_LAYOUT);
}
