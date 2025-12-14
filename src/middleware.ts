import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { Role } from "@prisma/client";

const ROUTE_ROLE_MAP: Record<string, Role[]> = {
  "/admin": [Role.ADMIN],
  "/manager": [Role.MANAGER, Role.ADMIN],
  "/counselor": [Role.COUNSELOR, Role.ADMIN],
  "/teacher": [Role.TEACHER, Role.ADMIN],
  "/student": [Role.STUDENT],
  "/parent": [Role.PARENT],
};

const VALID_ROLES = new Set(Object.values(Role));

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const matchedRoute = Object.keys(ROUTE_ROLE_MAP).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return redirectToSignIn(req);
  }

  const role = req.cookies.get("session_role")?.value as Role | undefined;

  if (!role || !VALID_ROLES.has(role)) {
    return redirectForbidden(req);
  }

  const allowedRoles = ROUTE_ROLE_MAP[matchedRoute];
  if (!allowedRoles.includes(role)) {
    return redirectForbidden(req);
  }

  return NextResponse.next();
}

/* ---------------- helpers ---------------- */

function redirectToSignIn(req: NextRequest) {
  const url = new URL("/sign-in", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectForbidden(req: NextRequest) {
  return NextResponse.redirect(new URL("/403", req.url));
}

/* ---------------- config ---------------- */

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/counselor/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
  ],
};
