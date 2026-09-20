export type CategoryKey =
  | "gundem"
  | "ekonomi"
  | "spor"
  | "teknoloji"
  | "dunya"
  | "yasam"
  | "kultur";

export type HeadlineType = "main" | "sub" | "breaking" | "normal";

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  seoScore?: number;
  tags?: string[];
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  summary: string; // Spot metin
  content: string; // Detay metni
  category: CategoryKey | string;
  categoryTitle: string;
  imageUrl: string;
  headlineType: HeadlineType;
  headlineOrder?: number; // 1-10 arası manşet numarası
  publishedAt: string;
  updatedAt?: string;
  author: Author;
  readTimeMinutes: number;
  views: number;
  tags: string[];
  isBreaking?: boolean;
  imageBadgeText?: string;
  imageBadgeColor?: string;
  imageBadge?: {
    text: string;
    color: string;
    bgColor?: string;
    textColor?: string;
  };
  sourceUrl?: string;
  agencyId?: string;
  seo?: SeoMetadata;
}

export interface PaginatedNewsResult {
  news: NewsItem[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ColumnistArticle {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  views?: number;
  tags?: string[];
  createdAt?: string;
}

export interface Columnist {
  id: string;
  name: string;
  slug?: string;
  title: string;
  avatar: string;
  bio?: string;
  email?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  createdAt?: string;
  // Son / Güncel makalesi (Geriye dönük uyumluluk ve hızlı erişim için)
  articleTitle: string;
  articleDate: string;
  articleSlug: string;
  excerpt: string;
  content: string;
  // Yazara ait tüm makale arşivi
  articles?: ColumnistArticle[];
}

export type VoteType = "up" | "down";

export interface Comment {
  id: string;
  newsId: string;
  newsTitle?: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number; // upvotes
  dislikes?: number; // downvotes
  parentId?: string | null; // Yanıt verilen üst yorumun id'si
  replyToAuthor?: string; // Yanıt verilen kişinin adı (örn: "@Ahmet Yılmaz")
  status?: "approved" | "pending" | "rejected";
  replies?: Comment[]; // İsteğe bağlı hiyerarşik ağaç gösterimi için
}

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

export type {
  WidgetSettings,
  SocialSettings,
  SiteSeoSettings,
  SiteSettings,
  AIProviderConfig,
} from "@/lib/types/settings";
export { DEFAULT_SITE_SETTINGS, DEFAULT_AI_PROVIDERS } from "@/lib/types/settings";

export interface FinanceRate {
  code: string;
  name: string;
  value: string;
  change: string;
  isUp: boolean;
}

export interface WeatherInfo {
  city: string;
  degree: number;
  condition: string;
}

export interface GalleryCategory {
  id: string;
  key: string;
  name: string;
  badgeColor?: string;
  description?: string;
  count?: number;
  coverImage?: string;
  photoCount?: number;
}

export interface GallerySlide {
  id: string;
  imageUrl: string;
  title?: string;
  caption: string;
  order: number;
}

export interface PhotoGallery {
  id: string;
  slug: string;
  title: string;
  spot: string;
  category: string;
  categoryTitle?: string;
  categoryBadgeColor?: string;
  coverImage: string;
  slides: GallerySlide[];
  viewCount: number;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  isFeatured?: boolean;
}

export type {
  VideoCategory,
  VideoItem,
  CategoryDeleteStrategy,
  CategoryDeleteOptions,
  CreateVideoDTO,
  UpdateVideoDTO,
} from "@/models/video.model";
export { UNCATEGORIZED_CATEGORY } from "@/models/video.model";

// 9. ANKET & KAMUOYU YOKLAMASI
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  color?: string; // örn: bg-red-600, bg-blue-600, bg-emerald-600, bg-amber-600
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  category?: string;
  options: PollOption[];
  totalVotes: number;
  status: "active" | "draft" | "closed";
  isFeatured: boolean; // Ana sayfada öne çıkan anket
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// 10. KURUMSAL VE YASAL SAYFALAR & İLETİŞİM MESAJLARI
export type { LegalPageItem, ContactMessage } from "@/lib/types/legal";
export { DEFAULT_LEGAL_PAGES } from "@/lib/types/legal";
