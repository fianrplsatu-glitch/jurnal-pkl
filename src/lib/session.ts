import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "jurnal_pkl_session";

export type SessionPayload =
  | { role: "siswa"; siswaId: number; nama: string }
  | { role: "admin" };

function getEncodedSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET belum diatur.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getEncodedSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, getEncodedSecret(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
