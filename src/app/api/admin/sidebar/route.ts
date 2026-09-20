import { NextRequest, NextResponse } from "next/server";
import {
  getSidebarWidgets,
  saveSidebarWidgets,
  resetSidebarWidgets,
  addCustomSidebarWidget,
  deleteSidebarWidget,
} from "@/lib/services/sidebar-service";
import { SidebarWidget } from "@/lib/types/sidebar";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
};

export async function GET() {
  try {
    const widgets = await getSidebarWidgets();
    return NextResponse.json({ success: true, widgets }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("GET /api/admin/sidebar error:", error);
    return NextResponse.json(
      { success: false, error: "Sağ bloklar yüklenirken hata oluştu." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const widgets: SidebarWidget[] = Array.isArray(body) ? body : body.widgets;

    if (!Array.isArray(widgets) || widgets.length === 0) {
      return NextResponse.json(
        { success: false, error: "Geçersiz widget listesi gönderildi." },
        { status: 400 }
      );
    }

    const updated = await saveSidebarWidgets(widgets);

    return NextResponse.json({
      success: true,
      message: "Sağ blok düzeni başarıyla kaydedildi.",
      widgets: updated,
    });
  } catch (error) {
    console.error("PUT /api/admin/sidebar error:", error);
    return NextResponse.json(
      { success: false, error: "Sağ bloklar kaydedilirken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // 1. Sıfırlama Eylemi
    if (body?.action === "reset") {
      const resetList = await resetSidebarWidgets();
      return NextResponse.json({
        success: true,
        message: "Sağ bloklar varsayılan düzene sıfırlandı.",
        widgets: resetList,
      });
    }

    // 2. Yeni Widget Ekleme
    if (body?.action === "add" && body.widget) {
      const created = await addCustomSidebarWidget(body.widget);
      const allWidgets = await getSidebarWidgets();
      return NextResponse.json({
        success: true,
        message: "Yeni sağ blok başarıyla eklendi.",
        created,
        widgets: allWidgets,
      });
    }

    // 3. Widget Silme
    if (body?.action === "delete" && body.id) {
      const success = await deleteSidebarWidget(body.id);
      const allWidgets = await getSidebarWidgets();
      return NextResponse.json({
        success,
        message: success ? "Blok başarıyla silindi." : "Blok bulunamadı.",
        widgets: allWidgets,
      });
    }

    // Doğrudan widget dizisi gönderildiyse kaydet
    const widgets: SidebarWidget[] = Array.isArray(body) ? body : body.widgets;
    if (Array.isArray(widgets)) {
      const updated = await saveSidebarWidgets(widgets);
      return NextResponse.json({
        success: true,
        message: "Sağ blok düzeni başarıyla kaydedildi.",
        widgets: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "Geçersiz işlem veya istek parametresi." },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/admin/sidebar error:", error);
    return NextResponse.json(
      { success: false, error: "İşlem yürütülürken hata oluştu." },
      { status: 500 }
    );
  }
}
