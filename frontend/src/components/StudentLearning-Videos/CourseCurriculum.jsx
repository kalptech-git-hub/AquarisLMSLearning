import { useState, useEffect } from "react";
import SpeakingPracticeTab from "./SpeakingPracticeTab";
import {
    FiChevronDown,
    FiChevronRight,
    FiPlayCircle,
    FiCheckCircle,
    FiBook,
    FiClock,
    FiLock,
    FiMic,
    FiFileText,
    FiHelpCircle
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TbList, TbListCheck } from "react-icons/tb";

const CourseCurriculum = ({
    topics,
    selectedLesson,
    onLessonSelect,
    allLessons = [],
    currentIndex,
    completedLessons = {},
    isSidebarOpen = true,
    setIsSidebarOpen,
    trainingId,
    courseId
}) => {
    const navigate = useNavigate();

    // for tab switch
    const [activeTab, setActiveTab] = useState("content");

    const [openTopics, setOpenTopics] = useState(() => {
        const initial = {};
        topics?.forEach(topic => {
            initial[topic.topic_id] = true;
        });
        return initial;
    });

    const toggleTopic = (topicId) => {
        setOpenTopics(prev => ({
            ...prev,
            [topicId]: !prev[topicId]
        }));
    };

    // const courseDuration =
    //     allLessons.reduce(
    //         (sum, lesson) =>
    //             sum + (Number(lesson.lesson_duration) || 0),
    //         0
    //     );

    /* */
    // const completedCount =
    //     Object.keys(completedLessons).length;

    const isVisibleLesson = (lesson) =>
        lesson?.lesson_content_type !== "live";

    const visibleAllLessons = (allLessons || []).filter(isVisibleLesson);

    const completedCount =
        visibleAllLessons.filter(
            lesson => completedLessons[lesson.lesson_id]
        ).length;

    const progressPercent =
        visibleAllLessons.length > 0
            ? Math.round(
                (completedCount / visibleAllLessons.length) * 100
            )
            : 0;

    // console.log(
    //     allLessons.map(l => ({
    //         id: l.lesson_id,
    //         title: l.lesson_title
    //     }))
    // );

    /* FORMATING DURATION */
    const formatDuration = (seconds) => {
        const totalSeconds = Number(seconds) || 0;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }

        if (minutes > 0) {
            return secs > 0
                ? `${minutes}m ${secs}s`
                : `${minutes} min`;
        }

        return `${secs} sec`;
    };

    const isLessonLocked = (lesson) => {
        const visibleLessonIndex = visibleAllLessons.findIndex(
            l => l.lesson_id === lesson.lesson_id
        );

        if (visibleLessonIndex <= 0) return false;

        const previousLesson = visibleAllLessons[visibleLessonIndex - 1];

        return !completedLessons[previousLesson.lesson_id];
    };

    const visibleTopics = (topics || [])
        .map(topic => ({
            ...topic,
            lessons: (topic.lessons || []).filter(isVisibleLesson)
        }))
        .filter(topic => (topic.lessons || []).length > 0);

    /* Total duration for topic */
    const getLessonDurationInSeconds = (lesson) => {
        if (!lesson) return 0;
        switch (lesson.lesson_content_type) {
            case "video":
                return Number(lesson.lesson_duration) || 0;

            case "text":
                return 5 * 60; // Hardcoded 5 min for files

            case "quiz":
                if (lesson.quiz_duration_minutes) {
                    return Number(lesson.quiz_duration_minutes) * 60;
                }
                if (lesson.lesson_duration) {
                    const dur = Number(lesson.lesson_duration);
                    return dur > 100 ? dur : dur * 60;
                }
                return 15 * 60; // 15 min

            default:
                return Number(lesson.lesson_duration) || 0;
        }
    };

    const getLessonDuration = (lesson) => {
        if (!lesson) return "--";
        switch (lesson.lesson_content_type) {
            case "video":
                return formatDuration(lesson.lesson_duration);

            case "text":
                return "5 min"; // Hardcoded 5 min for files

            case "quiz":
                if (lesson.quiz_duration_minutes) {
                    return `${lesson.quiz_duration_minutes} min`;
                }
                if (lesson.lesson_duration) {
                    const dur = Number(lesson.lesson_duration);
                    return dur > 100 ? formatDuration(dur) : `${dur} min`;
                }
                return "15 min";

            default:
                return formatDuration(lesson.lesson_duration) || "--";
        }
    };

    /* Different icons as per the lesson */
    // const getLessonIcon = (type) => {
    //     switch (type?.toLowerCase()) {
    //         case "video":
    //             return <FiPlayCircle size={18} className="text-blue-600" />;

    //         case "text":
    //             return <FiFileText size={18} className="text-purple-600" />;

    //         case "quiz":
    //             return <FiHelpCircle size={18} className="text-amber-600" />;

    //         default:
    //             return <FiPlayCircle size={18} />;
    //     }
    // };

    const getLessonStatusIcon = ({
        lesson,
        locked,
        isDone,
        isSelected
    }) => {

        if (locked) {
            return <FiLock className="text-slate-400 text-lg" />;
        }

        if (isDone) {
            return <FiCheckCircle className="text-emerald-600 text-lg" />;
        }

        switch (lesson.lesson_content_type?.toLowerCase()) {

            case "video":
                return (
                    <FiPlayCircle
                        className={`text-lg ${isSelected
                            ? "text-purple-600 animate-pulse"
                            : "text-blue-600"
                            }`}
                    />
                );

            case "text":
                return (
                    <FiFileText
                        className={`text-lg ${isSelected
                            ? "text-purple-600"
                            : "text-purple-500"
                            }`}
                    />
                );

            case "quiz":
                return (
                    <TbListCheck
                        className={`text-lg ${isSelected
                            ? "text-purple-600"
                            : "text-amber-500"
                            }`}
                    />
                );

            default:
                return (
                    <FiPlayCircle className="text-slate-600 text-lg" />
                );
        }
    };

    /* Label as per the lesson */
    const getLessonTypeLabel = (type) => {
        switch (type?.toLowerCase()) {
            case "video":
                return "Video";

            case "text":
                return "File";

            case "quiz":
                return "Quiz";

            default:
                return "Lesson";
        }
    };

    /* was: only user-toggled isSidebarOpen decided whether the sidebar rendered — no distinction between "comfortable" tablets (plenty of width AND height: iPad Pro, Nest Hub Max) and "compact" ones (Surface Pro 7: width too narrow; Nest Hub: height too short beside the video). iPad Pro and Nest Hub share the same 1024px width, so a width-only breakpoint can't tell them apart — height has to be checked too. */
    /* was: "(pointer: coarse) and (max-width: 1023px), (pointer: coarse) and (min-width: 1024px) and (max-height: 699px)" — this put every touch tablet in our target list (iPad Pro, Surface Pro 7, Nest Hub, Nest Hub Max, Zenbook Fold) into the compact/drawer tier, either on width (anything under 1024px) or on the height carve-out for short-but-wide screens like Nest Hub. Per updated direction, tablets should look and behave exactly like desktop — sidebar inline and open by default, no overlay drawer — reserving the drawer purely for phone-sized touch screens. Narrowed to max-width: 767px (below our narrowest listed tablet, Zenbook Fold at 853px) and dropped the height carve-out entirely, so Nest Hub (1024x600) now also gets the inline sidebar like every other tablet, matching the desktop layout as requested. */
    const [isCompactTablet, setIsCompactTablet] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(
            "(pointer: coarse) and (max-width: 767px)"
        );

        const handleChange = (e) => setIsCompactTablet(e.matches);

        handleChange(mq);
        mq.addEventListener("change", handleChange);

        return () => mq.removeEventListener("change", handleChange);
    }, []);

    /* New: on the compact/drawer tier the sidebar covers the player, so picking a lesson should also close the drawer. Scoped to isCompactTablet only — desktop/comfortable-tier behavior unchanged. */
    const handleLessonSelectAndClose = (lesson) => {
        onLessonSelect(lesson);

        if (isCompactTablet) {
            setIsSidebarOpen(false);
        }
    };

    // was: `if (!isSidebarOpen) return null;` unconditionally — on the compact/drawer tier the aside needs to stay mounted (just translated off-screen) so it can slide in/out; only the comfortable (in-flow) tier removes it from the DOM entirely when closed, same as before.
    if (!isSidebarOpen && !isCompactTablet) {
        return null;
    }

    return (
        <>
            {/* New: backdrop, compact/drawer tier only — tap outside the drawer to close it, same pattern as the sidebar-drawer used elsewhere in this project. */}
            {isCompactTablet && isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-30"
                />
            )}

            {/* was: className="w-[360px] lg:w-[420px] ... shrink-0 ... z-20" at every breakpoint. lg:w-[420px] triggered at 1024px — the same width as iPad Pro and Nest Hub, both of which need the OPPOSITE of wider. Split into two tiers: compact (fixed off-canvas drawer, translate-x controlled by isSidebarOpen) and comfortable (original in-flow sidebar, but the "get wider" step moved from lg: (1024px) to xl:/2xl: (1280/1536px) so only genuinely spacious desktop widens it — iPad Pro and Nest Hub Max get a narrower 300px "shrink" width instead). */}
            <aside
                className={
                    isCompactTablet
                        ? `fixed inset-y-0 right-0 w-[85%] max-w-[360px] bg-white text-slate-700 border-l border-slate-200 flex flex-col overflow-hidden shadow-2xl transition-transform duration-300 z-40 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
                        }`
                        // was: w-[300px] xl:w-[360px] 2xl:w-[420px] — widened by ~50-60px at each step per user feedback that the sidebar felt a bit narrow.
                        : "w-[350px] xl:w-[410px] 2xl:w-[480px] bg-white text-slate-700 border-l border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-2xl transition-all duration-300 z-20"
                }
            >
                {/* Sidebar Title Header */}
                <div className="border-b border-slate-200 bg-white shrink-0">

                    <div className="p-4 flex items-center justify-between">

                        <div className="flex items-center gap-2">
                            <FiBook className="text-purple-600 text-lg" />
                            <h3 className="font-bold text-base text-slate-900">
                                Learning
                            </h3>
                        </div>

                        {/* was: text-[11px] */}
                        <span className="px-2.5 py-1 text-[12px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {allLessons.length} Lessons
                        </span>

                    </div>

                    <div className="px-4 pb-3">
                        <div className="flex bg-slate-100 rounded-xl p-1">

                            <button
                                onClick={() => setActiveTab("content")}
                                // was: text-sm
                                className={`flex-1 py-2 rounded-lg text-[16px] font-medium transition cursor-pointer
                            ${activeTab === "content"
                                        ? "bg-white text-[#35175a] shadow-sm"
                                        : "text-slate-600"
                                    }`}
                            >
                                Course Content
                            </button>

                            <button
                                onClick={() => setActiveTab("speaking")}
                                // was: text-sm
                                className={`flex-1 py-2 rounded-lg text-[16px] font-medium transition flex items-center justify-center gap-2 cursor-pointer
                            ${activeTab === "speaking"
                                        ? "bg-white text-[#35175a] shadow-sm"
                                        : "text-slate-600"
                                    }`}
                            >
                                <FiMic size={16} />
                                Speaking
                            </button>

                        </div>
                    </div>


                </div>


                {/* Course Content */}
                {activeTab === "content" && (
                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                        {/* existing topics code */}
                        {/* Topics & Lessons Accordion List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                            {!visibleTopics || visibleTopics.length === 0 ? (
                                <div className="text-center py-12 px-4 text-slate-500 text-sm">
                                    No topics or modules available yet.
                                </div>
                            ) : (
                                visibleTopics.map((topic, index) => {
                                    const totalLessons = topic.lessons?.length || 0;

                                    const topicCompletedCount = topic.lessons?.filter(
                                        l => completedLessons[l.lesson_id]
                                    ).length || 0;

                                    // Previous
                                    // const totalDuration =
                                    //     topic.lessons?.reduce(
                                    //         (sum, lesson) => sum + (Number(lesson.lesson_duration) || 0),
                                    //         0
                                    //     ) || 0;

                                    // New added - to calculate the hardcoded File/Quiz duration
                                    const totalDuration =
                                        topic.lessons?.reduce(
                                            (sum, lesson) =>
                                                sum + getLessonDurationInSeconds(lesson),
                                            0
                                        ) || 0;

                                    const isTopicOpen = openTopics[topic.topic_id];




                                    return (
                                        <div
                                            key={topic.topic_id}
                                            className="bg-white"
                                        >
                                            {/* Module Header Button */}
                                            <button
                                                onClick={() => toggleTopic(topic.topic_id)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition text-left cursor-pointer group"
                                            >
                                                <div className="flex flex-col pr-2 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {/* was: text-sm */}
                                                        <h4 className="font-bold text-[16px] text-slate-900 group-hover:text-[#35175a] transition truncate">
                                                            Module {index + 1}: {topic.topic_title}
                                                        </h4>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                                                        {/* was: text-[11px] */}
                                                        <span className="px-2 py-0.5 rounded bg-white/5 text-[12px] text-slate-300 font-medium">
                                                            {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                                                        </span>
                                                        <span>•</span>
                                                        {/* was: text-[11px] */}
                                                        <span className="flex items-center gap-1 text-[12px] text-slate-400">
                                                            {/* was: text-[10px] */}
                                                            <FiClock className="text-[11px]" />
                                                            {/* {totalDuration} min */}
                                                            {formatDuration(totalDuration)}
                                                        </span>
                                                        {topicCompletedCount > 0 && (
                                                            <>
                                                                <span>•</span>
                                                                {/* was: text-[11px] */}
                                                                <span className="text-[12px] text-emerald-600 font-semibold">
                                                                    {topicCompletedCount}/{totalLessons} done
                                                                    {/* {completedCount}/{allLessons.length} completed */}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-slate-400 group-hover:text-slate-600 transition shrink-0 ml-2">
                                                    {isTopicOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                                                </div>
                                            </button>

                                            {/* Module Lessons List */}
                                            {isTopicOpen && (
                                                <div
                                                    className="bg-slate-50 divide-y divide-white/5 border-t border-white/5"
                                                >
                                                    {topic.lessons && topic.lessons.length > 0 ? (
                                                        topic.lessons.map((lesson) => {
                                                            const isSelected = selectedLesson?.lesson_id === lesson.lesson_id;
                                                            const isDone = !!completedLessons[lesson.lesson_id];

                                                            const locked = isLessonLocked(lesson);

                                                            return (
                                                                /* was: onClick called onLessonSelect(lesson) directly — swapped for handleLessonSelectAndClose, which also closes the drawer on the compact tier (no-op on the comfortable/desktop tier). Comment moved above the tag: a {/* *​/} comment can't sit inside an attribute list between props (it broke the oxc/Vite parser here), only as a JSX child between tags or, as here, above the opening tag entirely. */
                                                                <button
                                                                    key={lesson.lesson_id}
                                                                    onClick={() => {
                                                                        if (!isLessonLocked(lesson)) {
                                                                            handleLessonSelectAndClose(lesson);
                                                                        }
                                                                    }}

                                                                    className={`w-full flex items-start gap-3 p-3.5 text-left transition relative
                                                                    ${locked
                                                                            ? "opacity-50 cursor-not-allowed bg-slate-100 border-l-4 border-transparent"
                                                                            : isSelected
                                                                                ? "bg-[#35175a]/10 text-[#35175a] border-l-4 border-[#35175a] font-semibold cursor-pointer"
                                                                                : "hover:bg-white text-slate-700 border-l-4 border-transparent cursor-pointer"
                                                                        }`}
                                                                >
                                                                    {/* Status Icon */}
                                                                    {/* <div className="mt-0.5 shrink-0">
                                                                    {isDone ? (
                                                                        <FiCheckCircle className="text-emerald-600 text-lg" />
                                                                    ) : isSelected ? (
                                                                        <FiPlayCircle className="text-purple-600 text-lg animate-pulse" />
                                                                    ) : (
                                                                        <FiPlayCircle className="text-slate-600 text-lg" />
                                                                    )}
                                                                </div> */}


                                                                    <div className="mt-0.5 shrink-0">
                                                                        {/* {locked ? (
                                                                        <FiLock className="text-slate-400 text-lg" />
                                                                    ) : isDone ? (
                                                                        <FiCheckCircle className="text-emerald-600 text-lg" />
                                                                    ) : isSelected ? (
                                                                        <FiPlayCircle className="text-purple-600 text-lg animate-pulse" />
                                                                    ) : (
                                                                        <FiPlayCircle className="text-slate-600 text-lg" />
                                                                    )} */}

                                                                        {getLessonStatusIcon({
                                                                            lesson,
                                                                            locked,
                                                                            isDone,
                                                                            isSelected
                                                                        })}
                                                                    </div>

                                                                    <div className="flex flex-col min-w-0 flex-1">
                                                                        <span

                                                                            // className={`text-sm leading-snug 
                                                                            // ${isSelected ? "text-[#35175a] font-bold" : "text-slate-800"}`}

                                                                            // was: text-sm
                                                                            className={`text-[15] leading-snug
                                                                            ${locked
                                                                                    ? "text-slate-400"
                                                                                    : isSelected
                                                                                        ? "text-[#35175a] font-bold"
                                                                                        : "text-slate-800"
                                                                                }`}

                                                                        >
                                                                            {lesson.lesson_title}
                                                                        </span>

                                                                        {/* was: text-[11px] */}
                                                                        <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-400 font-normal">
                                                                            <span>
                                                                                {/* {formatDuration(lesson.lesson_duration)} */}
                                                                                {getLessonDuration(lesson)}

                                                                            </span>
                                                                            {locked && (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <span className="text-amber-600 font-medium">
                                                                                        Locked
                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                            {lesson.lesson_content_type && (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <span className="capitalize">
                                                                                        {/* {lesson.lesson_content_type} */}
                                                                                        {getLessonTypeLabel(lesson.lesson_content_type)}

                                                                                    </span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="p-4 text-xs text-slate-500 italic">
                                                            No lessons added to this module yet.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Speaking practice */}
                {activeTab === "speaking" && (
                    <div className="flex-1 overflow-y-auto">
                        <SpeakingPracticeTab courseId={courseId} />
                    </div>
                )}
            </aside>
        </>
    );
};
export default CourseCurriculum;


// DON'T REMOVE IT - previous code-
{/* <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white shrink-0">
    <div className="flex items-center gap-2">
        <FiBook className="text-purple-600 text-lg" />
        <h3 className="font-bold text-base text-slate-900 tracking-tight">
            Course Content
        </h3>
    </div>

    <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        {allLessons.length} Lessons
    </span>
</div> */}

// DON'T REMOVE IT - previous code- 
{/* Topics & Lessons Accordion List */ }
{/* <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
    {!topics || topics.length === 0 ? (
        <div className="text-center py-12 px-4 text-slate-500 text-sm">
            No topics or modules available yet.
        </div>
    ) : (
        topics.map((topic, index) => {
            const totalLessons = topic.lessons?.length || 0;

            const topicCompletedCount = topic.lessons?.filter(
                l => completedLessons[l.lesson_id]
            ).length || 0;

            const totalDuration =
                topic.lessons?.reduce(
                    (sum, lesson) => sum + (Number(lesson.lesson_duration) || 0),
                    0
                ) || 0;

            const isTopicOpen = openTopics[topic.topic_id];




            return (
                <div
                    key={topic.topic_id}
                    className="bg-white"
                >
                    <button
                        onClick={() => toggleTopic(topic.topic_id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition text-left cursor-pointer group"
                    >
                        <div className="flex flex-col pr-2 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#35175a] transition truncate">
                                    Module {index + 1}: {topic.topic_title}
                                </h4>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-slate-300 font-medium">
                                    {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                    <FiClock className="text-[10px]" />
                                    {formatDuration(totalDuration)}
                                </span>
                                {topicCompletedCount > 0 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-[11px] text-emerald-600 font-semibold">
                                            {topicCompletedCount}/{totalLessons} done
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="text-slate-400 group-hover:text-slate-600 transition shrink-0 ml-2">
                            {isTopicOpen ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        </div>
                    </button>

                    {isTopicOpen && (
                        <div
                            className="bg-slate-50 divide-y divide-white/5 border-t border-white/5"
                        >
                            {topic.lessons && topic.lessons.length > 0 ? (
                                topic.lessons.map((lesson) => {
                                    const isSelected = selectedLesson?.lesson_id === lesson.lesson_id;
                                    const isDone = !!completedLessons[lesson.lesson_id];

                                    const locked = isLessonLocked(lesson);

                                    return (
                                        <button
                                            key={lesson.lesson_id}
                                            onClick={() => {
                                                if (!isLessonLocked(lesson)) {
                                                    onLessonSelect(lesson);
                                                }
                                            }}

                    

                                            className={`w-full flex items-start gap-3 p-3.5 text-left transition relative
                                                            ${locked
                                                    ? "opacity-50 cursor-not-allowed bg-slate-100 border-l-4 border-transparent"
                                                    : isSelected
                                                        ? "bg-[#35175a]/10 text-[#35175a] border-l-4 border-[#35175a] font-semibold cursor-pointer"
                                                        : "hover:bg-white text-slate-700 border-l-4 border-transparent cursor-pointer"
                                                }`}
                                        >
                                        


                                            <div className="mt-0.5 shrink-0">
                                                {locked ? (
                                                    <FiLock className="text-slate-400 text-lg" />
                                                ) : isDone ? (
                                                    <FiCheckCircle className="text-emerald-600 text-lg" />
                                                ) : isSelected ? (
                                                    <FiPlayCircle className="text-purple-600 text-lg animate-pulse" />
                                                ) : (
                                                    <FiPlayCircle className="text-slate-600 text-lg" />
                                                )}
                                            </div>

                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span
                                                   
                                                    className={`text-sm leading-snug
                                                                    ${locked
                                                            ? "text-slate-400"
                                                            : isSelected
                                                                ? "text-[#35175a] font-bold"
                                                                : "text-slate-800"
                                                        }`}

                                                >
                                                    {lesson.lesson_title}
                                                </span>

                                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-normal">
                                                    <span>
                                                        {formatDuration(lesson.lesson_duration)}
                                                    </span>
                                                    {locked && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-amber-600 font-medium">
                                                                Locked
                                                            </span>
                                                        </>
                                                    )}
                                                    {lesson.lesson_content_type && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="capitalize">{lesson.lesson_content_type}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-xs text-slate-500 italic">
                                    No lessons added to this module yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        
        })
    )}
</div> */}