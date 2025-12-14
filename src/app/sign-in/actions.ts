"use server";

import prisma from "@/lib/prisma";
import { createSession } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { verifyHash } from "@/lib/hash";

export async function login(prevState: any, formData: FormData) {
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "Missing username or password" };
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }] },
  });

  if (!user) return { error: "Invalid credentials" };

  const valid = await verifyHash(password, user.password);
  if (!valid) return { error: "Invalid credentials" };

  if (!user.isActive) return { error: "Account is disabled" };

  const { session, token } = await createSession(user.id, user.role);

  if (session && token) redirect(`/${user.role.toLowerCase()}`);
}
