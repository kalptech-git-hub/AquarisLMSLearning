import React, { useEffect, useState } from "react";
import LogoutButton from "../../../components/login/LogoutButton";
import axios from "axios";
import { FiArrowRight, FiVideo, FiFileText } from "react-icons/fi";
import { FaBookOpen, FaUserGraduate, FaPlus, FaChalkboardTeacher } from "react-icons/fa";
import { MdAssignmentTurnedIn } from "react-icons/md";
import { HiOutlineAcademicCap } from "react-icons/hi";
import {
    FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAVY = "#0F172A";
const RED = "#dc2626";
const GRAY = "#9CA3AF"



const ProgressGauge = ({ active, inactive, completed }) => {

    const total = active + inactive + completed;
    const RADIUS = 80;
    const CENTER_X = 110;
    const CENTER_Y = 120;
    const CIRCUMFERENCE = Math.PI * RADIUS;
    const ARC_PATH = "M 30 120 A 80 80 0 0 1 190 120";

    const activeShare = total > 0 ? active / total : 0;
    const inactiveShare = total > 0 ? inactive / total : 0;
    const completedShare = total > 0 ? completed / total : 0;

    const allSegments = [
        { label: "Active", value: active, share: activeShare, color: RED },
        { label: "Completed", value: completed, share: completedShare, color: NAVY },
        { label: "Inactive", value: inactive, share: inactiveShare, color: GRAY },
    ].filter((seg) => seg.value > 0);

    // CHANGED: every segment starts from the SAME point (left end of arc, offset 0).
    // Length alone represents its share — no cumulative stacking.
    // Draw largest FIRST (so it sits in back), smallest LAST (on top),
    // so shorter segments aren't hidden behind longer ones sharing the same start.
    const renderOrder = [...allSegments].sort((a, b) => b.value - a.value);

    const legendItems = [
        { label: "Inactive", value: inactive, color: GRAY },
        { label: "Completed", value: completed, color: NAVY },
        { label: "Active", value: active, color: RED },
    ];

    return (
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-6 sm:gap-10 w-full">
            <svg width="220" height="130" viewBox="0 0 220 130" className="flex-shrink-0">
                <path d={ARC_PATH} fill="none" stroke="#f3f4f6" strokeWidth="18" strokeLinecap="round" />

                {renderOrder.map((seg) => (
                    <path
                        key={seg.label}
                        d={ARC_PATH}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={`${CIRCUMFERENCE * seg.share} ${CIRCUMFERENCE * (1 - seg.share)}`}
                        strokeDashoffset={0}
                    />
                ))}

                <text
                    x="110"
                    y="108"
                    textAnchor="middle"
                    style={{ fontSize: "34px", fontWeight: 700, fill: NAVY }}
                >
                    {total > 0 ? Math.round(activeShare * 100) : 0}%
                </text>
            </svg>

            <div className="flex-1 w-full sm:min-w-[200px] border-t sm:border-t-0 sm:border-l border-gray-100 pt-6 sm:pt-0 sm:pl-10">
                <p className="text-sm font-medium mb-4 text-center sm:text-left" style={{ color: NAVY }}>
                    Course activity
                </p>
                <div className="flex flex-col gap-3 text-sm text-gray-600">
                    {legendItems.map((seg) => (
                        <div key={seg.label} className="flex items-center gap-2">
                            <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: seg.color }}
                            />
                            <span>{seg.label}</span>
                            <span className="ml-auto font-medium" style={{ color: NAVY }}>
                                {seg.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TopCoursesChart = ({ courses = TOP_COURSES }) => {

    if (!courses.length) {
        return (
            <div className="h-56 flex items-center justify-center text-gray-500">
                No enrollments found.
            </div>
        );
    }
    const maxValue = Math.max(...courses.map((c) => c.value), 1);

    return (
        <div className="overflow-x-auto">
            {/* CHANGED: added pt-8 so the top ~2rem is reserved for labels instead of being clipped by overflow-x-auto's forced overflow-y */}
            <div className="flex flex-nowrap items-end gap-6 h-64 px-2 pt-8 min-w-max">
                {courses.map((course) => {
                    const heightPct = Math.max((course.value / maxValue) * 100, 12);

                    return (
                        <div
                            key={course.course_id ?? course.label}
                            className="flex flex-col items-center flex-shrink-0 w-32 sm:w-48"
                        >
                            <div className="w-full h-40 flex items-end relative">
                                <div
                                    className="w-full rounded-lg relative"
                                    style={{
                                        height: `${heightPct}%`,
                                        background: "linear-gradient(180deg, rgba(30,42,74,0.35), rgba(218,50,50,0.35))",
                                    }}
                                >
                                    <span
                                        className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs font-semibold whitespace-nowrap"
                                        style={{ color: NAVY, opacity: 0.6 }}
                                    >
                                        {course.value}
                                    </span>
                                </div>
                            </div>

                            <span
                                className="text-xs mt-3 text-center leading-tight w-full"
                                style={{ color: NAVY, opacity: 0.7 }}
                            >
                                {course.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalEnrollments: 0,
        totalActiveCourses: 0,
        totalInstructors: 0,
    });
    const [topCourses, setTopCourses] = useState([]);

    const [token, setToken] = useState(
        sessionStorage.getItem("token")
    );

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = sessionStorage.getItem("token");

                setLoading(true);

                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/stats`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const topCoursesRes = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/dashboard/top-courses`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (topCoursesRes.data.success) {
                    setTopCourses(
                        topCoursesRes.data.data.map((course) => ({
                            course_id: course.course_id ?? course.training_id,
                            label: course.course_name,
                            value: course.totalEnrollments,
                        }))
                    );
                }

                if (data.success) {
                    setStats((prev) => ({
                        ...prev,
                        ...data.data,
                    }));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };


        fetchDashboardStats();
    }, []);


    const active = stats.totalActiveTrainings || 0;
    const completed = stats.totalCompletedTrainings || 0;
    const inactive = stats.totalInactiveTrainings || 0;


    const statCards = [
        {
            label: "Course Categories",
            value: stats.totalCourses,
            // subLabel: "Active",
            // subValue: stats.totalActiveCourses,
            icon: FaBookOpen,
            gradient: "linear-gradient(135deg, #D7DFE9 0%, #F1F3F6 100%)",
            path: "/admin/add-category",
        },
        {
            label: "Courses",
            value: stats.totalTrainings,
            subLabel: "Active",
            subValue: stats.totalActiveTrainings,
            icon: FileText,
            gradient: "linear-gradient(135deg, #D7DFE9 0%, #F1F3F6 100%)",
            path: "/admin/add-course",
        },
        {
            label: "Enrollments",
            value: stats.totalEnrollments,
            subLabel: "Student",
            subValue: stats.totalStudents,
            icon: MdAssignmentTurnedIn,
            gradient: "linear-gradient(135deg, #F9C9C9 0%, #D7DFE9 100%)",
            path: "/admin/enrollments",
        },
        // {
        //     label: "Instructors",
        //     value: stats.totalInstructors,
        //     icon: FaChalkboardTeacher,
        //     gradient: "linear-gradient(135deg, #D7DFE9 0%, #F9C9C9 100%)",
        //     path: "/admin/instructors",

        // },
        
        {
            label: "Companies",
            value: stats.totalCompanies,
            icon: FaChalkboardTeacher,
            gradient: "linear-gradient(135deg, #D7DFE9 0%, #F9C9C9 100%)",
            path: "/admin/companies",

        },
    ];

    return (

        //{/* was: className="bg-white rounded-2xl shadow-sm overflow-hidden" — overflow-hidden clips*/}
        <div className="bg-white rounded-2xl shadow-sm overflow-x-hidden pb-10">
            {/* Header */}
            {/* was: <div className="p-6 flex flex-wrap items-center justify-between gap-4"> */}
            <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                {/* was: <h1 className="text-3xl font-bold" style={{ color: NAVY }}> */}
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: NAVY }}>
                    Dashboard
                </h1>

                <div className="flex items-center gap-3">
                    {/*
                    <button
                        type="button"
                        onClick={() => {
                            // TODO: hook up to your add-course flow
                        }}
                        // was: className="flex items-center gap-2 px-5 py-2 rounded-full text-white font-medium
                        //            shadow hover:opacity-90 transition"
                        className="flex items-center gap-2 px-5 py-2 rounded-full text-white font-medium
                                   shadow hover:opacity-90 transition min-h-[40px]"
                        style={{ backgroundColor: RED }}
                    >
                        <FaPlus className="text-xs" />
                        Add
                    </button>
                    

                    <button
                        type="button"
                        onClick={() => {
                            
                        }}
                        // was: className="px-5 py-2 rounded-full font-medium border border-gray-300 text-gray-700
                        //            hover:bg-gray-50 transition"
                        className="px-5 py-2 rounded-full font-medium border border-gray-300 text-gray-700
                                   hover:bg-gray-50 transition min-h-[40px]"
                    >
                        Import Data
                    </button>
                    */}
                </div>
            </div>

            {/* Stat cards */}
            {/* was: <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"> */}
            <div className="p-4 sm:p-6 grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map(({ label, value, subLabel, subValue, icon: Icon, gradient, path }) => (
                    <div
                        key={label}
                        onClick={() => navigate(path)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                navigate(path);
                            }
                        }}
                        // was: className="rounded-xl p-5 flex  justify-between"
                        // className="rounded-xl p-3 sm:p-5 flex justify-between"
                        className="rounded-xl p-3 sm:p-5 flex justify-between cursor-pointer
                            transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                            focus:outline-none "
                        style={{ background: gradient }}
                    >
                        <div>
                            {/* was: className="text-sm" */}
                            <p className="text-xs sm:text-sm" style={{ color: NAVY, opacity: 0.65 }}>
                                {label}
                            </p>
                            {/* was: className="text-3xl font-bold mt-1" */}
                            <p className="text-xl sm:text-3xl font-bold mt-1" style={{ color: NAVY }}>
                                {loading ? "—" : value}
                            </p>

                            {subLabel && (
                                // was: className="text-s mt-2 flex items-center gap-1.5"
                                <p className="text-xs sm:text-s mt-2 flex items-center gap-1.5" style={{ color: NAVY, opacity: 0.55 }}>
                                    <span
                                        className="w-1 h-1 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: NAVY }}
                                    />
                                    {subLabel}: {loading ? "—" : subValue}
                                </p>
                            )}
                        </div>
                        {/* was: className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" */}
                        <div
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: NAVY }}
                        >
                            <Icon className="text-sm sm:text-base text-white" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Course activity */}
            {/* was: <div className="px-6 pb-6 pt-2 border-t border-gray-100"> */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100">
                {/* was: <div className="bg-gray-100 rounded-xl p-6 mt-6"> */}
                <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mt-6">
                    <ProgressGauge
                        active={active}
                        completed={completed}
                        inactive={inactive}

                    />
                </div>
            </div>

            {/* Top courses */}
            {/* was: <div className="px-6 pb-6 pt-2 border-t border-gray-100"> */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100">
                {/* was: <div className="bg-gray-100 rounded-xl p-6 mt-6"> */}
                <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mt-6">
                    <p className="text-sm font-medium mb-6" style={{ color: NAVY }}>
                        Top course categories
                    </p>

                    <TopCoursesChart courses={topCourses} />

                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-4">
                        {/* was: <span>→</span> */}
                        <FiArrowRight aria-hidden="true" />
                        <span>Swipe to see more course categories</span>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
