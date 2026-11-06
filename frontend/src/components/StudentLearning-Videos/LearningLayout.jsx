import { useState, useEffect, useRef } from "react";
import LessonPlayer from "./LessonPlayer";
import CourseCurriculum from "./CourseCurriculum";
import CircularProgress from "./CircularProgress";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSidebar, FiBookOpen } from "react-icons/fi";
import DictionaryWidget from "./DictionaryWidget";
import StudentNotificationBell from "../student/StudentNotificationBell";

const LearningLayout = ({
    training,
    selectedLesson,
    setSelectedLesson,
    allLessons,
    currentIndex,
    completedLessons,
    markLessonCompleted,

    //resource lesson
    resourceData
}) => {
    const navigate = useNavigate();
    const learningLayoutRef = useRef(null);
    // was: useState(true) — sidebar always opened by default, on every device.

    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true;

        const isPhone = window.matchMedia(
            "(pointer: coarse) and (max-width: 767px)"
        ).matches;

        return !isPhone;
    });

    /* Restrict common browser inspection shortcuts throughout the learning screen */
    useEffect(() => {
        const container = learningLayoutRef.current;
        if (!container) return;

        // Disable right-click throughout the learning interface
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // Block common browser inspection shortcuts
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();

            const isInspectShortcut =
                e.key === "F12" ||
                (
                    (e.ctrlKey || e.metaKey) &&
                    e.shiftKey &&
                    ["i", "j", "c"].includes(key)
                ) ||
                (
                    (e.ctrlKey || e.metaKey) &&
                    key === "u"
                );

            if (isInspectShortcut) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };

        container.addEventListener(
            "contextmenu",
            handleContextMenu
        );

        window.addEventListener(
            "keydown",
            handleKeyDown,
            true
        );

        return () => {
            container.removeEventListener(
                "contextmenu",
                handleContextMenu
            );

            window.removeEventListener(
                "keydown",
                handleKeyDown,
                true
            );
        };
    }, []);

    // const [completedLessons, setCompletedLessons] = useState({});

    // const toggleLessonCompletion = (lessonId) => {
    //     setCompletedLessons(prev => ({
    //         ...prev,
    //         [lessonId]: !prev[lessonId]
    //     }));
    // };


    // const markLessonCompleted = (
    //     lessonId
    // ) => {
    //     setCompletedLessons(prev => ({
    //         ...prev,
    //         [lessonId]: true
    //     }));
    // };

    /* */
    // const completedCount = Object.values(completedLessons).filter(Boolean).length;

    // const progressPercentage =
    //     allLessons.length > 0
    //         ? Math.round((completedCount / allLessons.length) * 100)
    //         : 0;

    const progressLessons = allLessons.filter(
        lesson => lesson.lesson_content_type !== "live"
    );

    const completedCount = progressLessons.filter(
        lesson => completedLessons[lesson.lesson_id]
    ).length;

    const progressPercentage =
        progressLessons.length > 0
            ? Math.round(
                (completedCount / progressLessons.length) * 100
            )
            : 0;

    const isLessonLocked = (lesson) => {
        if (!lesson) return true;

        const lessonIndex = allLessons.findIndex(
            l => l.lesson_id === lesson.lesson_id
        );

        // First lesson is always unlocked
        if (lessonIndex === 0) {
            return false;
        }

        const previousLesson = allLessons[lessonIndex - 1];

        return !completedLessons[previousLesson.lesson_id];
    };

    const handleLessonSelect = (lesson) => {
        if (!lesson) return;

        if (isLessonLocked(lesson)) {
            return;
        }

        setSelectedLesson(lesson);
    };

    return (
        <div 
        ref={learningLayoutRef}
        className="h-[100dvh] flex flex-col bg-slate-900 overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 bg-[#120F1D] text-white flex items-center justify-between px-5 border-b border-white/10 shadow-md shrink-0 z-30">
                {/* Left Section */}
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        // onClick={() =>
                        // navigate(`/student/course/${training?.training_id}`)
                        // }
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-sm font-medium border border-white/10 cursor-pointer"
                    >
                        <FiArrowLeft className="text-base" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <div className="w-px h-6 bg-white/15" />

                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => navigate("/")}
                    >

                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 relative transition-transform duration-200 group-hover:scale-105"
                        >
                            <img
                                src="/lms_logo.png"
                                alt="AFJ Logo"
                                className="relative z-10 w-full h-auto object-contain object-center select-none pointer-events-none block origin-bottom-right lg:scale-x-[1.04] xl:scale-x-[1.08] lg:scale-y-[1.12] xl:scale-y-[1.2]"
                            />
                        </div>
                        {/* <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                            <FiBookOpen className="text-lg" />

                        </div> */}

                        {/* was: className="... hidden md:block" — showing the logo wordmark from md: (768px) up meant it competed for space with the progress ring, "Your Progress" text, and Cinema Mode button on common laptop-width windows (~1280–1440px), pushing the right section past the viewport edge where the page's overflow-hidden clipped it invisibly instead of wrapping. Deferred to xl: so it only claims space once there's room to spare. */}
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent hidden xl:block">
                            Nihongo LMS
                        </h1>
                    </div>

                    {/* was: hidden md:block — kept in sync with the logo wordmark's breakpoint above (now xl:) so the divider doesn't appear orphaned when the logo text it separates is hidden. */}
                    <div className="w-px h-6 bg-white/15 hidden xl:block" />

                    {/* was: className="flex items-center gap-2.5 truncate" — truncate was on this wrapper but min-w-0 was missing, so in a flex row it could refuse to shrink below its content's natural width, per the recurring min-w-0 bug pattern. No visual change where things already fit. */}
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                        {/* was: max-w-[280px] lg:max-w-[400px] — growing to 400px as early as lg: (1024px) left too little room for the header's right section (progress ring + Cinema Mode button) once the logo text and course badge also appeared, causing the right section to be pushed off-screen and clipped on common laptop windows. Growth deferred to xl: instead. */}
                        <h2 className="font-semibold text-base text-slate-100 truncate max-w-[280px] xl:max-w-[400px]">
                            {training?.training_title || "Course Details"}
                        </h2>
                        {/* was: hidden lg:inline-block — showing the course-code badge from 1024px up added to the same width-budget problem; deferred to 2xl: (1536px) so it only appears once the window is comfortably wide. */}
                        <span className="hidden 2xl:inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {training?.course_code}
                        </span>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* bg-white/5 px-3.5 py-1.5 rounded-xl border border-white/10 */}
                    <StudentNotificationBell variant="learning" />
                    <div className="flex items-center gap-3">
                        <CircularProgress percentage={progressPercentage} />
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-semibold text-slate-200">Your Progress</p>
                            <p className="text-[11px] text-slate-400 font-medium">
                                {/* {completedCount} of {allLessons.length} completed */}
                                {completedCount} of {progressLessons.length} completed
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(prev => !prev)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 text-xs font-medium ${isSidebarOpen
                            ? "bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                        title={isSidebarOpen ? "Collapse sidebar (Cinema Mode)" : "Expand sidebar"}
                    >
                        <FiSidebar className="text-lg" />
                        {/* was: hidden xl:inline — at 1280px this label could still be squeezed out along with the rest of the right section on the exact windows where the bug was reported; deferred to 2xl: (1536px) alongside the other deferred elements above so the right section (icon + progress ring) always has guaranteed room, with the text label only appearing once the window is wide enough to spare it. */}
                        <span className="hidden 2xl:inline">
                            {isSidebarOpen ? "Cinema Mode" : "Show Content"}
                        </span>
                    </button>
                </div>
            </header>

            {/* Main Content Workspace */}
            <div className="flex flex-1 overflow-hidden relative">
                <div className="relative flex-1 min-w-0 flex">
                    <LessonPlayer
                        training={training}
                        selectedLesson={selectedLesson}
                        onLessonSelect={handleLessonSelect}
                        allLessons={allLessons}
                        currentIndex={currentIndex}

                        completedLessons={completedLessons}
                        toggleLessonCompletion={markLessonCompleted}

                        // resource lesson
                        resourceData={resourceData}
                    />

                    <DictionaryWidget />
                </div>

                <CourseCurriculum
                    topics={training?.topics}
                    selectedLesson={selectedLesson}
                    // onLessonSelect={setSelectedLesson}
                    onLessonSelect={handleLessonSelect}
                    allLessons={allLessons}
                    currentIndex={currentIndex}

                    completedLessons={completedLessons}
                    // toggleLessonCompletion={toggleLessonCompletion}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}

                    trainingId={training?.training_id}
                    courseId={training?.course_id}
                />



            </div>
        </div>
    );
};

export default LearningLayout;