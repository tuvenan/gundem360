export type CategoryLayoutVariant =
  | "classic-split"
  | "grid-4"
  | "list-vertical"
  | "featured-hero-banner";

export interface CategoryItem {
  id?: string;
  key: string;
  name: string;
  href: string;
  order?: number;
  badgeColor?: string;
  layoutVariant?: CategoryLayoutVariant;
  count?: number;
}

export const LAYOUT_VARIANT_OPTIONS: {
  value: CategoryLayoutVariant;
  label: string;
  description: string;
}[] = [
  {
    value: "classic-split",
    label: "Klasik Bölünmüş (7 + 5 Kolon)",
    description: "Sol tarafta 1 büyük öne çıkan haber kartı, sağ tarafta 4 adet dikey sıralı yan haber.",
  },
  {
    value: "grid-4",
    label: "4'lü Eşit Kart Izgarası",
    description: "Yan yana 4 eşit sütunlu modern kart vitrini (Desktop: 4, Tablet: 2, Mobil: 1).",
  },
  {
    value: "list-vertical",
    label: "Dikey Akış Liste Görünümü",
    description: "Sol tarafta küçük görsel, sağ tarafta başlık, spot özet ve yayın saati olan kompakt liste.",
  },
  {
    value: "featured-hero-banner",
    label: "Geniş Hero Banner + 3'lü Seri",
    description: "Üstte büyük yatay manşet görseli ve spotu, hemen altında 3 adet tamamlayıcı kart.",
  },
];
