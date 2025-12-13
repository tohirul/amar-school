import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";

const ParentPage = async () => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return <div className="p-4">Unauthorized</div>;
  }

  // Fetch students of the current parent
  const students = await prisma.student.findMany({
    where: {
      parentId: user.id,
    },
  });

  if (!students.length) {
    return <div className="p-4">No students assigned</div>;
  }

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="flex flex-col gap-4 w-full xl:w-2/3">
        {students.map((student) => (
          <div className="bg-white p-4 rounded-md" key={student.id}>
            <h1 className="text-xl font-semibold">
              Schedule ({student.name} {student.surname})
            </h1>
            <BigCalendarContainer type="classId" id={student.classId} />
          </div>
        ))}
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
