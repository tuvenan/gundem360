import { NextResponse } from "next/server";
import { getMainHeadlines, reorderHeadlineSlots } from "@/lib/news-service";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const headlines = await getMainHeadlines();
  return NextResponse.json(headlines, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.orderedIds || !Array.isArray(body.orderedIds)) {
      return NextResponse.json({ error: "orderedIds dizisi gerekli" }, { status: 400 });
    }

    const success = await reorderHeadlineSlots(body.orderedIds);

    // Hem layout hem sayfa seviyesinde Next.js önbelleğini tazele
    try {
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidatePath("/admin/mansetler", "page");
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json(
      { success },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Headline reorder error:", error);
    return NextResponse.json({ error: "Sıralama güncellenemedi" }, { status: 500 });
  }
}
