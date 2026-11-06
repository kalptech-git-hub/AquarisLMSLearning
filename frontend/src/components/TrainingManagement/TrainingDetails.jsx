//TrainingDetails.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiBook, FiBookOpen, FiClock, FiEdit2, FiAward, FiBriefcase, FiFacebook, FiFileText, FiFolder, FiInfo, FiLayers, FiTrash2, FiUser, FiUsers, FiVideo, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const INSTRUCTOR_TABLE_ROUTE = "/admin/instructors";

const TrainingDetails = ({ course, setViewingCourse, handleEdit, handleEditTopic, initialTab = "details", handleDeleteTopic }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const navigate = useNavigate();

    const goToInstructor = (instructor) => {
        navigate(INSTRUCTOR_TABLE_ROUTE, {
            state: { highlightedInstructorId: instructor.instructor_id },
        });
    };

    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);

    const getTrainingStatusLabel = (course) => {
        if (course?.training_status === "COMPLETED") {
            return "COMPLETED";
        }
        return course?.is_active === 1 ? "ACTIVE" : "INACTIVE";
    };

    const formatDuration = (seconds) => {
        const totalSeconds = Number(seconds) || 0;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        if (minutes > 0) {
            return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} min`;
        }
        return `${secs} sec`;
    };

    const getTopicDuration = (topicId) =>
        (lessonsByTopic[topicId] || []).reduce(
            (sum, lesson) => sum + (Number(lesson.lesson_duration) || 0),
            0
        );

    const fetchTopics = async () => {
        try {
            setLoadingTopics(true);

            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/topics/training/${course?.training_id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setTopics(response.data.topics || []);
            } else {
                setTopics([]);
            }

        } catch (error) {
            console.error("Failed to fetch topics:", error);
            toast.error("Failed to load modules.");
            setTopics([]);
        } finally {
            setLoadingTopics(false);
        }
    };

    const [lessonsByTopic, setLessonsByTopic] = useState({});

    const fetchLessonsForTopic = async (topicId) => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/lessons/topic/${topicId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setLessonsByTopic(prev => ({
                    ...prev,
                    [topicId]: response.data.lessons || []
                }));
            }
        } catch (error) {
            console.error(`Failed to fetch lessons for topic ${topicId}:`, error);
        }
    };

    useEffect(() => {
        if (course?.training_id) {
            fetchTopics();
        }

    }, [course?.training_id]);

    useEffect(() => {
        topics.forEach(topic => {
            fetchLessonsForTopic(topic.topic_id);
        });

    }, [topics]);

    useEffect(() => {
        if (course?.training_id) {
            fetchTopics();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course?.training_id]);

    // const handleDeleteTopic = async (topic) => {

    //     const confirmed = window.confirm(
    //         `Delete "${topic.topic_title}"? This cannot be undone.`
    //     );

    //     if (!confirmed) {
    //         return;
    //     }

    //     try {

    //         const token = sessionStorage.getItem("token");

    //         const response = await axios.delete(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/topics/${topic.topic_id}`,
    //             {
    //                 headers: { Authorization: `Bearer ${token}` }
    //             }
    //         );

    //         if (response.data.success) {
    //             toast.success(response.data.message || "Topic deleted successfully.");
    //             fetchTopics();
    //         }

    //     } catch (error) {
    //         console.error("Failed to delete topic:", error);
    //         toast.error(
    //             error.response?.data?.message || "Failed to delete topic."
    //         );
    //     }

    // };

    const formatDateOnly = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getInitials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

const AVATAR_COLORS = [
    "from-red-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
];

const getPhotoUrl = (photo) =>
    !photo
        ? null
        : /^https?:\/\//i.test(photo)
            ? photo
            : `${import.meta.env.VITE_API_BASE_URL}${photo}`;

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateStr).toLocaleString("en-US", options);
    };

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
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
                {/* was: className="flex justify-between items-start" */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                    {/* was: className="flex gap-5" */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                        <img
                            src={course.training_thumbnail && /^https?:\/\//i.test(course.training_thumbnail)
                                ? course.training_thumbnail
                                : `${import.meta.env.VITE_API_BASE_URL}${course.training_thumbnail}`}
                            alt={course.training_title}
                            // was: className="w-44 h-28 object-cover rounded-xl border shadow-sm"
                            className="w-full h-40 sm:w-44 sm:h-28 object-cover rounded-xl border shadow-sm"
                        />

                                                <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
                                    {course.training_title}
                                </h1>

                                {course?.course_name && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-lime-100 text-lime-700 text-xs sm:text-sm font-medium shrink-0">
                                        <FiFolder size={13} className="shrink-0" />
                                        <span className="truncate max-w-[160px] sm:max-w-none">
                                            {course.course_name}
                                        </span>
                                    </span>
                                )}
                            </div>

                            {/* was: className="flex items-center gap-3 mt-3" */}
                            <div className="flex items-center justify-between gap-3 mt-3">

                                {/* <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                        {course.course_level}
                                    </span>

                                    <span
                                       className={`px-3 py-1 rounded-full text-sm font-medium ${
                                           getTrainingStatusLabel(course) === "COMPLETED"
                                               ? "bg-blue-100 text-blue-700"
                                               : getTrainingStatusLabel(course) === "ACTIVE"
                                                   ? "bg-green-100 text-green-700"
                                                   : "bg-red-100 text-red-700"
                                       }`}
                                   >
                                       {getTrainingStatusLabel(course).charAt(0) + getTrainingStatusLabel(course).slice(1).toLowerCase()}
                                   </span>
                                </div> */}

                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Course Level
                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                        {course.course_level}
                                    </span> */}

                                    {/* Training Status: Active / Inactive / Completed */}
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${getTrainingStatusLabel(course) === "COMPLETED"
                                                ? "bg-violet-100 text-violet-700"
                                                : getTrainingStatusLabel(course) === "ACTIVE"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${getTrainingStatusLabel(course) === "COMPLETED"
                                                    ? "bg-violet-500"
                                                    : getTrainingStatusLabel(course) === "ACTIVE"
                                                        ? "bg-emerald-500"
                                                        : "bg-red-500"
                                                }`}
                                        />

                                        {getTrainingStatusLabel(course).charAt(0) +
                                            getTrainingStatusLabel(course).slice(1).toLowerCase()}
                                    </span>

                                    {/* Publish Status: Published / Draft */}
                                    {course.publish_status === "PUBLISHED" ? (
                                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Published
                                        </span>
                                    ) : course.publish_status === "DRAFT" ? (
                                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            Draft
                                        </span>
                                    ) : null}
                                </div>

                                {/* Phone-only Edit/Close, aligned with the badges. Hidden at sm: and up,
                                    where the original top-right buttons (below) take over. */}
                                <div className="flex gap-2 shrink-0 sm:hidden">
                                    <button
                                        onClick={() => handleEdit(course)}
                                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg w-9 h-9 flex items-center justify-center"
                                        title="Edit"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewingCourse(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Desktop/tablet Edit/Close — original top-right position, hidden on phone
                        since the compact version above (in the badges row) replaces it there. */}
                    <div className="hidden sm:flex gap-2 sm:flex-shrink-0">

                        <button
                            onClick={() => handleEdit(course)}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg min-h-[40px] flex items-center justify-center gap-2 px-4 cursor-pointer"
                            title="Edit"
                        >
                            <FiEdit2 size={16} />
                            <span>Edit</span>
                        </button>

                        <button
                            onClick={() => setViewingCourse(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                            <FiX size={22} />
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
                                {course.created_by_name || "Unknown"}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiClock className="text-gray-500" size={16} />
                        <span>
                            Updated{" "}
                            <span className="font-semibold text-gray-800">
                                {formatDate(course.updated_at) || "-"}
                            </span>
                        </span>
                    </div>

                </div>
            </div>


            {/* <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("details")}
                    className={`px-6 py-4 font-medium transition ${activeTab === "details"
                        ? "border-b-2 border-red-600 text-red-600"
                        : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    Course Details
                </button>

                <button
                    onClick={() => setActiveTab("instructors")}
                    className={`px-6 py-4 font-medium transition ${activeTab === "instructors"
                        ? "border-b-2 border-red-600 text-red-600"
                        : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    Instructors
                </button>

                <button
                    onClick={() => setActiveTab("books")}
                    className={`px-6 py-4 font-medium transition ${activeTab === "books"
                        ? "border-b-2 border-red-600 text-red-600"
                        : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    Books
                </button>
            </div> */}

            {/* <div className="flex justify-center bg-gray-200 rounded-full p-1 gap-2 mb-6">
                <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-200 ease-in-out ${activeTab === "details"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-300 cursor-pointer"
                        }`}
                >
                    Course Details
                </button>

                <button
                    onClick={() => setActiveTab("instructors")}
                    className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-200 ease-in-out ${activeTab === "instructors"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-300 cursor-pointer"
                        }`}
                >
                    Instructors
                </button>

                <button
                    onClick={() => setActiveTab("books")}
                    className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-200 ease-in-out ${activeTab === "books"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-gray-600 hover:bg-gray-300 cursor-pointer"
                        }`}
                >
                    Books
                </button>
            </div> */}

            {/* was: <div className="flex justify-center mb-6"> */}
            <div className="flex justify-center mb-6 px-4 sm:px-0">
                {/* was: <div className="flex w-full max-w-3xl bg-gray-200 rounded-full p-1 gap-2"> */}
                <div className="flex w-full max-w-3xl bg-gray-200 rounded-full p-1 gap-1 sm:gap-2">

                    <button
                        onClick={() => setActiveTab("details")}
                        // was: className={`flex-1 py-2 px-4 rounded-full flex items-center font-medium transition-all duration-200 cursor-pointer ${activeTab === "details"
                        //     ? "bg-white text-red-600 shadow-sm"
                        //     : "text-gray-600 hover:bg-gray-300"
                        //     }`}
                        className={`flex-1 min-w-0 py-2 px-1 sm:px-4 rounded-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 font-medium transition-all duration-200 cursor-pointer ${activeTab === "details"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-600 hover:bg-gray-300"
                            }`}
                    >
                        <FiFileText
                            className="text-base sm:text-lg" />
                        <span className="text-[10px] sm:text-base leading-none truncate">
                            {/* was: Course Details (plain text) */}
                            <span className="hidden sm:inline">Course Details</span>
                            <span className="sm:hidden">Details</span>
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab("instructors")}
                        // was: className={`flex-1 py-2 px-4 rounded-full flex items-center font-medium transition-all duration-200 cursor-pointer ${activeTab === "instructors"
                        //     ? "bg-white text-red-600 shadow-sm"
                        //     : "text-gray-600 hover:bg-gray-300"
                        //     }`}
                        className={`flex-1 min-w-0 py-2 px-1 sm:px-4 rounded-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 font-medium transition-all duration-200 cursor-pointer ${activeTab === "instructors"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-600 hover:bg-gray-300"
                            }`}
                    >
                        <FiUsers className="text-base sm:text-lg" />
                        <span className="text-[10px] sm:text-base leading-none truncate">Instructors</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("books")}
                        // was: className={`flex-1 py-2 px-4 rounded-full flex items-center font-medium transition-all duration-200 cursor-pointer ${activeTab === "books"
                        //     ? "bg-white text-red-600 shadow-sm"
                        //     : "text-gray-600 hover:bg-gray-300"
                        //     }`}
                        className={`flex-1 min-w-0 py-2 px-1 sm:px-4 rounded-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 font-medium transition-all duration-200 cursor-pointer ${activeTab === "books"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-600 hover:bg-gray-300"
                            }`}
                    >
                        {/* <FiBook className="mr-2" /> */}
                        <FiBookOpen className="text-base sm:text-lg" />
                        <span className="text-[10px] sm:text-base leading-none truncate">Books</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("topics")}
                        // was: className={`flex-1 py-2 px-4 rounded-full flex items-center font-medium transition-all duration-200 cursor-pointer ${activeTab === "topics"
                        //     ? "bg-white text-red-600 shadow-sm"
                        //     : "text-gray-600 hover:bg-gray-300"
                        //     }`}
                        className={`flex-1 min-w-0 py-2 px-1 sm:px-4 rounded-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 font-medium transition-all duration-200 cursor-pointer ${activeTab === "topics"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-600 hover:bg-gray-300"
                            }`}
                    >
                        <FiLayers className="text-base sm:text-lg" />
                        <span className="text-[10px] sm:text-base leading-none truncate">
                            {/* Topics */}
                            Modules
                        </span>
                    </button>

                </div>
            </div>

            <div className="p-6">
                {activeTab === "details" && (
                    <div className="space-y-6">
                        {/* Description */}
                        {/* Course Metadata */}


                                                {/* Category Name / Category Code — removed from Course Details, now shown as a pill next to the title
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 mb-2">
                                    CATEGORY NAME
                                </p>
                                <div className="text-gray-800">
                                    {course?.course_name || "No course category name provided"}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-500 mb-2">
                                    CATEGORY CODE
                                </p>
                                <div className="text-gray-800">
                                    {course?.course_code || "No course category code provided"}
                                </div>
                            </div>

                        </div>
                        */}

                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">
                                DESCRIPTION
                            </h3>
                            {course?.training_description ? (
                                <div
                                    className="prose prose-sm max-w-none text-gray-800 description-content"
                                    dangerouslySetInnerHTML={{ __html: course.training_description }}
                                />
                            ) : (
                                <div className="prose prose-sm max-w-none text-gray-800">
                                    No description provided
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">FEE</h3>
                                <div className="text-gray-800">{course?.training_fee || "No fee provided"}</div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">MODE OF COURSE</h3>
                                <div className="text-gray-800">
                                    {course?.training_mode
                                        ? course.training_mode.charAt(0) + course.training_mode.slice(1).toLowerCase()
                                        : "No mode provided"}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">COURSE START DATE</h3>
                                <div className="text-gray-800">{formatDateOnly(course?.training_start_date)}</div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">COURSE END DATE</h3>
                                <div className="text-gray-800">{formatDateOnly(course?.training_end_date)}</div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">DURATION</h3>
                                <div className="text-gray-800">{course?.training_duration_hours || "No duration provided"} hrs</div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg min-w-0">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">EXAM DETAILS</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="min-w-0">
                                        <div className="text-sm text-gray-600">Exam Name</div>
                                        <div className="font-medium text-gray-800 break-words">
                                            {course?.training_exam_name || "No exam name provided"}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm text-gray-600">Exam Frequency</div>
                                        <div className="font-medium text-gray-800 break-words">
                                            {course?.training_exam_frequency || "No exam frequency provided"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg sm:col-span-2">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">CREATED ON</h3>
                                <div className="text-gray-800">{formatDate(course.created_at) || "-"}</div>
                            </div>

                        </div>
                    </div>
                )}

                {activeTab === "instructors" && (
    <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
                <h3 className="text-lg font-bold text-gray-800">
                    Assigned Instructors
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                    Instructors assigned to this course
                </p>
            </div>

            <span className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 text-sm font-semibold border border-red-100">
                <FiUsers size={15} />
                {course?.instructors?.length || 0}{" "}
                {(course?.instructors?.length || 0) === 1 ? "Instructor" : "Instructors"}
            </span>
        </div>

        {/* Instructor list */}
        {course?.instructors?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {course.instructors.map((instructor, index) => {
                    const name = instructor.instructor_name || "Unnamed Instructor";
                    const photo = getPhotoUrl(instructor.user_profile_photo);

                    return (
                        <div
                            key={instructor.instructor_id}
                            role="button"
                            tabIndex={0}
                            title="View this instructor in the instructor table"
                            onClick={() => goToInstructor(instructor)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    goToInstructor(instructor);
                                }
                            }}
                            className="group relative flex items-start gap-4 p-5 bg-slate-50 rounded-2xl hover:shadow-md transition-all duration-200 min-w-0 cursor-pointer"
                        >
                            {/* Avatar */}
                            <div
                                className={`w-14 h-14 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-white font-bold text-lg shadow-sm bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                            >
                                {photo ? (
                                    <img
                                        src={photo}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    getInitials(name)
                                )}
                            </div>

                            {/* Details */}
                            <div className="min-w-0 flex-1 ">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider">
                                            Instructor {index + 1}
                                        </p>
                                        <p className="text-base font-bold text-gray-800 mt-0.5 break-words">
                                            {name}
                                        </p>
                                    </div>

                                    <span className="inline-flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Assigned
                                    </span>
                                </div>

                                {/* Optional chips: only render when the data exists */}
                                {(instructor.ins_qualification || instructor.ins_experience) && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {instructor.ins_qualification && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-slate-700 text-xs font-medium">
                                                <FiAward size={12} className="shrink-0" />
                                                {instructor.ins_qualification}
                                            </span>
                                        )}
                                        {instructor.ins_experience && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-slate-700 text-xs font-medium">
                                                <FiBriefcase size={12} className="shrink-0" />
                                                {instructor.ins_experience}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-14 px-4 bg-gradient-to-b from-gray-50 to-white border border-dashed border-gray-300 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
                    <FiUsers size={28} />
                </div>

                <h4 className="text-base font-semibold text-gray-700">
                    No instructors assigned
                </h4>

                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    No instructors have been assigned to this training yet. Edit the training to assign one.
                </p>
            </div>
        )}

    </div>
)}

                {activeTab === "books" && (
                    <div className="space-y-4">

                        {course?.books?.length > 0 ? (

                            course.books.map((book) => (

                                <div
                                    key={book.training_book_id}
                                    className="bg-slate-50 p-4 rounded-lg"
                                >

                                    <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                                        <FiBook className="text-red-500 mr-2" /> {book.tb_book_name}
                                    </h3>

                                    <p className="text-gray-600 mt-2">
                                        Chapters: {book.tb_book_chapters || "-"}
                                    </p>

                                </div>

                            ))

                        ) : (

                            <p>No books assigned.</p>

                        )}

                    </div>
                )}

                {activeTab === "topics" && (
                    <div className="space-y-4">

                        {loadingTopics ? (

                            <div className="flex justify-center items-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                <span className="ml-3 text-gray-600 font-medium">
                                    {/* Loading topics... */}
                                    Loading modules...
                                </span>
                            </div>

                        ) : topics.length > 0 ? (

                            topics.map((topic, topicIndex) => (

                                <div
                                    key={topic.topic_id}
                                    className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-5"
                                >

                                    <div className="flex items-start justify-between">

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center shrink-0">
                                                {topicIndex + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    {topic.topic_title}
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-0.5">
                                                    {/* Topic #{topicIndex + 1} */}
                                                    Module #{topicIndex + 1}
                                                </p>
                                            </div>
                                        </div>
                                        {/*
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditTopic && handleEditTopic(topic)}
                                                className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition cursor-pointer"
                                                // title="Edit Topic"
                                                title="Edit Module"
                                            >
                                                <FiEdit2 />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteTopic(topic, fetchTopics)}
                                                className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition cursor-pointer"
                                                // title="Delete Topic"
                                                title="Delete Module"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                        */}

                                    </div>

                                    <div className="border-t border-gray-100 mt-4 pt-4">
                                        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-2">
                                            DESCRIPTION
                                        </p>
                                        <div
                                            className="prose prose-sm max-w-none text-gray-700 description-content"
                                            dangerouslySetInnerHTML={{ __html: topic.topic_description }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 mt-4">
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                                            <FiVideo /> {(lessonsByTopic[topic.topic_id]?.length ?? topic.topic_recording_count ?? 0)} Lessons
                                        </span>
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium">
                                            <FiClock /> {formatDuration(getTopicDuration(topic.topic_id))}
                                        </span>

                                    </div>

                                </div>

                            ))

                        ) : (

                            <p>No topics added.</p>

                        )}

                    </div>
                )}
            </div>

        </div>
    );
};

export default TrainingDetails;