import { NextResponse } from "next/server";
import {
  getGalleryCategories,
  addGalleryCategory,
  updateGalleryCategory,
  deleteGalleryCategory,
} from "@/lib/news-service";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getGalleryCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/galleries/categories error:", error);
    return NextResponse.json(
      { error: "Galeri kategorileri getirilemedi." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Kategori adı zorunludur." },
        { status: 400 }
      );
    }

    const newCategory = await addGalleryCategory({
      name: body.name.trim(),
      key: body.key?.trim(),
      badgeColor: body.badgeColor || "bg-red-600",
      description: body.description?.trim(),
      coverImage: body.coverImage?.trim(),
    });

    try {
      revalidatePath("/");
      revalidatePath("/foto-galeri");
      revalidatePath("/admin/galeriler");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/galleries/categories error:", error);
    return NextResponse.json(
      { error: error.message || "Kategori eklenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const oldKey = body.oldKey || body.key;

    if (!oldKey) {
      return NextResponse.json(
        { error: "Güncellenecek kategorinin 'oldKey' veya 'key' değeri zorunludur." },
        { status: 400 }
      );
    }

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Kategori adı zorunludur." },
        { status: 400 }
      );
    }

    const updated = await updateGalleryCategory(oldKey, {
      name: body.name.trim(),
      key: body.newKey || body.key,
      badgeColor: body.badgeColor,
      description: body.description,
      coverImage: body.coverImage?.trim(),
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Güncellenecek kategori bulunamadı." },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/foto-galeri");
      revalidatePath("/admin/galeriler");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/galleries/categories error:", error);
    return NextResponse.json(
      { error: error.message || "Kategori güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let key = searchParams.get("key");

    if (!key) {
      try {
        const body = await request.json();
        key = body.key;
      } catch {
        // no body
      }
    }

    if (!key) {
      return NextResponse.json(
        { error: "Silinecek kategori kodu ('key') zorunludur." },
        { status: 400 }
      );
    }

    const success = await deleteGalleryCategory(key);
    if (!success) {
      return NextResponse.json(
        { error: "Kategori bulunamadı veya silinemedi." },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/foto-galeri");
      revalidatePath("/admin/galeriler");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Galeri kategorisi başarıyla silindi.",
    });
  } catch (error: any) {
    console.error("DELETE /api/galleries/categories error:", error);
    return NextResponse.json(
      { error: error.message || "Kategori silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
