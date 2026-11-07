import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { FiEdit, FiEdit2, FiEye } from "react-icons/fi";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { selectStyles } from "../../utils/selectStyles.js";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";

// Columns pinned on the left on phone widths while the rest scroll horizontally
const STICKY_COLUMN_IDS = ["index", "user_full_name"];

const EmployeeTable = ({ employees = [], loading, handleView, handleEdit }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const filteredData = useMemo(() => {
    return employees.filter((emp) => {
      const search = searchTerm.toLowerCase();
      const name = (emp.user_full_name || emp.name || "").toLowerCase();
      const email = (emp.user_email || emp.email || "").toLowerCase();
      const code = (emp.emp_code || emp.employee_code || "").toLowerCase();


      const matchesSearch =
        name.includes(search) || email.includes(search) || code.includes(search);

      const matchesStatus =
        statusFilter === "all" || String(emp.is_active) === String(statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  const [currentPageSize, setCurrentPageSize] = useState(20); // Default to 20 rows per page
  const [currentPage, setCurrentPage] = useState(1); // Current page number

  // Handler for page size change
  const handlePageSizeChange = (newSize) => {
    setCurrentPageSize(newSize);
    setCurrentPage(1);
    setPagination((prev) => ({
      ...prev,
      pageSize: newSize,
      pageIndex: 0,
    }));
  };


  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: 1, label: "Active" },
    { value: 0, label: "Inactive" },
  ];

  const columns = useMemo(
    () => [
      {
        // header: "Sr. No",
        header: () => (
          <div className="w-8 text-center">
            Sr. No.
          </div>
        ),
        accessorKey: "index",
        // cell: (info) => info.row.index + 1,
        cell: (info) => (
          <div className="w-8 text-center">
            {info.row.index + 1}
          </div>
        ),
        size: 50,
        enableSorting: false,
      },

      {
        header: "Name",
        accessorKey: "user_full_name",
      },

      // {
      //     header: "Email",
      //     accessorKey: "user_email",
      // },

      {
        header: "Email",
        accessorKey: "user_email",
        cell: ({ getValue }) => (
          <div className="min-w-[260px] whitespace-nowrap">
            {getValue()}
          </div>
        ),
      },
      {
        header: "Mobile",
        accessorKey: "user_mobile_no",
        size: 140,
      },
      // {
      //     header: "Role",
      //     accessorKey: "role_name",
      // },


      {
        header: "Status",
        accessorKey: "is_active",

        cell: ({ getValue }) => {

          const value = getValue();
          // console.log(value, typeof value);
          return (
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${value === 1
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
                }`}
            >
              {value === 1
                ? "Active"
                : "Inactive"}
            </span>
          );

        },
      },

      {
        header: "Actions",
        size: 80,

        cell: ({ row }) => (

          <div className="flex items-center justify-center gap-1">

            <button
              onClick={() =>
                handleView(row.original)
              }
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
              title="View Instructor"
            >
              <FiEye className="text-lg" />
            </button>

            <button
              onClick={() =>
                handleEdit(row.original)
              }
              className="text-amber-600 hover:text-amber-900 cursor-pointer"
              title="Edit Instructor"
            >
              <FiEdit className="text-lg" />
            </button>

          </div>

        ),

        enableSorting: false,
      },

    ],
    [handleEdit, handleView]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });


  if (loading) {
    return (
      // <div className="flex justify-center py-10">
      //     Loading...
      // </div>

      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading employees table...</span>
      </div>
    );
  }

  // Helper: is this column one of the ones pinned on phone widths
  const isStickyCol = (colId) => STICKY_COLUMN_IDS.includes(colId);

  // Left offset for the second sticky column (Name) = width of the Sr. No column (56px, set via min-w below)
  const stickyLeftOffset = (colId) => (colId === "user_full_name" ? "56px" : "0px");

  return (    
    <div className="space-y-4">

      <button
        onClick={() => navigate("/company/dashboard")}
        // was: className="flex items-center gap-2 text-emerald-600 cursor-pointer hover:underline"
        className="flex items-center gap-2 text-emerald-600 cursor-pointer hover:underline mt-4"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>


      {/* Top Filters */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex items-center w-full lg:w-1/2">
          <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />

          <input
            type="text"
            placeholder="Search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            // className="border rounded-lg px-4 py-2 w-full lg:w-1/2 focus:outline-none focus:ring-1 focus:ring-slate-500"
            className="border rounded-lg pl-10 py-2 w-full placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>


        <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border border-slate-200 bg-white">
          <span className="text-sm font-semibold text-slate-600">
            Total Employees:
          </span>

          <span className="text-base font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {employees.length}
            {/* 2 */}
          </span>
        </div>

        {/* <select className="border rounded-lg px-4 py-2">
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Inactive</option>
                </select> */}

        <Select
          value={statusOptions.find((option) => option.value === statusFilter)}
          onChange={(selectedOption) => setStatusFilter(selectedOption.value)}
          options={statusOptions}
          // was: className="react-select-container w-38"
          className="react-select-container w-full lg:w-38"
          classNamePrefix="react-select"
          // was: styles={selectStyles}
          styles={{ ...selectStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>


      {/* Table */}
      {/* was: <div className="w-full max-w-full overflow-x-auto"> */}
      <div className="w-full max-w-full overflow-x-auto rounded-xl shadow-md">

        {/* <table className="min-w-full bg-white rounded-xl shadow-md"> */}
        <table className="min-w-full bg-white">

          <thead className="bg-slate-900 text-white">
            {table.getHeaderGroups().map((headerGroup) => (

              <tr key={headerGroup.id}>

                {headerGroup.headers.map((header) => {

                  const sticky = isStickyCol(header.column.id);

                  return (

                    <th
                      key={header.id}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      style={
                        sticky
                          ? { left: stickyLeftOffset(header.column.id) }
                          : undefined
                      }
                      // was: className={`px-6 py-3 text-left text-sm font-semibold tracking-wide
                      //     ${header.column.getCanSort()
                      //         ? "cursor-pointer hover:bg-slate-800"
                      //         : ""
                      //     }
                      //     ${header.column.getIsSorted()
                      //         ? "bg-slate-900 text-yellow-300"
                      //         : ""
                      //     }`}
                      className={`px-4 sm:px-6 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap
                                                ${header.column.getCanSort()
                          ? "cursor-pointer hover:bg-slate-800"
                          : ""
                        }
                                                ${header.column.getIsSorted()
                          ? "bg-slate-900 text-yellow-300"
                          : ""
                        }
                                                ${sticky
                          ? "sticky z-20 bg-slate-900"
                          : ""
                        }
                                                ${header.column.id === "index"
                          ? "min-w-[56px]"
                          : ""
                        }
                                                ${header.column.id === "user_full_name"
                          ? "min-w-[150px] shadow-[2px_0_4px_rgba(0,0,0,0.15)]"
                          : ""
                        }
                                            `}
                    >

                      <div className="flex items-center gap-1">

                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                        {header.column.getCanSort() && (
                          <span className="text-xs">

                            {header.column.getIsSorted() === "asc" && "▲"}

                            {header.column.getIsSorted() === "desc" && "▼"}

                            {header.column.getIsSorted() === false && (
                              <span className="opacity-40">⇅</span>
                            )}

                          </span>
                        )}

                      </div>

                    </th>

                  );

                })}

              </tr>

            ))}
          </thead>


          <tbody className="divide-y divide-gray-200">

            {table.getRowModel().rows.length > 0 ? (

              table.getRowModel().rows.map((row) => (

                <tr
                  key={row.id}
                  id={`instructor-${row.original.instructor_id}`}
                  // was: className="hover:bg-gray-50"
                  className={`group hover:bg-gray-50"`}
                >

                  {row.getVisibleCells().map((cell) => {

                    const sticky = isStickyCol(cell.column.id);

                    return (

                      <td
                        key={cell.id}
                        style={
                          sticky
                            ? { left: stickyLeftOffset(cell.column.id) }
                            : undefined
                        }
                        // was: className="px-6 py-4 text-sm"
                        className={`px-4 sm:px-6 py-4 text-sm
                               ${sticky
                              ? "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] bg-white group-hover:bg-gray-50"
                              : ""
                            
                          }
                                                    ${cell.column.id === "index"
                            ? "min-w-[56px]"
                            : ""
                          }
                                                    ${cell.column.id === "user_full_name"
                            ? "min-w-[150px] font-medium shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
                            : ""
                          }
                                                `}
                      >

                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}

                      </td>

                    );

                  })}

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  No employees found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* Swipe hint — only shown on phone widths where columns actually overflow */}
      <div className="flex sm:hidden items-center gap-1.5 text-xs text-slate-400 -mt-2">
        <ArrowLeft size={12} className="rotate-180" />
        <span>Swipe to see Email, Mobile, Status, Actions</span>
      </div>


      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm gap-4">

        {/* For paging entries */}
        <div>
          {(() => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const totalRows = table.getFilteredRowModel().rows.length; // filtered or full data
            const startRow = pageIndex * pageSize + 1;
            const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

            return (
              // <>
              // Showing {startRow} to {endRow} of {totalRows} entries
              // </>
              <div className="text-gray-600">
                Showing
                <span className="font-semibold text-gray-900"> {startRow}</span>
                {" "}to{" "}
                <span className="font-semibold text-gray-900">{endRow}</span>
                {" "}of{" "}
                <span className="font-semibold text-red-600">{totalRows}</span>
                {" "}entries
              </div>
            );
          })()}
        </div>


        <div className="flex items-center gap-3">
          {/* <span>Rows per page:</span> */}
          <span className="text-gray-600 font-medium">
            Rows per page
          </span>

          <Select
            options={[5, 10, 20, 50].map((size) => ({
              value: size,
              label: size.toString(),
            }))}
            value={{
              value: currentPageSize,
              label: currentPageSize.toString(),
            }}
            onChange={(selectedOption) =>
              handlePageSizeChange(selectedOption.value)
            }
            // was: styles={selectStyles}
            styles={{ ...selectStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            menuPlacement="auto"
            menuPosition="fixed"
            // was: (menuPortalTarget was missing — this is the actual fix for the overlap seen in the screenshot)
            menuPortalTarget={document.body}
            className="react-select-container"
            classNamePrefix="react-select"
            // className="w-20" // Add a fixed width if needed
            isSearchable={false} // Disable search for this simple selector
          />
        </div>


        {/* was: className="flex items-center gap-1 flex-wrap" — same off-screen
                    button clipping bug as StudentEnrollmentTable.jsx (see that file's
                    comment for the full explanation); same fix applied here. */}
        <div className="flex items-center gap-1 flex-wrap w-full sm:w-auto justify-center sm:justify-start">

          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            // className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
            className="px-3 py-1.5 border border-slate-300 rounded-md
                                bg-white hover:bg-slate-100 hover:border-red-500 transition-all
                                    duration-200 cursor-pointer disabled:opacity-40"
          >
            {"<<"}
          </button>

          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            // className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white
                                hover:bg-slate-100 hover:border-red-500 transition-all
                                duration-200 cursor-pointer disabled:opacity-40"
          >
            {"<"}
          </button>


          {Array.from({ length: table.getPageCount() }, (_, i) => i)
            .filter((i) => {
              const current = table.getState().pagination.pageIndex;
              return (
                i === 0 ||
                i === table.getPageCount() - 1 ||
                Math.abs(current - i) <= 2
              );
            })
            .reduce((acc, page, i, arr) => {
              if (i > 0 && page - arr[i - 1] > 1) acc.push("...");
              acc.push(page);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => table.setPageIndex(p)}
                  // className={`px-3 py-1.5 rounded-md bg-red-600 text-white font-semibold shadow-sm
                  //     ${table.getState().pagination.pageIndex === p
                  //         ? "bg-red-600 text-white"
                  //         : "bg-white"
                  //     }`}
                  className={`px-3 py-1.5 rounded-md font-semibold shadow-sm transition-all duration-200 cursor-pointer
                                    ${table.getState().pagination.pageIndex === p
                      ? "bg-red-600 text-white"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 hover:border-red-500"
                    }`}
                >
                  {p + 1}
                </button>
              )
            )}


          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            // className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-100
                                hover:border-red-500 transition-all duration-200 cursor-pointer disabled:opacity-40"
          >
            {">"}
          </button>

          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            // className="px-2 py-1 border rounded disabled:opacity-50 cursor-pointer"
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-100
                                hover:border-red-500 transition-all duration-200 cursor-pointer disabled:opacity-40"
          >
            {">>"}
          </button>

        </div>

      </div>

    </div>

  );
};

export default EmployeeTable;