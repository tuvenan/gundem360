/**
 * Video Controller
 * Clean Architecture - Controller Layer
 * Sorumluluk: HTTP isteklerini karşılama, parametre doğrulama ve VideoService ile etkileşim.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { VideoService } from "@/services/video.service";
import { CreateVideoDTO, UpdateVideoDTO } from "@/models/video.model";

export class VideoController {
  /**
   * GET /api/videos
   */
  public static async getVideos(request: Request): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const slug = searchParams.get("slug");
      const id = searchParams.get("id");
      const category = searchParams.get("category") || undefined;
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
      const search = searchParams.get("search") || undefined;
      const increment = searchParams.get("increment") === "true";
      const includeDeleted = searchParams.get("includeDeleted") === "true";

      // Slug ile tekil video sorgusu
      if (slug) {
        if (increment) {
          await VideoService.incrementViewCount(slug);
        }
        const video = await VideoService.getVideoBySlug(slug, includeDeleted);
        if (!video) {
          return NextResponse.json({ error: "Video bulunamadı." }, { status: 404 });
        }
        return NextResponse.json(video);
      }

      // ID ile tekil video sorgusu
      if (id) {
        if (increment) {
          await VideoService.incrementViewCount(id);
        }
        const video = await VideoService.getVideoById(id);
        if (!video) {
          return NextResponse.json({ error: "Video bulunamadı." }, { status: 404 });
        }
        return NextResponse.json(video);
      }

      // Liste sorgusu
      const videos = await VideoService.getAllVideos({
        category,
        limit,
        search,
        includeDeleted,
      });

      return NextResponse.json(videos);
    } catch (error: any) {
      console.error("[VideoController.getVideos] Hata:", error);
      return NextResponse.json(
        { error: error.message || "Videolar listelenirken bir hata oluştu." },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/videos
   */
  public static async createVideo(request: Request): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Temel girdi doğrulaması
      if (!body.title || !body.title.trim()) {
        return NextResponse.json({ error: "Video başlığı zorunludur." }, { status: 400 });
      }

      if (!body.youtubeUrl || !body.youtubeUrl.trim()) {
        return NextResponse.json(
          { error: "YouTube video bağlantısı veya ID'si zorunludur." },
          { status: 400 }
        );
      }

      const dto: CreateVideoDTO = {
        title: body.title.trim(),
        description: body.description?.trim(),
        youtubeUrl: body.youtubeUrl.trim(),
        thumbnailUrl: body.thumbnailUrl?.trim(),
        duration: body.duration?.trim(),
        category: body.category?.trim() || "savunma-teknoloji",
        categoryTitle: body.categoryTitle,
        categoryBadgeColor: body.categoryBadgeColor,
        author: body.author,
        tags: body.tags,
        isFeatured: Boolean(body.isFeatured),
        status: body.status || "active",
      };

      const newVideo = await VideoService.createVideo(dto);

      this.revalidateVideoPaths(newVideo.slug);
      return NextResponse.json(newVideo, { status: 201 });
    } catch (error: any) {
      console.error("[VideoController.createVideo] Hata:", error);
      return NextResponse.json(
        { error: error.message || "Video kaydedilirken bir hata meydana geldi." },
        { status: 400 }
      );
    }
  }

  /**
   * PUT /api/videos
   */
  public static async updateVideo(request: Request): Promise<NextResponse> {
    try {
      const body = await request.json();
      const id = body.id;

      if (!id) {
        return NextResponse.json({ error: "Güncellenecek video ID'si zorunludur." }, { status: 400 });
      }

      const dto: UpdateVideoDTO = {
        title: body.title?.trim(),
        description: body.description?.trim(),
        youtubeUrl: body.youtubeUrl?.trim(),
        thumbnailUrl: body.thumbnailUrl?.trim(),
        duration: body.duration?.trim(),
        category: body.category?.trim(),
        categoryTitle: body.categoryTitle,
        categoryBadgeColor: body.categoryBadgeColor,
        author: body.author,
        tags: body.tags,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isDeleted: body.isDeleted !== undefined ? Boolean(body.isDeleted) : undefined,
        status: body.status,
      };

      const updated = await VideoService.updateVideo(id, dto);
      if (!updated) {
        return NextResponse.json({ error: "Güncellenecek video bulunamadı." }, { status: 404 });
      }

      this.revalidateVideoPaths(updated.slug);
      return NextResponse.json(updated);
    } catch (error: any) {
      console.error("[VideoController.updateVideo] Hata:", error);
      return NextResponse.json(
        { error: error.message || "Video güncellenirken bir hata meydana geldi." },
        { status: 400 }
      );
    }
  }

  /**
   * DELETE /api/videos
   */
  public static async deleteVideo(request: Request): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      let id = searchParams.get("id");
      const isPermanent = searchParams.get("permanent") === "true";

      if (!id) {
        try {
          const body = await request.json();
          id = body.id;
        } catch {
          // body yoksa url query yeterli
        }
      }

      if (!id) {
        return NextResponse.json({ error: "Silinecek video ID'si belirtilmedi." }, { status: 400 });
      }

      let success = false;
      if (isPermanent) {
        success = await VideoService.hardDeleteVideo(id);
      } else {
        // Varsayılan olarak soft-delete uygulanır
        success = await VideoService.softDeleteVideo(id);
      }

      if (!success) {
        return NextResponse.json({ error: "Video bulunamadı veya silinemedi." }, { status: 404 });
      }

      this.revalidateVideoPaths();
      return NextResponse.json({
        success: true,
        message: isPermanent ? "Video kalıcı olarak silindi." : "Video arşive taşındı (Soft-Delete).",
      });
    } catch (error: any) {
      console.error("[VideoController.deleteVideo] Hata:", error);
      return NextResponse.json(
        { error: error.message || "Video silinirken bir hata meydana geldi." },
        { status: 500 }
      );
    }
  }

  /**
   * Next.js önbellek yollarını güvenle yeniler
   */
  private static revalidateVideoPaths(slug?: string) {
    try {
      revalidatePath("/");
      revalidatePath("/video-galeri");
      revalidatePath("/admin/videolar");
      if (slug) {
        revalidatePath(`/video-galeri/${slug}`);
      }
    } catch (e) {
      console.warn("Revalidation uyarısı:", e);
    }
  }
}
