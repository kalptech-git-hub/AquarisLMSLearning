import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useEffect, useRef, useState } from "react";
import { UserCircle, ChevronDown, Bell } from "lucide-react";
import { getCurrentUser } from "../../utils/auth";
import { Menu } from "lucide-react";
import { socket } from "../../services/notificationSocket";
import axios from "axios";
import { toast } from "react-toastify";

// import notificationSound from "../../assets/sounds/notification-elegant.mp3";
import notificationSound from "../../assets/sounds/Notification.mp3";

const AdminLayout = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const user = getCurrentUser();

    // const [showNotifications, setShowNotifications] = useState(false); //dummy notification

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Notification
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const notificationSoundRef = useRef(null);

    const [showProfileMessage, setShowProfileMessage] = useState(false);

    const fetchNotifications = async () => {

        try {

            setLoadingNotifications(true);

            const token = sessionStorage.getItem("token");

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

    useEffect(() => {
        const audio = new Audio(notificationSound);
        audio.volume = 0.7;
        audio.preload = "auto";

        notificationSoundRef.current = audio;

        const unlockAudio = () => {
            if (!notificationSoundRef.current) return;

            const audio = notificationSoundRef.current;

            audio.muted = true;

            audio.play()
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

    // TEMPORARY: TEST NOTIFICATION TOAST
    // useEffect(() => {

    //     const testNotification = {
    //         title: "New Enrollment Request",
    //         message:
    //             'ABC has submitted a new enrollment request for "Japanese Language Training".',
    //     };

    //     const timer = setTimeout(() => {

    //         toast(
    //             <div className="w-full">
    //                 <div className="mb-2 flex items-center justify-between">
    //                     {/* <p className="text-sm font-semibold tracking-tight text-gray-900"> */}
    //                     <p className="text-sm font-semibold tracking-tight text-gray-300">
    //                         {testNotification.title}
    //                     </p>

    //                     <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
    //                         Just now
    //                     </span>
    //                 </div>

    //                 {/* <p className="text-sm leading-5 text-gray-500"> */}
    //                 <p className="text-[13px] leading-5 text-gray-400">
    //                     {testNotification.message}
    //                 </p>
    //             </div>,
    //             {
    //                 position: "top-right",
    //                 autoClose: 5000,
    //                 hideProgressBar: true,
    //                 closeOnClick: true,
    //                 pauseOnHover: true,
    //                 draggable: true,

    //                 className:
    //                     // "!w-[380px] !rounded-2xl !border !border-gray-200/70 !bg-white !p-6 !shadow-[0_12px_35px_rgba(0,0,0,0.10)]",
    //                     "!w-[380px] !rounded-2xl !border !border-gray-200/70 !bg-gray-900 !p-6 !shadow-[0_12px_35px_rgba(0,0,0,0.10)]",

    //                 bodyClassName:
    //                     "!m-0 !p-0",
    //             }
    //         );

    //     }, 500);

    //     return () => clearTimeout(timer);

    // }, []);

    /* REAL- TIME SOCKET NOTIFICATIONS */
    useEffect(() => {

        const handleNotification = (notification) => {

            console.log(
                "🔔 NEW NOTIFICATION:",
                notification
            );

            // Prevent duplicate notification
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

            // 🔊 Play notification ringtone
            if (notificationSoundRef.current) {

                const audio = notificationSoundRef.current;

                audio.currentTime = 0;

                audio.play().catch((error) => {
                    console.log(
                        "Notification sound could not play:",
                        error
                    );
                });
            }

            // toast(
            //     <div className="w-full">
            //         <div className="mb-1 flex items-center justify-between ">
            //             <p className="text-sm font-semibold tracking-tight text-gray-900">
            //                 {notification.title || "New Notification"}
            //             </p>

            //             <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
            //                 Just now
            //             </span>
            //         </div>

            //         <p className="text-sm leading-5 text-gray-500">
            //             {notification.message ||
            //                 "You have a new notification"}
            //         </p>
            //     </div>,
            //     {
            //         position: "top-right",
            //         autoClose: 5000,
            //         hideProgressBar: true,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,

            //         className:
            //             "!w-[380px] !rounded-2xl !border !border-gray-200/70 !bg-white !p-6 !shadow-[0_12px_35px_rgba(0,0,0,0.10)]",

            //         bodyClassName:
            //             "!m-0 !p-0",
            //     }
            // );

            toast(
                <div className="w-full">
                    <div className="mb-2 flex items-center justify-between">
                        {/* <p className="text-sm font-semibold tracking-tight text-gray-900"> */}
                        <p className="text-sm font-semibold tracking-tight text-gray-300">
                            {notification.title || "New Notification"}
                        </p>

                        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                            Just now
                        </span>
                    </div>

                    {/* <p className="text-sm leading-5 text-gray-500"> */}
                    <p className="text-[13px] leading-5 text-gray-400">
                        {notification.message ||
                            "You have a new notification"}                    </p>
                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,

                    // was: !w-[380px] unconditionally — wider than the viewport on any
                    // phone narrower than 380px (most phones), so the toast overflowed
                    // the screen and got clipped/pushed off the left edge no matter how
                    // the .Toastify__toast-container itself was positioned via CSS. Now
                    // fluid width on phone (fills available space, respecting the
                    // container's own padding), fixed 380px from sm: up — unchanged.
                    className:
                        // "!w-[380px] !rounded-2xl !border !border-gray-200/70 !bg-white !p-6 !shadow-[0_12px_35px_rgba(0,0,0,0.10)]",
                        "!w-full sm:!w-[380px] !rounded-2xl !border !border-gray-200/70 !bg-gray-900 !p-4 sm:!p-6 !shadow-[0_12px_35px_rgba(0,0,0,0.10)]",

                    bodyClassName:
                        "!m-0 !p-0",
                }
            );

            // toast(
            //     <div className="w-full">
            //         <div className="mb-2 flex items-center justify-between">
            //             <p className="text-[13px] font-semibold text-gray-900">
            //                 {notification.title || "New Notification"}
            //             </p>

            //             <span className="text-[10px] font-medium text-gray-400">
            //                 NOW
            //             </span>
            //         </div>

            //         <p className="text-[12px] leading-[1.6] text-gray-500">
            //             {notification.message ||
            //                 "You have a new notification"}
            //         </p>

            //         <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-gray-100">
            //             <div className="h-full w-1/3 rounded-full bg-gray-900" />
            //         </div>
            //     </div>,
            //     {
            //         position: "top-right",
            //         autoClose: 5000,
            //         hideProgressBar: true,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,

            //         className:
            //             "!w-[380px] !rounded-2xl !border !border-gray-200/60 !bg-white !p-4 !shadow-[0_15px_40px_rgba(0,0,0,0.12)]",

            //         bodyClassName:
            //             "!m-0 !p-0",
            //     }
            // );
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
    // const unreadCount = notifications.filter(
    //     notification => !notification.is_read
    // ).length;

    const unreadCount = notifications.filter(
        notification => Number(notification.is_read) === 0
    ).length;

    console.log("unread count", unreadCount);

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


    /* CLICK NOTIFICATION */
    // const handleNotificationClick = (notification) => {
    //     setShowNotifications(false);

    //     navigate("/admin/enrollments", {
    //         state: {
    //             notificationId: notification.notification_id,
    //             enroll_id: notification.enroll_id
    //         }
    //     });
    // };


    /* CLICK NOTIFICATION - BACKEND CONNECTED */
    const handleNotificationClick = async (notification) => {

        try {

            const token =
                sessionStorage.getItem("token");

            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notification.notification_id}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "📤 MARK READ RESPONSE:",
                response.data
            );


            // Update local state immediately
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

        navigate("/admin/enrollments", {
            state: {
                notificationId:
                    notification.notification_id,

                enroll_id:
                    notification.enroll_id
            }
        });

    };

    const isOnProfile = location.pathname === "/admin/profile";


    // const lastPageRef = useRef("/admin/dashboard");

    const notificationRef = useRef(null);

    // useEffect(() => {

    //     if (!isOnProfile) {
    //         lastPageRef.current = location.pathname;
    //     }

    // }, [location.pathname, isOnProfile]);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /* Previous */
    // const handleProfileClick = () => {

    //     if (isOnProfile) {
    //         navigate(lastPageRef.current);
    //     } else {
    //         navigate("/admin/profile");
    //     }

    // };

    const handleProfileClick = () => {

        if (isOnProfile) {
            navigate(location.state?.from || "/admin/dashboard");
        } else {
            navigate("/admin/profile", {
                state: {
                    from: location.pathname
                }
            });
        }

    };


    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Backdrop shown behind the drawer on phone/tablet when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">

                {/* was: className="bg-white border-b border-red-100 px-8 py-2 flex justify-end items-center shadow-sm" */}
                <header className="bg-white border-b border-red-100 px-4 sm:px-8 py-2 flex justify-between md:justify-end items-center shadow-sm">


                    {/* Hamburger — only visible below md, opens the sidebar drawer */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 rounded-full hover:bg-red-50 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={22} className="text-gray-700" />
                    </button>

                    <div className="flex items-center gap-4">

                        <div ref={notificationRef} className="relative">
                            <button
                                onClick={() => setShowNotifications((prev) => !prev)}
                                className="relative p-2 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                                title="Notification"
                            >
                                <Bell size={22} className="text-gray-600" />



                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-12 w-auto sm:w-96 max-w-sm sm:max-w-none mx-auto sm:mx-0 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">

                                    {/* Header */}
                                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">
                                            Notifications
                                        </h3>

                                        <span className="text-xs text-red-600 font-medium">
                                            {/* {dummyNotifications.length} New */}
                                            {unreadCount} New
                                        </span>
                                    </div>

                                    {/* Notifications */}
                                    <div className="max-h-80 overflow-y-auto">

                                        {/* {dummyNotifications.map((notification) => ( */}



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
                                                    onClick={() => handleNotificationClick(notification)}
                                                    // className="px-4 py-3 border-b border-gray-100 hover:bg-red-50 cursor-pointer transition-colors"
                                                    // className={`px-4 py-3 border-b border-gray-100 hover:bg-red-50 cursor-pointer transition-colors ${!notification.is_read
                                                    //     ? "bg-red-50/40"
                                                    //     : "bg-white"
                                                    //     }`}

                                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-red-50 cursor-pointer transition-colors 
                                                        ${Number(notification.is_read) === 0
                                                            ? "bg-red-50/60"
                                                            : "bg-white"
                                                        }`}
                                                >
                                                    <div className="flex gap-3">

                                                        {/* Icon */}
                                                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                                                            <Bell
                                                                size={17}
                                                                className="text-red-600"
                                                            />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* <p className="text-sm font-semibold text-gray-800">
                                                                {notification.title}
                                                            </p> */}

                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-semibold text-gray-800">
                                                                    {notification.title}
                                                                </p>

                                                                {Number(notification.is_read) === 1 ? (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                                        Read
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                                                        Unread
                                                                    </span>
                                                                )}
                                                            </div>


                                                            <p className="text-xs text-gray-600 mt-1 leading-5 break-words">
                                                                {notification.message}
                                                            </p>

                                                            <p className="text-[11px] text-gray-400 mt-1">
                                                                {/* {notification.time} */}
                                                                {formatNotificationTime(notification.created_at)}
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

                        <div
                            onClick={handleProfileClick}
                            onMouseEnter={() => setShowProfileMessage(true)}
                            onMouseLeave={() => setShowProfileMessage(false)}
                            // was: className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-red-100 cursor-pointer hover:bg-red-50 transition-colors"
                            className="relative flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-full border border-red-100 cursor-pointer hover:bg-red-50 transition-colors"
                        >
                            <UserCircle size={26} className="text-red-600" />
                            {/* was: <span className="font-semibold text-gray-700"> */}
                            <span className="font-semibold text-gray-700 hidden sm:inline">
                                {user?.user_full_name || user?.username || "Admin"}
                            </span>
                            <ChevronDown
                                size={16}
                                className={`text-gray-500 transition-transform ${isOnProfile ? "rotate-180" : ""
                                    }`}
                            />



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

                {/* was: overflow-auto — same cross-page horizontal-scroll leak fixed on InstructorLayout; overflow-x-hidden blocks it here too, overflow-y-auto keeps vertical scroll working. */}
                {/* New: pb-20 on phone only — without it, the pagination button row
                    (<< < 1 2 3 4 > >>) at the bottom of each table sat flush against the
                    bottom edge of the scrollable area with no room to scroll down to it,
                    so it was invisible on phone even though it rendered correctly.
                    sm: reverts to the original p-8 with no extra bottom space, so
                    desktop/tablet is untouched. */}
                <main id="admin-main-scroll" className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;