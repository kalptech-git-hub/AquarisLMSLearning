import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    FiVolume2,
    FiMic,
    FiChevronLeft,
    FiChevronRight,
    FiCheck,
    FiX,
    FiStar,
    FiZap,
    FiTarget,
    FiList,
    FiArrowLeft
} from "react-icons/fi";

/*
    Embedded, sidebar-sized version of the Speaking Practice UI.
    Renders inline inside CourseCurriculum.jsx's "speaking" tab —
    no route, no useParams. courseId is passed in as a prop.

    Progress (difficulty, phrase index, correct count) is persisted
    server-side via /api/speaking/progress so it follows the student
    across devices/browsers instead of living only in localStorage.
*/

/*
    Long-phrase fix: instead of letting the card grow (min-h + break-words,
    which caused the width/height jitter you hit before), the card height
    is fixed and the Japanese text's font-size steps down based on
    character length. Translation/reading is clamped to 2 lines with
    ellipsis instead of wrapping the card taller.
*/
const getJapaneseFontSizeClass = (text = "") => {
    const len = text.length;
    if (len <= 6) return "text-3xl";
    if (len <= 12) return "text-2xl";
    if (len <= 20) return "text-xl";
    return "text-lg";
};

const SpeakingPracticeTab = ({ courseId }) => {
    const [allExercises, setAllExercises] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState(null); // null = picker step

    const [isRecording, setIsRecording] = useState(false);
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

    const recognitionRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    const currentExercise = exercises[currentIndex];

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/speaking/course/student/${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setAllExercises(response.data.exercises || []);
            } else {
                setAllExercises([]);
            }
        } catch (error) {
            console.error("Failed to fetch speaking exercises:", error);
            toast.error("Failed to load speaking practice.");
            setAllExercises([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchExercises();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // Once exercises are loaded, try to resume from saved server-side progress
    useEffect(() => {
        if (loading || allExercises.length === 0) return;

        const fetchProgress = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/speaking/progress/${courseId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const saved = response.data.success ? response.data.progress : null;

                if (saved && saved.speaking_difficulty) {
                    const filtered =
                        saved.speaking_difficulty === "ALL"
                            ? allExercises
                            : allExercises.filter(e => e.speaking_difficulty === saved.speaking_difficulty);

                    if (filtered.length > 0) {
                        setExercises(filtered);
                        setSelectedLevel(saved.speaking_difficulty);
                        setCurrentIndex(
                            Math.min(saved.speaking_phrase_index || 0, filtered.length - 1)
                        );
                        setCorrectCount(saved.speaking_correct_count || 0);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch speaking progress:", error);
                // fail silently — student just sees the picker
            }
        };

        fetchProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, allExercises]);

    useEffect(() => {
        setResult(null);
    }, [currentIndex]);

    // Persist progress (debounced) whenever it changes
    const latestProgressRef = useRef({ selectedLevel, currentIndex, correctCount });

    // Keep the ref in sync with latest values (needed for the unmount flush below)
    useEffect(() => {
        latestProgressRef.current = { selectedLevel, currentIndex, correctCount };
    }, [selectedLevel, currentIndex, correctCount]);

    const saveProgressNow = async (difficulty, phraseIndex, correctCountVal) => {
        if (!difficulty) return;
        try {
            const token = sessionStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/speaking/progress`,
                { courseId, difficulty, phraseIndex, correctCount: correctCountVal },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Failed to save speaking progress:", error);
        }
    };

    // Persist progress (debounced) whenever it changes
    useEffect(() => {
        if (!selectedLevel) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            saveProgressNow(selectedLevel, currentIndex, correctCount);
        }, 600); // debounce so rapid Next/Previous clicks don't spam the API

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLevel, currentIndex, correctCount]);

    // Flush any pending save immediately on unmount (tab switch / navigating away),
    // so the debounce timer above doesn't get silently cancelled mid-flight
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            const { selectedLevel: lvl, currentIndex: idx, correctCount: cc } = latestProgressRef.current;
            if (lvl) saveProgressNow(lvl, idx, cc);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const counts = {
        EASY: allExercises.filter(e => e.speaking_difficulty === "EASY").length,
        MEDIUM: allExercises.filter(e => e.speaking_difficulty === "MEDIUM").length,
        HARD: allExercises.filter(e => e.speaking_difficulty === "HARD").length,
        ALL: allExercises.length
    };

    const handleSelectLevel = (level) => {
        const filtered =
            level === "ALL"
                ? allExercises
                : allExercises.filter(e => e.speaking_difficulty === level);

        setExercises(filtered);
        setSelectedLevel(level);
        setCurrentIndex(0);
        setCorrectCount(0);
    };

    const handleBackToPicker = async () => {
        setSelectedLevel(null);

        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/speaking/progress/${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Failed to reset speaking progress:", error);
        }
    };

    const handleListen = () => {
        if (!currentExercise) return;
        if (!("speechSynthesis" in window)) {
            toast.error("Text-to-speech isn't supported in this browser.");
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentExercise.speaking_phrase_japanese);
        utterance.lang = "ja-JP";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const handlePractice = () => {
        if (!currentExercise) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech recognition isn't supported in this browser. Try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "ja-JP";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        setIsRecording(true);
        setResult(null);

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsRecording(false);
            setChecking(true);

            try {
                const token = sessionStorage.getItem("token");
                const response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/speaking/compare`,
                    { speaking_exercise_id: currentExercise.speaking_exercise_id, transcript },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setResult({ isCorrect: response.data.isCorrect, recognized: response.data.recognized });
                    if (response.data.isCorrect) {
                        setCorrectCount((prev) => prev + 1);
                    }
                }
            } catch (error) {
                console.error("Failed to compare speech:", error);
                toast.error("Failed to check pronunciation. Try again.");
            } finally {
                setChecking(false);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
            if (event.error === "not-allowed") toast.error("Microphone permission denied.");
            else if (event.error === "no-speech") toast.error("No speech detected. Try again.");
            else toast.error("Speech recognition failed. Try again.");
        };

        recognition.onend = () => setIsRecording(false);
        recognition.start();
    };

    const goToPrevious = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
    const goToNext = () => currentIndex < exercises.length - 1 && setCurrentIndex(currentIndex + 1);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#35175a]"></div>
                <span className="ml-3 text-sm text-gray-600 font-medium">Loading...</span>
            </div>
        );
    }

    if (allExercises.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500 text-sm">No speaking exercises available for this course yet.</p>
            </div>
        );
    }

    /* ---------- Level picker step ---------- */
    if (!selectedLevel) {
        const levels = [
            { key: "EASY", label: "Easy", desc: "Basic words to start with", icon: FiStar, bg: "bg-teal-50", text: "text-teal-700", pill: "bg-teal-600" },
            { key: "MEDIUM", label: "Medium", desc: "Everyday phrases", icon: FiZap, bg: "bg-orange-50", text: "text-orange-700", pill: "bg-orange-500" },
            { key: "HARD", label: "Hard", desc: "Full sentences and questions", icon: FiTarget, bg: "bg-rose-50", text: "text-rose-700", pill: "bg-rose-600" },
            { key: "ALL", label: "All Levels", desc: "Practice everything in order", icon: FiList, bg: "bg-[#35175a]/10", text: "text-[#35175a]", pill: "bg-[#35175a]" }
        ];

        return (
            <div className="p-4">
                <p className="text-sm text-gray-500 mb-4">Choose a difficulty to begin practicing.</p>

                <div className="space-y-2.5">
                    {levels.map(({ key, label, desc, icon: Icon, bg, text, pill }) => {
                        const count = counts[key];
                        const disabled = count === 0;

                        return (
                            <button
                                key={key}
                                onClick={() => !disabled && handleSelectLevel(key)}
                                disabled={disabled}
                                className={`w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition text-left ${
                                    disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 shrink-0 rounded-lg ${bg} flex items-center justify-center`}>
                                        <Icon className={text} size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm text-gray-800 truncate">{label}</p>
                                        <p className="text-xs text-gray-500 truncate">{desc}</p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    /* ---------- Practice step ---------- */
    return (
        <div className="flex flex-col h-full">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={handleBackToPicker}
                        className="p-1 -ml-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                        title="Back to difficulty selection"
                    >
                        <FiArrowLeft size={16} />
                    </button>
                    <p className="text-xs font-semibold text-gray-500">
                        {selectedLevel === "ALL" ? "All levels" : selectedLevel.charAt(0) + selectedLevel.slice(1).toLowerCase()}
                        {" "}&middot;{" "}Phrase {currentIndex + 1} of {exercises.length}
                    </p>
                </div>

                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full"
                        style={{
                            width: `${((currentIndex + 1) / exercises.length) * 100}%`,
                            background: "linear-gradient(90deg, #ec4899, #8b5cf6)"
                        }}
                    />
                </div>
                <p className="text-[11px] text-emerald-600 font-medium mt-1.5">
                    {correctCount} / {exercises.length} correct
                </p>
            </div>

            <div className="p-4">
                {/* Fixed-height card: text scales down instead of the box growing */}
                <div className="bg-slate-50 rounded-xl border border-gray-200 h-48 flex flex-col items-center justify-center px-4 overflow-hidden">
                    <p className={`font-semibold text-center leading-snug max-w-full ${getJapaneseFontSizeClass(currentExercise?.speaking_phrase_japanese)}`}>
                        {currentExercise?.speaking_phrase_japanese}
                    </p>
                    <p
                        className="text-xs text-gray-500 text-center mt-2 max-w-full px-2"
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                        }}
                    >
                        {currentExercise?.speaking_phrase_pronunciation}
                        {currentExercise?.speaking_phrase_translation && (
                            <> &middot; "{currentExercise.speaking_phrase_translation}"</>
                        )}
                    </p>
                </div>

                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleListen}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition cursor-pointer text-sm"
                    >
                        <FiVolume2 size={15} /> Listen
                    </button>
                    <button
                        onClick={handlePractice}
                        disabled={isRecording || checking}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-white transition cursor-pointer text-sm ${
                            isRecording ? "bg-[#5a3a7a]" : "bg-[#271042] hover:bg-[#35175a]"
                        } disabled:opacity-70`}
                    >
                        <FiMic size={15} />
                        {isRecording ? "Listening..." : checking ? "Checking..." : "Practice"}
                    </button>
                </div>

                {result && (
                    <div
                        className={`mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs ${
                            result.isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                    >
                        {result.isCorrect ? <FiCheck size={14} /> : <FiX size={14} />}
                        <span className="text-center">
                            {result.isCorrect ? "Correct — well pronounced!" : `Try again — you said "${result.recognized}"`}
                        </span>
                    </div>
                )}

                <div className="flex gap-2 mt-3">
                    <button
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-40 cursor-pointer text-sm"
                    >
                        <FiChevronLeft size={15} /> Previous
                    </button>
                    <button
                        onClick={goToNext}
                        disabled={currentIndex === exercises.length - 1}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#271042] text-white hover:bg-[#35175a] transition disabled:opacity-40 cursor-pointer text-sm"
                    >
                        Next <FiChevronRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpeakingPracticeTab;