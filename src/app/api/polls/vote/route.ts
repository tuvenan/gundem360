import { NextRequest, NextResponse } from "next/server";
import { votePoll } from "@/lib/news-service";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pollId, optionId } = body;

    if (!pollId || !optionId) {
      return NextResponse.json(
        { error: "Anket ID ve Seçenek ID si zorunludur." },
        { status: 400 }
      );
    }

    const result = await votePoll(pollId, optionId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    try {
      revalidatePath("/", "page");
      revalidatePath("/admin/anketler", "page");
    } catch (err) {
      console.error("Revalidation error:", err);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/polls/vote error:", error);
    return NextResponse.json({ error: "Oy kullanılırken hata oluştu." }, { status: 500 });
  }
}
