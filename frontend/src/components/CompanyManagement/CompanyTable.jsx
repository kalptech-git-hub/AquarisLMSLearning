import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FiBookOpen, FiEdit, FiEdit2, FiEye, FiLayers } from "react-icons/fi";
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

// Columns pinned on the left on phone widths while the rest scroll horizontally
const STICKY_COLUMN_IDS = ["index", "company_name"];

const CompanyTable = ({ companies, loading, handleView, handleEdit }) => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const navigate = useNavigate();

    const getCompanyStatus = (company) => {
        return company.is_active === 1 ? "active" : "inactive";
    };

    const filteredData = useMemo(() => {
        return companies.filter((company) => {

            const searchText = globalFilter.toLowerCase();

            const matchesSearch =
                company.company_name?.toLowerCase().includes(searchText) ||
                company.company_email?.toLowerCase().includes(searchText) ||
                company.company_mobile_no?.toLowerCase().includes(searchText) ||
                company.company_address?.toLowerCase().includes(searchText) ||
                company.assigned_trainings?.some((training) =>
                    training.training_title?.toLowerCase().includes(searchText)
                );


            const matchesStatus =
                statusFilter === "all" ||
                getCompanyStatus(company) === statusFilter;

            return matchesSearch && matchesStatus;
        });

    }, [companies, globalFilter, statusFilter]);


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
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
    ];

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getAssignedTrainings = (company) =>
        company.assigned_trainings || [];

    const columns = useMemo(
        () => [
            {
                header: "Sr. No.",
                accessorKey: "index",
                cell: (info) => info.row.index + 1,
                enableSorting: false,
            },

            {
                header: "Company",
                accessorKey: "company_name",
            },

            {
                header: "Email",
                accessorKey: "company_email",
                cell: ({ getValue }) => (
                    <div className="min-w-[230px] whitespace-nowrap">
                        {getValue()}
                    </div>
                ),
            },
            {
                header: "Mobile",
                accessorKey: "company_mobile_no",
                size: 140,
            },     

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

                cell: ({ row }) => (

                    <div className="flex items-center gap-2">

                        <button
                            onClick={() =>
                                handleView(row.original)
                            }
                            title="View companye"
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                            <FiEye className="text-lg" />
                        </button>

                        {/* <button
                            onClick={() =>
                                handleEdit(row.original)
                            }
                            title="Edit company"

                            className="text-amber-600 hover:text-amber-900 cursor-pointer"
                        >
                            <FiEdit className="text-lg" />
                        </button> */}
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

            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading company table...</span>
            </div>
        );
    }

    // Helper: is this column one of the ones pinned on phone widths
    const isStickyCol = (colId) => STICKY_COLUMN_IDS.includes(colId);

    // Left offset for the second sticky column (Training) = width of the Sr. No column (56px, set via min-w below)
    const stickyLeftOffset = (colId) => (colId === "company_name" ? "110px" : "0px");


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
                        // was: className="border rounded-lg px-4 py-2 w-full lg:w-1/2 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        className="border rounded-lg pl-10 py-2 w-full placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 min-h-[44px]"
                    />
                </div>

                {/* was: className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border border-slate-200 bg-white" */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm border border-slate-200 bg-white justify-between sm:justify-start">
                    <span className="text-sm font-semibold text-slate-600">
                        Total Companies:
                    </span>

                    <span className="text-base font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {companies.length}
                    </span>
                </div>

                <Select
                    value={statusOptions.find((option) => option.value === statusFilter)}
                    onChange={(selectedOption) => setStatusFilter(selectedOption.value)}
                    options={statusOptions}
                    // was: className="react-select-container w-38"
                    className="react-select-container w-full lg:w-38"
                    classNamePrefix="react-select"
                    // was: styles={selectStyles}
                    styles={{ ...selectStyles, menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    menuPlacement="auto"
                    menuPosition="fixed"
                    // was: (menuPortalTarget missing on this instance — status filter select already has it)
                    menuPortalTarget={document.body}
                    // className="react-select-container"
                    // classNamePrefix="react-select"
                    // className="w-20" // Add a fixed width if needed
                    isSearchable={false} // Disable search for this simple selector
                />
            </div>

            {/* Table */}
            {/* was: <div className="overflow-x-auto"> */}
            <div className="overflow-x-auto rounded-xl shadow-md">
                {/* was: <table className="min-w-full bg-white rounded-xl shadow-md"> */}
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
                                            style={sticky ? { left: stickyLeftOffset(header.column.id) } : undefined}

                                            className={`px-4 sm:px-6 py-3 text-left text-sm font-semibold tracking-wide whitespace-nowrap
                                                ${header.column.getCanSort()
                                                    ? "cursor-pointer hover:bg-slate-800"
                                                    : ""
                                                }
                                                ${header.column.getIsSorted()
                                                    ? "bg-slate-900 text-yellow-300"
                                                    : ""
                                                }
                                                ${sticky ? "sticky z-20 bg-slate-900" : ""}
                                                ${header.column.id === "index" ? "w-[110px] min-w-[110px] max-w-[110px]" : ""}
                                                ${header.column.id === "training_title" ? "min-w-[150px] shadow-[2px_0_4px_rgba(0,0,0,0.15)]" : ""}
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
                                    className="hover:bg-gray-50 group"
                                >

                                    {row.getVisibleCells().map((cell) => {
                                        const sticky = isStickyCol(cell.column.id);
                                        return (

                                            <td
                                                key={cell.id}
                                                style={sticky ? { left: stickyLeftOffset(cell.column.id) } : undefined}
                                                // was: className="px-6 py-4 text-sm"
                                                className={`px-4 sm:px-6 py-4 text-sm
                                                    ${sticky ? "sticky z-10 bg-white group-hover:bg-gray-50" : ""}
                                                    ${cell.column.id === "index" ? "w-[110px] min-w-[110px] max-w-[110px]" : ""}
                                                    ${cell.column.id === "training_title" ? "min-w-[150px] font-medium shadow-[2px_0_4px_rgba(0,0,0,0.06)]" : ""}
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
                                    No companies found.
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>
            </div>

            {/* Swipe hint — only shown on phone widths where columns actually overflow */}
            <div className="flex sm:hidden items-center gap-1.5 text-xs text-slate-400 -mt-2">
                <ArrowLeft size={12} className="rotate-180" />
                <span>
                    Swipe to see Company, Courses, User Limit, Expiry Date and Status                </span>
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
    )
};
export default CompanyTable;