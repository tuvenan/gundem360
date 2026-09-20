import { NextRequest, NextResponse } from "next/server";
import { getLegalPages, saveLegalPage } from "@/lib/services/legal-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pages = await getLegalPages();
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error("Error fetching legal pages:", error);
    return NextResponse.json(
      { success: false, error: "Yasal sayfalar yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, content, slug, description } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Geçersiz veya eksik sayfa kimliği (id)." },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, error: "Sayfa başlığı zorunludur." },
        { status: 400 }
      );
    }

    const saved = await saveLegalPage({
      id,
      title,
      content: content || "",
      slug,
      description,
    });

    return NextResponse.json({
      success: true,
      message: "Sayfa içeriği başarıyla kaydedildi.",
      data: saved,
    });
  } catch (error) {
    console.error("Error updating legal page:", error);
    return NextResponse.json(
      { success: false, error: "Yasal sayfa kaydedilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
