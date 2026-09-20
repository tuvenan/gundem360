export interface NewsAgency {
  id: string;
  name: string;
  slug: string;
  websiteUrl: string;
  rssUrl: string;
  logoUrl?: string;
  status: "active" | "inactive";
  defaultCategory?: string; // İsteğe bağlı varsayılan (artık önizleme modalından seçilir)
  autoPublish: boolean;    // true ise doğrudan yayınlar, false ise normal haber
  lastFetchedAt?: string;
  fetchedCount?: number;
  createdAt: string;
}

export interface RssParsedItem {
  guid: string;
  title: string;
  link: string;
  description: string;
  content?: string;
  pubDate: string;
  imageUrl?: string;
  category?: string;
  sourceAgency?: string;
  isImported?: boolean; // Daha önce içeri alınıp alınmadığı
}

export interface RssFetchResult {
  agency: NewsAgency;
  totalFound: number;
  newItemsCount: number;
  items: RssParsedItem[];
  importedCount?: number;
}

export interface RssFetchOptions {
  previewOnly?: boolean;
  limit?: number;
  targetCategory?: string;
  itemCategories?: Record<string, string>; // guid/link -> categoryKey (tekil haber bazında kategori atama)
  selectedGuids?: string[];
  selectedLinks?: string[];
}
