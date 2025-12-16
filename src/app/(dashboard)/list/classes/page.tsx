"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher, Role, Grade } from "@prisma/client";
import Image from "next/image";

type ClassList = Class & { supervisor: Teacher; grade: Grade };

type SortField = "name" | "capacity" | "grade";
type SortOrder = "asc" | "desc";

const SORT_MAP: Record<SortField, Prisma.ClassOrderByWithRelationInput> = {
  name: { name: "asc" },
  capacity: { capacity: "asc" },
  grade: { name: "asc" },
};

const ClassListPage = async ({
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

  const orderBy: Prisma.ClassOrderByWithRelationInput[] =
    sortField && SORT_MAP[sortField]
      ? [
          JSON.parse(
            JSON.stringify(SORT_MAP[sortField]).replace(
              /"asc"/g,
              `"${sortOrder}"`
            )
          ),
          { id: "asc" }, // tie-breaker for stable pagination
        ]
      : [{ name: "asc" }];

  // -------------------------
  // Filters
  // -------------------------
  const query: Prisma.ClassWhereInput = {};
  if (searchParams.supervisorId) {
    query.supervisorId = searchParams.supervisorId;
  }
  if (searchParams.search) {
    query.name = { contains: searchParams.search, mode: "insensitive" };
  }

  // -------------------------
  // Role-based access
  // -------------------------
  switch (role) {
    case Role.TEACHER:
      query.supervisorId = currentUser?.teacherId;
      break;
    case Role.STUDENT:
      if (currentUser?.studentId)
        query.students = { some: { id: currentUser.studentId } };
      break;
    case Role.PARENT:
      if (currentUser?.parentId)
        query.students = { some: { parentId: currentUser.parentId } };
      break;
  }

  // -------------------------
  // Fetch data
  // -------------------------
  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: { supervisor: true, grade: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  // -------------------------
  // Columns
  // -------------------------
  const columns = [
    { header: "Class Name", accessor: "name", sortable: true, sortKey: "name" },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "capacity",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "grade",
    },
    {
      header: "Supervisor",
      accessor: "supervisor",
      className: "hidden md:table-cell",
    },
    ...(role === Role.ADMIN ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // -------------------------
  // Row Renderer
  // -------------------------
  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item?.name}</td>
      <td className="hidden md:table-cell">{item?.capacity}</td>
      <td className="hidden md:table-cell">{item?.grade?.level}</td>
      <td className="hidden md:table-cell">
        {item?.supervisor?.name} {item?.supervisor?.surname}
      </td>
      {role === Role.ADMIN && (
        <td className="flex gap-2">
          <FormContainer table="class" type="update" data={item} />
          <FormContainer table="class" type="delete" id={item.id} />
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>

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
              <FormContainer table="class" type="create" />
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
          basePath: "/list/classes",
          params: searchParams,
        }}
      />

      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default ClassListPage;
