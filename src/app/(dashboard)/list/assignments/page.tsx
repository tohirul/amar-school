"use server";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  Assignment,
  Prisma,
  Class,
  Subject,
  Teacher,
  Role,
} from "@prisma/client";
import Image from "next/image";
import { getSession } from "@/lib/sessions";

type AssignmentList = Assignment & {
  period: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

type SortField = "subject" | "title" | "class" | "teacher" | "dueDate";
type SortOrder = "asc" | "desc";

const SORT_MAP: Record<SortField, Prisma.AssignmentOrderByWithRelationInput> = {
  subject: { period: { subject: { name: "asc" } } },
  title: { title: "asc" },
  class: { period: { class: { name: "asc" } } },
  teacher: { period: { teacher: { name: "asc" } } },
  dueDate: { dueDate: "asc" },
};

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getSession();
  const currentUser = session?.user;

  if (!currentUser) return <div className="p-4">Unauthorized</div>;

  const role = currentUser.role;

  // -------------------------
  // Pagination
  // -------------------------
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  // -------------------------
  // Sorting
  // -------------------------
  const sortField = searchParams.sort as SortField | undefined;
  const sortOrder: SortOrder = searchParams.order === "desc" ? "desc" : "asc";

  const orderBy: Prisma.AssignmentOrderByWithRelationInput[] =
    sortField && SORT_MAP[sortField]
      ? [
          JSON.parse(
            JSON.stringify(SORT_MAP[sortField]).replace(
              /"asc"/g,
              `"${sortOrder}"`
            )
          ),
          { id: "asc" }, // tie-breaker
        ]
      : [{ dueDate: "asc" }, { id: "asc" }];

  // -------------------------
  // Filtering
  // -------------------------
  const query: Prisma.AssignmentWhereInput = { period: {} };

  if (searchParams.search) {
    query.period!.subject = {
      name: { contains: searchParams.search, mode: "insensitive" },
    };
  }
  if (searchParams.classId)
    query.period!.classId = parseInt(searchParams.classId);
  if (searchParams.teacherId) query.period!.teacherId = searchParams.teacherId;

  // -------------------------
  // Role-based access
  // -------------------------
  switch (role) {
    case Role.TEACHER:
      query.period!.teacherId = currentUser.teacherId!;
      break;
    case Role.STUDENT:
      query.period!.class = {
        students: { some: { id: currentUser.studentId! } },
      };
      break;
    case Role.PARENT:
      query.period!.class = {
        students: { some: { parentId: currentUser.parentId! } },
      };
      break;
  }

  // -------------------------
  // Fetch Data
  // -------------------------
  const [data, count, periods] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        period: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.assignment.count({ where: query }),
    prisma.period.findMany({
      select: {
        id: true,
        name: true,
        class: { select: { name: true } },
        subject: { select: { name: true } },
      },
    }),
  ]);

  // -------------------------
  // Columns
  // -------------------------
  const columns = [
    {
      header: "Subject Name",
      accessor: "subject",
      sortable: true,
      sortKey: "subject",
    },
    {
      header: "Assignment",
      accessor: "title",
      sortable: true,
      sortKey: "title",
    },
    { header: "Class", accessor: "class", sortable: true, sortKey: "class" },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "teacher",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "dueDate",
    },
    ...(role === Role.ADMIN || role === Role.TEACHER
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  // -------------------------
  // Row Renderer
  // -------------------------
  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.period.subject.name}</td>
      <td>{item.title}</td>
      <td>{item.period.class.name}</td>
      <td className="hidden md:table-cell">
        {item.period.teacher.name} {item.period.teacher.surname}
      </td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
          item.dueDate
        )}
      </td>
      {(role === Role.ADMIN || role === Role.TEACHER) && (
        <td className="flex gap-2">
          <FormModal table="assignment" type="update" data={item} />
          <FormModal table="assignment" type="delete" id={item.id} />
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          All Assignments
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex gap-4 items-center">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === Role.ADMIN || role === Role.TEACHER) && (
              <FormModal
                table="assignment"
                type="create"
                relatedData={{ periods }}
              />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        data={data}
        renderRow={renderRow}
        sort={{
          field: sortField,
          order: sortOrder,
          basePath: "/list/assignments",
          params: searchParams,
        }}
      />

      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default AssignmentListPage;
