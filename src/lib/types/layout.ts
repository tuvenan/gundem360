export type LayoutBlockType =
  | "breaking-ticker"
  | "finance-bar"
  | "classic-hero"
  | "surmanset-grid"
  | "category-block"
  | "columnists-section"
  | "photo-gallery-grid"
  | "video-gallery-grid"
  | "poll-widget";

export interface LayoutBlockConfig {
  categoryKey?: string;
  badgeColor?: string;
  itemCount?: number;
  accentColor?: string;
}

export interface LayoutBlock {
  id: string;
  type: LayoutBlockType;
  title: string;
  description?: string;
  isVisible: boolean;
  order: number;
  config?: LayoutBlockConfig;
}

export const DEFAULT_HOMEPAGE_LAYOUT: LayoutBlock[] = [
  {
    id: "block-breaking-ticker",
    type: "breaking-ticker",
    title: "Flaş Haber & Son Dakika Bandı",
    description: "Kırmızı kayan son dakika haberleri şeridi",
    isVisible: true,
    order: 1,
  },
  {
    id: "block-finance-bar",
    type: "finance-bar",
    title: "Canlı Finans & Kur Bandı",
    description: "Dolar, Euro, Altın ve BIST canlı kur şeridi",
    isVisible: true,
    order: 2,
  },
  {
    id: "block-classic-hero",
    type: "classic-hero",
    title: "1-10 Numaralı Klasik Manşet Vitrini",
    description: "Sol tarafta 10'lu manşet slider'ı ve sağda ikili yan vitrin",
    isVisible: true,
    order: 3,
  },
  {
    id: "block-surmanset-grid",
    type: "surmanset-grid",
    title: "4'lü Sürmanşet Vitrini",
    description: "Öne çıkan sıcak gelişmeler için 4 sütunlu kart ızgarası",
    isVisible: true,
    order: 4,
  },
  {
    id: "block-category-gundem",
    type: "category-block",
    title: "Gündem Haberleri",
    description: "Gündem kategorisine ait öne çıkan ve liste haberleri",
    isVisible: true,
    order: 5,
    config: {
      categoryKey: "gundem",
      badgeColor: "bg-red-600",
    },
  },
  {
    id: "block-category-ekonomi",
    type: "category-block",
    title: "Ekonomi & Finans",
    description: "Piyasa ve ekonomi kategorisine ait haberler",
    isVisible: true,
    order: 6,
    config: {
      categoryKey: "ekonomi",
      badgeColor: "bg-emerald-600",
    },
  },
  {
    id: "block-columnists",
    type: "columnists-section",
    title: "Köşe Yazarları Vitrini",
    description: "Gazete köşe yazarlarının son yazıları ve profil kartları",
    isVisible: true,
    order: 7,
  },
  {
    id: "block-category-spor",
    type: "category-block",
    title: "Spor Dünyası",
    description: "Süper Lig ve dünya sporundan en son haberler",
    isVisible: true,
    order: 8,
    config: {
      categoryKey: "spor",
      badgeColor: "bg-amber-600",
    },
  },
  {
    id: "block-category-teknoloji",
    type: "category-block",
    title: "Bilim & Teknoloji",
    description: "Yapay zeka, inovasyon ve teknoloji haberleri",
    isVisible: true,
    order: 9,
    config: {
      categoryKey: "teknoloji",
      badgeColor: "bg-blue-600",
    },
  },
  {
    id: "block-photo-gallery",
    type: "photo-gallery-grid",
    title: "Foto Galeri Vitrini (4'lü Grid)",
    description: "Ana sayfada yan yana 4 eşit kutulu foto galeri albümleri",
    isVisible: true,
    order: 10,
  },
  {
    id: "block-video-gallery",
    type: "video-gallery-grid",
    title: "Video Galeri Vitrini (4'lü Grid)",
    description: "Özel oynatıcı ve video haberler için 4'lü kart vitrini",
    isVisible: true,
    order: 11,
  },
  {
    id: "block-poll",
    type: "poll-widget",
    title: "Kamuoyu Yoklaması & Anket",
    description: "Aktif öne çıkan ziyaretçi oylama ve sonuç bileşeni",
    isVisible: true,
    order: 12,
  },
];
