import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Role, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/sessions";

type StudentList = Student & { class: Class };

type SortField = "name" | "username" | "class" | "createdAt";
type SortOrder = "asc" | "desc";

const SORT_MAP: Record<SortField, Prisma.StudentOrderByWithRelationInput> = {
  name: { name: "asc" },
  username: { username: "asc" },
  class: { class: { name: "asc" } },
  createdAt: { createdAt: "asc" },
};

const StudentListPage = async ({
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

  const orderBy: Prisma.StudentOrderByWithRelationInput[] =
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
  const query: Prisma.StudentWhereInput = {};

  if (searchParams.teacherId) {
    query.class = {
      periods: { some: { teacherId: searchParams.teacherId } },
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
    prisma.student.findMany({
      where: query,
      include: { class: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  // -------------------------
  // Columns
  // -------------------------
  const columns = [
    { header: "Info", accessor: "info" },
    {
      header: "Student ID",
      accessor: "username",
      sortable: true,
      sortKey: "username",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      sortable: true,
      sortKey: "class",
      className: "hidden md:table-cell",
    },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
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
  const renderRow = (item: StudentList) => (
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
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.class.name}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>

      {role === Role.ADMIN && (
        <td>
          <div className="flex gap-2">
            <Link href={`/list/students/${item.id}`}>
              <button className="w-7 h-7 rounded-full bg-lamaSky flex items-center justify-center">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>
            <FormContainer table="student" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>

        <div className="flex gap-4 items-center">
          <TableSearch />
          {role === Role.ADMIN && (
            <FormContainer table="student" type="create" />
          )}
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        renderRow={renderRow}
        data={data}
        sort={{
          field: sortField,
          order: sortOrder,
          basePath: "/list/students",
          params: searchParams,
        }}
      />

      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default StudentListPage;
