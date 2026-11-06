import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FiBookOpen, FiEdit, FiEdit2, FiEye, FiLayers, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from "@tanstack/react-table";
import { selectStyles } from "../../utils/selectStyles.js";

const CourseTable = ({ courses, loading, handleEdit, handleView }) => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });

    const navigate = useNavigate();

    const filteredData = useMemo(() => {
        return courses.filter((course) => {

            const searchText = globalFilter.toLowerCase();

            const matchesSearch =
                // course.training_title?.toLowerCase().includes(searchText) ||
                course.course_name?.toLowerCase().includes(searchText) ||
                course.course_code?.toLowerCase().includes(searchText) ||
                course.course_level?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                course.is_active === statusFilter;

            // const matchesStatus =
            //     statusFilter === "all" ||
            //     Number(course.is_active) === Number(statusFilter);


            // const matchesStatus =
            //     statusFilter === "all" ||
            //     course.is_active === parseInt(statusFilter);

            return matchesSearch && matchesStatus;
        })
            .sort(
                (a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
            );

    }, [courses, globalFilter, statusFilter]);

    const [currentPageSize, setCurrentPageSize] = useState(20); // Default to 20 rows per page
    const [currentPage, setCurrentPage] = useState(1); // Current page number

    // Sticky-column widths (phone horizontal-scroll pattern, matches TrainingTable.jsx
    // and StudentEnrollmentTable.jsx). Sr. No is pinned at left: 0, Course name is
    // pinned right after it.
    const STICKY_COL_1_WIDTH = 56; // Sr. No
    const STICKY_COL_2_WIDTH = 150; // Course
    const STICKY_COL_2_LEFT = STICKY_COL_1_WIDTH;

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
                header: "Sr. No.",
                accessorKey: "index",
                cell: (info) => info.row.index + 1,
                enableSorting: false,
                size: 56,
            },

            {
                header: "Course Category",
                accessorKey: "course_name",
            },

            {
                header: "Code",
                accessorKey: "course_code",
            },

            {
                header: "Level",
                accessorKey: "course_level",
            },
            // {
            //     header: "Status",
            //     accessorKey: "is_active",

            //     cell: ({ getValue }) => {

            //         const value = getValue();
            //         return (
                        
            //             <span
            //                 className={`inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${value === 1
            //                     ? "bg-green-100 text-green-800"
            //                     : "bg-red-100 text-red-800"
            //                     }`}
            //             >
            //                 {value === 1
            //                     ? "Active"
            //                     : "Inactive"}
            //             </span>
            //         );

            //     },
            // },

            {
                header: "Actions",
                sortDescFirst: false,
                cell: ({ row }) => (

                    <div className="flex items-center gap-2">

                        <button
                            onClick={() =>
                                handleView(row.original)
                            }
                            title="View course category"
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                            <FiEye className="text-lg" />
                        </button>

                        <button
                            onClick={() =>
                                handleEdit(row.original)
                            }
                            title="Edit course category"

                            className="text-amber-600 hover:text-amber-900 cursor-pointer"
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

        sortDescFirst: false,
    });

    if (loading) {
        return (
            // <div className="flex justify-center py-10">
            //     Loading...
            // </div>

            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading course category table...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 text-emerald-600 cursor-pointer hover:underline mb-4"
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
                        className="border rounded-lg pl-10 pr-4 py-2 w-full placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>


                <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border border-slate-200 bg-white">
                    <span className="text-sm font-semibold text-slate-600">
                        Total Categories:
                    </span>

                    <span className="text-base font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {courses.length}
                    </span>
                </div>

                {/* was:
                <Select
                    value={statusOptions.find((option) => option.value === statusFilter)}
                    onChange={(selectedOption) => setStatusFilter(selectedOption.value)}
                    options={statusOptions}
                    className="react-select-container w-38"
                    classNamePrefix="react-select"
                    styles={selectStyles}
                />
                */}
                {/* w-38 is not a valid Tailwind width class (no "38" step in the default
                    scale), same issue found and fixed in StudentEnrollmentTable.jsx.
                    Also added the react-select portal fix so the open menu doesn't get
                    clipped by the table's overflow-x-auto wrapper on phone, matching
                    TrainingTable.jsx / StudentEnrollmentTable.jsx. */}
                {/* <Select
                    value={statusOptions.find((option) => option.value === statusFilter)}
                    onChange={(selectedOption) => setStatusFilter(selectedOption.value)}
                    options={statusOptions}
                    className="react-select-container w-full lg:w-56"
                    classNamePrefix="react-select"
                    styles={{ ...selectStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                /> */}
            </div>

            {/* Table */}
            {/* was: <div className="overflow-x-auto"> */}
            <div className="w-full max-w-full overflow-x-auto rounded-xl shadow-md">
                <table className="min-w-full bg-white">

                    <thead className="bg-slate-900 text-white">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>

                                {headerGroup.headers.map((header) => {

                                    // Sticky-column pattern (matches TrainingTable.jsx /
                                    // StudentEnrollmentTable.jsx): pin Sr. No and Course
                                    // so they stay visible while Code / Level / Status /
                                    // Actions scroll horizontally underneath on phone.
                                    const isSticky =
                                        header.column.id === "index" ||
                                        header.column.id === "course_name";
                                    const stickyLeft =
                                        header.column.id === "index"
                                            ? 0
                                            : header.column.id === "course_name"
                                                ? STICKY_COL_2_LEFT
                                                : undefined;
                                    const stickyWidth =
                                        header.column.id === "index"
                                            ? STICKY_COL_1_WIDTH
                                            : header.column.id === "course_name"
                                                ? STICKY_COL_2_WIDTH
                                                : undefined;

                                    return (

                                        <th
                                            key={header.id}
                                            onClick={
                                                header.column.getCanSort()
                                                    ? header.column.getToggleSortingHandler()
                                                    : undefined
                                            }
                                            // was:
                                            // className={`px-6 py-3 text-left text-sm font-semibold tracking-wide
                                            //                 ${header.column.getCanSort()
                                            //         ? "cursor-pointer hover:bg-slate-800"
                                            //         : ""
                                            //     }
                                            //                 ${header.column.getIsSorted()
                                            //         ? "bg-slate-900 text-yellow-300"
                                            //         : ""
                                            //     }`}
                                            className={`px-6 py-3 text-left text-sm font-semibold tracking-wide
                                                            ${header.column.getCanSort()
                                                    ? "cursor-pointer hover:bg-slate-800"
                                                    : ""
                                                }
                                                            ${header.column.getIsSorted()
                                                    ? "bg-slate-900 text-yellow-300"
                                                    : ""
                                                }
                                                            ${isSticky
                                                    ? "sticky z-20 bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.25)]"
                                                    : ""
                                                }`}
                                            style={
                                                isSticky
                                                   ? { left: `${stickyLeft}px`, minWidth: `${stickyWidth}px` }
                                                    : undefined
                                            }
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
                                    // was:
                                    // className="hover:bg-gray-50"
                                    className="hover:bg-gray-50 group"
                                >

                                    {row.getVisibleCells().map((cell) => {

                                        // Sticky-column pattern: same two columns pinned as in thead above.
                                        const isSticky =
                                            cell.column.id === "index" ||
                                            cell.column.id === "course_name";
                                        const stickyLeft =
                                            cell.column.id === "index"
                                                ? 0
                                                : cell.column.id === "course_name"
                                                    ? STICKY_COL_2_LEFT
                                                    : undefined;
                                        const stickyWidth =
                                            cell.column.id === "index"
                                                ? STICKY_COL_1_WIDTH
                                                : cell.column.id === "course_name"
                                                    ? STICKY_COL_2_WIDTH
                                                    : undefined;

                                        return (

                                            <td
                                                key={cell.id}
                                                // was:
                                                // className="px-6 py-4 text-sm"
                                                className={`px-6 py-4 text-sm ${isSticky
                                                    ? "sticky z-10 bg-white group-hover:bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]"
                                                    : ""
                                                    }`}
                                                style={
                                                    isSticky
                                                        ? { left: `${stickyLeft}px`, minWidth: `${stickyWidth}px` }
                                                        : undefined
                                                }
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
                                    No course categories found.
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>
            </div>

            {/* Swipe hint - phone only, mirrors TrainingTable.jsx / StudentEnrollmentTable.jsx pattern */}
            <div className="flex sm:hidden items-center gap-1.5 text-xs text-slate-500 px-1">
                <ArrowLeft size={12} className="rotate-180" />
                <span>Swipe to see Code, Level, Status, Actions</span>
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
                    {/* was:
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
                        styles={selectStyles}
                        menuPlacement="auto"
                        menuPosition="fixed"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        // className="w-20" // Add a fixed width if needed
                        isSearchable={false} // Disable search for this simple selector
                    />
                    */}
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
                        styles={{ ...selectStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        menuPlacement="auto"
                        menuPosition="fixed"
                        menuPortalTarget={document.body}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        // className="w-20" // Add a fixed width if needed
                        isSearchable={false} // Disable search for this simple selector
                    />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
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

export default CourseTable;