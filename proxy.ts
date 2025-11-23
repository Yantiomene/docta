import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const roleRegex = /^\/(admin|medecin|infirmiere|patient)(?:\/|$)/;

export function proxy(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  const isProtected = roleRegex.test(pathname);
  if (!isProtected) return NextResponse.next();

  const role = cookies.get("role")?.value;
  if (!role) {
    nextUrl.pathname = "/auth/login";
    return NextResponse.redirect(nextUrl);
  }

  const requiredRole = pathname.split("/")[1];
  if (role !== requiredRole) {
    nextUrl.pathname = "/auth/login";
    return NextResponse.redirect(nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(admin|medecin|infirmiere|patient)(/:path*)?"],
};
