import { NextRequest, NextResponse } from "next/server";
import { generateAiCoverImage } from "@/lib/services/ai-news-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = body.prompt || body.title || "";

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Görsel üretimi için lütfen bir haber başlığı veya görsel tasvir metni girin." },
        { status: 400 }
      );
    }

    const result = await generateAiCoverImage(
      prompt.trim(),
      body.title,
      body.category,
      body.summary
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: result.fileName,
      message: "Yapay zeka kapak görseli başarıyla üretildi ve sisteme yüklendi.",
    });
  } catch (error: any) {
    console.error("AI Görsel Üretim Hatası:", error);
    return NextResponse.json(
      { error: error?.message || "Görsel üretilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
