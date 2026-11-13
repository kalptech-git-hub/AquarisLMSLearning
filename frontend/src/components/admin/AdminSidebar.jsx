import React from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Library,
    FileText,
    User,
    UserCheck,
    UserStar,
    X,
} from "lucide-react";
import LogoutButton from "../login/LogoutButton";

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
    // {
    //     name: "Student Enrollments",
    //     icon: UserCheck,
    //     path: "/admin/enrollments",
    // },
];

// isOpen / onClose control the phone/tablet drawer state (< md). On desktop (md+) the
// sidebar ignores them and is always visible in its normal flex position.
const AdminSidebar = ({ isOpen = false, onClose = () => {} }) => {
    return (
        // was: <aside className="w-64 min-w-64 max-w-64 flex-shrink-0 bg-[#F8FAFC] shadow-xl border-r border-slate-200 min-h-screen p-6 flex flex-col">
        <aside
            className={`fixed md:static top-0 left-0 z-50 h-full md:h-auto
                w-64 min-w-64 max-w-64 flex-shrink-0 bg-[#F8FAFC] shadow-xl border-r border-slate-200
                min-h-dvh p-6 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
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
                    <h1 className="text-3xl font-bold text-slate-800">
                        Aquaris
                    </h1>
                    <p className="text-sm text-slate-500">
                        Panel
                    </p>
                </div>
            </div>

            <nav className="space-y-2">
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

            </nav>

            <div className="mt-auto pt-6 border-t border-slate-200">
                <LogoutButton />
            </div>
        </aside>
    );
};

export default AdminSidebar;