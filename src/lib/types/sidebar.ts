export type SidebarWidgetType =
  | "most-read"
  | "weather"
  | "finance"
  | "poll"
  | "banner"
  | "custom-html";

export interface SidebarWidgetConfig {
  itemCount?: number;
  imageUrl?: string;
  targetUrl?: string;
  altText?: string;
  htmlContent?: string;
  accentColor?: string;
}

export interface SidebarWidget {
  id: string;
  type: SidebarWidgetType;
  title: string;
  description?: string;
  isVisible: boolean;
  order: number;
  config?: SidebarWidgetConfig;
}

export const DEFAULT_SIDEBAR_WIDGETS: SidebarWidget[] = [
  {
    id: "widget-most-read",
    type: "most-read",
    title: "Çok Okunan Haberler",
    description: "En çok görüntülenen ve günün popüler haberleri",
    isVisible: true,
    order: 1,
    config: {
      itemCount: 5,
    },
  },
  {
    id: "widget-finance",
    type: "finance",
    title: "Piyasalar & Canlı Kurlar",
    description: "Dolar, Euro, Altın ve BIST 100 güncel piyasa tablosu",
    isVisible: true,
    order: 2,
  },
  {
    id: "widget-banner",
    type: "banner",
    title: "Özel Reklam & Sponsor Alanı",
    description: "Görsel ve yönlendirme bağlantılı sponsor yerleşimi",
    isVisible: true,
    order: 3,
    config: {
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
      targetUrl: "https://gundem360.com",
      altText: "Gündem360 Sponsoru",
    },
  },
  {
    id: "widget-weather",
    type: "weather",
    title: "Canlı Hava Durumu",
    description: "İstanbul, Ankara ve İzmir için güncel hava tahminleri",
    isVisible: true,
    order: 4,
  },
  {
    id: "widget-poll",
    type: "poll",
    title: "Kamuoyu Yoklaması & Anket",
    description: "Günün aktif anketi ve hızlı oy kullanma kartı",
    isVisible: true,
    order: 5,
  },
  {
    id: "widget-custom-html",
    type: "custom-html",
    title: "Mobil Uygulama & Duyuru",
    description: "Özel HTML kodu, sosyal medya veya bülten duyuru alanı",
    isVisible: true,
    order: 6,
    config: {
      htmlContent: `<div class="p-4 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-xl text-center space-y-2 shadow-sm">
  <div class="text-xs font-black uppercase tracking-wider text-red-200">Gündem360 Mobil</div>
  <p class="text-sm font-bold leading-snug">Son dakika haberleri anında cebinizde!</p>
  <div class="text-[11px] text-red-100/90 pt-1">iOS ve Android uygulamalarımız çok yakında yayında.</div>
</div>`,
    },
  },
];
