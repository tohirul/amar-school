import { SESSION_COOKIE } from "@/lib/constants";
import {
  generateAccessToken,
  generateRefreshToken,
  hashValue,
} from "@/lib/hash";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session || session.revoked || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  // Rotate refresh token
  const newRefreshToken = generateRefreshToken(session.id);
  const newRefreshHash = await hashValue(newRefreshToken);

  await prisma.session.update({
    where: { id: session.id },
    data: { refreshTokenHash: newRefreshHash },
  });

  const response = NextResponse.json({
    user: {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
    },
    accessToken: generateAccessToken(session.user),
  });

  response.cookies.set(SESSION_COOKIE, newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
