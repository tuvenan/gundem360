import fs from "fs";
import path from "path";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/types/settings";

const DATA_DIR = path.join(process.cwd(), "src", "lib", "data");
const STORE_FILE = path.join(DATA_DIR, "news-store.json");

function readRawStore(): any {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading news-store.json in settings-service:", err);
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
    console.error("Error writing news-store.json in settings-service:", err);
    return false;
  }
}

/**
 * Mevcut site ayarlarını döner. Eksik alanlar DEFAULT_SITE_SETTINGS ile tamamlanır.
 * noStore() → Next.js Request Memoization önbelleğini devre dışı bırakır; her istekte disk okunur.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  noStore(); // Her render'da taze disk verisi oku
  const store = readRawStore();
  const current = store?.siteSettings;

  if (!current || typeof current !== "object") {
    return { ...DEFAULT_SITE_SETTINGS };
  }

  // AI sağlayıcılarını birleştir ve geriye dönük migration yap
  let aiProviders: any[] = current.aiProviders;
  if (!aiProviders || !Array.isArray(aiProviders) || aiProviders.length === 0) {
    aiProviders = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS.aiProviders || []));
  } else {
    // DEFAULT_AI_PROVIDERS içindeki temel sağlayıcılar eksikse ekle
    const existingIds = new Set(aiProviders.map((p: any) => p.id));
    for (const defP of DEFAULT_SITE_SETTINGS.aiProviders || []) {
      if (!existingIds.has(defP.id)) {
        aiProviders.push({ ...defP });
      }
    }
  }

  // Eski aiConfig anahtarlarını yeni sağlayıcılara otomatik senkronize et (Migration)
  const legacyConfig = current.aiConfig;
  if (legacyConfig) {
    if (legacyConfig.geminiApiKey) {
      const geminiP = aiProviders.find((p: any) => p.id === "gemini");
      if (geminiP && !geminiP.apiKey) {
        geminiP.apiKey = legacyConfig.geminiApiKey;
      }
    }
    if (legacyConfig.nvidiaApiKey) {
      const nvidiaP = aiProviders.find((p: any) => p.id === "nvidia");
      if (nvidiaP && !nvidiaP.apiKey) {
        nvidiaP.apiKey = legacyConfig.nvidiaApiKey;
      }
    }
  }

  const activeAiProviderId =
    current.activeAiProviderId ||
    legacyConfig?.defaultProvider ||
    DEFAULT_SITE_SETTINGS.activeAiProviderId ||
    "gemini";

  // Derin birleştirme ile geriye dönük tam uyumluluk sağla
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...current,
    seo: {
      ...DEFAULT_SITE_SETTINGS.seo,
      ...(current.seo || {}),
    },
    aiProviders,
    activeAiProviderId,
    aiConfig: {
      ...DEFAULT_SITE_SETTINGS.aiConfig!,
      ...(current.aiConfig || {}),
    },
    // Widget tercihleri
    showBreakingTicker: current.showBreakingTicker ?? DEFAULT_SITE_SETTINGS.showBreakingTicker,
    showFinanceBar: current.showFinanceBar ?? DEFAULT_SITE_SETTINGS.showFinanceBar,
    showWeatherWidget: current.showWeatherWidget ?? DEFAULT_SITE_SETTINGS.showWeatherWidget,
    showColumnistsSection: current.showColumnistsSection ?? DEFAULT_SITE_SETTINGS.showColumnistsSection,
    showPhotoGallerySection: current.showPhotoGallerySection ?? DEFAULT_SITE_SETTINGS.showPhotoGallerySection,
    showVideoGallerySection: current.showVideoGallerySection ?? DEFAULT_SITE_SETTINGS.showVideoGallerySection,
    showPollWidget: current.showPollWidget ?? DEFAULT_SITE_SETTINGS.showPollWidget,
    autoFinanceRates: current.autoFinanceRates ?? DEFAULT_SITE_SETTINGS.autoFinanceRates,
  };
}

/**
 * Site ayarlarını günceller, kalıcı JSON deposuna kaydeder ve Next.js önbelleğini düşürür.
 */
export async function saveSiteSettings(
  newSettings: Partial<SiteSettings>
): Promise<SiteSettings> {
  let store = readRawStore();
  if (!store || typeof store !== "object") {
    store = { siteSettings: { ...DEFAULT_SITE_SETTINGS } };
  }

  const existing = store.siteSettings || { ...DEFAULT_SITE_SETTINGS };

  const aiProviders =
    newSettings.aiProviders !== undefined
      ? newSettings.aiProviders
      : existing.aiProviders || DEFAULT_SITE_SETTINGS.aiProviders;

  const activeAiProviderId =
    newSettings.activeAiProviderId !== undefined
      ? newSettings.activeAiProviderId
      : existing.activeAiProviderId || DEFAULT_SITE_SETTINGS.activeAiProviderId || "gemini";

  // Geriye dönük uyumluluk için aiConfig senkronizasyonu
  const geminiP = aiProviders?.find((p: any) => p.id === "gemini");
  const nvidiaP = aiProviders?.find((p: any) => p.id === "nvidia");
  const syncedAiConfig = {
    ...DEFAULT_SITE_SETTINGS.aiConfig!,
    ...(existing.aiConfig || {}),
    ...(newSettings.aiConfig || {}),
    geminiApiKey:
      geminiP?.apiKey ||
      newSettings.aiConfig?.geminiApiKey ||
      existing.aiConfig?.geminiApiKey ||
      "",
    geminiModel:
      geminiP?.defaultModel ||
      newSettings.aiConfig?.geminiModel ||
      existing.aiConfig?.geminiModel ||
      "gemini-2.5-flash",
    nvidiaApiKey:
      nvidiaP?.apiKey ||
      newSettings.aiConfig?.nvidiaApiKey ||
      existing.aiConfig?.nvidiaApiKey ||
      "",
    nvidiaModel:
      nvidiaP?.defaultModel ||
      newSettings.aiConfig?.nvidiaModel ||
      existing.aiConfig?.nvidiaModel ||
      "meta/llama-3.3-70b-instruct",
    defaultProvider: (activeAiProviderId === "nvidia" ? "nvidia" : "gemini") as "gemini" | "nvidia",
  };

  const merged: SiteSettings = {
    ...DEFAULT_SITE_SETTINGS,
    ...existing,
    ...newSettings,
    aiProviders,
    activeAiProviderId,
    seo: {
      ...DEFAULT_SITE_SETTINGS.seo,
      ...(existing.seo || {}),
      ...(newSettings.seo || {}),
    },
    aiConfig: syncedAiConfig,
    updatedAt: new Date().toISOString(),
  };

  store.siteSettings = merged;
  writeRawStore(store);

  // Next.js önbelleklerini anında tazele
  try {
    revalidatePath("/", "page");
    revalidatePath("/", "layout");
    revalidatePath("/admin", "page");
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/ayarlar", "page");
    revalidatePath("/admin/ayarlar", "layout");
    revalidatePath("/admin/ai-haber-studyo", "page");
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
  } catch (err) {
    // Statik analiz anında revalidatePath hata verebilir, yoksay
  }

  return merged;
}

