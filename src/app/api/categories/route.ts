import { NextRequest, NextResponse } from "next/server";
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/lib/news-service";
import { revalidatePath } from "next/cache";

function revalidateCategoryPaths() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/admin/ayarlar");
    revalidatePath("/admin/kategoriler");
    revalidatePath("/admin/haberler");
    revalidatePath("/admin/yeni-haber");
  } catch (err) {
    console.error("Revalidation error:", err);
  }
}

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json({ error: "Kategoriler yüklenemedi" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.key || !body.name) {
      return NextResponse.json({ error: "Kategori adı ve kodu (slug) zorunludur." }, { status: 400 });
    }

    const created = await addCategory({
      key: body.key.toLowerCase().trim(),
      name: body.name.trim(),
      href: `/kategori/${body.key.toLowerCase().trim()}`,
      badgeColor: body.badgeColor || "bg-red-600",
      layoutVariant: body.layoutVariant || "classic-split",
    });

    revalidateCategoryPaths();
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("POST categories error:", error);
    return NextResponse.json({ error: error.message || "Kategori eklenemedi" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Sıralama güncelleme
    if (body.reorder && Array.isArray(body.reorder)) {
      const reordered = await reorderCategories(body.reorder);
      revalidateCategoryPaths();
      return NextResponse.json({ success: true, categories: reordered });
    }

    // 2. Kategori düzenleme
    if (!body.oldKey || !body.key || !body.name) {
      return NextResponse.json({ error: "Eksik parametreler (oldKey, key, name zorunludur)." }, { status: 400 });
    }

    const updated = await updateCategory(body.oldKey, {
      name: body.name.trim(),
      key: body.key.toLowerCase().trim(),
      badgeColor: body.badgeColor,
      layoutVariant: body.layoutVariant,
    });

    if (!updated) {
      return NextResponse.json({ error: "Güncellenecek kategori bulunamadı." }, { status: 404 });
    }

    revalidateCategoryPaths();
    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error("PUT categories error:", error);
    return NextResponse.json({ error: error.message || "Kategori güncellenemedi" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let key = searchParams.get("key");

    if (!key) {
      const body = await request.json().catch(() => ({}));
      key = body.key;
    }

    if (!key) {
      return NextResponse.json({ error: "Silinecek kategori kodu belirtilmedi." }, { status: 400 });
    }

    const result = await deleteCategory(key);
    revalidateCategoryPaths();
    return NextResponse.json({
      success: true,
      message: `Kategori başarıyla silindi. ${result.reassignedNewsCount} adet haber varsayılan kategoriye aktarıldı.`,
      reassignedNewsCount: result.reassignedNewsCount,
    });
  } catch (error: any) {
    console.error("DELETE categories error:", error);
    return NextResponse.json({ error: error.message || "Kategori silinemedi" }, { status: 400 });
  }
}
