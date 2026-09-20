import { NextResponse } from "next/server";
import {
  getPhotoGalleries,
  getPhotoGalleryBySlug,
  getPhotoGalleryById,
  createPhotoGallery,
  updatePhotoGallery,
  deletePhotoGallery,
  incrementGalleryView,
} from "@/lib/news-service";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    const category = searchParams.get("category") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const increment = searchParams.get("increment") === "true";

    if (slug) {
      if (increment) {
        await incrementGalleryView(slug);
      }
      const gallery = await getPhotoGalleryBySlug(slug);
      if (!gallery) {
        return NextResponse.json({ error: "Galeri bulunamadı." }, { status: 404 });
      }
      return NextResponse.json(gallery);
    }

    if (id) {
      if (increment) {
        await incrementGalleryView(id);
      }
      const gallery = await getPhotoGalleryById(id);
      if (!gallery) {
        return NextResponse.json({ error: "Galeri bulunamadı." }, { status: 404 });
      }
      return NextResponse.json(gallery);
    }

    const galleries = await getPhotoGalleries(category, limit);
    return NextResponse.json(galleries);
  } catch (error) {
    console.error("GET /api/galleries error:", error);
    return NextResponse.json({ error: "Galeriler getirilemedi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Galeri başlığı zorunludur." }, { status: 400 });
    }

    if (!body.slides || !Array.isArray(body.slides) || body.slides.length === 0) {
      return NextResponse.json({ error: "En az 1 adet fotoğraf/slayt eklenmelidir." }, { status: 400 });
    }

    // Default cover image from first slide if not explicitly provided
    const coverImage = body.coverImage?.trim() || body.slides[0].imageUrl;

    const newGallery = await createPhotoGallery({
      title: body.title.trim(),
      slug: body.slug?.trim() || undefined,
      spot: body.spot?.trim() || "",
      category: body.category || "gundem",
      categoryTitle: body.categoryTitle || undefined,
      categoryBadgeColor: body.categoryBadgeColor || undefined,
      coverImage,
      slides: body.slides,
      author: body.author || {
        name: "Editör Masası",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      },
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map((t: string) => t.trim()) : []),
      isFeatured: Boolean(body.isFeatured),
    });

    try {
      revalidatePath("/");
      revalidatePath("/foto-galeri");
      revalidatePath(`/foto-galeri/${newGallery.slug}`);
      revalidatePath("/admin/galeriler");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json(newGallery, { status: 201 });
  } catch (error) {
    console.error("POST /api/galleries error:", error);
    return NextResponse.json({ error: "Galeri oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Galeri ID'si zorunludur." }, { status: 400 });
    }

    if (body.slides && (!Array.isArray(body.slides) || body.slides.length === 0)) {
      return NextResponse.json({ error: "En az 1 adet fotoğraf/slayt olmalıdır." }, { status: 400 });
    }

    const updated = await updatePhotoGallery(id, {
      title: body.title?.trim(),
      spot: body.spot?.trim(),
      category: body.category,
      categoryTitle: body.categoryTitle,
      coverImage: body.coverImage?.trim(),
      slides: body.slides,
      author: body.author,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map((t: string) => t.trim()) : undefined),
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Güncellenecek galeri bulunamadı." }, { status: 404 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/foto-galeri");
      revalidatePath(`/foto-galeri/${updated.slug}`);
      revalidatePath("/admin/galeriler");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/galleries error:", error);
    return NextResponse.json({ error: "Galeri güncellenirken bir hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Silinecek galeri ID'si belirtilmedi." }, { status: 400 });
    }

    const success = await deletePhotoGallery(id);
    if (!success) {
      return NextResponse.json({ error: "Galeri bulunamadı veya silinemedi." }, { status: 404 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/foto-galeri");
      revalidatePath("/admin/galeriler");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, message: "Galeri başarıyla silindi." });
  } catch (error) {
    console.error("DELETE /api/galleries error:", error);
    return NextResponse.json({ error: "Galeri silinirken bir hata oluştu." }, { status: 500 });
  }
}
