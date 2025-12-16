"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Class, Prisma, Role, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getSession } from "@/lib/sessions";

type TeacherList = Teacher & {
  subjects: Subject[];
  classes: Class[];
};

type SortField = "name" | "username" | "createdAt";
type SortOrder = "asc" | "desc";

const SORT_MAP: Record<SortField, Prisma.TeacherOrderByWithRelationInput> = {
  name: { name: "asc" },
  username: { username: "asc" },
  createdAt: { createdAt: "asc" },
};

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getSession();
  const currentUser = session?.user;

  if (!currentUser) {
    return <div className="p-4">Unauthorized</div>;
  }

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

  const orderBy: Prisma.TeacherOrderByWithRelationInput[] =
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
      : [{ createdAt: "desc" }];

  // -------------------------
  // Filters
  // -------------------------
  const query: Prisma.TeacherWhereInput = {};

  if (searchParams.classId) {
    query.periods = {
      some: { classId: parseInt(searchParams.classId) },
    };
  }

  if (searchParams.search) {
    query.name = {
      contains: searchParams.search,
      mode: "insensitive",
    };
  }

  // -------------------------
  // Data Fetch
  // -------------------------
  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  // -------------------------
  // Columns
  // -------------------------
  const columns = [
    { header: "Info", accessor: "info" },
    {
      header: "Teacher ID",
      accessor: "username",
      sortable: true,
      sortKey: "username",
      className: "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Supervising",
      accessor: "classes",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === Role.ADMIN ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // -------------------------
  // Row Renderer
  // -------------------------
  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">
        {item.subjects.map((s) => s.name).join(", ")}
      </td>
      <td className="hidden md:table-cell">
        {item.classes.map((c) => c.name).join(", ")}
      </td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>

      {role === Role.ADMIN && (
        <td>
          <div className="flex gap-2">
            <Link href={`/list/teachers/${item.id}`}>
              <button className="w-7 h-7 rounded-full bg-lamaSky flex items-center justify-center">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            <FormContainer table="teacher" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>

        <div className="flex gap-4 items-center">
          <TableSearch />
          {role === Role.ADMIN && (
            <FormContainer table="teacher" type="create" />
          )}
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
          basePath: "/list/teachers",
          params: searchParams,
        }}
      />

      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default TeacherListPage;
