import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { hashValue } from "./hash";
import { SESSION_COOKIE } from "./constants";
import { redirect } from "next/navigation";

const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;

export async function createSession(
  userId: string,
  userAgent?: string,
  ip?: string
) {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = await hashValue(token);

  const session = await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: tokenHash,
      userAgent: userAgent ?? null,
      ipAddress: ip ?? null,
      expiresAt: new Date(Date.now() + SESSION_TTL),
    },
  });

  // Set cookie in headers
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL / 1000,
  });

  return { session, token };
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  // Look up any valid session and compare using bcrypt
  const sessions = await prisma.session.findMany({
    where: {
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  for (const session of sessions) {
    const match = await bcrypt.compare(sessionToken, session.refreshTokenHash);
    if (match) return session.user;
  }

  return null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;
  const sessions = await prisma.session.findMany({
    where: { revoked: false },
  });

  for (const session of sessions) {
    if (await bcrypt.compare(sessionToken, session.refreshTokenHash)) {
      await prisma.session.update({
        where: { id: session.id },
        data: { revoked: true },
      });
      break;
    }
  }

  cookieStore.delete(SESSION_COOKIE);
  redirect("/sign-in");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessions = await prisma.session.findMany({
    where: { revoked: false, expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  for (const session of sessions) {
    if (await bcrypt.compare(token, session.refreshTokenHash)) {
      return session;
    }
  }

  return null;
}
