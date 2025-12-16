import Link from "next/link";

export type TableColumn = {
  header: string;
  accessor: string;
  className?: string;

  // Optional sorting
  sortable?: boolean;
  sortKey?: string;
};

export type TableSortState = {
  field?: string;
  order?: "asc" | "desc";
  basePath: string;
  params: Record<string, string | undefined>;
};

type TableProps = {
  columns: TableColumn[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;

  // Optional
  sort?: TableSortState;
};

const Table = ({ columns, data, renderRow, sort }: TableProps) => {
  return (
    <table className="w-full mt-4 border-collapse">
      <thead>
        <tr className="text-left text-gray-500 text-sm border-b">
          {columns.map((col) => {
            const isSortable = Boolean(sort && col.sortable && col.sortKey);

            const isActive = isSortable && sort?.field === col.sortKey;

            const nextOrder =
              isActive && sort?.order === "asc" ? "desc" : "asc";

            return (
              <th
                key={col.accessor}
                className={`px-3 py-2 font-medium ${col.className ?? ""} ${
                  isSortable ? "cursor-pointer select-none" : ""
                }`}
              >
                {isSortable ? (
                  <Link
                    href={{
                      pathname: sort!.basePath,
                      query: {
                        ...sort!.params,
                        sort: col.sortKey,
                        order: nextOrder,
                      },
                    }}
                    className="inline-flex items-center gap-1"
                  >
                    <span>{col.header}</span>

                    <span className="text-base font-bold opacity-70">
                      {!isActive && "⇅"}
                      {isActive && sort?.order === "asc" && "↑"}
                      {isActive && sort?.order === "desc" && "↓"}
                    </span>
                  </Link>
                ) : (
                  col.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="text-center text-sm text-gray-400 py-8"
            >
              No records found
            </td>
          </tr>
        ) : (
          data.map((item) => renderRow(item))
        )}
      </tbody>
    </table>
  );
};

export default Table;
