import { NextResponse } from "next/server";
import {
  getComments,
  getAllComments,
  addComment,
  updateCommentStatus,
  deleteComment,
  voteComment,
} from "@/lib/news-service";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const newsId = searchParams.get("newsId");

  if (newsId) {
    const comments = await getComments(newsId);
    return NextResponse.json(comments);
  }

  // Admin moderation: return all comments
  const all = await getAllComments();
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.newsId || !body.author || !body.content) {
      return NextResponse.json({ error: "Eksik yorum bilgisi" }, { status: 400 });
    }

    const created = await addComment({
      newsId: body.newsId,
      author: body.author.trim(),
      content: body.content.trim(),
      parentId: body.parentId || null,
      replyToAuthor: body.replyToAuthor?.trim() || undefined,
    });

    try {
      revalidatePath("/haber/[slug]", "page");
      revalidatePath("/admin/yorumlar");
    } catch {}

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("API comments POST error:", error);
    return NextResponse.json({ error: "Yorum kaydedilemedi" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // 1. Upvote / Downvote Aksiyonu
    if (body.action === "vote") {
      if (!body.id || !body.voteType) {
        return NextResponse.json({ error: "id ve voteType (up/down) zorunludur" }, { status: 400 });
      }

      const updated = await voteComment(
        body.id,
        body.voteType,
        body.voteAction || "add"
      );

      if (!updated) {
        return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
      }

      return NextResponse.json(updated);
    }

    // 2. Moderasyon Durumu Güncelleme
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id ve status gerekli" }, { status: 400 });
    }

    const success = await updateCommentStatus(body.id, body.status);
    try {
      revalidatePath("/admin/yorumlar");
    } catch {}
    return NextResponse.json({ success });
  } catch (error) {
    console.error("API comments PUT error:", error);
    return NextResponse.json({ error: "Yorum durumu güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID belirtilmedi" }, { status: 400 });
    }

    const success = await deleteComment(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("API comments DELETE error:", error);
    return NextResponse.json({ error: "Yorum silinemedi" }, { status: 500 });
  }
}
