"use server";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Role } from "@prisma/client";
import Image from "next/image";
import { getSession } from "@/lib/sessions";

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
};

type SortField = "student" | "score" | "class" | "date";
type SortOrder = "asc" | "desc";

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getSession();
  const currentUser = session?.user;

  if (!currentUser) return <div className="p-4">Unauthorized</div>;

  const role = currentUser.role;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sortField = searchParams.sort as SortField | undefined;
  const sortOrder: SortOrder = searchParams.order === "desc" ? "desc" : "asc";

  // Build base query
  const query: Prisma.ResultWhereInput = {};

  // Role-based filtering
  switch (role) {
    case Role.TEACHER:
      query.OR = [
        { exam: { period: { teacherId: currentUser.id } } },
        { assignment: { period: { teacherId: currentUser.id } } },
      ];
      break;
    case Role.STUDENT:
      query.studentId = currentUser.id;
      break;
    case Role.PARENT:
      query.student = { parentId: currentUser.id };
      break;
    case Role.ADMIN:
    default:
      break;
  }

  // Search filter
  if (searchParams.search) {
    query.OR = [
      ...(query.OR ?? []),
      {
        exam: { title: { contains: searchParams.search, mode: "insensitive" } },
      },
      {
        assignment: {
          title: { contains: searchParams.search, mode: "insensitive" },
        },
      },
      {
        student: {
          name: { contains: searchParams.search, mode: "insensitive" },
        },
      },
      {
        student: {
          surname: { contains: searchParams.search, mode: "insensitive" },
        },
      },
    ];
  }
  if (searchParams.studentId) query.studentId = searchParams.studentId;

  // Sorting: Prisma cannot combine nullable relations in one object, so handle separately
  let orderBy: Prisma.ResultOrderByWithRelationInput[] = [{ id: "asc" }];
  if (sortField) {
    switch (sortField) {
      case "student":
        orderBy = [{ student: { name: sortOrder } }, { id: "asc" }];
        break;
      case "score":
        orderBy = [{ score: sortOrder }, { id: "asc" }];
        break;
      case "class":
        // Separate ordering for exams and assignments
        orderBy = [
          { exam: { period: { class: { name: sortOrder } } } },
          { assignment: { period: { class: { name: sortOrder } } } },
          { id: "asc" },
        ];
        break;
      case "date":
        orderBy = [
          { exam: { startTime: sortOrder } },
          { assignment: { startDate: sortOrder } },
          { id: "asc" },
        ];
        break;
    }
  }

  // Fetch results with count in a transaction
  const [results, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            period: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            period: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
      orderBy,
    }),
    prisma.result.count({ where: query }),
  ]);

  // Normalize mixed results (exam or assignment)
  const data: ResultList[] = results
    .map((item) => {
      const assessment = item.exam || item.assignment;
      if (!assessment) return null;
      const isExam = "startTime" in assessment;
      return {
        id: item.id,
        title: assessment.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: assessment.period.teacher.name,
        teacherSurname: assessment.period.teacher.surname,
        score: item.score,
        className: assessment.period.class.name,
        startTime: isExam ? assessment.startTime : assessment.startDate,
      };
    })
    .filter(Boolean) as ResultList[];

  const columns = [
    { header: "Title", accessor: "title" },
    {
      header: "Student",
      accessor: "student",
      sortable: true,
      sortKey: "student",
    },
    {
      header: "Score",
      accessor: "score",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "score",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "class",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
      sortable: true,
      sortKey: "date",
    },
    ...(role === Role.ADMIN || role === Role.TEACHER
      ? [{ header: "Actions", accessor: "action" }]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.title}</td>
      <td>
        {item.studentName} {item.studentSurname}
      </td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">
        {item.teacherName} {item.teacherSurname}
      </td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
          item.startTime
        )}
      </td>
      {(role === Role.ADMIN || role === Role.TEACHER) && (
        <td className="flex gap-2">
          <FormContainer table="result" type="update" data={item} />
          <FormContainer table="result" type="delete" id={item.id} />
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
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
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={data}
        renderRow={renderRow}
        sort={{
          field: sortField,
          order: sortOrder,
          basePath: "/list/results",
          params: searchParams,
        }}
      />

      <Pagination page={page} count={count} />
    </div>
  );
};

export default ResultListPage;
