import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { getSessionUser } from "@/lib/sessions";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware guarantees authentication
  const user = await getSessionUser();

  // Defensive fallback (should never happen)
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <aside className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link
          href={`/${user.role.toLowerCase()}`}
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">amar school</span>
        </Link>

        <Menu user={user as any} />
      </aside>

      {/* RIGHT */}
      <main className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-y-auto flex flex-col">
        <Navbar user={user} />
        {children}
      </main>
    </div>
  );
}
