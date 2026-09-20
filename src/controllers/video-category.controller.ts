/**
 * Video Kategori Controller
 * Clean Architecture - Controller Layer
 * Sorumluluk: HTTP isteklerini karşılama, kategori stratejisini yönetme ve VideoCategoryService ile etkileşim.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { VideoCategoryService } from "@/services/video-category.service";
import {
  CreateVideoCategoryDTO,
  UpdateVideoCategoryDTO,
  CategoryDeleteStrategy,
} from "@/models/video.model";

export class VideoCategoryController {
  /**
   * GET /api/videos/categories
   */
  public static async getCategories(request: Request): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      const includeUncategorized = searchParams.get("includeUncategorized") === "true";

      const categories = await VideoCategoryService.getCategories(includeUncategorized);
      return NextResponse.json(categories);
    } catch (error: any) {
      console.error("[VideoCategoryController.getCategories] Hata:", error);
      return NextResponse.json(
        { error: error.message || "Video kategorileri listelenirken hata oluştu." },
        { status: 500 }
      );
    }
  }

  /**
   * POST /api/videos/categories
   */
  public static async createCategory(request: Request): Promise<NextResponse> {
    try {
      const body = await request.json();

      if (!body.name || !body.name.trim()) {
        return NextResponse.json({ error: "Kategori adı zorunludur." }, { status: 400 });
      }

      const dto: CreateVideoCategoryDTO = {
        name: body.name.trim(),
        slug: body.slug?.trim(),
        color: body.color || "bg-red-600",
        description: body.description?.trim(),
        order: body.order,
      };

      const newCategory = await VideoCategoryService.createCategory(dto);
      this.revalidateCategoryPaths();
      return NextResponse.json(newCategory, { status: 201 });
    } catch (error: any) {
      console.error("[VideoCategoryController.createCategory] Hata:", error);
      return NextResponse.json(
        { error: error.message || "Kategori eklenirken bir hata oluştu." },
        { status: 400 }
      );
    }
  }

  /**
   * PUT /api/videos/categories
   */
  public static async updateCategory(request: Request): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Sıralama (Drag & Drop Reorder) desteği
      if (body.orderedIds && Array.isArray(body.orderedIds)) {
        const reordered = await VideoCategoryService.reorderCategories(body.orderedIds);
        this.revalidateCategoryPaths();
        return NextResponse.json(reordered);
      }

      const id = body.id;

      if (!id) {
        return NextResponse.json({ error: "Güncellenecek kategori ID'si zorunludur." }, { status: 400 });
      }

      const dto: UpdateVideoCategoryDTO = {
        name: body.name?.trim(),
        slug: body.slug?.trim(),
        color: body.color,
        description: body.description?.trim(),
        order: body.order,
      };

      const updated = await VideoCategoryService.updateCategory(id, dto);
      if (!updated) {
        return NextResponse.json({ error: "Güncellenecek kategori bulunamadı." }, { status: 404 });
      }

      this.revalidateCategoryPaths();
      return NextResponse.json(updated);
    } catch (error: any) {
      console.error("[VideoCategoryController.updateCategory] Hata:", error);
      return NextResponse.json(
        { error: error.message || "Kategori güncellenirken bir hata oluştu." },
        { status: 400 }
      );
    }
  }

  /**
   * DELETE /api/videos/categories
   * Desteklenen Stratejiler:
   * - 'uncategorize': Videoları 'Kategorisiz' olarak işaretler (Varsayılan).
   * - 'soft_delete': Kategorideki tüm videoları arşive alır.
   * - 'reassign': Belirtilen hedef kategoriye aktarır.
   */
  public static async deleteCategory(request: Request): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url);
      let id = searchParams.get("id");
      let strategy: CategoryDeleteStrategy =
        (searchParams.get("strategy") as CategoryDeleteStrategy) || "uncategorize";
      let targetCategorySlug = searchParams.get("targetCategorySlug") || undefined;

      if (!id) {
        try {
          const body = await request.json();
          id = body.id;
          if (body.strategy) strategy = body.strategy;
          if (body.targetCategorySlug) targetCategorySlug = body.targetCategorySlug;
        } catch {
          // body yoksa query string kullanılır
        }
      }

      if (!id) {
        return NextResponse.json({ error: "Silinecek kategori 'id' parametresi zorunludur." }, { status: 400 });
      }

      const success = await VideoCategoryService.deleteCategory(id, {
        strategy,
        targetCategorySlug,
      });

      if (!success) {
        return NextResponse.json({ error: "Kategori bulunamadı veya silinemedi." }, { status: 404 });
      }

      this.revalidateCategoryPaths();
      return NextResponse.json({
        success: true,
        message: `Kategori başarıyla silindi. Bağlı videolar '${strategy}' stratejisiyle yönetildi.`,
      });
    } catch (error: any) {
      console.error("[VideoCategoryController.deleteCategory] Hata:", error);
      return NextResponse.json(
        { error: error.message || "Kategori silinirken bir hata oluştu." },
        { status: 400 }
      );
    }
  }

  private static revalidateCategoryPaths() {
    try {
      revalidatePath("/");
      revalidatePath("/video-galeri");
      revalidatePath("/admin/videolar");
    } catch (e) {
      console.warn("Revalidation uyarısı:", e);
    }
  }
}
