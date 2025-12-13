import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/sessions";
import { Teacher, Role } from "@prisma/client";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const session = await getSession();
  const currentUser = session?.user;

  if (!currentUser) {
    return <div className="p-4">Unauthorized</div>;
  }

  const role = currentUser.role; // Assuming role is saved in user metadata

  const teacher:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  if (!teacher) return notFound();

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={teacher.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name} {teacher.surname}
                </h1>
                {role === Role.ADMIN && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{teacher.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{teacher.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{teacher.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {[
              {
                label: "Attendance",
                value: "90%",
                icon: "/singleAttendance.png",
              },
              {
                label: "Branches",
                value: teacher._count.subjects,
                icon: "/singleBranch.png",
              },
              {
                label: "Lessons",
                value: teacher._count.lessons,
                icon: "/singleLesson.png",
              },
              {
                label: "Classes",
                value: teacher._count.classes,
                icon: "/singleClass.png",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]"
              >
                <Image
                  src={card.icon}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <div>
                  <h1 className="text-xl font-semibold">{card.value}</h1>
                  <span className="text-sm text-gray-400">{card.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <h1>Teacher&apos;s Schedule</h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            {[
              {
                label: "Teacher's Classes",
                href: `/list/classes?supervisorId=${teacher.id}`,
                bg: "bg-lamaSkyLight",
              },
              {
                label: "Teacher's Students",
                href: `/list/students?teacherId=${teacher.id}`,
                bg: "bg-lamaPurpleLight",
              },
              {
                label: "Teacher's Lessons",
                href: `/list/lessons?teacherId=${teacher.id}`,
                bg: "bg-lamaYellowLight",
              },
              {
                label: "Teacher's Exams",
                href: `/list/exams?teacherId=${teacher.id}`,
                bg: "bg-pink-50",
              },
              {
                label: "Teacher's Assignments",
                href: `/list/assignments?teacherId=${teacher.id}`,
                bg: "bg-lamaSkyLight",
              },
            ].map((shortcut, idx) => (
              <Link
                key={idx}
                href={shortcut.href}
                className={`p-3 rounded-md ${shortcut.bg}`}
              >
                {shortcut.label}
              </Link>
            ))}
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
