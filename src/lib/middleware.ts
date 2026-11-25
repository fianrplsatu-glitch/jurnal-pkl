import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "jurnal_pkl_session";

async function verifyToken(token: string | undefined) {
  if (!token || !process.env.SESSION_SECRET) return null;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload as { role?: string; siswaId?: number; nama?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifyToken(token);

  if (pathname.startsWith("/jurnal")) {
    if (!session || session.role !== "siswa") {
      return NextResponse.redirect(new URL("/masuk", request.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/jurnal/:path*", "/admin/:path*"],
};
