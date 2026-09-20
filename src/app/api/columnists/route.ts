import { NextResponse } from "next/server";
import {
  getColumnists,
  getColumnistById,
  getArticleBySlug,
  addColumnist,
  updateColumnist,
  deleteColumnist,
  addArticleToColumnist,
  updateColumnistArticle,
  deleteColumnistArticle,
} from "@/lib/news-service";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get("authorId");
  const articleSlug = searchParams.get("articleSlug");

  if (articleSlug) {
    const result = await getArticleBySlug(articleSlug);
    if (!result) {
      return NextResponse.json({ error: "Makale bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(result);
  }

  if (authorId) {
    const author = await getColumnistById(authorId);
    if (!author) {
      return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(author);
  }

  const columnists = await getColumnists();
  return NextResponse.json(columnists);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. MEVCUT BİR YAZARA YENİ MAKALE EKLEME
    if (body.action === "add_article" || (body.authorId && !body.action)) {
      if (!body.authorId || !body.title || !body.content) {
        return NextResponse.json(
          { error: "Yazar ID, makale başlığı ve içeriği zorunludur." },
          { status: 400 }
        );
      }

      const slug =
        body.slug ||
        slugify(body.title) + "-" + Date.now().toString().slice(-4);

      const res = await addArticleToColumnist(body.authorId, {
        authorId: body.authorId,
        title: body.title.trim(),
        slug,
        date:
          body.date ||
          new Date().toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        excerpt:
          body.excerpt?.trim() ||
          body.content.replace(/<[^>]*>/g, "").slice(0, 140) + "...",
        content: body.content,
      });

      if (!res) {
        return NextResponse.json(
          { error: "Yazar bulunamadı veya makale eklenemedi." },
          { status: 404 }
        );
      }

      try {
        revalidatePath("/", "page");
        revalidatePath("/", "layout");
        revalidatePath("/admin/yazarlar");
        revalidatePath(`/yazarlar/${slug}`, "page");
        revalidatePath(`/yazarlar/yazar/${res.author.slug}`, "page");
        revalidatePath("/yazarlar/[id]", "page");
      } catch {}

      return NextResponse.json(res, { status: 201 });
    }

    // 2. YALNIZCA YAZAR PROFİLİ OLUŞTURMA
    if (body.action === "add_author") {
      if (!body.name) {
        return NextResponse.json(
          { error: "Yazar Adı Soyadı zorunludur." },
          { status: 400 }
        );
      }

      const authorSlug = slugify(body.name);
      const newAuthor = await addColumnist({
        id: "col-" + Date.now(),
        name: body.name.trim(),
        slug: authorSlug,
        title: body.title?.trim() || "Köşe Yazarı",
        avatar:
          body.avatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        bio: body.bio?.trim() || `${body.name} köşe yazılarıyla Gündem360'ta.`,
        email: body.email?.trim() || "",
        socialTwitter: body.socialTwitter?.trim() || "",
        socialLinkedin: body.socialLinkedin?.trim() || "",
        articleTitle: body.articleTitle?.trim() || "",
        articleDate:
          body.articleDate ||
          new Date().toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        articleSlug: body.articleTitle ? slugify(body.articleTitle) + "-" + Date.now().toString().slice(-4) : "",
        excerpt: body.excerpt?.trim() || "",
        content: body.content || "",
        articles: [],
      });

      // Eğer yazarla birlikte ilk makale de verilmişse arşive de ekle
      if (body.articleTitle && body.content) {
        await addArticleToColumnist(newAuthor.id, {
          authorId: newAuthor.id,
          title: body.articleTitle.trim(),
          slug: newAuthor.articleSlug,
          date: newAuthor.articleDate,
          excerpt: newAuthor.excerpt,
          content: newAuthor.content,
        });
      }

      try {
        revalidatePath("/", "page");
        revalidatePath("/", "layout");
        revalidatePath("/admin/yazarlar");
        revalidatePath("/yazarlar/[id]", "page");
      } catch {}

      return NextResponse.json(newAuthor, { status: 201 });
    }

    // 3. YAZAR VE MAKALE BİRLİKTE (VARSAYILAN GERİYE DÖNÜK UYUMLULUK)
    if (!body.name || !body.articleTitle || !body.content) {
      return NextResponse.json(
        { error: "Eksik yazar veya makale bilgisi" },
        { status: 400 }
      );
    }

    const authorSlug = slugify(body.name);
    const artSlug =
      body.articleSlug ||
      slugify(body.articleTitle) + "-" + Date.now().toString().slice(-4);

    const newColumnist = await addColumnist({
      id: "col-" + Date.now(),
      name: body.name.trim(),
      slug: authorSlug,
      title: body.title?.trim() || "Köşe Yazarı",
      avatar:
        body.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: body.bio?.trim() || `${body.name} köşe yazılarıyla Gündem360'ta.`,
      email: body.email?.trim() || "",
      socialTwitter: body.socialTwitter?.trim() || "",
      socialLinkedin: body.socialLinkedin?.trim() || "",
      articleTitle: body.articleTitle.trim(),
      articleDate:
        body.articleDate ||
        new Date().toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      articleSlug: artSlug,
      excerpt:
        body.excerpt?.trim() ||
        body.content.replace(/<[^>]*>/g, "").slice(0, 140) + "...",
      content: body.content,
      articles: [
        {
          id: "art-" + Date.now(),
          authorId: "col-" + Date.now(),
          title: body.articleTitle.trim(),
          slug: artSlug,
          date:
            body.articleDate ||
            new Date().toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          excerpt:
            body.excerpt?.trim() ||
            body.content.replace(/<[^>]*>/g, "").slice(0, 140) + "...",
          content: body.content,
          views: 1,
        },
      ],
    });

    try {
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidatePath("/admin/yazarlar");
      revalidatePath(`/yazarlar/${newColumnist.articleSlug}`, "page");
      revalidatePath("/yazarlar/[id]", "page");
    } catch {}

    return NextResponse.json(newColumnist, { status: 201 });
  } catch (error) {
    console.error("API columnists POST error:", error);
    return NextResponse.json(
      { error: "İşlem gerçekleştirilemedi" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // 1. ARŞİVDEKİ BELİRLİ BİR MAKALEYİ GÜNCELLEME
    if (body.action === "update_article" || body.articleId) {
      if (!body.authorId || !body.articleId) {
        return NextResponse.json(
          { error: "authorId ve articleId zorunludur" },
          { status: 400 }
        );
      }

      const updates: Record<string, any> = {};
      if (body.title !== undefined) updates.title = body.title.trim();
      if (body.slug !== undefined) updates.slug = slugify(body.slug);
      if (body.date !== undefined) updates.date = body.date;
      if (body.excerpt !== undefined) {
        updates.excerpt = body.excerpt.trim();
      } else if (body.content) {
        updates.excerpt = body.content.replace(/<[^>]*>/g, "").slice(0, 140) + "...";
      }
      if (body.content !== undefined) updates.content = body.content;

      const res = await updateColumnistArticle(
        body.authorId,
        body.articleId,
        updates
      );

      if (!res) {
        return NextResponse.json(
          { error: "Makale veya yazar bulunamadı" },
          { status: 404 }
        );
      }

      try {
        revalidatePath("/", "page");
        revalidatePath("/", "layout");
        revalidatePath("/admin/yazarlar");
        if (res.article.slug) {
          revalidatePath(`/yazarlar/${res.article.slug}`, "page");
        }
        revalidatePath("/yazarlar/[id]", "page");
      } catch {}

      return NextResponse.json(res);
    }

    // 2. YAZAR PROFİLİNİ GÜNCELLEME
    if (!body.id) {
      return NextResponse.json(
        { error: "Yazar ID gerekli" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.slug !== undefined) updates.slug = slugify(body.slug);
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.avatar !== undefined) updates.avatar = body.avatar;
    if (body.bio !== undefined) updates.bio = body.bio.trim();
    if (body.email !== undefined) updates.email = body.email.trim();
    if (body.socialTwitter !== undefined) updates.socialTwitter = body.socialTwitter.trim();
    if (body.socialLinkedin !== undefined) updates.socialLinkedin = body.socialLinkedin.trim();
    if (body.articleTitle !== undefined) updates.articleTitle = body.articleTitle.trim();
    if (body.articleDate !== undefined) updates.articleDate = body.articleDate;
    if (body.articleSlug !== undefined && body.articleSlug.trim()) {
      updates.articleSlug = slugify(body.articleSlug);
    }
    if (body.excerpt !== undefined) {
      updates.excerpt = body.excerpt.trim();
    } else if (body.content) {
      updates.excerpt = body.content.replace(/<[^>]*>/g, "").slice(0, 140) + "...";
    }
    if (body.content !== undefined) updates.content = body.content;

    const updated = await updateColumnist(body.id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: "Köşe yazarı bulunamadı" },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidatePath("/admin/yazarlar");
      if (updated.articleSlug) {
        revalidatePath(`/yazarlar/${updated.articleSlug}`, "page");
      }
      revalidatePath("/yazarlar/[id]", "page");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("API columnists PUT error:", error);
    return NextResponse.json(
      { error: "Güncelleme yapılamadı" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");
    const articleId = searchParams.get("articleId");
    const id = searchParams.get("id");

    // 1. ARŞİVDEKİ BELİRLİ BİR MAKALEYİ SİLME
    if (authorId && articleId) {
      const success = await deleteColumnistArticle(authorId, articleId);
      if (!success) {
        return NextResponse.json(
          { error: "Makale bulunamadı veya silinemedi" },
          { status: 404 }
        );
      }

      try {
        revalidatePath("/", "page");
        revalidatePath("/", "layout");
        revalidatePath("/admin/yazarlar");
        revalidatePath("/yazarlar/[id]", "page");
      } catch {}

      return NextResponse.json({ success: true, deletedArticleId: articleId });
    }

    // 2. YAZARI VE TÜM MAKALELERİNİ SİLME
    const targetId = id || authorId;
    if (!targetId) {
      return NextResponse.json(
        { error: "Silinecek yazar ID belirtilmedi" },
        { status: 400 }
      );
    }

    const success = await deleteColumnist(targetId);
    if (!success) {
      return NextResponse.json(
        { error: "Yazar bulunamadı veya silinemedi" },
        { status: 404 }
      );
    }

    try {
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidatePath("/admin/yazarlar");
      revalidatePath("/yazarlar/[id]", "page");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API columnists DELETE error:", error);
    return NextResponse.json(
      { error: "Köşe yazarı silinemedi" },
      { status: 500 }
    );
  }
}
