import { NextRequest, NextResponse } from "next/server";
import {
  getHomepageLayout,
  saveHomepageLayout,
  resetHomepageLayout,
} from "@/lib/services/layout-service";
import { LayoutBlock } from "@/lib/types/layout";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
};

export async function GET() {
  try {
    const layout = await getHomepageLayout();
    return NextResponse.json({ success: true, layout }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("GET /api/admin/layout error:", error);
    return NextResponse.json(
      { success: false, error: "Sayfa düzeni yüklenirken bir hata oluştu." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const blocks: LayoutBlock[] = Array.isArray(body) ? body : body.blocks;

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Geçersiz blok listesi gönderildi." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const updatedLayout = await saveHomepageLayout(blocks);

    return NextResponse.json(
      {
        success: true,
        message: "Sayfa düzeni başarıyla kaydedildi.",
        layout: updatedLayout,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("PUT /api/admin/layout error:", error);
    return NextResponse.json(
      { success: false, error: "Sayfa düzeni kaydedilirken sunucu hatası oluştu." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body?.action === "reset") {
      const resetBlocks = await resetHomepageLayout();
      return NextResponse.json(
        {
          success: true,
          message: "Sayfa düzeni varsayılan fabrika ayarlarına sıfırlandı.",
          layout: resetBlocks,
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    // Aksi takdirde PUT gibi davran
    const blocks: LayoutBlock[] = Array.isArray(body) ? body : body.blocks;
    if (Array.isArray(blocks)) {
      const updatedLayout = await saveHomepageLayout(blocks);
      return NextResponse.json(
        {
          success: true,
          message: "Sayfa düzeni başarıyla kaydedildi.",
          layout: updatedLayout,
        },
        { headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz işlem veya veri." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("POST /api/admin/layout error:", error);
    return NextResponse.json(
      { success: false, error: "İşlem gerçekleştirilirken hata oluştu." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

