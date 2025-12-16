"use server";

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";

const ParentPage = async () => {
  const session = await getSession();
  const user = session?.user;

  if (!user || !user.parentId) {
    return (
      <div className="p-4 text-center text-red-500 font-medium">
        Unauthorized
      </div>
    );
  }

  // Fetch students of the current parent
  const students = await prisma.student.findMany({
    where: { parentId: user.parentId },
    select: {
      id: true,
      name: true,
      surname: true,
      classId: true,
    },
  });

  if (!students.length) {
    return (
      <div className="p-4 text-center text-gray-500 font-medium">
        No students assigned
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT COLUMN: Students' Schedule */}
      <div className="flex flex-col gap-4 w-full xl:w-2/3">
        {students.map((student) => (
          <div className="bg-white p-4 rounded-md shadow-sm" key={student.id}>
            <h2 className="text-xl font-semibold mb-2">
              Schedule: {student.name} {student.surname}
            </h2>
            <BigCalendarContainer type="classId" id={student.classId} />
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: Announcements */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <div className="sticky top-4">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
