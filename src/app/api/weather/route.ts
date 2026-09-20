import { NextRequest, NextResponse } from "next/server";
import { getLiveWeather } from "@/lib/services/weather-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const citiesParam = searchParams.get("cities");

    if (citiesParam) {
      const cityList = citiesParam
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);

      const weatherList = await Promise.all(
        cityList.map(async (c) => {
          const w = await getLiveWeather(c);
          return { ...w, key: c };
        })
      );

      return NextResponse.json(
        {
          success: true,
          weatherList,
          updatedAt: new Date().toISOString(),
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    const city = searchParams.get("city") || "istanbul";
    const weather = await getLiveWeather(city);
    return NextResponse.json(
      {
        success: true,
        weather,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/weather error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Hava durumu bilgisi alınırken hata oluştu.",
      },
      { status: 500 }
    );
  }
}
