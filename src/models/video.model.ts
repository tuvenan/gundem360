/**
 * Video Galeri Domain Modelleri ve Veri Transfer Objeleri (DTO)
 * Clean Architecture - Model Layer
 */

export interface VideoItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration?: string;
  category: string;
  categoryTitle?: string;
  categoryBadgeColor?: string;
  viewCount: number;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  isFeatured?: boolean;
  isDeleted?: boolean; // Soft-delete desteği
  deletedAt?: string;
  status?: "active" | "draft" | "archived";
}

export interface VideoCategory {
  id: string;
  name: string;
  slug: string;
  key?: string;
  color?: string;
  badgeColor?: string;
  description?: string;
  order?: number;
  count?: number;
  isSystem?: boolean; // 'Kategorisiz' gibi sistem kategorileri için
}

export type CategoryDeleteStrategy = "uncategorize" | "soft_delete" | "reassign";

export interface CategoryDeleteOptions {
  strategy: CategoryDeleteStrategy;
  targetCategorySlug?: string; // strategy === "reassign" durumunda hedef kategori
}

export interface CreateVideoDTO {
  title: string;
  description?: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  category: string;
  categoryTitle?: string;
  categoryBadgeColor?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  tags?: string[] | string;
  isFeatured?: boolean;
  status?: "active" | "draft" | "archived";
}

export interface UpdateVideoDTO {
  title?: string;
  description?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  duration?: string;
  category?: string;
  categoryTitle?: string;
  categoryBadgeColor?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  tags?: string[] | string;
  isFeatured?: boolean;
  isDeleted?: boolean;
  status?: "active" | "draft" | "archived";
}

export interface CreateVideoCategoryDTO {
  name: string;
  slug?: string;
  color?: string;
  description?: string;
  order?: number;
}

export interface UpdateVideoCategoryDTO {
  name?: string;
  slug?: string;
  color?: string;
  description?: string;
  order?: number;
}

export interface VideoQueryOptions {
  category?: string;
  limit?: number;
  includeDeleted?: boolean;
  search?: string;
}

export const UNCATEGORIZED_CATEGORY: VideoCategory = {
  id: "vcat-uncategorized",
  name: "Kategorisiz",
  slug: "kategorisiz",
  color: "bg-zinc-600",
  badgeColor: "bg-zinc-600",
  description: "Kategorisi silinmiş veya atanmamış videolar",
  order: 999,
  isSystem: true,
};
