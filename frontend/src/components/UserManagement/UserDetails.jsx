// was: import { FiClock, FiUser } from "react-icons/fi";
import { useState } from "react";
import { FiClock, FiEdit2, FiUser, FiX } from "react-icons/fi";
const UserDetails = ({ user, setViewingUser, handleEdit }) => {
    const [showAllCourses, setShowAllCourses] = useState(false);

    if (!user) return null;

    const isActive = user.is_active === 1 || user.instructor_active === 1;

    const initials = user.user_full_name
        ? user.user_full_name
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

    return (
        //{/* was: className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden" — overflow-hidden clips the bottom content on short phone viewports; overflow-x-hidden preserves horizontal containment without cutting off vertically, pb-10 adds scroll clearance so the last cards fully scroll into view */}
        //{/* was: pb-10 — not enough clearance on some phone viewports, bumped to pb-20 */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-hidden pb-20">
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
            <div className="p-6 relative">

                {/* Top Row */}
                {/* was: <div className="flex justify-between items-start"> */}
                {/* was: <div className="flex flex-col sm:flex-row justify-between items-start gap-4"> */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                    {/* was: <div className="flex gap-5 items-center"> */}
                    <div className="flex gap-4 sm:gap-5 items-center min-w-0 flex-1">

                        {user.user_profile_photo ? (
                            <img
                                src={/^https?:\/\//i.test(user.user_profile_photo)
                                    ? user.user_profile_photo
                                    : `${import.meta.env.VITE_API_BASE_URL}${user.user_profile_photo}`}
                                alt={user.user_full_name}
                                className="w-20 h-20 rounded-full object-cover border shrink-0"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <span className="text-2xl font-bold text-red-600">
                                    {initials}
                                </span>
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {/* was: className="text-3xl font-bold text-gray-800" */}
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-800 pr-8 sm:pr-0">
                                {user.user_full_name}
                            </h1>

                            {/* was: className="flex items-center gap-3 mt-3" */}
                            {/* was: className="flex items-center justify-between gap-3 mt-3" (didn't wrap, caused Close button to get clipped off-card at 375px) */}
                            <div className="flex items-center flex-wrap justify-between gap-2 sm:gap-3 mt-3">

                                <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                                    <span className="px-2.5 py-1 sm:px-3 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap">
                                        {user.role_name || "Instructor"}
                                    </span>

                                    <span
                                        className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5
                                            ${isActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 
                                                ${isActive
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                                }
                                                `}
                                        />
                                        {isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                
                                <div className="absolute top-3 right-3 z-10 sm:hidden">
                                    {/* <button
                                        onClick={() => handleEdit(user)}
                                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer transition"
                                        title="Edit"
                                    >
                                        <FiEdit2 size={16} />
                                    </button> */}
                                    <button
                                        onClick={() => setViewingUser(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                                    >
                                        {/* was: ✕ */}
                                        <FiX aria-hidden="true" />
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* was: <div className="flex gap-2"> */}
                    {/* was: <div className="flex gap-2 self-end sm:self-start shrink-0"> (phone version, replaced by inline badges-row version above) */}
                    <div className="hidden sm:flex gap-2 shrink-0">

                        {/* <button
                            onClick={() => handleEdit(user)}
                            // was: className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2"
                        >
                            <FiEdit2 size={16} />
                            Edit
                        </button> */}

                        <button
                            onClicck={() => setViewingUser(false)}
                            // was: className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                        >
                            {/* was: ✕ */}
                            <FiX aria-hidden="true" />
                        </button>

                    </div>

                </div>
                {/* Bottom Row */}
                {/* was: className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4" */}
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100 pt-4">

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiUser className="text-gray-500" size={16} />
                        <span>
                            Created by{" "}
                            <span className="font-semibold text-gray-800">
                                {user.created_by_name || "Unknown"}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiClock className="text-gray-500" size={16} />
                        <span>
                            Updated{" "}
                            <span className="font-semibold text-gray-800">
                                {formatDate(user.updated_at) || "-"}
                            </span>
                        </span>
                    </div>

                </div>

            </div>

            {/* Details */}
            <div className="px-6 pb-6 space-y-4">

                {/* <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                        ASSIGNED COURSES
                    </h3>
                    {user.assignedCourses?.length ? (
                        <div className="space-y-3">
                            {user.assignedCourses.map((course, index) => (
                                <div key={`${course.course_name}-${course.training_title}-${index}`}>
                                    <p className="text-gray-800">
                                        {course.training_title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-800">No assigned courses</p>
                    )}
                </div> */}



                <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-500">
                            ASSIGNED COURSES
                        </h3>

                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

                            {user.assignedCourses?.length > 0 && (
                                <span className="text-xs sm:text-sm font-medium text-gray-400">
                                    {user.assignedCourses.length}{" "}
                                    {user.assignedCourses.length === 1 ? "Course" : "Courses"}
                                </span>
                            )}

                            {user.assignedCourses?.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllCourses((prev) => !prev)}
                                    className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 transition cursor-pointer"
                                >
                                    {showAllCourses
                                        ? "View Less"
                                        : `View All (${user.assignedCourses.length - 3})`}
                                </button>
                            )}

                        </div>
                    </div>

                    {user.assignedCourses?.length ? (
                        <>
                            <div className="space-y-2.5">
                                {(showAllCourses
                                    ? user.assignedCourses
                                    : user.assignedCourses.slice(0, 3)
                                ).map((course, index) => (
                                    <div
                                        key={`${course.course_name}-${course.training_title}-${index}`}
                                        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-3 transition hover:border-gray-300 hover:shadow-sm"
                                    >
                                        {/* Number */}
                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-semibold text-slate-600">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        {/* Course Details */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {course.training_title || "-"}
                                            </p>

                                            {course.course_name && (
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {course.course_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                        
                        </>
                    ) : (
                        <div className="bg-white border border-dashed border-gray-300 rounded-lg px-4 py-6 text-center">
                            <p className="text-sm text-gray-500">
                                No assigned courses
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            USERNAME
                        </h3>
                        <p className="text-gray-800">
                            {user.username || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            EMAIL
                        </h3>
                        <p className="text-gray-800 break-all">
                            {user.user_email || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            MOBILE
                        </h3>
                        <p className="text-gray-800">
                            {user.user_mobile_no || "-"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
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
                    </div>

                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                        BIO
                    </h3>
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {user.ins_bio || "No bio provided"}
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            CREATED ON
                        </h3>
                        <p className="text-gray-800">
                            {formatDate(user.created_at)}
                        </p>
                    </div>

                    {/*
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            LAST UPDATED
                        </h3>
                        <p className="text-gray-800">
                            {formatDate(user.updated_at)}
                        </p>
                    </div>
                    */}
                </div>

            </div>

        </div>
    );
};

export default UserDetails;