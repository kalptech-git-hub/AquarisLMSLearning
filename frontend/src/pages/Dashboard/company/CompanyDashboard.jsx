import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  BookOpen,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const NAVY = "#152B66";
const RED = "#dc2626";
const GRAY = "#9CA3AF";

// Course activity chart
const ProgressGauge = ({ active, completed, inactive }) => {
  const total = active + completed + inactive;

  const activePct = total > 0 ? (active / total) * 100 : 0;
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  const inactivePct = total > 0 ? (inactive / total) * 100 : 0;

  const segments = [
    { label: "Active", value: active, color: RED },
    { label: "Completed", value: completed, color: NAVY },
    { label: "Inactive", value: inactive, color: GRAY },
  ];

  const gradient = total > 0
    ? `conic-gradient(
            ${RED} 0% ${activePct}%,
            ${NAVY} ${activePct}% ${activePct + completedPct}%,
            ${GRAY} ${activePct + completedPct}% 100%
        )`
    : "#E5E7EB";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 w-full">

      {/* Donut chart */}
      <div className="flex justify-center sm:flex-1">
        <div
          className="relative w-44 h-44 rounded-full flex items-center justify-center"
          style={{ background: gradient }}
        >
          <div className="absolute w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center">
            <span
              className="text-3xl font-bold"
              style={{ color: NAVY }}
            >
              {Math.round(activePct)}%
            </span>
            <span className="text-xs text-gray-500">
              Active learners
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full sm:border-l border-gray-200 sm:pl-8">
        <p
          className="text-sm font-medium mb-4"
          style={{ color: NAVY }}
        >
          Enrollment activity
        </p>

        <div className="space-y-4">
          {segments.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />

              <span className="text-gray-600">
                {item.label}
              </span>

              <span
                className="ml-auto font-semibold"
                style={{ color: NAVY }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-5 pt-3 border-t border-gray-200">
          <span className="text-sm font-medium" style={{ color: NAVY }}>
            Total Enrollments
          </span>
          <span className="text-sm font-bold" style={{ color: NAVY }}>
            {total}
          </span>
        </div>
      </div>
    </div>
  );
};


// Employees enrolled per course
const EmployeesPerCourseChart = ({ courses = [] }) => {

  if (!courses.length) {
    return (
      <div className="h-56 flex items-center justify-center text-gray-500">
        No enrollments found.
      </div>
    );
  }

  const maxValue = Math.max(
    ...courses.map((course) => Number(course.enrolledCount || 0)),
    1
  );

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <div className="flex items-end gap-5 h-56 px-2 pt-8 min-w-max">

        {courses.map((course) => (
          <div
            key={course.id}
            className="relative flex flex-col items-center h-full justify-end flex-shrink-0 w-24 sm:w-40"
          >
            <div className="w-full flex-1 flex items-end rounded-t-lg overflow-visible bg-gray-200/70 relative">

              <div
                className="w-full rounded-t-lg relative"
                style={{
                  height: `${(course.enrolledCount / maxValue) * 100
                    }%`,
                  background:
                    "linear-gradient(180deg, rgba(30,42,74,0.45), rgba(218,50,50,0.45))",
                  minHeight: course.enrolledCount > 0 ? "4px" : "0px",
                }}
              >
                <span
                  className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs font-semibold whitespace-nowrap"
                  style={{ color: NAVY, opacity: 0.7 }}
                >
                  {course.enrolledCount}
                </span>
              </div>
            </div>

            <span
              className="text-xs mt-3 text-center leading-tight truncate w-full"
              style={{ color: NAVY, opacity: 0.7 }}
              title={course.title}
            >
              {course.title}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
};


// Course completion progress
const CourseProgressList = ({ courses = [] }) => {

  if (!courses.length) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No assigned courses found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {courses.map((course) => (
        <div key={course.id}>

          <div className="flex justify-between items-center gap-3 mb-2">
            <span
              className="text-sm font-medium truncate"
              style={{ color: NAVY }}
            >
              {course.title}
            </span>

            <span
              className="text-sm font-semibold shrink-0"
              style={{ color: NAVY }}
            >
              {course.avgProgress}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.max(course.avgProgress, 0),
                  100
                )}%`,
                background:
                  "linear-gradient(90deg, #152B66, #dc2626)",
              }}
            />
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {course.enrolledCount} employees enrolled
          </p>
        </div>
      ))}
    </div>
  );
};


const CompanyDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // const [stats, setStats] = useState({
  //     totalEmployees: 0,
  //     assignedCourses: 0,
  //     enrolledLearners: 0,
  //     averageCompletionRate: 0,
  //     activeEnrollments: 0,
  //     completedEnrollments: 0,
  //     inactiveEnrollments: 0,
  // });

  const [stats, setStats] = useState({
    totalEmployees: 50,
    assignedCourses: 4,
    enrolledLearners: 28,
    averageCompletionRate: 68,

    activeEnrollments: 15,
    completedEnrollments: 8,
    inactiveEnrollments: 5,
  });

  // const [assignedCourses, setAssignedCourses] = useState([]);

  const [assignedCourses, setAssignedCourses] = useState([
    {
      id: 1,
      title: "Digital Marketing Mastery",
      enrolledCount: 20,
      avgProgress: 75,
    },
    {
      id: 2,
      title: "Full Stack Web Development",
      enrolledCount: 15,
      avgProgress: 60,
    },
    {
      id: 3,
      title: "Business Communication",
      enrolledCount: 12,
      avgProgress: 85,
    },
    {
      id: 4,
      title: "Project Management",
      enrolledCount: 18,
      avgProgress: 45,
    },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) return;

        setLoading(true);

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/company/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          const dashboardStats = data.stats || {};

          setStats((prev) => ({
            ...prev,
            ...dashboardStats,
          }));

          setAssignedCourses(
            (data.assignedCourses || []).map((course) => ({
              id: course.id ??
                course.training_id ??
                course.course_id,
              title: course.title ??
                course.training_title ??
                course.course_name ??
                "Untitled Course",
              enrolledCount: Number(
                course.enrolledCount ??
                course.total_students ??
                0
              ),
              avgProgress: Number(
                course.avgProgress ??
                course.average_completion ??
                0
              ),
            }))
          );
        }
      } catch (error) {
        console.error(
          "Error fetching company dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      gradient: "linear-gradient(135deg, #D7DFE9 0%, #F1F3F6 100%)",
      path: "/company/employees",
    },
    {
      label: "Assigned Courses",
      value: stats.assignedCourses,
      icon: BookOpen,
      gradient: "linear-gradient(135deg, #D7DFE9 0%, #F1F3F6 100%)",
      // path: "/company/courses",
    },
    {
      label: "Enrollments",
      value: stats.enrolledLearners,
      icon: UserCheck,
      gradient: "linear-gradient(135deg, #F9C9C9 0%, #D7DFE9 100%)",
      // path: "/company/enrollments",
    },
    {
      label: "Avg. Completion",
      value: `${stats.averageCompletionRate}%`,
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #D7DFE9 0%, #F9C9C9 100%)",
      // path: "/company/enrollments",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-x-hidden pb-10">

      {/* Header */}
      <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3">
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: NAVY }}
        >
          Dashboard
        </h1>
      </div>


      {/* Statistic Cards */}
      <div className="p-4 sm:p-6 grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

        {statCards.map(
          ({ label, value, icon: Icon, gradient, path }) => (
            <div
              key={label}
              onClick={() => navigate(path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(path);
                }
              }}
              className="rounded-xl p-3 sm:p-5 flex justify-between cursor-pointer
                                transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                                focus:outline-none focus:ring-2 focus:ring-blue-900"
              style={{ background: gradient }}
            >
              <div>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: NAVY, opacity: 0.65 }}
                >
                  {label}
                </p>

                <p
                  className="text-xl sm:text-3xl font-bold mt-1"
                  style={{ color: NAVY }}
                >
                  {loading ? "—" : value}
                </p>
              </div>

              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: NAVY }}
              >
                <Icon className="text-sm sm:text-base text-white" />
              </div>
            </div>
          )
        )}

      </div>


      {/* Course Activity */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100">

        <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mt-6">

          <p
            className="text-sm font-medium mb-6"
            style={{ color: NAVY }}
          >
            Course activity
          </p>

          <ProgressGauge
            active={stats.activeEnrollments}
            completed={stats.completedEnrollments}
            inactive={stats.inactiveEnrollments}
          />

        </div>
      </div>


      {/* Employees Enrolled Per Course */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100">

        <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mt-6">

          <p
            className="text-sm font-medium mb-6"
            style={{ color: NAVY }}
          >
            Employees enrolled per course
          </p>

          <EmployeesPerCourseChart courses={assignedCourses} />

          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-4">
            <FiArrowRight aria-hidden="true" />
            <span>Swipe to see more courses</span>
          </div>

        </div>
      </div>


      {/* Course Completion Progress */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100">

        <div className="bg-gray-100 rounded-xl p-4 sm:p-6 mt-6">

          <p
            className="text-sm font-medium mb-6"
            style={{ color: NAVY }}
          >
            Course completion progress
          </p>

          <CourseProgressList courses={assignedCourses} />

        </div>
      </div>

    </div>
  );
};

export default CompanyDashboard;
