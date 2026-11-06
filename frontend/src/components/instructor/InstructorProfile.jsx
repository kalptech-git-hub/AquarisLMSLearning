// InstructorProfile.jsx
import { useEffect, useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  MapPin,
  Briefcase,
  Pencil,
} from "lucide-react";
import { getCurrentUser, getLastLogin } from "../../utils/auth";
import ProfileEditModal from "../profile/ProfileEditModal";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const InstructorProfile = () => {
  const navigate = useNavigate();

  // const user = getCurrentUser();
  const [user, setUser] = useState(getCurrentUser());
  const lastLogin = getLastLogin();
  const [isEditing, setIsEditing] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAllCourses, setShowAllCourses] = useState(false);

  const [totalStudents, setTotalStudents] = useState(0);

  const fetchCurrentUser = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Error fetching current instructor profile:", error);
    }
  };

  /* DOUBLE TOAST PREVENTED */
  useEffect(() => {
    const controller = new AbortController();

    fetchCurrentUser();

    fetchInstructorCourses(controller.signal);
    fetchTotalStudents();

    const refreshProfile = () => fetchCurrentUser();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCurrentUser();
      }
    };

    window.addEventListener("authChanged", refreshProfile);
    window.addEventListener("instructorProfileUpdated", refreshProfile);
    window.addEventListener("focus", refreshProfile);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      controller.abort();
      window.removeEventListener("authChanged", refreshProfile);
      window.removeEventListener("instructorProfileUpdated", refreshProfile);
      window.removeEventListener("focus", refreshProfile);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchTotalStudents = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/instructors/me/student-count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setTotalStudents(response.data.totalStudents);
      }
    } catch (error) {
      console.error("Error fetching student count:", error);
    }
  };


  /* DOUBLE TOAST PREVENTED */
  const fetchInstructorCourses = async (signal) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const userStr = sessionStorage.getItem("user");

      if (!userStr || !token) {
        toast.error("User session not found.");
        return;
      }

      const currentUser = JSON.parse(userStr);

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/instructors/instructorCourses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal
        }
      );

      // if (response.data.success) {
      //   // Filter courses where this instructor is assigned
      //   const filtered = response.data.courses.filter(course =>
      //     course.instructors && course.instructors.some(inst => Number(inst.user_id) === Number(currentUser.user_id))
      //   );
      //   setCourses(filtered);
      // }

      if (response.data.success) {
        const filtered = response.data.courses
          .filter(course =>
            course.instructors && course.instructors.some(inst => Number(inst.user_id) === Number(currentUser.user_id))
          )
          .sort((a, b) => {
            const instA = a.instructors.find(inst => Number(inst.user_id) === Number(currentUser.user_id));
            const instB = b.instructors.find(inst => Number(inst.user_id) === Number(currentUser.user_id));
            return (instB?.training_instructor_id || 0) - (instA?.training_instructor_id || 0);
          });

        setCourses(filtered);
      }

      // console.log(response.data.courses[0]?.instructors);
      // console.log(currentUser);

    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      console.error("Error fetching instructor courses:", error);
      toast.error(
        error.response?.data?.message || "Failed to load assigned courses."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  /* ONly 2 courses first */
  const displayedCourses = showAllCourses
    ? courses
    : courses.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Cover Banner */}
      {/* was: h-42 fixed height on every width — on a 360px Galaxy phone the banner's
          fixed height left disproportionately large empty space above the title
          compared to desktop. Shortened on phone (h-32), reopening to the original
          h-42 from sm: up. */}
      <div className="h-32 sm:h-42 bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] relative rounded-b-3xl shadow-lg">

        {/* Avatar */}
        {/* was: left-12 -bottom-16 on every width with a fixed w-36 h-36 circle — on a
            360px screen this positioned the avatar close to the edge and its overlap
            below the banner ate into content space more than intended. Pulled the
            offset in (left-6) and shrunk the circle (w-24 h-24) on phone; sm: and up
            restore the original left-12 -bottom-16 w-36 h-36. */}
        <div className="absolute left-6 sm:left-12 -bottom-12 sm:-bottom-16">
          <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-white shadow-xl ring-4 ring-white overflow-hidden">
            {user?.user_profile_photo ? (
              <img
                src={/^https?:\/\//i.test(user.user_profile_photo)
                  ? user.user_profile_photo
                  : `${import.meta.env.VITE_API_BASE_URL}${user.user_profile_photo}`}
                alt={user.user_full_name || user.username || "Instructor"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <UserCircle className="w-16 h-16 sm:w-28 sm:h-28 text-gray-500" />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Content */}
      {/* was: px-8 pt-24 on every width — on phone this left less usable width than
          needed and pt-24 gave more top clearance than the now-shorter avatar/banner
          needs. Tightened to px-4 pt-16 on phone, reopening to the original px-8 pt-24
          from sm: up. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-10">

        {/* Name + Button */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center">

          <div>
            {/* was: text-3xl on every width — too large next to the now-smaller phone
                avatar and tight 360px margins. text-xl on phone, reopening to text-3xl
                from sm: up. */}
            <h1 className="text-xl sm:text-3xl font-bold text-[#1E2A4A]">
              {user?.user_full_name || "Instructor"}
            </h1>

            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Japanese Language Instructor
            </p>
          </div>

          {/* was: px-6 py-3 on every width, no width constraint — on phone this made
              the button feel oversized relative to the tightened header above it.
              Slightly smaller padding + text on phone, full-width so it doesn't look
              orphaned under the stacked header; sm: and up reopen to the original
              px-6 py-3 auto-width button. */}
          <button
            onClick={() => setIsEditing(true)}
            className="
              mt-4 sm:mt-5 lg:mt-0
              flex items-center justify-center gap-2
              w-full sm:w-auto
              px-4 sm:px-6 py-2.5 sm:py-3
              rounded-xl
              bg-gradient-to-r
              from-[#1E2A4A]
              via-[#7B3B5C]
              to-[#da3232]
              text-white
              text-sm sm:text-base
              shadow-lg
              hover:scale-105
              transition cursor-pointer
            "
          >
            <Pencil size={16} className="sm:hidden" />
            <Pencil size={18} className="hidden sm:inline" />
            Edit Profile
          </button>

        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8 mt-6 sm:mt-10">

          {/* ===== LEFT SIDEBAR ====== */}

          <div className="space-y-4 sm:space-y-6">

            {/* About */}
            {/* was: p-6 on every width — tightened to p-4 on phone, reopening to p-6
                from sm: up. */}
            <div className="bg-white rounded-3xl shadow-md p-4 sm:p-6">

              <h2 className="text-base sm:text-lg font-bold text-[#1E2A4A] mb-3 sm:mb-5">
                About
              </h2>

              <div className="space-y-4 sm:space-y-5">

                <div className="flex items-start gap-3">
                  <Briefcase size={18} className="text-red-500 mt-1 flex-shrink-0 sm:hidden" />
                  <Briefcase className="text-red-500 mt-1 flex-shrink-0 hidden sm:block" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">Role</p>
                    <p className="font-semibold text-sm sm:text-base">
                      Instructor
                    </p>
                  </div>
                </div>


                {/*
                <div className="flex items-start gap-3">
                  <MapPin className="text-red-500 mt-1" />
                  
                  <div>
                    <p className="text-sm text-gray-500">
                      Location
                    </p>
                    <p className="font-semibold">
                      Pune, Maharashtra
                    </p>
                  </div>
                  
                </div>
                */}

              </div>

            </div>

            {/* Contact */}
            {/* was: p-6 on every width — tightened to p-4 on phone, reopening to p-6
                from sm: up. */}
            <div className="bg-white rounded-3xl shadow-md p-4 sm:p-6">

              <h2 className="text-base sm:text-lg font-bold text-[#1E2A4A] mb-3 sm:mb-5">
                Contact
              </h2>

              <div className="space-y-4 sm:space-y-5">

                <div className="flex gap-3">
                  <Mail size={18} className="text-red-500 mt-1 flex-shrink-0 sm:hidden" />
                  <Mail className="text-red-500 mt-1 flex-shrink-0 hidden sm:block" />

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Email
                    </p>

                    <p className="font-semibold break-all text-sm sm:text-base">
                      {user?.user_email || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone size={18} className="text-red-500 mt-1 flex-shrink-0 sm:hidden" />
                  <Phone className="text-red-500 mt-1 flex-shrink-0 hidden sm:block" />

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Mobile
                    </p>

                    <p className="font-semibold text-sm sm:text-base">
                      {user?.user_mobile_no || "-"}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Statistics */}

            {/* was: className="grid md:grid-cols-2 gap-3" — grid fell back to a single column
                below md: (768px), stacking Courses Assigned and Students full-width on phone
                (image). Switched to a plain grid-cols-2 that always applies, so the two cards
                sit side by side at every width; tablet/desktop are unaffected since they were
                already 2 columns via md:. Padding/text scaled down on phone (p-4/text-2xl),
                reopening to the original p-6/text-3xl from sm: up. */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-3 sm:p-6">

                <p className="text-gray-500 text-[11px] sm:text-sm leading-tight">
                  Courses Assigned
                </p>

                <h2 className="text-xl sm:text-3xl font-bold text-[#1E2A4A] mt-1.5 sm:mt-2">
                  {courses.length}
                </h2>

              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-3 sm:p-6">

                <p className="text-gray-500 text-[11px] sm:text-sm leading-tight">
                  Students
                </p>

                <h2 className="text-xl sm:text-3xl font-bold text-[#1E2A4A] mt-1.5 sm:mt-2">
                  {totalStudents}
                </h2>

              </div>

            </div>
            {/* was: p-6 on every width — tightened to p-4 on phone, reopening to p-6
                from sm: up. */}
            <div className="bg-white rounded-3xl shadow-md p-4 sm:p-6">

              <p className="text-gray-500 text-xs sm:text-sm">
                Last Login
              </p>

              <h2 className="text-sm sm:text-lg font-semibold text-[#1E2A4A] mt-1.5 sm:mt-2 break-words">
                {lastLogin || "Unknown"}
              </h2>

            </div>

          </div>



          {/* ===== RIGHT SIDE ======*/}

          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* Professional Information */}

            {/* was: p-8 on every width — tightened to p-5 on phone, reopening to p-8
                from sm: up. */}
            <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">

              <h2 className="text-lg sm:text-2xl font-bold text-[#1E2A4A] mb-4 sm:mb-8">
                Professional Information
              </h2>

              <div className="grid grid-cols-2 gap-4 sm:gap-8">

                <div className="min-w-0">
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Full Name
                  </p>

                  <p className="font-semibold text-sm sm:text-lg mt-1 break-words">
                    {user?.user_full_name || "-"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Username
                  </p>

                  <p className="font-semibold text-sm sm:text-lg mt-1 break-words">
                    {user?.username || "-"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Qualification
                  </p>

                  <p className="font-semibold text-sm sm:text-lg mt-1 break-words">
                    {user?.qualification || "-"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Experience
                  </p>

                  <p className="font-semibold text-sm sm:text-lg mt-1 break-words">
                    {user?.experience || "-"}
                  </p>
                </div>

              </div>

            </div>

            {/* Biography */}

            {/* was: p-8 on every width — tightened to p-5 on phone, reopening to p-8
                from sm: up. */}
            <div className="bg-white rounded-3xl shadow-md p-5 sm:p-8">

              <h2 className="text-lg sm:text-2xl font-bold text-[#1E2A4A] mb-3 sm:mb-6">
                Biography
              </h2>

              <p className="text-gray-600 text-sm sm:text-base leading-6 sm:leading-8 break-words">
                {user?.biography}
              </p>

            </div>

            {/* Assigned Courses - static*/}

            {/* <div className="bg-white rounded-3xl shadow-md p-8">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-2xl font-bold text-[#1E2A4A]">
                  Assigned Courses
                </h2>

                <button className="text-red-500 font-semibold hover:underline">
                  View All
                </button>

              </div>

              <div className="space-y-4">

                <div className="border rounded-2xl p-5 hover:shadow-md transition">

                  <div className="flex justify-between items-center">

                    <div>

                      <h3 className="font-bold text-lg text-[#1E2A4A]">
                        Japanese N5
                      </h3>

                      <p className="text-gray-500 text-sm mt-1">
                        Beginner Level Japanese
                      </p>

                    </div>

                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
                      Active
                    </span>

                  </div>

                </div>

                <div className="border rounded-2xl p-5 hover:shadow-md transition">

                  <div className="flex justify-between items-center">

                    <div>

                      <h3 className="font-bold text-lg text-[#1E2A4A]">
                        Japanese N4
                      </h3>

                      <p className="text-gray-500 text-sm mt-1">
                        Elementary Japanese
                      </p>

                    </div>

                    <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-medium">
                      Upcoming
                    </span>

                  </div>

                </div>

              </div>

            </div> */}

            {/* Assigned courses - from backend */}
            {/* was: p-5 sm:p-8 — already tightened on phone in an earlier pass. Kept
                as-is; overflow-hidden guard also unchanged. */}
            <div className="bg-white rounded-3xl shadow-md p-4 sm:p-8 overflow-hidden">
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-bold text-[#1E2A4A]">
                  Assigned Courses
                </h2>

                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                    {courses.length} Course{courses.length !== 1 ? "s" : ""}
                  </span>

                  {courses.length > 2 && (
                    <button
                      onClick={() => setShowAllCourses(!showAllCourses)}
                      className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap"
                    >
                      {showAllCourses ? "Show Less" : "View All"}
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                    <span className="ml-3 text-gray-600 font-medium text-sm sm:text-base">Loading courses...</span>
                  </div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                  No courses assigned.
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {displayedCourses.map((course) => (
                    <div
                      key={course.training_id}
                      onClick={() =>
                        navigate(`/instructor/manage-course/${course.training_id}`)
                      }
                      className="border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition cursor-pointer overflow-hidden"
                    >
                      <div className="flex justify-between items-start gap-2 sm:gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm sm:text-lg text-[#1E2A4A] break-words">
                            {course.training_title}
                          </h3>
                          <p className="text-gray-500 text-xs sm:text-sm mt-1 line-clamp-2 break-words">
                            {course.training_description || "No description available"}
                          </p>
                        </div>

                        <span
                          className={`flex-shrink-0 whitespace-nowrap px-2.5 sm:px-4 py-1 rounded-full text-[11px] sm:text-sm font-medium ${course.is_active === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {course.is_active === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                        {course.course_code && (
                          <span className="bg-rose-100/20 text-rose-500 border border-rose-500/15 px-2 py-0.5 sm:py-1 rounded-full">
                            {course.course_code}
                          </span>
                        )}

                        {course.training_mode && (
                          <span className="bg-blue-100/20 text-blue-700 border border-blue-700/15 px-2 py-0.5 sm:py-1 rounded-full">
                            {course.training_mode}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      <ProfileEditModal
        user={user}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        // Previous behavior: onSaved={() => window.location.reload()}
        onSaved={() => {
          setIsEditing(false);
          fetchCurrentUser();
        }}
      />
    </div>
  );
};

export default InstructorProfile;