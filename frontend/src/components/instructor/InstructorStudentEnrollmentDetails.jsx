import { FiClock, FiUser, FiX } from "react-icons/fi";

const InstructorStudentEnrollmentDetails = ({
    enrollment,
    setViewingEnrollment,
}) => {
    if (!enrollment) return null;

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

    

    // Profile photo
    const profilePhotoPath = String(enrollment.user_profile_photo || "");

    const profilePhotoUrl = profilePhotoPath.startsWith("http")
        ? profilePhotoPath
        : `${import.meta.env.VITE_API_BASE_URL}/${profilePhotoPath.replace(
              /^\/+/,
              ""
          )}`;

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-hidden pb-10">
            {/* Header */}
            <div className="p-4 sm:p-6 relative">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    {/* Student information */}
                    <div className="flex gap-3 sm:gap-5 items-center">
                        {enrollment.user_profile_photo ? (
                            <img
                                src={profilePhotoUrl}
                                alt={enrollment.user_full_name}
                                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <span className="text-lg sm:text-2xl font-bold text-green-700">
                                    {initials}
                                </span>
                            </div>
                        )}

                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
                                {enrollment.user_full_name}
                            </h1>

                              <div className="mt-2 sm:mt-3">
                                <div className="flex gap-2 shrink-0 sm:hidden">
                                    <button
                                        onClick={() => setViewingEnrollment(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                                    >
                                        <FiX aria-hidden="true" />
                                    </button>
                                </div>
                            </div>                      </div>
                    </div>

                    {/* Desktop close button */}
                    <div className="hidden sm:flex gap-2 flex-wrap justify-end sm:justify-start shrink-0">
                        <button
                            onClick={() => setViewingEnrollment(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                        >
                            <FiX aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiUser className="text-gray-500" size={16} />

                        <span>
                            {/* Enrollment ID{" "}
                            <span className="font-semibold text-gray-800">
                                #{enrollment.enroll_id}
                            </span> */}

                            Created by{" "}
                            <span className="font-semibold text-gray-800">
                                {enrollment.created_by_name || "Unknown"}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiClock className="text-gray-500" size={16} />

                        <span>
                            Applied On{" "}
                            <span className="font-semibold text-gray-800">
                                {formatDate(enrollment.created_at)}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            USERNAME
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.username || "-"}
                        </p>
                    </div>

                    {/* Email */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            EMAIL
                        </h3>

                        <p className="text-gray-800 break-all">
                            {enrollment.user_email || "-"}
                        </p>
                    </div>

                    {/* Mobile */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            MOBILE
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.user_mobile_no || "-"}
                        </p>
                    </div>

                    {/* Category */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            CATEGORY
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.course_name || "-"}
                        </p>
                    </div>

                    {/* Course */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            COURSE
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.training_title || "-"}
                        </p>
                    </div>

                    {/* Instructor */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            INSTRUCTOR
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.instructor_names || "-"}
                        </p>
                    </div>

                    {/* Qualification */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            QUALIFICATION
                        </h3>

                        <p className="text-gray-800">
                            {enrollment.enroll_qualification || "-"}
                        </p>
                    </div>

                    {/* Postal Address */}
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                            POSTAL ADDRESS
                        </h3>

                        <div className="text-gray-800 whitespace-pre-wrap">
                            {enrollment.enroll_postal_address || "-"}
                        </div>
                    </div>
                </div>

                {/* Created On */}
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                        CREATED ON
                    </h3>

                    <p className="text-gray-800">
                        {formatDate(enrollment.created_at)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InstructorStudentEnrollmentDetails;