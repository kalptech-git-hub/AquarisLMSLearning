import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
    FiChevronLeft,
    FiChevronRight,
    FiCheckCircle,
    FiClock,
    FiVideo,
    FiFileText,
    FiFolder,
    FiEdit3,
    FiDownload,
    FiBookOpen,
    FiPlay,
    FiPause,
    FiImage,
    FiMusic,
    FiEye,
    FiExternalLink,
    FiMaximize2,
    FiMinimize2,
    FiLock,
} from "react-icons/fi";
import ResourceLesson from "./ResourceLesson";
import QuizPlayer from "./QuizPlayer";
import InlineMediaViewer from "../common/InlineMediaViewer.jsx";
import { X } from "lucide-react";

const LessonPlayer = ({
    training,
    selectedLesson,
    allLessons,
    currentIndex,
    onLessonSelect,
    completedLessons = {},
    toggleLessonCompletion,

    // resource data
    resourceData
}) => {
    const [activeTab, setActiveTab] = useState("overview");
    const [notes, setNotes] = useState("");

    // For lesson content
    const [lessonContents, setLessonContents] = useState([]);
    const [loadingContents, setLoadingContents] = useState(false);
    const [previewingContentId, setPreviewingContentId] = useState(null);

    // To have pause and resume button on video
    const [isPlaying, setIsPlaying] = useState(false);
    const [lastAction, setLastAction] = useState("play");
    const [showCenterControl, setShowCenterControl] = useState(false);

    const previousLesson = allLessons[currentIndex - 1];
    const nextLesson = allLessons[currentIndex + 1];
    const isCompleted = selectedLesson ? !!completedLessons[selectedLesson.lesson_id] : false;

    const videoRef = useRef(null);
    const videoPlayerContainerRef = useRef(null);
    const [isBlur, setIsBlur] = useState(false);
    const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

    /* VIDEO PRIVACY PROTECTION */
    // useEffect(() => {
    //     const handleBlur = () => {
    //         setIsBlur(true);

    //         // Pause native video when browser loses focus
    //         if (videoRef.current) {
    //             videoRef.current.pause();
    //         }
    //     };

    //     const handleFocus = () => {
    //         setIsBlur(false);
    //     };

    //     window.addEventListener("blur", handleBlur);
    //     window.addEventListener("focus", handleFocus);

    //     return () => {
    //         window.removeEventListener("blur", handleBlur);
    //         window.removeEventListener("focus", handleFocus);
    //     };
    // }, []);

    /* VIDEO PRIVACY PROTECTION */
useEffect(() => {
    const hideVideo = () => {
        setIsBlur(true);

        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    const showVideo = () => {
        setIsBlur(false);
    };

    const handleVisibilityChange = () => {
        if (document.hidden) {
            hideVideo();
        } else {
            showVideo();
        }
    };

    window.addEventListener("blur", hideVideo);
    window.addEventListener("focus", showVideo);

    document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
    );

    return () => {
        window.removeEventListener("blur", hideVideo);
        window.removeEventListener("focus", showVideo);

        document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
        );
    };
}, []);

    const toggleVideoFullscreen = async () => {
        try {
            const container = videoPlayerContainerRef.current;
            if (!container) return;

            const fsElem = (
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            if (!fsElem) {
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    await container.mozRequestFullScreen();
                } else if (container.msRequestFullscreen) {
                    await container.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    await document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
            }
        } catch (err) {
            console.error("Video fullscreen error:", err);
        }
    };

    // Keep track of container or native video fullscreen state
    useEffect(() => {
        const handleFullscreenChange = () => {
            const fsElem = (
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsVideoFullscreen(
                fsElem === videoPlayerContainerRef.current || fsElem === videoRef.current
            );
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
        };
    }, []);

    /* Save the last watched time */
    const lastSavedRef = useRef(0);

    const handleTimeUpdate = () => {

        const video = videoRef.current;

        if (!video) return;

        const currentTime =
            Math.floor(video.currentTime);

        if (
            currentTime -
            lastSavedRef.current <
            15
        ) {
            return;
        }

        lastSavedRef.current =
            currentTime;

        saveProgress(video);
    };

    /* Continue from where previously left off. */
    useEffect(() => {

        const video = videoRef.current;

        if (!video || !selectedLesson) return;

        const handleLoadedMetadata = () => {

            if (
                selectedLesson.lesson_last_watch_seconds > 0
            ) {
                video.currentTime =
                    selectedLesson.lesson_last_watch_seconds;
            }

        };

        video.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata
        );

        return () => {
            video.removeEventListener(
                "loadedmetadata",
                handleLoadedMetadata
            );
        };

    }, [selectedLesson]);

    const saveProgress = async (
        video
    ) => {

        try {
            const token =
                sessionStorage.getItem("token");

            const percentage =
                (
                    video.currentTime /
                    video.duration
                ) * 100;

            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/lessons-progress/save`,
                {
                    lesson_id:
                        selectedLesson.lesson_id,

                    last_watch_seconds:
                        Math.floor(
                            video.currentTime
                        ),

                    percentage:
                        percentage.toFixed(2)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },

                }
            );

        } catch (error) {

            console.error(
                "Failed to save progress",
                error
            );
        }
    };

    /* Working */
    // const handleVideoEnded = async () => {
    //     console.log("VIDEO ENDED");
    //     try {
    //         const token =
    //             sessionStorage.getItem("token");

    //         const res = await axios.post(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/lessons-progress/complete`,
    //             {
    //                 lesson_id:
    //                     selectedLesson.lesson_id
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             }
    //         );
    //         console.log(res.data);

    //         // Update UI
    //         // toggleLessonCompletion(
    //         //     selectedLesson.lesson_id
    //         // );

    //         // Mark completed in UI
    //         toggleLessonCompletion(
    //             selectedLesson.lesson_id
    //         );

    //         // Move to next lesson
    //         if (nextLesson) {
    //             onLessonSelect(nextLesson);
    //         }

    //         // Auto move to next lesson
    //         // if (nextLesson) {
    //         //     onLessonSelect(nextLesson);
    //         // }

    //         // Auto move to next lesson only after completion
    //         // if (
    //         //     nextLesson &&
    //         //     completedLessons[selectedLesson.lesson_id]
    //         // ) {
    //         //     onLessonSelect(nextLesson);
    //         // }

    //     } catch (error) {

    //         console.error(
    //             "Failed to complete lesson",
    //             error
    //         );
    //     }
    // };

    const handleVideoEnded = async () => {
        // console.log("VIDEO ENDED");

        const completed = await toggleLessonCompletion(
            selectedLesson.lesson_id
        );

        if (completed && nextLesson) {
            onLessonSelect(nextLesson);
        }
    };

    /* Handle resource completion - working */
    // const handleResourceComplete = async () => {
    //     try {

    //         const token =
    //             sessionStorage.getItem("token");

    //         await axios.post(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/lessons-progress/complete`,
    //             {
    //                 lesson_id:
    //                     selectedLesson.lesson_id
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             }
    //         );

    //         toggleLessonCompletion(
    //             selectedLesson.lesson_id
    //         );

    //     } catch (error) {

    //         console.log(
    //             "Resource completion error:",
    //             error
    //         );
    //     }
    // };

    /*  */
    const handleResourceComplete = async () => {
        const completed = await toggleLessonCompletion(
            selectedLesson.lesson_id
        );

        if (completed && nextLesson) {
            onLessonSelect(nextLesson);
        }
    };

    /* Timer for resource lesson completion */
    useEffect(() => {

        if (
            selectedLesson?.lesson_content_type !==
            "text"
        ) {
            return;
        }

        if (
            completedLessons[
            selectedLesson.lesson_id
            ]
        ) {
            return;
        }

        const timer = setTimeout(() => {

            handleResourceComplete();

        }, 30000);

        return () => clearTimeout(timer);

    }, [selectedLesson?.lesson_id]);

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

    /* FORMATTING SIZE FO FILE */
    const formatFileSize = (bytes) => {

        if (!bytes) return "";

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const isYoutubeVideo = (url) => {
        return (
            url?.includes("youtube.com") ||
            url?.includes("youtu.be")
        );
    };

    const getYoutubeEmbedUrl = (url) => {
        const videoId = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
        )?.[1];

        return videoId
            ? `https://www.youtube.com/embed/${videoId}`
            : "";
    };

    /* Reset the state when changing the lesson */
    // useEffect(() => {
    //     setIsPlaying(false);
    //     setPreviewingContentId(null);
    // }, [selectedLesson?.lesson_id]);

    useEffect(() => {
        setIsPlaying(false);
        setPreviewingContentId(null);

        // Resources tab is available only for video lessons.
        // If the selected lesson is not a video, return to Overview.
        if (selectedLesson?.lesson_content_type !== "video") {
            setActiveTab("overview");
        }
    }, [selectedLesson?.lesson_id, selectedLesson?.lesson_content_type]);


    useEffect(() => {

        const fetchLessonContents = async () => {

            if (
                !selectedLesson ||
                selectedLesson.lesson_content_type !== "video"
            ) {
                setLessonContents([]);
                return;
            }

            try {

                setLoadingContents(true);

                const token =
                    sessionStorage.getItem("token");

                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/lessons-contents/${selectedLesson.lesson_id}/contents`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                // console.log("lesson content", res.data);

                setLessonContents(
                    res.data.contents || []
                );

            } catch (error) {

                console.error(
                    "Failed to fetch lesson contents",
                    error
                );

                setLessonContents([]);

            } finally {

                setLoadingContents(false);

            }
        };

        fetchLessonContents();

    }, [selectedLesson?.lesson_id]);

    /* Video toggle function */
    // const togglePlayPause = () => {

    //     if (!videoRef.current) return;

    //     if (videoRef.current.paused) {
    //         videoRef.current.play();
    //     } else {
    //         videoRef.current.pause();
    //     }

    //     setShowCenterControl(true);

    //     setTimeout(() => {
    //         setShowCenterControl(false);
    //     }, 1200);
    // };

    const togglePlayPause = () => {
        // console.log("Clicked");

        const video = videoRef.current;

        if (!video) {
            // console.log("no video ref");
            return;

        }
        // console.log("paused:", video.paused);


        // if (video.paused) {
        //     video.play();
        //     setLastAction("play");
        // } else {
        //     video.pause();
        //     setLastAction("pause");
        // }

        if (video.paused) {
            // console.log(video.readyState);
            video.play()
                .then(() => {
                    // console.log("PLAY SUCCESS");
                    setLastAction("play");
                })
                .catch((err) => {
                    console.error("PLAY FAILED", err);
                });
        } else {
            video.pause();
            setLastAction("pause");
        }

        setShowCenterControl(true);

        setTimeout(() => {
            setShowCenterControl(false);
        }, 1000);
    };
    /* Click on video = play/pause, double click = fullscreen */
    const clickTimerRef = useRef(null);

    const handleVideoClick = (e) => {
        if (!videoRef.current) return;

        // Ignore clicks on the native control bar (bottom ~60px) so its own buttons work normally
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.bottom - e.clientY < 60) return;

        // Wait briefly: a second click means double-click (fullscreen), not play/pause
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = setTimeout(togglePlayPause, 250);
    };

    const handleVideoDoubleClick = (e) => {
        // Cancel the pending single-click play/pause
        clearTimeout(clickTimerRef.current);

        // Don't go fullscreen when double-clicking the control bar
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.bottom - e.clientY < 60) return;

        toggleVideoFullscreen();
    };

    const getDownloadUrl = (url) => {
        return url.replace("/upload/", "/upload/fl_attachment/");
    };

    const getContentIcon = (type) => {

        switch (type) {

            case "pdf":
            case "document":
                return <FiFileText className="text-lg" />;

            case "image":
                return <FiImage className="text-lg" />;

            case "audio":
                return <FiMusic className="text-lg" />;

            default:
                return <FiFolder className="text-lg" />;
        }
    };

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
                return 15 * 60;

            default:
                return Number(lesson.lesson_duration) || 0;
        }
    };

    const getLessonDuration = (lesson) => {
        if (!lesson) return "--";

        if (lesson.lesson_content_type === "quiz") {
            if (lesson.quiz_duration_minutes) {
                return `${lesson.quiz_duration_minutes} min`;
            }
            if (lesson.lesson_duration) {
                const dur = Number(lesson.lesson_duration);
                return dur > 100 ? formatDuration(dur) : `${dur} min`;
            }
            return "15 min";
        }

        if (lesson.lesson_content_type === "text") {
            return "5 min"; // Hardcoded 5 min for files
        }

        return formatDuration(lesson.lesson_duration);
    };

    return (
        //{/* was: no bottom padding on the scroll container — last tab-content card (e.g. Target Goal) sat flush against the bottom edge on phone, getting visually cut close by browser chrome with no breathing room below it. Added pb-20 on phone only; sm: reverts to the original (no extra bottom padding), matching desktop/tablet exactly as before. */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto min-w-0 pb-20 sm:pb-0">
            {/* Video Player Frame */}
            <div className="p-4 lg:p-6 pb-2">

                {/* was: "text" (resource/PDF) type forced a fixed h-[650px] lg:h-[750px] on this wrapper regardless of how tall the actual rendered content ended up. ResourceLesson.jsx renders its PDF canvas at whatever height the page's own aspect ratio produces once fit to the container's width — on portrait phones that's frequently shorter than 650px, so the leftover space in the fixed-height box showed as a large blank gap below the pagination controls. Switched "text" to max-h-[80vh] with overflow-y-auto instead: the box now shrinks to fit short content (no gap) while still capping and scrolling if a PDF page ever renders taller than 80% of the viewport. items-start added so short content sits at the top of the box rather than being vertically centered inside leftover space. */}
                <div
                    ref={videoPlayerContainerRef}
                    className={`group relative w-full overflow-hidden flex justify-center ${selectedLesson?.lesson_content_type === "text"
                        ? "max-h-[80vh] overflow-y-auto items-start bg-slate-900 shadow-2xl border border-slate-700 text-white rounded-2xl"
                        : selectedLesson?.lesson_content_type === "quiz"
                            ? "bg-white border border-slate-200 shadow-sm text-slate-900 rounded-2xl"
                            : isVideoFullscreen
                                ? "w-full h-full bg-black items-center text-white"
                                : "bg-black aspect-video max-h-[500px] items-center shadow-2xl border border-slate-700 text-white rounded-2xl"
                        }`}
                >

                    {selectedLesson ? (
                        <>
                            {/* Floating Overlay Counter & Fullscreen button (only for videos) */}
                            {selectedLesson.lesson_content_type !== "text" && selectedLesson.lesson_content_type !== "quiz" && (
                                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                                    <div className="bg-slate-900/80 backdrop-blur-md opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-200 border border-white/10 transition">
                                        Lesson {currentIndex + 1} of {allLessons.length}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggleVideoFullscreen}
                                        className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md"
                                        title={isVideoFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen"}
                                    >
                                        {isVideoFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
                                    </button>
                                </div>
                            )}

                            {/* Previous Button (only for videos) */}
                            {previousLesson && selectedLesson.lesson_content_type !== "text" && selectedLesson.lesson_content_type !== "quiz" && (
                                <button
                                    onClick={() => onLessonSelect(previousLesson)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 w-11 h-11 rounded-full bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-purple-700 transition cursor-pointer border border-white/10 shadow-lg"
                                    title="Previous Lesson"
                                >
                                    <FiChevronLeft size={24} />
                                </button>
                            )}

                            {/* Next Button (only for videos) */}
                            {nextLesson && selectedLesson.lesson_content_type !== "text" && selectedLesson.lesson_content_type !== "quiz" && (
                                <button
                                    onClick={() => {
                                        if (
                                            completedLessons[
                                            selectedLesson.lesson_id
                                            ]
                                        ) {
                                            onLessonSelect(nextLesson);
                                        }
                                    }}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 z-20
                                        w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center
                                        border border-white/10 shadow-lg transition
                                        ${completedLessons[selectedLesson.lesson_id]
                                            ? "opacity-100 group-hover:opacity-100 cursor-pointer bg-slate-900/80 hover:bg-purple-700"
                                            : "opacity-40 cursor-not-allowed bg-slate-900/40"
                                        }`}
                                    title="Next Lesson"
                                >
                                    <FiChevronRight size={24} />
                                </button>
                            )}

                            {/* Lesson Content */}
                            {selectedLesson.lesson_content_type === "text" ? (

                                <ResourceLesson
                                    resourceData={resourceData}
                                    lessonId={selectedLesson?.lesson_id}
                                    onComplete={handleResourceComplete}
                                />

                            ) : selectedLesson.lesson_content_type === "quiz" ? (

                                <QuizPlayer
                                    lessonId={selectedLesson?.lesson_id}
                                    training={training}
                                    onLessonSelect={onLessonSelect}
                                    nextLesson={nextLesson}
                                    onComplete={() => toggleLessonCompletion?.(selectedLesson.lesson_id)}
                                    isCompleted={isCompleted}
                                />

                            ) : selectedLesson.lesson_video_url ? (

                                isYoutubeVideo(
                                    selectedLesson.lesson_video_url
                                ) ? (
                                    <iframe
                                        key={selectedLesson.lesson_id}
                                        src={getYoutubeEmbedUrl(
                                            selectedLesson.lesson_video_url
                                        )}
                                        title={selectedLesson.lesson_title}
                                        onContextMenu={(e) => e.preventDefault()}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            key={selectedLesson.lesson_id}
                                            src={selectedLesson.lesson_video_url}
                                            controls
                                            // was: controlsList="nofullscreen" — added nodownload to hide the Download option in the ⋮ menu
                                            disablePictureInPicture
                                            controlsList="nofullscreen nodownload"
                                            onContextMenu={(e) => e.preventDefault()}
                                            onClick={handleVideoClick}
                                            onDoubleClick={handleVideoDoubleClick}

                                            onTimeUpdate={handleTimeUpdate}
                                            onEnded={handleVideoEnded}

                                            onPlay={() => {
                                                setIsPlaying(true);
                                                setLastAction("play");
                                                setShowCenterControl(true);

                                                setTimeout(() => {
                                                    setShowCenterControl(false);
                                                }, 1000);
                                            }}

                                            onPause={() => {
                                                setIsPlaying(false);
                                                setLastAction("pause");
                                                setShowCenterControl(true);

                                                setTimeout(() => {
                                                    setShowCenterControl(false);
                                                }, 1000);
                                            }}
                                            playsInline
                                            // className="w-full h-full object-contain"

                                            // className={`w-full transition-all duration-200  ${isBlur ? "blur-xl" : "blur-none"
                                            //     }`}

                                            className={`absolute inset-0 w-full h-full object-contain block ${
        isBlur ? "blur-xl" : "blur-none"
    }`}

                                        />

                                        {isBlur && (
                                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 text-white text-center p-6">
                                                <div>
                                                    <FiLock size={36} className="mx-auto mb-4 text-red-400" />

                                                    <h3 className="text-lg font-bold mb-2">
                                                        Video Temporarily Hidden
                                                    </h3>

                                                    <p className="text-sm text-slate-300">
                                                        Video playback has been paused because the browser window lost focus.
                                                    </p>

                                                    <p className="text-xs text-slate-400 mt-2">
                                                        Return to the learning window to continue.
                                                    </p>
                                                </div>
                                            </div>
                                        )}


                                        {/* {isPlaying ? (
                                            <button
                                                onClick={togglePlayPause}
                                                // className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30
                                                         w-24 h-24 rounded-full bg-black backdrop-blur-sm text-white flex items-center justify-center
                                                         opacity-0 group-hover:opacity-100
            transition
            cursor-pointer
        "
                                            // className="absolute inset-0 z-30 flex items-center justify-center transition-opacity cursor-pointer"
                                            >
                                                <div
                                                    className="w-24 h-24 rounded-full bg-black backdrop-blur-sm text-white flex items-center justify-center transition duration-300"
                                                >
                                                    <FiPlay size={50} />
                                                </div>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={togglePlayPause}
                                                // className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-300"
                                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30
                                                         w-24 h-24 rounded-full bg-black backdrop-blur-sm text-white flex items-center justify-center
                                                         opacity-0 group-hover:opacity-100
        "
                                            // className="absolute inset-0 z-30 flex items-center justify-center transition-opacity cursor-pointer duration-300"
                                            >
                                                <div
                                                    className="w-24 h-24 rounded-full bg-black backdrop-blur-sm text-white flex items-center justify-center transition duration-300"
                                                >
                                                    <FiPause size={50} />
                                                </div>
                                            </button>
                                        )} */}


                                        {showCenterControl && (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                                            >
                                                <div
                                                    className="w-24 h-24 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center animate-pulse"
                                                >
                                                    {lastAction === "play" ? (
                                                        <FiPlay size={42} />
                                                    ) : (
                                                        <FiPause size={42} />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )

                            ) : (
                                <div className="text-center p-8">
                                    <FiVideo className="text-4xl text-slate-600 mx-auto mb-2" />
                                    <h3 className="text-lg font-semibold text-slate-300">
                                        No Video Stream Available
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        This lesson contains text or reading materials below.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center p-8">
                            {/* was: single static message "Select a lesson from the curriculum to begin" shown whenever selectedLesson is null — misleading for a course with zero lessons, since there's nothing to select. Now branches on allLessons.length to show a distinct empty-course message, matching the phrasing already used in CourseCurriculum.jsx ("No lessons added to this module yet.") for consistency. */}
                            <h3 className="text-xl font-semibold text-slate-400">
                                {allLessons.length === 0
                                    ? "No lessons added to this course yet"
                                    : "Select a lesson from the curriculum to begin"}
                            </h3>
                            {allLessons.length === 0 && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Check back later — course content is still being prepared.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lesson Title & Controls Bar */}
            <div className="px-4 lg:px-6 py-4 bg-white border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md bg-[#35175a]/10 text-[#35175a] border border-[#35175a]/20">
                                Current Lesson
                            </span>
                            {/* waS: text-xs */}
                            <span className="text-[12px] text-slate-400 flex items-center gap-1">
                                {/* was: text-xs */}
                                <FiClock className="text-[12px]" />
                                {/* {formatDuration(selectedLesson?.lesson_duration)} */}
                                {getLessonDuration(selectedLesson)}
                            </span>
                        </div>

                        <h2 className="mt-1.5 text-2xl font-bold text-slate-900 tracking-tight">
                            {/* was: {selectedLesson?.lesson_title || "No lesson selected"} — same misleading fallback as the empty-state message below; now distinguishes a genuinely empty course from just not having clicked a lesson yet. */}
                            {selectedLesson?.lesson_title ||
                                (allLessons.length === 0
                                    ? "No lessons added yet"
                                    : "No lesson selected")}
                        </h2>
                    </div>

                    {/* Mark as Completed Button */}
                    {selectedLesson && toggleLessonCompletion && (
                        <button
                            onClick={() => toggleLessonCompletion(selectedLesson.lesson_id)}
                            className={`flex items-center self-start gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer shrink-0 border ${isCompleted
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-[#35175a] hover:bg-[#271042] text-white border-[#35175a] shadow-md"}`}
                        >
                            <FiCheckCircle
                                className={`text-lg ${isCompleted
                                    ? "text-emerald-600"
                                    : "text-white"
                                    }`}
                            />

                            <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Tabs Navigation */}
            {/* was: this div rendered unconditionally, even when selectedLesson is null — the Overview tab's Lesson Summary card fell back to hardcoded placeholder text unrelated to the actual course. Gated behind selectedLesson so an empty course shows no tab section at all, just the empty-state message above. */}
            {selectedLesson && (
                <div className="px-4 lg:px-6 pt-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button
                            onClick={() => setActiveTab("overview")}
                            // was: text-xs
                            className={`flex items-center gap-2 shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "overview"
                                ? "bg-[#35175a]/10 text-[#35175a] border border-[#35175a]/20"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                        >
                            <FiFileText /> Overview
                        </button>

                        {/* was: selectedLesson.lesson_content_type === "video" — unguarded read crashed the whole tree with a white screen when selectedLesson is null (e.g. a course with zero lessons, so nothing gets auto-selected). Added optional chaining to match every other selectedLesson read in this file. */}
                        {selectedLesson?.lesson_content_type === "video" && (

                            <button
                                onClick={() => setActiveTab("resources")}
                                className={`flex items-center gap-2 shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "resources"
                                    ? "bg-[#35175a]/10 text-[#35175a] border border-[#35175a]/20"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    }`}
                            >
                                <FiFolder className="shrink-0" />
                                Resources & Attachments
                            </button>
                        )}

                        {/*

                    <button
                        onClick={() => setActiveTab("notes")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${activeTab === "notes"
                            ? "bg-[#35175a]/10 text-[#35175a] border border-[#35175a]/20"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                    >
                        <FiEdit3 /> My Notes
                    </button>
                    */}
                    </div>

                    {/* Tab Content Display */}
                    <div className="py-4 flex-1">
                        {activeTab === "overview" && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                    {/* was: text-sm */}
                                    <h3 className="text-[16px] font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        <FiBookOpen className="text-purple-600" /> Lesson Summary
                                    </h3>
                                    {/* was: text-xs */}
                                    <p className="text-[13px] text-slate-700 leading-relaxed">
                                        {selectedLesson?.lesson_description ||
                                            `In this lesson "${selectedLesson?.lesson_title || ' Engineering Fundamentals'}", you will learn essential concepts to build a strong foundation in  engineering. Explore practical examples, understand key technical concepts, and strengthen your skills through hands-on exercises and real-world applications.`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 shadow-sm">
                                        <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#35175a] mb-1">
                                            training platform Tip 💡
                                        </h4>
                                        <p className="text-[13px] text-purple-700/70">
                                           Explore our Construction & Engineering courses to develop technical expertise, enhance practical skills, and gain industry-relevant knowledge. Learn building construction, civil engineering, architectural design, structural engineering, site management, and construction technologies through structured training programs!
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-pink-50 border border-pink-100 shadow-sm">
                                        <h4 className="text-[14px] font-bold uppercase tracking-wider text-pink-700 mb-1">
                                            Target Goal
                                        </h4>
                                        <p className="text-[13px] text-pink-700/70">
                                            Complete the lesson quiz and practice exercises in your workbook after finishing the video.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedLesson?.lesson_content_type === "video" && activeTab === "resources" && (
                            <div className="space-y-3">

                                {loadingContents ? (

                                    <div className="text-center py-8 text-slate-500">
                                        Loading resources...
                                    </div>

                                ) : lessonContents.length > 0 ? (

                                    lessonContents.map((content) => {
                                        const isExpanded = previewingContentId === content.content_id;
                                        return (
                                            <div key={content.content_id} className="space-y-2">
                                                <div
                                                    onClick={() => content.content_url && setPreviewingContentId(prev => prev === content.content_id ? null : content.content_id)}
                                                    className={`p-3.5 rounded-xl border shadow-sm flex items-center justify-between transition cursor-pointer group ${isExpanded
                                                        ? "bg-purple-50/80 border-[#35175a] ring-2 ring-[#35175a]/20 shadow-md"
                                                        : "bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50/80"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div
                                                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${isExpanded
                                                                ? "bg-[#35175a] text-white shadow-sm"
                                                                : "bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/20"
                                                                }`}
                                                        >
                                                            {getContentIcon(content.content_type)}
                                                        </div>

                                                        <div className="min-w-0">
                                                            {/* was: text-xs */}
                                                            <h4 className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[#35175a]">
                                                                {content.content_title}
                                                            </h4>

                                                            {/* was: text-[11px] */}
                                                            <p className="text-[12px] text-slate-500 mt-0.5">
                                                                {content.content_type.toUpperCase()} • {formatFileSize(content.content_size)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        {content.content_url && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewingContentId(prev => prev === content.content_id ? null : content.content_id)}
                                                                className={`text-xs font-semibold transition cursor-pointer ${isExpanded
                                                                    ? "text-[#35175a]"
                                                                    : "text-slate-500 hover:text-[#35175a]"
                                                                    }`}
                                                                title={isExpanded ? "Close" : "View"}

                                                            >
                                                                {/* {isExpanded ? "Close" : "View"} */}
                                                                {isExpanded
                                                                    ? <X size={13} />
                                                                    : <FiEye size={13} />}
                                                            </button>
                                                        )}

                                                        {Boolean(content.content_allow_download === 1 || content.content_allow_download === true || content.content_allow_download === "1" || content.content_allow_download === "true") ? (
                                                            <a
                                                                href={content.download_url || content.content_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                                                                title="Download file"
                                                            >
                                                                <FiDownload className="text-sm" />
                                                            </a>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled
                                                                className="p-1.5 rounded-lg bg-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                                                title="Download disabled by instructor"
                                                            >
                                                                <FiDownload className="text-sm" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Inline Media Viewer directly below the card */}
                                                {isExpanded && content.content_url && (
                                                    <InlineMediaViewer
                                                        content={{
                                                            ...content,
                                                            title: content.content_title,
                                                            type: content.content_type
                                                        }}
                                                        onClose={() => setPreviewingContentId(null)}
                                                        themeColor="#35175a"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })

                                ) : (

                                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">

                                        <FiFolder className="mx-auto text-3xl text-slate-400 mb-2" />

                                        <h3 className="text-sm font-medium text-slate-700">
                                            No Resources Available
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            This lesson does not contain any attachments.
                                        </p>

                                    </div>

                                )}

                            </div>
                        )}

                        {activeTab === "notes" && (
                            <div className="space-y-2">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Type your timestamped personal study notes here... (e.g., @02:15 Remember stroke order for あ)"
                                    className="w-full h-32 p-3.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500/60 resize-none"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => alert("Note saved successfully!")}
                                        className="px-3.5 py-1.5 rounded-lg bg-[#35175a] hover:bg-[#35175a] text-white text-xs font-medium transition cursor-pointer"
                                    >
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPlayer;

