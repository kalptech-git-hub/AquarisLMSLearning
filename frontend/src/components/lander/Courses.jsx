/* Previous */
// import React, { useEffect, useState, useMemo } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import EnrollmentModal from "../enrollment/EnrollmentModal";
// import { toast } from "react-toastify";
// import { Users, BookOpen, Clock, ArrowRight, Calendar, Search, X } from "lucide-react";
// import { jwtDecode } from "jwt-decode";

// const FontImport = () => (
//     <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
//         .cc-display { font-family: 'Fraunces', serif; }
//         .cc-body { font-family: 'Inter', sans-serif; }
//         .cc-mono { font-family: 'IBM Plex Mono', monospace; }
//     `}</style>
// );

// const StampBadge = ({ level }) => (
//     <div
//         className="cc-mono absolute -top-6 -left-4 z-10 flex h-16 w-16 -rotate-6 items-center justify-center rounded-full border-2 text-white shadow-lg"
//         style={{
//             backgroundColor: "#C41E2E",
//             borderColor: "rgba(255,255,255,0.65)",
//             boxShadow: "0 4px 10px rgba(196,30,46,0.35)",
//         }}
//     >
//         <div className="text-center leading-tight">
//             <div className="text-[9px] tracking-widest opacity-80">LEVEL</div>
//             <div className="text-lg font-semibold">{level || "—"}</div>
//         </div>
//     </div>
// );

// const Perforation = () => (
//     <div className="relative">
//         <div
//             className="absolute -left-5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full"
//             style={{ backgroundColor: "#F4F5F7" }}
//         />
//         <div
//             className="absolute -right-5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full"
//             style={{ backgroundColor: "#F4F5F7" }}
//         />
//     </div>
// );

// const MetaItem = ({ icon: Icon, children }) => (
//     <div className="flex items-center gap-1.5 cc-body text-[13px]" style={{ color: "#5B6472" }}>
//         <Icon size={15} strokeWidth={2} style={{ color: "#C41E2E" }} />
//         <span>{children}</span>
//     </div>
// );

// const THUMB_GRADIENTS = [
//     ["#0B1E39", "#22406B"],
//     ["#7A1522", "#C41E2E"],
// ];

// const getThumbnailSrc = (thumb) => {
//     if (!thumb) return null;

//     if (/^https?:\/\//i.test(thumb)) {
//         return thumb;
//     }

//     return `${import.meta.env.VITE_API_BASE_URL}${thumb}`;
// };

// const CourseThumbnail = ({ src, alt, seed = 0 }) => {
//     const [errored, setErrored] = useState(false);
//     const showPlaceholder = !src || errored;

//     if (showPlaceholder) {
//         const [from, to] = THUMB_GRADIENTS[seed % THUMB_GRADIENTS.length];
//         return (
//             <div
//                 className="relative h-full w-full flex items-center justify-center"
//                 style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
//             >
//                 <div
//                     className="absolute inset-0 opacity-[0.15]"
//                     style={{
//                         backgroundImage:
//                             "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)",
//                     }}
//                 />
//                 <BookOpen size={34} strokeWidth={1.5} color="#ffffff" style={{ opacity: 0.85 }} />
//             </div>
//         );
//     }

//     return (
//         <img
//             src={src}
//             alt={alt}
//             onError={() => setErrored(true)}
//             className="w-full h-full object-contain md:object-cover group-hover:scale-105 transition duration-500"
//         />
//     );
// };

// const Courses = () => {
//     const [courses, setCourses] = useState([]);
//     const [selectedCourse, setSelectedCourse] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [selectedLevel, setSelectedLevel] = useState("ALL");
//     const [searchQuery, setSearchQuery] = useState("");

//     const location = useLocation();
//     const navigate = useNavigate();

//     const [token, setToken] = useState(sessionStorage.getItem("token"));

//     const getRole = () => {
//         if (!token) return null;
//         try {
//             const decoded = jwtDecode(token);
//             return decoded.role_code;
//         } catch (e) {
//             return null;
//         }
//     };
//     const role = getRole();
//     const isStudentOrVisitor = !role || role === "STD";

//     useEffect(() => {
//         const updateAuth = () => {
//             setToken(sessionStorage.getItem("token"));
//         };
//         window.addEventListener("authChanged", updateAuth);
//         return () => {
//             window.removeEventListener("authChanged", updateAuth);
//         };
//     }, []);

//     useEffect(() => {
//         const controller = new AbortController();

//         const fetchCourses = async () => {
//             try {
//                 setLoading(true);
//                 const token = sessionStorage.getItem("token");

//                 const response = await axios.get(
//                     `${import.meta.env.VITE_API_BASE_URL}/api/courses/`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                         signal: controller.signal,
//                     }
//                 );

//                 if (response.data.success) {
//                     // setCourses(response.data.courses || []);
//                     setCourses(response.data.trainings || []);
//                 }
//             } catch (error) {
//                 if (axios.isCancel(error)) {
//                     return;
//                 }
//                 console.error(error);
//                 toast.error(
//                     error.response?.data?.message || "Failed to fetch courses."
//                 );
//             } finally {
//                 if (!controller.signal.aborted) {
//                     setLoading(false);
//                 }
//             }
//         };

//         fetchCourses();

//         return () => {
//             controller.abort();
//         };
//     }, []);

//     useEffect(() => {
//         if (token && courses.length > 0) {
//             const pendingId = sessionStorage.getItem("pendingEnrollCourseId");
//             if (pendingId) {
//                 if (role === "STD") {
//                     navigate(`/enroll/${pendingId}`);
//                 }
//                 sessionStorage.removeItem("pendingEnrollCourseId");
//             }
//         }
//     }, [token, courses, role, navigate]);

//     const stripHtml = (html = "") => {
//         const doc = new DOMParser().parseFromString(html, "text/html");
//         return doc.body.textContent || "";
//     };

//     const formatDate = (dateStr) => {
//         if (!dateStr) return "";
//         const d = new Date(dateStr);
//         if (isNaN(d.getTime())) return "";
//         return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//     };

//     const isEnrollmentClosed = (course) =>
//     course?.enrollment_status === "CLOSED" ||
//     (Boolean(course?.training_start_date) &&
//         new Date(course.training_start_date) <= new Date());

//     const handleEnrollClick = (course) => {
//         const courseId = course.training_id || course.course_id;
//         if (!token) {
//             sessionStorage.setItem("pendingEnrollCourseId", courseId);
//             sessionStorage.setItem("redirectAfterLogin", `/enroll/${courseId}`);
//             toast.info("Please log in to complete your course enrollment!");
//             navigate("/login", {
//                 state: {
//                     redirectTo: `/enroll/${courseId}`,
//                     course,
//                 },
//             });
//             return;
//         }
//         navigate(`/enroll/${courseId}`, { state: { course } });
//     };

//     const levels = ["ALL", "N5", "N4", "N3", "N2", "N1"];

//     // Filter courses by level and search query
//     const filteredCourses = useMemo(() => {
//         return courses.filter((course) => {
//             // Level Filter
//             if (selectedLevel !== "ALL") {
//                 const lvl = (course.course_level || "").toUpperCase();
//                 if (!lvl.includes(selectedLevel)) {
//                     return false;
//                 }
//             }

//             // Search Query Filter
//             if (searchQuery.trim()) {
//                 const query = searchQuery.toLowerCase();
//                 const title = (course.training_title || "").toLowerCase();
//                 const desc = stripHtml(course.training_description || "").toLowerCase();
//                 const level = (course.course_level || "").toLowerCase();
//                 if (!title.includes(query) && !desc.includes(query) && !level.includes(query)) {
//                     return false;
//                 }
//             }

//             return true;
//         });
//     }, [courses, selectedLevel, searchQuery]);

//     return (
//         <>
//             {!selectedCourse ? (
//                 // COURSE LIST
//                 <section
//                     id="courses"
//                     className="relative overflow-hidden py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-red-50/15 to-white min-h-[85vh]"
//                 >
//                     {/* Background Decorative Atmosphere matching Landing Page */}
//                     <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
//                     <div className="absolute top-1/3 left-0 -translate-y-1/2 -translate-x-12 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
//                     <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

//                     <FontImport />

//                     <div className="max-w-7xl mx-auto relative z-10">
//                         {/* Heading matching Image 2 */}
//                         <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
//                             {/* Pill Badge */}
//                             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/80 shadow-xs text-xs sm:text-sm font-semibold text-[#C41E2E] mb-4">
//                                 <span className="flex h-2 w-2 rounded-full bg-[#C41E2E] animate-pulse" />
//                                 <span className="tracking-wide">日本語コース • Structured Japanese Curriculum</span>
//                             </div>

//                             {/* Main Heading with Red / Gradient Accent */}
//                             <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1E39] tracking-tight leading-tight">
//                                 Explore Our Japanese Language
//                                 <span className="block mt-1 bg-gradient-to-r from-[#C41E2E] via-[#E63946] to-[#7B3B5C] bg-clip-text text-transparent">
//                                     Courses
//                                 </span>
//                             </h2>

//                             {/* Subtitle */}
//                             <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
//                                 Master Japanese with structured JLPT-focused courses designed by experienced instructors and industry professionals.
//                             </p>
//                         </div>

//                         {/* Interactive Filter & Search Controls from Image 2 */}
//                         <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-slate-200/80">
//                             {/* JLPT Level Filter Chips */}
//                             <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
//                                 {levels.map((lvl) => {
//                                     const isActive = selectedLevel === lvl;
//                                     return (
//                                         <button
//                                             key={lvl}
//                                             onClick={() => setSelectedLevel(lvl)}
//                                             className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
//                                                 isActive
//                                                     ? "bg-gradient-to-r from-[#0B1E39] via-[#1E2A4A] to-[#C41E2E] text-white shadow-md shadow-red-950/15"
//                                                     : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs"
//                                             }`}
//                                         >
//                                             {lvl === "ALL" ? "All Levels" : `JLPT ${lvl}`}
//                                         </button>
//                                     );
//                                 })}
//                             </div>

//                             {/* Search Input */}
//                             <div className="relative w-full md:w-72">
//                                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
//                                 <input
//                                     type="text"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     placeholder="Search by title, level..."
//                                     className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-blue-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs"
//                                 />
//                                 {searchQuery && (
//                                     <button
//                                         onClick={() => setSearchQuery("")}
//                                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
//                                         title="Clear search"
//                                     >
//                                         <X size={14} />
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Courses Grid */}
//                         {loading ? (
//                             <div className="flex justify-center items-center py-24">
//                                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
//                                 <span className="ml-3 text-gray-600 font-medium">Loading courses...</span>
//                             </div>
//                         ) : filteredCourses.length === 0 ? (
//                             <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
//                                 <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#C41E2E] flex items-center justify-center mx-auto mb-4 border border-red-100">
//                                     <Search size={24} />
//                                 </div>
//                                 <h3 className="text-lg font-bold text-[#0B1E39] mb-1">No Courses Found</h3>
//                                 <p className="text-xs text-slate-500 mb-6 leading-relaxed">
//                                     We couldn't find any courses matching your criteria. Try adjusting or clearing your filters.
//                                 </p>
//                                 <button
//                                     onClick={() => {
//                                         setSelectedLevel("ALL");
//                                         setSearchQuery("");
//                                     }}
//                                     className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
//                                 >
//                                     Reset Filters
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-8">
//                                 {filteredCourses.map((course, index) => (
//                                     <div
//                                         key={course.training_id || course.course_id}
//                                         onClick={(e) => {
//                                             if (e.target.closest('[data-enroll-btn="true"]')) return;
//                                             navigate(`/course/${course.training_id || course.course_id}`, { state: { course } });
//                                         }}
//                                         className="group relative flex flex-col overflow-visible rounded-2xl bg-white transition-shadow duration-300 hover:shadow-xl cursor-pointer"
//                                         style={{
//                                             border: "1px solid #E3E6EB",
//                                             boxShadow: "0 2px 6px rgba(11,30,57,0.06)",
//                                         }}
//                                     >
//                                         {/* Card content wrapper (clips thumbnail corners) */}
//                                         <div className="relative flex flex-col flex-1 overflow-hidden rounded-2xl">
//                                             {/* Thumbnail */}
//                                             <div className="relative h-52 overflow-hidden">
//                                                 <CourseThumbnail
//                                                     src={getThumbnailSrc(course.training_thumbnail)}
//                                                     alt={course.training_title}
//                                                     seed={index}
//                                                 />

//                                                 {/* Bestseller */}
//                                                 <span
//                                                     className="cc-body absolute top-4 right-4 text-white text-xs px-3 py-1 rounded-full font-semibold"
//                                                     style={{ backgroundColor: "#0B1E39", border: "1px solid rgba(255,255,255,0.25)" }}
//                                                 >
//                                                     Bestseller
//                                                 </span>
//                                             </div>

//                                             {/* Body */}
//                                             <div className="relative flex flex-col flex-1 px-6 pb-5 pt-8">
//                                                 <StampBadge level={course.course_level} />

//                                                 <h3
//                                                     className="cc-display text-[21px] font-semibold leading-snug mb-2"
//                                                     style={{ color: "#0B1E39" }}
//                                                 >
//                                                     {course.training_title}
//                                                 </h3>

//                                                 <p
//                                                     className="cc-body text-[13.5px] leading-relaxed line-clamp-2 mb-5"
//                                                     style={{ color: "#5B6472" }}
//                                                 >
//                                                     {stripHtml(course.training_description)}
//                                                 </p>
//                                             </div>

//                                             <Perforation />

//                                             {/* Touch device bottom bar */}
//                                             <div className="flex [@media(hover:hover)]:hidden flex-col gap-3 px-6 pb-6 pt-3 border-t" style={{ borderColor: "#E3E6EB" }}>
//                                                 <div className="flex flex-wrap gap-x-4 gap-y-1">
//                                                     <MetaItem icon={Users}>
//                                                         {course.instructors?.length || 0} Instructor(s)
//                                                     </MetaItem>
//                                                     <MetaItem icon={BookOpen}>
//                                                         {course.books?.length || 0} Book(s)
//                                                     </MetaItem>
//                                                     <MetaItem icon={Clock}>
//                                                         {course.training_duration_hours} Hours
//                                                     </MetaItem>
//                                                 </div>

//                                                 <div className="flex items-center justify-between gap-3">
//                                                     <div>
//                                                         <p className="cc-body text-[10px] font-medium uppercase tracking-widest" style={{ color: "#9AA1AC" }}>
//                                                             Fee
//                                                         </p>
//                                                         <p className="cc-mono text-xl font-semibold" style={{ color: "#000053" }}>
//                                                             ₹{course.training_fee}
//                                                         </p>
//                                                     </div>

//                                                     {isStudentOrVisitor && (
//                                                         course.enroll_status === "A" ? (
//                                                             <button
//                                                                 disabled
//                                                                 data-enroll-btn="true"
//                                                                 className="rounded-full px-4 py-2.5 text-[13px] font-semibold bg-green-100 text-green-700 cursor-not-allowed"
//                                                             >
//                                                                 Enrolled
//                                                             </button>
//                                                         ) : course.enroll_status === "P" ? (
//                                                             <button
//                                                                 disabled
//                                                                 data-enroll-btn="true"
//                                                                 className="rounded-full px-4 py-2.5 text-[13px] font-semibold bg-amber-100 text-amber-700 cursor-not-allowed"
//                                                             >
//                                                                 Pending Approval
//                                                             </button>
//                                                         ) : course.enroll_status === "R" ? (
//                                                             <button
//                                                                 disabled
//                                                                 data-enroll-btn="true"
//                                                                 className="rounded-full px-4 py-2.5 text-[13px] font-semibold bg-red-100 text-red-600 cursor-not-allowed"
//                                                             >
//                                                                 Rejected
//                                                             </button>
//                                                         ) : isEnrollmentClosed(course) ? (
//                                                             <button
//                                                                 disabled
//                                                                 data-enroll-btn="true"
//                                                                 className="rounded-full px-4 py-2.5 text-[13px] font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
//                                                             >
//                                                                 Enrollment Closed
//                                                             </button>
//                                                         ) : (
//                                                             <button
//                                                                 data-enroll-btn="true"
//                                                                 onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     handleEnrollClick(course);
//                                                                 }}
//                                                                 className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white cursor-pointer"
//                                                                 style={{ backgroundColor: "#0B1E39" }}
//                                                             >
//                                                                 Enroll
//                                                                 <ArrowRight size={14} strokeWidth={2.5} />
//                                                             </button>
//                                                         )
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {/* Desktop Hover Popover Preview */}
//                                         <div
//                                             onClick={(e) => {
//                                                 if (e.target.closest('[data-enroll-btn="true"]')) return;
//                                                 navigate(`/course/${course.training_id || course.course_id}`, { state: { course } });
//                                             }}
//                                             className="hidden [@media(hover:hover)]:block cc-body pointer-events-none absolute left-1/2 top-11 z-30 w-[340px] -translate-x-1/2 -translate-y-2 rounded-2xl bg-white opacity-0 shadow-2xl transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer"
//                                             style={{ border: "1px solid #E3E6EB" }}
//                                         >
//                                             <div className="p-6">
//                                                 <span
//                                                     className="cc-body inline-block text-white text-xs px-3 py-1 rounded-full font-semibold mb-3"
//                                                     style={{ backgroundColor: "#C41E2E" }}
//                                                 >
//                                                     Level {course.course_level || "—"}
//                                                 </span>

//                                                 <h4
//                                                     className="cc-display text-lg font-semibold leading-snug mb-2 transition"
//                                                     style={{ color: "#0B1E39" }}
//                                                 >
//                                                     {course.training_title}
//                                                 </h4>

//                                                 <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
//                                                     <MetaItem icon={Users}>
//                                                         {course.instructors?.length || 0} Instructor(s)
//                                                     </MetaItem>
//                                                     <MetaItem icon={BookOpen}>
//                                                         {course.books?.length || 0} Book(s)
//                                                     </MetaItem>
//                                                     <MetaItem icon={Clock}>
//                                                         {course.training_duration_hours} Hours
//                                                     </MetaItem>
//                                                 </div>

//                                                 {(course.training_start_date || course.training_end_date) && (
//                                                     <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
//                                                         <MetaItem icon={Calendar}>
//                                                             {course.training_start_date && <>Starts {formatDate(course.training_start_date)}</>}
//                                                             {course.training_start_date && course.training_end_date && " · "}
//                                                             {course.training_end_date && <>Ends {formatDate(course.training_end_date)}</>}
//                                                         </MetaItem>
//                                                     </div>
//                                                 )}

//                                                 <p
//                                                     className="text-[13.5px] leading-relaxed mb-5 line-clamp-6"
//                                                     style={{ color: "#5B6472" }}
//                                                 >
//                                                     {stripHtml(course.training_description)}
//                                                 </p>

//                                                 <div className="flex items-center justify-between">
//                                                     <p className="cc-mono text-xl font-semibold" style={{ color: "#000053" }}>
//                                                         ₹{course.training_fee}
//                                                     </p>
//                                                     {isStudentOrVisitor && (
//                                                         course.enroll_status === "A" ? (
//                                                             <button
//                                                                 disabled
//                                                                 data-enroll-btn="true"
//                                                                 className="rounded-full px-4 py-2 text-[13px] font-semibold bg-green-100 text-green-700 cursor-not-allowed"
//                                                             >
//                                                                 Enrolled
//                                                             </button>
//                                                         ) : course.enroll_status === "P" ? (
//                                                             <button
//                                                                 disabled
//                                                                 data-enroll-btn="true"
//                                                                 className="rounded-full px-4 py-2 text-[13px] font-semibold bg-amber-100 text-amber-700 cursor-not-allowed"
//                                                             >
//                                                                 Pending Approval
//                                                             </button>
//                                                         ) : course.enroll_status === "R" ? (
//                                                             <button
//                                                                 disabled
//                                                                 data-enroll-btn="true"
//                                                                 className="rounded-full px-4 py-2 text-[13px] font-semibold bg-red-100 text-red-600 cursor-not-allowed"
//                                                             >
//                                                                 Rejected
//                                                             </button>
//                                                         ) : isEnrollmentClosed(course) ? (
//                                                             <button
//                                                                 disabled
//                                                                 data-enroll-btn="true"
//                                                                 className="rounded-full px-4 py-2 text-[13px] font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
//                                                             >
//                                                                 Enrollment Closed
//                                                             </button>
//                                                         ) : (
//                                                             <button
//                                                                 data-enroll-btn="true"
//                                                                 onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     handleEnrollClick(course);
//                                                                 }}
//                                                                 className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white cursor-pointer"
//                                                                 style={{ backgroundColor: "#0B1E39" }}
//                                                             >
//                                                                 Enroll
//                                                                 <ArrowRight size={14} strokeWidth={2.5} />
//                                                             </button>
//                                                         )
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </section>
//             ) : (
//                 <EnrollmentModal
//                     course={selectedCourse}
//                     onClose={() => setSelectedCourse(null)}
//                 />
//             )}
//         </>
//     );
// };

// export default Courses;

/* New */
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import EnrollmentModal from "../enrollment/EnrollmentModal";
import { toast } from "react-toastify";
import { Users, BookOpen, Clock, ArrowRight, Calendar, Search, X } from "lucide-react";
import { jwtDecode } from "jwt-decode";
// import "../../assets/fonts/fonts.css";




const StampBadge = ({ level }) => (
    <div
        className="cc-mono absolute -top-6 -left-4 z-10 flex h-16 w-16 -rotate-6 items-center justify-center rounded-full border-2 text-white shadow-lg"
        style={{
            backgroundColor: "#C41E2E",
            borderColor: "rgba(255,255,255,0.65)",
            boxShadow: "0 4px 10px rgba(196,30,46,0.35)",
        }}
    >
        <div className="text-center leading-tight">
            <div className="text-[9px] tracking-widest opacity-80">LEVEL</div>
            <div className="text-lg font-semibold">{level || "—"}</div>
        </div>
    </div>
);

const Perforation = () => (
    <div className="relative">
        <div
            className="absolute -left-5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: "#F4F5F7" }}
        />
        <div
            className="absolute -right-5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: "#F4F5F7" }}
        />
    </div>
);

const MetaItem = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-1.5 cc-body text-[13px]" style={{ color: "#5B6472" }}>
        <Icon size={15} strokeWidth={2} style={{ color: "#C41E2E" }} />
        <span>{children}</span>
    </div>
);

const THUMB_GRADIENTS = [
    ["#0B1E39", "#22406B"],
    ["#7A1522", "#C41E2E"],
];

const getThumbnailSrc = (thumb) => {
    if (!thumb) return null;

    if (/^https?:\/\//i.test(thumb)) {
        return thumb;
    }

    return `${import.meta.env.VITE_API_BASE_URL}${thumb}`;
};

const CourseThumbnail = ({ src, alt, seed = 0 }) => {
    const [errored, setErrored] = useState(false);
    const showPlaceholder = !src || errored;

    if (showPlaceholder) {
        const [from, to] = THUMB_GRADIENTS[seed % THUMB_GRADIENTS.length];
        return (
            <div
                className="relative h-full w-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
                <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)",
                    }}
                />
                <BookOpen size={34} strokeWidth={1.5} color="#ffffff" style={{ opacity: 0.85 }} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setErrored(true)}
            className="w-full h-full object-contain md:object-cover group-hover:scale-105 transition duration-500"
        />
    );
};

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const [token, setToken] = useState(sessionStorage.getItem("token"));

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

    useEffect(() => {
        const updateAuth = () => {
            setToken(sessionStorage.getItem("token"));
        };
        window.addEventListener("authChanged", updateAuth);
        return () => {
            window.removeEventListener("authChanged", updateAuth);
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const fetchCourses = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem("token");

                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/courses/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                if (response.data.success) {
                    // setCourses(response.data.courses || []);
                    setCourses(response.data.trainings || []);
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    return;
                }
                console.error(error);
                toast.error(
                    error.response?.data?.message || "Failed to fetch courses."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchCourses();

        return () => {
            controller.abort();
        };
    }, []);

    useEffect(() => {
        if (token && courses.length > 0) {
            const pendingId = sessionStorage.getItem("pendingEnrollCourseId");
            if (pendingId) {
                if (role === "STD") {
                    navigate(`/enroll/${pendingId}`);
                }
                sessionStorage.removeItem("pendingEnrollCourseId");
            }
        }
    }, [token, courses, role, navigate]);

    const stripHtml = (html = "") => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || "";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    };

    const isEnrollmentClosed = (course) =>
    course?.enrollment_status === "CLOSED" ||
    (Boolean(course?.training_start_date) &&
        new Date(course.training_start_date) <= new Date());

    const handleEnrollClick = (course) => {
        const courseId = course.training_id || course.course_id;
        if (!token) {
            sessionStorage.setItem("pendingEnrollCourseId", courseId);
            sessionStorage.setItem("redirectAfterLogin", `/enroll/${courseId}`);
            toast.info("Please log in to complete your course enrollment!");
            navigate("/login", {
                state: {
                    redirectTo: `/enroll/${courseId}`,
                    course,
                },
            });
            return;
        }
        navigate(`/enroll/${courseId}`, { state: { course } });
    };

    const levels = ["ALL", "N5", "N4", "N3", "N2", "N1"];

    const formatFee = (fee) => {
    if (fee === null || fee === undefined || fee === "") return "Cost";
    const num = Number(fee);
    if (isNaN(num)) return fee;
    return num.toLocaleString("en-IN");
};

    // Filter courses by level and search query
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            // Level Filter
            if (selectedLevel !== "ALL") {
                const lvl = (course.course_level || "").toUpperCase();
                if (!lvl.includes(selectedLevel)) {
                    return false;
                }
            }

            // Search Query Filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const title = (course.training_title || "").toLowerCase();
                const desc = stripHtml(course.training_description || "").toLowerCase();
                const level = (course.course_level || "").toLowerCase();
                if (!title.includes(query) && !desc.includes(query) && !level.includes(query)) {
                    return false;
                }
            }

            return true;
        });
    }, [courses, selectedLevel, searchQuery]);

    return (
        <>
            {!selectedCourse ? (
                // COURSE LIST
                <section
                    id="courses"
                    className="relative overflow-hidden py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-red-50/15 to-white min-h-[85vh]"
                >
                    {/* Background Decorative Atmosphere matching Landing Page */}
                    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/3 left-0 -translate-y-1/2 -translate-x-12 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

                    

                    <div className="max-w-7xl mx-auto relative z-10">
                        {/* Heading matching Image 2 */}
                        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                            {/* Pill Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/80 shadow-xs text-xs sm:text-sm font-semibold text-[#C41E2E] mb-4">
                                <span className="flex h-2 w-2 rounded-full bg-[#C41E2E] animate-pulse" />
                                <span className="tracking-wide">  TrainSphere • Technical Training & Skill Development</span>
                            </div>

                            {/* Main Heading with Red / Gradient Accent */}
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1E39] tracking-tight leading-tight">
                               Explore Our Technical Training
                                <span className="block mt-1 bg-gradient-to-r from-[#C41E2E] via-[#E63946] to-[#7B3B5C] bg-clip-text text-transparent">
                                     Programs
                                </span>
                            </h2>

                            {/* Subtitle */}
                            {/* <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                                Master Japanese with structured JLPT-focused courses designed by experienced instructors and industry professionals.
                            </p> */}
                        </div>

                        {/* Interactive Filter & Search Controls from Image 2 */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-slate-200/80">
                            {/* JLPT Level Filter Chips */}
                            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                                {levels.map((lvl) => {
                                    const isActive = selectedLevel === lvl;
                                    return (
                                        <button
                                            key={lvl}
                                            onClick={() => setSelectedLevel(lvl)}
                                            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                                isActive
                                                    ? "bg-gradient-to-r from-[#0B1E39] via-[#1E2A4A] to-[#C41E2E] text-white shadow-md shadow-red-950/15"
                                                    : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs"
                                            }`}
                                        >
                                            {lvl === "ALL" ? "All Levels" : `JLPT ${lvl}`}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full md:w-72">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title, level..."
                                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-blue-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-2xs"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                        title="Clear search"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Courses Grid */}
                        {loading ? (
                            <div className="flex justify-center items-center py-24">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                                <span className="ml-3 text-gray-600 font-medium">Loading courses...</span>
                            </div>
                        ) : filteredCourses.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
                                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#C41E2E] flex items-center justify-center mx-auto mb-4 border border-red-100">
                                    <Search size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-[#0B1E39] mb-1">No Courses Found</h3>
                                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                    We couldn't find any courses matching your criteria. Try adjusting or clearing your filters.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedLevel("ALL");
                                        setSearchQuery("");
                                    }}
                                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {filteredCourses.map((course, index) => (
                                    
                                    <div
                                        key={course.training_id || course.course_id}
                                        onClick={(e) => {
                                            if (e.target.closest('[data-enroll-btn="true"]')) return;
                                            navigate(`/course/${course.training_id || course.course_id}`, { state: { course } });
                                        }}
                                        className="group relative flex flex-col sm:flex-row h-auto sm:h-[360px] overflow-hidden rounded-[28px] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                                        style={{
                                            border: "1px solid #E3E6EB",
                                            boxShadow: "0 2px 6px rgba(11,30,57,0.06)",
                                        }}
                                    >
                                        {/* COURSE DETAILS */}
                                        <div className="flex w-full sm:w-[46%] min-w-0 flex-col px-5 py-4">
                                            
                                            {/* LEVEL */}
                                            <div>
                                                <span
                                                    className="inline-flex rounded-lg px-3 py-1 text-xs font-medium"
                                                    style={{
                                                        border: "1px solid #0B1E39",
                                                        color: "#0B1E39",
                                                    }}
                                                >
                                                    Level: {course.course_level || "N5"}
                                                </span>
                                            </div>

                                            {/* TITLE */}
                                            <div className="mt-2">
                                                <h3
                                                    className="text-[21px] font-semibold leading-snug line-clamp-2"
                                                    style={{ color: "#171717" }}
                                                >
                                                    {course.training_title}
                                                </h3>

                                                <p
                                                    className="mt-1 text-sm"
                                                    style={{ color: "#9AA1AC" }}
                                                >
                                                    {course.instructor_name ||
                                                        course.instructor ||
                                                        (course.instructors?.length
                                                            ? course.instructors[0]?.name ||
                                                              course.instructors[0]?.instructor_name
                                                            : null) ||
                                                        "Instructor name"}
                                                </p>
                                            </div>

                                            {/* COURSE DETAILS */}
                                            <div
                                                className="mt-1 space-y-0.5 text-[13px] leading-[18px]"
                                                style={{ color: "#171717" }}
                                            >
                                                {/* Duration */}
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={15} />
                                                    <span>
                                                        {course.training_duration_hours || "20"}hrs
                                                    </span>
                                                </div>

                                                {/* Cost */}
                                                <div>
                                                    ₹{formatFee(course.training_fee)}
                                                </div>
                                                                                                {/* Start / End */}
                                                <div className="truncate">
                                                    Starts:{" "}
                                                    {course.training_start_date
                                                        ? formatDate(course.training_start_date)
                                                        : "—"}
                                                </div>
                                                <div className="truncate">
                                                    Ends:{" "}
                                                    {course.training_end_date
                                                        ? formatDate(course.training_end_date)
                                                        : "—"}
                                                </div>

                                                                                                {/* Enrollment Deadline */}
                                                <div className="truncate">
                                                    {isEnrollmentClosed(course) ? (
                                                        course.enrollment_status === "CLOSED" &&
                                                        new Date(course.training_start_date) > new Date() ? (
                                                            "Enrollment is currently closed."
                                                        ) : (
                                                            "Enrollment closed — course started."
                                                        )
                                                    ) : (
                                                        `Enrollment deadline: ${formatDate(course.training_start_date)}`
                                                    )}
                                                </div>
                                            </div>

                                            {/* DESCRIPTION */}
                                            <div className="mt-1">
                                                <p
                                                    className="text-[12px] leading-[15px] line-clamp-2"
                                                    style={{ color: "#171717" }}
                                                >
                                                    <span className="font-medium">
                                                        Description:{" "}
                                                    </span>

                                                    {stripHtml(
                                                        course.training_description || ""
                                                    ) ||
                                                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                                                </p>
                                            </div>

                                            {/* ENROLLMENT */}
                                            <div className="mt-auto pt-4 sm:pt-2">
                                                {isStudentOrVisitor && (
                                                    course.enroll_status === "A" ? (
                                                        <button
                                                            disabled
                                                            data-enroll-btn="true"
                                                            className="rounded-full px-4 py-2 text-[13px] font-semibold bg-green-100 text-green-700 cursor-not-allowed"
                                                        >
                                                            Enrolled
                                                        </button>
                                                    ) : course.enroll_status === "P" ? (
                                                        <button
                                                            disabled
                                                            data-enroll-btn="true"
                                                            className="rounded-full px-4 py-2 text-[13px] font-semibold bg-amber-100 text-amber-700 cursor-not-allowed"
                                                        >
                                                            Pending Approval
                                                        </button>
                                                    ) : course.enroll_status === "R" ? (
                                                        <button
                                                            disabled
                                                            data-enroll-btn="true"
                                                            className="rounded-full px-4 py-2 text-[13px] font-semibold bg-red-100 text-red-600 cursor-not-allowed"
                                                        >
                                                            Rejected
                                                        </button>
                                                    ) : isEnrollmentClosed(course) ? (
                                                        <button
                                                            disabled
                                                            data-enroll-btn="true"
                                                            className="rounded-full px-4 py-2 text-[13px] font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
                                                        >
                                                            Enrollment Closed
                                                        </button>
                                                    ) : (
                                                        <button
                                                            data-enroll-btn="true"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEnrollClick(course);
                                                            }}
                                                            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white cursor-pointer"
                                                            style={{
                                                                backgroundColor: "#0B1E39",
                                                            }}
                                                        >
                                                            Enroll
                                                            <ArrowRight
                                                                size={14}
                                                                strokeWidth={2.5}
                                                            />
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* COURSE IMAGE */}
                                        <div className="relative order-first sm:order-last m-3 sm:my-4 sm:mr-4 sm:ml-0 h-48 sm:h-auto w-auto sm:w-[54%] overflow-hidden rounded-[22px] sm:rounded-[26px]">
                                            <CourseThumbnail
                                                src={getThumbnailSrc(course.training_thumbnail)}
                                                alt={course.training_title}
                                                seed={index}
                                            />

                                            {/* New Badge */}
                                            {Number(course.is_new) === 1 && (
                                                <span
                                                    className="absolute top-4 right-4 text-white text-xs px-3 py-1.5 rounded-full font-semibold"
                                                    style={{
                                                        backgroundColor: "#C0432C",
                                                        border: "1px solid rgba(255,255,255,0.25)",
                                                    }}
                                                >
                                                    New
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                <EnrollmentModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                />
            )}
        </>
    );
};

export default Courses;