"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Period, Prisma, Role, Subject, Teacher, Class } from "@prisma/client";
import Image from "next/image";
import { getSession } from "@/lib/sessions";

type PeriodList = Period & {
  subject: Subject;
  teacher: Teacher;
  class: Class;
};

type SortField = "name" | "subject" | "teacher" | "class";
type SortOrder = "asc" | "desc";

const SORT_MAP: Record<SortField, Prisma.PeriodOrderByWithRelationInput> = {
  name: { name: "asc" },
  subject: { subject: { name: "asc" } },
  teacher: { teacher: { name: "asc" } },
  class: { class: { name: "asc" } },
};

const PeriodListPage = async ({
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

  const orderBy: Prisma.PeriodOrderByWithRelationInput[] =
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
      : [{ name: "asc" }];

  // -------------------------
  // Filters
  // -------------------------
  const query: Prisma.PeriodWhereInput = {};
  if (searchParams.search) {
    query.name = { contains: searchParams.search, mode: "insensitive" };
  }

  // -------------------------
  // Role-based access
  // -------------------------
  switch (role) {
    case Role.TEACHER:
      query.teacherId = currentUser.teacherId!;
      break;
    case Role.STUDENT:
      if (currentUser.studentId)
        query.class = { students: { some: { id: currentUser.studentId } } };
      break;
    case Role.PARENT:
      if (currentUser.parentId)
        query.class = {
          students: { some: { parent: { id: currentUser.parentId } } },
        };
      break;
  }

  // -------------------------
  // Fetch data
  // -------------------------
  const [data, count] = await prisma.$transaction([
    prisma.period.findMany({
      where: query,
      include: { subject: true, teacher: true, class: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.period.count({ where: query }),
  ]);

  // -------------------------
  // Columns
  // -------------------------
  const columns = [
    { header: "Period", accessor: "name", sortable: true, sortKey: "name" },
    {
      header: "Subject",
      accessor: "subject",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "subject",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "teacher",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden lg:table-cell",
      sortable: true,
      sortKey: "class",
    },
    ...(role === Role.ADMIN ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // -------------------------
  // Row Renderer
  // -------------------------
  const renderRow = (item: PeriodList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 font-medium">{item.name}</td>
      <td className="hidden md:table-cell">{item.subject.name}</td>
      <td className="hidden md:table-cell">
        {item.teacher.name} {item.teacher.surname}
      </td>
      <td className="hidden lg:table-cell">{item.class.name}</td>
      {role === Role.ADMIN && (
        <td className="flex gap-2">
          <FormContainer table="period" type="update" data={item} />
          <FormContainer table="period" type="delete" id={item.id} />
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Periods</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex gap-4 items-center">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === Role.ADMIN && (
              <FormContainer table="period" type="create" />
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
          basePath: "/list/periods",
          params: searchParams,
        }}
      />

      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default PeriodListPage;
