import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/login/ProtectedRoute";
import Landing from "./pages/Landing";
import CoursesPage from "./pages/CoursesPage";
import AdminDashboard from "./pages/Dashboard/admin/AdminDashboard";
import StudentDashboard from "./pages/Dashboard/student/StudentDashboard";
import Register from "./components/Register/Register";
import LoginPage from "./components/lander/LoginPage";
import ResetPassword from "./components/login/ResetPassword";
import MyLearning from "./pages/Dashboard/student/MyLearning";
import MyCourses from "./pages/Dashboard/student/MyCourses";
import LandingCourseDetails from "./pages/Dashboard/student/LandingCourseDetails";
import EnrollPage from "./pages/Dashboard/student/EnrollPage";
//import SpeakingPractice from "./pages/Dashboard/student/SpeakingPractice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageMagnifier from "./pages/Dashboard/student/MyLearning";
import AdminProfile from "./components/admin/AdminProfile";
import AdminLayout from "./components/admin/AdminLayout";
import AdminCourses from "./pages/Dashboard/admin/AdminCourses";
import StudentEnrollments from "./pages/Dashboard/admin/StudentEnrollments";
import UserManagement from "./pages/Dashboard/admin/UserManagement";
import TrainingManagement from "./pages/Dashboard/admin/TrainingManagement";
import CourseManagement from "./pages/Dashboard/admin/CourseManagement";
import ScrollToTop from "./components/common/ScrollToTop.jsx";

import InstructorLayout from "./components/instructor/InstructorLayout";
import InstructorDashboard from "./pages/Dashboard/instructor/InstructorDashboard";
import InstructorCourses from "./pages/Dashboard/instructor/InstructorCourses";
import InstructorProfile from "./components/instructor/InstructorProfile";
import ManageCourse from "./pages/Dashboard/instructor/ManageCourse";
import InstructorStudentEnrollments from "./pages/Dashboard/instructor/InstructorStudentEnrollments";


import StudentProfile from "./components/student/StudentProfile";

import StudentCourseDetails from "./components/MyLearningComponents/StudentCourseDetails";
import StudentCourseLearn from "./pages/Dashboard/student/StudentCourseLearn";
import CompanyDashboard from "./pages/Dashboard/company/CompanyDashboard.jsx";
import CompanyLayout from "./components/company/CompanyLayout.jsx";

const AppContent = ({ toastPosition }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname + location.search + location.hash}
      id="app-scroll-container"
      className="flex-1 flex flex-col max-h-screen min-h-screen bg-gray-100 overflow-y-auto overflow-x-hidden"
    >
      <ScrollToTop />

      <ToastContainer limit={3} position={toastPosition} />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:id" element={<LandingCourseDetails />} />
        <Route path="/enroll/:id" element={<EnrollPage />} />

        {/* <Route path="" element={<Register />} /> */}
        {/* <Route path="/?tab=register" element={<Landing />} /> */}
        <Route path="/register" element={<Landing />} />

        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/?tab=login" element={<Landing />} /> */}
        <Route path="/login" element={<Landing />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADM']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="instructors" element={<UserManagement />} />
          <Route path="add-category" element={<CourseManagement />} /> {/* was add-course*/}
          <Route path="add-course" element={<TrainingManagement />} /> {/* was add-training*/}
          <Route path="admincourses" element={<AdminCourses />} />
          <Route path="enrollments" element={<StudentEnrollments />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={['INS']}>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="my-courses" element={<InstructorCourses />} />
          <Route path="student-enrollments" element={<InstructorStudentEnrollments />} />
          <Route path="profile" element={<InstructorProfile />} />
          <Route
            path="manage-course/:trainingId"
            element={<ManageCourse />}
          />

        </Route>

        <Route
          path="/company"
          element={
            <ProtectedRoute allowedRoles={['CAD']}>
              <CompanyLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboard />} />
          {/* We can add courses and enrollments here next */}
        </Route>

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={['STD']}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-learning"
          element={
            <ProtectedRoute allowedRoles={['STD']}>
              <MyLearning />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-courses"
          element={
            <ProtectedRoute allowedRoles={['STD']}>
              <MyCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:trainingId"
          element={
            <ProtectedRoute allowedRoles={["STD"]}>
              <StudentCourseDetails />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/student/course/:courseId/speaking-practice"
          element={
            <ProtectedRoute allowedRoles={["STD"]}>
              <SpeakingPractice />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/student/course/:trainingId/learn"
          element={
            <ProtectedRoute allowedRoles={["STD"]}>
              <StudentCourseLearn />
            </ProtectedRoute>
          }
        />

        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </div>
  );
};

const App = () => {
  // was: hardcoded position="top-center" on ToastContainer — done to sidestep a
  // mobile specificity issue with top-right's default CSS, but it also flattened
  // desktop, which should show toasts anchored top-right like a normal validation
  // message, not centered. Track viewport width and switch position responsively:
  // top-right from sm: (640px) up, top-center below it. Re-checks on resize so it
  // stays correct if the window is resized across the breakpoint.
  const [toastPosition, setToastPosition] = useState(
    typeof window !== "undefined" && window.innerWidth >= 640
      ? "top-right"
      : "top-center"
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");

    const updatePosition = (e) => {
      setToastPosition(e.matches ? "top-right" : "top-center");
    };

    mediaQuery.addEventListener("change", updatePosition);

    return () => {
      mediaQuery.removeEventListener("change", updatePosition);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppContent toastPosition={toastPosition} />
    </BrowserRouter>
  );
};


export default App;
