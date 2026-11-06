// InstructorDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBookOpen, FaUserGraduate, FaChalkboardTeacher, FaPlus } from "react-icons/fa";
import { MdAssignmentTurnedIn } from "react-icons/md";
import { FiArrowRight, FiVideo, FiFileText } from "react-icons/fi";
import { TbListCheck } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

const NAVY = "#152B66";
const RED = "#dc2626";


const STUDENTS_PER_COURSE = [
    { label: "JLPT N5 Advanced Course", value: 42 },
    { label: "Japanese N4 Elementary", value: 35 },
    { label: "Conversational Japanese", value: 28 },
    { label: "Business Japanese", value: 15 },
];

const StudentsPerCourseChart = ({ courses = STUDENTS_PER_COURSE }) => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const normalizedCourses = courses.map((course) => ({
        label: course.training_title || course.label,
        value: Number(course.total_students ?? course.value ?? 0),
    }));

    const maxValue = Math.max(...normalizedCourses.map((c) => c.value), 1);

    if (!normalizedCourses.length) {
        return (
            <div className="h-56 flex items-center justify-center text-gray-500">
                No enrollments found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto -mx-2 px-2">
            {/* CHANGED: added pt-8 for the same reason as the admin chart */}
            <div className="flex items-end gap-5 h-56 px-2 pt-8 min-w-max">
                {normalizedCourses.map((course) => (
                    <div
                        key={course.label}
                        className="relative flex flex-col items-center h-full justify-end flex-shrink-0 w-24 sm:w-40"
                    >
                        <div className="w-full flex-1 flex items-end rounded-t-lg overflow-visible bg-gray-100 relative">
                            <div
                                className="w-full rounded-t-lg relative"
                                style={{
                                    height: `${(course.value / maxValue) * 100}%`,
                                    background:
                                        "linear-gradient(180deg, rgba(30,42,50,0.35), rgba(218,50,50,0.35))",
                                }}
                            >
                                <span
                                    className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs font-semibold whitespace-nowrap"
                                    style={{ color: NAVY, opacity: 0.6 }}
                                >
                                    {course.value}
                                </span>
                            </div>

                            {selectedCourse === course.label && (
                                <div className="absolute z-50 sm:hidden bottom-12 left-1/2 -translate-x-1/2 w-max max-w-[180px] bg-white text-[#152B66] text-xs px-3 py-2 rounded-lg border border-gray-200 shadow-md text-center">
                                    {course.label}
                                </div>
                            )}
                        </div>
                        <span
                            className="text-xs mt-3 text-center leading-tight truncate w-full cursor-pointer"
                            style={{ color: NAVY, opacity: 0.7 }}
                            title={course.label}
                            onClick={() => {
                                setSelectedCourse(
                                    selectedCourse === course.label ? null : course.label
                                );
                            }}
                        >
                            {course.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ContentStatsChart = ({ videos, pdfs, quizzes }) => {

    const bars = [
        {
            label: "Videos",
            value: videos,
            icon: FiVideo,
            color: "#000000",
            gradient: "linear-gradient(180deg, rgba(21,43,102,0.65), rgba(21,43,102,0.25))",
        },
        {
            label: "PDFs",
            value: pdfs,
            icon: FiFileText,
            color: "#000000",
            gradient: "linear-gradient(180deg, rgba(220,38,38,0.6), rgba(220,38,38,0.2))",
        },
        {
            label: "Quizzes",
            value: quizzes,
            icon: TbListCheck,
            color: "#000000",
            gradient: "linear-gradient(180deg, rgba(180,83,9,0.6), rgba(180,83,9,0.2))",
        },
    ];

    const maxValue = Math.max(videos, pdfs, quizzes, 1);

    return (
        <div className="flex items-end justify-center gap-10 h-56 px-2">
            {bars.map(({ label, value, icon: Icon, color, gradient }) => (
                <div
                    key={label}
                    className="flex flex-col items-center h-full justify-end w-24"
                >
                    <span
                        className="text-lg font-bold mb-2"
                        style={{ color }}
                    >
                        {value}
                    </span>

                    <div className="w-full flex-1 flex items-end rounded-t-lg overflow-hidden bg-gray-200/70">
                        <div
                            className="w-full rounded-t-lg transition-all duration-500"
                            style={{
                                height: `${(value / maxValue) * 100}%`,
                                background: gradient,
                            }}
                        />
                    </div>

                    <div className="flex items-center gap-1.5 mt-3">
                        <Icon size={13} style={{ color }} />
                        <span
                            className="text-xs font-medium"
                            style={{ color: NAVY, opacity: 0.7 }}
                        >
                            {label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const CONTENT_COLORS = {
    videos: "#152B66",
    pdfs: "#FF4040",
    quizzes: "#F5A7A6",
};

const MaterialPieChart = ({ yours, totals }) => {
    const yourTotal = yours.videos + yours.pdfs + yours.quizzes;
    const grandTotal = Math.max(
        totals.videos + totals.pdfs + totals.quizzes,
        1
    );
    const pct = Math.min((yourTotal / grandTotal) * 100, 100);

    const rows = [
        {
            label: "Videos",
            you: yours.videos,
            total: totals.videos,
            icon: FiVideo,
            color: CONTENT_COLORS.videos,
        },
        {
            label: "PDFs",
            you: yours.pdfs,
            total: totals.pdfs,
            icon: FiFileText,
            color: CONTENT_COLORS.pdfs,
        },
        {
            label: "Quizzes",
            you: yours.quizzes,
            total: totals.quizzes,
            icon: TbListCheck,
            color: CONTENT_COLORS.quizzes,
        },
    ];

    const gradientStops = [];
    let cursor = 0;

    rows.forEach(({ you, color }) => {
        const share = (you / grandTotal) * 100;
        if (share > 0) {
            gradientStops.push(`${color} ${cursor}% ${cursor + share}%`);
            cursor += share;
        }
    });

    gradientStops.push(`#E5E7EB ${cursor}% 100%`);

    const conicGradient = `conic-gradient(${gradientStops.join(", ")})`;

    return (

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-30 w-full py-2">
            <div
                className="relative rounded-full shrink-0 sm:ml-17 mt-4"
                style={{
                    width: 180,
                    height: 180,
                    background: conicGradient,
                }}
            >
                <div
                    className="absolute inset-0 m-auto rounded-full bg-white flex flex-col items-center justify-center"
                    style={{ width: 112, height: 112 }}
                >
                    <span
                        className="text-2xl font-bold"
                        style={{ color: NAVY }}
                    >
                        {Math.round(pct)}%
                    </span>

                    <span
                        className="text-xs"
                        style={{ color: NAVY, opacity: 0.6 }}
                    >
                        by you
                    </span>
                </div>
            </div>

            {/* was: className="flex-1 min-w-[260px]" — the fixed 260px minimum forced this
                column wider than the available card width on narrower phones (e.g. Galaxy
                phones), pushing the value numbers (11/13, 15/15, etc.) past the card edge.
                Now full width on phone so it can shrink to fit; sm: and up reopens the
                original flex-1 + min-w-[260px] behavior once there's room beside the donut. */}
            <div className="w-full sm:flex-1 sm:min-w-[260px]">
                {rows.map(({ label, you, total, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="flex items-center justify-between py-1.5"
                    >
                        <span className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: color }}
                            />

                            <Icon
                                size={17}
                                strokeWidth={2}
                                style={{ color }}
                            />

                            <span
                                className="text-sm"
                                style={{ color: NAVY, opacity: 0.75 }}
                            >
                                {label}
                            </span>
                        </span>

                        <span
                            className="text-sm font-semibold"
                            style={{ color: NAVY }}
                        >
                            {you}/{total}
                        </span>
                    </div>
                ))}

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200">
                    <span className="flex items-center gap-2">


                        <span
                            className="text-sm font-medium"
                            style={{ color: NAVY }}
                        >
                            Total
                        </span>
                    </span>

                    <span
                        className="text-sm font-bold"
                        style={{ color: NAVY }}
                    >
                        {yourTotal}/{grandTotal}
                    </span>
                </div>
            </div>
        </div>
    );
};

const TOPIC_PROGRESS = []; // kept for fallback if needed

const normalizeTopicProgress = (topicProgress) => {
    return (topicProgress || []).map((topic) => ({
        course: topic.course_title || topic.course || "Unknown course",
        done: Number(topic.completed ?? 0),
        remaining: Number(topic.remaining ?? 0),
    }));
};

const InstructorDashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalCoursesTeaching: 0,
        totalStudentsEnrolled: 0,
        studentsEnrolledPerCourse: [],
        contentStats: {
            videos: 0,
            pdfs: 0,
            quizzes: 0,
        },
        totalContentStats: {
            videos: 0,
            pdfs: 0,
            quizzes: 0,
        },
        topicProgressByCourse: [],
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/instructor/stats`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setStats({
                        totalCoursesTeaching: response.data.data.totalCoursesTeaching ?? 0,
                        totalStudentsEnrolled: response.data.data.totalStudentsEnrolled ?? 0,
                        studentsEnrolledPerCourse: response.data.data.studentsEnrolledPerCourse || [],
                        contentStats: response.data.data.contentStats || {
                            videos: 0,
                            pdfs: 0,
                            quizzes: 0,
                        },
                        totalContentStats: response.data.data.totalContentStats || {
                            videos: 0,
                            pdfs: 0,
                            quizzes: 0,
                        },
                        topicProgressByCourse: response.data.data.topicProgressByCourse || [],
                    });
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchDashboardStats();
    }, []);

    const { videos, pdfs, quizzes } = stats.contentStats;

    const statCards = [
        {
            label: "Courses",
            value: stats.totalCoursesTeaching,
            icon: FaBookOpen,
            gradient: "linear-gradient(135deg, #D7DFE9 0%, #F1F3F6 100%)",
            path: "/instructor/my-courses",
        },
        {
            label: "Students Enrolled",
            value: stats.totalStudentsEnrolled,
            icon: FaUserGraduate,
            gradient: "linear-gradient(135deg, #F9C9C9 0%, #FBEAEA 100%)",
            path: "/instructor/student-enrollments"
        },
        // {
        //     label: "Lessons Completed",
        //     value: stats.totalLessonsCompleted,
        //     icon: MdAssignmentTurnedIn,
        //     gradient: "linear-gradient(135deg, #F9C9C9 0%, #D7DFE9 100%)",
        // },
        // {
        //     label: "Lessons Remaining",
        //     value: stats.totalLessonsRemaining,
        //     icon: FaChalkboardTeacher,
        //     gradient: "linear-gradient(135deg, #D7DFE9 0%, #F9C9C9 100%)",
        // },
    ];

    return (

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold" style={{ color: NAVY }}>
                    Dashboard
                </h1>

                <div className="flex items-center gap-3">
                    {/*
                    <button
                        type="button"
                        onClick={() => {
                          
                        }}
                        className="flex items-center gap-2 px-5 py-2 rounded-full text-white font-medium
                                   shadow hover:opacity-90 transition"
                        style={{ backgroundColor: RED }}
                    >
                        <FaPlus className="text-xs" />
                          Add
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => {
                            
                        }}
                        className="px-5 py-2 rounded-full font-medium border border-gray-300 text-gray-700
                                   hover:bg-gray-50 transition"
                    >
                        Import Data
                    </button>
                    */}

                </div>
            </div>

            {/* was: className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4" — grid-cols-1
                stacked the two stat cards full-width on phone (below sm:). Switched to a plain
                grid-cols-2 that applies at every breakpoint, so they always sit side by side —
                tablet/desktop are unaffected since they were already at 2 columns via sm:/xl:.
                Padding and text scaled down on phone (p-3/text-xl/icon w-8 h-8), reopening to the
                original p-5/text-2xl/w-10 h-10 from sm: up — same scaling pattern AdminDashboard
                already uses for its own stat cards. */}
            <div className="p-4 sm:p-6 grid grid-cols-2 gap-3 sm:gap-4">
                {statCards.map(({ label, value, icon: Icon, gradient, path }) => (
                    <div
                        key={label}
                        onClick={() => path && navigate(path)}
                        // className="rounded-xl p-3 sm:p-5 flex items-center justify-between"
                        className={`rounded-xl p-3 sm:p-5 flex items-center justify-between ${path
                            ? "cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                            : ""
                            }`}
                        style={{ background: gradient }}
                    >
                        <div>
                            <p className="text-xs sm:text-sm" style={{ color: NAVY, opacity: 0.65 }}>
                                {label}
                            </p>
                            <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: NAVY }}>
                                {value}
                            </p>
                        </div>
                        <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: NAVY }}
                        >
                            <Icon className="text-sm sm:text-base text-white" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Course material uploaded by me */}
            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mt-6">
                    <p className="text-sm font-medium mb-2" style={{ color: NAVY }}>
                        Course material
                    </p>
                    <MaterialPieChart
                        yours={{ videos, pdfs, quizzes }}
                        totals={stats.totalContentStats}
                    />
                </div>
            </div>

            {/* Students per course */}
            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                <div className="bg-gray-100 rounded-xl p-6 mt-6">
                    <p className="text-sm font-medium mb-6" style={{ color: NAVY }}>
                        Students enrolled per course
                    </p>
                    <StudentsPerCourseChart courses={stats.studentsEnrolledPerCourse} />
                    {/* New: swipe hint, phone only — matches AdminDashboard's TopCoursesChart
                        hint, since this chart now scrolls the same way below sm:. */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3">
                        {/* was: <span>→</span> */}
                        <FiArrowRight aria-hidden="true" />
                        <span>Swipe to see more courses</span>
                    </div>
                </div>
            </div>
            {/*
            //Topic / lesson breakdown per course 
            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                <div className="bg-gray-100 rounded-xl p-6 mt-6">
                    <p className="text-sm font-medium mb-6" style={{ color: NAVY }}>
                        Topics completed by course
                    </p>

                    <div className="space-y-4">
                        {normalizeTopicProgress(stats.topicProgressByCourse).map(({ course, done, remaining }) => {
                            const total = done + remaining;
                            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                            return (
                                <div key={course}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span style={{ color: NAVY }} className="font-medium">
                                            {course}
                                        </span>
                                        <span style={{ color: NAVY, opacity: 0.6 }}>
                                            {done}/{total} topics
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-linear-to-r from-blue-900 to-blue-950"
                                            style={{
                                                width: `${pct}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            */}
        </div>
    );
};

export default InstructorDashboard;
