import { NextRequest, NextResponse } from "next/server";
import {
  getContactMessages,
  saveContactMessage,
  markContactMessageAsRead,
  deleteContactMessage,
} from "@/lib/services/legal-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const messages = await getContactMessages();
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { success: false, error: "Mesajlar alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Doğrulama
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Lütfen geçerli bir Ad Soyad giriniz." },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      return NextResponse.json(
        { success: false, error: "Lütfen geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Lütfen mesaj konusunu belirtiniz." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Lütfen en az 5 karakterlik bir mesaj yazınız." },
        { status: 400 }
      );
    }

    const saved = await saveContactMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Mesajınız başarıyla iletildi. En kısa sürede dönüş yapılacaktır.",
      data: saved,
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { success: false, error: "Mesajınız iletilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isRead } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Mesaj kimliği (id) zorunludur." },
        { status: 400 }
      );
    }

    const updated = await markContactMessageAsRead(id, isRead !== undefined ? !!isRead : true);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Mesaj bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mesaj durumu güncellendi.",
    });
  } catch (error) {
    console.error("Error updating contact message:", error);
    return NextResponse.json(
      { success: false, error: "Mesaj güncellenirken hata oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Silinecek mesaj kimliği (id) zorunludur." },
        { status: 400 }
      );
    }

    const deleted = await deleteContactMessage(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Silinecek mesaj bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mesaj başarıyla silindi.",
    });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { success: false, error: "Mesaj silinirken hata oluştu." },
      { status: 500 }
    );
  }
}
