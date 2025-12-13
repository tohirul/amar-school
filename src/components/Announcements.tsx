import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";

const Announcements = async () => {
  const session = await getSession();
  const user = session?.user;
  const role = user?.role;
  const userId = user?.id;

  const roleConditions = {
    TEACHER: { lessons: { some: { teacherId: userId! } } },
    STUDENT: { students: { some: { id: userId! } } },
    PARENT: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "ADMIN" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data.map((announcement, index) => {
          const bgColor =
            index === 0
              ? "bg-lamaSkyLight"
              : index === 1
              ? "bg-lamaPurpleLight"
              : "bg-lamaYellowLight";

          return (
            <div key={announcement.id} className={`${bgColor} rounded-md p-4`}>
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{announcement.title}</h2>
                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                  {new Intl.DateTimeFormat("en-GB").format(announcement.date)}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {announcement.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Announcements;
