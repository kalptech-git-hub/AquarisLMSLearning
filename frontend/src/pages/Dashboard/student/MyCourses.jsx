import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FiLock, FiSearch, FiClock, FiBookOpen, FiCalendar, FiChevronDown, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/lander/Navbar";

const FILTERS = ["All", "Not Started", "In Progress", "Completed", "Upcoming", "Approval Pending", "Rejected"];

const courseStatus = (course) => {
  if (course.enroll_status === "P") return "Approval Pending";
  if (course.enroll_status === "R") return "Rejected";
  if (course.training_start_date && new Date(course.training_start_date) > new Date()) return "Upcoming";
  const progress = Number(course.progress_percent || 0);
  return progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started";
};

const badgeStyles = {
  "Not Started": "bg-[#efedf9] text-[#4d4964]",
  "In Progress": "bg-[#e4e8f8] text-[#29234e]",
  Completed: "bg-emerald-100 text-emerald-800",
  Upcoming: "bg-[#e4e8f8] text-[#29234e]",
  "Approval Pending": "bg-amber-100 text-amber-800",
  Rejected: "bg-rose-100 text-rose-800",
};

const gradients = [
  "from-[#211b4b] to-[#713352]",
  "from-[#d8dcf1] to-[#f7e9ed]",
  "from-[#d8ddf2] to-[#c9cfea]",
  "from-[#f5e8ef] to-[#d8def2]",
];

const MetaChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#e6befb]/40 px-3 py-1.5 text-[11px] font-medium text-[#371538] sm:text-xs">
    <Icon size={13} className="shrink-0" />
    {children}
  </span>
);

const SORTS = {
  recent: "Newest enrolled",
  title: "Title A–Z",
  progress: "Progress",
  start: "Start date",
};

const SortMenu = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border bg-white px-5 py-3 text-sm text-[#403d55] transition ${open ? "border-[#211b4b] ring-4 ring-[#e4e8f8]" : "border-[#e9e7f1] hover:border-[#a9a4c4]"}`}
      >
        Sort: <span className="font-medium text-[#211d3d]">{SORTS[value]}</span>
        <FiChevronDown size={16} className={`text-[#6b6880] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+8px)] z-20 w-52 rounded-2xl sm:left-auto sm:right-0 border border-[#dedbe9] bg-white p-1.5 shadow-[0_8px_24px_rgba(31,27,69,0.12)]"
        >
          {Object.entries(SORTS).map(([key, label]) => (
            <li key={key} role="option" aria-selected={value === key}>
              <button
                type="button"
                onClick={() => { onChange(key); setOpen(false); }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-sm transition ${value === key ? "bg-[#efedf9] font-medium text-[#211b4b]" : "text-[#403d55] hover:bg-[#f5f4fa]"}`}
              >
                {label}
                {value === key && <FiCheck size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    let active = true;
    const fetchCourses = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/enrollments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rows = (res.data.enrollments || []).map((course) => ({
          ...course,
          progress_percent: Number(course.progress_percent || 0),
        }));
        const best = new Map();
        rows.forEach((course) => {
          const old = best.get(course.training_id);
          const priority = { A: 2, R: 2, P: 1 };
          if (!old || (priority[course.enroll_status] || 0) >= (priority[old.enroll_status] || 0)) best.set(course.training_id, course);
        });
        if (active) setCourses([...best.values()]);
      } catch (error) {
        console.error("Failed to load courses", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCourses();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
  const list = courses.filter((course) => {
    const matchesName = (course.training_title || "").toLowerCase().includes(query.trim().toLowerCase());
    return matchesName && (filter === "All" || courseStatus(course) === filter);
  });

  const sorters = {
    recent: (a, b) => (b.enrollment_id || 0) - (a.enrollment_id || 0),
    title: (a, b) => (a.training_title || "").localeCompare(b.training_title || ""),
    progress: (a, b) => a.progress_percent - b.progress_percent,
    start: (a, b) =>
      new Date(a.training_start_date || 8.64e15) - new Date(b.training_start_date || 8.64e15),
  };

  return [...list].sort(sorters[sort]);
}, [courses, filter, query, sort]);

  return (
    <>
      <Navbar />
      <main className="min-h-dvh shrink-0 px-4 pb-32 pt-24 sm:px-6 sm:pb-20">
  <section className="mx-auto w-full max-w-7xl rounded-[28px] border border-[#e9e7f1] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <h1 className="shrink-0 text-2xl font-bold tracking-tight text-[#211d3d] sm:text-3xl">My Courses</h1>
            <label className="flex h-12 w-full items-center gap-3 rounded-full bg-[#f5f4fa] px-5 text-[#89869c] md:max-w-xl md:flex-1">
              <FiSearch size={18} className="shrink-0" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses by name" className="w-full bg-transparent text-sm text-[#211d3d] outline-none placeholder:text-[#777486]" />
            </label>
            <div className="flex shrink-0 flex-wrap items-center gap-3 md:ml-auto">
              <span className="whitespace-nowrap rounded-full bg-[#f0eef9] px-5 py-3 text-sm font-semibold text-[#29234e]">{filtered.length} {filtered.length === 1 ? "Course" : "Courses"}</span>
              <SortMenu value={sort} onChange={setSort} />
            </div>
          </div>

          <div className="filter-scroll mb-6 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={`shrink-0 cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium transition ${filter === item ? "bg-[#211b4b] text-white shadow-sm" : "bg-[#efedf9] text-[#4d4964] hover:bg-[#d9d5ec]"}`}>
                {item}
              </button>
            ))}
          </div>

          {loading ? <p className="py-16 text-center text-sm text-slate-500">Loading your courses…</p> : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#dedbe9] py-16 text-center text-sm text-slate-500">{courses.length ? "No courses match your search or filter." : "You have no courses yet."}</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filtered.map((course, index) => {
                const status = courseStatus(course);
                const progress = status === "Completed" ? 100 : course.progress_percent;
                const locked = status === "Upcoming" || status === "Approval Pending" || status === "Rejected";
                const action = status === "Completed" ? "Review Course" : status === "In Progress" ? "Continue Learning" : status === "Not Started" ? "Start Learning" : status === "Upcoming" ? "Starts soon" : status === "Rejected" ? "Enrollment rejected" : "Awaiting approval";
                const pending = status === "Approval Pending";
                const image = course.thumbnail_url || course.training_thumbnail || course.thumbnail;
                const imageSrc = image && (/^https?:\/\//i.test(image) ? image : `${import.meta.env.VITE_API_BASE_URL}${image}`);
                return (
                  <article
                  key={course.training_id || course.enrollment_id || index}
                  onClick={() => {
                        if (!locked) navigate(`/student/course/${course.training_id}`, { state: { from: "/my-courses" } });
                  }}
                  onKeyDown={(event) => {
                    if (!locked && event.target === event.currentTarget && event.key === "Enter") {
                      navigate(`/student/course/${course.training_id}`, { state: { from: "/my-courses" } });
                    }
                  }}
                  tabIndex={locked ? -1 : 0}
                  className={`flex min-h-[220px] overflow-hidden rounded-[24px] border border-[#e9e7f1] bg-white p-3 shadow-[0_2px_8px_rgba(31,27,69,0.05)] transition sm:min-h-[238px] sm:p-4 ${locked ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(31,27,69,0.12)]"}`}
                >
                    <div className={`relative flex w-[34%] min-w-[92px] shrink-0 flex-col justify-between overflow-hidden rounded-[16px] bg-gradient-to-br ${gradients[index % gradients.length]} bg-cover bg-center p-3`} style={imageSrc ? { backgroundImage: `url(${imageSrc})` } : undefined}>
                      {imageSrc && <div className="absolute inset-0 bg-black/10" />}
                      <span className="relative self-start rounded-md bg-white px-2 py-1 text-[10px] font-bold text-[#272247]">{course.course_level || "Course"}</span>
                      {!imageSrc && <strong className="relative line-clamp-3 text-sm font-bold leading-tight text-white">{course.training_title || "Japanese Course"}</strong>}
                      {status === "Upcoming" && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#211b4b]/65 px-2 text-center text-white"><FiLock size={18} className="mb-2" /><strong className="text-xs leading-tight">Course not started yet</strong><span className="mt-1 text-[10px] leading-tight">Available from {new Date(course.training_start_date).toLocaleDateString()}</span></div>}
                      {pending && <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/55 px-2 text-center text-white backdrop-blur-[2px]"><FiLock size={18} className="mb-2" /><strong className="text-xs leading-tight">Waiting for admin approval</strong><span className="mt-1 text-[10px] leading-tight text-white/90">You'll get access once your enrollment is confirmed.</span></div>}
                    </div>
                    <div className="relative flex min-w-0 flex-1 flex-col pl-3 sm:pl-4">
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#777486] sm:text-[10px]">{status === "In Progress" ? "Continue Learning" : status}</p>
                      <h2 className="line-clamp-2 text-sm font-bold leading-snug text-[#211d3d] sm:text-base">{course.training_title || "Untitled course"}</h2>
                      <p className="mt-1 line-clamp-1 text-[11px] text-[#777486] sm:text-xs">{course.instructor_names || "Instructor"}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {course.training_duration_hours ? <MetaChip icon={FiClock}>{course.training_duration_hours} hrs</MetaChip> : null}
                        {course.total_lessons ? <MetaChip icon={FiBookOpen}>{course.total_lessons} {Number(course.total_lessons) === 1 ? "lesson" : "lessons"}</MetaChip> : null}
                        {status === "Upcoming" && course.training_start_date ? (
                          <MetaChip icon={FiCalendar}>
                            Starts {new Date(course.training_start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </MetaChip>
                        ) : null}
                      </div>
                      <div className="mt-auto">
                        <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-medium text-[#403d55] sm:text-xs"><span>Progress</span><span>{progress}%</span></div>
                        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[#e8e5f3]"><div className="h-full rounded-full bg-gradient-to-r from-[#211b4b] to-[#d62845]" style={{ width: `${progress}%` }} /></div>
                        <button disabled={locked} onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/student/course/${course.training_id}/learn`);
                          }} className={`rounded-full px-3 py-2 text-[10px] font-semibold transition sm:px-4 sm:text-xs ${locked ? `cursor-not-allowed ${status === "Rejected" ? "border border-rose-200 bg-rose-50 text-rose-800" : "bg-[#efedf9] text-[#6b6880]"}` : "cursor-pointer bg-[#211b4b] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#332b68] hover:shadow-lg active:translate-y-0 active:scale-95"}`}>{action}</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
