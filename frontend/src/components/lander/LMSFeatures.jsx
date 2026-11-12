/* Previous */
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//     FiPlayCircle, 
//     FiMic, 
//     FiCheckSquare, 
//     FiAward, 
//     FiBook, 
//     FiFileText, 
//     FiClock, 
//     FiDownload, 
//     FiBarChart2, 
//     FiVolume2,
//     FiCheckCircle,
//     FiRadio
// } from "react-icons/fi";

// const features = [
//     {
//         id: "lesson-player",
//         icon: FiPlayCircle,
//         badge: "Smart Lesson Player",
//         title: "Multi-Format Lesson & Video Player",
//         subtitle: "Integrated video lessons, rich-text grammar notes, and textbook PDFs in a single unified interface.",
//         points: [
//             "High-definition video playback with topic timestamps",
//             "Embedded Japanese PDF textbooks and vocabulary sheets",
//             "Rich formatted lesson notes with Furigana & translations",
//             "Auto-saved lesson progress across devices"
//         ],
//         mockupType: "player"
//     },
//     {
//         id: "speaking-lab",
//         icon: FiMic,
//         badge: "Speaking & Pronunciation Lab",
//         title: "Voice Recording & Pronunciation Drills",
//         subtitle: "Overcome fear of speaking Japanese with interactive voice recording, sentence practice, and native audio comparison.",
//         points: [
//             "Microphone recording for real-time speech practice",
//             "Native Japanese audio reference tracks for imitation",
//             "Confidence building through repetitive self-evaluation"
//         ],
//         mockupType: "speaking"
//     },
//     {
//         id: "quiz-engine",
//         icon: FiCheckSquare,
//         badge: "Assessment Engine",
//         title: "Dynamic Quiz Player",
//         subtitle: "Assess your grammar particles, Kanji reading, and listening skills with timed quizzes and instant scoring.",
//         points: [
//             "Timed JLPT-style multiple choice assessments",
//             "Accurate Japanese typography (Kanji, Hiragana, Katakana)",
//             "Instant results, score breakdown, and pass criteria",
//             "Automated feedback to identify weak topic areas"
//         ],
//         mockupType: "quiz"
//     },
//     {
//         id: "progress-cert",
//         icon: FiAward,
//         badge: "Certificates & Progress",
//         title: "Real-time Progress Tracker & Certificate",
//         subtitle: "Track every completed lesson visually and receive a verifiable completion certificate upon course completion.",
//         points: [
//             "Visual circular progress meters for topics and courses",
//             "Milestone badges as you complete modules",
//             "Official course completion certificates",
//             "Perfect for resumes, higher education, and Japan job applications"
//         ],
//         mockupType: "certificate"
//     }
// ];

// const LMSFeatures = () => {
//     const [activeTab, setActiveTab] = useState(0);
//     const activeFeature = features[activeTab];

//     return (
//         <section id="features" className="py-6 sm:py-8 md:py-10 bg-slate-50 relative overflow-hidden">
//             {/* Ambient glows */}
//             <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-100/60 rounded-full blur-3xl pointer-events-none" />
//             <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
//                 {/* Section Header */}
//                 <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
//                     <p className="uppercase tracking-[0.25em] text-[#C41E2E] font-bold text-xs sm:text-sm mb-3">
//                         Project Features
//                     </p>
//                     <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1E39] tracking-tight">
//                         Built Specially for Fast &amp; Effective Japanese Learning
//                     </h2>
//                     <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
//                         Discover the specialized learning tools developed to make mastering Japanese accessible, engaging, and comprehensive.
//                     </p>
//                 </div>

//                 {/* Feature Selector Tabs */}
//                 <div className="flex items-center justify-start lg:justify-center gap-2 pb-2 overflow-x-auto no-scrollbar mb-6 sm:mb-8">
//                     {features.map((feat, idx) => {
//                         const Icon = feat.icon;
//                         const isSelected = activeTab === idx;
//                         return (
//                             <button
//                                 key={feat.id}
//                                 onClick={() => setActiveTab(idx)}
//                                 className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
//                                     isSelected 
//                                         ? "bg-[#0B1E39] text-white shadow-lg shadow-blue-950/20" 
//                                         : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200"
//                                 }`}
//                             >
//                                 <Icon className={isSelected ? "text-rose-400" : "text-slate-500"} size={17} />
//                                 <span>{feat.badge}</span>
//                             </button>
//                         );
//                     })}
//                 </div>

//                 {/* Interactive Feature Display Card */}
//                 <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/90 shadow-xl">
//                     <AnimatePresence mode="wait">
//                         <motion.div
//                             key={activeFeature.id}
//                             initial={{ opacity: 0, y: 15 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: -15 }}
//                             transition={{ duration: 0.3 }}
//                             className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
//                         >
//                             {/* Left: Text Information */}
//                             <div className="lg:col-span-6 space-y-6">
//                                 <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#C41E2E] uppercase tracking-wider">
//                                     <activeFeature.icon size={15} />
//                                     <span>{activeFeature.badge}</span>
//                                 </div>

//                                 <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1E39] leading-tight">
//                                     {activeFeature.title}
//                                 </h3>

//                                 <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
//                                     {activeFeature.subtitle}
//                                 </p>

//                                 <div className="space-y-3 pt-2">
//                                     {activeFeature.points.map((pt, i) => (
//                                         <div key={i} className="flex items-start gap-3">
//                                             <div className="w-5 h-5 rounded-full bg-red-100 text-[#C41E2E] flex items-center justify-center shrink-0 mt-0.5">
//                                                 <FiCheckCircle size={13} />
//                                             </div>
//                                             <span className="text-sm sm:text-base font-medium text-slate-700">{pt}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>

//                             {/* Right: Interactive UI Mockup Space / Visual Representation */}
//                             <div className="lg:col-span-6">
//                                 <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1E39] to-slate-950 p-5 sm:p-7 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
                                    
//                                     {/* Mockup 1: Lesson Player */}
//                                     {activeFeature.mockupType === "player" && (
//                                         <div className="space-y-4">
//                                             <div className="flex items-center justify-between border-b border-white/10 pb-3">
//                                                 <div className="flex items-center gap-2">
//                                                     <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
//                                                     <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
//                                                     <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
//                                                     <span className="text-xs text-slate-400 font-mono ml-2">Lesson Player • Module 02</span>
//                                                 </div>
//                                                 <span className="text-xs font-semibold text-rose-300">1080p HD</span>
//                                             </div>

//                                             {/* Video simulation window */}
//                                             <div className="h-44 sm:h-52 rounded-xl bg-slate-800/90 flex flex-col items-center justify-center relative overflow-hidden border border-white/10">
//                                                 <div className="w-14 h-14 rounded-full bg-[#C41E2E] text-white flex items-center justify-center shadow-lg animate-pulse">
//                                                     <FiPlayCircle size={32} />
//                                                 </div>
//                                                 <p className="text-xs text-slate-300 mt-3 font-medium">Japanese Particles: は, が, を, に</p>
//                                                 <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400">
//                                                     <span>08:45 / 22:30</span>
//                                                     <span className="flex items-center gap-1"><FiClock size={11} /> Speed: 1.0x</span>
//                                                 </div>
//                                             </div>

//                                             {/* Resources attached */}
//                                             <div className="grid grid-cols-2 gap-2 text-xs">
//                                                 <div className="p-2.5 rounded-lg bg-white/10 flex items-center gap-2 border border-white/10">
//                                                     <FiBook className="text-rose-300 shrink-0" />
//                                                     <span className="truncate">Grammar Notes.pdf</span>
//                                                 </div>
//                                                 <div className="p-2.5 rounded-lg bg-white/10 flex items-center gap-2 border border-white/10">
//                                                     <FiFileText className="text-blue-300 shrink-0" />
//                                                     <span className="truncate">Vocabulary_List.txt</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Mockup 2: Speaking Lab */}
//                                     {activeFeature.mockupType === "speaking" && (
//                                         <div className="space-y-4">
//                                             <div className="flex items-center justify-between border-b border-white/10 pb-3">
//                                                 <span className="text-xs text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
//                                                     <FiRadio className="animate-pulse" /> Speaking Practice Studio
//                                                 </span>
//                                                 <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Mic Ready</span>
//                                             </div>

//                                             <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
//                                                 <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Target Phrase:</span>
//                                                 <p className="text-lg font-bold text-white font-mono">
//                                                     はじめまして、よろしくお願いします。
//                                                 </p>
//                                                 <p className="text-xs text-rose-300">
//                                                     Hajimemashite, yoroshiku onegaishimasu. (Nice to meet you!)
//                                                 </p>
//                                             </div>

//                                             <div className="flex items-center justify-center gap-4 py-3">
//                                                 <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
//                                                     <FiMic size={22} />
//                                                 </div>
//                                                 <div className="flex-1 space-y-1">
//                                                     <div className="flex justify-between text-xs text-slate-300">
//                                                         <span>Recording audio...</span>
//                                                         <span className="text-emerald-400 font-bold">98% Clarity</span>
//                                                     </div>
//                                                     <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
//                                                         <div className="bg-gradient-to-r from-red-500 to-emerald-400 h-full w-[85%] rounded-full" />
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
//                                                 <FiCheckCircle className="shrink-0" />
//                                                 <span>Great pitch accent! Natural Tokyo standard pronunciation.</span>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Mockup 3: Quiz Engine */}
//                                     {activeFeature.mockupType === "quiz" && (
//                                         <div className="space-y-4">
//                                             <div className="flex items-center justify-between border-b border-white/10 pb-3">
//                                                 <span className="text-xs text-slate-300 font-bold">Question 4 of 10</span>
//                                                 <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded flex items-center gap-1">
//                                                     <FiClock size={11} /> 00:45s
//                                                 </span>
//                                             </div>

//                                             <div className="p-4 rounded-xl bg-white/5 border border-white/10">
//                                                 <p className="text-sm font-semibold text-slate-200">
//                                                     Choose the correct particle:
//                                                 </p>
//                                                 <p className="text-base font-bold text-white mt-1">
//                                                     わたしは 日本語 <span className="text-rose-400 underline font-bold px-1">[ ? ]</span> べんきょうします。
//                                                 </p>
//                                             </div>

//                                             <div className="grid grid-cols-2 gap-2.5">
//                                                 <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-slate-300">
//                                                     A) に (ni)
//                                                 </div>
//                                                 <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500 text-xs font-semibold text-emerald-300 flex items-center justify-between">
//                                                     <span>B) を (wo/o)</span>
//                                                     <FiCheckCircle size={13} />
//                                                 </div>
//                                                 <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-slate-300">
//                                                     C) で (de)
//                                                 </div>
//                                                 <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-slate-300">
//                                                     D) と (to)
//                                                 </div>
//                                             </div>

//                                             <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
//                                                 <FiCheckCircle size={14} className="shrink-0" />
//                                                 <span>Correct! Object marker particle &apos;を&apos; indicates studying Japanese.</span>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Mockup 4: Certificate */}
//                                     {activeFeature.mockupType === "certificate" && (
//                                         <div className="space-y-4">
//                                             <div className="flex items-center justify-between border-b border-white/10 pb-3">
//                                                 <span className="text-xs text-slate-300 font-bold">Credential Verification</span>
//                                                 <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
//                                                     Status: 100% Completed
//                                                 </span>
//                                             </div>

//                                             {/* Certificate card mockup */}
//                                             <div className="p-4 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-center space-y-2 relative">
//                                                 <div className="w-10 h-10 mx-auto rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
//                                                     <FiAward size={20} />
//                                                 </div>
//                                                 <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">Certificate of Completion</p>
//                                                 <h4 className="text-sm font-bold text-white">Comprehensive Japanese Language Program</h4>
//                                                 <p className="text-xs text-rose-300">Awarded to: Certified Japanese Learner</p>
//                                                 <div className="pt-2 text-[10px] text-slate-400 font-mono">
//                                                     Certificate ID: NLMS-2026-JP8839 • Verified
//                                                 </div>
//                                             </div>

//                                             <div className="flex items-center justify-between text-xs pt-1">
//                                                 <span className="text-slate-400">PDF Available &amp; Share on LinkedIn</span>
//                                                 <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-slate-200 text-xs font-semibold select-none cursor-default">
//                                                     <FiDownload size={13} />
//                                                     <span>PDF Available</span>
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     )}

//                                 </div>
//                             </div>

//                         </motion.div>
//                     </AnimatePresence>
//                 </div>

//             </div>
//         </section>
//     );
// };

// export default LMSFeatures;

/* New  */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FiPlayCircle, 
    FiMic, 
    FiCheckSquare, 
    FiAward, 
    FiBook, 
    FiFileText, 
    FiClock, 
    FiDownload, 
    FiBarChart2, 
    FiVolume2,
    FiCheckCircle,
    FiRadio
} from "react-icons/fi";


const features = [
    {
        id: "lesson-player",
        icon: FiPlayCircle,
        badge: "Technical Learning",
        title: "Interactive Engineering Lessons & Learning Resources",
        subtitle: "Access structured engineering lessons, technical videos, study materials, and practical learning resources through one unified platform.",
        points: [
            "Video-based technical lessons and demonstrations",
            "Engineering study materials and PDF resources",
            "Structured modules with topic-wise learning content",
            "Track lesson completion and learning progress"
        ],
        mockupType: "player"
    },
    {
        id: "speaking-lab",
        icon: FiMic,
        badge: "Practical Training",
        title: "Hands-On Technical Training & Project Practice",
        subtitle: "Strengthen your technical knowledge through practical exercises, project-based learning, and guided training activities.",
        points: [
            "Practical engineering exercises and assignments",
            "Hands-on project development activities",
            "Technical problem-solving practice",
            "Improve skills through practical learning"
        ],
        mockupType: "speaking"
    },
    {
        id: "quiz-engine",
        icon: FiCheckSquare,
        badge: "Assessment & Evaluation",
        title: "Technical Assessments & Knowledge Evaluation",
        subtitle: "Evaluate your technical understanding through structured quizzes, assignments, and assessments with performance tracking.",
        points: [
            "Topic-wise technical quizzes and assessments",
            "Multiple-choice knowledge evaluation",
            "Instant assessment results and score tracking",
            "Identify strengths and improvement areas"
        ],
        mockupType: "quiz"
    },
    {
        id: "progress-cert",
        icon: FiAward,
        badge: "Progress & Certification",
        title: "Training Progress Tracking & Course Certification",
        subtitle: "Monitor your training journey, complete assigned modules, and receive a course completion certificate after successfully meeting the training requirements.",
        points: [
            "Visual course and module completion tracking",
            "Monitor trainee learning performance",
            "Course completion status and certificates",
            "Maintain records of completed training programs"
        ],
        mockupType: "certificate"
    }
];


const LMSFeatures = () => {
    const [activeTab, setActiveTab] = useState(0);
    const activeFeature = features[activeTab];

    return (
        <section id="features" className="py-6 sm:py-8 md:py-10 bg-white relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-100/60 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                    <p className="uppercase tracking-[0.25em] text-[#C41E2E] font-bold text-xs sm:text-sm mb-3">
                        Our Training Features
                    </p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1E39] tracking-tight">
                     Everything You Need for Professional Engineering Training
                    </h2>
                    {/*
                    <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                        Discover the specialized learning tools developed to make mastering Japanese accessible, engaging, and comprehensive.
                    </p>
                    */}
                </div>

                {/* Feature Selector Tabs */}
                <div className="flex items-center justify-start lg:justify-center gap-2 pb-2 overflow-x-auto no-scrollbar mb-4 sm:mb-5">
                    {features.map((feat, idx) => {
                        const Icon = feat.icon;
                        const isSelected = activeTab === idx;
                        return (
                            <button
                                key={feat.id}
                                onClick={() => setActiveTab(idx)}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                    isSelected 
                                        ? "bg-[#0B1E39] text-white shadow-lg shadow-blue-950/20" 
                                        : "bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200"
                                }`}
                            >
                                <Icon className={isSelected ? "text-rose-400" : "text-slate-500"} size={17} />
                                <span>{feat.badge}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Interactive Feature Display Card */}
                <div className="bg-white rounded-3xl p-6 sm:py-7 sm:px-10 lg:py-8 lg:px-12 border border-slate-200/90 shadow-xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFeature.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                        >
                            {/* Left: Text Information */}
                            <div className="lg:col-span-6 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#C41E2E] uppercase tracking-wider">
                                    <activeFeature.icon size={15} />
                                    <span>{activeFeature.badge}</span>
                                </div>

                                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0B1E39] leading-snug">
                                    {activeFeature.title}
                                </h3>

                                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                                    {activeFeature.subtitle}
                                </p>

                                <div className="space-y-3 pt-2">
                                    {activeFeature.points.map((pt, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-red-100 text-[#C41E2E] flex items-center justify-center shrink-0 mt-0.5">
                                                <FiCheckCircle size={13} />
                                            </div>
                                            <span className="text-sm sm:text-base font-medium text-slate-700">{pt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Interactive UI Mockup Space / Visual Representation */}
                          
<div className="lg:col-span-6">
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1E39] to-slate-950 p-5 sm:p-7 text-white shadow-2xl border border-slate-800 relative overflow-hidden">

        {/* Mockup 1: Engineering Course Player */}
        {activeFeature.mockupType === "player" && (
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                        <span className="text-xs text-slate-400 font-mono ml-2">
                            Engineering Course • Module 02
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-rose-300">
                        Course Active
                    </span>
                </div>

                {/* Video simulation window */}
                <div className="h-44 sm:h-52 rounded-xl bg-slate-800/90 flex flex-col items-center justify-center relative overflow-hidden border border-white/10">
                    <div className="w-14 h-14 rounded-full bg-[#C41E2E] text-white flex items-center justify-center shadow-lg animate-pulse">
                        <FiPlayCircle size={32} />
                    </div>

                    <p className="text-xs text-slate-300 mt-3 font-medium">
                        Engineering Fundamentals & Technical Concepts
                    </p>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400">
                        <span>08:45 / 22:30</span>
                        <span className="flex items-center gap-1">
                            <FiClock size={11} /> Speed: 1.0x
                        </span>
                    </div>
                </div>

                {/* Resources attached */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white/10 flex items-center gap-2 border border-white/10">
                        <FiBook className="text-rose-300 shrink-0" />
                        <span className="truncate">Engineering_Notes.pdf</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/10 flex items-center gap-2 border border-white/10">
                        <FiFileText className="text-blue-300 shrink-0" />
                        <span className="truncate">Technical_Guide.pdf</span>
                    </div>
                </div>
            </div>
        )}

        {/* Mockup 2: Trainee Enrollment */}
        {activeFeature.mockupType === "speaking" && (
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <FiRadio className="animate-pulse" />
                        Trainee Enrollment
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        Enrollment Active
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                        Trainee Details:
                    </span>

                    <p className="text-lg font-bold text-white">
                        Amit Sharma
                    </p>

                    <p className="text-xs text-rose-300">
                        Trainee ID: AQ001
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                            <p className="text-[11px] text-slate-400">Selected Course</p>
                            <p className="text-xs font-semibold text-white mt-1">
                                Web Development
                            </p>
                        </div>

                        <div>
                            <p className="text-[11px] text-slate-400">Enrollment Date</p>
                            <p className="text-xs font-semibold text-white mt-1">
                                12 Nov 2026
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 py-3">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
                        <FiCheckSquare size={22} />
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs text-slate-300">
                            <span>Enrollment Progress</span>
                            <span className="text-emerald-400 font-bold">100%</span>
                        </div>

                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-emerald-400 h-full w-full rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                    <FiCheckCircle className="shrink-0" />
                    <span>Trainee successfully enrolled in the selected course.</span>
                </div>
            </div>
        )}

        {/* Mockup 3: Technical Assessment */}
        {activeFeature.mockupType === "quiz" && (
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs text-slate-300 font-bold">
                        Question 04 of 20
                    </span>

                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <FiClock size={11} /> 00:45s
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm font-semibold text-slate-200">
                        Technical Knowledge Assessment:
                    </p>

                    <p className="text-base font-bold text-white mt-2">
                        Which of the following is used to structure a web page?
                        <span className="text-rose-400 underline font-bold px-1">
                            [ ? ]
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-slate-300">
                        A) CSS
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500 text-xs font-semibold text-emerald-300 flex items-center justify-between">
                        <span>B) HTML</span>
                        <FiCheckCircle size={13} />
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-slate-300">
                        C) JavaScript
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/10 border border-white/10 text-xs font-semibold text-slate-300">
                        D) SQL
                    </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                    <FiCheckCircle size={14} className="shrink-0" />
                    <span>Correct! HTML is used to structure web pages.</span>
                </div>
            </div>
        )}

        {/* Mockup 4: Training Progress & Certificate */}
        {activeFeature.mockupType === "certificate" && (
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs text-slate-300 font-bold">
                        Training Progress
                    </span>

                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        Status: In Progress
                    </span>
                </div>

                {/* Progress Card */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 text-center space-y-2 relative">
                    <div className="w-10 h-10 mx-auto rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                        <FiAward size={20} />
                    </div>

                    <p className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">
                        Trainee Performance
                    </p>

                    <h4 className="text-sm font-bold text-white">
                        Engineering Training Program
                    </h4>

                    <p className="text-xs text-rose-300">
                        Trainee: Amit Sharma
                    </p>

                    <div className="pt-3">
                        <div className="flex justify-between text-xs text-slate-300 mb-2">
                            <span>Course Completion</span>
                            <span className="text-emerald-400 font-bold">85%</span>
                        </div>

                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-red-500 to-emerald-400 h-full w-[85%] rounded-full" />
                        </div>
                    </div>

                    <div className="pt-2 text-[10px] text-slate-400 font-mono">
                        Completed Modules: 8/10
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">
                        Certificate Status: Pending
                    </span>

                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-slate-200 text-xs font-semibold select-none cursor-default">
                        <FiAward size={13} />
                        <span>View Progress</span>
                    </span>
                </div>
            </div>
        )}

    </div>
</div>


                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
};

export default LMSFeatures;
