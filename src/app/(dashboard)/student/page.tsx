import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";

const StudentPage = async () => {
  const session = await getSession();
  const user = session?.user;

  if (!user?.id || !user.studentId) {
    return <div className="p-4">Unauthorized</div>;
  }

  // Fetch the class for the current student
  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: user.studentId } },
    },
  });

  if (!classItem.length) {
    return <div className="p-4">No class assigned</div>;
  }

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Schedule ({classItem[0].name})
          </h1>
          <BigCalendarContainer type="classId" id={classItem[0].id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
