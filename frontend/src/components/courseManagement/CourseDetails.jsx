import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiBook, FiBookOpen, FiClock, FiEdit2, FiInfo, FiLayers, FiTrash2, FiUser, FiUsers, FiVideo, FiX } from "react-icons/fi";
import { FiFileText } from "react-icons/fi";


const CourseDetails = ({ course, setViewingCourse, handleEdit, initialTab = "details" }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

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
        //{/* was: className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden" — overflow-hidden clips the bottom content on short phone viewports; overflow-x-hidden preserves horizontal containment without cutting off vertically, pb-10 adds scroll clearance so the last cards fully scroll into view */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-hidden pb-10">
            {/* Header */}
            {/* was: className="p-6 relative" */}
            <div className="p-4 sm:p-6 relative">

                {/* Top Row */}
                {/* was: className="flex justify-between items-start" */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">

                    <div className="flex gap-5 min-w-0">
                        {/* <img
                            src={course.training_thumbnail && /^https?:\/\//i.test(course.training_thumbnail)
                                ? course.training_thumbnail
                                : `${import.meta.env.VITE_API_BASE_URL}${course.training_thumbnail}`}
                            alt={course.course_name}
                            className="w-44 h-28 object-cover rounded-xl border shadow-sm"
                        /> */}

                        <div className="flex-1 min-w-0">
                            {/* was: className="text-3xl font-bold text-gray-800" */}
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
                                {course.course_name}
                            </h1>

                            {/* was: className="flex items-center gap-3 mt-3" */}
                            <div className="flex items-center justify-between gap-3 mt-3">

                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                        {course.course_level}
                                    </span>

                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${course.is_active === 1
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 
                                                ${course.is_active === 1
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                                }`}
                                        />
                                        {course.is_active === 1 ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                {/* Phone-only Edit/Close, aligned with the badges. Hidden at sm: and up. */}
                                <div className="flex gap-2 shrink-0 sm:hidden">
                                    <button
                                        onClick={() => handleEdit(course)}
                                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer"
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

                    {/* Desktop/tablet Edit/Close — original top-right position, hidden on phone. */}
                    <div className="hidden sm:flex gap-2 shrink-0">

                        <button
                            onClick={() => handleEdit(course)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2"
                        >
                            <FiEdit2 size={16} />
                            Edit
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

            <div className="flex justify-center mb-6">
                <div className="inline-flex bg-gray-200 rounded-full p-1">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`px-8 py-2 rounded-full flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer ${activeTab === "details"
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-600 hover:bg-gray-300"
                            }`}
                    >
                        <FiFileText />
                        Course Category Details
                    </button>
                </div>
            </div>

            <div className="p-6">
                {activeTab === "details" && (
                    <div className="space-y-6">
                        {/* Description */}
                        {/* Course Metadata */}




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

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">
                                    LEVEL
                                </h3>
                                <div className="text-gray-800">
                                    {course?.course_level || "No level provided"}
                                </div>
                            </div>
                            

                                <div className=" bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">CREATED ON</h3>
                                    <div className="text-gray-800">{formatDate(course.created_at) || "-"}</div>
                                    

                                </div>
                            

                        </div>

                        {/* Metadata */}

                    </div>
                )}


            </div>

        </div>
    );
};

export default CourseDetails;