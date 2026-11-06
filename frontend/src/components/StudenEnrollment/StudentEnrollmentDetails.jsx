import { useState } from "react";
import { FiAlertCircle, FiCheck, FiClock, FiUser, FiX } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";


const StudentEnrollmentDetails = ({ enrollment, setViewingEnrollment, fetchEnrollments }) => {

    if (!enrollment) return null;

    const isActive = enrollment.is_active === 1;
    const [pendingAction, setPendingAction] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const updateEnrollmentStatus = async (status) => {

        try {

            setSubmitting(true);

            const token = sessionStorage.getItem("token");

            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/${enrollment.enroll_id}/status`,
                {
                    enroll_status: status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {

                toast.success(response.data.message);

                await fetchEnrollments();

                setViewingEnrollment(false);

            }

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update enrollment status."
            );

        } finally {

            setSubmitting(false);
            setPendingAction(null);

        }

    };

    const initials = enrollment.user_full_name
        ? enrollment.user_full_name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "?";

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const statusConfig = {
        P: {
            label: "Pending",
            className: "bg-yellow-100 text-yellow-700",
            dotClassName: "bg-yellow-600",
        },
        A: {
            label: "Approved",
            // className: "bg-green-100 text-green-700",
            className: "bg-blue-100 text-blue-700",
            // dotClassName: "bg-green-600",
            dotClassName: "bg-blue-600",
        },
        R: {
            label: "Rejected",
            className: "bg-red-100 text-red-700",
            dotClassName: "bg-red-600",
        },
    };

    const currentStatus =
        statusConfig[enrollment.enroll_status] ?? {
            label: "Unknown",
            className: "bg-gray-100 text-gray-700",
        };

    const profilePhotoPath = String(enrollment.user_profile_photo || "");
    const profilePhotoUrl = profilePhotoPath.startsWith("http")
        ? profilePhotoPath
        : `${import.meta.env.VITE_API_BASE_URL}/${profilePhotoPath.replace(/^\/+/, "")}`;

    return (
        //{/* was: className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden" — overflow-hidden clips the bottom content on short phone viewports; overflow-x-hidden preserves horizontal containment without cutting off vertically, pb-10 adds scroll clearance so the last cards fully scroll into view */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-hidden pb-10">
            <style>{`
            .description-content ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
        }
            .description-content ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 0.5rem 0;
        }
            .description-content li {
            margin-bottom: 0.25rem;
        }
    `}</style>
            {/* Header */}
            {/* was: <div className="p-6 relative"> */}
            <div className="p-4 sm:p-6 relative">

                {/* Top Row */}
                {/* was:
                <div className="flex justify-between items-start">
                */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                    {/* was:
                    <div className="flex gap-5 items-center">
                    */}
                    <div className="flex gap-3 sm:gap-5 items-center">

                        {enrollment.user_profile_photo ? (
                            <img
                                src={profilePhotoUrl}
                                alt={enrollment.user_full_name}
                                // was:
                                // className="w-20 h-20 rounded-full object-cover border shrink-0"
                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border shrink-0"
                            />
                        ) : (
                            // was:
                            // <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            //     <span className="text-2xl font-bold text-red-600">
                            //         {initials}
                            //     </span>
                            // </div>
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <span className="text-lg sm:text-2xl font-bold text-red-600">
                                    {initials}
                                </span>
                            </div>
                        )}

                        <div>
                            {/* was:
                            <h1 className="text-3xl font-bold text-gray-800">
                                {enrollment.user_full_name}
                            </h1>
                            */}
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-800 pr-8 sm:pr-0">
                                {enrollment.user_full_name}
                            </h1>

                            {/* was:
                            <div className="flex items-center gap-3 mt-3">
                            */}
                            {/* was: <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3"> (badges only; actions lived in a separate block below, causing Close to drop to its own row on phone) */}
                            <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3">

                                <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                                    {/* <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                        {enrollment.role_name || "Instructor"}
                                    </span> */}

                                    {/* <span
                                        className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${isActive
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {isActive ? "Active" : "Inactive"}
                                    </span> */}

                                    <span
                                        className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-green-600" : "bg-red-600"
                                                }`}
                                        />
                                        {isActive ? "Active" : "Inactive"}
                                    </span>

                                    {/* <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[enrollment.enroll_status].className}`}
                                    >
                                        {statusConfig[enrollment.enroll_status].label}
                                    </span> */}

                                    {/* <span
                                        className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${currentStatus.className}`}
                                    >
                                        {currentStatus.label}
                                    </span> */}

                                    <span
                                        className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${currentStatus.className}`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentStatus.dotClassName}`}
                                        />
                                        {currentStatus.label}
                                    </span>
                                </div>

                                {/* Phone-only Approve/Reject, aligned with the badges. Hidden at sm: and up. */}
                                {enrollment.enroll_status === "P" && (
                                    <div className="flex gap-2 shrink-0 sm:hidden">
                                        <button
                                            onClick={() => setPendingAction("A")}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg cursor-pointer transition text-xs whitespace-nowrap"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setPendingAction("R")}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg cursor-pointer transition text-xs whitespace-nowrap"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {/* Phone-only Close, pinned to the top-right corner of the card. Hidden at sm: and up. */}
                                <button
                                    onClick={() => setViewingEnrollment(false)}
                                    className="absolute top-3 right-3 z-10 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition sm:hidden"
                                >
                                    <FiX aria-hidden="true" />
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* <div className="flex gap-2">

                        <button
                            onClick={() => handleEdit(enrollment)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => setViewingEnrollment(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                        >
                            ✕
                        </button>

                    </div> */}

                    {/* was:
                    <div className="flex gap-2">
                    */}
                    {/* was: <div className="flex gap-2 flex-wrap justify-end sm:justify-start shrink-0"> (rendered on all sizes, dropped below name on phone since parent is flex-col there) */}
                    <div className="hidden sm:flex gap-2 flex-wrap justify-end sm:justify-start shrink-0">

                        {enrollment.enroll_status === "P" && (
                            <>
                                <button
                                    onClick={() => setPendingAction("A")}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg cursor-pointer transition text-sm sm:text-base whitespace-nowrap"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => setPendingAction("R")}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg cursor-pointer transition text-sm sm:text-base whitespace-nowrap"
                                >
                                    Reject
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setViewingEnrollment(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                        >
                            {/* was: ✕ */}
                            <FiX aria-hidden="true" />
                        </button>

                    </div>

                </div>
                {/* Bottom Row */}
                {/* was:
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-100 pt-4">

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiUser className="text-gray-500" size={16} />
                        <span>
                            Created by{" "}
                            <span className="font-semibold text-gray-800">
                                {enrollment.created_by_name || "Unknown"}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiClock className="text-gray-500" size={16} />
                        <span>
                            Updated{" "}
                            <span className="font-semibold text-gray-800">
                                {formatDate(enrollment.updated_at) || "-"}
                            </span>
                        </span>
                    </div>

                </div>

            </div>


            {/* Confirmation modal, shown when an approve/reject action is pending */}
            {pendingAction && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => !submitting && setPendingAction(null)}
                >
                    <div
                        className="bg-white rounded-xl border border-slate-200 shadow-lg w-full max-w-[340px] p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${pendingAction === "A" ? "bg-green-50" : "bg-red-50"
                                    }`}
                            >
                                <span
                                    className={`text-base font-semibold ${pendingAction === "A" ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {/* was: {pendingAction === "A" ? "✓" : "!"} */}
                                    {pendingAction === "A" ? <FiCheck aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
                                </span>
                            </div>

                            <div className="pt-0.5 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    {pendingAction === "A" ? "Approve enrollment" : "Reject enrollment"}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {pendingAction === "A"
                                        ? "The student will get access to the course."
                                        : "The student won't get access to the course."}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setPendingAction(null)}
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-gray-700 text-sm font-medium hover:bg-slate-50 cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateEnrollmentStatus(pendingAction)}
                                disabled={submitting}
                                className={`px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed ${pendingAction === "A"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {submitting
                                    ? "Submitting..."
                                    : pendingAction === "A"
                                        ? "Approve"
                                        : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Details */}
            <div className="px-6 pb-6 space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            USERNAME
                        </h3>
                        <p className="text-gray-800">
                            {enrollment.username || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            EMAIL
                        </h3>
                        <p className="text-gray-800 break-all">
                            {enrollment.user_email || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            MOBILE
                        </h3>
                        <p className="text-gray-800">
                            {enrollment.user_mobile_no || "-"}
                        </p>
                    </div>

                    {/* <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            QUALIFICATION
                        </h3>
                        <p className="text-gray-800">
                            {user.ins_qualification || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            EXPERIENCE
                        </h3>
                        <p className="text-gray-800">
                            {user.ins_experience || "-"}
                        </p>
                    </div> */}

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            CATEGORY
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.course_name || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            COURSE
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.training_title || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            INSTRUCTOR
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.instructor_names || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            QUALIFICATION
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.enroll_qualification || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            POSTAL ADDRESS
                        </h3>

                        <div className="text-gray-800 whitespace-pre-wrap">
                            {enrollment.enroll_postal_address || "-"}
                        </div>
                    </div>





                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                        CREATED ON
                    </h3>
                    <p className="text-gray-800">
                        {formatDate(enrollment.created_at)}
                    </p>
                </div>





                {/*
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            LAST UPDATED
                        </h3>
                        <p className="text-gray-800">
                            {formatDate(enrollment.updated_at)}
                        </p>
                    </div>
                    */}
            </div>

        </div>


    );
};

export default StudentEnrollmentDetails;