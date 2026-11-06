//LandingCourseDetails.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import {
    FiArrowLeft, FiArrowRight, FiClock, FiBookOpen, FiAward,
    FiUser, FiCheckCircle, FiPlayCircle, FiBook, FiBriefcase, FiFileText,
    FiX, FiCalendar
} from "react-icons/fi";
import { toast } from "react-toastify";
import EnrollmentModal from "../../../components/enrollment/EnrollmentModal";
import { jwtDecode } from "jwt-decode";
import Navbar from "../../../components/lander/Navbar";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

const LandingCourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [course, setCourse] = useState(location.state?.course || null);
    const [loading, setLoading] = useState(!location.state?.course);
    const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem("token"));
    const [openTopics, setOpenTopics] = useState(() => {
        const initialTopics = location.state?.course?.topics;
        return initialTopics?.length > 0 ? [initialTopics[0].topic_id] : [];
    });
    const [previewLesson, setPreviewLesson] = useState(null);
    const hasSetInitialTopic = useRef(Boolean(location.state?.course?.topics?.length));

    const getRole = () => {
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded.role_code;
        } catch (e) {
            return null;
        }
    };
    const role = getRole();
    const isStudentOrVisitor = !role || role === "STD";



    useEffect(() => {
        if (location.state?.course) {
            setCourse(location.state.course);
            setLoading(false);
            return;
        }
        const controller = new AbortController();

        const fetchCourseDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/courses`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        signal: controller.signal,
                    }

                );
                const list = response.data.trainings || response.data.courses || [];
                if (response.data.success && Array.isArray(list)) {
                    const matched = list.find(
                        (c) =>
                            String(c.training_id) === String(id) ||
                            String(c.course_id) === String(id)
                    );

                    if (matched) {
                        setCourse(matched);
                    } else {
                        toast.error("Course not found.");
                    }
                }
            } catch (err) {
                if (axios.isCancel(err)) {
                    return;
                }
                console.error("Failed to load course details:", err);
                toast.error("Failed to load course details.");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        if (id) {
            fetchCourseDetails();
        }

        return () => {
            controller.abort();
        }
    }, [id, location.state, token]);


    useEffect(() => {
        const updateAuth = () => {
            setToken(sessionStorage.getItem("token"));
        };
        window.addEventListener("authChanged", updateAuth);
        return () => window.removeEventListener("authChanged", updateAuth);
    }, []);

    useEffect(() => {
        const activeToken = token || sessionStorage.getItem("token");
        if (course && activeToken) {
            const pendingId = sessionStorage.getItem("pendingEnrollCourseId");
            const isAutoEnroll = location.state?.autoEnroll || (pendingId && (String(pendingId) === String(course.training_id) || String(pendingId) === String(course.course_id) || String(pendingId) === String(id)));
            if (isAutoEnroll) {
                if (role === "STD") {
                    navigate(`/enroll/${course.training_id || course.course_id || id}`, { state: { course } });
                }
                sessionStorage.removeItem("pendingEnrollCourseId");
            }
        }
    }, [course, token, location.state, id, role, navigate]);
    useEffect(() => {
        if (!hasSetInitialTopic.current && course?.topics?.length > 0) {
            setOpenTopics([course.topics[0].topic_id]);
            hasSetInitialTopic.current = true;
        }
    }, [course]);


    const handleEnrollClick = () => {
        const courseId = course?.training_id || course?.course_id || id;
        if (!token) {
            sessionStorage.setItem("pendingEnrollCourseId", courseId);
            sessionStorage.setItem("redirectAfterLogin", `/enroll/${courseId}`);
            toast.info("Please login to complete your course enrollment.");
            navigate("/login", {
                state: {
                    redirectTo: `/enroll/${courseId}`,
                    course
                }
            });
            return;
        }
        navigate(`/enroll/${courseId}`, { state: { course } });
    };

    const handleContinueLearningClick = () => {
        const courseId = course?.training_id || course?.course_id || id;
        navigate(`/student/course/${courseId}/learn`);
    };

    const toggleTopic = (topicId) => {
        setOpenTopics((prev) =>
            prev.includes(topicId)
                ? prev.filter((id) => id !== topicId)
                : [...prev, topicId]
        );
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };



    // lesson_duration is stored in seconds, same assumption as
    // StudentCourseDetails.jsx — keep both in sync if that ever changes.
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

    const getTopicDuration = (topic) =>
        (topic.lessons || []).reduce(
            (sum, lesson) => {
                if (lesson.lesson_content_type === "quiz") {
                    const mins = Number(lesson.quiz_duration_minutes) || (Number(lesson.lesson_duration) > 100 ? Number(lesson.lesson_duration) / 60 : Number(lesson.lesson_duration)) || 15;
                    return sum + (mins * 60);
                }
                if (lesson.lesson_content_type === "text") {
                    return sum + (5 * 60); // Hardcoded 5 min for files
                }
                return sum + (Number(lesson.lesson_duration) || 0);
            },
            0
        );

    const getLessonDuration = (lesson) => {
        if (!lesson) return "";
        if (lesson.lesson_content_type === "quiz") {
            if (lesson.quiz_duration_minutes) {
                return `${lesson.quiz_duration_minutes} min`;
            }
            if (lesson.lesson_duration) {
                const dur = Number(lesson.lesson_duration);
                return dur > 100 ? formatDuration(dur) : `${dur} min`;
            }
            return "15 min";
        }
        if (lesson.lesson_content_type === "text") {
            return "5 min"; // Hardcoded 5 min for files
        }
        return lesson.lesson_duration ? formatDuration(lesson.lesson_duration) : "";
    };



    const hasPreview = (lesson) =>
        Boolean(lesson.lesson_is_free_preview) && Boolean(lesson.lesson_video_url);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };
    const formatFee = (fee) => {
    if (fee === null || fee === undefined || fee === "") return "Cost";
    const num = Number(fee);
    if (isNaN(num)) return fee;
    return num.toLocaleString("en-IN");
};

    const isEnrollmentClosed =
        course?.enrollment_status === "CLOSED" ||
        (Boolean(course?.training_start_date) &&
            new Date(course.training_start_date) <= new Date());

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading course data...</span>
            </div>

        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
                <p className="text-gray-500 mb-6">The requested course could not be found or has been removed.</p>
                <button
                    // onClick={() => navigate("/?tab=courses")}
                    onClick={() => navigate("/courses")}
                    className="px-5 py-2.5 bg-[#1B2340] text-white rounded-lg hover:bg-[#252d52] transition flex items-center gap-2 cursor-pointer"
                >
                    <FiArrowLeft size={18} />
                    Back to Courses
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col pt-24">
            <style>{`
                .formatted-desc ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .formatted-desc ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .formatted-desc li {
                    margin-bottom: 0.25rem !important;
                }
                .formatted-desc a {
                    color: #C0432C !important;
                    text-decoration: underline !important;
                }
                .formatted-desc h3 {
                    font-size: 1.25rem !important;
                    font-weight: 700 !important;
                    margin-top: 1rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .formatted-desc h4 {
                    font-size: 1.1rem !important;
                    font-weight: 600 !important;
                    margin-top: 0.75rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .formatted-desc strong, .formatted-desc b, .formatted-desc p, .formatted-desc span {
                    font-weight: 400 !important;
                }
                .formatted-desc u, .formatted-desc span, .formatted-desc p, .formatted-desc li, .formatted-desc a {
                    text-decoration: none !important;
                }
            `}</style>

            <Navbar />

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 pb-28 space-y-6">
                {/* Back Link */}
                <button
                    // onClick={() => navigate("/?tab=courses")}
                    onClick={() => navigate("/courses")}
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-sm font-semibold text-slate-700 hover:text-[#0E182B] hover:border-slate-400 hover:bg-slate-50 shadow-xs transition-all duration-200 cursor-pointer"
                >
                    <FiArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1 text-slate-500 group-hover:text-[#0E182B]" />
                    Back to Courses
                </button>

                {/* Hero Card  - previous*/}
                <div className="bg-[#1B2340] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-3 py-1 bg-[#C0432C] text-[#FCEBE5] font-semibold text-xs tracking-wide rounded-full uppercase">
                                Level: {course.course_level || "General"}
                            </span>
                            <span className="px-3 py-1 bg-white/10 text-[#E7E4DA] font-semibold text-xs tracking-wide rounded-full uppercase">
                                Mode: {course.training_mode || "Online"}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-bold text-[#F7F3EC] tracking-tight leading-tight">
                            {course.training_title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-[#B9B4A5] pt-1">
                            <div className="flex items-center gap-2">
                                <FiClock size={18} />
                                <span className="font-medium text-[#E7E4DA]">{course.training_duration_hours} Hours</span>
                            </div>
                            {course.training_exam_name && (
                                <div className="flex items-center gap-2">
                                    <FiAward size={18} />
                                    <span>Exam: <strong className="text-[#E7E4DA] font-semibold">{course.training_exam_name}</strong> ({course.training_exam_frequency})</span>
                                </div>
                            )}
                            {(course.training_start_date || course.training_end_date) && (
                                <div className="flex items-center gap-2">
                                    <FiCalendar size={18} />
                                    <span>
                                        {course.training_start_date && (
                                            <>Starts <strong className="text-[#E7E4DA] font-semibold">{formatDate(course.training_start_date)}</strong></>
                                        )}
                                        {course.training_start_date && course.training_end_date && " · "}
                                        {course.training_end_date && (
                                            <>Ends <strong className="text-[#E7E4DA] font-semibold">{formatDate(course.training_end_date)}</strong></>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>


                        {/* was: <div className="flex items-center gap-6 pt-5 border-t border-white/10"> */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-5 border-t border-white/10">
                            <div>
                                <span className="text-xs text-[#8A8677] block uppercase font-bold tracking-widest mb-1">Fee</span>
                                <span className="text-2xl font-bold text-[#F7F3EC]">
                                    ₹{formatFee(course.training_fee)}
                                </span>
                                {isStudentOrVisitor && course.training_start_date && (
                                    <p
                                        className={`text-xs font-medium mt-1.5 ${isEnrollmentClosed ? "text-rose-300" : "text-[#B9B4A5]"
                                            }`}
                                    >
                                        {isEnrollmentClosed
                                            ? course.enrollment_status === "CLOSED" &&
                                                new Date(course.training_start_date) > new Date()
                                                ? "Enrollment is currently closed."
                                                : "Enrollment closed — training has started."
                                            : `Enrollment deadline: ${formatDate(course.training_start_date)}`}
                                    </p>
                                )}
                            </div>

                            {/* {isStudentOrVisitor && (
                                <button
                                    onClick={handleEnrollClick}
                                    className="group flex items-center gap-2 px-6 py-2.5 bg-[#0E182B] hover:bg-slate-800 text-white rounded-full font-bold text-xs transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                                >
                                    Enroll Now
                                    <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                                </button>
                            )} */}

                            {/* {isStudentOrVisitor && (
                                course.is_enrolled ? (
                                    // <button
                                    //     disabled
                                    //     className="px-6 py-2.5 bg-green-100 text-green-700 rounded-full font-bold text-sm cursor-not-allowed"
                                    // >
                                    //     Enrolled
                                    // </button>

                                    <button
                                        onClick={() =>
                                            navigate(`/student/course/${course.training_id}/learn`)
                                        }
                                        className="group flex items-center gap-2 px-6 py-3 bg-rose-500/50 border-rose-700  text-white hover:bg-rose-500/70 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg cursor-pointer"
                                    >
                                        <FiPlayCircle size={18} />
                                        Continue Learning
                                        <FiArrowRight
                                            size={16}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </button>

                                    

                                ) : (
                                    <button
                                        onClick={handleEnrollClick}
                                        className="group flex items-center gap-2 px-6 py-2.5 bg-[#C0432C] hover:bg-[#a8391f] text-white rounded-full font-semibold text-sm transition-all duration-300 active:scale-95 cursor-pointer"
                                    >
                                        Enroll Now
                                        <FiArrowRight
                                            size={16}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </button>
                                )
                            )} */}

                            {isStudentOrVisitor && (
                                course.enroll_status === "A" ? (
                                    <button
                                        onClick={handleContinueLearningClick}
                                        className="group flex items-center gap-2 px-6 py-3 bg-rose-500/50 border-rose-700  text-white hover:bg-rose-500/70 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg cursor-pointer"
                                    >
                                        Continue Learning
                                        <FiArrowRight
                                            size={16}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </button>
                                ) : course.enroll_status === "P" ? (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white/70 rounded-full font-semibold text-sm cursor-not-allowed"
                                    >
                                        Approval Pending
                                    </button>
                                ) : course.enroll_status === "R" ? (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-6 py-3 bg-rose-200 text-red-800 rounded-full font-semibold text-sm cursor-not-allowed"
                                    >
                                        Enrollment Rejected
                                    </button>
                                ) : isEnrollmentClosed ? (
                                    <button
                                        disabled
                                        className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white/50 rounded-full font-semibold text-sm cursor-not-allowed"
                                    >
                                        Enrollment Closed
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEnrollClick}
                                        className="group flex items-center gap-2 px-6 py-2.5 bg-[#C0432C] hover:bg-[#a8391f] text-white rounded-full font-semibold text-sm transition-all duration-300 active:scale-95 cursor-pointer"
                                    >
                                        Enroll Now
                                        <FiArrowRight
                                            size={16}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="order-first md:order-none w-full md:w-76 h-44 md:h-52 rounded-xl overflow-hidden flex-shrink-0 bg-gray-300">
                        {course.training_thumbnail ? (
                            <img
                                src={course.training_thumbnail && /^https?:\/\//i.test(course.training_thumbnail)
                                    ? course.training_thumbnail
                                    : `${import.meta.env.VITE_API_BASE_URL}${course.training_thumbnail}`}
                                alt={course.training_title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4 text-center bg-gray-300">
                                <FiBookOpen size={48} className="mb-2 opacity-70" />
                                <span className="text-sm font-semibold">{course.training_title}</span>
                            </div>
                        )}
                    </div>
                </div>



                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Description & Course Materials */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Overview - previous*/}
                        {/* <div className="bg-[#FFFDF8] rounded-2xl shadow-xl p-6 md:p-7">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#EEE9DB]">
                                <div className="w-9 h-9 rounded-[10px] bg-[#F3D9CE] text-[#7A2C17] flex items-center justify-center flex-shrink-0">
                                    <FiBookOpen size={18} />
                                </div>
                                <h2 className="text-lg font-medium text-[#2B2A26]">
                                    Course Description & Overview
                                </h2>
                            </div>
                            <div
                                className="formatted-desc text-[#6B675C] text-sm leading-relaxed mb-3"
                                dangerouslySetInnerHTML={{ __html: course.training_description }}
                            />
                            <div className="inline-flex items-center gap-1.5 bg-[#F3D9CE] text-[#7A2C17] text-xs font-medium px-3 py-1.5 rounded-full">
                                <FiAward size={14} />
                                {course.course_level || "General"} level
                            </div>
                        </div> */}

                        {/* Course Overview */}
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                                    <FiBookOpen size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Course Description & Overview
                                </h2>
                            </div>
                            <div
                                className="formatted-desc text-slate-600 text-sm leading-relaxed mb-4"
                                dangerouslySetInnerHTML={{ __html: course.training_description }}
                            />
                            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200/60">
                                <FiAward size={14} />
                                {course.course_level || "General"} Level
                            </div>
                        </div>

                        {/* Course Curriculum / Topics - previous */}
                        {/* {course.topics && course.topics.length > 0 && (
                            <div className="bg-[#FFFDF8] rounded-2xl shadow-xl  p-6 md:p-7">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#EEE9DB]">
                                    <div className="w-9 h-9 rounded-[10px] bg-[#F3D9CE] text-[#7A2C17] flex items-center justify-center flex-shrink-0">
                                        <FiBookOpen size={18} />
                                    </div>
                                    <h2 className="text-lg font-medium text-[#2B2A26]">
                                        Course Curriculum
                                    </h2>
                                    <span className="ml-auto text-xs text-[#8A8677]">
                                        {course.topics.length} {course.topics.length === 1 ? "topic" : "topics"}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {course.topics.map((topic, idx) => (
                                        <div
                                            key={topic.topic_id}
                                            // className="border border-[#EEE9DB] rounded-xl overflow-hidden"
                                            className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs transition-all duration-200"
                                        >
                                            <button
                                                onClick={() => toggleTopic(topic.topic_id)}
                                                className="w-full flex items-center justify-between px-5 py-4 bg-red-50 hover:bg-[#F3D9CE] transition cursor-pointer"
                                            >
                                                <div>
                                                    <h3 className="font-bold text-lg text-red-950 text-left">
                                                        Module {idx + 1}
                                                    </h3>

                                                    <p className="text-sm text-red-950 text-left">
                                                        {topic.topic_title}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-red-900">
                                                        {(topic.lessons?.length || topic.topic_recording_count || 0)} {(topic.lessons?.length || topic.topic_recording_count || 0) === 1 ? "Lesson" : "Lessons"}
                                                    </span>

                                                    {openTopics.includes(topic.topic_id) ? (
                                                        <FiChevronDown
                                                            size={18}
                                                            className="text-gray-500"
                                                        />
                                                    ) : (
                                                        <FiChevronRight
                                                            size={18}
                                                            className="text-gray-500"
                                                        />
                                                    )}
                                                </div>
                                            </button>



                                            {openTopics.includes(topic.topic_id) && (
                                                <div className="border-t border-[#EEE9DB] bg-[#ffffff]">
                                                    {topic.lessons?.length > 0 ? (
                                                        topic.lessons.map((lesson, lessonIndex) => {
                                                            const previewable = hasPreview(lesson);

                                                            const rowContent = (
                                                                <>
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div className="w-6 h-6 rounded-full bg-[#F3D9CE] text-[#7A2C17] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                                                            {lessonIndex + 1}
                                                                        </div>

                                                                        <span className="text-sm text-[#2B2A26] truncate">
                                                                            {lesson.lesson_title}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                                        {previewable && (
                                                                            <span className="flex items-center gap-1 text-[10px] font-semibold text-[#7A2C17] bg-[#F3D9CE] px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                                                <FiPlayCircle size={11} />
                                                                                Preview
                                                                            </span>
                                                                        )}

                                                                        {getLessonDuration(lesson) && (
                                                                            <span className="text-xs text-[#8A8677]">
                                                                                {getLessonDuration(lesson)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            );

                                                            if (previewable) {
                                                                return (
                                                                    <button
                                                                        key={lesson.lesson_id}
                                                                        type="button"
                                                                        onClick={() => setPreviewLesson(lesson)}
                                                                        className="w-full flex items-center justify-between px-6 py-3 border-b border-[#F0ECE2] last:border-b-0 text-left hover:bg-[#F3D9CE]/40 transition-colors cursor-pointer"
                                                                    >
                                                                        {rowContent}
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <div
                                                                    key={lesson.lesson_id}
                                                                    className="w-full flex items-center justify-between px-6 py-3 border-b border-[#F0ECE2] last:border-b-0"
                                                                >
                                                                    {rowContent}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="px-6 py-4 text-sm text-[#8A8677]">
                                                            No lessons available
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        {/* Course Curriculum / Topics */}
                        {course.topics && course.topics.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                                        <FiBookOpen size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight min-w-0 flex-1 truncate">
                                        Course Curriculum
                                    </h2>
                                    <span className="flex-shrink-0 whitespace-nowrap text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full">
                                        {course.topics.length} {course.topics.length === 1 ? "Module" : "Modules"}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {course.topics.map((topic, idx) => (
                                        <div
                                            key={topic.topic_id}
                                            className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs transition-all duration-200"
                                        >
                                            <button
                                                onClick={() => toggleTopic(topic.topic_id)}
                                                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 px-5 py-4 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer text-left group"
                                            >
                                                {/* was: className="flex items-center justify-between" on the button — the right side (lessons/duration pill + chevron) was flex-shrink-0 while only the title side had min-w-0, so in a single row the fixed-width right side forced the title to collapse down to almost nothing on phone (e.g. truncating to just "M"). Stacked to flex-col below sm:, so the title gets its own full-width line and the pill+chevron row sits below it; sm: and up reverts to the original single-row layout. */}
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                                        0{idx + 1}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                                                            Module {idx + 1}: {topic.topic_title}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* was: className="flex items-center gap-3 flex-shrink-0" — now sits on its own row below sm: since the parent switched to flex-col; self-end keeps it right-aligned under the title on phone, matching where it visually sat before. sm: and up reverts to the original inline layout via sm:self-auto. */}
                                                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-auto">
                                                    <span className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full shadow-2xs whitespace-nowrap">
                                                        {(topic.lessons?.length || topic.topic_recording_count || 0)} {(topic.lessons?.length || topic.topic_recording_count || 0) === 1 ? "Lesson" : "Lessons"}
                                                        {getTopicDuration(topic) > 0 && (
                                                            <> • {formatDuration(getTopicDuration(topic))}</>
                                                        )}
                                                    </span>

                                                    {openTopics.includes(topic.topic_id) ? (
                                                        <FiChevronDown size={18} className="text-rose-600" />
                                                    ) : (
                                                        <FiChevronRight size={18} className="text-slate-400 group-hover:text-slate-600" />
                                                    )}
                                                </div>
                                            </button>

                                            {openTopics.includes(topic.topic_id) && (
                                                <div className="border-t border-slate-200/80 bg-white divide-y divide-slate-100">
                                                    {topic.lessons?.length > 0 ? (
                                                        topic.lessons.map((lesson, lessonIndex) => {
                                                            const previewable = hasPreview(lesson);

                                                            const rowContent = (
                                                                <>
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                                            {lessonIndex + 1}
                                                                        </div>

                                                                        <span className="text-sm font-medium text-slate-800 truncate">
                                                                            {lesson.lesson_title}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                                        {previewable && (
                                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                                                <FiPlayCircle size={11} />
                                                                                Preview
                                                                            </span>
                                                                        )}

                                                                        {getLessonDuration(lesson) ? (
                                                                            <span className="text-xs text-slate-500 font-medium">
                                                                                {getLessonDuration(lesson)}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </>
                                                            );

                                                            if (previewable) {
                                                                return (
                                                                    <button
                                                                        key={lesson.lesson_id}
                                                                        type="button"
                                                                        onClick={() => setPreviewLesson(lesson)}
                                                                        className="w-full flex items-center justify-between px-6 py-3 border-b border-slate-100 last:border-b-0 text-left hover:bg-rose-50/40 transition-colors cursor-pointer"
                                                                    >
                                                                        {rowContent}
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <div
                                                                    key={lesson.lesson_id}
                                                                    className="w-full flex items-center justify-between px-6 py-3 border-b border-slate-100 last:border-b-0"
                                                                >
                                                                    {rowContent}
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="px-6 py-4 text-xs text-slate-400 italic">
                                                            No lessons available in this module yet.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Textbooks & Materials - previous*/}
                        {/* {course.books && course.books.length > 0 && (
                            <div className="bg-[#FFFDF8] rounded-2xl shadow-xl p-6 md:p-7">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#EEE9DB]">
                                    <div className="w-9 h-9 rounded-[10px] bg-[#F3D9CE] text-[#7A2C17] flex items-center justify-center flex-shrink-0">
                                        <FiBook size={18} />
                                    </div>
                                    <h2 className="text-lg font-medium text-[#2B2A26]">
                                        Textbooks & Course Materials
                                    </h2>
                                    <span className="ml-auto text-xs text-[#8A8677]">
                                        {course.books.length} {course.books.length === 1 ? "item" : "items"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {course.books.map((book, idx) => (
                                        <div key={idx} className="group p-4 rounded-xl border border-[#EEE9DB] bg-[#FFFDF8] hover:border-[#E4DFD1] transition-colors duration-300 flex items-start gap-3">
                                            <div className="w-11 h-11 rounded-[10px] bg-[#F3D9CE] text-[#7A2C17] flex items-center justify-center flex-shrink-0">
                                                <FiFileText size={20} />
                                            </div>
                                            <div className="space-y-0.5 min-w-0">
                                                <h4 className="font-medium text-[#2B2A26] text-sm truncate">{book.tb_book_name}</h4>
                                                <p className="text-xs text-[#8A8677] leading-normal">{book.tb_book_chapters}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        {/* Textbooks & Materials */}
                        {course.books && course.books.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                                        <FiBook size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight min-w-0 flex-1">
                                        Textbooks & Course Materials
                                    </h2>
                                    <span className="flex-shrink-0 whitespace-nowrap text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full">
                                        {course.books.length} {course.books.length === 1 ? "item" : "items"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {course.books.map((book, idx) => (
                                        <div
                                            key={idx}
                                            className="group p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-start gap-3.5"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                                <FiFileText size={20} />
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">
                                                    {book.tb_book_name}
                                                </h4>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                    {book.tb_book_chapters}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Assigned Instructors - previous*/}
                    {/* <div className="space-y-6">
                        <div className="bg-[#FFFDF8] rounded-2xl shadow-xl p-6">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#EEE9DB]">
                                <div className="w-9 h-9 rounded-[10px] bg-[#DCE1EF] text-[#2E3A66] flex items-center justify-center flex-shrink-0">
                                    <FiUser size={18} />
                                </div>
                                <h2 className="text-lg font-medium text-[#2B2A26]">
                                    Course Instructors
                                </h2>
                            </div>

                            {course.instructors && course.instructors.length > 0 ? (
                                <div className="space-y-3">
                                    {course.instructors.map((inst, idx) => {
                                        const displayName = inst.instructor_name || inst.user_full_name || 'Instructor';
                                        return (
                                            <div key={inst.instructor_id || idx} className="group p-3.5 rounded-xl border border-[#EEE9DB] bg-[#FFFDF8] hover:border-[#E4DFD1] transition-colors duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#DCE1EF] text-[#2E3A66] flex-shrink-0 flex items-center justify-center font-medium text-sm">
                                                        {inst.user_profile_photo ? (
                                                            <img
                                                                src={`${import.meta.env.VITE_API_BASE_URL}${inst.user_profile_photo}`}
                                                                alt={displayName}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            getInitials(displayName)
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium text-[#2B2A26] text-sm truncate">
                                                        {displayName}
                                                    </h4>
                                                </div>
                                                {inst.ins_qualification && (
                                                    <p className="text-[11px] text-[#C0432C] font-semibold mt-2 uppercase tracking-wide">
                                                        {inst.ins_qualification}
                                                    </p>
                                                )}
                                                {inst.ins_experience && (
                                                    <p className="text-xs text-[#8A8677] mt-1 flex items-center gap-1 font-medium">
                                                        <FiBriefcase size={12} className="text-[#8A8677]" /> {inst.ins_experience}
                                                    </p>
                                                )}
                                                {inst.ins_bio && (
                                                    <p className="text-xs text-[#8A8677] mt-2.5 line-clamp-3 leading-relaxed border-t border-[#EEE9DB] pt-2 italic">
                                                        "{inst.ins_bio}"
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-[#8A8677] italic">No assigned instructors listed.</p>
                            )}
                        </div>
                    </div> */}

                    {/* Right Column: Assigned Instructors */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <FiUser size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                                    Course Instructors
                                </h2>
                            </div>

                            {course.instructors && course.instructors.length > 0 ? (
                                <div className="space-y-4">
                                    {course.instructors.map((inst, idx) => {
                                        const displayName = inst.instructor_name || inst.user_full_name || 'Instructor';
                                        return (
                                            <div key={inst.instructor_id || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-md">
                                                        {inst.user_profile_photo ? (
                                                            <img
                                                                src={/^https?:\/\//i.test(inst.user_profile_photo)
                                                                    ? inst.user_profile_photo
                                                                    : `${import.meta.env.VITE_API_BASE_URL}${inst.user_profile_photo}`}
                                                                alt={displayName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            getInitials(displayName)
                                                            //   <div className="w-full h-full bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center">
                                                            //       <span className="text-sm font-bold text-red-600">
                                                            //       </span>
                                                            //   </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate">
                                                            {displayName}
                                                        </h4>
                                                        {inst.ins_qualification && (
                                                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 rounded uppercase tracking-wider mt-0.5">
                                                                {inst.ins_qualification}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {inst.ins_experience && (
                                                    <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5 font-medium">
                                                        <FiBriefcase size={14} className="text-slate-400" /> {inst.ins_experience}
                                                    </p>
                                                )}
                                                {inst.ins_bio && (
                                                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed border-t border-slate-200/60 pt-2 italic">
                                                        "{inst.ins_bio}"
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No assigned instructors listed.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Lesson Preview Modal */}
            {previewLesson && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewLesson(null)}
                >
                    <div
                        className="bg-[#0B0D14] rounded-2xl w-full max-w-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 bg-[#ffffff]">
                            <div className="min-w-0">
                                <span className="text-[10px] uppercase tracking-wide font-semibold text-[#cd371d]">
                                    Preview
                                </span>
                                <h3 className="text-[20px] font-semibold text-slate-900 truncate">
                                    {previewLesson.lesson_title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewLesson(null)}
                                className="text-[#4e4e4d] hover:text-slate-900 transition-colors flex-shrink-0 ml-4 cursor-pointer"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="aspect-video bg-black flex items-center justify-center">
                            <video
                                key={previewLesson.lesson_id}
                                src={previewLesson.lesson_video_url}
                                controls
                                autoPlay
                                playsInline
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Enrollment Modal */}
            {selectedCourseForEnroll && (
                <EnrollmentModal
                    course={selectedCourseForEnroll}
                    onClose={() => setSelectedCourseForEnroll(null)}
                />
            )}
        </div>
    );
};

export default LandingCourseDetails;
