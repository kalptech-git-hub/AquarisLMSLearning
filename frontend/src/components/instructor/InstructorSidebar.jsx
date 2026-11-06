// InstructorSidebar.jsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    UserRoundPen,
    User,
    UserCheck,
    X,
    GraduationCap, 
} from "lucide-react";
import { FaChalkboardTeacher } from "react-icons/fa";
import LogoutButton from "../login/LogoutButton";

const menuItems = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/instructor/dashboard",
    },
    {
        // name: "My Courses",
        name: "My Courses",
        icon: BookOpen,
        path: "/instructor/my-courses",
    },
    {
        name: "Student Enrollments",
        icon: UserCheck,
        path: "/instructor/student-enrollments",
    },
];

// was: no isOpen/onClose props — sidebar was permanently rendered in-flow, with
// itself was just absent on phone width). Mirrors AdminSidebar's fixed-drawer
// pattern: isOpen/onClose only matter below md:, where the aside becomes a
// slide-in drawer; at md: and up it ignores both props and renders exactly as
// before, in normal flex flow, always visible.
const InstructorSidebar = ({ isOpen = false, onClose = () => {} }) => {
    const location = useLocation();

    return (
                //{/* was: no overflow handling on this fixed, min-h-screen aside — if its content (logo + nav + Logout, the last pushed to the bottom via mt-auto) ended up taller than the actual visible viewport on some phones, there was nowhere for the overflow to go: fixed elements don't scroll with the page, and this element had no scroll container of its own, so Logout sat inaccessible past the bottom edge. Added overflow-y-auto so the drawer scrolls internally when its content exceeds the screen height. */}
                //{/* was: h-full md:h-auto ... min-h-screen overflow-y-auto — both h-full and min-h-screen resolve to a static 100vh, which on mobile browsers can be taller than the actually-visible viewport (the address bar eats into real visible space). Since the drawer's content fit exactly within that 100vh box, no true overflow ever occurred, so overflow-y-auto never triggered a scrollbar — Logout just sat past the real visible fold in a fixed element, which can't be scrolled into view via the page. Replaced with h-[100dvh], a dynamic viewport unit that tracks the browser's actual visible height (shrinking/growing as the address bar shows/hides), so the drawer's real height always matches what's actually visible; overflow-y-auto now becomes a genuine safety net for any phone still shorter than that. */}
        <aside
            className={`fixed md:static top-0 left-0 z-50 h-[100dvh] md:h-auto
                w-64 min-w-64 max-w-64 flex-shrink-0 bg-[#F8FAFC] shadow-xl border-r border-slate-200
                overflow-y-auto p-6 flex flex-col
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

            <div className="flex items-center gap-3 mb-10">
                <div className="bg-gradient-to-r from-blue-900 to-blue-950 p-3 rounded-xl">
                    <FaChalkboardTeacher className="text-white" size={22} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Instructor</h1>
                    <p className="text-sm text-slate-500">Panel</p>
                </div>
            </div>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path) ||
                        ((item.name === "My Trainings" || item.name === "My Courses") && location.pathname.startsWith("/instructor/manage-course"));

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200
                                 ${isActive
                                    ? "bg-gradient-to-r from-blue-900 to-blue-950 text-white shadow-md"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-blue-600"
                                }`}
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

export default InstructorSidebar;