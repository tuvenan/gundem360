import { NextResponse } from "next/server";
import { getAllNews, createNews, deleteNews, updateNews, getNewsById, getPaginatedNews } from "@/lib/news-service";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const id = searchParams.get("id");
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const search = searchParams.get("search") || searchParams.get("q");
  const headline = searchParams.get("headline");

  if (id) {
    const item = await getNewsById(id);
    if (!item) return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
    return NextResponse.json(item);
  }

  // Sayfalama parametresi varsa dilimlenmiş veriyi dön
  if (page) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const paginated = await getPaginatedNews(
      pageNum,
      limitNum,
      search || undefined,
      category || undefined,
      headline || undefined
    );
    return NextResponse.json(paginated);
  }

  let news = await getAllNews();

  if (category) {
    news = news.filter((n) => n.category === category);
  }

  return NextResponse.json(news);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.summary || !body.category) {
      return NextResponse.json({ error: "Eksik alanlar var" }, { status: 400 });
    }

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const newArticle = await createNews({
      title: body.title,
      slug: slug + "-" + Date.now().toString().slice(-4),
      summary: body.summary,
      content: body.content || body.summary,
      category: body.category,
      categoryTitle: body.categoryTitle || body.category.toUpperCase(),
      imageUrl:
        body.imageUrl ||
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      headlineType: body.headlineType || "normal",
      headlineOrder: body.headlineOrder ? Number(body.headlineOrder) : undefined,
      author: {
        id: "admin",
        name: body.authorName || "Haber Merkezi",
        role: "Editör",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      },
      readTimeMinutes: Number(body.readTimeMinutes) || 3,
      tags: body.tags || ["Haber", body.category],
      isBreaking: Boolean(body.isBreaking),
      imageBadgeText: body.imageBadgeText || undefined,
      imageBadgeColor: body.imageBadgeColor || undefined,
      imageBadge:
        body.imageBadge ||
        (body.imageBadgeText
          ? { text: body.imageBadgeText, color: body.imageBadgeColor || "bg-red-600" }
          : undefined),
      seo: body.seo,
    });

    try {
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidatePath("/admin/haberler");
      revalidatePath("/admin/mansetler");
      if (newArticle.slug) {
        revalidatePath(`/haber/${newArticle.slug}`, "page");
        revalidatePath(`/haber/${newArticle.slug}`);
      }
      revalidatePath("/haber/[slug]", "page");
      if (newArticle.category) {
        revalidatePath(`/kategori/${newArticle.category}`);
        revalidatePath(`/kategori/${newArticle.category}`, "page");
      }
    } catch {}

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("API news POST error:", error);
    return NextResponse.json({ error: "Haber kaydedilemedi" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Haber ID gerekli" }, { status: 400 });
    }

    const updated = await updateNews(body.id, {
      title: body.title,
      summary: body.summary,
      content: body.content,
      category: body.category,
      categoryTitle: body.categoryTitle,
      imageUrl: body.imageUrl,
      headlineType: body.headlineType,
      headlineOrder: body.headlineOrder !== undefined ? Number(body.headlineOrder) : undefined,
      isBreaking: Boolean(body.isBreaking),
      imageBadgeText: body.imageBadgeText !== undefined ? body.imageBadgeText : undefined,
      imageBadgeColor: body.imageBadgeColor !== undefined ? body.imageBadgeColor : undefined,
      imageBadge:
        body.imageBadge !== undefined
          ? body.imageBadge
          : body.imageBadgeText
          ? { text: body.imageBadgeText, color: body.imageBadgeColor || "bg-red-600" }
          : undefined,
      tags: body.tags,
      seo: body.seo,
      slug: body.slug || undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Haber bulunamadı" }, { status: 404 });
    }

    try {
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidatePath("/admin/haberler");
      revalidatePath("/admin/mansetler");
      revalidatePath(`/admin/haber-duzenle/${body.id}`);
      revalidatePath(`/admin/haber-duzenle/${body.id}`, "page");
      if (updated.slug) {
        revalidatePath(`/haber/${updated.slug}`);
        revalidatePath(`/haber/${updated.slug}`, "page");
      }
      revalidatePath("/haber/[slug]", "page");
      if (updated.category) {
        revalidatePath(`/kategori/${updated.category}`);
        revalidatePath(`/kategori/${updated.category}`, "page");
      }
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("API news PUT error:", error);
    return NextResponse.json({ error: "Haber güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID belirtilmedi" }, { status: 400 });
    }
    const success = await deleteNews(id);

    try {
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidatePath("/admin/haberler");
      revalidatePath("/admin/mansetler");
      revalidatePath("/haber/[slug]", "page");
    } catch {}

    return NextResponse.json({ success });
  } catch (error) {
    console.error("API news DELETE error:", error);
    return NextResponse.json({ error: "Haber silinemedi" }, { status: 500 });
  }
}
