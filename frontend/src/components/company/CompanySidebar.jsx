import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  BarChart3,
  Building2,
  X,
  UserCircle
} from "lucide-react";
import LogoutButton from "../login/LogoutButton";
import { getCurrentUser } from "../../utils/auth";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/company/dashboard",
  },
  {
    name: "Employees",
    icon: Users,
    path: "/company/employees",
  },
  // {
  //   name: "Assigned Courses",
  //   icon: BookOpen,
  //   path: "/company/courses",
  // },
  // {
  //   name: "Course Enrollment",
  //   icon: UserCheck,
  //   path: "/company/enrollments",
  // },
  // {
  //   name: "Reports & Progress",
  //   icon: BarChart3,
  //   path: "/company/reports",
  // },
];

const CompanySidebar = ({ isOpen = false, onClose = () => { } }) => {
  const currentUser = getCurrentUser();
  const companyName = currentUser?.company_name || "Company Portal";

  return (
    <aside
      className={`fixed md:static top-0 left-0 z-50 h-full md:h-auto
        w-64 min-w-64 max-w-64 flex-shrink-0 bg-[#F8FAFC] shadow-xl border-r border-slate-200
        min-h-dvh p-6 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onClose}
        className="md:hidden self-end mb-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
        aria-label="Close menu"
      >
        <X size={20} />
      </button>

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-red-600 p-3 rounded-xl shadow-md text-white">
          <Building2 size={24} />
        </div>
        {/* <div className="overflow-hidden">
          <h1 className="text-xl font-bold text-slate-800 truncate" title={companyName}>
            {companyName}
          </h1>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
            Company Admin
          </p>
        </div> */}

        <div className="overflow-hidden">
          <h1 className="text-3xl font-bold text-slate-800">
            Company
          </h1>
          <p className="text-sm text-slate-500">
            Panel
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 
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

      {/* Footer / Logout */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        <LogoutButton />
      </div>
    </aside>
  );
};

export default CompanySidebar;