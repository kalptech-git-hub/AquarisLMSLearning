import { useEffect, useState } from "react";
import { useParams, useLocation  } from "react-router-dom";
import axios from "axios";
import {
    FiBook,
    FiClock,
    FiUser,
    FiCheckCircle,
    FiPlayCircle,
    FiMic,
    FiFileText,
    FiHelpCircle,
    FiLock,
    FiAlertCircle,
    FiCompass,
    FiArrowLeft,
    FiBookOpen,
    FiCalendar
} from "react-icons/fi";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { TbListCheck } from "react-icons/tb";
import Navbar from "../lander/Navbar";

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};


const stripHtml = (html = "") =>
    html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const sanitizeDescription = (html = "") =>
    html.replace(/<img[^>]*>/gi, "");

const ExpandableDescription = ({ html, limit = 200 }) => {
    const [expanded, setExpanded] = useState(false);
    const cleanHtml = sanitizeDescription(html);
    const plain = stripHtml(cleanHtml);
    const isLong = plain.length > limit;

    if (!isLong) {
        return (
            <div
                className="prose prose-sm max-w-none text-gray-300 description-content"
                dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
        );
    }

    return (
        <div>
            {expanded ? (
                <div
                    className="prose prose-sm max-w-none text-gray-300 description-content"
                    dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />
            ) : (
                /* was: no line clamp on the collapsed summary — on phone the sliced text could still wrap to several lines, pushing the hero taller than expected and forcing object-cover to crop a much larger window of the background image than intended (visible stray text/artifacts from the source graphic). line-clamp-3 caps it at 3 lines on phone, reverting to line-clamp-none from sm: up where the box has more natural room. Comment form here is bare /* *​/ rather than {/* *​/} — curly-brace JSX comments only parse inside a JSX children list; this sits in a plain ternary branch, where a bare comment is required. */
                <p className="text-white/90 max-w-3xl line-clamp-3 sm:line-clamp-none">{plain.slice(0, limit)}…</p>
            )}
            <button
                onClick={() => setExpanded((e) => !e)}
                className="text-sm font-semibold text-white underline underline-offset-2 mt-2 cursor-pointer"
            >
                {expanded ? "Show less" : "Read more"}
            </button>
        </div>
    );
};
const StudentCourseDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const backTo = location.state?.from || "/my-learning";


    const { trainingId } = useParams();

    const [training, setTraining] = useState(null);
    const [completedLessons, setCompletedLessons] = useState({});
    const [loading, setLoading] = useState(true);
    const [accessError, setAccessError] = useState(null);

    useEffect(() => {
        fetchCourseDetails();
    }, [trainingId]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            setAccessError(null);

            const token =
                sessionStorage.getItem("token");

            if (!token) {
                setAccessError({
                    type: "NOT_ENROLLED",
                    message: "Please login to access this course."
                });
                setLoading(false);
                return;
            }

            const [trainingRes, progressRes] = await Promise.all([
                axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/mylearning/details/${trainingId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/lessons-progress/training/${trainingId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
            ]);

            setTraining(trainingRes.data.training);

            const completedMap = {};

            progressRes.data.data.forEach((lesson) => {
                if (lesson.completed) {
                    completedMap[lesson.lesson_id] = true;
                }
            });

            setCompletedLessons(completedMap);

        } catch (error) {
            console.error("Fetch Course Details Error:", error);
            const status = error.response?.status;
            const data = error.response?.data;

            if (status === 404 || data?.errorType === "COURSE_NOT_AVAILABLE") {
                setAccessError({
                    type: "NOT_FOUND",
                    message: data?.message || "Course not available",
                    title: null
                });
            } else if (data?.errorType === "ENROLLMENT_PENDING") {
                setAccessError({
                    type: "PENDING",
                    message: data?.message || "Your enrollment for this course is pending approval",
                    title: data?.trainingTitle || null
                });
            } else if (status === 403 || data?.errorType === "NOT_ENROLLED") {
                setAccessError({
                    type: "NOT_ENROLLED",
                    message: data?.message || "You are not enrolled in this course",
                    title: data?.trainingTitle || null
                });
            } else {
                setAccessError({
                    type: "NOT_FOUND",
                    message: "Course not available or access restricted",
                    title: null
                });
            }
        } finally {
            setLoading(false);
        }
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
            return secs > 0
                ? `${minutes}m ${secs}s`
                : `${minutes} min`;
        }

        return `${secs} sec`;
    };

    const getCourseStatus = (progress) => {
        const value = Number(progress) || 0;

        if (value === 0) return "Not Started";
        if (value === 100) return "Completed";

        return "In Progress";
    };

    const getCourseActionLabel = () => {
        const status = getCourseStatus(training.progress_percent);

        switch (status) {
            case "Not Started":
                return "Start Learning";

            case "Completed":
                return "Review Course";

            default:
                return "Continue Learning";
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="pt-24 flex justify-center items-center py-24 min-h-[50vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                    <span className="ml-3 text-gray-600 font-medium">Loading course data...</span>
                </div>
            </>
        );
    }

    if (accessError) {
        return (
            <>
                <Navbar />
                <div className="min-h-[75vh] pt-24 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 md:p-12 text-center max-w-lg w-full mx-auto">
                        {accessError.type === "NOT_FOUND" ? (
                            <>
                                <div className="w-16 h-16 bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                    <FiAlertCircle size={32} className="text-slate-600" />
                                </div>

                                <span className="inline-block px-3.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 mb-3 uppercase tracking-wider">
                                    Course Not Available
                                </span>

                                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                    Course Not Found
                                </h1>

                                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                    The course you are looking for (ID: <span className="font-mono font-semibold text-slate-800">#{trainingId}</span>) does not exist or is currently not available.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <button
                                        onClick={() => navigate("/courses")}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <FiCompass size={16} /> Browse Courses
                                    </button>
                                    <button
                                        onClick={() => navigate("/my-learning")}
                                        className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <FiArrowLeft size={16} /> My Learning
                                    </button>
                                </div>
                            </>
                        ) : accessError.type === "PENDING" ? (
                            <>
                                <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                    <FiClock size={32} className="text-amber-600" />
                                </div>

                                <span className="inline-block px-3.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 mb-3 uppercase tracking-wider">
                                    Approval Pending
                                </span>

                                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                    Enrollment Pending
                                </h1>

                                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                    {accessError.title ? (
                                        <>Your enrollment for <strong className="text-slate-800">"{accessError.title}"</strong> is currently pending administrator approval.</>
                                    ) : (
                                        <>Your enrollment for this course is pending administrator approval.</>
                                    )} Once approved, you will get full access to the course content and lessons.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <button
                                            onClick={() => navigate(backTo)}
                                            className="w-auto px-3.5 py-2 bg-white border border-slate-200/80 text-slate-700 hover:text-[#0E182B] hover:border-slate-400 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <FiArrowLeft size={14} /> Back
                                        </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                    <FiLock size={30} className="text-rose-600" />
                                </div>

                                <span className="inline-block px-3.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-200 mb-3 uppercase tracking-wider">
                                    Access Restricted
                                </span>

                                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                    You Are Not Enrolled
                                </h1>

                                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                    {accessError.title ? (
                                        <>You have not enrolled in <strong className="text-slate-800">"{accessError.title}"</strong>.</>
                                    ) : (
                                        <>You have not enrolled in this course.</>
                                    )} Please enroll in this course to access the modules, video lectures, and syllabus.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <button
                                        onClick={() => navigate(`/student/course/${trainingId}`)}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-[#C0432C] hover:bg-[#a8391f] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <FiBookOpen size={16} /> View Course & Enroll
                                    </button>
                                    <button
                                        onClick={() => navigate("/my-learning")}
                                        className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <FiArrowLeft size={16} /> My Learning
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </>
        );
    }

    const allLessons =
        (training?.topics?.flatMap(
            topic => topic.lessons || []
        ) || []).filter(
            lesson => lesson.lesson_content_type !== "live"
        );

    /* To prevent Lock lesson from opening */
    const isLessonLocked = (lesson) => {
        const lessonIndex = allLessons.findIndex(
            l => l.lesson_id === lesson.lesson_id
        );

        // First lesson is always unlocked
        if (lessonIndex <= 0) {
            return false;
        }

        const previousLesson = allLessons[lessonIndex - 1];

        return !completedLessons[previousLesson.lesson_id];
    };

    const completedCount =
        allLessons.filter(
            lesson =>
                completedLessons[lesson.lesson_id]
        ).length;

    const THUMB_GRADIENTS = [
        ["#0B1E39", "#22406B"],
        ["#7A1522", "#C41E2E"],
    ];

    const getThumbnailSrc = (thumb) => {
        if (!thumb) return null;

        if (/^https?:\/\//i.test(thumb)) {
            return thumb;
        }

        return `${import.meta.env.VITE_API_BASE_URL}${thumb}`;
    };

    const CourseThumbnail = ({ src, alt }) => {
        const [errored, setErrored] = useState(false);

        const showPlaceholder = !src || errored;

        if (showPlaceholder) {
            return (
                <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                        background:
                            "linear-gradient(135deg, #0B1E39, #22406B)",
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-[0.15]"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)",
                        }}
                    />
                    <FiBook
                        size={48}
                        color="#fff"
                        style={{ opacity: 0.9 }}
                    />
                </div>
            );
        }
        /* was: dual-layer blur+contain hack (blurred scale-110 copy behind, sharp object-contain copy on top) — this was meant to avoid cropping, but it visibly ghosted a second, differently-cropped copy of the image through the blur on wide/mismatched thumbnails (see course/13). Reverted to a single sharp object-cover image, matching the clean full-bleed look on course/12 — every hero now renders one consistent image with no zoom/blur duplicate, at the cost of some edge cropping on thumbnails whose aspect ratio doesn't match the hero box exactly. */
        return (
            <div className="w-full h-full relative">
                <img
                    src={src}
                    alt={alt}
                    onError={() => setErrored(true)}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    };
    /* Total duration for topic */
    const getLessonDurationInSeconds = (lesson) => {
        if (!lesson) return 0;
        switch (lesson.lesson_content_type) {
            case "video":
                return Number(lesson.lesson_duration) || 0;

            case "text":
                return 5 * 60; // Hardcoded 5 min for files

            case "quiz":
                if (lesson.quiz_duration_minutes) {
                    return Number(lesson.quiz_duration_minutes) * 60;
                }
                if (lesson.lesson_duration) {
                    const dur = Number(lesson.lesson_duration);
                    return dur > 100 ? dur : dur * 60;
                }
                return 15 * 60; // 15 min

            default:
                return Number(lesson.lesson_duration) || 0;
        }
    };

    const getLessonDuration = (lesson) => {
        if (!lesson) return "--";
        switch (lesson.lesson_content_type) {
            case "video":
                return formatDuration(lesson.lesson_duration);

            case "text":
                return "5 min"; // Hardcoded 5 min for files

            case "quiz":
                if (lesson.quiz_duration_minutes) {
                    return `${lesson.quiz_duration_minutes} min`;
                }
                if (lesson.lesson_duration) {
                    const dur = Number(lesson.lesson_duration);
                    return dur > 100 ? formatDuration(dur) : `${dur} min`;
                }
                return "15 min";

            default:
                return formatDuration(lesson.lesson_duration) || "--";
        }
    };

    /* Different icons as per the lesson */
    const getLessonIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "video":
                return <FiPlayCircle size={18} className="text-blue-600" />;

            case "text":
                return <FiFileText size={18} className="text-purple-600" />;

            case "quiz":
                return <TbListCheck size={18} className="text-amber-600" />;

            default:
                return <FiPlayCircle size={18} />;
        }
    };

    /* Label as per the lesson */
    const getLessonTypeLabel = (type) => {
        switch (type?.toLowerCase()) {
            case "video":
                return "Video";

            case "text":
                return "File";

            case "quiz":
                return "Quiz";

            default:
                return "Lesson";
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-[100dvh] shrink-0 px-4 pb-32 pt-24 sm:px-6 sm:pb-20">
                <div className="mx-auto w-full max-w-7xl">
                {/* Breadcrumb */}

                <div className="flex items-center gap-2 text-xs sm:text-sm mb-2.5 sm:mb-3">

                    {/* <Link
                        to="/my-learning"
                        className="text-slate-500 hover:text-[#271042] transition-colors"
                    >
                        My Learning
                    </Link>

                    <span className="text-gray-300">/</span>

                    <span className="text-[#271042] font-semibold truncate">
                        {training.training_title}
                    </span> */}
                    <button
                         onClick={() => navigate(backTo)}
                        className="w-auto self-start px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-200/80 text-slate-700 hover:text-[#0E182B] hover:border-slate-400 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                    >
                        <FiArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Back
                    </button>

                </div>


                {/* Course Hero Banner */}
                <div className="bg-[#1B2340] rounded-2xl sm:rounded-3xl p-5 md:p-7 flex flex-col md:flex-row gap-5 md:gap-6 items-center justify-between mb-3 sm:mb-3.5 shadow-xl border border-slate-700/30">
                    {/* Left: Course Info & Details */}
                    <div className="flex-1 space-y-2.5 sm:space-y-3 w-full">
                        {/* Level Badge */}
                        <span className="inline-block px-3.5 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                            {training.course_level}
                        </span>

                        {/* Course Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                            {training.training_title}
                        </h1>

                        {/* Course Description */}
                        <div className="text-white/90 text-sm max-w-2xl">
                            <ExpandableDescription
                                html={training?.training_description || "No description provided"}
                                limit={200}
                            />
                        </div>

                        {/* Metadata Row: Instructors, Duration, Modules, Dates */}
                        <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 text-sm text-white/90 pt-2 sm:pt-2.5">
                            {training.instructor_names && (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <FiUser size={16} />
                                    <span>{training.instructor_names}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <FiClock size={16} />
                                <span>{training.training_duration_hours} Hours</span>
                            </div>

                            <div>
                                <span>{training.topics?.length || 0} Modules</span>
                            </div>

                            {((training.training_start_date || training.start_date) || (training.training_end_date || training.end_date)) && (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <FiCalendar size={16} className="text-red-400 shrink-0" />
                                    <span className="flex flex-wrap items-center gap-1.5">
                                        {(training.training_start_date || training.start_date) && (
                                            <span>Start: <strong className="text-white font-semibold">{formatDate(training.training_start_date || training.start_date)}</strong></span>
                                        )}
                                        {(training.training_start_date || training.start_date) && (training.training_end_date || training.end_date) && (
                                            <span className="text-white/40 mx-0.5">•</span>
                                        )}
                                        {(training.training_end_date || training.end_date) && (
                                            <span>End: <strong className="text-white font-semibold">{formatDate(training.training_end_date || training.end_date)}</strong></span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Standalone Thumbnail Card */}
                    <div className="order-first md:order-none w-full md:w-80 lg:w-96 h-40 sm:h-44 md:h-48 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-800 shadow-lg border border-white/10 relative">
                        <CourseThumbnail
                            seed={training.training_id}
                            src={getThumbnailSrc(training.training_thumbnail)}
                            alt={training.training_title}
                        />
                    </div>
                </div>

                {/* 3 Stats Cards (Modules, Lessons, Duration) */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 mb-3.5 sm:mb-4">

                    <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 px-3 sm:px-4 border border-gray-200 shadow-xs">
                        <p className="text-gray-500 text-[11px] sm:text-xs font-medium">Modules</p>
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">
                            {training.topics?.length || 0}
                        </h3>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 px-3 sm:px-4 border border-gray-200 shadow-xs">
                        <p className="text-gray-500 text-[11px] sm:text-xs font-medium">Lessons</p>
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">
                            {training.topics?.reduce(
                                (total, topic) =>
                                    total + (topic.lessons?.length || 0),
                                0
                            )}
                        </h3>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3 px-3 sm:px-4 border border-gray-200 shadow-xs">
                        <p className="text-gray-500 text-[11px] sm:text-xs font-medium">Duration</p>
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-0.5">
                            {training.training_duration_hours} hrs
                        </h3>
                    </div>

                </div>


                {/* Content */}

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left */}

                    <div className="lg:col-span-2 space-y-4 mb-6">
                        <h3 className="font-semibold">Course Content</h3>
                        {training.topics?.map((topic, index) => {

                            const visibleLessons = (topic.lessons || []).filter(
                                lesson => lesson.lesson_content_type !== "live"
                            );

                            const totalLessons = visibleLessons.length;

                            const topicCompletedCount =
                                visibleLessons.filter(
                                    lesson =>
                                        completedLessons[lesson.lesson_id]
                                ).length;


                            // Previous
                            // const totalDuration =
                            //     topic.lessons?.reduce(
                            //         (sum, lesson) => sum + (Number(lesson.lesson_duration) || 0),
                            //         0
                            //     ) || 0;

                            // New added - to calculate the hardcoded File/Quiz duration
                            const totalDuration =
                                visibleLessons.reduce(
                                    (sum, lesson) =>
                                        sum + getLessonDurationInSeconds(lesson),
                                    0
                                );

                            return (

                                <div
                                    key={topic.topic_id}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                                >

                                    {/* was: className="... flex justify-between items-center" — with no wrap, the title and the lessons/duration/completed meta group sat side by side and fought for space at 375px: the title wrapped to two lines while the meta text got squeezed into the remaining sliver instead of dropping below it (visible overlap in phone screenshots). Switched to flex-col on phone (title, then meta, stacked with gap-2) reverting to the original flex-row/justify-between/items-center from sm: up, where there's enough width for both on one line as before. */}
                                    <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

                                        <div className="min-w-0">
                                            <h3 className="font-bold text-lg text-slate-800">
                                                Module {index + 1}: {topic.topic_title}
                                            </h3>
                                            {/* <p className="text-sm text-gray-600">
                                        {topic.topic_title}
                                    </p> */}
                                        </div>

                                        {/* <span className="text-sm text-gray-500">
                                        {topic.lessons?.length || 0} Lessons
                                    </span> */}

                                        {/* <div className="text-right">
                                        <div className="text-sm text-gray-500">
                                            {topic.lessons?.length || 0} Lessons
                                        </div>

                                        <div className="text-xs text-emerald-600 font-semibold">
                                            {topicCompletedCount}/{topic.lessons?.length || 0} done
                                        </div>
                                    </div> */}

                                        {/* was: className="flex items-center gap-2 mt-1.5 text-xs text-slate-400" — mt-1.5 was spacing this row below the title when both sat in the same flex-row. Now that the parent stacks with its own gap-2 on phone, mt-1.5 there would double up the spacing, so it's dropped to mt-0 on phone and kept at mt-1.5 from sm: up (unchanged desktop spacing). flex-wrap added so the three lesson/duration/completed badges can wrap onto a second line on very narrow screens instead of overflowing, with gap-x-2 gap-y-1 replacing the single gap-2 to keep both directions tidy. */}
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0 sm:mt-1.5 text-xs text-slate-400">

                                            <span>
                                                {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                                            </span>
                                            <span>•</span>

                                            <span className="flex items-center gap-1">
                                                <FiClock className="text-[10px]" />
                                                {formatDuration(totalDuration)}
                                            </span>

                                            <span>•</span>

                                            <span className="text-emerald-600 font-medium">
                                                {topicCompletedCount}/{totalLessons} completed
                                            </span>

                                        </div>

                                    </div>

                                    {visibleLessons.length > 0 ? (
                                        visibleLessons.map((lesson) => (
                                            // <div
                                            //     key={lesson.lesson_id}
                                            //     // New line added
                                            //     onClick={() =>
                                            //         navigate(
                                            //             `/student/course/${training.training_id}/learn?lessonId=${lesson.lesson_id}`
                                            //         )
                                            //     }
                                            //     className="flex items-center justify-between px-6 py-4 border-t border-gray-300 hover:bg-blue-50 transition"
                                            // >

                                            <div
                                                key={lesson.lesson_id}
                                                onClick={() => {
                                                    if (isLessonLocked(lesson)) {
                                                        return;
                                                    }

                                                    navigate(
                                                        `/student/course/${training.training_id}/learn?lessonId=${lesson.lesson_id}`
                                                    );
                                                }}
                                                className={`flex items-center justify-between px-6 py-4 border-t border-gray-300 transition
                                                ${isLessonLocked(lesson)
                                                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                                                        : "hover:bg-blue-50 cursor-pointer"
                                                    }
                                            `}
                                            >

                                                <div className="flex items-center gap-3">

                                                    {/* <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <FiPlayCircle
                                                        size={18}
                                                        className="text-blue-600"
                                                    />
                                                </div> */}

                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center 
                                                        ${completedLessons[lesson.lesson_id]
                                                                ? "bg-emerald-100"
                                                                : "bg-blue-100"
                                                            }
                                                    `}
                                                    >
                                                        {/* {completedLessons[lesson.lesson_id] ? (
                                                        <FiCheckCircle
                                                            size={18}
                                                            className="text-emerald-600"
                                                        />
                                                    ) : (
                                                        // <FiPlayCircle
                                                        //     size={18}
                                                        //     className="text-blue-600"
                                                        // />
                                                        getLessonIcon(lesson.lesson_content_type)

                                                    )} */}

                                                        {/* Display Lock */}
                                                        {isLessonLocked(lesson) ? (
                                                            <FiLock
                                                                size={18}
                                                                className="text-slate-400"
                                                            />
                                                        ) : completedLessons[lesson.lesson_id] ? (
                                                            <FiCheckCircle
                                                                size={18}
                                                                className="text-emerald-600"
                                                            />
                                                        ) : (
                                                            getLessonIcon(lesson.lesson_content_type)
                                                        )}
                                                    </div>

                                                    <div>
                                                        {/* <p className="font-medium">
                                                        {lesson.lesson_title}
                                                    </p> */}

                                                        <p
                                                            className={`font-medium ${isLessonLocked(lesson)
                                                                ? "text-gray-400"
                                                                : "text-gray-900"
                                                                }`}
                                                        >
                                                            {lesson.lesson_title}
                                                        </p>

                                                        {/* <p className="text-xs text-gray-500">
                                                        Video Lesson
                                                    </p> */}

                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {/* {lesson.lesson_content_type} */}
                                                            {getLessonTypeLabel(lesson.lesson_content_type)}

                                                            {isLessonLocked(lesson) && (
                                                                <span className="ml-2 text-amber-600 font-medium">
                                                                    • Locked
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>

                                                </div>

                                                <span className="text-sm text-gray-500">
                                                    {/* {formatDuration(lesson.lesson_duration)} */}
                                                    {getLessonDuration(lesson)}

                                                </span>

                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-5 text-gray-500">
                                            No lessons available
                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>

                    {/* Right */}

                    <div className="space-y-6">

                        {/* <div className="bg-white border border-gray-300 rounded-3xl p-6">

                        <h3 className="text-gray-500 mb-3">
                            Your Progress
                        </h3>

                        <h2 className="text-5xl font-bold">
                            {training.progress_percent}%
                        </h2>

                        <div className="mt-4 h-3 bg-gray-100 rounded-full">

                            <div
                                className="h-full bg-red-500 rounded-full"
                                style={{
                                    width: `${training.progress_percent}%`
                                }}
                            />

                        </div>

                        <button className="mt-6 w-full bg-[#271042] text-white py-3 rounded-xl">
                            Continue Learning
                        </button>

                    </div> */}

                        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">

                            <h3 className="font-semibold text-gray-700 mb-4">
                                Course Progress
                            </h3>

                            <div className="text-center mb-6">

                                <h2 className="text-5xl font-black text-[#271042]">
                                    {training.progress_percent || 0}%
                                </h2>

                                {/* <p className="text-gray-500 text-sm">
                                Completed
                            </p> */}

                                <p className="text-sm text-emerald-600 font-semibold mt-2">
                                    {completedCount}/{allLessons.length} Completed
                                </p>

                            </div>

                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                                    style={{
                                        width: `${training.progress_percent || 0}%`
                                    }}
                                />

                            </div>

                            <button
                                onClick={() => {
                                    // Continue learning route
                                    // navigate(`/student/course/${training.training_id}/learn?tab=speaking`);
                                    navigate(`/student/course/${training.training_id}/learn`);
                                }}
                                className="mt-6 w-full bg-[#271042] hover:bg-[#35175a]
                                text-white py-3 rounded-xl font-semibold transition cursor-pointer"
                            >
                                {/* Continue Learning */}
                                {getCourseActionLabel()}

                            </button>
                        </div>


                        {/* ---- PRONUNCIATION CARD ----
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <FiMic className="text-red-600" size={18} />
                            </div>

                            <h3 className="font-semibold text-gray-800">
                                Speaking Practice
                            </h3>
                        </div>

                        <p className="text-gray-500 text-sm mb-5">
                            Practice pronunciation for phrases in this training.
                        </p>

                        <button
                            onClick={() =>
                                navigate(`/student/course/${training.training_id}/speaking-practice`)
                            }
                            className="w-full bg-[#271042] hover:bg-[#35175a] text-white py-3 rounded-xl font-semibold transition cursor-pointer"
                        >
                            Start Practice
                        </button>
                    </div> */}

                        {/*

                    <div className="bg-white border border-gray-300 rounded-3xl p-6">

                        <h3 className="font-semibold mb-4">
                            Prerequisite
                        </h3>

                        <p className="text-gray-600">
                            Regular N5 Course recommended
                        </p>

                    </div>
                                        */}

                    </div>

                </div>

                {/* bottom spacer so the last card never sits under mobile bars */}
                <div className="h-24 sm:h-0" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
                </div>
            </div>
        </>
    );
};

export default StudentCourseDetails;