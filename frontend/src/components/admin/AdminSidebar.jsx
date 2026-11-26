import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Library,
    FileText,
    User,
    UserCheck,
    UserStar,
    X,
    ChevronDown,
} from "lucide-react";
import LogoutButton from "../login/LogoutButton";
import { getCurrentUser } from "../../utils/auth";
import { useState } from "react";
import { useEffect } from "react";

const menuItems = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/admin/dashboard",
    },
    // {
    //     name: "Instructors",
    //     icon: User,
    //     path: "/admin/instructors",
    // },
    {
        name: "Companies",
        icon: User,
        path: "/admin/companies",
    },
    {
        name: "Course Categories",
        icon: BookOpen,
        path: "/admin/add-category",  // was add-course
    },
    {
        name: "Courses",
        icon: FileText,
        path: "/admin/add-course",  //was add-training
    },

    {
        name: "Report",
        icon: FileText,
        // path: "/admin/add-course",  //was add-training
        children: [
            {
                name: "Company Course Report",
                path: "/admin/company-course",
                icon: FileText,
            },

        ],
    },

    // {
    //     name: "Student Enrollments",
    //     icon: UserCheck,
    //     path: "/admin/enrollments",
    // },
];

// isOpen / onClose control the phone/tablet drawer state (< md). On desktop (md+) the
// sidebar ignores them and is always visible in its normal flex position.
const AdminSidebar = ({ isOpen = false, onClose = () => { } }) => {
    const user = getCurrentUser();
    const location = useLocation();

    // Automatically expand Report if its submenu is active
    const isReportActive = location.pathname.startsWith("/admin/company-course");

    const [reportOpen, setReportOpen] = useState(isReportActive);

    useEffect(() => {
    if (isReportActive) {
        setReportOpen(true);
    }
}, [isReportActive]);

    return (
        // was: <aside className="w-64 min-w-64 max-w-64 flex-shrink-0 bg-[#F8FAFC] shadow-xl border-r border-slate-200 min-h-screen p-6 flex flex-col">
        <aside
            // className={`fixed md:static top-0 left-0 z-50 h-full md:h-auto
            //     w-64 min-w-64 max-w-64 flex-shrink-0 bg-[#F8FAFC] shadow-xl border-r border-slate-200
            //     min-h-dvh p-6 flex flex-col
            //     transform transition-transform duration-300 ease-in-out
            //     ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}

            className={`fixed md:sticky top-0 left-0 z-50
        h-dvh w-64 min-w-64 max-w-64 flex-shrink-0
        bg-[#F8FAFC] shadow-xl border-r border-slate-200
        p-6 flex flex-col overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
        >
            {/* Close button — only relevant on phone/tablet drawer, hidden on desktop */}
            <button
                onClick={onClose}
                className="md:hidden self-end mb-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                aria-label="Close menu"
            >
                <X size={20} />
            </button>

            {/* <div className="flex items-center gap-3 mb-10">
                <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
                    <GraduationCap size={24} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-red-600">
                    Admin Panel
                </h1>
            </div> */}

            <div className="flex items-center gap-3 mb-10">
                <div className="bg-red-600 p-3 rounded-xl">
                    <UserStar className="text-white" size={22} />
                </div>

                <div>
                    {/* was: text-3xl */}
                    <h1 className="text-lg font-bold text-slate-800 break-words">
                        {/* Aquarius Engineering Pvt. Ltd. */}
                        {/* Aquarius Engineers */}

                        {user.user_full_name}
                    </h1>

                </div>
            </div>

            {/* <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200
                                     ${isActive
                                    ? "bg-red-600 text-white shadow-md"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-red-600"
                                }`
                            }
                        >
                            <Icon size={22} />
                            <span className="font-semibold">{item.name}</span>
                        </NavLink>
                    );
                })}

            </nav> */}

            {/* <nav className="space-y-2"> */}
            <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-2">

                {menuItems.map((item) => {
                    const Icon = item.icon;

                    // Collapsible parent menu
                    if (item.children) {
                        return (
                            <div key={item.name}>

                                <button
                                    type="button"
                                    onClick={() => setReportOpen((prev) => !prev)}
                                    className={`w-full flex items-center justify-between
                                        gap-3 px-5 py-2.5 rounded-xl transition-all duration-200
                                        ${isReportActive
                                            ? "bg-red-600 text-white shadow-md"
                                            : "text-slate-700 hover:bg-slate-100 hover:text-red-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Icon size={22} />
                                        <span className="font-semibold">
                                            {item.name}
                                        </span>
                                    </div>

                                    <ChevronDown
                                        size={18}
                                        className={`transition-transform duration-300 cursor-pointer
                                            ${reportOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {/* Submenu */}
                                <div
                                    className={`grid transition-all duration-300 ease-in-out
                                        ${reportOpen
                                            ? "grid-rows-[1fr] opacity-100 mt-2"
                                            : "grid-rows-[0fr] opacity-0"
                                        }`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="ml-5 pl-4 border-l-2 border-slate-200 space-y-1">

                                            {item.children.map((child) => {
                                                const ChildIcon = child.icon;

                                                return (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        onClick={onClose}
                                                        className={({ isActive }) =>
                                                            `flex items-center gap-3 px-4 py-2.5
                                                            rounded-lg text-sm transition-all duration-200
                                                            ${isActive
                                                                ? "bg-red-50 text-red-600 font-semibold"
                                                                : "text-slate-600 hover:bg-slate-100 hover:text-red-600"
                                                            }`
                                                        }
                                                    >
                                                        <ChildIcon size={20} />
                                                        <span>{child.name}</span>
                                                    </NavLink>
                                                );
                                            })}

                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    }

                    // Normal menu items
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-3 rounded-xl
                                transition-all duration-200
                                ${isActive
                                    ? "bg-red-600 text-white shadow-md"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-red-600"
                                }`
                            }
                        >
                            <Icon size={22} />
                            <span className="font-semibold">
                                {item.name}
                            </span>
                        </NavLink>
                    );
                })}

            </nav>

            <div className="mt-auto pt-6 border-t border-slate-200">
                <LogoutButton />
            </div>
        </aside>
    );
};

export default AdminSidebar;