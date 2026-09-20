import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, saveSiteSettings } from "@/lib/services/settings-service";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Ayarlar yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Geçersiz ayar verisi gönderildi." },
        { status: 400 }
      );
    }

    if (body.siteName && typeof body.siteName === "string" && !body.siteName.trim()) {
      return NextResponse.json(
        { error: "Site adı boş bırakılamaz." },
        { status: 400 }
      );
    }

    // Servisi çağır ve kalıcı olarak kaydet
    const updated = await saveSiteSettings(body);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Ayarlar güncellenirken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

// Geriye dönük uyumluluk için POST da kabul edilsin
export async function POST(request: NextRequest) {
  return PUT(request);
}
