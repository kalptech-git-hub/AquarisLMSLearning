import {
    FiX,
    FiUser,
    FiClock,
    FiBookOpen,
    FiUsers,
    FiCalendar,
    FiLayers,
    FiCheckCircle,
    FiInfo,
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

const CompanyCourseDetails = ({ companyCourses, onBack }) => {

    const course = companyCourses || {};

    const assignmentActive = Number(course.assignment_is_active) === 1;
    const trainingActive = Number(course.training_is_active) === 1;

    const DetailCard = ({ label, value, icon: Icon }) => (
        <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-2">
                {label}
            </p>

            <div className="flex items-center gap-2 text-gray-800">
                {Icon && <Icon className="text-gray-500 shrink-0" size={16} />}
                <span className="break-words">
                    {value || "-"}
                </span>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-hidden pb-20">

            {/* Header */}
            <div className="p-6 relative">

                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                    <div className="flex flex-col min-w-0 flex-1">

                        <div className="flex items-center gap-3 min-w-0">

                            {/* Training Initials */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
                                <span className="text-xl sm:text-2xl font-bold text-red-600">
                                    {course.training_title
                                        ? course.training_title
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
                                    {course.training_title || "Training Details"}
                                </h1>

                                <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3">

                                    <span className="px-2.5 py-1 sm:px-3 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium">
                                        {course.course_name || "Course"} • {course.course_level}
                                    </span>

                                    <span
                                        className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 ${
                                            assignmentActive
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                assignmentActive
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                            }`}
                                        />
                                        {assignmentActive ? "Assigned" : "Inactive"}
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* Mobile Close */}
                        <div className="absolute top-3 right-3 z-10 sm:hidden">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                                title="Close"
                            >
                                <FiX aria-hidden="true" />
                            </button>
                        </div>

                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex gap-2 shrink-0">

                        <button
                            onClick={onBack}
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
                            Assigned by{" "}
                            <span className="font-semibold text-gray-800">
                                {course.created_by_name || "Unknown"}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiClock className="text-gray-500 shrink-0" size={16} />

                        <span>
                            Updated{" "}
                            <span className="font-semibold text-gray-800">
                                {formatDate(course.updated_at)}
                            </span>
                        </span>
                    </div>

                </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-8">

                {/* Course Details */}
                <div>
                    {/* <div className="flex items-center gap-2 mb-4">
                        <FiBookOpen className="text-red-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Course Details
                        </h2>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* <DetailCard
                            label="COURSE CATEGORY NAME"
                            value={course.course_name}
                            icon={FiBookOpen}
                        /> */}

                        {/* <DetailCard
                            label="COURSE CODE"
                            value={course.course_code}
                            icon={FiLayers}
                        /> */}

                        {/* <DetailCard
                            label="LEVEL"
                            value={course.course_level}
                            icon={FiInfo}
                        /> */}

                        <DetailCard
                            label="COURSE TITLE"
                            value={course.training_title}
                            icon={FiBookOpen}
                        />

                        <DetailCard
                            label="TRAINING DURATION"
                            value={
                                course.training_duration_hours != null
                                    ? `${course.training_duration_hours} Hours`
                                    : "-"
                            }
                            icon={FiClock}
                        />

                        {/* <DetailCard
                            label="TRAINING MODE"
                            value={course.training_mode}
                            icon={FiLayers}
                        /> */}

                        {/* <DetailCard
                            label="TRAINING STATUS"
                            value={course.training_status}
                            icon={FiCheckCircle}
                        /> */}

                        {/* <DetailCard
                            label="PUBLISH STATUS"
                            value={course.publish_status}
                            icon={FiCheckCircle}
                        /> */}

                        {/* <DetailCard
                            label="ENROLLMENT STATUS"
                            value={course.enrollment_status}
                            icon={FiUsers}
                        /> */}

                    </div>

                    {/* Description */}
                    {/* <div className="bg-slate-50 p-4 rounded-lg mt-6">
                        <p className="text-sm font-medium text-gray-500 mb-2">
                            TRAINING DESCRIPTION
                        </p>

                        <p className="text-gray-800 whitespace-pre-wrap break-words">
                            {course.training_description || "No description provided"}
                        </p>
                    </div> */}
                </div>

                {/* Company Assignment Details */}
                <div>
                    {/* <div className="flex items-center gap-2 mb-4">
                        <FiUsers className="text-red-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Company Assignment Details
                        </h2>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <DetailCard
                            label="USER LIMIT"
                            value={
                                course.training_users_limit != null
                                    ? `${course.training_users_limit} Users`
                                    : "-"
                            }
                            icon={FiUsers}
                        />

                        <DetailCard
                            label="ASSIGNMENT EXPIRY DATE"
                            value={formatDate(course.training_expiry_on)}
                            icon={FiCalendar}
                        />

                        <DetailCard
                            label="ASSIGNED ON"
                            value={formatDate(course.created_at)}
                            icon={FiCalendar}
                        />

                        <DetailCard
                            label="LAST UPDATED ON"
                            value={formatDate(course.updated_at)}
                            icon={FiClock}
                        />

                    </div>
                </div>

                {/* Assignment History */}
                {/* <div>
                    <div className="flex items-center gap-2 mb-4">
                        <FiUser className="text-red-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Assignment History
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <DetailCard
                            label="CREATED BY"
                            value={course.created_by_name || "Unknown"}
                            icon={FiUser}
                        />

                        <DetailCard
                            label="UPDATED BY"
                            value={course.updated_by_name || "Unknown"}
                            icon={FiUser}
                        />

                    </div>
                </div> */}

            </div>

        </div>
    );
};

export default CompanyCourseDetails;