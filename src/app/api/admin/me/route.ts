import { NextRequest, NextResponse } from "next/server";
import {
  getAdminUser,
  verifySessionToken,
  AUTH_COOKIE_NAME,
} from "@/lib/services/auth-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Oturum bulunamadı." },
      { status: 401 }
    );
  }

  const { valid, username } = await verifySessionToken(token);

  if (!valid || !username) {
    return NextResponse.json(
      { success: false, error: "Geçersiz veya süresi dolmuş oturum." },
      { status: 401 }
    );
  }

  const user = await getAdminUser();

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role || "Yönetici",
      lastLoginAt: user.lastLoginAt,
    },
  });
}
