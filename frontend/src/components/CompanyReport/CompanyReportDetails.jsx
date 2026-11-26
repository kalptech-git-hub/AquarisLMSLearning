
import {
    FiX,
    FiBookOpen,
    FiBriefcase,
    FiMail,
    FiPhone,
    FiMapPin,
    FiUsers,
    FiUser,
    FiClock,
    FiCalendar,
    FiCheckCircle,
    FiInfo,
    FiFolder,
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

const formatValue = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    return `${value}${suffix}`;
};

const DetailCard = ({ label, value, className = "", valueClassName = "" }) => (
    <div className={`bg-slate-50 p-4 rounded-lg ${className}`}>
        <h3 className="text-sm font-medium text-gray-500 mb-2">
            {label}
        </h3>

        <p className={`text-gray-800 break-words ${valueClassName}`}>
            {value ?? "-"}
        </p>
    </div>
);

const SectionTitle = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-2 mb-4">
        <Icon className="text-red-600" size={18} />
        <h2 className="text-base font-semibold text-gray-800">
            {children}
        </h2>
    </div>
);

const CompanyReportDetails = ({
    reports,
    setViewingReport,
}) => {
    if (!reports) return null;


    const initials = reports.training_title
        ? reports.training_title
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "?";

    const statusStyles = {
        ACTIVE: "bg-green-100 text-green-700",
        REVOKED: "bg-red-100 text-red-700",
        EXPIRED: "bg-orange-100 text-orange-700",
        NOT_ASSIGNED: "bg-slate-100 text-slate-700",
    };

    const status = reports.assignment_status?.toUpperCase() || "UNKNOWN";

    const statusLabels = {
        ACTIVE: "Active",
        REVOKED: "Revoked",
        EXPIRED: "Expired",
        NOT_ASSIGNED: "Not Assigned",
    };

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-hidden pb-10">

            {/* Header */}
            <div className="p-6 relative">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                    <div className="flex items-center gap-3 min-w-0 flex-1">

                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                            {/* <FiBookOpen className="text-red-600" size={30} /> */}

                            {reports.training_thumbnail ? (
                                <img
                                    src={/^https?:\/\//i.test(reports.training_thumbnail)
                                        ? reports.training_thumbnail
                                        : `${import.meta.env.VITE_API_BASE_URL}${reports.training_thumbnail}`}
                                    alt={reports.training_title}
                                    className="w-20 h-20 rounded-full object-cover border shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <span className="text-2xl font-bold text-red-600">
                                        {initials}
                                    </span>
                                </div>
                            )}                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-2 mt-3">

                                <h1 className="text-xl sm:text-3xl font-bold text-gray-800 break-words pr-8 sm:pr-0">
                                    {reports.training_title || "Training Report"}
                                </h1>

                                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-lime-100 text-lime-700 text-xs sm:text-sm font-medium shrink-0">
                                    <FiFolder size={13} className="shrink-0" />
                                    <span className="truncate max-w-[160px] sm:max-w-none">
                                        {reports.course_name}
                                    </span>
                                </span>
                            </div>


                            {/* <p className="text-sm text-gray-500 mt-1">
                                {reports.company_name || "-"}
                            </p> */}

                            <div className="flex items-center flex-wrap gap-2 mt-3">

                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                                    <FiBriefcase size={13} />
                                    {/* Company Training Report */}
                                    {reports.company_name || "-"}
                                </span>

                                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 ${statusStyles[status] || "bg-gray-100 text-gray-700"
                                    }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {statusLabels[status] || status}
                                </span>


                            </div>
                        </div>

                    </div>

                    {/* Desktop Close */}
                    <div className="hidden sm:flex shrink-0">
                        <button
                            onClick={() => setViewingReport(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                            title="Close"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Mobile Close */}
                    <div className="absolute top-3 right-3 z-10 sm:hidden">
                        <button
                            onClick={() => setViewingReport(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                            title="Close"
                        >
                            <FiX size={18} />
                        </button>
                    </div>

                </div>

                {/* Bottom Row */}
                {/* was: className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4" */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-100 pt-4">

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiUser className="text-gray-500" size={16} />
                        <span>
                            Created by{" "}
                            <span className="font-semibold text-gray-800">
                                {reports.assignment_created_by_name || "Unknown"}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiClock className="text-gray-500" size={16} />
                        <span>
                            Updated{" "}
                            <span className="font-semibold text-gray-800">
                                {formatDate(reports.assignment_updated_at) || "-"}
                            </span>
                        </span>
                    </div>

                </div>

            </div>

            <div className="px-6 pb-6 space-y-5">
                {/* Summary */}
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3 border-t border-gray-100 pt-5">

                    <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            <FiUsers size={14} />
                            User Limit
                        </div>
                        <p className="text-xl font-bold text-gray-800">
                            {formatValue(reports.training_users_limit)}
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            <FiCheckCircle size={14} />
                            Approved Users
                        </div>
                        <p className="text-xl font-bold text-green-600">
                            {formatValue(reports.approved_user_count)}
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                            <FiInfo size={14} />
                            Available Slots
                        </div>
                        <p className="text-xl font-bold text-blue-600">
                            {formatValue(reports.available_user_slots)}
                        </p>
                    </div>

                </div>

                {/* Company Information */}
                <section className="bg-slate-50 rounded-lg p-4">

                    <SectionTitle icon={FiBriefcase}>
                        Company Information
                    </SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* <DetailCard
                            label="COMPANY NAME"
                            value={reports.company_name}
                        /> */}

                        <DetailCard
                            label="EMAIL ADDRESS"
                            value={reports.company_email}
                            valueClassName="break-all"
                        />

                        <DetailCard
                            label="MOBILE NUMBER"
                            value={reports.company_mobile_no}
                        />

                        <DetailCard
                            label="COMPANY ADDRESS"
                            value={reports.company_address}
                        // className="md:col-span-2"
                        />

                    </div>
                </section>

                {/* Training Information */}
                <section className="bg-slate-50 rounded-lg p-4">

                    <SectionTitle icon={FiBookOpen}>
                        Course Information
                    </SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* <DetailCard
                            label="TRAINING TITLE"
                            value={reports.training_title}
                        /> */}

                        {/* <DetailCard
                            label="COURSE CATEGORY"
                            value={reports.course_name}
                        /> */}

                        {/* <DetailCard
                            label="COURSE CODE"
                            value={reports.course_code}
                        /> */}

                        <DetailCard
                            label="DURATION"
                            value={formatValue(reports.training_duration_hours, " Hours")}
                        />

                        <DetailCard
                            label="TRAINING MODE"
                            value={reports.training_mode}
                        />

                        <DetailCard
                            label="TRAINING FEE"
                            value={formatValue(reports.training_fee)}
                        />

                       

                        {/* <DetailCard
                            label="DESCRIPTION"
                            value={reports.training_description}
                            className="md:col-span-2"
                        /> */}
                        

                    </div>
                </section>

                {/* Assignment Information */}
                <section className="bg-slate-50 rounded-lg p-4">

                    <SectionTitle icon={FiUsers}>
                        Company Course Assignment
                    </SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <DetailCard
                            label="EXPIRY DATE"
                            value={formatDate(reports.training_expiry_on)}
                        />
                    </div>
                </section>

                {/* Audit Information */}
                {/* <section className="bg-slate-50 rounded-lg p-4">

                    <SectionTitle icon={FiClock}>
                        Record Information
                    </SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <DetailCard
                            label="CREATED BY"
                            value={reports.assignment_created_by_name}
                        />

                        <DetailCard
                            label="CREATED ON"
                            value={formatDate(reports.assignment_created_at)}
                        />

                        <DetailCard
                            label="LAST UPDATED BY"
                            value={reports.assignment_updated_by_name}
                        />

                        <DetailCard
                            label="LAST UPDATED ON"
                            value={formatDate(reports.assignment_updated_at)}
                        />

                    </div>
                </section> */}

            </div>
        </div>
    );
};

export default CompanyReportDetails;
