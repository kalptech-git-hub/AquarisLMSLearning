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

import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useEffect } from "react";

const StudentEnrollmentTable = ({ enrollments, loading, handleView, highlightedEnrollment }) => {

    const [globalFilter, setGlobalFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });

    const navigate = useNavigate();


    const filteredData = useMemo(() => {
        return enrollments.filter((enrollment) => {
            const search = globalFilter.toLowerCase();
            const matchesSearch =
                enrollment.user_full_name?.toLowerCase().includes(search) ||
                enrollment.user_email?.toLowerCase().includes(search) ||
                enrollment.user_mobile_no?.includes(search) ||
                enrollment.course_name?.toLowerCase().includes(search) ||
                enrollment.training_title?.toLowerCase().includes(search);

            const matchesStatus =
                statusFilter === "all" ||
                enrollment.enroll_status === statusFilter;

            return matchesSearch && matchesStatus;

        });

    }, [enrollments, globalFilter, statusFilter]);
    const [currentPageSize, setCurrentPageSize] = useState(20); // Default to 20 rows per page
    const [currentPage, setCurrentPage] = useState(1); // Current page number

    // Sticky-column widths (phone horizontal-scroll pattern, matches TrainingTable.jsx).
    // Sr. No is pinned at left: 0, Student Name is pinned right after it.
    const STICKY_COL_1_WIDTH = 100; // Sr. No
    const STICKY_COL_2_WIDTH = 160; // Student Name
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
        { value: "P", label: "Pending" },
        { value: "A", label: "Approved" },
        { value: "R", label: "Rejected" },
    ];

    const columns = useMemo(
        () => [
            {
                header: () => (
                    <div className="text-center whitespace-nowrap">
                        Sr. No.
                    </div>
                ),
                accessorKey: "index",
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

            {
                header: "Email",
                accessorKey: "user_email",
                cell: ({ getValue }) => (
                    <div className="min-w-[250px] whitespace-nowrap">
                        {getValue()}
                    </div>
                ),
            },

            {
                header: "Mobile",
                accessorKey: "user_mobile_no",
                size: 140,
            },

            {
                header: "Course Category",
                accessorKey: "course_name",
                cell: ({ getValue }) => {
                    const value = getValue() || "";
                    return value.length > 25
                        ? `${value.substring(0, 25)}...`
                        : value;
                },
            },

            {
                header: "Course",
                accessorKey: "training_title",
                cell: ({ getValue }) => {
                    const value = getValue() || "";
                    return value.length > 25
                        ? `${value.substring(0, 25)}...`
                        : value;
                },
            },

            // {
            //     header: "Instructor",
            //     accessorKey: "instructor_names",
            //     cell: ({ getValue }) => (
            //         <div className="min-w-[180px]">
            //             {getValue() || "-"}
            //         </div>
            //     ),
            // },

            {
                header: "Status",
                accessorKey: "enroll_status",

                cell: ({ getValue }) => {

                    const status = getValue();

                    const colors = {
                        P: "bg-yellow-100 text-yellow-800",
                        A: "bg-green-100 text-green-800",
                        R: "bg-red-100 text-red-800",
                    };

                    const labels = {
                        P: "Pending",
                        A: "Approved",
                        R: "Rejected",
                    };

                    return (
                        // was:
                        // <span
                        //     className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors[status]}`}
                        // >
                        //     {labels[status]}
                        // </span>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${colors[status]}`}
                        >
                            {labels[status]}
                        </span>
                    );
                },
            },

            {
                header: "Applied On",
                accessorKey: "created_at",
                cell: ({ getValue }) => {
                    const date = new Date(getValue());

                    return date.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    });
                },
            },

            {
                header: "Actions",
                size: 80,

                cell: ({ row }) => (

                    <div className="flex items-center justify-center">

                        <button
                            onClick={() => handleView(row.original)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="View Student Enrollment"
                        >
                            <FiEye className="text-lg" />
                        </button>

                    </div>

                ),

                enableSorting: false,
            },

        ],
        [handleView]
    );

    useEffect(() => {

        if (!highlightedEnrollment) return;

        const rowIndex = filteredData.findIndex(
            enrollment =>
                Number(enrollment.enroll_id) ===
                Number(highlightedEnrollment)
        );

        if (rowIndex === -1) return;

        const pageSize = pagination.pageSize;
        const targetPage = Math.floor(rowIndex / pageSize);

        setPagination(prev => ({
            ...prev,
            pageIndex: targetPage
        }));

    }, [
        highlightedEnrollment,
        filteredData,
        pagination.pageSize
    ]);

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
                <span className="ml-3 text-gray-600 font-medium">Loading enrollment table...</span>
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
                        className="border rounded-lg pl-10 py-2 w-full placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>


                <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border border-slate-200 bg-white">
                    <span className="text-sm font-semibold text-slate-600">
                        Total Enrollments:
                    </span>

                    <span className="text-base font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {enrollments.length}
                        {/* 2 */}
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
                {/* was: className="react-select-container w-38" — w-38 is not a valid
                    Tailwind width class (the default scale has no "38" step), so it
                    applied no width at all. On phone it only *looked* full-width because
                    the flex-col parent's default align-items:stretch stretched it; on
                    lg:flex-row it shrank to min-content instead of a controlled width,
                    which is why sizing looked off compared to Training's dropdown. */}
                <Select
                    value={statusOptions.find((option) => option.value === statusFilter)}
                    onChange={(selectedOption) => setStatusFilter(selectedOption.value)}
                    options={statusOptions}
                    className="react-select-container w-full lg:w-56"
                    classNamePrefix="react-select"
                    styles={{ ...selectStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            </div>

            {/* Table */}
            <div className="w-full max-w-full overflow-x-auto rounded-xl shadow-md">
                {/* <table className="min-w-full bg-white rounded-xl shadow-md"> */}
                <table className="min-w-full table-auto bg-white">

                    <thead className="bg-slate-900 text-white">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>

                                {headerGroup.headers.map((header) => {

                                    // Sticky-column pattern: pin Sr. No (index) and Student Name
                                    // so they stay visible while the rest scroll horizontally on phone.
                                    const isSticky =
                                        header.column.id === "index" ||
                                        header.column.id === "user_full_name";
                                    const stickyLeft =
                                        header.column.id === "index"
                                            ? 0
                                            : header.column.id === "user_full_name"
                                                ? STICKY_COL_2_LEFT
                                                : undefined;
                                    const stickyWidth =
                                        header.column.id === "index"
                                            ? STICKY_COL_1_WIDTH
                                            : header.column.id === "user_full_name"
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
                                            className={`px-6 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap
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

                            table.getRowModel().rows.map((row) => {

                                const isHighlighted =
                                    Number(row.original.enroll_id) === highlightedEnrollment;


                                return (
                                    <tr
                                        key={row.id}
                                        id={`enrollment-${row.original.enroll_id}`}
                                        // was:
                                        // className="hover:bg-gray-50"
                                        // className="hover:bg-gray-50 group"
                                        className={`
                                        group transition-colors duration-500
                                        ${Number(row.original.enroll_id) === Number(highlightedEnrollment)
                                                ? "bg-slate-100 ring-2 ring-slate-400 ring-inset"
                                                : "hover:bg-gray-50"
                                            }
                                        `}
                                    >

                                        {row.getVisibleCells().map((cell) => {

                                            // Sticky-column pattern: same two columns pinned as in thead above.
                                            const isSticky =
                                                cell.column.id === "index" ||
                                                cell.column.id === "user_full_name";
                                            const stickyLeft =
                                                cell.column.id === "index"
                                                    ? 0
                                                    : cell.column.id === "user_full_name"
                                                        ? STICKY_COL_2_LEFT
                                                        : undefined;
                                            const stickyWidth =
                                                cell.column.id === "index"
                                                    ? STICKY_COL_1_WIDTH
                                                    : cell.column.id === "user_full_name"
                                                        ? STICKY_COL_2_WIDTH
                                                        : undefined;


                                            return (
                                                <td
                                                    key={cell.id}
                                                    // was:
                                                    // className="px-6 py-4 text-sm"
                                                    // className={`px-6 py-4 text-sm ${isSticky
                                                    //     ? "sticky z-10 bg-white group-hover:bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]"
                                                    //     : ""
                                                    //     }`}

                                                    className={`
                                                    px-6 py-4 text-sm
                                                    ${isSticky
                                                            ? `sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]
                                                        ${isHighlighted
                                                                ? "bg-slate-100"
                                                                : "bg-white group-hover:bg-gray-50"
                                                            }`
                                                            : isHighlighted
                                                                ? "bg-slate-100"
                                                                : ""
                                                        }
                                                `}
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
                                )
                            })

                        ) : (

                            <tr>

                                <td
                                    colSpan={columns.length}
                                    className="text-center py-6 text-gray-500"
                                >
                                    No students found.
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>
            </div>

            {/* Swipe hint - phone only, mirrors TrainingTable.jsx pattern (moved below table per user request) */}
            <div className="flex sm:hidden items-center gap-1.5 text-xs text-slate-500 px-1">
                <ArrowLeft size={12} className="rotate-180" />
                <span>Swipe to see Email, Mobile, Course Category, Course, Status, Applied On, Actions</span>
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
                {/* was: className="flex items-center gap-1 flex-wrap" — with no width
                    constraint from the parent (items-center sizes children to content,
                    not stretched), flex-wrap had no width to wrap within, so the whole
                    button row grew wider than the phone screen. Centered by the parent
                    and clipped symmetrically by the page's overflow-x-hidden, this hid
                    the leftmost buttons (<<, <) off-screen on narrower phones. w-full
                    sm:w-auto gives it a real width to wrap inside on phone; justify-center
                    keeps the wrapped rows looking tidy instead of ragged-left. */}
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

export default StudentEnrollmentTable;