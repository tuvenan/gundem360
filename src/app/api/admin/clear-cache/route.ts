import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Ana sayfalar, düzenler ve dinamik rotalar
    revalidatePath("/", "layout");
    revalidatePath("/", "page");
    revalidatePath("/kategori/[category]", "page");
    revalidatePath("/haber/[slug]", "page");
    revalidatePath("/foto-galeri", "page");
    revalidatePath("/foto-galeri/[slug]", "page");
    revalidatePath("/video-galeri", "page");
    revalidatePath("/video-galeri/[slug]", "page");
    revalidatePath("/yazarlar/[id]", "page");
    revalidatePath("/iletisim", "page");
    revalidatePath("/kunye", "page");
    revalidatePath("/kvkk", "page");
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");

    // 2. Admin yönetim rotaları
    revalidatePath("/admin", "layout");
    revalidatePath("/admin", "page");
    revalidatePath("/admin/sayfa-duzeni", "page");
    revalidatePath("/admin/sag-blok", "page");
    revalidatePath("/admin/ayarlar", "page");
    revalidatePath("/admin/haberler", "page");

    // 3. Varsa Cache Tags temizliği
    try {
      revalidateTag("news", "max" as any);
      revalidateTag("categories", "max" as any);
      revalidateTag("settings", "max" as any);
      revalidateTag("layout", "max" as any);
      revalidateTag("sidebar", "max" as any);
    } catch {
      // revalidateTag desteklenmediği durumlarda sessiz devam et
    }

    return NextResponse.json({
      success: true,
      message: "Önbellek başarıyla temizlendi ve site güncellendi.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("POST /api/admin/clear-cache error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Önbellek temizlenirken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
