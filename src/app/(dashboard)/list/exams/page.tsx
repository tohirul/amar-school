import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Role, Subject, Teacher } from "@prisma/client";
import Image from "next/image";

type ExamList = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Custom Auth
  const session = await getSession();
  const currentUser = session?.user;

  if (!currentUser) {
    return <div className="p-4">Unauthorized</div>;
  }
  const role = currentUser.role;

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === Role.ADMIN || role === Role.TEACHER
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        {item.lesson.subject.name}
      </td>

      <td>{item.lesson.class.name}</td>

      <td className="hidden md:table-cell">
        {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
      </td>

      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {(role === Role.ADMIN || role === Role.TEACHER) && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="exam" type="update" data={item} />
            <FormContainer table="exam" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.ExamWhereInput = {};
  query.lesson = {};

  // URL Filtering
  Object.entries(queryParams).forEach(([key, value]) => {
    if (!value) return;

    switch (key) {
      case "classId":
        query.lesson!.classId = parseInt(value);
        break;
      case "teacherId":
        query.lesson!.teacherId = value;
        break;
      case "search":
        query.lesson!.subject = {
          name: { contains: value, mode: "insensitive" },
        };
        break;
    }
  });

  // Role-Based Access Filtering
  switch (role) {
    case Role.ADMIN:
      break;

    case Role.TEACHER:
      query.lesson!.teacherId = currentUser?.id;
      break;

    case Role.STUDENT:
      query.lesson!.class = {
        students: { some: { id: currentUser?.id } },
      };
      break;

    case Role.PARENT:
      query.lesson!.class = {
        students: { some: { parentId: currentUser?.id } },
      };
      break;
  }

  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>

            {(role === Role.ADMIN || role === Role.TEACHER) && (
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ExamListPage;
