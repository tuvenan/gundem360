import { NextResponse } from "next/server";
import { getLiveFinanceRates } from "@/lib/services/finance-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rates = await getLiveFinanceRates();
    return NextResponse.json(
      {
        success: true,
        rates,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/finance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Finans kurları alınırken hata oluştu.",
      },
      { status: 500 }
    );
  }
}
