import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import { socket } from "../../services/notificationSocket"; // adjust path if needed
import notificationSound from "../../assets/sounds/Notification.mp3"; // adjust path
import { Bell } from "lucide-react";

const StudentNotificationBell = ({ variant = "navbar" }) => {
    const isLearningMode = variant === "learning";

    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const notificationRef = useRef(null);
    const notificationSoundRef = useRef(null);

    /*
     * -----------------------------------------
     * Notification sound setup
     * -----------------------------------------
     */
    useEffect(() => {

        const audio = new Audio(notificationSound);

        audio.volume = 0.7;
        audio.preload = "auto";

        notificationSoundRef.current = audio;

        const unlockAudio = () => {

            const audio = notificationSoundRef.current;

            if (!audio) return;

            audio.muted = true;

            audio
                .play()
                .then(() => {

                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = false;

                    console.log("🔊 Notification sound unlocked");

                })
                .catch((error) => {

                    console.log("Audio unlock failed:", error);

                });

            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("touchstart", unlockAudio);
            document.removeEventListener("keydown", unlockAudio);

        };

        document.addEventListener("click", unlockAudio);
        document.addEventListener("touchstart", unlockAudio);
        document.addEventListener("keydown", unlockAudio);

        return () => {

            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("touchstart", unlockAudio);
            document.removeEventListener("keydown", unlockAudio);

            if (notificationSoundRef.current) {
                notificationSoundRef.current.pause();
                notificationSoundRef.current = null;
            }

        };

    }, []);


    /*
     * -----------------------------------------
     * Fetch existing notifications
     * -----------------------------------------
     */

    useEffect(() => {
        // if (!showNotifications) return;

        const fetchNotifications = async () => {

            try {

                const token = sessionStorage.getItem("token");

                if (!token) return;

                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/notifications`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setNotifications(
                    res.data.notifications || []
                );

            } catch (error) {

                console.error(
                    "Failed to fetch notifications:",
                    error
                );

            }

        };

        fetchNotifications();

        // }, [showNotifications]);
    }, []);


    /*
     * -----------------------------------------
     * Socket notification listener
     * -----------------------------------------
     */

    const formatSessionTime = (date) => {

        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    useEffect(() => {

        const user = JSON.parse(
            sessionStorage.getItem("user")
        );

        if (!user?.user_id) return;

        // Join student's personal notification room
        socket.emit(
            "join-user-room",
            user.user_id
        );


        const handleNotification = (notification) => {

            console.log(
                "🔔 New notification received:",
                notification
            );


            // Prevent duplicates
            setNotifications((prev) => {

                const exists = prev.some(
                    (item) =>
                        item.notification_id ===
                        notification.notification_id
                );

                if (exists) {
                    return prev;
                }

                return [
                    notification,
                    ...prev
                ];

            });


            // Play ringtone
            if (notificationSoundRef.current) {

                const audio =
                    notificationSoundRef.current;

                audio.currentTime = 0;

                audio.play().catch((error) => {

                    console.log(
                        "Notification sound could not play:",
                        error
                    );

                });

            }


            // Toast
            toast(
                <div className="w-full">

                    <div className="mb-2 flex items-center justify-between">

                        <p className="text-sm font-semibold tracking-tight text-gray-300">
                            {notification.title || "New Notification"}
                        </p>

                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                            Just now
                        </span>

                    </div>

                    {/* <p className="text-[13px] leading-5 text-gray-400">
                        {notification.message ||
                            "You have a new notification"}
                    </p> */}

                    {/* <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                        {notification.lesson_title
                            ? `${notification.lesson_title} • ${formatSessionTime(
                                notification.session_start_time
                            )}`
                            : notification.message}
                    </p> */}

                    <p className="mt-1 text-xs text-gray-400 line-clamp-2">
                        {/* {notification.lesson_title
                            ? notification.notification_type === "LIVE_SESSION_DELETED"
                                ? notification.lesson_title
                                : `${notification.lesson_title} • ${formatSessionTime(
                                    notification.session_start_time
                                )}`
                            : notification.message} */}

                            {notification.message}
                    </p>

                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,

                    className:
                        "!w-full sm:!w-[380px] !rounded-2xl !border !border-gray-200/70 !bg-gray-900 !p-4 sm:!p-6 !shadow-[0_12px_35px_rgba(0,0,0,0.10)]",

                    bodyClassName:
                        "!m-0 !p-0",
                }
            );

        };


        socket.on(
            "notification:new",
            handleNotification
        );


        return () => {

            socket.off(
                "notification:new",
                handleNotification
            );

        };

    }, []);


    /*
     * -----------------------------------------
     * Close dropdown when clicking outside
     * -----------------------------------------
     */
    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {

                setShowNotifications(false);

            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    /*
     * -----------------------------------------
     * Mark notification as read
     * -----------------------------------------
     */
    const handleNotificationClick = async (notification) => {

        try {

            const token =
                sessionStorage.getItem("token");

            if (
                Number(notification.is_read) === 0
            ) {

                await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notification.notification_id}/read`,
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                setNotifications((prev) =>
                    prev.map((item) =>
                        item.notification_id ===
                            notification.notification_id
                            ? {
                                ...item,
                                is_read: 1
                            }
                            : item
                    )
                );

            }

            setShowNotifications(false);

        } catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

        }

    };


    const unreadCount =
        notifications.filter(
            (notification) =>
                Number(notification.is_read) === 0
        ).length;

    /* FORMAT TIME */
    const formatNotificationTime = (date) => {

        if (!date) return "";

        const notificationDate = new Date(date);
        const now = new Date();

        const diffMs = now - notificationDate;

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
            return "Just now";
        }

        if (diffMinutes < 60) {
            return `${diffMinutes} min ago`;
        }

        if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        }

        if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        }

        // return notificationDate.toLocaleDateString();
        const day = String(notificationDate.getDate()).padStart(2, '0');
        const month = String(notificationDate.getMonth() + 1).padStart(2, '0');
        const year = notificationDate.getFullYear();
        return `${day}/${month}/${year}`;

    };

    return (

        <div
            ref={notificationRef}
            className="relative"
        >

            <button
                type="button"
                onClick={() =>
                    setShowNotifications(
                        (prev) => !prev
                    )
                }
                // className="relative p-2 rounded-full text-gray-700 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer ${isLearningMode
                    ? "text-purple-300 hover:text-purple-400 hover:bg-purple-400/20"
                    : "text-gray-700 hover:text-red-500 hover:bg-red-50"
                    }`}
                aria-label="Notifications"
                title="Notification"
            >

                <Bell
                    size={22}
                // strokeWidth={1.8}
                />

                {unreadCount > 0 && (

                    <span
                        className={`absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-white
                                text-[9px] font-bold flex items-center justify-center ${isLearningMode
                                ? "bg-purple-500 border-2 border-[#120F1D]"
                                : "bg-red-500 border-2 border-white"
                            }`}
                    >
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>

                )}

            </button>


            {showNotifications && (

                <div
                    className={`fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-12 w-auto sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-xl shadow-xl z-[100] overflow-hidden ${isLearningMode
                        ? "bg-white border border-purple-500/20 border-2 shadow-sm"
                        : "bg-white border border-gray-200"
                        }`}
                >


                    <div
                        className={`px-4 py-3 border-b flex items-center justify-between ${isLearningMode
                            ? "border-slate-400/30"
                            : "border-gray-200"
                            }`}
                    >



                        <h3
                            className={`font-semibold ${isLearningMode
                                ? "text-slate-900"
                                : "text-gray-800"
                                }`}
                        >
                            Notifications
                        </h3>



                        <span
                            className={`text-xs font-medium ${isLearningMode
                                ? "text-purple-600"
                                : "text-red-600"
                                }`}
                        >
                            {unreadCount} New
                        </span>

                    </div>


                    <div className="max-h-80 overflow-y-auto">

                        {notifications.length === 0 ? (

                            <div className="py-10 text-center text-sm text-gray-500">
                                No notifications yet.
                            </div>

                        ) : (

                            notifications.map((notification) => (

                                <div
                                    key={notification.notification_id}
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }


                                    className={`px-4 py-3 border-b cursor-pointer transition-colors 
                                        ${isLearningMode
                                            ? "border-slate-400/30 hover:bg-purple-400/5"
                                            : "border-gray-100 hover:bg-red-50"
                                        } ${Number(notification.is_read) === 0
                                            ? isLearningMode
                                                ? "bg-purple-400/10"
                                                : "bg-red-50/40"
                                            : ""
                                        }`}
                                >



                                    <div className="flex gap-3">

                                        <div
                                            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${isLearningMode
                                                ? "bg-purple-500/20"
                                                : "bg-red-50"
                                                }`}
                                        >
                                            <FiBell
                                                size={16}
                                                className={
                                                    isLearningMode
                                                        ? "text-purple-500"
                                                        : "text-red-600"
                                                }
                                            />
                                        </div>


                                        <div className="flex-1 min-w-0">

                                            <div className="flex items-start justify-between gap-2">

                                                <p
                                                    className={`text-sm ${Number(notification.is_read) === 0
                                                        ? isLearningMode
                                                            ? "font-semibold text-slate-900"
                                                            : "font-semibold text-gray-900"
                                                        : isLearningMode
                                                            ? "font-medium text-slate-700"
                                                            : "font-medium text-gray-700"
                                                        }`
                                                    }
                                                >
                                                    {notification.title}
                                                </p>

                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    {formatNotificationTime(notification.created_at)}
                                                </span>

                                            </div>

                                            {/* <p
                                                className={`text-xs font-medium mt-1 truncate ${isLearningMode
                                                    ? "text-slate-600"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                {notification.lesson_title}
                                            </p>

                                            <p
                                                className={`text-[11px] mt-0.5 ${isLearningMode
                                                    ? "text-slate-500"
                                                    : "text-gray-500"
                                                    }`}
                                            >
                                                {notification.training_title}
                                            </p> */}

                                            {notification.notification_type === "ENROLLMENT_APPROVED" ||
                                                notification.notification_type === "ENROLLMENT_REJECTED" ? (

                                                <p
                                                    className={`text-xs mt-1 leading-5 ${isLearningMode
                                                            ? "text-slate-600"
                                                            : "text-gray-600"
                                                        }`}
                                                >
                                                    {notification.message}
                                                </p>

                                            ) : (

                                                <>
                                                    {notification.lesson_title && (
                                                        <p
                                                            className={`text-xs font-medium mt-1 truncate ${isLearningMode
                                                                    ? "text-slate-600"
                                                                    : "text-gray-700"
                                                                }`}
                                                        >
                                                            {notification.lesson_title}
                                                        </p>
                                                    )}

                                                    {notification.training_title && (
                                                        <p
                                                            className={`text-[11px] mt-0.5 ${isLearningMode
                                                                    ? "text-slate-500"
                                                                    : "text-gray-500"
                                                                }`}
                                                        >
                                                            {notification.training_title}
                                                        </p>
                                                    )}
                                                </>

                                            )}

                                            {notification.notification_type !== "LIVE_SESSION_DELETED" && (
                                                <p
                                                    className={`text-[11px] mt-1 ${isLearningMode
                                                        ? "text-slate-500"
                                                        : "text-gray-400"
                                                        }`}
                                                >
                                                    {notification.session_start_time
                                                        ? new Date(notification.session_start_time).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )
                                                        : null}
                                                </p>
                                            )}


                                        </div>


                                        {Number(notification.is_read) === 0 && (
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isLearningMode
                                                    ? "bg-purple-500"
                                                    : "bg-red-500"
                                                    }`}
                                            />
                                        )}

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            )}

        </div>

    );

};

export default StudentNotificationBell;