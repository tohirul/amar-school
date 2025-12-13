import { SESSION_COOKIE } from "@/lib/constants";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    // Find sessions and revoke matching token
    const sessions = await prisma.session.findMany({
      where: { revoked: false },
    });
    for (const session of sessions) {
      if (await bcrypt.compare(token, session.refreshTokenHash)) {
        await prisma.session.update({
          where: { id: session.id },
          data: { revoked: true },
        });
      }
    }

    // Delete the cookie
    cookieStore.delete(SESSION_COOKIE);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
