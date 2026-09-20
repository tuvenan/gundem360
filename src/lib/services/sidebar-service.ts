import fs from "fs";
import path from "path";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { SidebarWidget, DEFAULT_SIDEBAR_WIDGETS } from "@/lib/types/sidebar";

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const STORE_FILE = path.join(DATA_DIR, "news-store.json");

function readRawStore(): any {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading news-store.json in sidebar-service:", err);
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
    console.error("Error writing news-store.json in sidebar-service:", err);
  }
  return false;
}

/**
 * Sağ blok (sidebar) widget'larını döner. Henüz kayıt yoksa varsayılan listeyi döner.
 * noStore() → Next.js Request Memoization önbelleğini devre dışı bırakır; her istekte disk okunur.
 */
export async function getSidebarWidgets(): Promise<SidebarWidget[]> {
  noStore(); // Her render'da taze disk verisi oku
  const store = readRawStore();
  const savedWidgets = store?.sidebarWidgets;

  if (Array.isArray(savedWidgets) && savedWidgets.length > 0) {
    const savedMap = new Map<string, SidebarWidget>();
    savedWidgets.forEach((w: SidebarWidget) => savedMap.set(w.id, w));

    const mergedWidgets: SidebarWidget[] = [];
    savedWidgets.forEach((w: SidebarWidget) => mergedWidgets.push(w));

    // Varsayılanlardan depoda henüz bulunmayanları sona ekle
    DEFAULT_SIDEBAR_WIDGETS.forEach((defW) => {
      if (!savedMap.has(defW.id)) {
        mergedWidgets.push({
          ...defW,
          order: mergedWidgets.length + 1,
        });
      }
    });

    return mergedWidgets.sort((a, b) => a.order - b.order);
  }

  return [...DEFAULT_SIDEBAR_WIDGETS];
}

/**
 * Sağ blok widget listesini kaydeder ve ilgili önbellekleri yeniler.
 */
export async function saveSidebarWidgets(
  widgets: SidebarWidget[]
): Promise<SidebarWidget[]> {
  const store = readRawStore() || {};

  // Sıra numaralarını 1'den başlat
  const normalizedWidgets: SidebarWidget[] = widgets.map((widget, index) => ({
    ...widget,
    order: index + 1,
  }));

  store.sidebarWidgets = normalizedWidgets;
  writeRawStore(store);

  try {
    revalidatePath("/", "page");
    revalidatePath("/", "layout");
    revalidatePath("/admin/sag-blok", "page");
    revalidatePath("/admin/sag-blok", "layout");
    revalidatePath("/haber/[slug]", "page");
  } catch (err) {
    // revalidatePath build-time sırasında sessiz kalsın
  }

  return normalizedWidgets;
}

/**
 * Sağ blok widget düzenini varsayılana sıfırlar.
 */
export async function resetSidebarWidgets(): Promise<SidebarWidget[]> {
  return saveSidebarWidgets(DEFAULT_SIDEBAR_WIDGETS);
}

/**
 * Yeni bir özel sağ blok widget'ı ekler.
 */
export async function addCustomSidebarWidget(
  newWidget: Omit<SidebarWidget, "id" | "order">
): Promise<SidebarWidget> {
  const current = await getSidebarWidgets();
  const createdWidget: SidebarWidget = {
    ...newWidget,
    id: `widget-custom-${Date.now()}`,
    order: current.length + 1,
    isVisible: true,
  };

  const updated = [...current, createdWidget];
  await saveSidebarWidgets(updated);
  return createdWidget;
}

/**
 * Bir sağ blok widget'ını siler.
 */
export async function deleteSidebarWidget(id: string): Promise<boolean> {
  const current = await getSidebarWidgets();
  const filtered = current.filter((w) => w.id !== id);

  if (filtered.length === current.length) return false;

  await saveSidebarWidgets(filtered);
  return true;
}
