// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FiPlay, FiX, FiArrowRight, FiUsers, FiStar, FiAward } from "react-icons/fi";
// import { getCurrentUser } from "../../utils/auth";

// const HeroSectionNew = () => {
//   const navigate = useNavigate();
//   const [currentUser, setCurrentUser] = useState(getCurrentUser());
//   const [token, setToken] = useState(sessionStorage.getItem("token"));
//   const [isVideoOpen, setIsVideoOpen] = useState(false);
//   const [scrollY, setScrollY] = useState(0);
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

//   useEffect(() => {
//     const handleAuthChange = () => {
//       setCurrentUser(getCurrentUser());
//       setToken(sessionStorage.getItem("token"));
//     };
//     window.addEventListener("authChanged", handleAuthChange);
//     return () => window.removeEventListener("authChanged", handleAuthChange);
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => setScrollY(window.scrollY);
//     const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     window.addEventListener("mousemove", handleMouseMove);
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//       window.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   const role = currentUser?.role_code;
//   const isAuthenticated = Boolean(currentUser && token);

//   const getDashboardRoute = () => {
//     if (role === "ADM") return "/admin";
//     if (role === "INS") return "/instructor/dashboard";
//     return "/my-learning";
//   };

//   const handleViewCourses = () => {
//     const el = document.getElementById("explore-courses");
//     if (el) {
//       el.scrollIntoView({ behavior: "smooth" });
//     } else {
//       navigate("/courses");
//     }
//   };

//   const parallaxOffset = scrollY * 0.15;
//   const mouseParallaxX = (mousePos.x - window.innerWidth / 2) * 0.008;
//   const mouseParallaxY = (mousePos.y - window.innerHeight / 2) * 0.008;

//   return (
//     <section
//       className="relative w-full overflow-hidden text-white"
//       style={{
//         background:
//           "radial-gradient(circle at 0% 0%, rgba(145, 48, 80, 0.9) 0%, rgba(145, 48, 80, 0) 38%), radial-gradient(circle at 100% 0%, rgba(135, 36, 55, 0.9) 0%, rgba(135, 36, 55, 0) 38%), linear-gradient(180deg, #374760 0%, #3a4a67 45%, #3a4a67 100%)",
//       }}
//     >
//       {/* ================= FLOATING NAVBAR PILL ================= */}
//       <div className="relative z-30 pt-3 sm:pt-5 px-4 sm:px-6 lg:px-8 max-w-[1240px] xl:max-w-[1300px] mx-auto">
//         <header className="w-full bg-white rounded-md px-4 sm:px-8 py-2 sm:py-2.5 shadow-lg shadow-black/15 flex items-center justify-between transition-all duration-300">
//           {/* Logo */}
//           <div
//             onClick={() => navigate("/")}
//             className="flex items-center gap-2.5 cursor-pointer select-none group"
//           >
//             {/* Origami Emblem */}
//             <div className="w-7 h-7 sm:w-8 sm:h-8 relative transition-transform duration-200 group-hover:scale-105">
//               <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
//                 {/* Indigo/Navy fold */}
//                 <path d="M6 16L20 6L17 32L6 16Z" fill="#0b2341" />
//                 {/* Crimson fold */}
//                 <path d="M20 6L34 12L22 23L20 6Z" fill="#c52d3f" />
//                 {/* Coral accent fold */}
//                 <path d="M34 12L36 21L22 23L34 12Z" fill="#e63946" />
//                 {/* Burgundy shadow fold */}
//                 <path d="M17 32L22 23L27 34L17 32Z" fill="#7a1f44" />
//               </svg>
//             </div>

//             {/* Brand Text */}
//             <div className="flex items-center text-lg sm:text-xl font-bold tracking-tight">
//               <span className="text-[#c52d3f]">Nihongo</span>
//               <span className="ml-1 text-[#0b2341]">LMS</span>
//             </div>
//           </div>

//           {/* Right Actions */}
//           <div className="flex items-center gap-2 sm:gap-4">
//             {isAuthenticated ? (
//               <button
//                 type="button"
//                 onClick={() => navigate(getDashboardRoute())}
//                 className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#0b2341] text-white text-xs sm:text-sm font-semibold hover:bg-[#c52d3f] transition-colors cursor-pointer shadow-sm"
//               >
//                 Dashboard
//               </button>
//             ) : (
//               <>
//                 <button
//                   type="button"
//                   onClick={() => navigate("/register")}
//                   className="text-[#c52d3f] text-sm sm:text-base font-semibold hover:text-[#a01825] transition-colors cursor-pointer px-2 sm:px-3 py-1"
//                 >
//                   Sign up
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => navigate("/login")}
//                   className="px-4 sm:px-6 py-1 sm:py-1.5 rounded-full border border-slate-700/80 text-slate-800 text-sm sm:text-base font-semibold hover:bg-slate-100 hover:border-slate-900 transition-all duration-200 cursor-pointer shadow-xs"
//                 >
//                   Log In
//                 </button>
//               </>
//             )}
//           </div>
//         </header>
//       </div>

//       {/* ================= HERO CONTENT ================= */}
//       <div className="relative z-10 max-w-[1240px] xl:max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-14 pb-14 sm:pb-20 lg:pb-24">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
//           {/* LEFT COLUMN: Headings, CTAs, Social Proof */}
//           <div className="lg:col-span-7 text-left pb-2 lg:pb-6">
//             {/* Main Headline */}
//             <h1 className="text-3xl sm:text-[42px] md:text-[48px] lg:text-[54px] font-[Poppins] font-bold text-white tracking-tight leading-[1.18] sm:leading-[1.16]">
//               Master Japanese <br />
//               Language &amp; Unlock <br />
//               Global Opportunities
//             </h1>

//             {/* Subtitle */}
//             <p className="mt-4 sm:mt-5 text-sm md:text-[16px] text-slate-200/90 max-w-xl leading-[1.6] font-normal">
//               A complete Japanese LMS ecosystem designed for practical fluency. Learn with structured modules, native audio pronunciation drills, interactive quizzes, and verified certificates.
//             </p>

//             {/* Action Buttons Row */}
//             <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-5 sm:gap-6">
//               {/* View Courses Pill */}
//               <button
//                 type="button"
//                 onClick={handleViewCourses}
//                 className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-slate-900 font-bold text-sm sm:text-base shadow-xl shadow-black/20 hover:bg-slate-100 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
//               >
//                 View Courses
//               </button>

//               {/* Play Video Button */}
//               <button
//                 type="button"
//                 onClick={() => setIsVideoOpen(true)}
//                 className="inline-flex items-center gap-3 text-white font-semibold text-sm sm:text-base hover:text-red-200 transition-colors group cursor-pointer"
//               >
//                 <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#f05a28] shadow-lg shadow-orange-900/30 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
//                   <FiPlay className="text-base fill-[#f05a28] translate-x-0.5" />
//                 </span>
//                 <span>Play Video</span>
//               </button>
//             </div>
//           </div>

//           {/* RIGHT COLUMN: Two Joyful Students Photo */}
//           <div className="lg:col-span-5 relative flex items-end justify-center lg:justify-end self-end">
//             <div className="relative w-full max-w-[480px] sm:max-w-[520px] lg:max-w-[560px] xl:max-w-[600px] lg:translate-x-4 xl:translate-x-6">
//               <img
//                 src="/hero_students_reference_cutout.png"
//                 alt="Two excited students learning Japanese"
//                 className="relative z-10 w-full h-auto object-contain object-center select-none pointer-events-none block origin-bottom-right lg:scale-x-[1.04] xl:scale-x-[1.08] lg:scale-y-[1.12] xl:scale-y-[1.2]"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ================= SMOOTH BOTTOM WAVE TRANSITION ================= */}
//       <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
//         <svg
//           viewBox="0 0 1440 90"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//           className="w-full h-10 sm:h-14 md:h-18 lg:h-22 block"
//           preserveAspectRatio="none"
//         >
//           <path
//             d="M0,45 C280,85 520,80 780,42 C1040,0 1260,45 1440,35 L1440,90 L0,90 Z"
//             fill="#ffffff"
//           />
//         </svg>
//       </div>

//       {/* ================= VIDEO MODAL ================= */}
//       {isVideoOpen && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
//           onClick={() => setIsVideoOpen(false)}
//         >
//           <div
//             className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
//               <div className="flex items-center gap-2">
//                 <span className="w-2.5 h-2.5 rounded-full bg-[#c52d3f] animate-pulse" />
//                 <h3 className="text-base font-bold text-white">Nihongo LMS — Platform Overview &amp; Learning Journey</h3>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setIsVideoOpen(false)}
//                 className="p-1.5 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition cursor-pointer"
//                 aria-label="Close video"
//               >
//                 <FiX size={20} />
//               </button>
//             </div>

//             {/* Video Container */}
//             <div className="relative aspect-video w-full bg-black">
//               <iframe
//                 src="https://www.youtube-nocookie.com/embed/s6DKRPmsu_k?autoplay=1&rel=0"
//                 title="Japanese Language Learning Overview"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//                 className="w-full h-full border-0"
//               />
//             </div>

//             {/* Modal Footer */}
//             <div className="px-6 py-4 bg-slate-800/90 flex flex-wrap items-center justify-between gap-4">
//               <p className="text-xs sm:text-sm text-slate-300">
//                 Ready to accelerate your fluency? Join thousands of students mastering Japanese today.
//               </p>
//               {/* Explore Courses button commented out as requested */}
//               {/* <button
//                 type="button"
//                 onClick={() => {
//                   setIsVideoOpen(false);
//                   navigate("/courses");
//                 }}
//                 className="px-5 py-2 rounded-full bg-[#c52d3f] text-white text-xs sm:text-sm font-semibold hover:bg-[#a01825] transition cursor-pointer flex items-center gap-2"
//               >
//                 <span>Explore Courses</span>
//                 <FiArrowRight size={14} />
//               </button> */}
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// };

// export default HeroSectionNew;

/* */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiX, FiArrowRight, FiUsers, FiStar, FiAward } from "react-icons/fi";
import { getCurrentUser } from "../../utils/auth";

const HeroSectionNew = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
      setToken(sessionStorage.getItem("token"));
    };
    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const role = currentUser?.role_code;
  const isAuthenticated = Boolean(currentUser && token);

  const getDashboardRoute = () => {
    if (role === "ADM") return "/admin";
    if (role === "INS") return "/instructor/dashboard";
    return "/my-learning";
  };

  // const handleViewCourses = () => {
  //   const el = document.getElementById("explore-courses");
  //   if (el) {
  //     el.scrollIntoView({ behavior: "smooth" });
  //   } else {
  //     navigate("/courses");
  //   }
  // };

  const handleViewCourses = () => {
  navigate("/courses");
};

  const parallaxOffset = scrollY * 0.15;
  const mouseParallaxX = (mousePos.x - window.innerWidth / 2) * 0.008;
  const mouseParallaxY = (mousePos.y - window.innerHeight / 2) * 0.008;

  return (
    <section
      className="relative w-full overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(145, 48, 80, 0.9) 0%, rgba(145, 48, 80, 0) 38%), radial-gradient(circle at 100% 0%, rgba(135, 36, 55, 0.9) 0%, rgba(135, 36, 55, 0) 38%), linear-gradient(180deg, #374760 0%, #3a4a67 45%, #3a4a67 100%)",
      }}
    >

      {/* ================= HERO CONTENT ================= */}
      {/* <div className="relative z-10 max-w-[1240px] xl:max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-14 pb-14 sm:pb-20 lg:pb-24"> */}
      <div className="relative z-10 max-w-[1240px] xl:max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-14 sm:pb-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          {/* LEFT COLUMN: Headings, CTAs, Social Proof */}
          <div className="lg:col-span-7 text-left pb-2 lg:pb-6">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-[42px] md:text-[48px] lg:text-[54px] font-[Poppins] font-bold text-white tracking-tight leading-[1.18] sm:leading-[1.16]">
              Master Japanese <br />
              Language &amp; Unlock <br />
              Global Opportunities
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm md:text-[16px] text-slate-200/90 max-w-xl leading-[1.6] font-normal">
              A complete Japanese LMS ecosystem designed for practical fluency. Learn with structured modules, native audio pronunciation drills, interactive quizzes, and verified certificates.
            </p>

            {/* Action Buttons Row */}
            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-5 sm:gap-6">
              {/* View Courses Pill */}
              <button
                type="button"
                onClick={handleViewCourses}
                className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white text-slate-900 font-bold text-sm sm:text-base shadow-xl shadow-black/20 hover:bg-slate-100 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                View Courses
              </button>

              {/* Play Video Button */}
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="inline-flex items-center gap-3 text-white font-semibold text-sm sm:text-base hover:text-red-200 transition-colors group cursor-pointer"
              >
                <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#f05a28] shadow-lg shadow-orange-900/30 group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                  <FiPlay className="text-base fill-[#f05a28] translate-x-0.5" />
                </span>
                <span>Play Video</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Two Joyful Students Photo */}
          <div className="lg:col-span-5 relative flex items-end justify-center lg:justify-end self-end">
            <div className="relative w-full max-w-[480px] sm:max-w-[520px] lg:max-w-[560px] xl:max-w-[600px] lg:translate-x-4 xl:translate-x-6">
              <img
                src="/hero_students_reference_cutout.png"
                alt="Two excited students learning Japanese"
                className="relative z-10 w-full h-auto object-contain object-center select-none pointer-events-none block origin-bottom-right lg:scale-x-[1.04] xl:scale-x-[1.08] lg:scale-y-[1.12] xl:scale-y-[1.2]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= SMOOTH BOTTOM WAVE TRANSITION ================= */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 sm:h-14 md:h-18 lg:h-22 block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,45 C280,85 520,80 780,42 C1040,0 1260,45 1440,35 L1440,90 L0,90 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* ================= VIDEO MODAL ================= */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c52d3f] animate-pulse" />
                <h3 className="text-base font-bold text-white">Nihongo LMS — Platform Overview &amp; Learning Journey</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="p-1.5 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition cursor-pointer"
                aria-label="Close video"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src="https://www.youtube-nocookie.com/embed/s6DKRPmsu_k?autoplay=1&rel=0"
                title="Japanese Language Learning Overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-800/90 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-slate-300">
                Ready to accelerate your fluency? Join thousands of students mastering Japanese today.
              </p>
              {/* Explore Courses button commented out as requested */}
              {/* <button
                type="button"
                onClick={() => {
                  setIsVideoOpen(false);
                  navigate("/courses");
                }}
                className="px-5 py-2 rounded-full bg-[#c52d3f] text-white text-xs sm:text-sm font-semibold hover:bg-[#a01825] transition cursor-pointer flex items-center gap-2"
              >
                <span>Explore Courses</span>
                <FiArrowRight size={14} />
              </button> */}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSectionNew;
