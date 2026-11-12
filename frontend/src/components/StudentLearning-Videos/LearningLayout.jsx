import { useState, useEffect, useRef } from "react";
import LessonPlayer from "./LessonPlayer";
import CourseCurriculum from "./CourseCurriculum";
import CircularProgress from "./CircularProgress";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSidebar } from "react-icons/fi";
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
    resourceData
}) => {
    const navigate = useNavigate();
    const learningLayoutRef = useRef(null);
    const [isSecureHidden, setIsSecureHidden] = useState(false);

    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        if (typeof window === "undefined") return true;
        const isPhone = window.matchMedia(
            "(pointer: coarse) and (max-width: 767px)"
        ).matches;
        return !isPhone;
    });

    useEffect(() => {
        const container = learningLayoutRef.current;
        if (!container) return;

        // Disable Right-Click Context Menu
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        //  Block common browser
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();

            // hide content instant 
            if (
                e.key === "PrintScreen" || 
                key === "printscreen" || 
                e.keyCode === 44 || 
                e.key === "Meta" || 
                e.key === "Win" ||
                (e.ctrlKey && (key === "p" || key === "s" || key === "c"))
            ) {
                setIsSecureHidden(true);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText("Protected Content - Screen Capture Blocked!");
                    }
                } catch (err) {
                    console.log("Clipboard error", err);
                }
                return false;
            }

            // Inspect shortcuts block
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && ["i", "j", "c", "s", "r"].includes(key)) ||
                (e.ctrlKey && key === "u")
            ) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        
       

        const handleBlur = () => setIsSecureHidden(true);

        const handleVisibilityChange = () => {
            if (document.hidden || document.visibilityState === "hidden") {
                setIsSecureHidden(true);
            }
        };

        container.addEventListener("contextmenu", handleContextMenu);
        window.addEventListener("keydown", handleKeyDown, true);
       
        window.addEventListener("blur", handleBlur);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            container.removeEventListener("contextmenu", handleContextMenu);
            window.removeEventListener("keydown", handleKeyDown, true);
            window.removeEventListener("keyup", handleKeyUp, true);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const progressLessons = allLessons.filter(
        lesson => lesson.lesson_content_type !== "live"
    );

    const completedCount = progressLessons.filter(
        lesson => completedLessons[lesson.lesson_id]
    ).length;

    const progressPercentage =
        progressLessons.length > 0
            ? Math.round((completedCount / progressLessons.length) * 100)
            : 0;

    const isLessonLocked = (lesson) => {
        if (!lesson) return true;
        const lessonIndex = allLessons.findIndex(l => l.lesson_id === lesson.lesson_id);
        if (lessonIndex === 0) return false;
        const previousLesson = allLessons[lessonIndex - 1];
        return !completedLessons[previousLesson.lesson_id];
    };

    const handleLessonSelect = (lesson) => {
        if (!lesson) return;
        if (isLessonLocked(lesson)) return;
        setSelectedLesson(lesson);
    };

    return (
        <div 
            ref={learningLayoutRef}
            className="h-[100dvh] flex flex-col bg-slate-900 overflow-hidden font-sans relative select-none"
            style={{
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                userSelect: "none"
            }}
        >
            {/* Absolute Instant Blank */}
            {isSecureHidden && (
                <div 
                    onClick={() => setIsSecureHidden(false)}
                    className="absolute inset-0 z-[999999] bg-black flex items-center justify-center select-none cursor-pointer"
                    title="Click anywhere to resume learning"
                >
                    <div className="text-white bg-slate-950 border border-red-500/50 px-10 py-6 rounded-2xl shadow-2xl font-bold text-center flex flex-col items-center gap-3">
                        <span className="text-3xl"></span>
                        <span className="text-lg text-red-400">Screen Capture Blocked</span>
                        <span className="text-xs text-slate-400 font-normal max-w-xs">
                            <br/>
                            <span className="text-purple-400 underline mt-1 block">Click anywhere to resume</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="h-16 bg-[#120F1D] text-white flex items-center justify-between px-5 border-b border-white/10 shadow-md shrink-0 z-30">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-sm font-medium border border-white/10 cursor-pointer"
                    >
                        <FiArrowLeft className="text-base" />
                        <span className="hidden sm:inline">Back</span>
                    </button>

                    <div className="w-px h-6 bg-white/15" />

                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 relative transition-transform duration-200 group-hover:scale-105">
                            <img
                                src="/lms_logo.png"
                                alt="AFJ Logo"
                                className="relative z-10 w-full h-auto object-contain object-center select-none pointer-events-none block origin-bottom-right"
                            />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent hidden xl:block">
                            Nihongo LMS
                        </h1>
                    </div>

                    <div className="w-px h-6 bg-white/15 hidden xl:block" />

                    <div className="flex items-center gap-2.5 truncate min-w-0">
                        <h2 className="font-semibold text-base text-slate-100 truncate max-w-[280px] xl:max-w-[400px]">
                            {training?.training_title || "Course Details"}
                        </h2>
                        <span className="hidden 2xl:inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {training?.course_code}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <StudentNotificationBell variant="learning" />
                    <div className="flex items-center gap-3">
                        <CircularProgress percentage={progressPercentage} />
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-semibold text-slate-200">Your Progress</p>
                            <p className="text-[11px] text-slate-400 font-medium">
                                {completedCount} of {progressLessons.length} completed
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(prev => !prev)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2 text-xs font-medium ${
                            isSidebarOpen
                                ? "bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30"
                                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                        title={isSidebarOpen ? "Collapse sidebar (Cinema Mode)" : "Expand sidebar"}
                    >
                        <FiSidebar className="text-lg" />
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
                        resourceData={resourceData}
                    />
                    <DictionaryWidget />
                </div>

                <CourseCurriculum
                    topics={training?.topics}
                    selectedLesson={selectedLesson}
                    onLessonSelect={handleLessonSelect}
                    allLessons={allLessons}
                    currentIndex={currentIndex}
                    completedLessons={completedLessons}
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