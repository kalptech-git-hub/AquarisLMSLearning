/* Previous */
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { 
//     FiVolume2, 
//     FiCheckCircle, 
//     FiXCircle, 
//     FiRotateCcw, 
//     FiPlay, 
//     FiMic, 
//     FiBookOpen, 
//     FiAward, 
//     FiCheck,
//     FiStar
// } from "react-icons/fi";

// const sampleQuiz = {
//     question: "Which of the following is the polite Japanese expression for 'Thank you very much'?",
//     romaji: "Polite Japanese Gratitude Expression",
//     options: [
//         { id: "A", text: "おはようございます", romaji: "Ohayou gozaimasu", meaning: "Good morning", correct: false },
//         { id: "B", text: "ありがとうございます", romaji: "Arigatou gozaimasu", meaning: "Thank you very much", correct: true },
//         { id: "C", text: "さようなら", romaji: "Sayounara", meaning: "Goodbye", correct: false },
//         { id: "D", text: "すみません", romaji: "Sumimasen", meaning: "Excuse me / Sorry", correct: false }
//     ],
//     explanation: "ありがとうございます (Arigatou gozaimasu) is the standard polite way to express gratitude in formal and everyday Japanese."
// };

// const audioPhrases = [
//     { jp: "こんにちは", romaji: "Konnichiwa", en: "Hello / Good afternoon", level: "Essential" },
//     { jp: "ありがとうございます", romaji: "Arigatou gozaimasu", en: "Thank you very much", level: "Essential" },
//     { jp: "いただきます", romaji: "Itadakimasu", en: "Expression before eating", level: "Culture" },
//     { jp: "お疲れ様でした", romaji: "Otsukaresama deshita", en: "Thank you for your hard work", level: "Workplace" }
// ];

// const LMSPreview = () => {
//     const [activeDemo, setActiveDemo] = useState("quiz"); // "quiz" | "speaking" | "curriculum"
    
//     // Quiz state
//     const [selectedOption, setSelectedOption] = useState(null);
//     const [hasSubmitted, setHasSubmitted] = useState(false);

//     // Audio state
//     const [playingPhrase, setPlayingPhrase] = useState(null);

//     const handleOptionSelect = (optionId) => {
//         if (hasSubmitted) return;
//         setSelectedOption(optionId);
//     };

//     const handleQuizSubmit = () => {
//         if (!selectedOption) return;
//         setHasSubmitted(true);
//     };

//     const handleQuizReset = () => {
//         setSelectedOption(null);
//         setHasSubmitted(false);
//     };

//     const playJapaneseAudio = (text) => {
//         setPlayingPhrase(text);
//         if ('speechSynthesis' in window) {
//             window.speechSynthesis.cancel();
//             const utterance = new SpeechSynthesisUtterance(text);
//             utterance.lang = "ja-JP";
//             utterance.rate = 0.85;
//             utterance.onend = () => setPlayingPhrase(null);
//             utterance.onerror = () => setPlayingPhrase(null);
//             window.speechSynthesis.speak(utterance);
//         } else {
//             setTimeout(() => setPlayingPhrase(null), 1500);
//         }
//     };

//     return (
//         <section id="demo" className="py-6 sm:py-8 md:py-10 bg-white relative border-y border-slate-200/80">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
//                 {/* Section Header */}
//                 <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
//                     <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#C41E2E] text-xs font-bold uppercase tracking-wider mb-3">
//                         <FiStar />
//                         <span>Interactive Experience</span>
//                     </div>
//                     <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1E39] tracking-tight">
//                         Try the Interactive Learning Tools Now
//                     </h2>
//                     <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
//                         Experience firsthand how our interactive assessments and audio labs make mastering Japanese natural and fun.
//                     </p>
//                 </div>

//                 {/* Demo Navigation Tabs */}
//                 <div className="flex justify-center mb-6 sm:mb-8">
//                     <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 gap-2">
//                         <button
//                             onClick={() => setActiveDemo("quiz")}
//                             className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
//                                 activeDemo === "quiz"
//                                     ? "bg-white text-[#0B1E39] shadow-md"
//                                     : "text-slate-600 hover:text-slate-900"
//                             }`}
//                         >
//                             <FiCheckCircle size={16} className={activeDemo === "quiz" ? "text-[#C41E2E]" : ""} />
//                             <span>Interactive Quiz Demo</span>
//                         </button>

//                         <button
//                             onClick={() => setActiveDemo("speaking")}
//                             className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
//                                 activeDemo === "speaking"
//                                     ? "bg-white text-[#0B1E39] shadow-md"
//                                     : "text-slate-600 hover:text-slate-900"
//                             }`}
//                         >
//                             <FiVolume2 size={16} className={activeDemo === "speaking" ? "text-[#C41E2E]" : ""} />
//                             <span>Audio Pronunciation Lab</span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Demo Card Content */}
//                 <div className="max-w-4xl mx-auto">
//                     {activeDemo === "quiz" && (
//                         <motion.div
//                             initial={{ opacity: 0, scale: 0.98 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800"
//                         >
//                             <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
//                                 <div className="flex items-center gap-2">
//                                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
//                                     <span className="text-xs uppercase font-bold tracking-wider text-rose-300">
//                                         Live Mini-Assessment
//                                     </span>
//                                 </div>
//                                 <span className="text-xs text-slate-400 font-mono">1 Question • Instant Result</span>
//                             </div>

//                             <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-relaxed">
//                                 {sampleQuiz.question}
//                             </h3>
//                             <p className="text-xs text-slate-400 mb-6 font-mono">{sampleQuiz.romaji}</p>

//                             {/* Options Grid */}
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
//                                 {sampleQuiz.options.map((opt) => {
//                                     const isChosen = selectedOption === opt.id;
//                                     let btnClasses = "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ";
                                    
//                                     if (!hasSubmitted) {
//                                         btnClasses += isChosen 
//                                             ? "bg-[#C41E2E] border-[#C41E2E] text-white shadow-lg" 
//                                             : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200";
//                                     } else {
//                                         if (opt.correct) {
//                                             btnClasses += "bg-emerald-600/30 border-emerald-500 text-emerald-200";
//                                         } else if (isChosen && !opt.correct) {
//                                             btnClasses += "bg-rose-600/30 border-rose-500 text-rose-200";
//                                         } else {
//                                             btnClasses += "bg-white/5 border-white/5 opacity-50 text-slate-400";
//                                         }
//                                     }

//                                     return (
//                                         <button
//                                             key={opt.id}
//                                             onClick={() => handleOptionSelect(opt.id)}
//                                             className={btnClasses}
//                                         >
//                                             <div className="flex items-center justify-between mb-2">
//                                                 <span className="w-7 h-7 rounded-lg bg-white/10 font-bold text-xs flex items-center justify-center">
//                                                     {opt.id}
//                                                 </span>
//                                                 {hasSubmitted && opt.correct && (
//                                                     <FiCheckCircle className="text-emerald-400" size={18} />
//                                                 )}
//                                                 {hasSubmitted && isChosen && !opt.correct && (
//                                                     <FiXCircle className="text-rose-400" size={18} />
//                                                 )}
//                                             </div>
//                                             <div>
//                                                 <p className="text-base sm:text-lg font-bold font-mono">{opt.text}</p>
//                                                 <p className="text-xs text-slate-300">{opt.romaji} • {opt.meaning}</p>
//                                             </div>
//                                         </button>
//                                     );
//                                 })}
//                             </div>

//                             {/* Action Bar */}
//                             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
//                                 {!hasSubmitted ? (
//                                     <button
//                                         disabled={!selectedOption}
//                                         onClick={handleQuizSubmit}
//                                         className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
//                                             selectedOption 
//                                                 ? "bg-[#C41E2E] text-white hover:bg-red-700 shadow-md" 
//                                                 : "bg-white/10 text-slate-500 cursor-not-allowed"
//                                         }`}
//                                     >
//                                         Check Answer
//                                     </button>
//                                 ) : (
//                                     <div className="w-full space-y-4">
//                                         <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-3">
//                                             <FiCheckCircle size={20} className="shrink-0 mt-0.5" />
//                                             <div>
//                                                 <p className="font-bold">
//                                                     {sampleQuiz.options.find(o => o.id === selectedOption)?.correct ? "🎉 正解 (Correct)!" : "Try again!"}
//                                                 </p>
//                                                 <p className="text-xs text-emerald-200 mt-1">{sampleQuiz.explanation}</p>
//                                             </div>
//                                         </div>
//                                         <button
//                                             onClick={handleQuizReset}
//                                             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
//                                         >
//                                             <FiRotateCcw size={14} />
//                                             <span>Reset Demo Quiz</span>
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         </motion.div>
//                     )}

//                     {activeDemo === "speaking" && (
//                         <motion.div
//                             initial={{ opacity: 0, scale: 0.98 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800"
//                         >
//                             <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
//                                 <div className="flex items-center gap-2">
//                                     <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
//                                     <span className="text-xs uppercase font-bold tracking-wider text-rose-300">
//                                         Native Audio Pronunciation Drill
//                                     </span>
//                                 </div>
//                                 <span className="text-xs text-slate-400">Click speaker icon to listen</span>
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 {audioPhrases.map((phrase, i) => {
//                                     const isPlaying = playingPhrase === phrase.jp;
//                                     return (
//                                         <div
//                                             key={i}
//                                             className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
//                                         >
//                                             <div>
//                                                 <div className="flex items-center justify-between mb-3">
//                                                     <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded">
//                                                         {phrase.level}
//                                                     </span>
//                                                     <button
//                                                         onClick={() => playJapaneseAudio(phrase.jp)}
//                                                         className={`p-2.5 rounded-xl transition-all cursor-pointer ${
//                                                             isPlaying 
//                                                                 ? "bg-red-500 text-white scale-110" 
//                                                                 : "bg-white/10 hover:bg-white/20 text-white"
//                                                         }`}
//                                                         title="Listen to Japanese pronunciation"
//                                                     >
//                                                         <FiVolume2 size={18} className={isPlaying ? "animate-bounce" : ""} />
//                                                     </button>
//                                                 </div>

//                                                 <h4 className="text-xl font-bold text-white font-mono mb-1">
//                                                     {phrase.jp}
//                                                 </h4>
//                                                 <p className="text-xs text-rose-200 font-medium mb-1">
//                                                     {phrase.romaji}
//                                                 </p>
//                                                 <p className="text-xs text-slate-400">
//                                                     &ldquo;{phrase.en}&rdquo;
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>

//                             <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
//                                 <p className="text-xs text-slate-300">
//                                     💡 Inside our enrolled courses, you can also <strong>record your own voice</strong> via microphone and practice sentence by sentence!
//                                 </p>
//                             </div>
//                         </motion.div>
//                     )}
//                 </div>

//             </div>
//         </section>
//     );
// };

// export default LMSPreview;

/* New */
import { useState } from "react";
import { motion } from "framer-motion";
import { 
    FiVolume2, 
    FiCheckCircle, 
    FiXCircle, 
    FiRotateCcw, 
    FiPlay, 
    FiMic, 
    FiBookOpen, 
    FiAward, 
    FiCheck,
    FiStar
} from "react-icons/fi";

const sampleQuiz = {
    question: "Which of the following is the polite Japanese expression for 'Thank you very much'?",
    romaji: "Polite Japanese Gratitude Expression",
    options: [
        { id: "A", text: "おはようございます", romaji: "Ohayou gozaimasu", meaning: "Good morning", correct: false },
        { id: "B", text: "ありがとうございます", romaji: "Arigatou gozaimasu", meaning: "Thank you very much", correct: true },
        { id: "C", text: "さようなら", romaji: "Sayounara", meaning: "Goodbye", correct: false },
        { id: "D", text: "すみません", romaji: "Sumimasen", meaning: "Excuse me / Sorry", correct: false }
    ],
    explanation: "ありがとうございます (Arigatou gozaimasu) is the standard polite way to express gratitude in formal and everyday Japanese."
};

const audioPhrases = [
    { jp: "こんにちは", romaji: "Konnichiwa", en: "Hello / Good afternoon", level: "Essential" },
    { jp: "ありがとうございます", romaji: "Arigatou gozaimasu", en: "Thank you very much", level: "Essential" },
    { jp: "いただきます", romaji: "Itadakimasu", en: "Expression before eating", level: "Culture" },
    { jp: "お疲れ様でした", romaji: "Otsukaresama deshita", en: "Thank you for your hard work", level: "Workplace" }
];

const LMSPreview = () => {
    const [activeDemo, setActiveDemo] = useState("quiz"); // "quiz" | "speaking" | "curriculum"
    
    // Quiz state
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Audio state
    const [playingPhrase, setPlayingPhrase] = useState(null);

    const handleOptionSelect = (optionId) => {
        if (hasSubmitted) return;
        setSelectedOption(optionId);
    };

    const handleQuizSubmit = () => {
        if (!selectedOption) return;
        setHasSubmitted(true);
    };

    const handleQuizReset = () => {
        setSelectedOption(null);
        setHasSubmitted(false);
    };

    const playJapaneseAudio = (text) => {
        setPlayingPhrase(text);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "ja-JP";
            utterance.rate = 0.85;
            utterance.onend = () => setPlayingPhrase(null);
            utterance.onerror = () => setPlayingPhrase(null);
            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(() => setPlayingPhrase(null), 1500);
        }
    };

    return (
        <section id="demo" className="py-6 sm:py-8 md:py-10 bg-white relative border-y border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#C41E2E] text-xs font-bold uppercase tracking-wider mb-3">
                        <FiStar />
                        <span>Interactive Experience</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1E39] tracking-tight">
                        Try the Interactive Learning Tools Now
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                        Experience firsthand how our interactive assessments and audio labs make mastering Japanese natural and fun.
                    </p>
                </div>

                {/* Demo Navigation Tabs */}
                <div className="flex justify-center mb-6 sm:mb-8">
                    <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 gap-2">
                        <button
                            onClick={() => setActiveDemo("quiz")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                                activeDemo === "quiz"
                                    ? "bg-white text-[#0B1E39] shadow-md"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <FiCheckCircle size={16} className={activeDemo === "quiz" ? "text-[#C41E2E]" : ""} />
                            <span>Interactive Quiz Demo</span>
                        </button>

                        <button
                            onClick={() => setActiveDemo("speaking")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                                activeDemo === "speaking"
                                    ? "bg-white text-[#0B1E39] shadow-md"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <FiVolume2 size={16} className={activeDemo === "speaking" ? "text-[#C41E2E]" : ""} />
                            <span>Audio Pronunciation Lab</span>
                        </button>
                    </div>
                </div>

                {/* Demo Card Content */}
                <div className="max-w-5xl mx-auto">
                    {activeDemo === "quiz" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-5 sm:py-5 sm:px-8 shadow-xl border border-slate-800"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs uppercase font-bold tracking-wider text-rose-300">
                                        Live Mini-Assessment
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">1 Question • Instant Result</span>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-white mb-1 leading-snug">
                                {sampleQuiz.question}
                            </h3>
                            <p className="text-xs text-slate-400 mb-4 font-mono">{sampleQuiz.romaji}</p>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                {sampleQuiz.options.map((opt) => {
                                    const isChosen = selectedOption === opt.id;
                                    let btnClasses = "p-3 sm:py-2.5 sm:px-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ";
                                    
                                    if (!hasSubmitted) {
                                        btnClasses += isChosen 
                                            ? "bg-[#C41E2E] border-[#C41E2E] text-white shadow-lg" 
                                            : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200";
                                    } else {
                                        if (opt.correct) {
                                            btnClasses += "bg-emerald-600/30 border-emerald-500 text-emerald-200";
                                        } else if (isChosen && !opt.correct) {
                                            btnClasses += "bg-rose-600/30 border-rose-500 text-rose-200";
                                        } else {
                                            btnClasses += "bg-white/5 border-white/5 opacity-50 text-slate-400";
                                        }
                                    }

                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleOptionSelect(opt.id)}
                                            className={btnClasses}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="w-6 h-6 rounded-md bg-white/10 font-bold text-xs flex items-center justify-center">
                                                    {opt.id}
                                                </span>
                                                {hasSubmitted && opt.correct && (
                                                    <FiCheckCircle className="text-emerald-400" size={16} />
                                                )}
                                                {hasSubmitted && isChosen && !opt.correct && (
                                                    <FiXCircle className="text-rose-400" size={16} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm sm:text-base font-bold font-mono">{opt.text}</p>
                                                <p className="text-[11px] text-slate-300">{opt.romaji} • {opt.meaning}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Action Bar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                                {!hasSubmitted ? (
                                    <button
                                        disabled={!selectedOption}
                                        onClick={handleQuizSubmit}
                                        className={`w-full sm:w-auto px-6 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                                            selectedOption 
                                                ? "bg-[#C41E2E] text-white hover:bg-red-700 shadow-md" 
                                                : "bg-white/10 text-slate-500 cursor-not-allowed"
                                        }`}
                                    >
                                        Check Answer
                                    </button>
                                ) : (
                                    <div className="w-full space-y-3">
                                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-2.5">
                                            <FiCheckCircle size={18} className="shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold">
                                                    {sampleQuiz.options.find(o => o.id === selectedOption)?.correct ? (
                                                        <span className="flex items-center gap-1.5">
                                                            {/* was: 🎉 */}
                                                            <FiCheckCircle aria-hidden="true" />
                                                            正解 (Correct)!
                                                        </span>
                                                    ) : "Try again!"}
                                                </p>
                                                <p className="text-xs text-emerald-200 mt-1">{sampleQuiz.explanation}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleQuizReset}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
                                        >
                                            <FiRotateCcw size={13} />
                                            <span>Reset Demo Quiz</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeDemo === "speaking" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-2xl sm:rounded-3xl bg-slate-900 text-white p-5 sm:py-5 sm:px-8 shadow-xl border border-slate-800"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                                    <span className="text-xs uppercase font-bold tracking-wider text-rose-300">
                                        Native Audio Pronunciation Drill
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400">Click speaker icon to listen</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {audioPhrases.map((phrase, i) => {
                                    const isPlaying = playingPhrase === phrase.jp;
                                    return (
                                        <div
                                            key={i}
                                            className="p-3.5 sm:py-3 sm:px-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded">
                                                        {phrase.level}
                                                    </span>
                                                    <button
                                                        onClick={() => playJapaneseAudio(phrase.jp)}
                                                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                                                            isPlaying 
                                                                ? "bg-red-500 text-white scale-110" 
                                                                : "bg-white/10 hover:bg-white/20 text-white"
                                                        }`}
                                                        title="Listen to Japanese pronunciation"
                                                    >
                                                        <FiVolume2 size={16} className={isPlaying ? "animate-bounce" : ""} />
                                                    </button>
                                                </div>

                                                <h4 className="text-lg font-bold text-white font-mono mb-0.5">
                                                    {phrase.jp}
                                                </h4>
                                                <p className="text-xs text-rose-200 font-medium mb-0.5">
                                                    {phrase.romaji}
                                                </p>
                                                <p className="text-[11px] text-slate-400">
                                                    &ldquo;{phrase.en}&rdquo;
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                <p className="text-xs text-slate-300 flex items-start justify-center gap-1.5">
                                    {/* was: 💡 */}
                                    <FiMic className="shrink-0 mt-0.5" aria-hidden="true" />
                                    <span>Inside our enrolled courses, you can also <strong>record your own voice</strong> via microphone and practice sentence by sentence!</span>
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default LMSPreview;
