import fs from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { AdminUser, DEFAULT_ADMIN_USER, AUTH_COOKIE_NAME } from "@/lib/types/auth";

const STORE_PATH = path.join(process.cwd(), "src", "lib", "data", "news-store.json");
const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || "gundem360-jwt-auth-secret-key-2026-production";

function readRawStore(): any {
  try {
    if (!fs.existsSync(STORE_PATH)) return {};
    const content = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Auth service read store error:", err);
    return {};
  }
}

function writeRawStore(store: any): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Auth service write store error:", err);
  }
}

/**
 * Yönetici kullanıcıyı diskten okur. Yoksa varsayılan ile başlatır.
 */
export async function getAdminUser(): Promise<AdminUser> {
  noStore();
  const store = readRawStore();
  if (!store.adminUser || typeof store.adminUser !== "object") {
    store.adminUser = { ...DEFAULT_ADMIN_USER };
    writeRawStore(store);
    return store.adminUser;
  }
  return store.adminUser;
}

/**
 * Yönetici bilgilerini günceller.
 */
export async function updateAdminUser(updates: Partial<AdminUser>): Promise<AdminUser> {
  noStore();
  const store = readRawStore();
  const current = store.adminUser || { ...DEFAULT_ADMIN_USER };

  const updated: AdminUser = {
    ...current,
    ...updates,
  };

  store.adminUser = updated;
  writeRawStore(store);
  return updated;
}

/**
 * Kullanıcı adı ve şifreyi doğrular.
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
  const user = await getAdminUser();
  if (
    user.username.trim().toLowerCase() === username.trim().toLowerCase() &&
    user.passwordHash === password
  ) {
    // Son giriş tarihini güncelle
    await updateAdminUser({ lastLoginAt: new Date().toISOString() });
    return user;
  }
  return null;
}

export {
  createSessionToken,
  verifySessionToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth-token";

