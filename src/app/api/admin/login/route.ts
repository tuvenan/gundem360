import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  createSessionToken,
  AUTH_COOKIE_NAME,
} from "@/lib/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı adı ve şifre zorunludur." },
        { status: 400 }
      );
    }

    const user = await verifyAdminCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı adı veya şifre hatalı." },
        { status: 401 }
      );
    }

    // Güvenli oturum token'ı oluştur
    const token = await createSessionToken(user.username);

    const response = NextResponse.json({
      success: true,
      message: "Giriş başarılı. Yönetim paneline yönlendiriliyorsunuz...",
      user: {
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role || "Yönetici",
      },
    });

    // HTTP-only güvenli çerez kaydet (7 gün geçerli)
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 gün
    });

    return response;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Giriş yapılırken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
