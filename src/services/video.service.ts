/**
 * Video Servisi (Video Business Logic & Repository)
 * Clean Architecture & SOLID - Single Responsibility Principle
 */

import { loadStore, saveStore } from "@/lib/news-service";
import {
  VideoItem,
  CreateVideoDTO,
  UpdateVideoDTO,
  VideoQueryOptions,
  UNCATEGORIZED_CATEGORY,
} from "@/models/video.model";
import { YouTubeService } from "./youtube.service";

export class VideoService {
  /**
   * Tüm videoları listeler (Filtreleme, arama ve soft-delete kontrolü ile).
   */
  public static async getAllVideos(options: VideoQueryOptions = {}): Promise<VideoItem[]> {
    const store = loadStore();
    let videos = store.videos || [];

    // 1. Soft-delete kontrolü: Varsayılan olarak silinmiş videoları hariç tut
    if (!options.includeDeleted) {
      videos = videos.filter((v) => !v.isDeleted);
    }

    // 2. Kategori filtresi
    if (options.category && options.category !== "all") {
      videos = videos.filter((v) => v.category === options.category);
    }

    // 3. Arama sorgusu
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.youtubeId?.toLowerCase().includes(q) ||
          (v.tags && v.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // 4. Limit
    if (options.limit && options.limit > 0) {
      return videos.slice(0, options.limit);
    }

    return videos;
  }

  /**
   * Slug ile tekil video getirir (yalnızca aktif veya istenirse hepsi).
   */
  public static async getVideoBySlug(slug: string, includeDeleted = false): Promise<VideoItem | null> {
    const store = loadStore();
    const video = (store.videos || []).find((v) => v.slug === slug);
    if (!video) return null;
    if (video.isDeleted && !includeDeleted) return null;
    return video;
  }

  /**
   * ID ile tekil video getirir.
   */
  public static async getVideoById(id: string): Promise<VideoItem | null> {
    const store = loadStore();
    const video = (store.videos || []).find((v) => v.id === id);
    return video || null;
  }

  /**
   * Yeni YouTube videosu oluşturur (Katı YouTube doğrulaması içerir).
   */
  public static async createVideo(dto: CreateVideoDTO): Promise<VideoItem> {
    // 1. Katı YouTube Kaynak Doğrulaması
    const ytValidation = YouTubeService.validate(dto.youtubeUrl);
    if (!ytValidation.isValid || !ytValidation.youtubeId) {
      throw new Error(ytValidation.error || "Geçersiz YouTube video kaynağı.");
    }

    const store = loadStore();
    if (!store.videos) store.videos = [];

    // 2. Kategori Bilgilerini Çözümle
    let categorySlug = dto.category?.trim();
    let categoryTitle = dto.categoryTitle;
    let categoryBadgeColor = dto.categoryBadgeColor;

    if (!categorySlug) {
      categorySlug = UNCATEGORIZED_CATEGORY.slug;
      categoryTitle = UNCATEGORIZED_CATEGORY.name;
      categoryBadgeColor = UNCATEGORIZED_CATEGORY.color;
    } else {
      const foundCategory = (store.videoCategories || []).find((c) => c.slug === categorySlug);
      if (foundCategory) {
        categoryTitle = foundCategory.name;
        categoryBadgeColor = foundCategory.color || "bg-red-600";
      } else if (categorySlug === UNCATEGORIZED_CATEGORY.slug) {
        categoryTitle = UNCATEGORIZED_CATEGORY.name;
        categoryBadgeColor = UNCATEGORIZED_CATEGORY.color;
      }
    }

    // 3. Benzersiz Slug Türet
    const rawTitle = dto.title?.trim() || "Yeni Video";
    const slug =
      rawTitle
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now().toString().slice(-4);

    // 4. Etiketleri Hazırla
    const tags = Array.isArray(dto.tags)
      ? dto.tags
      : typeof dto.tags === "string"
      ? dto.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const newVideo: VideoItem = {
      id: "vid-" + Date.now(),
      slug,
      title: rawTitle,
      description: dto.description?.trim() || "",
      youtubeUrl: ytValidation.canonicalUrl!,
      youtubeId: ytValidation.youtubeId,
      thumbnailUrl: dto.thumbnailUrl?.trim() || ytValidation.thumbnailUrl!,
      duration: dto.duration?.trim() || "03:45",
      category: categorySlug,
      categoryTitle: categoryTitle || "Genel",
      categoryBadgeColor: categoryBadgeColor || "bg-red-600",
      viewCount: 0,
      publishedAt: new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      isFeatured: Boolean(dto.isFeatured),
      isDeleted: false,
      status: dto.status || "active",
      author: dto.author || {
        name: "Gündem360 Video Masası",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      },
      tags,
    };

    store.videos.unshift(newVideo);
    saveStore(store);
    return newVideo;
  }

  /**
   * Video bilgilerini günceller.
   */
  public static async updateVideo(id: string, dto: UpdateVideoDTO): Promise<VideoItem | null> {
    const store = loadStore();
    if (!store.videos) return null;

    const index = store.videos.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const current = store.videos[index];
    let youtubeId = current.youtubeId;
    let youtubeUrl = current.youtubeUrl;
    let thumbnailUrl = dto.thumbnailUrl?.trim() || current.thumbnailUrl;

    // Eğer YouTube linki değiştirildiyse doğrula
    if (dto.youtubeUrl && dto.youtubeUrl !== current.youtubeUrl) {
      const ytValidation = YouTubeService.validate(dto.youtubeUrl);
      if (!ytValidation.isValid || !ytValidation.youtubeId) {
        throw new Error(ytValidation.error || "Geçersiz YouTube video bağlantısı.");
      }
      youtubeId = ytValidation.youtubeId;
      youtubeUrl = ytValidation.canonicalUrl!;
      if (!dto.thumbnailUrl) {
        thumbnailUrl = ytValidation.thumbnailUrl!;
      }
    }

    // Kategori güncellemesi
    const catSlug = dto.category !== undefined ? dto.category : current.category;
    let categoryTitle = dto.categoryTitle || current.categoryTitle;
    let categoryBadgeColor = dto.categoryBadgeColor || current.categoryBadgeColor;

    if (dto.category && dto.category !== current.category) {
      if (dto.category === UNCATEGORIZED_CATEGORY.slug) {
        categoryTitle = UNCATEGORIZED_CATEGORY.name;
        categoryBadgeColor = UNCATEGORIZED_CATEGORY.color;
      } else {
        const foundCategory = (store.videoCategories || []).find((c) => c.slug === dto.category);
        if (foundCategory) {
          categoryTitle = foundCategory.name;
          categoryBadgeColor = foundCategory.color || "bg-red-600";
        }
      }
    }

    const tags =
      dto.tags !== undefined
        ? Array.isArray(dto.tags)
          ? dto.tags
          : typeof dto.tags === "string"
          ? dto.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : current.tags
        : current.tags;

    const updated: VideoItem = {
      ...current,
      title: dto.title !== undefined ? dto.title.trim() : current.title,
      description: dto.description !== undefined ? dto.description.trim() : current.description,
      youtubeId,
      youtubeUrl,
      thumbnailUrl,
      duration: dto.duration !== undefined ? dto.duration.trim() : current.duration,
      category: catSlug,
      categoryTitle,
      categoryBadgeColor,
      author: dto.author !== undefined ? dto.author : current.author,
      tags,
      isFeatured: dto.isFeatured !== undefined ? Boolean(dto.isFeatured) : current.isFeatured,
      isDeleted: dto.isDeleted !== undefined ? Boolean(dto.isDeleted) : current.isDeleted,
      status: dto.status !== undefined ? dto.status : current.status,
      updatedAt: new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    store.videos[index] = updated;
    saveStore(store);
    return updated;
  }

  /**
   * Videoyu soft-delete (arşive alma) yapar.
   */
  public static async softDeleteVideo(id: string): Promise<boolean> {
    const store = loadStore();
    const video = (store.videos || []).find((v) => v.id === id);
    if (!video) return false;

    video.isDeleted = true;
    video.status = "archived";
    video.deletedAt = new Date().toISOString();
    saveStore(store);
    return true;
  }

  /**
   * Videoyu kalıcı olarak siler (Hard Delete).
   */
  public static async hardDeleteVideo(id: string): Promise<boolean> {
    const store = loadStore();
    if (!store.videos) return false;

    const initialLen = store.videos.length;
    store.videos = store.videos.filter((v) => v.id !== id);
    if (store.videos.length === initialLen) return false;

    saveStore(store);
    return true;
  }

  /**
   * İzlenme sayısını artırır.
   */
  public static async incrementViewCount(idOrSlug: string): Promise<number | null> {
    const store = loadStore();
    if (!store.videos) return null;

    const video = store.videos.find((v) => v.id === idOrSlug || v.slug === idOrSlug);
    if (!video) return null;

    video.viewCount = (video.viewCount || 0) + 1;
    saveStore(store);
    return video.viewCount;
  }

  /**
   * Belirli bir kategorideki tüm videoları 'Kategorisiz' olarak işaretler.
   */
  public static async markVideosAsUncategorized(categorySlug: string): Promise<number> {
    const store = loadStore();
    if (!store.videos) return 0;

    let updatedCount = 0;
    store.videos = store.videos.map((v) => {
      if (v.category === categorySlug) {
        updatedCount++;
        return {
          ...v,
          category: UNCATEGORIZED_CATEGORY.slug,
          categoryTitle: UNCATEGORIZED_CATEGORY.name,
          categoryBadgeColor: UNCATEGORIZED_CATEGORY.color,
        };
      }
      return v;
    });

    if (updatedCount > 0) {
      saveStore(store);
    }
    return updatedCount;
  }

  /**
   * Belirli bir kategorideki tüm videoları Soft-Delete (arşiv) yapar.
   */
  public static async softDeleteVideosByCategory(categorySlug: string): Promise<number> {
    const store = loadStore();
    if (!store.videos) return 0;

    let updatedCount = 0;
    const now = new Date().toISOString();
    store.videos = store.videos.map((v) => {
      if (v.category === categorySlug) {
        updatedCount++;
        return {
          ...v,
          isDeleted: true,
          status: "archived",
          deletedAt: now,
        };
      }
      return v;
    });

    if (updatedCount > 0) {
      saveStore(store);
    }
    return updatedCount;
  }

  /**
   * Belirli bir kategorideki tüm videoları yeni bir kategoriye aktarır.
   */
  public static async reassignVideosCategory(
    oldSlug: string,
    newSlug: string,
    newTitle: string,
    newColor: string
  ): Promise<number> {
    const store = loadStore();
    if (!store.videos) return 0;

    let updatedCount = 0;
    store.videos = store.videos.map((v) => {
      if (v.category === oldSlug) {
        updatedCount++;
        return {
          ...v,
          category: newSlug,
          categoryTitle: newTitle,
          categoryBadgeColor: newColor,
        };
      }
      return v;
    });

    if (updatedCount > 0) {
      saveStore(store);
    }
    return updatedCount;
  }
}
