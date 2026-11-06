import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBook,
  FiAward,
  FiTrendingUp,
  FiCalendar,
  FiVideo,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../../components/lander/Navbar";
import { getCurrentUser } from "../../../utils/auth";

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const CARD =
  "bg-white border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.05)] rounded-3xl p-6 md:p-8";

const THUMB_GRADIENTS = [
  ["#0B1E39", "#22406B"],
  ["#7A1522", "#C41E2E"],
];

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const LEVEL_COLORS = ["#F1F1F4", "#FBC7C4", "#F27B77", "#EC2F32"];
const ENROLLED_PREVIEW_COUNT = 5;

const getStatus = (progress) => {
  if (progress === 0) return "Not Started";
  if (progress === 100) return "Completed";
  return "In Progress";
};

const getThumbnailSrc = (thumb) => {
  if (!thumb) return null;
  if (/^https?:\/\//i.test(thumb)) return thumb;
  return `${import.meta.env.VITE_API_BASE_URL}${thumb}`;
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatSessionTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Join button appears this long before the class starts
const JOIN_WINDOW_MS = 15 * 60 * 1000;
// If a session has no end_time, treat it as ending this long after it starts
const DEFAULT_SESSION_DURATION_MS = 2*60 * 60 * 1000;

const ensureUrl = (link) =>
  /^https?:\/\//i.test(link) ? link : `https://${link}`;

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

const CourseThumbnail = ({ src, alt, seed = 0 }) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
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
        <FiBook size={30} color="#fff" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className="w-full h-full object-cover"
    />
  );
};

const CardHeading = ({ icon, iconBg, iconColor, title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const HeaderProgressRing = ({ percentage = 0, size = 52, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePct = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference - (safePct / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e7e7f6" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#d62839"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.7s ease" }}
      />
    </svg>
  );
};

const StatPill = ({ icon, iconBg, iconColor, label, value }) => (
  <div className="flex flex-col items-center text-center gap-1.5 md:flex-row md:items-center md:text-left md:gap-3 bg-gray-50 rounded-2xl px-2 py-3 md:px-4 md:py-3">
    <div
      className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: iconBg, color: iconColor }}
    >
      {icon}
    </div>
    <div>
      <p className="text-base md:text-lg font-bold text-slate-900 leading-none md:hidden">{value}</p>
      <p className="text-[10px] md:text-[11px] text-gray-500 font-medium leading-tight md:leading-none mt-1 md:mt-0 md:mb-1">
        {label}
      </p>
      <p className="hidden md:block text-lg font-bold text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

const ActivityCalendar = ({ data }) => {
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  let lastLabeledMonth = null;

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {weeks.map((week, wi) => {
          const firstOfMonth = week.find((d) => new Date(d.date).getDate() <= 7);
          let label = "";

          if (firstOfMonth) {
            const monthIndex = new Date(firstOfMonth.date).getMonth();
            if (monthIndex !== lastLabeledMonth) {
              label = MONTH_ABBR[monthIndex];
              lastLabeledMonth = monthIndex;
            }
          }

          return (
            <div key={wi} className="flex flex-col gap-1.5 relative">
              <span className="text-[11px] text-gray-400 font-medium h-4 block">{label}</span>
              {week.map((day, di) => (
                <div
                  key={di}
                  title={`${day.iso || day.date} — ${day.level > 0 ? "active" : "no activity"}`}
                  className="w-5 h-5 rounded-[4px] transition-colors"
                  style={{ backgroundColor: LEVEL_COLORS[day.level] }}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mt-4">
        <span className="text-[11px] text-gray-400">Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className="w-3.5 h-3.5 rounded-[4px]" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[11px] text-gray-400">More</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const ContinueLearningCard = ({ course, idx, onContinue, onOpen }) => {
  const [from, to] = THUMB_GRADIENTS[idx % THUMB_GRADIENTS.length];

  return (
    <div
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && event.key === "Enter") {
          onOpen();
        }
      }}
      tabIndex={0}
      className="bg-white border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.05)] rounded-3xl p-4 flex gap-4 cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
      <div
        className="relative w-28 sm:w-36 flex-shrink-0 rounded-2xl overflow-hidden min-h-[150px]"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        <CourseThumbnail
          src={getThumbnailSrc(course.training_thumbnail)}
          alt={course.training_title}
          seed={course.training_id}
        />
        {course.course_level && (
          <span className="absolute top-2 left-2 bg-white text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
            {course.course_level}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-[10px] font-semibold text-gray-400 tracking-wide">Continue learning</p>
        <h3 className="text-lg font-bold text-slate-900 leading-snug truncate">
          {course.training_title}
        </h3>
        <p className="text-xs text-gray-500 truncate">
          {course.topic_title || "Module —"} · {course.last_lesson_title || "Lesson —"}
        </p>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="font-semibold text-slate-700">{course.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1b1530] to-[#d62839] rounded-full transition-all duration-700"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-gray-400 mt-2">
          Last activity: {formatDateTime(course.last_activity_at)}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onContinue();
          }}
          className="mt-3 self-start bg-[#1b1530] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition cursor-pointer"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

const SESSION_STYLES = {
  // green = the class is happening right now
  live: {
    row: "bg-green-50",
    bar: "bg-green-500",
    chip: "bg-green-100 text-green-700",
    btn: "bg-green-600",
  },
  // blue = scheduled for later
  upcoming: {
    row: "bg-[#eef0fb]",
    bar: "bg-[#1b1530]",
    chip: "bg-[#dde2f7] text-[#1b1530]",
    btn: "bg-[#1b1530]",
  },
};


const startOfDay = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// live  = already started (and not ended, the list is already filtered)
// soon  = starts within the join window
// today = later today, later = another day
const getSessionState = (session, now) => {
  const start = new Date(session.start_time).getTime();

  if (start <= now) return { key: "live", label: "Live now" };
  if (start - now <= JOIN_WINDOW_MS) return { key: "upcoming", label: "Starting soon" };

  const dayDiff = Math.round((startOfDay(start) - startOfDay(now)) / 86400000);

  if (dayDiff <= 0) return { key: "upcoming", label: "Today" };
  if (dayDiff === 1) return { key: "upcoming", label: "Tomorrow" };
  return { key: "upcoming", label: `In ${dayDiff} days` };
};

const ComingUpCard = ({ sessions, loading }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);


  const visibleSessions = sessions.filter((s) => {
    const start = new Date(s.start_time).getTime();
    const end = s.end_time
      ? new Date(s.end_time).getTime()
      : start + DEFAULT_SESSION_DURATION_MS;
    return end > now;
  });

  return (
    <div className={`${CARD} flex flex-col`}>
      <CardHeading
        icon={<FiVideo size={17} />}
        iconBg="#EDE7F6"
        iconColor="#271042"
        title="Coming up"
        subtitle="Your live classes"
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : visibleSessions.length === 0 ? (
        <p className="text-sm text-gray-500">No live classes scheduled right now.</p>
      ) : (
        <>
          <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {visibleSessions.map((session) => {
              const state = getSessionState(session, now);
              const s = SESSION_STYLES[state.key];
              const canJoin =
                session.meeting_link &&
                new Date(session.start_time).getTime() - now <= JOIN_WINDOW_MS;

              return (
                <li
                  key={session.live_session_id}
                  className={`relative flex items-center justify-between gap-3 rounded-xl pl-5 pr-3 py-3 ${s.row}`}
                >
                  <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${s.bar}`} />

                  <div className="min-w-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1 ${s.chip}`}
                    >
                      {state.key === "live" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      )}
                      {state.label}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {session.lesson_title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{session.training_title}</p>
                    <p className="text-xs text-gray-500">{formatSessionTime(session.start_time)}</p>
                  </div>

                  {canJoin && (
                    <a
                      href={ensureUrl(session.meeting_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-shrink-0 text-white text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 ${s.btn}`}
                    >
                      Join Class
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

// const EnrolledCoursesCard = ({ courses, onViewAll }) => {
  const EnrolledCoursesCard = ({ courses, onOpen }) => {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? courses : courses.slice(0, ENROLLED_PREVIEW_COUNT);

  const isLocked = (c) =>
    c.enroll_status !== "A" ||
    (c.training_start_date && new Date(c.training_start_date) > new Date());

  return (
    <div className={CARD}>
      <CardHeading
        icon={<FiBook size={17} />}
        iconBg="#EDE7F6"
        iconColor="#271042"
        title="Enrolled Courses"
        subtitle={`${courses.length} course${courses.length !== 1 ? "s" : ""}`}
        action={
          courses.length > 0 && (
            <button
                onClick={() => setShowAll((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full bg-[#f0eef9] px-5 py-2 text-sm font-semibold text-[#29234e] hover:bg-[#e6e3f3] transition cursor-pointer"
              >
                {showAll ? "Show Less" : `View All (${courses.length})`}
                <FiChevronRight
                  size={15}
                  className={`transition-transform ${showAll ? "-rotate-90" : "rotate-90"}`}
                />
              </button>
          )
        }
        // action={
        //   <button
        //     onClick={onViewAll}
        //     className="text-xs font-semibold text-[#d62839] hover:underline cursor-pointer"
        //   >
        //     View all courses
        //   </button>
        // }
      />

      {courses.length === 0 ? (
        <p className="text-gray-500 text-sm">No enrolled courses yet.</p>
      ) : (
        <>
          {/* Phone: card list */}
          <div className="flex flex-col gap-3 sm:hidden">
            {rows.map((course, idx) => (
              <div
                key={course.training_id}
                onClick={() => !isLocked(course) && onOpen(course)}
                className={`flex items-center gap-3 bg-gray-50 rounded-2xl p-3 ${isLocked(course) ? "" : "cursor-pointer active:bg-gray-100"}`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${THUMB_GRADIENTS[idx % 2][0]}, ${THUMB_GRADIENTS[idx % 2][1]})`,
                  }}
                >
                  {course.training_title?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{course.training_title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {course.training_duration_hours} hrs · {course.completed_lessons ?? "—"}/{course.total_lessons ?? "—"} lessons
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-gray-600 text-xs font-bold flex-shrink-0">{course.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet / desktop: table */}
          <div className="hidden sm:block overflow-x-auto -mx-2">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2 px-2 font-semibold text-xs uppercase tracking-wide">Course</th>
                  <th className="py-2 px-2 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">Total Hours</th>
                  <th className="py-2 px-2 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">Lessons</th>
                  <th className="py-2 px-2 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">Progress</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((course, idx) => {
                  const border = idx !== rows.length - 1 ? "border-b border-gray-50" : "";
                  return (
                    <tr
                      key={course.training_id}
                      onClick={() => !isLocked(course) && onOpen(course)}
                      className={`group ${isLocked(course) ? "" : "cursor-pointer"}`}
                    >
                      <td className={`py-3.5 px-2 font-semibold text-slate-900 rounded-l-xl group-hover:bg-gray-50 transition-colors ${border}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${THUMB_GRADIENTS[idx % 2][0]}, ${THUMB_GRADIENTS[idx % 2][1]})`,
                            }}
                          >
                            {course.training_title?.charAt(0) ?? "?"}
                          </div>
                          <span className="truncate max-w-[220px]">{course.training_title}</span>
                        </div>
                      </td>
                      <td className={`py-3.5 px-2 text-gray-600 group-hover:bg-gray-50 transition-colors ${border}`}>
                        {course.training_duration_hours} hrs
                      </td>
                      <td className={`py-3.5 px-2 text-gray-600 group-hover:bg-gray-50 transition-colors ${border}`}>
                        {course.completed_lessons ?? "—"} / {course.total_lessons ?? "—"}
                      </td>
                      <td className={`py-3.5 px-2 rounded-r-xl group-hover:bg-gray-50 transition-colors ${border}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-gray-600 text-xs font-bold w-9">{course.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const MyLearning = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalLessons: 0,
    completedLessons: 0,
    overallProgressPercent: 0,
  });

  const [activityData, setActivityData] = useState([]);
  const [streaks, setStreaks] = useState({ current: 0, longest: 0, totalDays: 0 });
  const [streakLoaded, setStreakLoaded] = useState(false);

  const currentUser = getCurrentUser();
  const studentName = currentUser?.user_full_name || currentUser?.username || "Student";
  const overallProgress = Math.round(overview?.overallProgressPercent ?? 0);

  // Single activity fetch, used by the hero pill AND the heatmap
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/students/activity?days=63`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setActivityData(res.data?.days || []);
        setStreaks(res.data?.streaks || { current: 0, longest: 0, totalDays: 0 });
        setStreakLoaded(true);
      } catch (error) {
        console.log(error);
      }
    };
    fetchActivity();
  }, []);

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [recentLearning, setRecentLearning] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Upcoming live sessions 
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/upcoming`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUpcomingSessions(res.data?.sessions || []);
      } catch (error) {
        console.log(error);
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Recently viewed lessons
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/students/activity/recent-learning`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecentLearning(res.data?.courses || []);
      } catch (error) {
        console.log(error);
      } finally {
        setRecentLoading(false);
      }
    };
    fetchRecent();
  }, []);

  // Enrollments
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");

        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/enrollments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const withProgress = (res.data.enrollments || []).map((course) => {
          const progress = course.progress_percent || 0;
          return { ...course, progress, status: getStatus(progress) };
        });

        const STATUS_PRIORITY = { A: 2, R: 2, P: 1 };
        const getDateField = (c) => c.updated_at || c.enrolled_at || c.enrollment_date || c.created_at;
        const bestByTraining = new Map();

        withProgress.forEach((course) => {
          const existing = bestByTraining.get(course.training_id);
          if (!existing) {
            bestByTraining.set(course.training_id, course);
            return;
          }

          const existingPriority = STATUS_PRIORITY[existing.enroll_status] || 0;
          const currentPriority = STATUS_PRIORITY[course.enroll_status] || 0;

          if (currentPriority !== existingPriority) {
            if (currentPriority > existingPriority) bestByTraining.set(course.training_id, course);
            return;
          }

          const dateField = getDateField(course);
          const existingDateField = getDateField(existing);

          if (dateField && existingDateField) {
            if (new Date(dateField) >= new Date(existingDateField)) {
              bestByTraining.set(course.training_id, course);
            }
          } else {
            bestByTraining.set(course.training_id, course);
          }
        });

        setCourses(Array.from(bestByTraining.values()));
        setOverview(
          res.data.overview || { totalLessons: 0, completedLessons: 0, overallProgressPercent: 0 }
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [location]);

  // Merge recently viewed lessons with enrollment data (progress, thumbnail...)
  const continueCourses = recentLearning
    .map((recent) => {
      const enrollment = courses.find((c) => c.training_id === recent.training_id);
      return enrollment ? { ...enrollment, ...recent } : null;
    })
    .filter(
      (c) =>
        c &&
        c.enroll_status === "A" &&
        c.progress < 100 &&
        !(c.training_start_date && new Date(c.training_start_date) > new Date())
    )
    .slice(0, 2);

  const inProgressCount = courses.filter((c) => c.status === "In Progress").length;
  const completedCount = courses.filter((c) => c.status === "Completed").length;

  const { current, longest, totalDays } = streaks;

  return (
    <>
      <Navbar />

      <div className="min-h-dvh shrink-0 px-4 sm:px-6 pb-32 sm:pb-20 pt-24">
  
        <div className="w-full max-w-7xl mx-auto space-y-6">

          {/* ---------- Hero (OLD design with image, commented out) ----------
          <div className="relative flex items-center overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#3f2a5a] via-[#7b2d4f] to-[#d4343a] px-5 pt-5 pb-10 sm:px-8 sm:pt-6 sm:pb-14 sm:min-h-[220px] shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
            <svg
              className="pointer-events-none absolute right-0 top-0 hidden h-full w-[55%] md:block"
              viewBox="0 0 600 260"
              preserveAspectRatio="xMaxYMax meet"
              aria-hidden="true"
            >
              <polygon points="40,260 300,52 580,260" fill="#ffffff" fillOpacity="0.14" />
              <polygon points="195,260 300,52 405,260" fill="#ffffff" fillOpacity="0.22" />
              <polygon points="300,52 272,92 290,86 300,98 310,86 328,92" fill="#ffffff" fillOpacity="0.92" />
              <circle cx="478" cy="76" r="32" fill="#f8d7dc" fillOpacity="0.95" />
              <circle cx="40" cy="64" r="7" fill="#ffffff" fillOpacity="0.85" />
              <circle cx="192" cy="50" r="6" fill="#ffffff" fillOpacity="0.85" />
              <circle cx="112" cy="160" r="5" fill="#ffffff" fillOpacity="0.85" />
              <circle cx="498" cy="196" r="6" fill="#ffffff" fillOpacity="0.85" />
              <g fill="#ef4b52" fillOpacity="0.55">
                <rect x="520" y="170" width="7" height="90" />
                <rect x="566" y="170" width="7" height="90" />
                <rect x="508" y="166" width="78" height="8" rx="2" />
                <rect x="518" y="190" width="56" height="5" />
              </g>
            </svg>

            <div className="relative max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Hello, {studentName}!</h1>
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                Pick up where you left off. A few minutes of practice today keeps your streak alive.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm">
                <span>🔥</span>
                <span>
                  Current streak: {streakLoaded ? current : "—"} day{current === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
          */}

          {/* ---------- Hero (NEW, no image) ---------- */}
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#3f2a5a] via-[#7b2d4f] to-[#d4343a] px-5 py-6 sm:px-8 sm:py-8 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Hello, {studentName}!</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/85">
              Pick up where you left off. A few minutes of practice today keeps your streak alive.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm">
              <span>🔥</span>
              <span>
                Current streak: {streakLoaded ? current : "—"} day{current === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* ---------- Stat cards ---------- */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-slate-500">Enrolled</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                {loading ? (
                  <div className="h-7 w-10 rounded bg-slate-200 animate-pulse" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold leading-none text-[#1b1530]">{courses.length}</span>
                )}
                <span className="rounded-full bg-[#e7e7f6] px-3 py-1 text-xs font-medium text-[#4b4a8a]">Courses</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-slate-500">In Progress</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                {loading ? (
                  <div className="h-7 w-10 rounded bg-slate-200 animate-pulse" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold leading-none text-[#1b1530]">{inProgressCount}</span>
                )}
                <span className="rounded-full bg-[#fde8ea] px-3 py-1 text-xs font-medium text-[#c4303c]">Active now</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-slate-500">Completed</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                {loading ? (
                  <div className="h-7 w-14 rounded bg-slate-200 animate-pulse" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold leading-none text-[#1b1530]">{completedCount}</span>
                )}
                <span className="rounded-full bg-[#dcf5e6] px-3 py-1 text-xs font-medium text-[#2f8a55]">Finished</span>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(15,23,42,0.08)]">
              <HeaderProgressRing percentage={loading ? 0 : overallProgress} />
              <div>
                <p className="text-sm text-slate-500">Overall Progress</p>
                {loading ? (
                  <div className="mt-1 h-9 w-16 rounded bg-slate-200 animate-pulse" />
                ) : (
                  <p className="mt-1 text-2xl sm:text-3xl font-extrabold leading-none text-[#1b1530]">{overallProgress}%</p>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Continue learning ---------- */}
          {loading || recentLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-3xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : continueCourses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {continueCourses.map((course, idx) => (
                <ContinueLearningCard
                  key={course.training_id}
                  course={course}
                  idx={idx}
                  onOpen={() =>
                    navigate(`/student/course/${course.training_id}`, { state: { from: "/my-learning" } })
                  }
                  onContinue={() =>
                    navigate(
                      course.last_lesson_id
                        ? `/student/course/${course.training_id}/learn?lesson=${course.last_lesson_id}`
                        : `/student/course/${course.training_id}/learn`
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className={`${CARD} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}>
              <div>
                <h2 className="text-base font-bold text-slate-900">Nothing in progress</h2>
                <p className="text-sm text-gray-500 mt-1">Open one of your courses to start your next lesson.</p>
              </div>
              <button
                onClick={() => navigate("/my-courses")}
                className="self-start bg-[#1b1530] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 cursor-pointer"
              >
                Go to My Courses
              </button>
            </div>
          )}

          {/* ---------- Activity + Coming up ---------- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${CARD}`}>
              <CardHeading
                icon={<FiCalendar size={17} />}
                iconBg="#FDE9E7"
                iconColor="#ec2f32"
                title="Learning Activity"
                subtitle="Last 9 weeks"
              />

              <div className="flex flex-col md:flex-row md:justify-between gap-y-8 md:gap-x-8 md:items-center">
                <div className="md:flex-shrink-0">
                  <ActivityCalendar data={activityData} />
                </div>

                <div className="grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-3 md:w-72">
                  <StatPill
                    icon={<span style={{ fontSize: 15 }}>🔥</span>}
                    iconBg="#FFF1E6"
                    iconColor="#EA580C"
                    label="Current Streak"
                    value={`${current} day${current !== 1 ? "s" : ""}`}
                  />
                  <StatPill
                    icon={<FiAward size={16} />}
                    iconBg="#FEF3C7"
                    iconColor="#B45309"
                    label="Longest Streak"
                    value={`${longest} day${longest !== 1 ? "s" : ""}`}
                  />
                  <StatPill
                    icon={<FiTrendingUp size={16} />}
                    iconBg="#E7F5EC"
                    iconColor="#15803D"
                    label="Total Learning Days"
                    value={totalDays}
                  />
                </div>
              </div>
            </div>

            <ComingUpCard sessions={upcomingSessions} loading={sessionsLoading} />
          </div>

          {/* ---------- Enrolled courses ---------- */}
          {/* <EnrolledCoursesCard courses={courses} onViewAll={() => navigate("/my-courses")} /> */}
          <EnrolledCoursesCard
            courses={courses}
            onOpen={(course) =>
              navigate(`/student/course/${course.training_id}`, { state: { from: "/my-learning" } })
            }
          />
          <div className="h-24 sm:h-0" aria-hidden="true" />

        </div>
      </div>
    </>
  );
};

export default MyLearning;