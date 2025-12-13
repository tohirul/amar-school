// pages/api/session/validate.ts
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  let body;
  try {
    body = JSON.parse(req.body); // parse JSON explicitly
  } catch {
    return res.status(400).json({ valid: false });
  }

  const token = body.token;
  if (!token) return res.status(400).json({ valid: false });

  const sessions = await prisma.session.findMany({
    where: { revoked: false, expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  for (const session of sessions) {
    if (await bcrypt.compare(token, session.refreshTokenHash)) {
      return res.status(200).json({ valid: true, user: session.user });
    }
  }

  return res.status(200).json({ valid: false });
}
