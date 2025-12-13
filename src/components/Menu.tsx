import Image from "next/image";
import Link from "next/link";
import { destroySession } from "@/lib/sessions";

type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

type User = {
  id: string;
  role: Role;
  email: string;
};

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
    ],
  },
];

export default function Menu({ user }: { user: User }) {
  const role = user.role;

  async function logout() {
    "use server";
    await destroySession();
  }

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((section) => (
        <div key={section.title} className="flex flex-col gap-2">
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {section.title}
          </span>

          {section.items.map((item) =>
            item.visible.includes(role) ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            ) : null
          )}
        </div>
      ))}
      {/* Logout */}
      <form action={logout} className="w-full">
        <button
          type="submit"
          className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
        >
          <Image src="/logout.png" alt="Logout" width={20} height={20} />
          <span className="hidden lg:block">Logout</span>
        </button>
      </form>
    </div>
  );
}
