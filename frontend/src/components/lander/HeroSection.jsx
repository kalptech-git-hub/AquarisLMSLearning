/* Previous */
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { 
//     FiArrowRight, 
//     FiPlay, 
//     FiMic, 
//     FiCheckCircle, 
//     FiAward, 
//     FiBookOpen, 
//     FiUsers, 
//     FiClock, 
//     FiVolume2,
//     FiStar
// } from "react-icons/fi";

// const HeroSection = () => {
//     const navigate = useNavigate();
//     const [isPlayingSample, setIsPlayingSample] = useState(false);

//     const handlePlayAudio = () => {
//         setIsPlayingSample(true);
//         if ('speechSynthesis' in window) {
//             window.speechSynthesis.cancel();
//             const utterance = new SpeechSynthesisUtterance("こんにちは、日本語を一緒に学びましょう！");
//             utterance.lang = "ja-JP";
//             utterance.rate = 0.9;
//             utterance.onend = () => setIsPlayingSample(false);
//             utterance.onerror = () => setIsPlayingSample(false);
//             window.speechSynthesis.speak(utterance);
//         } else {
//             setTimeout(() => setIsPlayingSample(false), 2000);
//         }
//     };

//     return (
//         <section className="relative overflow-hidden pt-6 pb-6 sm:pt-8 sm:pb-8 md:pt-10 md:pb-10 bg-gradient-to-b from-slate-50 via-red-50/20 to-white">
//             {/* Background Decorative Elements */}
//             <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />
//             <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
//             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
//                     {/* Left Column: Value Proposition & CTAs */}
//                     <motion.div 
//                         initial={{ opacity: 0, y: 25 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6 }}
//                         className="lg:col-span-7 text-center lg:text-left space-y-6"
//                     >
//                         {/* Pill Badge */}
//                         <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 shadow-xs text-xs sm:text-sm font-semibold text-[#C41E2E]">
//                             <span className="flex h-2 w-2 rounded-full bg-[#C41E2E] animate-pulse" />
//                             <span className="tracking-wide">日本語を学ぶ • Interactive Japanese Learning Platform</span>
//                         </div>

//                         {/* Main Heading */}
//                         <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B1E39] tracking-tight leading-[1.15]">
//                             Master Japanese Language &amp; Unlock Global{" "}
//                             <span className="bg-gradient-to-r from-[#C41E2E] via-[#E63946] to-[#7B3B5C] bg-clip-text text-transparent">
//                                 Opportunities
//                             </span>
//                         </h1>

//                         {/* Description */}
//                         <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
//                             A complete Japanese LMS ecosystem designed for practical fluency. Learn with structured modules, native audio pronunciation drills, interactive quizzes, and verified certificates.
//                         </p>

//                         {/* Action Buttons */}
//                         <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
//                             <button
//                                 // onClick={() => navigate("/?tab=courses")}
//                                 onClick={() => navigate("/courses")}
//                                 className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#0B1E39] via-[#1E2A4A] to-[#C41E2E] shadow-lg shadow-blue-950/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
//                             >
//                                 <span>Explore All Courses</span>
//                                 <FiArrowRight className="text-lg" />
//                             </button>

//                             <button
//                                 onClick={() => {
//                                     const features = document.getElementById("features");
//                                     if (features) {
//                                         features.scrollIntoView({ behavior: "smooth" });
//                                     }
//                                 }}
//                                 className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-slate-700 font-semibold bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all duration-200 cursor-pointer"
//                             >
//                                 <FiStar className="text-[#C41E2E]" />
//                                 <span>Platform Features</span>
//                             </button>
//                         </div>

//                         {/* Quick Trust Badges */}
//                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80">
//                             <div className="flex flex-col items-center lg:items-start">
//                                 <span className="text-xl sm:text-2xl font-bold text-[#0B1E39]">100%</span>
//                                 <span className="text-xs text-slate-500 font-medium">Structured Lessons</span>
//                             </div>
//                             <div className="flex flex-col items-center lg:items-start">
//                                 <span className="text-xl sm:text-2xl font-bold text-[#C41E2E]">Interactive</span>
//                                 <span className="text-xs text-slate-500 font-medium">Speaking Lab</span>
//                             </div>
//                             <div className="flex flex-col items-center lg:items-start">
//                                 <span className="text-xl sm:text-2xl font-bold text-[#0B1E39]">On-Demand</span>
//                                 <span className="text-xs text-slate-500 font-medium">Video &amp; PDFs</span>
//                             </div>
//                             <div className="flex flex-col items-center lg:items-start">
//                                 <span className="text-xl sm:text-2xl font-bold text-[#C41E2E]">Verified</span>
//                                 <span className="text-xs text-slate-500 font-medium">Certificates</span>
//                             </div>
//                         </div>

//                     </motion.div>

//                     {/* Right Column: Interactive LMS UI Preview Card */}
//                     <motion.div 
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.7, delay: 0.2 }}
//                         className="lg:col-span-5 relative"
//                     >
//                         {/* Main Simulated Learning Card */}
//                         <div className="relative rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200/80 backdrop-blur-xl">
                            
//                             {/* Card Header */}
//                             <div className="flex items-center justify-between pb-4 border-b border-slate-100">
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-10 h-10 rounded-xl bg-red-100/80 text-[#C41E2E] flex items-center justify-center font-bold text-lg shadow-xs">
//                                         日
//                                     </div>
//                                     <div>
//                                         <h2 className="text-sm font-bold text-[#0B1E39]">Student Learning Hub</h2>
//                                         <p className="text-xs text-slate-400">Interactive Japanese Module</p>
//                                     </div>
//                                 </div>
//                                 <span className="px-2.5 py-1 text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full flex items-center gap-1">
//                                     <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
//                                     Active Lesson
//                                 </span>
//                             </div>

//                             {/* Lesson Player Simulation Block */}
//                             <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#0B1E39] via-[#16294D] to-[#20375E] p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
//                                 <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-500/20 rounded-full blur-xl" />
                                
//                                 <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
//                                     <span className="uppercase font-semibold tracking-wider text-rose-300">Speaking &amp; Audio Lab</span>
//                                     <span className="flex items-center gap-1"><FiClock size={12} /> 15 mins</span>
//                                 </div>

//                                 <h3 className="text-base sm:text-lg font-bold mb-1">
//                                     Conversational Greetings &amp; Politeness
//                                 </h3>
//                                 <p className="text-xs text-slate-300 mb-4">
//                                     日常のあいさつ • Daily Japanese Essentials
//                                 </p>

//                                 {/* Japanese Kanji / Audio Demonstration Pill */}
//                                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between gap-3">
//                                     <div className="min-w-0">
//                                         <p className="text-xs text-rose-200 font-mono">こんにちは (Konnichiwa)</p>
//                                         <p className="text-sm font-semibold truncate text-white">Hello / Good Afternoon</p>
//                                     </div>
//                                     <button
//                                         onClick={handlePlayAudio}
//                                         className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
//                                             isPlayingSample 
//                                                 ? "bg-red-500 text-white animate-pulse" 
//                                                 : "bg-white text-[#0B1E39] hover:bg-red-50"
//                                         } cursor-pointer`}
//                                     >
//                                         <FiVolume2 className={isPlayingSample ? "animate-bounce" : ""} />
//                                         <span>{isPlayingSample ? "Playing..." : "Hear Audio"}</span>
//                                     </button>
//                                 </div>

//                                 {/* Simulated Waveform / Audio bars */}
//                                 <div className="mt-4 flex items-center gap-1 justify-center py-1">
//                                     {[40, 75, 50, 90, 60, 80, 45, 95, 70, 85, 40, 60, 90, 50, 75].map((height, i) => (
//                                         <div
//                                             key={i}
//                                             className={`w-1 rounded-full transition-all duration-300 ${
//                                                 isPlayingSample ? "bg-red-400" : "bg-white/30"
//                                             }`}
//                                             style={{ 
//                                                 height: isPlayingSample ? `${Math.max(10, (height * Math.random()).toFixed(0))}px` : `${height / 3}px` 
//                                             }}
//                                         />
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Floating Feature Badges around card */}
//                             <div className="mt-4 grid grid-cols-2 gap-3">
//                                 <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
//                                     <div className="w-8 h-8 rounded-lg bg-red-100 text-[#C41E2E] flex items-center justify-center shrink-0">
//                                         <FiMic size={16} />
//                                     </div>
//                                     <div className="min-w-0">
//                                         <p className="text-xs font-bold text-slate-800">Voice Practice</p>
//                                         <p className="text-[11px] text-slate-500 truncate">Audio recording drill</p>
//                                     </div>
//                                 </div>

//                                 <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
//                                     <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B1E39] flex items-center justify-center shrink-0">
//                                         <FiCheckCircle size={16} />
//                                     </div>
//                                     <div className="min-w-0">
//                                         <p className="text-xs font-bold text-slate-800">Instant Quizzes</p>
//                                         <p className="text-[11px] text-slate-500 truncate">Score &amp; feedback</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Curriculum Access Notice */}
//                             <div className="mt-3 p-3 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center justify-between">
//                                 <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
//                                     <span className="w-2 h-2 rounded-full bg-emerald-500" />
//                                     <span>Curriculum: Comprehensive Video Lessons &amp; PDF Notes</span>
//                                 </div>
//                                 <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
//                                     24/7 Access
//                                 </span>
//                             </div>

//                         </div>

//                         {/* Floating Decorative Pill */}
//                         <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white p-3 rounded-2xl shadow-xl border border-slate-200 items-center gap-3">
//                             <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
//                                 <FiAward size={20} />
//                             </div>
//                             <div>
//                                 <p className="text-xs font-bold text-slate-900">Verified Certificate</p>
//                                 <p className="text-[11px] text-slate-500">Upon course completion</p>
//                             </div>
//                         </div>

//                     </motion.div>

//                 </div>
//             </div>
//         </section>
//     );
// };

// export default HeroSection;

/* New */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
    FiArrowRight, 
    FiPlay, 
    FiMic, 
    FiCheckCircle, 
    FiAward, 
    FiBookOpen, 
    FiUsers, 
    FiClock, 
    FiVolume2,
    FiStar
} from "react-icons/fi";
import { TbLanguageKatakana } from "react-icons/tb";

const HeroSection = () => {
    const navigate = useNavigate();
    const [isPlayingSample, setIsPlayingSample] = useState(false);

    const handlePlayAudio = () => {
        setIsPlayingSample(true);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance("こんにちは、日本語を一緒に学びましょう！");
            utterance.lang = "ja-JP";
            utterance.rate = 0.9;
            utterance.onend = () => setIsPlayingSample(false);
            utterance.onerror = () => setIsPlayingSample(false);
            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => setIsPlayingSample(false), 2000);
        }
    };

    return (
        // <section className="relative overflow-hidden pt-6 pb-6 sm:pt-8 sm:pb-8 md:pt-10 md:pb-10 bg-gradient-to-b from-slate-50 via-red-50/20 to-white">
        //     {/* Background Decorative Elements */}
        //     <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />
        //     <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        //     <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        //         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
        //             {/* Left Column: Value Proposition & CTAs */}
        //             <motion.div 
        //                 initial={{ opacity: 0, y: 25 }}
        //                 animate={{ opacity: 1, y: 0 }}
        //                 transition={{ duration: 0.6 }}
        //                 className="lg:col-span-7 text-center lg:text-left space-y-6"
        //             >
        //                 {/* Pill Badge */}
        //                 <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 shadow-xs text-xs sm:text-sm font-semibold text-[#C41E2E]">
        //                     <span className="flex h-2 w-2 rounded-full bg-[#C41E2E] animate-pulse" />
        //                     <span className="tracking-wide">日本語を学ぶ • Interactive Japanese Learning Platform</span>
        //                 </div>

        //                 {/* Main Heading */}
        //                 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1E39] tracking-tight leading-[1.15]">
        //                     Master Japanese Language &amp; Unlock Global{" "}
        //                     <span className="bg-gradient-to-r from-[#C41E2E] via-[#E63946] to-[#7B3B5C] bg-clip-text text-transparent">
        //                         Opportunities
        //                     </span>
        //                 </h1>

        //                 {/* Description */}
        //                 <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
        //                     A complete Japanese LMS ecosystem designed for practical fluency. Learn with structured modules, native audio pronunciation drills, interactive quizzes, and verified certificates.
        //                 </p>

        //                 {/* Action Buttons */}
        //                 <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
        //                     <button
        //                         // onClick={() => navigate("/?tab=courses")}
        //                         onClick={() => navigate("/courses")}
        //                         className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#0B1E39] via-[#1E2A4A] to-[#C41E2E] shadow-lg shadow-blue-950/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
        //                     >
        //                         <span>Explore All Courses</span>
        //                         <FiArrowRight className="text-lg" />
        //                     </button>

        //                     <button
        //                         onClick={() => {
        //                             const features = document.getElementById("features");
        //                             if (features) {
        //                                 features.scrollIntoView({ behavior: "smooth" });
        //                             }
        //                         }}
        //                         className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-slate-700 font-semibold bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all duration-200 cursor-pointer"
        //                     >
        //                         <FiStar className="text-[#C41E2E]" />
        //                         <span>Platform Features</span>
        //                     </button>
        //                 </div>

        //                 {/* Quick Trust Badges */}
        //                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80">
        //                     <div className="flex flex-col items-center lg:items-start">
        //                         <span className="text-xl sm:text-2xl font-bold text-[#0B1E39]">100%</span>
        //                         <span className="text-xs text-slate-500 font-medium">Structured Lessons</span>
        //                     </div>
        //                     <div className="flex flex-col items-center lg:items-start">
        //                         <span className="text-xl sm:text-2xl font-bold text-[#C41E2E]">Interactive</span>
        //                         <span className="text-xs text-slate-500 font-medium">Speaking Lab</span>
        //                     </div>
        //                     <div className="flex flex-col items-center lg:items-start">
        //                         <span className="text-xl sm:text-2xl font-bold text-[#0B1E39]">On-Demand</span>
        //                         <span className="text-xs text-slate-500 font-medium">Video &amp; PDFs</span>
        //                     </div>
        //                     <div className="flex flex-col items-center lg:items-start">
        //                         <span className="text-xl sm:text-2xl font-bold text-[#C41E2E]">Verified</span>
        //                         <span className="text-xs text-slate-500 font-medium">Certificates</span>
        //                     </div>
        //                 </div>

        //             </motion.div>

        //             {/* Right Column: Interactive LMS UI Preview Card */}
        //             <motion.div 
        //                 initial={{ opacity: 0, scale: 0.95 }}
        //                 animate={{ opacity: 1, scale: 1 }}
        //                 transition={{ duration: 0.7, delay: 0.2 }}
        //                 className="lg:col-span-5 relative"
        //             >
        //                 {/* Main Simulated Learning Card */}
        //                 <div className="relative rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200/80 backdrop-blur-xl">
                            
        //                     {/* Card Header */}
        //                     <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        //                         <div className="flex items-center gap-3">
        //                             <div className="w-10 h-10 rounded-xl bg-red-100/80 text-[#C41E2E] flex items-center justify-center font-bold text-lg shadow-xs">
        //                                 {/* was: 日 */}
        //                                 <TbLanguageKatakana aria-hidden="true" />
        //                             </div>
        //                             <div>
        //                                 <h2 className="text-sm font-bold text-[#0B1E39]">Student Learning Hub</h2>
        //                                 <p className="text-xs text-slate-400">Interactive Japanese Module</p>
        //                             </div>
        //                         </div>
        //                         <span className="px-2.5 py-1 text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full flex items-center gap-1">
        //                             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
        //                             Active Lesson
        //                         </span>
        //                     </div>

        //                     {/* Lesson Player Simulation Block */}
        //                     <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#0B1E39] via-[#16294D] to-[#20375E] p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        //                         <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-500/20 rounded-full blur-xl" />
                                
        //                         <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
        //                             <span className="uppercase font-semibold tracking-wider text-rose-300">Speaking &amp; Audio Lab</span>
        //                             <span className="flex items-center gap-1"><FiClock size={12} /> 15 mins</span>
        //                         </div>

        //                         <h3 className="text-base sm:text-lg font-bold mb-1">
        //                             Conversational Greetings &amp; Politeness
        //                         </h3>
        //                         <p className="text-xs text-slate-300 mb-4">
        //                             日常のあいさつ • Daily Japanese Essentials
        //                         </p>

        //                         {/* Japanese Kanji / Audio Demonstration Pill */}
        //                         <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between gap-3">
        //                             <div className="min-w-0">
        //                                 <p className="text-xs text-rose-200 font-mono">こんにちは (Konnichiwa)</p>
        //                                 <p className="text-sm font-semibold truncate text-white">Hello / Good Afternoon</p>
        //                             </div>
        //                             <button
        //                                 onClick={handlePlayAudio}
        //                                 className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
        //                                     isPlayingSample 
        //                                         ? "bg-red-500 text-white animate-pulse" 
        //                                         : "bg-white text-[#0B1E39] hover:bg-red-50"
        //                                 } cursor-pointer`}
        //                             >
        //                                 <FiVolume2 className={isPlayingSample ? "animate-bounce" : ""} />
        //                                 <span>{isPlayingSample ? "Playing..." : "Hear Audio"}</span>
        //                             </button>
        //                         </div>

        //                         {/* Simulated Waveform / Audio bars */}
        //                         <div className="mt-4 flex items-center gap-1 justify-center py-1">
        //                             {[40, 75, 50, 90, 60, 80, 45, 95, 70, 85, 40, 60, 90, 50, 75].map((height, i) => (
        //                                 <div
        //                                     key={i}
        //                                     className={`w-1 rounded-full transition-all duration-300 ${
        //                                         isPlayingSample ? "bg-red-400" : "bg-white/30"
        //                                     }`}
        //                                     style={{ 
        //                                         height: isPlayingSample ? `${Math.max(10, (height * Math.random()).toFixed(0))}px` : `${height / 3}px` 
        //                                     }}
        //                                 />
        //                             ))}
        //                         </div>
        //                     </div>

        //                     {/* Floating Feature Badges around card */}
        //                     <div className="mt-4 grid grid-cols-2 gap-3">
        //                         <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
        //                             <div className="w-8 h-8 rounded-lg bg-red-100 text-[#C41E2E] flex items-center justify-center shrink-0">
        //                                 <FiMic size={16} />
        //                             </div>
        //                             <div className="min-w-0">
        //                                 <p className="text-xs font-bold text-slate-800">Voice Practice</p>
        //                                 <p className="text-[11px] text-slate-500 truncate">Audio recording drill</p>
        //                             </div>
        //                         </div>

        //                         <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
        //                             <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B1E39] flex items-center justify-center shrink-0">
        //                                 <FiCheckCircle size={16} />
        //                             </div>
        //                             <div className="min-w-0">
        //                                 <p className="text-xs font-bold text-slate-800">Instant Quizzes</p>
        //                                 <p className="text-[11px] text-slate-500 truncate">Score &amp; feedback</p>
        //                             </div>
        //                         </div>
        //                     </div>

        //                     {/* Curriculum Access Notice */}
        //                     {/*
        //                     <div className="mt-3 p-3 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center justify-between">
        //                         <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
        //                             <span className="w-2 h-2 rounded-full bg-emerald-500" />
        //                             <span>Curriculum: Comprehensive Video Lessons &amp; PDF Notes</span>
        //                         </div>
        //                         <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
        //                             24/7 Access
        //                         </span>
        //                     </div>
        //                     */}

        //                 </div>

        //                 {/* Floating Decorative Pill */}
        //                 {/*
        //                 <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white p-3 rounded-2xl shadow-xl border border-slate-200 items-center gap-3">
        //                     <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
        //                         <FiAward size={20} />
        //                     </div>
        //                     <div>
        //                         <p className="text-xs font-bold text-slate-900">Verified Certificate</p>
        //                         <p className="text-[11px] text-slate-500">Upon course completion</p>
        //                     </div>
        //                 </div>
        //                 */}

        //             </motion.div>

        //         </div>
        //     </div>
        // </section>
           <section className="relative min-h-[650px] overflow-hidden">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2000&auto=format&fit=crop')",
          }}
        />

        {/* Dark Blue + Red Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071d36]/95 via-[#0b2341]/85 to-[#7a1f44]/65" />

        {/* Soft Red Glow */}
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#c52d3f]/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-10">

          {/* ================= LEFT ================= */}
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#ff5b65]" />
              Interactive Japanese Learning Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-5xl">
             Master Japanese Language 
              <span className="block text-[#ff5b65]">
                & Unlock Global Opportunities
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              A complete Japanese LMS ecosystem designed for practical
              fluency. Learn with structured modules, native audio
              pronunciation, interactive quizzes and verified certificates.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={() => {
                  const el = document.getElementById("explore-courses");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate("/courses");
                  }
                }}
                className="
                  rounded-xl
                  bg-[#c52d3f]
                  px-7
                  py-3.5
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-black/20
                  transition
                  duration-300
                  hover:bg-[#e04454]
                  hover:-translate-y-0.5
                  cursor-pointer
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <span>Explore All Courses</span>
                <FiArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("features");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="
                  rounded-xl
                  border
                  border-white/30
                  bg-white/10
                  px-7
                  py-3.5
                  font-semibold
                  text-white
                  backdrop-blur-md
                  transition
                  duration-300
                  hover:bg-white
                  hover:text-[#0b2341]
                  cursor-pointer
                "
              >
                Platform Features
              </button>

            </div>

            {/* Stats */}
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-6 border-t border-white/20 pt-7 sm:grid-cols-4">

              <div>
                <p className="text-xl font-bold text-white">100%</p>
                <p className="mt-1 text-xs text-slate-300">
                  Structured Lessons
                </p>
              </div>

              <div>
                <p className="text-xl font-bold text-[#ff6872]">
                  Interactive
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Speaking Lab
                </p>
              </div>

              <div>
                <p className="text-xl font-bold text-white">
                  On-Demand
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Video & PDFs
                </p>
              </div>

              <div>
                <p className="text-xl font-bold text-[#ff6872]">
                  Verified
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Certificates
                </p>
              </div>

            </div>
          </div>

          {/* ================= RIGHT ================= */}
        <div className="relative flex min-h-[430px] items-center justify-center lg:min-h-[520px]">

          {/* Background Circle */}
          <div
            className="
              absolute
              h-[350px]
              w-[350px]
              rounded-full
              bg-gradient-to-br
              from-[#0b2341]
              via-[#7a1f44]
              to-[#c52d3f]
              opacity-95
              sm:h-[420px]
              sm:w-[420px]
            "
          />

          {/* Image */}
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
            alt="Students learning"
            className="
              relative
              z-10
              h-[390px]
              w-[390px]
              rounded-full
              object-cover
              shadow-2xl
              ring-8
              ring-white
              sm:h-[450px]
              sm:w-[450px]
            "
          />

          {/* Popular Course Card */}
          <div
            className="
              absolute
              left-0
              top-10
              z-20
              w-56
              rounded-xl
              border
              border-slate-100
              bg-white
              p-4
              shadow-xl
              sm:left-0
            "
          >

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#f5e9ef] text-xl">
                🇯🇵
              </div>

              <div>
                <p className="text-xs text-[#64748b]">
                  Popular Course
                </p>

                <p className="font-bold text-[#0b2341]">
                  Japanese N5
                </p>
              </div>

            </div>

            <div className="mt-3 flex items-center justify-between">

              <span className="text-sm font-medium text-[#e09b00]">
                ⭐ 4.8
              </span>

              <span className="text-sm font-semibold text-[#c41e2e]">
                Beginner
              </span>

            </div>

          </div>

          {/* Learning Community Card */}
          <div
            className="
              absolute
              bottom-8
              right-0
              z-20
              rounded-xl
              border
              border-slate-100
              bg-white
              px-5
              py-4
              shadow-xl
            "
          >

            <p className="text-xs text-[#64748b]">
              Learning Community
            </p>

            <p className="mt-1 text-xl font-bold text-[#0b2341]">
              10,000+ Students
            </p>

            <p className="text-xs font-medium text-[#c41e2e]">
              Learn together. Grow together.
        
            </p>

          </div>

        </div>

        </div>
      </section>
    );
};

export default HeroSection;
