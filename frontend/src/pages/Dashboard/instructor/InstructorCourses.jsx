import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiBookOpen, FiClock, FiUsers, FiLayers, FiAlertCircle } from "react-icons/fi";
import { MdFileUpload, MdFileUploadOff } from "react-icons/md";
import { socket } from "../../../services/notificationSocket";
import { Search } from "lucide-react";
import { Check, CalendarDays, CalendarCheck } from "lucide-react";

const formatCourseDate = (value) => {
  if (!value) return "–";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "–";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const location = useLocation();

  const highlightedTrainingId = location.state?.highlightedTrainingId;

  const [highlightedCard, setHighlightedCard] = useState(null);

  useEffect(() => {
    const handleNewNotification = (notification) => {
      // Refetch card data live whenever a notification arrives
      fetchInstructorCourses();
    };
    socket.on("notification:new", handleNewNotification);
    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);

  /* PREVIOUS WHICH WAS GIVING DOUBLE TOAST. */
  // useEffect(() => {
  //   fetchInstructorCourses();
  // }, []);

  // const fetchInstructorCourses = async () => {
  //   try {
  //     setLoading(true);
  //     const token = sessionStorage.getItem("token");
  //     const userStr = sessionStorage.getItem("user");

  //     if (!userStr || !token) {
  //       toast.error("User session not found.");
  //       return;
  //     }

  //     const currentUser = JSON.parse(userStr);

  //     const response = await axios.get(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/courses/`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       // Filter courses where this instructor is assigned
  //       const filtered = response.data.courses.filter(course =>
  //         course.instructors && course.instructors.some(inst => Number(inst.user_id) === Number(currentUser.user_id))
  //       );
  //       setCourses(filtered);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching instructor courses:", error);
  //     toast.error(
  //       error.response?.data?.message || "Failed to load assigned courses."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  /* DOUBLE TOAST PREVENTED */
  // const fetchInstructorCourses = async (signal) => {
  //   try {
  //     setLoading(true);
  //     const token = sessionStorage.getItem("token");
  //     const userStr = sessionStorage.getItem("user");

  //     if (!userStr || !token) {
  //       toast.error("User session not found.");
  //       return;
  //     }

  //     const currentUser = JSON.parse(userStr);

  //     const response = await axios.get(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/courses/`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         signal,
  //       }
  //     );

  //     // if (response.data.success) {
  //     //   // Filter courses where this instructor is assigned
  //     //   const filtered = response.data.courses
  //     //   .filter(course =>
  //     //     course.instructors && course.instructors.some(inst => Number(inst.user_id) === Number(currentUser.user_id))
  //     //   );
  //     //   setCourses(filtered);
  //     // }

  //     if (response.data.success) {
  //       const filtered = response.data.courses
  //         .filter(course =>
  //           course.instructors && course.instructors.some(inst => Number(inst.user_id) === Number(currentUser.user_id))
  //         )
  //         .sort((a, b) => {
  //           const instA = a.instructors.find(inst => Number(inst.user_id) === Number(currentUser.user_id));
  //           const instB = b.instructors.find(inst => Number(inst.user_id) === Number(currentUser.user_id));
  //           return (instB?.training_instructor_id || 0) - (instA?.training_instructor_id || 0);
  //         });

  //       setCourses(filtered);
  //     }

  //   } catch (error) {
  //     if (axios.isCancel(error)) {
  //       return;
  //     }

  //     console.error("Error fetching instructor courses:", error);
  //     toast.error(
  //       error.response?.data?.message || "Failed to load assigned courses."
  //     );
  //   } finally {
  //     if (!signal?.aborted) {
  //       setLoading(false);
  //     }
  //   }
  // };

  const fetchInstructorCourses = async (signal) => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");
      const userStr = sessionStorage.getItem("user");

      if (!userStr || !token) {
        toast.error("User session not found.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/instructors/instructorCourses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }
      );

      if (response.data.success) {
        const courses = response.data.courses || [];

        setCourses(courses);
      }

    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }

      console.error(
        "Error fetching instructor courses:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to load assigned courses."
      );

    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchInstructorCourses(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);


  /* HIGHLIGHT + SCROLL */
  // useEffect(() => {
  //   if (!highlightedTrainingId || loading || courses.length === 0) {
  //     return;
  //   }

  //   const targetTraining = document.getElementById(
  //     `training-${highlightedTrainingId}`
  //   );

  //   if (!targetTraining) {
  //     return;
  //   }

  //   // Scroll the highlighted training into view
  //   setTimeout(() => {
  //     targetTraining.scrollIntoView({
  //       behavior: "smooth",
  //       block: "center",
  //     });
  //   }, 100);

  // }, [highlightedTrainingId, loading, courses]);

  useEffect(() => {
    if (!highlightedTrainingId || loading || courses.length === 0) {
      return;
    }

    const trainingExists = courses.some(
      (course) =>
        Number(course.training_id) === Number(highlightedTrainingId)
    );

    if (!trainingExists) {
      return;
    }

    setHighlightedCard(Number(highlightedTrainingId));

    setTimeout(() => {
      const targetTraining = document.getElementById(
        `training-${highlightedTrainingId}`
      );

      targetTraining?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);

    // Remove highlight after a few seconds
    const timer = setTimeout(() => {
      setHighlightedCard(null);
    }, 5000);

    return () => clearTimeout(timer);

  }, [highlightedTrainingId, loading, courses, navigate, location.pathname]);

  const getStatusBadge = (course) => {
    if (course.training_status === "COMPLETED") {
      return {
        label: "Completed",
        // classes: "bg-slate-200 text-slate-600 ", dot: "bg-slate-600" };
        classes: "bg-violet-200 text-violet-600 ", dot: "bg-violet-600"
      };
    }
    const isActive = course.is_active === undefined || !!Number(course.is_active);
    if (isActive) {
      return { label: "Active", classes: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
    }
    return { label: "Inactive", classes: "bg-red-100 text-red-700", dot: "bg-red-500" };
  };

  
  const getStatusKeywords = (course) => {
    const keywords = [];

    if (course.publish_status === "PUBLISHED") {
      keywords.push("published");
    } else {
      keywords.push("draft");
    }

    if (course.training_status === "COMPLETED") {
      keywords.push("completed");
    } else {
      const isActive = course.is_active === undefined || !!Number(course.is_active);
      keywords.push(isActive ? "active" : "inactive");
    }

    return keywords;
  };

  
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    const matchesTitle = course.training_title
      ?.toLowerCase()
      .includes(query);

    const matchesStatus = getStatusKeywords(course).some((keyword) =>
      keyword.startsWith(query)
    );

    return matchesTitle || matchesStatus;
  });

  return (
    // was: className="p-1 sm:p-4" — no bottom clearance meant the last row of course cards sat flush against the scrollable area's edge, same clipping issue as the Footer. Added pb-20 to match the pattern used there.
    <div className="p-1 sm:p-4 pb-20">
      {/* Header Section */}
      
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            My Courses
          </h1>

          <div className="relative w-64 sm:w-80">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or status..."
              className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1B357F]/40 focus:border-[#1B357F]/40"
            />
          </div>
        </div>

        <p className="text-gray-500 mt-2 text-sm">
          Overview of course programs and classes assigned to you by the administration.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          {/* <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div> */}
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="text-gray-500 ml-3 font-medium">Loading courses...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center max-w-xl mx-auto mt-12 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="text-amber-500" size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            No Assigned Courses
          </h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            You are not currently assigned to any course. Please contact the administrator to assign classes to your account.
          </p>
          <button
            onClick={fetchInstructorCourses}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-medium rounded-xl transition cursor-pointer"
          >
            Refresh List
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No courses match "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.training_id}
              id={`training-${course.training_id}`}
              className={`bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-500 group relative
                ${Number(highlightedCard) === Number(course.training_id)
                  ? "ring-1 ring-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.25)] scale-[1.02] bg-gradient-to-b from-indigo-50/40 via-white to-white"
                  : "shadow-md hover:shadow-md hover:-translate-y-1"
                }
              `}
            >
              {/* Course Thumbnail */}
              <div className="relative h-36 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] flex items-center justify-center overflow-hidden">
                {course.training_thumbnail ? (
                  <img
                    src={course.training_thumbnail && /^https?:\/\//i.test(course.training_thumbnail)
                      ? course.training_thumbnail
                      : `${import.meta.env.VITE_API_BASE_URL}${course.training_thumbnail}`}
                    alt={course.training_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <FiBookOpen size={36} className="text-[#1B357F] opacity-90" />
                )}
                {/* Level Badge */}
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-[#e40000] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-[#D1E4FF]">
                  {course.course_level || "Standard"}
                </span>

                {/* Active / Inactive / Completed Badge */}
                {(() => {
                  const statusBadge = getStatusBadge(course);
                  return (
                    <span
                      className={`absolute right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 ${Number(highlightedCard) === Number(course.training_id) ? "top-10" : "top-3"
                        } ${statusBadge.classes}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  );
                })()}

                {/* NEW: Highlight Notification Badge */}
                {Number(highlightedCard) === Number(course.training_id) && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-pulse z-10">
                    {/* NEW ASSIGNMENT */}
                    NEWLY ASSIGNED
                  </span>
                )}
              </div>

              {/* Course Details */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[10px] font-semibold text-[#1B357F] uppercase tracking-wider">
                    {course.course_code}
                  </span>
                  {course.publish_status === "PUBLISHED" ? (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0"
                      title="This course is published"
                    >
                      <MdFileUpload size={11} /> Published
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0"
                      title="This course is not published yet"
                    >
                      <MdFileUploadOff size={11} /> Draft
                    </span>
                  )}
                </div>
                {/* <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
                  {course.training_title}
                </h3> */}

                <h3
                  className={`text-sm font-bold line-clamp-1 mb-1 transition-colors duration-500
                    ${Number(highlightedCard) === Number(course.training_id)
                      // ? "text-red-600"
                      ? "text-indigo-600"
                      : "text-gray-900"
                    }
                  `}
                >
                  {course.training_title}
                </h3>
                <p
                  className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: course.training_description || "No description provided." }}
                />

                {/* Meta details */}
                <div className="mt-auto space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarDays size={16} className="text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-gray-400 leading-tight">Starts</div>
                        <div className="text-xs font-semibold text-gray-900 truncate">
                          {formatCourseDate(course.training_start_date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarCheck size={16} className="text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-gray-400 leading-tight">Ends</div>
                        <div className="text-xs font-semibold text-gray-900 truncate">
                          {formatCourseDate(course.training_end_date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <FiClock className="text-gray-400 shrink-0" size={13} />
                      <span className="truncate">{course.training_duration_hours || 0} Hours</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiLayers className="text-gray-400 shrink-0" size={13} />
                      <span className="truncate">{course.training_mode || "Online"}</span>
                    </div>
                  </div>

                  {/* Co-Instructors List */}
                  {course.instructors && course.instructors.length > 1 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pt-1">
                      <FiUsers className="text-gray-400 shrink-0" size={12} />
                      <span className="truncate">
                        Co-Taught: {course.instructors
                          .filter(inst => Number(inst.user_id) !== Number(JSON.parse(sessionStorage.getItem("user")).user_id))
                          .map(inst => inst.instructor_name)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Pricing / Fee */}
                  {/* <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-medium text-gray-450">Class Fee</span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{course.training_fee || 0}
                    </span>
                  </div> */}

                  {/* Action Button */}
                  <button
                    // onClick={() => navigate(`/instructor/manage-course/${course.training_id}`)}
                    onClick={() => navigate(`/instructor/manage-course/${course.training_id}`, { state: { course } })}
                    className="w-full mt-2 bg-gradient-to-r from-blue-900 to-blue-950 hover:bg-[#152B66] active:bg-[#0F1E4A] text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm transition duration-200 cursor-pointer block text-center"
                  >
                    {/* Manage Training */}
                    Manage Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;