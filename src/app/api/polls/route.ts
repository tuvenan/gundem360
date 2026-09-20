import { NextRequest, NextResponse } from "next/server";
import {
  getPolls,
  getActiveFeaturedPoll,
  getPollById,
  createPoll,
  updatePoll,
  deletePoll,
  resetPollVotes,
} from "@/lib/news-service";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function revalidatePollPaths() {
  try {
    revalidatePath("/", "page");
    revalidatePath("/admin/anketler", "page");
  } catch (err) {
    console.error("Revalidation error:", err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const id = searchParams.get("id");

    if (featured) {
      const activePoll = await getActiveFeaturedPoll();
      return NextResponse.json(activePoll);
    }

    if (id) {
      const poll = await getPollById(id);
      if (!poll) {
        return NextResponse.json({ error: "Anket bulunamadı." }, { status: 404 });
      }
      return NextResponse.json(poll);
    }

    const polls = await getPolls();
    return NextResponse.json(polls);
  } catch (error) {
    console.error("GET /api/polls error:", error);
    return NextResponse.json({ error: "Anketler yüklenemedi." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.question || !body.question.trim()) {
      return NextResponse.json({ error: "Anket sorusu zorunludur." }, { status: 400 });
    }

    if (!body.options || !Array.isArray(body.options) || body.options.length < 2) {
      return NextResponse.json({ error: "En az 2 seçenek girilmelidir." }, { status: 400 });
    }

    const created = await createPoll({
      question: body.question.trim(),
      description: body.description?.trim() || "",
      category: body.category || "gundem",
      options: body.options.map((opt: any) => ({
        text: typeof opt === "string" ? opt.trim() : opt.text.trim(),
        color: opt.color || undefined,
      })),
      isFeatured: Boolean(body.isFeatured),
      status: body.status || "active",
      startDate: body.startDate,
      endDate: body.endDate,
    });

    revalidatePollPaths();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/polls error:", error);
    return NextResponse.json({ error: "Anket oluşturulamadı." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Anket ID si zorunludur." }, { status: 400 });
    }

    if (body.action === "reset") {
      const reset = await resetPollVotes(id);
      revalidatePollPaths();
      return NextResponse.json(reset);
    }

    const updated = await updatePoll(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Anket bulunamadı veya güncellenemedi." }, { status: 404 });
    }

    revalidatePollPaths();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/polls error:", error);
    return NextResponse.json({ error: "Anket güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Silinecek Anket ID si belirtilmelidir." }, { status: 400 });
    }

    const success = await deletePoll(id);
    if (!success) {
      return NextResponse.json({ error: "Anket silinemedi veya bulunamadı." }, { status: 404 });
    }

    revalidatePollPaths();
    return NextResponse.json({ success: true, message: "Anket başarıyla silindi." });
  } catch (error) {
    console.error("DELETE /api/polls error:", error);
    return NextResponse.json({ error: "Anket silinirken hata oluştu." }, { status: 500 });
  }
}
