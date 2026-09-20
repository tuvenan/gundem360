import { NextRequest, NextResponse } from "next/server";
import {
  getAllAgencies,
  createAgency,
  updateAgency,
  deleteAgency,
} from "@/lib/services/rss-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agencies = await getAllAgencies();
    return NextResponse.json(agencies);
  } catch (error: any) {
    console.error("Agencies GET error:", error);
    return NextResponse.json({ error: error.message || "Ajanslar yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.rssUrl) {
      return NextResponse.json(
        { error: "Ajans adı ve RSS URL adresi zorunludur." },
        { status: 400 }
      );
    }

    const created = await createAgency({
      name: body.name.trim(),
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      websiteUrl: body.websiteUrl || "https://gundem360.com",
      rssUrl: body.rssUrl.trim(),
      logoUrl: body.logoUrl || undefined,
      status: body.status || "active",
      defaultCategory: body.defaultCategory || "gundem",
      autoPublish: Boolean(body.autoPublish),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Agency POST error:", error);
    return NextResponse.json({ error: error.message || "Ajans kaydedilemedi." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Ajans ID gereklidir." }, { status: 400 });
    }

    const updated = await updateAgency(body.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Ajans bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Agency PUT error:", error);
    return NextResponse.json({ error: error.message || "Ajans güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ajans ID parametresi gereklidir." }, { status: 400 });
    }

    const success = await deleteAgency(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error("Agency DELETE error:", error);
    return NextResponse.json({ error: error.message || "Ajans silinemedi." }, { status: 500 });
  }
}
