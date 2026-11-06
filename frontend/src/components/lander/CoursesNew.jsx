
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { ArrowLeft } from "lucide-react";

// const categories = [
//   "All Courses",
//   "Japanese N5",
//   "Japanese N4",
//   "Japanese N3",
//   "Japanese N2",
//   "Japanese N1",
// ];

// const FALLBACK_COURSES = [
//   {
//     training_id: "1",
//     course_name: "Japanese N5",
//     training_title: "Japanese N5 Complete Beginner Course",
//     course_level: "N5",
//     training_duration_hours: 42,
//     rating: "4.8",
//     students: "2.4K",
//     training_thumbnail:
//       "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800&auto=format&fit=crop",
//   },
//   {
//     training_id: "2",
//     course_name: "Japanese N5",
//     training_title: "Japanese Hiragana & Katakana Mastery",
//     course_level: "N5",
//     training_duration_hours: 28,
//     rating: "4.9",
//     students: "3.1K",
//     training_thumbnail:
//       "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop",
//   },
//   {
//     training_id: "3",
//     course_name: "Japanese N4",
//     training_title: "Japanese N4 Grammar & Vocabulary",
//     course_level: "N4",
//     training_duration_hours: 36,
//     rating: "4.7",
//     students: "1.8K",
//     training_thumbnail:
//       "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=800&auto=format&fit=crop",
//   },
//   {
//     training_id: "4",
//     course_name: "Japanese N4",
//     training_title: "Japanese Conversation Practice",
//     course_level: "N4",
//     training_duration_hours: 30,
//     rating: "4.8",
//     students: "2.1K",
//     training_thumbnail:
//       "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
//   },
// ];

const CourseSection = () => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [activeCategory, setActiveCategory] = useState("All Courses");
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  // Detect role from token
  const getRole = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role_code;
    } catch (e) {
      return null;
    }
  };
  const role = getRole();
  const isStudentOrVisitor = !role || role === "STD";

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const updateAuth = () => setToken(sessionStorage.getItem("token"));
    window.addEventListener("authChanged", updateAuth);
    return () => window.removeEventListener("authChanged", updateAuth);
  }, []);

  const isEnrollmentClosed = (course) =>
    course?.enrollment_status === "CLOSED" ||
    (Boolean(course?.training_start_date) &&
      new Date(course.training_start_date) <= new Date());

  const handleEnrollClick = (e, course) => {
    e.stopPropagation();
    const courseId = course.training_id || course.course_id || course.id;
    if (!token) {
      sessionStorage.setItem("pendingEnrollCourseId", courseId);
      sessionStorage.setItem("redirectAfterLogin", `/enroll/${courseId}`);
      navigate("/login", { state: { redirectTo: `/enroll/${courseId}`, course } });
      return;
    }
    navigate(`/enroll/${courseId}`, { state: { course } });
  };


  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/courses/`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );

        if (isMounted) {
          if (response.data?.success) {
            const raw = response.data.trainings || response.data.courses || [];
            setCourses(raw);

            // if (raw.length > 0) {
            //   setCourses(raw);
            // } else {
            //   setCourses(FALLBACK_COURSES);
            // }
          } else {
            // setCourses(FALLBACK_COURSES);
            setCourses([]);
          }
        }
      } catch (error) {
        console.error("Error fetching courses for landing page:", error);
        if (isMounted) {
          // setCourses(FALLBACK_COURSES);
          setCourses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  const getThumbnailUrl = (thumbnail, index) => {
    if (!thumbnail) {
      // return FALLBACK_COURSES[index % FALLBACK_COURSES.length].training_thumbnail;
      return null;
    }
    if (/^https?:\/\//i.test(thumbnail)) {
      return thumbnail;
    }
    return `${import.meta.env.VITE_API_BASE_URL}${thumbnail}`;
  };

  const getCourseLevelBadge = (course) => {
    const lvl = (course.course_level || "").toUpperCase();
    if (lvl.includes("N5")) return "Beginner";
    if (lvl.includes("N4")) return "Intermediate";
    if (lvl.includes("N3")) return "Intermediate";
    if (lvl.includes("N2")) return "Advanced";
    if (lvl.includes("N1")) return "Advanced";
    if (course.level) return course.level;
    return course.course_level || "Beginner";
  };

  const getCategoryLabel = (course) => {
    if (course.category) return course.category.toUpperCase();
    if (course.course_name) return course.course_name.toUpperCase();
    if (course.course_level) return `JAPANESE ${course.course_level.toUpperCase()}`;
    return "JAPANESE";
  };

  const getLessonCount = (course) => {
    if (course.lessons) return course.lessons;
    if (course.topics && Array.isArray(course.topics) && course.topics.length > 0) {
      return `${course.topics.length} Lessons`;
    }
    if (course.training_duration_hours) {
      return `${course.training_duration_hours} Lessons`;
    }
    return "30 Lessons";
  };

  const getRating = (course, index) => {
    if (course.rating) return course.rating;
    const ratings = ["4.8", "4.9", "4.7", "4.8"];
    return ratings[index % ratings.length];
  };

  const getStudents = (course, index) => {
    if (course.students) return course.students;
    if (course.enrollment_count) {
      const count = Number(course.enrollment_count);
      return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : `${count}`;
    }
    const defaults = ["2.4K", "3.1K", "1.8K", "2.1K"];
    return defaults[index % defaults.length];
  };

  const handleCourseClick = (course) => {
    const targetId = course.training_id || course.course_id || course.id;
    if (targetId) {
      navigate(`/course/${targetId}`, { state: { course } });
    } else {
      navigate("/courses");
    }
  };

  // const filteredCourses = courses.filter((course) => {
  //   if (activeCategory === "All Courses") return true;

  //   const cat = activeCategory.toLowerCase();
  //   const courseCat = (course.category || course.course_name || "").toLowerCase();
  //   const courseLvl = (course.course_level || "").toLowerCase();
  //   const title = (course.training_title || course.title || "").toLowerCase();

  //   // Check JLPT levels like "N5", "N4", "N3", "N2", "N1"
  //   for (const lvl of ["n5", "n4", "n3", "n2", "n1"]) {
  //     if (cat.includes(lvl)) {
  //       return courseLvl.includes(lvl) || courseCat.includes(lvl) || title.includes(lvl);
  //     }
  //   }

  //   return courseCat.includes(cat) || title.includes(cat);
  // });

  // const displayList = filteredCourses.length > 0 ? filteredCourses : courses;

  const scrollSlider = (direction) => {
    const slider = sliderRef.current;
    if (slider) {
      const firstCard = slider.firstElementChild;
      const cardWidth = firstCard?.getBoundingClientRect().width || 0;
      const gap = Number.parseFloat(getComputedStyle(slider).columnGap) || 0;

      slider.scrollBy({
        left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
        behavior: "smooth",
      });
    }
  };

  // useEffect(() => {
  //   if (sliderRef.current) {
  //     sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
  //   }
  // }, [activeCategory]);

  return (
    <section id="explore-courses" className="bg-[#f8fafc] px-6 py-12 lg:px-10 scroll-mt-20">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <span className="text-sm font-bold uppercase tracking-wider text-[#c52d3f]">
            Explore Learning
          </span>

          <h2 className="mt-2 text-3xl font-extrabold text-[#0b2341] sm:text-4xl">
            Explore Our Courses
          </h2>

          <p className="mt-2 text-slate-500 max-w-2xl mx-auto">
            Master Japanese with structured JLPT-focused courses designed by experienced instructors and industry professionals.
          </p>
        </div>

        {/* CATEGORY TABS */}
        {/* <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-start sm:justify-center">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeCategory === category
                  ? "border-[#0b2341] bg-[#0b2341] text-white shadow-md"
                  : "border-slate-200 bg-white text-[#334155] hover:border-[#c52d3f] hover:text-[#c52d3f]"
              }`}
            >
              {category}
            </button>
          ))}
        </div> */}

        {/* COURSE CAROUSEL */}
        <div className="relative">
          {/* LEFT ARROW */}
          <button
            type="button"
            onClick={() => scrollSlider("left")}
            aria-label="Scroll left"
            className="absolute -left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0b2341] shadow-lg transition hover:bg-[#0b2341] hover:text-white cursor-pointer lg:flex"
          >
            <FiArrowLeft size={18} />
          </button>

          {/* CARDS */}
          {loading ? (
            <div className="flex gap-5 overflow-hidden pb-5">
              {[0, 1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="min-w-[285px] sm:min-w-[320px] lg:min-w-[calc(25%-15px)] rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
                >
                  <div className="h-44 w-full rounded-lg bg-slate-200" />
                  <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
                  <div className="mt-2 h-6 w-3/4 rounded bg-slate-200" />
                  <div className="mt-6 flex justify-between border-t border-slate-100 pt-3">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="h-4 w-20 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold text-slate-600">
                No courses available at the moment.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Please check back later for available courses.
              </p>
            </div>
          ) : (
            <div
              ref={sliderRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-5 scrollbar-hide"
            >
              {/* {displayList.map((course, index) => { */}
              {courses.map((course, index) => {
                const title = course.training_title || course.title || "Japanese Course";
                const levelBadge = getCourseLevelBadge(course);
                const categoryLabel = getCategoryLabel(course);
                const lessons = getLessonCount(course);
                // const thumbnail = getThumbnailUrl(course.training_thumbnail || course.image, index);
                const thumbnail = getThumbnailUrl(course.training_thumbnail || course.image);

                return (
                  <div
                    key={course.training_id || course.course_id || index}
                    onClick={() => handleCourseClick(course)}
                    className="min-w-[285px] snap-start overflow-hidden rounded-xl border border-slate-200 bg-white 
                               shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer 
                               sm:min-w-[320px] lg:min-w-[calc(25%-15px)] flex flex-col justify-between"
                  >
                    {/* IMAGE */}
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={thumbnail}
                        alt={title}
                        // onError={(e) => {
                        //   e.target.onerror = null;
                        //   e.target.src =
                        //     FALLBACK_COURSES[index % FALLBACK_COURSES.length].training_thumbnail;
                        // }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#c52d3f] shadow">
                        {levelBadge}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#c52d3f]">
                          {categoryLabel}
                        </p>

                        <h3 className="mt-2 min-h-[52px] text-lg font-bold leading-6 text-[#0b2341] line-clamp-2">
                          {title}
                        </h3>
                      </div>

                      {/* Bottom */}
                      {isStudentOrVisitor ? (
                        /* DESIGN: students  */
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="whitespace-nowrap text-[15px] text-slate-600">
                              {String(lessons).toLowerCase().replace(/^1 lessons$/, "1 lesson")}
                            </span>

                            {course.enroll_status === "A" ? (
                              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                                Enrolled
                              </span>
                            ) : course.enroll_status === "P" ? (
                              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                                Pending
                              </span>
                            ) : course.enroll_status === "R" ? (
                              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                                Rejected
                              </span>
                            ) : isEnrollmentClosed(course) ? (
                              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">
                                Closed
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleEnrollClick(e, course)}
                                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#0b2341] px-3 py-1 text-sm font-semibold text-white transition hover:bg-[#c52d3f] cursor-pointer"
                              >
                                Enroll Now
                                <FiArrowRight size={13} />
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCourseClick(course);
                            }}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-300 bg-white py-2 text-[15px] font-medium text-blue-800 transition hover:bg-blue-50 cursor-pointer"
                          >
                            View course
                            <FiArrowRight size={14} />
                          </button>
                        </div>
                      ) : (
                        /* DESIGN: admin / instructor */
                        <div className="mt-4 flex flex-nowrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                          <span className="shrink-0 whitespace-nowrap text-sm text-slate-500">
                            {lessons}
                          </span>

                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCourseClick(course);
                              }}
                              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#7a1f44] hover:text-[#c52d3f] transition-colors cursor-pointer group"
                            >
                              <span>View Course</span>
                              <FiArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Swipe hint - phone only, mirrors TrainingTable.jsx / StudentEnrollmentTable.jsx pattern */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs text-slate-500 px-1">
            <ArrowLeft size={12} className="rotate-180" />
            <span>Swipe to see courses</span>
          </div>

          {/* RIGHT ARROW */}
          <button
            type="button"
            onClick={() => scrollSlider("right")}
            aria-label="Scroll right"
            className="absolute -right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0b2341] shadow-lg transition hover:bg-[#0b2341] hover:text-white cursor-pointer lg:flex"
          >
            <FiArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CourseSection;