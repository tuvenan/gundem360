import { NextRequest, NextResponse } from "next/server";
import { generateAiNews } from "@/lib/services/ai-news-service";
import { AIGenerateRequest } from "@/lib/types/ai-news";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as AIGenerateRequest;

    if (!body.rawContent || typeof body.rawContent !== "string" || !body.rawContent.trim()) {
      return NextResponse.json(
        { error: "Lütfen haber üretimi için bir kaynak metin, not veya ajans bülteni girin." },
        { status: 400 }
      );
    }

    const result = await generateAiNews(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("AI News Generation Error:", error);
    return NextResponse.json(
      { error: error?.message || "Yapay zeka ile haber üretilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
