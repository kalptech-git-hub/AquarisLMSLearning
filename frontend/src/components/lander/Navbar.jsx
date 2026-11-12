// Navbar.jsx
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import LogoutModal from "../login/LogoutModal";
import {
    FiMenu,
    FiX,
    FiBookOpen,
    FiLogOut,
    FiChevronRight,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../utils/auth";
import StudentNotificationBell from "../student/StudentNotificationBell";

const Navbar = ({ hideOnHero = false }) => {
    const [scrolled, setScrolled] = useState(false);
    const [currentUser, setCurrentUser] = useState(getCurrentUser());
    const [role, setRole] = useState(
        getCurrentUser()?.role_code || null
    );
    const [open, setOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showProfileMessage, setShowProfileMessage] = useState(false);

    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined"
            ? window.innerWidth < 768
            : false
    );

    const navigate = useNavigate();
    const location = useLocation();

    const isLearningPage =
        location.pathname.startsWith("/student/learn");

    /* =========================================================
       ACTIVE ROUTES
    ========================================================= */

    const currentPath = location.pathname;

    const isLanding =
        currentPath === "/" || currentPath === "/home";

    const isLoginActive = currentPath === "/login";
    const isRegisterActive = currentPath === "/register";
    const isCoursesActive = currentPath === "/courses";

    const isDashboardActive =
        currentPath === "/admin" ||
        currentPath === "/instructor/dashboard" ||
        currentPath === "/company/dashboard"
        // ||
        // currentPath === "/instructor-dashboard"
        ;

    const isProfileActive =
        currentPath === "/student/profile" ||
        currentPath === "/admin/profile" ||
        currentPath === "/instructor/profile";

    const isMyLearningActive =
        currentPath === "/my-learning" ||
        currentPath.startsWith("/student/course");
    const isMyCoursesActive = currentPath === "/my-courses";

    /* RESPONSIVE */

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    /* AUTH CHANGE */

    useEffect(() => {
        const updateAuth = () => {
            const latestUser = getCurrentUser();

            setCurrentUser(latestUser);
            setRole(latestUser?.role_code || null);
        };

        window.addEventListener("authChanged", updateAuth);

        return () => {
            window.removeEventListener("authChanged", updateAuth);
        };
    }, []);

    /* PROFILE */

    const profilePhotoUrl = currentUser?.user_profile_photo
        ? /^https?:\/\//i.test(
            currentUser.user_profile_photo
        )
            ? currentUser.user_profile_photo
            : `${import.meta.env.VITE_API_BASE_URL}${currentUser.user_profile_photo}`
        : null;

    const name =
        currentUser?.username ||
        currentUser?.user_full_name ||
        "";

    const isAuthenticated = Boolean(currentUser);

    const roleLabel =
        role === "ADM"
            ? "Admin"
            : role === "INS"
                ? "Instructor"
                : role === "CAD"
                    ? "Company"
                    : role === "STD"
                        ? "Student"
                        : "";

    /* DASHBOARD ROUTE*/

    const getDashboardRoute = () => {
        if (role === "ADM") {
            return "/admin";
        }

        if (role === "INS") {
            return "/instructor/dashboard";
        }
        if (role === "CAD") {
            return "/company/dashboard";
        }

        if (role === "STD") {
            return "/";
        }

        return "/";
    };

    /* HOME */

    const handleHomeClick = () => {
        setOpen(false);

        if (
            location.pathname === "/" ||
            location.pathname === "/home"
        ) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } else {
            navigate("/home");

            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            }, 100);
        }
    };

    /* PROFILE */

    const handleProfileClick = () => {
        setOpen(false);

        if (role === "ADM") {
            if (location.pathname === "/admin/profile") {
                navigate(
                    location.state?.from || "/admin"
                );
            } else {
                navigate("/admin/profile", {
                    state: {
                        from: location.pathname,
                    },
                });
            }
        } else if (role === "INS") {
            if (
                location.pathname === "/instructor/profile"
            ) {
                navigate(
                    location.state?.from ||
                    "/instructor/dashboard"
                );
            } else {
                navigate("/instructor/profile", {
                    state: {
                        from: location.pathname,
                    },
                });
            }
        } else if (role === "CAD") {
            if (
                location.pathname === "/company/profile"
            ) {
                navigate(
                    location.state?.from || "/"
                );
            } else {
                navigate("/company/profile", {
                    state: {
                        from: location.pathname,
                    },
                });
            }
        } else if (role === "STD") {
            if (
                location.pathname === "/student/profile"
            ) {
                navigate(
                    location.state?.from || "/"
                );
            } else {
                navigate("/student/profile", {
                    state: {
                        from: location.pathname,
                    },
                });
            }
        }
    };

    /* LOGOUT */

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setOpen(false);
    };

    const confirmLogout = () => {
        sessionStorage.clear();

        window.dispatchEvent(
            new Event("authChanged")
        );

        setShowLogoutConfirm(false);

        navigate("/");
    };

    /* SCROLL */

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        handleScroll();

        window.addEventListener(
            "scroll",
            handleScroll,
            { passive: true }
        );

        return () => {
            window.removeEventListener(
                "scroll",
                handleScroll
            );
        };
    }, []);

    /*RENDER*/

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{
                    opacity:
                        hideOnHero && !scrolled
                            ? 0
                            : 1,
                    y:
                        hideOnHero && !scrolled
                            ? -80
                            : 0,
                }}
                transition={{
                    duration: 0.3,
                }}
                className={`
                    fixed
                    top-0
                    left-0
                    right-0
                    z-50
                    px-4
                    sm:px-6
                    lg:px-8
                    pt-3
                    sm:pt-5
                    pointer-events-none
                    ${hideOnHero && !scrolled
                        ? "pointer-events-none"
                        : ""}
                `}
            >
                {/* FLOATING NAVBAR PILL*/}

                <div
                    className={`
                        relative
                        z-50
                        w-full
                        max-w-[1240px]
                        xl:max-w-[1300px]
                        mx-auto
                        pointer-events-auto
                    `}
                >
                    <header
                        className="
                            relative
                            w-full
                            bg-white
                            rounded-md
                            px-4
                            sm:px-8
                            py-2
                            sm:py-2.5
                            shadow-lg
                            shadow-black/15
                            flex
                            items-center
                            justify-between
                            transition-all
                            duration-300
                        "
                    >
                        {/* LEFT SIDE */}

                        <div className="flex items-center gap-2.5">
                            {/* Mobile menu */}

                            <div className="flex items-center md:hidden">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpen(
                                            (prev) =>
                                                !prev
                                        )
                                    }
                                    className="
                                        p-1.5
                                        text-slate-700
                                        hover:text-[#c52d3f]
                                        transition-colors
                                        cursor-pointer
                                    "
                                    aria-label={
                                        open
                                            ? "Close menu"
                                            : "Open menu"
                                    }
                                >
                                    {open ? (
                                        <FiX
                                            size={22}
                                        />
                                    ) : (
                                        <FiMenu
                                            size={22}
                                        />
                                    )}
                                </button>
                            </div>

                            {/* Logo */}

                            <motion.div
                                whileHover={{
                                    scale: 1.02,
                                }}
                                onClick={
                                    handleHomeClick
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2.5
                                    cursor-pointer
                                    select-none
                                    group
                                "
                            >
                                {/* Origami emblem */}

                                <div
                                    className="
                                        w-7
                                        h-7
                                        sm:w-8
                                        sm:h-8
                                        relative
                                        transition-transform
                                        duration-200
                                        group-hover:scale-105
                                    "
                                >
                                    {/* <svg
                                        viewBox="0 0 40 40"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="
                                            w-full
                                            h-full
                                            drop-shadow-xs
                                        "
                                    >
                                        <path
                                            d="M6 16L20 6L17 32L6 16Z"
                                            fill="#0b2341"
                                        />

                                        <path
                                            d="M20 6L34 12L22 23L20 6Z"
                                            fill="#c52d3f"
                                        />

                                        <path
                                            d="M34 12L36 21L22 23L34 12Z"
                                            fill="#e63946"
                                        />

                                        <path
                                            d="M17 32L22 23L27 34L17 32Z"
                                            fill="#7a1f44"
                                        />
                                    </svg> */}

                                    {/* <img
                                        src="/lms_logo.png"
                                        alt="AFJ Logo"
                                        className="relative z-10 w-full h-auto object-contain object-center select-none pointer-events-none block origin-bottom-right lg:scale-x-[1.04] xl:scale-x-[1.08] lg:scale-y-[1.12] xl:scale-y-[1.2]"
                                    /> */}

                                </div>

                                {/* Brand */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        text-lg
                                        sm:text-xl
                                        font-bold
                                        tracking-tight
                                    "
                                >
                                    <span className="text-red-500">
                                        Train
                                    </span>

                                    <span className="text-[#0b2341]">
                                        Sphere
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* DESKTOP NAVIGATION */}

                        <div
                            className={`
                                ${open
                                    ? "flex"
                                    : "hidden"
                                }
                                md:flex
                                flex-col
                                md:flex-row
                                items-stretch
                                md:items-center
                                gap-3
                                md:gap-4
                                absolute
                                md:static
                                top-full
                                left-0
                                right-0
                                mt-2
                                md:mt-0 [&>button]:w-full md:[&>button]:w-auto
                                bg-white
                                md:bg-transparent
                                px-4
                                md:px-0
                                py-4
                                md:py-0
                                rounded-xl
                                md:rounded-none
                                shadow-xl
                                md:shadow-none
                                border
                                md:border-0
                                border-gray-100
                            `}
                        >

                            {/* COURSES */}

                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    navigate("/courses");
                                }}
                                className={`
        flex
        items-center
        justify-center
        gap-2
        px-4
        py-2
        rounded-full
        text-sm
        font-semibold
        transition-all
        cursor-pointer
        ${isCoursesActive
                                        ? "bg-[#0b2341] text-white shadow-sm"
                                        : "text-slate-700 hover:bg-slate-100"
                                    }
    `}
                            >
                                <FiBookOpen
                                    className="md:hidden"
                                    size={17}
                                />

                                <span>
                                    Courses
                                </span>
                            </motion.button>
                            {/* =============================================
                                STUDENT
                            ============================================= */}

                            {isAuthenticated &&
                                role === "STD" && (
                                    <>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.03,
                                            }}
                                            type="button"
                                            onClick={() => {
                                                setOpen(
                                                    false
                                                );
                                                navigate(
                                                    "/my-learning"
                                                );
                                            }}
                                            className={`
                                                flex
                                                items-center
                                                justify-center
                                                gap-2
                                                px-4
                                                py-2
                                                rounded-full
                                                text-sm
                                                font-semibold
                                                transition-all
                                                cursor-pointer
                                                ${isMyLearningActive
                                                    ? "bg-[#0b2341] text-white shadow-sm"
                                                    : "text-slate-700 hover:bg-slate-100"
                                                }
                                            `}
                                        >
                                            <FiBookOpen
                                                className="md:hidden"
                                                size={17}
                                            />

                                            <span>
                                                My Learning
                                            </span>
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            type="button"
                                            onClick={() => {
                                                setOpen(false);
                                                navigate("/my-courses");
                                            }}
                                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${isMyCoursesActive ? "bg-[#0b2341] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                                        >
                                            <FiBookOpen className="md:hidden" size={17} />
                                            <span>My Courses</span>
                                        </motion.button>

                                        {/* Desktop notification */}

                                        {!isMobile &&
                                            !isLearningPage && (
                                                <StudentNotificationBell />
                                            )}
                                    </>
                                )}

                            {/* =============================================
                                INSTRUCTOR
                            ============================================= */}

                            {isAuthenticated &&
                                role === "INS" && (
                                    <motion.button
                                        whileHover={{
                                            scale: 1.03,
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        type="button"
                                        onClick={() => {
                                            setOpen(
                                                false
                                            );
                                            navigate(
                                                "/instructor/dashboard"
                                            );
                                        }}
                                        className={`
                                            px-4
                                            py-2
                                            rounded-full
                                            text-sm
                                            font-semibold
                                            transition-all
                                            cursor-pointer
                                            ${isDashboardActive
                                                ? "bg-[#0b2341] text-white shadow-sm"
                                                : "text-slate-700 hover:bg-slate-100"
                                            }
                                        `}
                                    >
                                        Dashboard
                                    </motion.button>
                                )}

                            {/* =============================================
                                ADMIN
                            ============================================= */}

                            {isAuthenticated &&
                                role === "ADM" && (
                                    <motion.button
                                        whileHover={{
                                            scale: 1.03,
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        type="button"
                                        onClick={() => {
                                            setOpen(
                                                false
                                            );
                                            navigate(
                                                "/admin"
                                            );
                                        }}
                                        className={`
                                            px-4
                                            py-2
                                            rounded-full
                                            text-sm
                                            font-semibold
                                            transition-all
                                            cursor-pointer
                                            ${isDashboardActive
                                                ? "bg-[#0b2341] text-white shadow-sm"
                                                : "text-slate-700 hover:bg-slate-100"
                                            }
                                        `}
                                    >
                                        Dashboard
                                    </motion.button>
                                )}

                            {/*  COMPANY */}

                            {isAuthenticated &&
                                role === "CAD" && (
                                    <motion.button
                                        whileHover={{
                                            scale: 1.03,
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        type="button"
                                        onClick={() => {
                                            setOpen(
                                                false
                                            );
                                            navigate(
                                                "/company/dashboard"
                                            );
                                        }}
                                        className={`
                                            px-4
                                            py-2
                                            rounded-full
                                            text-sm
                                            font-semibold
                                            transition-all
                                            cursor-pointer
                                            ${isDashboardActive
                                                ? "bg-[#0b2341] text-white shadow-sm"
                                                : "text-slate-700 hover:bg-slate-100"
                                            }
                                        `}
                                    >
                                        Dashboard
                                    </motion.button>
                                )}
                            {/* =============================================
                                AUTHENTICATED PROFILE / LOGOUT
                            ============================================= */}

                            {isAuthenticated ? (
                                <>
                                    {/* Divider */}

                                    <div className="hidden md:block w-px h-6 bg-gray-200" />

                                    {/* Profile */}

                                    <motion.div
                                        whileHover={{
                                            scale: 1.03,
                                        }}
                                        onClick={
                                            handleProfileClick
                                        }
                                        onMouseEnter={() =>
                                            setShowProfileMessage(
                                                true
                                            )
                                        }
                                        onMouseLeave={() =>
                                            setShowProfileMessage(
                                                false
                                            )
                                        }
                                        className="
                                            relative
                                            hidden md:flex
                                            items-center
                                            gap-2
                                            cursor-pointer
                                        "
                                    >
                                        <div
                                            className={`
                                                w-9
                                                h-9
                                                rounded-full
                                                overflow-hidden
                                                bg-red-50
                                                text-red-600
                                                flex
                                                items-center
                                                justify-center
                                                font-semibold
                                                border
                                                border-red-100
                                                ${isProfileActive
                                                    ? "ring-2 ring-red-500 ring-offset-2"
                                                    : ""
                                                }
                                            `}
                                        >
                                            {profilePhotoUrl ? (
                                                <img
                                                    src={
                                                        profilePhotoUrl
                                                    }
                                                    alt={
                                                        name
                                                    }
                                                    className="
                                                        h-full
                                                        w-full
                                                        object-cover
                                                    "
                                                />
                                            ) : (
                                                <span>
                                                    {name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Desktop tooltip */}

                                        {showProfileMessage && (
                                            <div
                                                className="
                                                    hidden
                                                    md:block
                                                    absolute
                                                    top-full
                                                    right-0
                                                    mt-2
                                                    px-3
                                                    py-1.5
                                                    rounded-md
                                                    bg-white
                                                    text-slate-800
                                                    text-xs
                                                    shadow-lg
                                                    border
                                                    border-gray-100
                                                    whitespace-nowrap
                                                    z-50
                                                "
                                            >
                                                {isProfileActive
                                                    ? "Click to close your profile."
                                                    : "Click to view your profile."}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Logout */}

                                    {/* <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogoutClick}
                                        className="
                                    order-4 md:order-none
                                    flex md:inline-flex
                                    items-center justify-start md:justify-center
                                    gap-2
                                    w-full md:w-auto
                                    text-left md:text-center
                                    px-1 py-3 md:px-4 md:py-1
                                    border-t md:border-0 md:border-b-2 border-gray-200 md:border-transparent
                                    rounded-none
                                    bg-transparent
                                    text-red-600 md:text-gray-700
                                    shadow-none
                                    cursor-pointer
                                     md:hover:text-red-500
                                "
                                    >
                                        <FiLogOut className="text-base md:text-lg" aria-hidden="true" />
                                        <span className="text-sm md:text-base">Logout</span>
                                    </motion.button> */}

                                    <motion.button
                                        whileHover={{
                                            scale: 1.03,
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        type="button"
                                        onClick={handleLogoutClick}
                                        className="w-full md:w-auto justify-center px-4 py-2.5 md:py-2 rounded-full text-sm font-semibold transition-all cursor-pointer text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                                    >
                                        <FiLogOut className="text-base" aria-hidden="true" />
                                        <span>Logout</span>
                                    </motion.button>
                                </>

                            ) : (

                                <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:shrink-0 md:items-center md:gap-2 [&>button]:w-full md:[&>button]:w-auto [&>button]:py-2.5 md:[&>button]:py-2 [&>button]:text-sm">
                                    <motion.button
                                        whileHover={{
                                            scale: 1.03,
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        type="button"
                                        onClick={() => {
                                            setOpen(
                                                false
                                            );
                                            navigate(
                                                "/register"
                                            );
                                        }}
                                        className={`
                                            shrink-0 whitespace-nowrap px-2 sm:px-4
                                            py-2
                                            rounded-full
                                            text-xs sm:text-sm
                                            font-semibold                                    
                                            transition-all
                                            cursor-pointer
                                            ${isRegisterActive
                                                ? "bg-red-100 text-red-500"
                                                // : "border border-slate-700/80 text-slate-800 hover:bg-slate-100"
                                                : "text-red-500 hover:bg-red-50"
                                            }
                                        `}
                                    // className={`
                                    //     shrink-0 whitespace-nowrap px-2 sm:px-4 md:px-5
                                    //     py-1.5
                                    //     sm:py-2
                                    //     rounded-full
                                    //     text-xs sm:text-sm
                                    //     font-semibold
                                    //     transition-all
                                    //     cursor-pointer
                                    //     ${isLoginActive
                                    //         ? "bg-[#0b2341] text-white"
                                    //         : "border border-slate-700/80 text-slate-800 hover:bg-slate-100"
                                    //     }
                                    // `}
                                    >
                                        Sign up
                                    </motion.button>

                                    <motion.button
                                        whileHover={{
                                            scale: 1.03,
                                        }}
                                        whileTap={{
                                            scale: 0.97,
                                        }}
                                        type="button"
                                        onClick={() => {
                                            setOpen(
                                                false
                                            );
                                            navigate(
                                                "/login"
                                            );
                                        }}
                                        className={`
                                            shrink-0 whitespace-nowrap px-2 sm:px-4 md:px-5
                                            py-1.5
                                            sm:py-2
                                            rounded-full
                                            text-xs sm:text-sm
                                            font-semibold
                                            transition-all
                                            cursor-pointer
                                            ${isLoginActive
                                                ? "bg-[#0b2341] text-white"
                                                : "border border-slate-700/80 text-slate-800 hover:bg-slate-100"
                                            }
                                        `}
                                    >
                                        Log In
                                    </motion.button>
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            MOBILE RIGHT SIDE
                        ================================================= */}

                        {isAuthenticated && (
                            <div className="flex items-center gap-2 md:hidden">
                                {/* Student notification */}

                                {isMobile &&
                                    role === "STD" &&
                                    !isLearningPage && (
                                        <StudentNotificationBell />
                                    )}

                                {/* Mobile profile */}

                                <button
                                    type="button"
                                    onClick={
                                        handleProfileClick
                                    }
                                    className="
                                        w-8
                                        h-8
                                        rounded-full
                                        overflow-hidden
                                        bg-red-50
                                        text-red-600
                                        flex
                                        items-center
                                        justify-center
                                        font-semibold
                                        border
                                        border-red-100
                                        cursor-pointer
                                    "
                                    aria-label="View profile"
                                >
                                    {profilePhotoUrl ? (
                                        <img
                                            src={
                                                profilePhotoUrl
                                            }
                                            alt={name}
                                            className="
                                                h-full
                                                w-full
                                                object-cover
                                            "
                                        />
                                    ) : (
                                        <span>
                                            {name
                                                ?.charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}
                    </header>
                </div>
            </motion.nav>

            {/* =============================================================
                MOBILE BACKDROP
            ============================================================= */}

            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/20
                        md:hidden
                    "
                />
            )}

            {/* =============================================================
                LOGOUT MODAL
            ============================================================= */}

            {showLogoutConfirm &&
                createPortal(
                    <LogoutModal
                        onClose={() =>
                            setShowLogoutConfirm(
                                false
                            )
                        }
                        onLogout={confirmLogout}
                    />,
                    document.body
                )}
        </>
    );
};

export default Navbar;
