import React, { useEffect, useRef, useState } from "react";
import InstructorSidebar from "./InstructorSidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../utils/auth";
import {
    UserCircle,
    ChevronDown,
    Bell,
    Menu,
} from "lucide-react";
import axios from "axios";
import { socket } from "../../services/notificationSocket";

import notificationSound from "../../assets/sounds/Notification.mp3";
import { toast } from "react-toastify";

const InstructorLayout = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const user = getCurrentUser();

    // const [showNotifications, setShowNotifications] = useState(false);
    // New: phone/tablet drawer state for InstructorSidebar, mirroring AdminSidebar's
    // isOpen/onClose pattern. Has no effect at md: and up, where the sidebar is
    // always visible in normal flow regardless of this value.
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isOnProfile = location.pathname === "/instructor/profile";

    // const lastPageRef = useRef("/instructor/dashboard");
    const notificationRef = useRef(null);

    // Notification states
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const notificationSoundRef = useRef(null);

    const [showProfileMessage, setShowProfileMessage] = useState(false);



    // DUMMY NOTIFICATIONS FOR NOW
    // const dummyNotifications = [
    //     {
    //         id: 1,
    //         title: "New Course Assigned",
    //         message:
    //             "You have been assigned a new course: Japanese Language N3.",
    //         time: "5 min ago",
    //         type: "course_assigned"
    //     },
    //     {
    //         id: 2,
    //         title: "New Course Assigned",
    //         message:
    //             "You have been assigned a new course: Japanese Language N4.",
    //         time: "20 min ago",
    //         type: "course_assigned"
    //     },
    //     {
    //         id: 3,
    //         title: "New Course Assigned",
    //         message:
    //             "You have been assigned a new course: Japanese Language N5 Weekend Batch.",
    //         time: "1 hour ago",
    //         type: "course_assigned"
    //     }
    // ];

    // --------------------------------------------------
    // REMEMBER LAST PAGE WHEN NOT ON PROFILE
    // --------------------------------------------------

    // useEffect(() => {

    //     if (!isOnProfile) {
    //         lastPageRef.current = location.pathname;
    //     }

    // }, [location.pathname, isOnProfile]);

    // --------------------------------------------------
    // PREVENT BACK BUTTON
    // --------------------------------------------------

    useEffect(() => {

        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {

            navigate("/", {
                replace: true
            });

        };

        window.addEventListener("popstate", handlePopState);

        return () => {

            window.removeEventListener(
                "popstate",
                handlePopState
            );

        };

    }, [navigate]);

    // --------------------------------------------------
    // CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
    // --------------------------------------------------

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

    /* Fetch Notifications */
    const fetchNotifications = async () => {

        try {

            setLoadingNotifications(true);

            const token =
                sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setNotifications(
                    response.data.notifications || []
                );

            }

        } catch (error) {

            console.error(
                "Failed to fetch notifications:",
                error
            );

        } finally {

            setLoadingNotifications(false);

        }
    };

    useEffect(() => {

        if (!user?.user_id) return;

        fetchNotifications();

    }, [user?.user_id]);

    /* NOTIFICATION SOUND INTIALIZATION */
    useEffect(() => {

        const audio =
            new Audio(notificationSound);

        audio.volume = 0.7;
        audio.preload = "auto";

        notificationSoundRef.current =
            audio;


        const unlockAudio = () => {

            if (!notificationSoundRef.current) {
                return;
            }

            const audio =
                notificationSoundRef.current;

            audio.muted = true;

            audio.play()
                .then(() => {

                    audio.pause();

                    audio.currentTime = 0;

                    audio.muted = false;

                    console.log(
                        "🔊 Notification sound unlocked"
                    );

                })
                .catch((error) => {

                    console.log(
                        "Audio unlock failed:",
                        error
                    );

                });

            document.removeEventListener(
                "click",
                unlockAudio
            );

            document.removeEventListener(
                "touchstart",
                unlockAudio
            );

            document.removeEventListener(
                "keydown",
                unlockAudio
            );

        };


        document.addEventListener(
            "click",
            unlockAudio
        );

        document.addEventListener(
            "touchstart",
            unlockAudio
        );

        document.addEventListener(
            "keydown",
            unlockAudio
        );


        return () => {

            document.removeEventListener(
                "click",
                unlockAudio
            );

            document.removeEventListener(
                "touchstart",
                unlockAudio
            );

            document.removeEventListener(
                "keydown",
                unlockAudio
            );


            if (notificationSoundRef.current) {

                notificationSoundRef.current.pause();

                notificationSoundRef.current = null;

            }

        };

    }, []);


    /* REAL TIME SOCKET NOTIFICATION */
    useEffect(() => {

        const handleNotification = (notification) => {

            console.log(
                "🔔 NEW INSTRUCTOR NOTIFICATION:",
                notification
            );


            setNotifications((prev) => {

                const exists = prev.some(
                    item =>
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


            // 🔊 Sound

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


            // 🍞 Toast

            toast(
                <div className="w-full">

                    <div className="mb-2 flex items-center justify-between">

                        <p className="text-sm font-semibold tracking-tight text-gray-300">
                            {notification.title ||
                                "New Notification"}
                        </p>

                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                            Just now
                        </span>

                    </div>

                    <p className="text-[13px] leading-5 text-gray-400">
                        {notification.message ||
                            "You have a new notification"}
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
                        "!w-[380px] !rounded-2xl !border !border-gray-200/70 !bg-gray-900 !p-6 !shadow-[0_12px_35px_rgba(0,0,0,0.10)]",

                    bodyClassName:
                        "!m-0 !p-0"
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

    /* UNREAD COUNT */
    const unreadCount = notifications.filter(
        notification => Number(notification.is_read) === 0
    ).length;

    console.log("unread count", unreadCount);

    /* FORMAT NOTIFICATION TIME */
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
            return `${diffHours} hour${diffHours > 1 ? "s" : ""
                } ago`;
        }

        if (diffDays < 7) {
            return `${diffDays} day${diffDays > 1 ? "s" : ""
                } ago`;
        }

        // return notificationDate.toLocaleDateString();
        const day = String(notificationDate.getDate()).padStart(2, '0');
        const month = String(notificationDate.getMonth() + 1).padStart(2, '0');
        const year = notificationDate.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // --------------------------------------------------
    // NOTIFICATION CLICK
    // --------------------------------------------------

    // const handleNotificationClick = (notification) => {

    //     setShowNotifications(false);


    //     if (notification.type === "course_assigned") {

    //         navigate("/instructor/my-courses");

    //     }

    // };

    const handleNotificationClick =
        async (notification) => {

            try {

                const token =
                    sessionStorage.getItem("token");


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


            } catch (error) {

                console.error(
                    "Failed to mark notification as read:",
                    error
                );

            }


            setShowNotifications(false);


            if (
                notification.notification_type ===
                "training_assigned"
            ) {

                navigate(
                    "/instructor/my-courses",
                    {
                        state: {
                            highlightedTrainingId: notification.training_id,

                            notificationId:
                                notification.notification_id,

                            // training_id:
                            //     notification.training_id
                        }
                    }
                );

            }

        };

    // --------------------------------------------------
    // PROFILE CLICK
    // --------------------------------------------------

    // const handleProfileClick = () => {

    //     if (isOnProfile) {
    //         navigate(lastPageRef.current);
    //     } else {
    //         navigate("/instructor/profile");
    //     }
    // };

    const handleProfileClick = () => {

        if (isOnProfile) {
            navigate(location.state?.from || "/instructor/dashboard");
        } else {
            navigate("/instructor/profile", {
                state: {
                    from: location.pathname
                }
            });
        }

    };

    return (

        <div className="flex bg-gray-100 min-h-screen">

            <InstructorSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* New: backdrop, phone/tablet only — tap outside the drawer to close it,
                same pattern used for CourseCurriculum's lesson drawer elsewhere in
                this project. No-op / not rendered at md: and up. */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">

                {/* HEADER */}
                {/* was: className="... px-8 py-2 flex justify-end items-center shadow-sm" —
                    justify-end left no room for a menu trigger; switched to
                    justify-between so the new hamburger button (phone/tablet only)
                    can sit on the left while notifications/profile stay pinned right,
                    unchanged, via the same "flex items-center gap-4" wrapper below. */}
                <header className="relative z-30 bg-white border-b border-blue-100 px-4 sm:px-8 py-2 flex items-center shadow-sm">

                    {/* New: hamburger trigger, phone/tablet only — opens the
                        InstructorSidebar drawer. Hidden at md: and up, where the
                        sidebar is already always visible. */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 rounded-full hover:bg-blue-50 text-blue-900"
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="ml-auto flex items-center gap-4">

                        {/* =====================================
                            NOTIFICATIONS
                        ====================================== */}

                        <div
                            ref={notificationRef}
                            className="relative"
                        >


                            <button
                                onClick={() =>
                                    setShowNotifications(
                                        (prev) => !prev
                                    )
                                }
                                className="relative p-2 rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
                                aria-label="Notifications"
                                title="Notification"
                            >

                                <Bell
                                    size={22}
                                    className="text-gray-600"
                                />


                                {/* {dummyNotifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center">
                                        {dummyNotifications.length}
                                    </span>
                                )} */}

                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center">
                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount}
                                    </span>
                                )}

                            </button>


                            {/* =====================================
                                NOTIFICATION DROPDOWN
                            ====================================== */}

                            {showNotifications && (

                                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-12 w-auto sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">


                                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">

                                        <h3 className="font-semibold text-gray-800">
                                            Notifications
                                        </h3>

                                        <span className="text-xs text-blue-900 font-medium">
                                            {/* {dummyNotifications.length} New */}
                                            {/* {notifications.length} New */}
                                            {unreadCount} New
                                        </span>

                                    </div>


                                    <div className="max-h-80 overflow-y-auto">

                                        {/* {dummyNotifications.length === 0 ? (

                                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                                No new notifications
                                            </div>

                                        ) : (

                                            dummyNotifications.map(
                                                (notification) => (

                                                    <div
                                                        key={notification.id}
                                                        onClick={() =>
                                                            handleNotificationClick(
                                                                notification
                                                            )
                                                        }
                                                        className="px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                                                    >

                                                        <div className="flex gap-3">


                                                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">

                                                                <Bell
                                                                    size={17}
                                                                    className="text-blue-900"
                                                                />

                                                            </div>


                                                            <div className="flex-1 min-w-0">

                                                                <p className="text-sm font-semibold text-gray-800">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-gray-600 mt-1 leading-5">
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </p>

                                                                <p className="text-[11px] text-gray-400 mt-1">
                                                                    {
                                                                        notification.time
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </div>

                                                )
                                            )

                                        )} */}

                                        {loadingNotifications ? (

                                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                                Loading notifications...
                                            </div>

                                        ) : notifications.length === 0 ? (

                                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                                No notifications
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
                                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors
                                                        ${Number(notification.is_read) === 0
                                                            ? "bg-blue-50/60"
                                                            : "bg-white"
                                                        }
                                                    `}
                                                >

                                                    <div className="flex gap-3">

                                                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">

                                                            <Bell
                                                                size={17}
                                                                className="text-blue-900"
                                                            />

                                                        </div>


                                                        <div className="flex-1 min-w-0">

                                                            <div className="flex items-center gap-2">

                                                                <p className="text-sm font-semibold text-gray-800">
                                                                    {notification.title}
                                                                </p>

                                                                {Number(
                                                                    notification.is_read
                                                                ) === 1 ? (

                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                                        Read
                                                                    </span>

                                                                ) : (

                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                                                                        Unread
                                                                    </span>

                                                                )}

                                                            </div>


                                                            <p className="text-xs text-gray-600 mt-1 leading-5">
                                                                {notification.message}
                                                            </p>


                                                            <p className="text-[11px] text-gray-400 mt-1">
                                                                {formatNotificationTime(
                                                                    notification.created_at
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            ))

                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                        {/* =====================================
                            PROFILE
                        ====================================== */}

                        <div
                            onClick={handleProfileClick}
                            onMouseEnter={() => setShowProfileMessage(true)}
                            onMouseLeave={() => setShowProfileMessage(false)}
                            className="relative flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors"
                        >

                            <UserCircle
                                size={26}
                                className="text-blue-900"
                            />

                            <span className="font-semibold text-gray-700">
                                {user?.user_full_name ||
                                    user?.username ||
                                    "Instructor"}
                            </span>

                            <ChevronDown
                                size={16}
                                className={`text-gray-500 transition-transform ${isOnProfile
                                    ? "rotate-180"
                                    : ""
                                    }`}
                            />

                            {/* {showProfileMessage && (
                                <div
                                    className="absolute top-full mt-1 right-0 bg-slate-900 shadow-md text-sm text-white p-1 rounded-md w-46 z-50"
                                >
                                    {isOnProfile
                                        ? "Click to close your profile."
                                        : "Click to view your profile."}
                                </div>
                            )} */}

                            {showProfileMessage && (
                                <div
                                    className="absolute top-full mt-1 right-0 shadow-md text-sm p-1 rounded-md w-46 z-50
                                        bg-white text-slate-800 dark:bg-slate-900 dark:text-white"
                                >
                                    {isOnProfile
                                        ? "Click to close your profile."
                                        : "Click to view your profile."}
                                </div>
                            )}

                        </div>

                    </div>

                </header>

                {/* MAIN CONTENT */}

                {/* was: className="flex-1 overflow-auto p-8" — overflow-auto let this element scroll both directions independently. Since <main> persists across route changes (only the Outlet content swaps), any horizontal scroll picked up on one page (e.g. a wide table) stayed applied when navigating to a totally different page like Profile, shifting all its content sideways with no actual overflow of its own. overflow-x-hidden blocks horizontal scroll here entirely (any local wide content should scroll itself, not leak to this container); overflow-y-auto keeps vertical scrolling working as before. */}
                <main id="instructor-main-scroll" className="flex-1 overflow-y-auto overflow-x-hidden p-8">

                    <Outlet />

                </main>

            </div>

        </div>
    );
};

export default InstructorLayout;