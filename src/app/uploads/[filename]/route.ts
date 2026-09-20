import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;

    // Güvenlik kontrolü: Dizin dışına çıkışı (directory traversal) engelle
    const sanitizedFileName = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", sanitizedFileName);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Görsel bulunamadı", { status: 404 });
    }

    const ext = path.extname(sanitizedFileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".avif": "image/avif",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Görsel sunma hatası:", error);
    return new NextResponse("Sunucu hatası", { status: 500 });
  }
}
