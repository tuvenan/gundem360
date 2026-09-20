export interface AdminUser {
  username: string;
  passwordHash: string; // Parola (varsayılan: gundem360_2026)
  fullName: string;
  email: string;
  role?: string;
  lastLoginAt?: string;
}

export const DEFAULT_ADMIN_USER: AdminUser = {
  username: "admin",
  passwordHash: "gundem360_2026",
  fullName: "Gündem360 Yönetici",
  email: "admin@gundem360.com",
  role: "Süper Yönetici",
};

export const AUTH_COOKIE_NAME = "gundem360_admin_session";
