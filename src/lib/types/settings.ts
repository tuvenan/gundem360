export interface WidgetSettings {
  showBreakingTicker: boolean;
  showFinanceBar: boolean;
  showWeatherWidget: boolean;
  showColumnistsSection: boolean;
  showPhotoGallerySection: boolean;
  showVideoGallerySection: boolean;
  showPollWidget: boolean;
  autoFinanceRates: boolean;
}

export interface SocialSettings {
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappUrl: string;
  linkedinUrl?: string;
  telegramUrl?: string;
  tiktokUrl?: string;
}

export interface SiteSeoSettings {
  metaTitleTemplate?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string;
  canonicalUrl?: string;
  robotsIndex?: "index, follow" | "noindex, follow" | "noindex, nofollow";
  maxSnippet?: boolean;
  maxImagePreview?: "large" | "standard" | "none";
  maxVideoPreview?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: "summary_large_image" | "summary";
  twitterHandle?: string;
  googleVerification?: string;
  bingVerification?: string;
  yandexVerification?: string;
  publisherType?: "NewsMediaOrganization" | "Organization";
  publisherLogo?: string;
  googleNewsName?: string;
  robotsTxt?: string;
  seoScore?: number;
}

export interface SiteSettings {
  // 1. Genel Kimlik ve Kurumsal
  siteName: string;
  siteSlogan: string;
  siteLogo?: string;
  favicon?: string;
  establishedYear?: string;
  copyrightText?: string;
  companyName?: string;
  taxOffice?: string;
  taxNumber?: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  mapsEmbedUrl?: string;

  // 2. Sosyal Medya Bağlantıları
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappUrl: string;
  linkedinUrl?: string;
  telegramUrl?: string;
  tiktokUrl?: string;

  // 3. Widget ve Bölüm Görünürlük Tercihleri
  showBreakingTicker?: boolean;
  showFinanceBar?: boolean;
  showWeatherWidget?: boolean;
  showColumnistsSection?: boolean;
  showPhotoGallerySection?: boolean;
  showVideoGallerySection?: boolean;
  showPollWidget?: boolean;
  autoFinanceRates: boolean;

  // 4. SEO ve Meta Ayarları
  seo?: SiteSeoSettings;

  // 5. Dinamik ve Çoklu Sağlayıcı Yapay Zeka (Multi-Provider AI) API Yapılandırması
  aiProviders?: AIProviderConfig[];
  activeAiProviderId?: string;

  // Geriye dönük uyumluluk için eski aiConfig alanı
  aiConfig?: {
    geminiApiKey: string;
    geminiModel: string; // Örn: "gemini-2.5-flash"
    nvidiaApiKey: string;
    nvidiaModel: string; // Örn: "meta/llama-3.3-70b-instruct"
    defaultProvider: "gemini" | "nvidia";
    imageModelProvider?: "nvidia" | "pollinations";
  };

  // 6. Gelişmiş, Bakım Modu ve Kod Enjeksiyonları
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  customHeaderJs?: string;
  customFooterJs?: string;
  customCss?: string;

  // Güncelleme zamanı
  updatedAt?: string;
}

export interface AIProviderConfig {
  id: string;          // Örn: 'gemini', 'openai', 'anthropic', 'deepseek', 'groq', 'nvidia', 'ollama', 'custom'
  name: string;        // Görünen İsim (Örn: 'OpenAI (ChatGPT)', 'DeepSeek AI', 'Claude')
  apiKey: string;      // API Anahtarı
  baseUrl?: string;    // Özel endpoint desteği (Ollama veya custom proxy için)
  defaultModel: string;// Varsayılan model adı (Örn: 'gpt-4o', 'deepseek-chat')
  isEnabled: boolean;  // Aktif / Pasif durumu
}

export const DEFAULT_AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    apiKey: "",
    baseUrl: "",
    defaultModel: "gemini-2.5-flash",
    isEnabled: true,
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    apiKey: "",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    isEnabled: true,
  },
  {
    id: "deepseek",
    name: "DeepSeek AI",
    apiKey: "",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    isEnabled: true,
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    apiKey: "",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    isEnabled: true,
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    apiKey: "",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    defaultModel: "meta/llama-3.3-70b-instruct",
    isEnabled: true,
  },
  {
    id: "groq",
    name: "Groq Cloud (Ultra Hızlı)",
    apiKey: "",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    isEnabled: true,
  },
  {
    id: "ollama",
    name: "Ollama (Yerel Sunucu)",
    apiKey: "ollama",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3:latest",
    isEnabled: false,
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Gündem360",
  siteSlogan: "Son Dakika, Güncel ve Tarafsız Haber Portalı",
  siteLogo: "/logo.png",
  favicon: "/favicon.ico",
  establishedYear: "2024",
  copyrightText: "© 2026 Gündem360 Medya Grubu. Tüm hakları saklıdır.",
  companyName: "Gündem360 Medya ve Yayıncılık A.Ş.",
  taxOffice: "Beyoğlu V.D.",
  taxNumber: "4820194829",
  address: "Büyükdere Cad. No: 185 Levent, Şişli / İstanbul",
  contactPhone: "+90 (212) 444 36 00",
  contactEmail: "iletisim@gundem360.com",
  mapsEmbedUrl: "https://maps.google.com",

  twitterUrl: "https://x.com/gundem360",
  facebookUrl: "https://facebook.com/gundem360",
  instagramUrl: "https://instagram.com/gundem360",
  youtubeUrl: "https://youtube.com/@gundem360",
  whatsappUrl: "https://whatsapp.com/channel/gundem360",
  linkedinUrl: "https://linkedin.com/company/gundem360",
  telegramUrl: "https://t.me/gundem360haber",
  tiktokUrl: "https://tiktok.com/@gundem360",

  showBreakingTicker: true,
  showFinanceBar: true,
  showWeatherWidget: true,
  showColumnistsSection: true,
  showPhotoGallerySection: true,
  showVideoGallerySection: true,
  showPollWidget: true,
  autoFinanceRates: true,

  seo: {
    metaTitleTemplate: "%s | Son Dakika ve Güncel Haberler - Gündem360",
    metaTitle: "Gündem360 | Son Dakika, Güncel ve Tarafsız Haber Portalı",
    metaDescription: "Türkiye ve dünyadan son dakika haberleri, ekonomi, spor, teknoloji, gündem ve analizlerle en hızlı ve doğru haber kaynağınız.",
    focusKeywords: "haber, son dakika, ekonomi, gündem, spor, teknoloji, canlı borsa, tarafsız haber",
    canonicalUrl: "https://gundem360.com",
    robotsIndex: "index, follow",
    maxSnippet: true,
    maxImagePreview: "large",
    maxVideoPreview: true,
    ogTitle: "Gündem360 | Hızlı, Tarafsız & Doğru Haber Portalı",
    ogDescription: "Türkiye ve dünyadan anlık son dakika haberleri, ekonomi analizleri, spor ve gündem başlıkları.",
    ogImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80",
    twitterCard: "summary_large_image",
    twitterHandle: "@gundem360",
    googleVerification: "google-site-verification-gundem360-2026",
    bingVerification: "bing-site-verification-gundem360-2026",
    yandexVerification: "",
    publisherType: "NewsMediaOrganization",
    publisherLogo: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80",
    googleNewsName: "Gündem360",
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: https://gundem360.com/sitemap.xml",
    seoScore: 96,
  },

  activeAiProviderId: "gemini",
  aiProviders: DEFAULT_AI_PROVIDERS,

  aiConfig: {
    geminiApiKey: "",
    geminiModel: "gemini-2.5-flash",
    nvidiaApiKey: "",
    nvidiaModel: "meta/llama-3.3-70b-instruct",
    defaultProvider: "gemini",
    imageModelProvider: "pollinations",
  },

  maintenanceMode: false,
  maintenanceMessage: "Değerli okurlarımız; sistemlerimizde gerçekleştirilen kapsamlı altyapı ve sunucu güncellemeleri nedeniyle sitemiz kısa süreliğine bakım modundadır. Anlayışınız için teşekkür ederiz.",
  googleAnalyticsId: "G-G360NEWS2026",
  googleTagManagerId: "GTM-G360X01",
  customHeaderJs: "",
  customFooterJs: "",
  customCss: "",
  updatedAt: new Date().toISOString(),
};
