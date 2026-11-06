/* Previous */
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { 
//     FiBookOpen, 
//     FiMic, 
//     FiCheckSquare, 
//     FiAward, 
//     FiCheck, 
//     FiX, 
//     FiLayers, 
//     FiTrendingUp, 
//     FiCompass,
//     FiShield
// } from "react-icons/fi";

// const pillars = [
//     {
//         id: "curriculum",
//         icon: FiBookOpen,
//         color: "from-red-500 to-rose-600",
//         tag: "Core Structure",
//         title: "Modular Step-by-Step Curriculum",
//         desc: "Structured into topics, sub-topics, high-definition video lessons, and PDF study guides designed by linguists.",
//         highlights: ["Grammar, Vocabulary & Kanji", "Multi-media lesson library", "Reference books & study guides"]
//     },
//     {
//         id: "speaking",
//         icon: FiMic,
//         color: "from-amber-500 to-orange-600",
//         tag: "Audio Lab",
//         title: "Speaking & Pronunciation Training",
//         desc: "Break through conversational hesitation with dedicated audio listening, voice recording drills, and pitch accent practice.",
//         highlights: ["Voice recording practice", "Native speaker playback", "Practical situational drills"]
//     },
//     {
//         id: "quizzes",
//         icon: FiCheckSquare,
//         color: "from-blue-600 to-indigo-700",
//         tag: "Assessments",
//         title: "Interactive Quizzes",
//         desc: "Evaluate your understanding with question banks, timed test formats, instant scores, and detailed performance breakdown.",
//         highlights: ["Timed assessment tests", "Instant scores & report", "Kanji & Particle questions"]
//     },
//     {
//         id: "progress",
//         icon: FiAward,
//         color: "from-emerald-500 to-teal-700",
//         tag: "Certificates",
//         title: "Progress Tracking & Certification",
//         desc: "Monitor your topic completion percentage and earn verifiable course completion certificates for your career and studies.",
//         highlights: ["Visual progress analytics", "Topic mastery indicators", "Official completion credentials"]
//     }
// ];

// const comparisonData = [
//     {
//         feature: "Learning Schedule",
//         traditional: "Fixed rigid hours, easy to fall behind",
//         lms: "24/7 on-demand access to video lessons & materials"
//     },
//     {
//         feature: "Speaking & Voice Practice",
//         traditional: "Limited time for individual speaking",
//         lms: "Dedicated digital speaking lab with voice recording"
//     },
//     {
//         feature: "Assessments & Quizzes",
//         traditional: "Infrequent paper tests with delayed feedback",
//         lms: "Instant digital quizzes with automated score reports"
//     },
//     {
//         feature: "Study Materials & Books",
//         traditional: "Costly physical textbooks to purchase",
//         lms: "Integrated PDFs, lesson notes & curated books"
//     },
//     {
//         feature: "Progress & Certification",
//         traditional: "Manual attendance records",
//         lms: "Automated progress tracking & verifiable certificates"
//     }
// ];

// const LMSOverview = () => {
//     const [activePillar, setActivePillar] = useState(0);

//     return (
//         <section id="overview" className="py-6 sm:py-8 md:py-10 bg-white relative">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
//                 {/* Section Header */}
//                 <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
//                     <p className="uppercase tracking-[0.25em] text-[#C41E2E] font-bold text-xs sm:text-sm mb-3">
//                         Platform Overview
//                     </p>
//                     <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1E39] tracking-tight">
//                         An All-in-One Learning Ecosystem for Japanese Fluency
//                     </h2>
//                     <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
//                         Nihongo LMS combines structured video lessons, interactive speaking exercises, automated quizzes, and verified certification into a seamless digital journey.
//                     </p>
//                 </div>

//                 {/* 4 Core Pillars Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 sm:mb-10">
//                     {pillars.map((pillar, idx) => {
//                         const Icon = pillar.icon;
//                         const isSelected = activePillar === idx;
//                         return (
//                             <motion.div
//                                 key={pillar.id}
//                                 whileHover={{ y: -6 }}
//                                 onClick={() => setActivePillar(idx)}
//                                 className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
//                                     isSelected 
//                                         ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
//                                         : "bg-slate-50/70 hover:bg-white text-slate-900 border-slate-200/80 shadow-xs hover:shadow-md"
//                                 }`}
//                             >
//                                 <div>
//                                     <div className="flex items-center justify-between mb-5">
//                                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${pillar.color} shadow-md`}>
//                                             <Icon size={22} />
//                                         </div>
//                                         <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
//                                             isSelected ? "bg-white/10 text-rose-300" : "bg-slate-200/70 text-slate-700"
//                                         }`}>
//                                             {pillar.tag}
//                                         </span>
//                                     </div>

//                                     <h3 className={`text-lg font-bold mb-2 ${isSelected ? "text-white" : "text-[#0B1E39]"}`}>
//                                         {pillar.title}
//                                     </h3>

//                                     <p className={`text-sm leading-relaxed mb-6 ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
//                                         {pillar.desc}
//                                     </p>
//                                 </div>

//                                 <div className={`pt-4 border-t ${isSelected ? "border-white/10" : "border-slate-200/80"} space-y-2`}>
//                                     {pillar.highlights.map((h, i) => (
//                                         <div key={i} className="flex items-center gap-2 text-xs">
//                                             <FiCheck className={isSelected ? "text-rose-400 shrink-0" : "text-emerald-600 shrink-0"} size={14} />
//                                             <span className={isSelected ? "text-slate-200 font-medium" : "text-slate-700 font-medium"}>{h}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </motion.div>
//                         );
//                     })}
//                 </div>

//                 {/* Comparison Card: Traditional vs Nihongo LMS */}
//                 <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1E39] to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
//                     <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                    
//                     <div className="relative z-10">
//                         <div className="text-center max-w-2xl mx-auto mb-10">
//                             <span className="text-xs uppercase font-bold tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
//                                 Why Learners Choose Us
//                             </span>
//                             <h3 className="text-2xl sm:text-3xl font-black mt-3 text-white">
//                                 Traditional Classrooms vs. Nihongo LMS
//                             </h3>
//                         </div>

//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left text-sm border-collapse">
//                                 <thead>
//                                     <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
//                                         <th className="py-4 px-4 font-semibold">Capability</th>
//                                         <th className="py-4 px-4 font-semibold text-slate-400">Traditional Classes</th>
//                                         <th className="py-4 px-4 font-bold text-rose-300">Nihongo LMS Platform</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-white/5">
//                                     {comparisonData.map((row, index) => (
//                                         <tr key={index} className="hover:bg-white/5 transition-colors">
//                                             <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
//                                                 {row.feature}
//                                             </td>
//                                             <td className="py-4 px-4 text-slate-400">
//                                                 <div className="flex items-center gap-2">
//                                                     <FiX className="text-rose-400 shrink-0" size={16} />
//                                                     <span>{row.traditional}</span>
//                                                 </div>
//                                             </td>
//                                             <td className="py-4 px-4 text-emerald-300 font-medium">
//                                                 <div className="flex items-center gap-2">
//                                                     <FiCheck className="text-emerald-400 shrink-0 font-bold" size={16} />
//                                                     <span className="text-white">{row.lms}</span>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//         </section>
//     );
// };

// export default LMSOverview;

/* New */
import { useState } from "react";
import { motion } from "framer-motion";
import { 
    FiBookOpen, 
    FiMic, 
    FiCheckSquare, 
    FiAward, 
    FiCheck, 
    FiX, 
    FiLayers, 
    FiTrendingUp, 
    FiCompass,
    FiShield
} from "react-icons/fi";

const pillars = [
    {
        id: "curriculum",
        icon: FiBookOpen,
        color: "from-red-500 to-rose-600",
        tag: "Core Structure",
        title: "Modular Step-by-Step Curriculum",
        desc: "Structured into topics, sub-topics, high-definition video lessons, and PDF study guides designed by linguists.",
        highlights: ["Grammar, Vocabulary & Kanji", "Multi-media lesson library", "Reference books & study guides"]
    },
    {
        id: "speaking",
        icon: FiMic,
        color: "from-amber-500 to-orange-600",
        tag: "Audio Lab",
        title: "Speaking & Pronunciation Training",
        desc: "Break through conversational hesitation with dedicated audio listening, voice recording drills, and pitch accent practice.",
        highlights: ["Voice recording practice", "Native speaker playback", "Practical situational drills"]
    },
    {
        id: "quizzes",
        icon: FiCheckSquare,
        color: "from-blue-600 to-indigo-700",
        tag: "Assessments",
        title: "Interactive Quizzes",
        desc: "Evaluate your understanding with question banks, timed test formats, instant scores, and detailed performance breakdown.",
        highlights: ["Timed assessment tests", "Instant scores & report", "Kanji & Particle questions"]
    },
    {
        id: "progress",
        icon: FiAward,
        color: "from-emerald-500 to-teal-700",
        tag: "Certificates",
        title: "Progress Tracking & Certification",
        desc: "Monitor your topic completion percentage and earn verifiable course completion certificates for your career and studies.",
        highlights: ["Visual progress analytics", "Topic mastery indicators", "Official completion credentials"]
    }
];

const comparisonData = [
    {
        feature: "Learning Schedule",
        traditional: "Fixed rigid hours, easy to fall behind",
        lms: "24/7 on-demand access to video lessons & materials"
    },
    {
        feature: "Speaking & Voice Practice",
        traditional: "Limited time for individual speaking",
        lms: "Dedicated digital speaking lab with voice recording"
    },
    {
        feature: "Assessments & Quizzes",
        traditional: "Infrequent paper tests with delayed feedback",
        lms: "Instant digital quizzes with automated score reports"
    },
    {
        feature: "Study Materials & Books",
        traditional: "Costly physical textbooks to purchase",
        lms: "Integrated PDFs, lesson notes & curated books"
    },
    {
        feature: "Progress & Certification",
        traditional: "Manual attendance records",
        lms: "Automated progress tracking & verifiable certificates"
    }
];

const LMSOverview = () => {
    const [activePillar, setActivePillar] = useState(0);

    return (
        <section id="overview" className="py-6 sm:py-8 md:py-10 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                    <p className="uppercase tracking-[0.25em] text-[#C41E2E] font-bold text-xs sm:text-sm mb-3">
                        Platform Overview
                    </p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1E39] tracking-tight">
                        An All-in-One Learning Ecosystem for Japanese Fluency
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                        Nihongo LMS combines structured video lessons, interactive speaking exercises, automated quizzes, and verified certification into a seamless digital journey.
                    </p>
                </div>

                {/* 4 Core Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((pillar, idx) => {
                        const Icon = pillar.icon;
                        const isSelected = activePillar === idx;
                        return (
                            <motion.div
                                key={pillar.id}
                                whileHover={{ y: -6 }}
                                onClick={() => setActivePillar(idx)}
                                className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                                    isSelected 
                                        ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                                        : "bg-slate-50/70 hover:bg-white text-slate-900 border-slate-200/80 shadow-xs hover:shadow-md"
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${pillar.color} shadow-md`}>
                                            <Icon size={22} />
                                        </div>
                                        <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${
                                            isSelected ? "bg-white/10 text-rose-300" : "bg-slate-200/70 text-slate-700"
                                        }`}>
                                            {pillar.tag}
                                        </span>
                                    </div>

                                    <h3 className={`text-lg font-bold mb-4 ${isSelected ? "text-white" : "text-[#0B1E39]"}`}>
                                        {pillar.title}
                                    </h3>

                                    {/* Description commented out to keep checkmarks prominent and concise */}
                                    {/*
                                    <p className={`text-sm leading-relaxed mb-4 ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                                        {pillar.desc}
                                    </p>
                                    */}
                                </div>

                                <div className={`pt-4 border-t ${isSelected ? "border-white/10" : "border-slate-200/80"} space-y-2.5`}>
                                    {pillar.highlights.map((h, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <FiCheck className={isSelected ? "text-rose-400 shrink-0" : "text-emerald-600 shrink-0"} size={14} />
                                            <span className={isSelected ? "text-slate-200 font-medium" : "text-slate-700 font-medium"}>{h}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Comparison Card: Traditional vs Nihongo LMS */}
                {/*
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1E39] to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <span className="text-xs uppercase font-bold tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                                Why Learners Choose Us
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-black mt-3 text-white">
                                Traditional Classrooms vs. Nihongo LMS
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                                        <th className="py-4 px-4 font-semibold">Capability</th>
                                        <th className="py-4 px-4 font-semibold text-slate-400">Traditional Classes</th>
                                        <th className="py-4 px-4 font-bold text-rose-300">Nihongo LMS Platform</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {comparisonData.map((row, index) => (
                                        <tr key={index} className="hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
                                                {row.feature}
                                            </td>
                                            <td className="py-4 px-4 text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <FiX className="text-rose-400 shrink-0" size={16} />
                                                    <span>{row.traditional}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-emerald-300 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FiCheck className="text-emerald-400 shrink-0 font-bold" size={16} />
                                                    <span className="text-white">{row.lms}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                */}

            </div>
        </section>
    );
};

export default LMSOverview;
