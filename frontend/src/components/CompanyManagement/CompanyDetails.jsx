
import { useState } from "react";
import {
    FiX,
    FiEdit2,
    FiUser,
    FiClock,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBookOpen,
    FiUsers,
    FiCalendar,
} from "react-icons/fi";

const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const CompanyDetails = ({
    company,
    setViewingCompany,
    handleEdit,
}) => {
    const [showAllTrainings, setShowAllTrainings] = useState(false);

    if (!company) return null;

    const assignedTrainings = company.assigned_trainings || [];

    const isActive = Number(company.is_active) === 1;

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-hidden pb-20">

            {/* Header */}
            <div className="p-6 relative">

                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                    <div className="flex flex-col min-w-0 flex-1">

                        <div className="flex items-center gap-3 min-w-0">

                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
                                <span className="text-xl sm:text-2xl font-bold text-red-600">
                                    {company.company_name
                                        ? company.company_name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase()
                                        : "?"}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">

                                <h1 className="text-xl sm:text-3xl font-bold text-gray-800 break-words pr-8 sm:pr-0">
                                    {company.company_name}
                                </h1>

                                <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3">

                                    <span className="px-2.5 py-1 sm:px-3 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                                        <FiMail size={13} />
                                        <span className="break-all">
                                            {company.company_email || "-"}
                                        </span>
                                    </span>

                                    <span
                                        className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${
                                            isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                isActive
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                            }`}
                                        />
                                        {isActive ? "Active" : "Inactive"}
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* Mobile Close */}
                        <div className="absolute top-3 right-3 z-10 sm:hidden">
                            <button
                                onClick={() => setViewingCompany(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                                title="Close"
                            >
                                <FiX aria-hidden="true" />
                            </button>
                        </div>

                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex gap-2 shrink-0">

                        {/* <button
                            onClick={() => handleEdit(company)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2"
                        >
                            <FiEdit2 size={16} />
                            Edit
                        </button> */}

                        <button
                            onClick={() => setViewingCompany(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                            title="Close"
                        >
                            <FiX size={20} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100 pt-4">

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiUser className="text-gray-500 shrink-0" size={16} />

                        <span>
                            Created by{" "}
                            <span className="font-semibold text-gray-800">
                                {company.created_by_name || "Unknown"}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiClock className="text-gray-500 shrink-0" size={16} />

                        <span>
                            Updated{" "}
                            <span className="font-semibold text-gray-800">
                                {formatDate(company.updated_at)}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="px-6 pb-6 space-y-4">
                {/* Assigned Trainings */}
                <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-500">
                            ASSIGNED COURSES
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

                            {assignedTrainings.length > 0 && (
                                <span className="text-xs sm:text-sm font-medium text-gray-400">
                                    {assignedTrainings.length}{" "}
                                    {assignedTrainings.length === 1
                                        ? "Course"
                                        : "Courses"}
                                </span>
                            )}

                            {assignedTrainings.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAllTrainings((prev) => !prev)
                                    }
                                    className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 transition cursor-pointer"
                                >
                                    {showAllTrainings
                                        ? "View Less"
                                        : `View All (${assignedTrainings.length - 3})`}
                                </button>
                            )}
                        </div>
                    </div>

                    {assignedTrainings.length > 0 ? (
                        <div className="space-y-2.5">

                            {(showAllTrainings
                                ? assignedTrainings
                                : assignedTrainings.slice(0, 3)
                            ).map((training, index) => (

                                <div
                                    key={
                                        training.company_trainings_id ||
                                        training.training_id ||
                                        index
                                    }
                                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-3 transition hover:border-gray-300 hover:shadow-sm"
                                >

                                    {/* Number */}
                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-semibold text-slate-600">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                    </div>

                                    {/* Training Details */}
                                    <div className="min-w-0 flex-1">

                                        <p className="text-sm font-semibold text-gray-800 break-words">
                                            {training.training_title || "-"}
                                        </p>

                                        {training.course_name && (
                                            <p className="text-xs text-gray-500 mt-0.5 break-words">
                                                {training.course_name}
                                                {training.course_code
                                                    ? ` (${training.course_code})`
                                                    : ""}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">

                                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <FiUsers size={13} />
                                                Limit:{" "}
                                                <span className="font-medium text-gray-700">
                                                    {training.training_users_limit ?? "-"}
                                                </span>
                                            </span>

                                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <FiCalendar size={13} />
                                                Expires:{" "}
                                                <span className="font-medium text-gray-700">
                                                    {formatDate(training.training_expiry_on)}
                                                </span>
                                            </span>

                                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <FiClock size={13} />
                                                Duration:{" "}
                                                <span className="font-medium text-gray-700">
                                                    {training.training_duration_hours != null
                                                        ? `${training.training_duration_hours} Hours`
                                                        : "-"}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    ) : (

                        <div className="bg-white border border-dashed border-gray-300 rounded-lg px-4 py-6 text-center">
                            <p className="text-sm text-gray-500">
                                No assigned courses
                            </p>
                        </div>

                    )}

                </div>

                {/* Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            COMPANY NAME
                        </h3>

                        <p className="text-gray-800 break-words">
                            {company.company_name || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            EMAIL
                        </h3>

                        <p className="text-gray-800 break-all">
                            {company.company_email || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            MOBILE NUMBER
                        </h3>

                        <p className="text-gray-800">
                            {company.company_mobile_no || "-"}
                        </p>
                    </div>

                    {/* <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            STATUS
                        </h3>

                        <p className="text-gray-800">
                            {isActive ? "Active" : "Inactive"}
                        </p>
                    </div> */}

                    <div className="bg-slate-50 p-4 rounded-lg md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            COMPANY ADDRESS
                        </h3>

                        <p className="text-gray-800 whitespace-pre-wrap break-words">
                            {company.company_address || "-"}
                        </p>
                    </div>

                </div>

                {/* Timestamps */}
                <div className="grid gap-4">

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            CREATED ON
                        </h3>

                        <p className="text-gray-800">
                            {formatDate(company.created_at)}
                        </p>
                    </div>

                    {/*
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            LAST UPDATED
                        </h3>

                        <p className="text-gray-800">
                            {formatDate(company.updated_at)}
                        </p>
                    </div>
                    */}

                </div>

            </div>

        </div>
    );
};

export default CompanyDetails;
