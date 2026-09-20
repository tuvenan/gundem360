import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Lütfen bir görsel dosyası seçin." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Seçilen dosya bir görsel değil. Lütfen JPG, PNG, WEBP veya GIF formatında bir dosya yükleyin." },
        { status: 400 }
      );
    }

    // 10MB dosya boyutu sınırı
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Görsel boyutu en fazla 10MB olabilir." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Dosya uzantısını ve güvenli ismini belirle
    const originalExt = path.extname(file.name).toLowerCase() || ".jpg";
    const cleanName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .substring(0, 30);

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const fileName = `${cleanName || "haber"}-${uniqueSuffix}${originalExt}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
    });
  } catch (error) {
    console.error("Görsel yükleme hatası:", error);
    return NextResponse.json(
      { error: "Görsel yüklenirken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
