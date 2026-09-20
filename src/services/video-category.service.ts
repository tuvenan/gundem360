/**
 * Video Kategori Servisi (Category Business Logic & Strategy Pattern)
 * Clean Architecture & SOLID - Single Responsibility & Open/Closed Principle
 */

import { loadStore, saveStore } from "@/lib/news-service";
import {
  VideoCategory,
  CreateVideoCategoryDTO,
  UpdateVideoCategoryDTO,
  CategoryDeleteOptions,
  UNCATEGORIZED_CATEGORY,
} from "@/models/video.model";
import { VideoService } from "./video.service";
import { INITIAL_VIDEO_CATEGORIES } from "@/lib/data/mock-news";

export class VideoCategoryService {
  /**
   * Tüm video kategorilerini listeler (Video sayıları ve opsiyonel 'Kategorisiz' ile).
   */
  public static async getCategories(includeUncategorized = false): Promise<VideoCategory[]> {
    const store = loadStore();
    const categories = store.videoCategories || [...INITIAL_VIDEO_CATEGORIES];
    const videos = (store.videos || []).filter((v) => !v.isDeleted);

    const mapped: VideoCategory[] = categories.map((cat, idx) => ({
      ...cat,
      order: cat.order ?? idx + 1,
      count: videos.filter((v) => v.category === cat.slug).length,
    }));

    // Eğer 'kategorisiz' altında video varsa ve isteniyorsa ekle
    if (includeUncategorized) {
      const uncategorizedCount = videos.filter(
        (v) => v.category === UNCATEGORIZED_CATEGORY.slug || !categories.some((c) => c.slug === v.category)
      ).length;

      if (uncategorizedCount > 0) {
        mapped.push({
          ...UNCATEGORIZED_CATEGORY,
          count: uncategorizedCount,
        });
      }
    }

    mapped.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    return mapped;
  }

  /**
   * Slug ile kategori bulur.
   */
  public static async getCategoryBySlug(slug: string): Promise<VideoCategory | null> {
    if (slug === UNCATEGORIZED_CATEGORY.slug) {
      return UNCATEGORIZED_CATEGORY;
    }
    const store = loadStore();
    const cat = (store.videoCategories || []).find((c) => c.slug === slug);
    return cat || null;
  }

  /**
   * ID ile kategori bulur.
   */
  public static async getCategoryById(id: string): Promise<VideoCategory | null> {
    const store = loadStore();
    const cat = (store.videoCategories || []).find((c) => c.id === id);
    return cat || null;
  }

  /**
   * Yeni kategori ekler.
   */
  public static async createCategory(dto: CreateVideoCategoryDTO): Promise<VideoCategory> {
    const store = loadStore();
    if (!store.videoCategories) {
      store.videoCategories = [...INITIAL_VIDEO_CATEGORIES];
    }

    const name = dto.name.trim();
    const slug =
      (dto.slug?.trim() ||
        name
          .toLowerCase()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")) || "kategori-" + Date.now();

    if (store.videoCategories.some((c) => c.slug === slug)) {
      throw new Error(`"${slug}" kodlu başka bir video kategorisi zaten mevcut.`);
    }

    const newCategory: VideoCategory = {
      id: "vcat-" + Date.now(),
      name,
      slug,
      color: dto.color || "bg-red-600",
      badgeColor: dto.color || "bg-red-600",
      description: dto.description?.trim(),
      order: dto.order ?? store.videoCategories.length + 1,
    };

    store.videoCategories.push(newCategory);
    saveStore(store);
    return newCategory;
  }

  /**
   * Mevcut kategoriyi günceller ve bağlı videoları senkronize eder.
   */
  public static async updateCategory(id: string, dto: UpdateVideoCategoryDTO): Promise<VideoCategory | null> {
    const store = loadStore();
    if (!store.videoCategories) {
      store.videoCategories = [...INITIAL_VIDEO_CATEGORIES];
    }

    const index = store.videoCategories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const current = store.videoCategories[index];
    const oldSlug = current.slug;
    const newSlug = dto.slug ? dto.slug.trim().toLowerCase() : current.slug;

    if (newSlug !== oldSlug && store.videoCategories.some((c) => c.slug === newSlug && c.id !== id)) {
      throw new Error(`"${newSlug}" kodlu başka bir video kategorisi zaten mevcut.`);
    }

    const updated: VideoCategory = {
      ...current,
      name: dto.name !== undefined ? dto.name.trim() : current.name,
      slug: newSlug,
      color: dto.color || current.color || "bg-red-600",
      badgeColor: dto.color || current.badgeColor || "bg-red-600",
      description: dto.description !== undefined ? dto.description.trim() : current.description,
      order: dto.order !== undefined ? dto.order : current.order,
    };

    store.videoCategories[index] = updated;

    // Bağlı videoların kategori başlık ve renklerini güncelle
    if (store.videos && Array.isArray(store.videos)) {
      store.videos = store.videos.map((v) => {
        if (v.category === oldSlug) {
          return {
            ...v,
            category: newSlug,
            categoryTitle: updated.name,
            categoryBadgeColor: updated.color,
          };
        }
        return v;
      });
    }

    saveStore(store);
    return updated;
  }

  /**
   * Kategorilerin sıralama (order / sort_order) değerlerini günceller.
   */
  public static async reorderCategories(orderedIds: string[]): Promise<VideoCategory[]> {
    const store = loadStore();
    if (!store.videoCategories) {
      store.videoCategories = [...INITIAL_VIDEO_CATEGORIES];
    }

    const reordered: VideoCategory[] = [];
    orderedIds.forEach((id, index) => {
      const cat = store.videoCategories.find((c) => c.id === id);
      if (cat) {
        cat.order = index + 1;
        reordered.push(cat);
      }
    });

    // Listede olmayan diğer kategorileri sona ekle
    store.videoCategories.forEach((cat) => {
      if (!reordered.some((c) => c.id === cat.id)) {
        cat.order = reordered.length + 1;
        reordered.push(cat);
      }
    });

    store.videoCategories = reordered;
    saveStore(store);
    return await this.getCategories(false);
  }

  /**
   * Kategori silme işlemi ve bağlı videoların stratejiye göre yönetimi.
   * Stratejiler:
   * 1. 'uncategorize': Videoları 'Kategorisiz' olarak işaretler (Varsayılan).
   * 2. 'soft_delete': Kategorideki tüm videoları arşive alır (Soft-delete).
   * 3. 'reassign': Hedef kategoriye aktarır.
   */
  public static async deleteCategory(id: string, options: CategoryDeleteOptions): Promise<boolean> {
    const store = loadStore();
    if (!store.videoCategories) {
      store.videoCategories = [...INITIAL_VIDEO_CATEGORIES];
    }

    if (store.videoCategories.length <= 1) {
      throw new Error("Sistemde en az bir video kategorisi bulunmalıdır.");
    }

    const targetCategory = store.videoCategories.find((c) => c.id === id);
    if (!targetCategory) return false;

    // 1. Kategoriyi listeden kaldır
    store.videoCategories = store.videoCategories.filter((c) => c.id !== id);
    saveStore(store);

    // 2. Videoların durumunu stratejiye göre yönet
    const categorySlug = targetCategory.slug;

    switch (options.strategy) {
      case "soft_delete":
        await VideoService.softDeleteVideosByCategory(categorySlug);
        break;

      case "reassign":
        if (options.targetCategorySlug) {
          const target = store.videoCategories.find((c) => c.slug === options.targetCategorySlug);
          if (target) {
            await VideoService.reassignVideosCategory(
              categorySlug,
              target.slug,
              target.name,
              target.color || "bg-red-600"
            );
            break;
          }
        }
        // Hedef bulunamazsa varsayılana düş
        await VideoService.markVideosAsUncategorized(categorySlug);
        break;

      case "uncategorize":
      default:
        await VideoService.markVideosAsUncategorized(categorySlug);
        break;
    }

    return true;
  }
}
