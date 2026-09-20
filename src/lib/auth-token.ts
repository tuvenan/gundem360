export const AUTH_COOKIE_NAME = "gundem360_admin_session";

const AUTH_SECRET =
  process.env.ADMIN_AUTH_SECRET || "gundem360-jwt-auth-secret-key-2026-production";

function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function stringToBase64(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToString(b64: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64url").toString("utf-8");
  }
  return decodeURIComponent(escape(atob(b64)));
}

/**
 * Oturum token'ı üretir (7 gün geçerli HMAC-SHA256 imzalı).
 */
export async function createSessionToken(username: string): Promise<string> {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);
  const hexSig = buf2hex(signature);
  const b64Payload = stringToBase64(payload);

  return `${b64Payload}.${hexSig}`;
}

/**
 * Oturum token'ını doğrular. Hem Node hem de Edge runtime (Middleware) ile %100 uyumludur.
 */
export async function verifySessionToken(
  token: string
): Promise<{ valid: boolean; username?: string }> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false };
  }

  try {
    const [b64Payload, hexSig] = token.split(".");
    if (!b64Payload || !hexSig) return { valid: false };

    const payloadStr = base64ToString(b64Payload);
    const payload = JSON.parse(payloadStr);

    if (!payload.exp || typeof payload.exp !== "number" || Date.now() > payload.exp) {
      return { valid: false };
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(payloadStr);

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const expectedSig = await crypto.subtle.sign("HMAC", key, data);
    const expectedHex = buf2hex(expectedSig);
    const isValid = expectedHex === hexSig;

    return { valid: isValid, username: isValid ? payload.u : undefined };
  } catch {
    return { valid: false };
  }
}
