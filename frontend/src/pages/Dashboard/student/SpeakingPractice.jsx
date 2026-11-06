import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiVolume2, FiMic, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiStar, FiZap, FiTarget, FiList } from "react-icons/fi";

const SpeakingPractice = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [allExercises, setAllExercises] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState(null); // null = not yet chosen

    const [isRecording, setIsRecording] = useState(false);
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

    const recognitionRef = useRef(null);

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

    useEffect(() => {
        setResult(null);
    }, [currentIndex]);

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
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading speaking practice...</span>
            </div>
        );
    }

    if (allExercises.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <p className="text-gray-600 text-lg">No speaking exercises available for this course yet.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-red-600 font-medium hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    /* ---------- Level selection screen ---------- */
    if (!selectedLevel) {
       const levels = [
    { key: "EASY", label: "Easy", desc: "Basic words to start with", icon: FiStar, bg: "bg-teal-50", text: "text-teal-700", pill: "bg-teal-600" },
    { key: "MEDIUM", label: "Medium", desc: "Everyday phrases", icon: FiZap, bg: "bg-orange-50", text: "text-orange-700", pill: "bg-orange-500" },
    { key: "HARD", label: "Hard", desc: "Full sentences and questions", icon: FiTarget, bg: "bg-rose-50", text: "text-rose-700", pill: "bg-rose-600" },
    { key: "ALL", label: "All Levels", desc: "Practice everything in order", icon: FiList, bg: "bg-[#3C3489]/10", text: "text-[#3C3489]", pill: "bg-[#3C3489]" }
];
        return (
            <div className="w-full max-w-2xl mx-auto">
                <div
                    className="rounded-t-xl p-8 text-white"
                    style={{ background: "linear-gradient(135deg, #3C3489 0%, #993C1D 100%)" }}
                >
                    <p className="text-xs font-semibold tracking-wider uppercase text-white/75 mb-2">
                        Speaking Practice
                    </p>
                    <h1 className="text-2xl font-bold mb-1">Pronunciation Practice</h1>
                    <p className="text-sm text-white/85">Choose a difficulty to begin practicing.</p>
                </div>

                <div className="bg-white rounded-b-xl shadow border border-gray-200 border-t-0 p-6 space-y-3">
                    {levels.map(({ key, label, desc, icon: Icon, bg, text, pill }) => {
                        const count = counts[key];
                        const disabled = count === 0;

                        return (
                            <button
                                key={key}
                                onClick={() => !disabled && handleSelectLevel(key)}
                                disabled={disabled}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition text-left ${
                                    disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                                        <Icon className={text} size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{label}</p>
                                        <p className="text-xs text-gray-500">{desc}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-3 py-1 rounded-full text-white ${pill}`}>
                                    {count} phrase{count !== 1 ? "s" : ""}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    /* ---------- Completion screen ---------- */
    if (currentIndex === exercises.length - 1 && result) {
        // still show normal card; completion handled after Next Phrase on last item — optional enhancement below
    }

    /* ---------- Practice screen ---------- */
    return (
        <div className="w-full max-w-2xl mx-auto px-6">
            <div
                className="rounded-t-xl p-8 text-white"
                style={{ background: "linear-gradient(135deg, #3C3489 0%, #993C1D 100%)" }}
            >
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold tracking-wider uppercase text-white/75">
                        Speaking Practice
                    </p>
                    <button
                        onClick={() => setSelectedLevel(null)}
                        className="text-xs text-white/80 hover:text-white underline"
                    >
                        Change level
                    </button>
                </div>
                <h1 className="text-2xl font-bold mb-1">Pronunciation Practice</h1>
                <p className="text-sm text-white/85 mb-5">
                    {selectedLevel === "ALL" ? "All levels" : selectedLevel.charAt(0) + selectedLevel.slice(1).toLowerCase()} &middot; {exercises.length} phrases
                </p>

                <div className="flex gap-3">
                    <div className="bg-white/10 rounded-lg px-4 py-2 flex-1">
                        <p className="text-xs text-white/70">Phrases</p>
                        <p className="text-lg font-semibold">{exercises.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg px-4 py-2 flex-1">
                        <p className="text-xs text-white/70">Progress</p>
                        <p className="text-lg font-semibold">{currentIndex + 1} / {exercises.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg px-4 py-2 flex-1">
                        <p className="text-xs text-white/70">Correct</p>
                        <p className="text-lg font-semibold">{correctCount} / {exercises.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow border border-gray-200 border-t-0 p-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">Phrase {currentIndex + 1} of {exercises.length}</p>
                </div>

                <div className="bg-slate-50 rounded-xl border border-gray-200 p-8 text-center mb-4 min-h-[280px] flex flex-col justify-center w-full overflow-hidden">
                    <p className="text-3xl font-semibold mb-2 text-center max-w-full whitespace-normal break-words">
                        {currentExercise?.speaking_phrase_japanese}
                    </p>
                    <p className="text-sm text-gray-500 mb-6 px-4 text-center max-w-full break-words">
                        {currentExercise?.speaking_phrase_pronunciation}
                        {currentExercise?.speaking_phrase_translation && (
                            <> &middot; "{currentExercise.speaking_phrase_translation}"</>
                        )}
                    </p>

                    <div className="flex justify-center gap-3 mb-5">
                        <button
                            onClick={handleListen}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition cursor-pointer"
                        >
                            <FiVolume2 /> Listen
                        </button>
                        <button
                            onClick={handlePractice}
                            disabled={isRecording || checking}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white transition cursor-pointer ${
                                isRecording ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
                            } disabled:opacity-70`}
                        >
                            <FiMic />
                            {isRecording ? "Listening..." : checking ? "Checking..." : "Practice"}
                        </button>
                    </div>

                    {result && (
                        <div
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${result.isCorrect
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                        >
                            {result.isCorrect ? <FiCheck /> : <FiX />}
                            <span className="text-sm text-center">
                                {result.isCorrect
                                    ? "Correct — well pronounced!"
                                    : `Try again — you said "${result.recognized}"`}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={goToPrevious}
                        disabled={currentIndex === 0}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-40 cursor-pointer"
                    >
                        <FiChevronLeft /> Previous
                    </button>
                    <button
                        onClick={goToNext}
                        disabled={currentIndex === exercises.length - 1}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-40 cursor-pointer"
                    >
                        Next Phrase <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpeakingPractice;