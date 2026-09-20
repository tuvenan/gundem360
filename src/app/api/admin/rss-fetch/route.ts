import { NextRequest, NextResponse } from "next/server";
import { fetchAndImportAgencyFeed } from "@/lib/services/rss-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agencyId = body.agencyId;

    if (!agencyId) {
      return NextResponse.json(
        { error: "Lütfen taranacak ajansı (agencyId) belirtin." },
        { status: 400 }
      );
    }

    const result = await fetchAndImportAgencyFeed(agencyId, {
      previewOnly: Boolean(body.previewOnly),
      limit: body.limit ? Number(body.limit) : 25,
      targetCategory: body.targetCategory,
      itemCategories: body.itemCategories && typeof body.itemCategories === "object" ? body.itemCategories : undefined,
      selectedGuids: Array.isArray(body.selectedGuids) ? body.selectedGuids : undefined,
      selectedLinks: Array.isArray(body.selectedLinks) ? body.selectedLinks : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: body.previewOnly
        ? `${result.items.length} adet haber başarıyla tarandı ve listelendi.`
        : `${result.importedCount} adet haber başarıyla sisteme aktarıldı ve yayına alındı!`,
    });
  } catch (error: any) {
    console.error("RSS Fetch API error:", error);
    return NextResponse.json(
      { error: error.message || "RSS akışı taranırken bir hata oluştu." },
      { status: 500 }
    );
  }
}
