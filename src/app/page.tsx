// app/page.tsx
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/sessions";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) {
    // No session → redirect to sign-up
    redirect("/sign-in");
  }

  // Session exists → redirect based on role
  switch (user.role) {
    case "ADMIN":
      redirect("/admin");
    case "TEACHER":
      redirect("/teacher");
    case "STUDENT":
      redirect("/student");
    case "PARENT":
      redirect("/parent");
    default:
      redirect("/sign-in"); // fallback
  }
}
