import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FiClock,
  FiAward,
  FiHelpCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPlay,
  FiArrowRight,
  FiCheck,
  FiList,
  FiCalendar,
  FiMaximize2,
  FiMinimize2
} from "react-icons/fi";
import { toast } from "react-toastify";
import { TbListCheck } from "react-icons/tb";

const QuizPlayer = ({
  lessonId,
  training,
  onLessonSelect,
  nextLesson,
  onComplete,
  isCompleted = false
}) => {
  // State: "loading" | "intro" | "taking" | "submitting" | "result" | "error"
  const [viewState, setViewState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Quiz metadata & history
  const [quizData, setQuizData] = useState(null);
  const [attemptHistory, setAttemptHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Active attempt state
  const [currentAttemptId, setCurrentAttemptId] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Selected answers: { [question_id]: [option_id, ...] }
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const timerRef = useRef(null);
  const hasAutoSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // Submission & Result
  const [submissionResult, setSubmissionResult] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Fullscreen Container & State
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    try {
      const elem = containerRef.current;
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        if (elem?.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem?.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem?.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem?.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        } else {
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error, fallback to CSS fullscreen:", err);
      setIsFullscreen((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        if (
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        ) {
          if (document.exitFullscreen) document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  // Clean up native fullscreen if unmounting while active
  useEffect(() => {
    return () => {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        try {
          if (document.exitFullscreen) document.exitFullscreen();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Initial Fetch: Load Quiz Config for this Lesson
  useEffect(() => {
    if (!lessonId) return;
    loadQuizForLesson(lessonId);
  }, [lessonId]);

  const loadQuizForLesson = async (id) => {
    try {
      setViewState("loading");
      setErrorMessage("");
      const token = sessionStorage.getItem("token");

      // 1. Fetch quiz details specifically for this lesson
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/lesson/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const quiz = res.data?.quiz;
      if (!quiz) {
        setErrorMessage("No quiz content found for this lesson.");
        setViewState("error");
        return;
      }

      setQuizData(quiz);

      // 2. Fetch attempt history for this quiz
      if (quiz.quiz_id) {
        fetchAttemptHistory(quiz.quiz_id);
      } else {
        setViewState("intro");
      }
    } catch (err) {
      console.error("Failed to load quiz details:", err);
      setErrorMessage("Failed to load quiz details. Please try again.");
      setViewState("error");
    }
  };

  const fetchAttemptHistory = async (quizId) => {
    try {
      setLoadingHistory(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/${quizId}/attempts/history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const history = res.data?.attempts || [];
      setAttemptHistory(history);

      // If user already passed, trigger onComplete
      const latestAttempt = history[0];
      if (latestAttempt && latestAttempt.attempt_status === "completed" && latestAttempt.passed) {
        onComplete?.();
      }
      setViewState("intro");
    } catch (err) {
      console.error("Failed to load attempt history:", err);
      setViewState("intro");
    } finally {
      setLoadingHistory(false);
    }
  };

  // ----------------------------------------------------
  // START QUIZ ATTEMPT
  // ----------------------------------------------------
  const handleStartQuiz = async () => {
    if (!quizData?.quiz_id) return;

    const currentNow = new Date();
    if (quizData.quiz_start_datetime && new Date(quizData.quiz_start_datetime) > currentNow) {
      toast.error(`This quiz will open on ${new Date(quizData.quiz_start_datetime).toLocaleString()}.`, {
        toastId: "quiz-not-open"
      });
      return;
    }
    if (quizData.quiz_end_datetime && new Date(quizData.quiz_end_datetime) < currentNow) {
      toast.error(`This quiz closed on ${new Date(quizData.quiz_end_datetime).toLocaleString()}.`, {
        toastId: "quiz-closed"
      });
      return;
    }

    try {
      setViewState("loading");
      const token = sessionStorage.getItem("token");

      // 1. POST to start attempt
      const startRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/${quizData.quiz_id}/attempts`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newAttemptId = startRes.data?.attemptId;
      const newAttemptNum = startRes.data?.attemptNumber || 1;
      setCurrentAttemptId(newAttemptId);
      setAttemptNumber(newAttemptNum);

      // 2. GET questions for this attempt
      const attemptRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/attempts/${newAttemptId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const loadedQuestions = attemptRes.data?.questions || [];
      if (!loadedQuestions.length) {
        toast.error("This quiz currently has no questions.");
        setViewState("intro");
        return;
      }

      setQuestions(loadedQuestions);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      hasAutoSubmittedRef.current = false;
      isSubmittingRef.current = false;

      // 3. Initialize Timer if quiz duration is set
      const durationMins = Number(quizData.quiz_duration_minutes);
      if (durationMins && durationMins > 0) {
        setSecondsRemaining(durationMins * 60);
      } else {
        setSecondsRemaining(null);
      }

      setViewState("taking");
    } catch (err) {
      console.error("Failed to start quiz attempt:", err);
      const msg = err.response?.data?.message || "Failed to start quiz attempt.";
      toast.error(msg, { toastId: "quiz-start-error" });
      setViewState("intro");
    }
  };

  // ----------------------------------------------------
  // TIMER COUNTDOWN
  // ----------------------------------------------------
  useEffect(() => {
    if (viewState !== "taking" || secondsRemaining === null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState]);

  // ----------------------------------------------------
  // AUTO-SUBMIT ON TIMEOUT
  // ----------------------------------------------------
  useEffect(() => {
    if (viewState === "taking" && secondsRemaining === 0 && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      toast.warning("Time's up! Automatically submitting your quiz...", {
        toastId: "quiz-timeout"
      });
      handleSubmitQuiz(true);
    }
  }, [secondsRemaining, viewState]);

  // ----------------------------------------------------
  // ANSWER SELECTION HANDLERS
  // ----------------------------------------------------
  const handleSelectOption = (questionId, optionId, questionType) => {
    setSelectedAnswers((prev) => {
      const currentSelected = prev[questionId] || [];

      if (questionType === "multiple_mcq") {
        // Toggle selection
        if (currentSelected.includes(optionId)) {
          return {
            ...prev,
            [questionId]: currentSelected.filter((id) => id !== optionId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentSelected, optionId]
          };
        }
      } else {
        // Single MCQ or True/False: replace selection
        return {
          ...prev,
          [questionId]: [optionId]
        };
      }
    });
  };

  // ----------------------------------------------------
  // SUBMIT QUIZ ATTEMPT
  // ----------------------------------------------------
  const handleSubmitQuiz = async (isAuto = false) => {
    if (!currentAttemptId || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      if (timerRef.current) clearInterval(timerRef.current);
      setShowConfirmSubmit(false);
      setViewState("submitting");

      // Format answers payload
      const formattedAnswers = Object.entries(selectedAnswers).map(
        ([qId, optIds]) => ({
          question_id: Number(qId),
          selected_option_ids: optIds
        })
      );

      const token = sessionStorage.getItem("token");
      const submitRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/attempts/${currentAttemptId}/submit`,
        {
          answers: formattedAnswers
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSubmissionResult(submitRes.data);

      // Fetch detailed attempt result for review
      const resultRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/attempts/${currentAttemptId}/result`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAttemptDetails(resultRes.data);

      const resultToastId = `quiz-result-${currentAttemptId}`;
      if (submitRes.data?.passed) {
        toast.success("Congratulations! You passed the quiz!", {
          toastId: resultToastId
        });
        onComplete?.();
      } else {
        toast.info("Quiz submitted. Check your score below.", {
          toastId: resultToastId
        });
      }

      // Refresh history in background
      if (quizData?.quiz_id) {
        axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/quizzes/${quizData.quiz_id}/attempts/history`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        ).then(hRes => {
          setAttemptHistory(hRes.data?.attempts || []);
        }).catch(() => {});
      }

      setViewState("result");
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      toast.error(err.response?.data?.message || "Failed to submit quiz attempt.", {
        toastId: "quiz-submit-error"
      });
      setViewState("taking");
      isSubmittingRef.current = false;
    }
  };

  // ----------------------------------------------------
  // HELPERS
  // ----------------------------------------------------
  const formatTime = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined) return "--:--";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const currentQ = questions[currentQIndex];
  const totalQuestionsCount = questions.length;
  const answeredCount = Object.keys(selectedAnswers).filter(
    (qId) => (selectedAnswers[qId] || []).length > 0
  ).length;
  const unansweredCount = totalQuestionsCount - answeredCount;

  // Schedule & Window Checks
  const now = new Date();
  const startDateTime = quizData?.quiz_start_datetime ? new Date(quizData.quiz_start_datetime) : null;
  const endDateTime = quizData?.quiz_end_datetime ? new Date(quizData.quiz_end_datetime) : null;
  const isBeforeStart = startDateTime && startDateTime > now;
  const isAfterEnd = endDateTime && endDateTime < now;

  // Max attempts check
  const allowedAttempts = Number(quizData?.allowed_attempts || 1);
  const usedAttemptsCount = attemptHistory.length;
  const attemptsRemaining = Math.max(0, allowedAttempts - usedAttemptsCount);
  const hasAttemptsLeft = attemptsRemaining > 0;
  const canAttempt = hasAttemptsLeft && !isBeforeStart && !isAfterEnd;

  // Best score calculation
  const bestAttempt = attemptHistory.reduce((best, curr) => {
    if (!best || Number(curr.percentage || 0) > Number(best.percentage || 0)) {
      return curr;
    }
    return best;
  }, null);

  // ----------------------------------------------------
  // RENDER CONTENT
  // ----------------------------------------------------
  const renderContent = () => {
    // 1. Loading & Submitting States
    if (viewState === "loading" || viewState === "submitting") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-14 h-14 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-ping opacity-75" />
            <div className="w-14 h-14 rounded-full border-4 border-t-[#35175a] border-r-[#35175a] border-b-transparent border-l-transparent animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {viewState === "submitting" ? "Grading your Quiz..." : "Loading Quiz..."}
          </h3>
          <p className="text-xs text-slate-500">
            {viewState === "submitting"
              ? "Evaluating your answers and calculating your score"
              : "Preparing questions, instructions, and settings"}
          </p>
        </div>
      );
    }

    // 2. Error State
    if (viewState === "error") {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[450px] p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-4">
            <FiAlertCircle size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Quiz Unavailable</h3>
          <p className="text-xs text-slate-600 max-w-md mb-6">{errorMessage}</p>
          <button
            onClick={() => loadQuizForLesson(lessonId)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-slate-300"
          >
            <FiRefreshCw size={14} /> Retry
          </button>
        </div>
      );
    }

    // 3. Screen 1 - Quiz Intro / Overview
    if (viewState === "intro") {
      const durationMinutes = Number(quizData?.quiz_duration_minutes);
      const passingMarksPercent = Number(quizData?.passing_marks || 70);

      return (
        <div className="flex-1 w-full h-full overflow-y-auto bg-white p-5 sm:p-7 lg:p-8 flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* Header Badge, Title & Instructions + Corner Fullscreen Button */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#35175a] border border-purple-200/80 flex items-center gap-1.5">
                    <FiList size={13} className="text-[#35175a]" /> Lesson Quiz
                  </span>
                  {isBeforeStart && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <FiClock size={13} /> Opens on {startDateTime.toLocaleString()}
                    </span>
                  )}
                  {isAfterEnd && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <FiAlertCircle size={13} /> Closed on {endDateTime.toLocaleString()}
                    </span>
                  )}
                  {!isBeforeStart && !isAfterEnd && bestAttempt?.passed && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <FiCheckCircle size={13} /> Completed & Passed
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold text-[#1e1b4b] tracking-tight">
                  {quizData?.quiz_title || "Lesson Quiz Assessment"}
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mt-1">
                  {quizData?.quiz_instructions || "Basic greetings used in daily conversation. Answer all questions to unlock the next lesson."}
                </p>
              </div>

              {/* Corner Full Screen Option Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 text-slate-700 hover:text-[#35175a] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen"}
              >
                {isFullscreen ? (
                  <>
                    <FiMinimize2 size={15} className="text-[#35175a]" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <FiMaximize2 size={15} className="text-[#35175a]" />
                    <span className="hidden sm:inline">Full Screen</span>
                  </>
                )}
              </button>
            </div>

            {/* 4 Stats Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              
              {/* Time Limit */}
              <div className="bg-[#FAFAFE] border border-purple-100/70 rounded-xl p-3.5 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 font-normal block mb-1">Time limit</span>
                <span className="text-sm sm:text-base font-bold text-[#1e1b4b]">
                  {durationMinutes > 0 ? `${durationMinutes} mins` : "No limit"}
                </span>
              </div>

              {/* Passing Score */}
              <div className="bg-[#FAFAFE] border border-purple-100/70 rounded-xl p-3.5 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 font-normal block mb-1">Passing score</span>
                <span className="text-sm sm:text-base font-bold text-[#1e1b4b]">{passingMarksPercent}%</span>
              </div>

              {/* Questions Count */}
              <div className="bg-[#FAFAFE] border border-purple-100/70 rounded-xl p-3.5 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 font-normal block mb-1">Questions</span>
                <span className="text-sm sm:text-base font-bold text-[#1e1b4b]">
                  {quizData?.total_questions || quizData?.questions?.length || "1"}
                </span>
              </div>

              {/* Attempts Left */}
              <div className="bg-[#FAFAFE] border border-purple-100/70 rounded-xl p-3.5 flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 font-normal block mb-1">Attempts left</span>
                <span className="text-sm sm:text-base font-bold text-[#1e1b4b]">
                  {attemptsRemaining} of {allowedAttempts}
                </span>
              </div>
            </div>

            {/* Integrated Scrollable Previous Attempts List */}
            {attemptHistory.length > 0 && (
              <div className="pt-3 space-y-2.5 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <FiCalendar className="text-[#35175a]" /> Your Previous Attempts ({attemptHistory.length})
                </h4>

                <div className="max-h-44 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {attemptHistory.map((att, idx) => {
                    const isPassed = !!att.passed;
                    return (
                      <div
                        key={att.attempt_id || idx}
                        className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs hover:bg-slate-100/60 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isPassed
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                : "bg-rose-100 text-rose-700 border border-rose-300"
                            }`}
                          >
                            #{att.attempt_number || idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              Score: {Number(att.score || 0).toFixed(2)} pts ({Number(att.percentage || 0).toFixed(1)}%)
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {att.submitted_at
                                ? new Date(att.submitted_at).toLocaleString()
                                : "Completed"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isPassed ? "Passed" : "Not Passed"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Start Quiz Action Footer */}
          <div className="pt-4 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              {isBeforeStart ? (
                <span className="text-amber-600 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                  <FiClock size={14} /> Scheduled to open on {startDateTime.toLocaleString()}. Please check back then.
                </span>
              ) : isAfterEnd ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                  <FiAlertCircle size={14} /> This quiz closed on {endDateTime.toLocaleString()} and is no longer accepting submissions.
                </span>
              ) : canAttempt ? (
                <span>Click below to begin. The timer will start immediately.</span>
              ) : (
                <span className="text-amber-600 font-semibold">
                  You have used all {allowedAttempts} allowed attempts for this quiz.
                </span>
              )}
            </div>

            {canAttempt ? (
              <button
                onClick={handleStartQuiz}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#35175a] hover:bg-[#271042] active:bg-[#1f0c35] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
              >
                <FiPlay size={15} className="fill-current" />
                {usedAttemptsCount > 0 ? "Retake Quiz" : "Start Quiz"}
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm cursor-not-allowed border border-slate-200"
              >
                {isBeforeStart ? "Quiz Not Available Yet" : isAfterEnd ? "Quiz Closed" : "No Attempts Remaining"}
              </button>
            )}
          </div>
        </div>
      );
    }

    // 4. Screen 2 - Active Quiz Taking
    if (viewState === "taking" && currentQ) {
      const qType = currentQ.question_type || "single_mcq";
      const isMultiChoice = qType === "multiple_mcq";
      const isTrueFalse = qType === "true_false";

      const currentSelected = selectedAnswers[currentQ.question_id] || [];
      const isTimerUrgent = secondsRemaining !== null && secondsRemaining < 120;
      const progressPercent = Math.round(((currentQIndex + 1) / totalQuestionsCount) * 100);

      return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 text-slate-900">
          
          {/* Top Header Bar: Progress, Timer, Submit & Fullscreen Option */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
            
            {/* Left: Question Counter & Progress */}
            <div className="flex items-center gap-4 min-w-0">
              <div>
                <span className="text-[11px] font-semibold text-purple-700 block">
                  {quizData?.quiz_title || "Lesson Quiz"}
                </span>
                <h3 className="text-sm font-semibold text-slate-800">
                  Question {currentQIndex + 1} of {totalQuestionsCount}
                </h3>
              </div>

              {/* Mini Progress Bar */}
              <div className="hidden sm:block w-32 md:w-48 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-[#35175a] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Right: Live Countdown Timer & Submit Button & Fullscreen Option */}
            <div className="flex items-center gap-2 sm:gap-3">
              {secondsRemaining !== null && (
                <div
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all ${
                    isTimerUrgent
                      ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse shadow-xs"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  <FiClock size={14} className={isTimerUrgent ? "text-rose-600" : "text-[#35175a]"} />
                  <span>{formatTime(secondsRemaining)} left</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#35175a] hover:bg-[#271042] text-white text-xs font-bold shadow-xs cursor-pointer transition"
              >
                Submit Quiz
              </button>

              {/* Corner Full Screen Option */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 text-slate-700 hover:text-[#35175a] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen"}
              >
                {isFullscreen ? (
                  <>
                    <FiMinimize2 size={15} className="text-[#35175a]" />
                    <span className="hidden md:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <FiMaximize2 size={15} className="text-[#35175a]" />
                    <span className="hidden md:inline">Full Screen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Linear Progress Bar for Mobile */}
          <div className="sm:hidden w-full bg-slate-200 h-1">
            <div
              className="bg-[#35175a] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Main Question Body Area (Clean White Center Card) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl space-y-6 my-auto bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              
              {/* Question Header & Prompt */}
              <div className="space-y-3 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#35175a] border border-purple-200 uppercase tracking-wider">
                    {isTrueFalse ? "True / False" : isMultiChoice ? "Multiple Choice (Select all correct)" : "Single Choice"}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {Number(currentQ.question_marks || 5).toFixed(2)} pts
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-semibold text-slate-800 leading-snug">
                  {currentQ.question_text || `Question ${currentQIndex + 1}`}
                </h2>
              </div>

              {/* Options Choices Grid (Udemy Style Light Cards) */}
              <div className="space-y-3 pt-1">
                {(currentQ.options || []).map((opt, oIdx) => {
                  const optId = opt.option_id;
                  const isSelected = currentSelected.includes(optId);

                  return (
                    <div
                      key={optId || oIdx}
                      onClick={() => handleSelectOption(currentQ.question_id, optId, qType)}
                      className={`group relative p-4 rounded-xl border transition-all duration-150 flex items-center gap-3.5 cursor-pointer select-none ${
                        isSelected
                          ? "bg-purple-50/70 border-2 border-[#35175a] text-[#35175a] shadow-xs"
                          : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 text-slate-800"
                      }`}
                    >
                      {/* Option Selector Icon */}
                      {isMultiChoice ? (
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "bg-[#35175a] border-[#35175a] text-white"
                              : "border-slate-400 group-hover:border-purple-500 bg-white"
                          }`}
                        >
                          {isSelected && <FiCheck size={13} />}
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? "border-[#35175a] bg-purple-50"
                              : "border-slate-400 group-hover:border-purple-500 bg-white"
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#35175a]" />}
                        </div>
                      )}

                      {/* Option Text */}
                      <span className={`text-sm leading-relaxed ${isSelected ? "text-slate-900 font-bold" : "text-slate-700 font-medium"}`}>
                        {opt.option_text || `Option ${oIdx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Bottom Navigation & Question Jump Palette */}
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-xs">
            
            {/* Previous Button */}
            <button
              type="button"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                currentQIndex === 0
                  ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed"
                  : "border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              }`}
            >
              <FiChevronLeft size={16} /> Previous
            </button>

            {/* Question Dot Jump Indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {questions.map((q, idx) => {
                const isAnswered = (selectedAnswers[q.question_id] || []).length > 0;
                const isCurrent = idx === currentQIndex;

                return (
                  <button
                    key={q.question_id || idx}
                    type="button"
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#35175a] text-white ring-2 ring-purple-300 shadow-sm"
                        : isAnswered
                          ? "bg-purple-100 text-[#35175a] border border-purple-300 hover:bg-purple-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                    }`}
                    title={`Question ${idx + 1} (${isAnswered ? "Answered" : "Unanswered"})`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Next or Submit Button */}
            {currentQIndex < totalQuestionsCount - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQIndex(prev => Math.min(totalQuestionsCount - 1, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-[#35175a] hover:bg-[#271042] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition"
              >
                Next Question <FiChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition"
              >
                Submit Quiz <FiCheck size={16} />
              </button>
            )}

          </div>

          {/* Confirmation Modal Before Submission (Light Theme) */}
          {showConfirmSubmit && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#35175a] flex items-center justify-center mx-auto">
                  <TbListCheck size={24} />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">Ready to submit your quiz?</h3>
                  <p className="text-xs text-slate-600">
                    {unansweredCount > 0
                      ? `You have ${unansweredCount} unanswered question(s). Are you sure you want to finish?`
                      : "You have answered all questions. Your score will be evaluated immediately."}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 flex justify-between border border-slate-200">
                  <span>Answered: <strong className="text-slate-900">{answeredCount} of {totalQuestionsCount}</strong></span>
                  <span>Remaining: <strong className="text-slate-900">{unansweredCount}</strong></span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                  >
                    Continue Answering
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitQuiz(false)}
                    className="flex-1 py-2.5 rounded-xl bg-[#35175a] hover:bg-[#271042] text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Yes, Submit Now
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      );
    }

    // 5. Screen 3 - Quiz Result / Summary
    if (viewState === "result") {
      const score = Number(submissionResult?.score || 0);
      const totalMarks = Number(submissionResult?.total_marks || quizData?.total_marks || 0);
      const percentage = Number(submissionResult?.percentage || (totalMarks > 0 ? (score / totalMarks) * 100 : 0)).toFixed(1);
      const passingThreshold = Number(quizData?.passing_marks || 70);
      const isPassed = Boolean(submissionResult?.passed) || Number(percentage) >= passingThreshold;

      const answersList = attemptDetails?.answers || [];

      return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center bg-slate-50 relative">
          
          {/* Corner Fullscreen Button on Result Screen */}
          <div className="w-full max-w-2xl flex justify-end mb-3">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/50 text-slate-700 hover:text-[#35175a] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen"}
            >
              {isFullscreen ? (
                <>
                  <FiMinimize2 size={15} className="text-[#35175a]" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <FiMaximize2 size={15} className="text-[#35175a]" />
                  <span>Full Screen</span>
                </>
              )}
            </button>
          </div>

          <div className="w-full max-w-2xl space-y-6 my-auto">
            
            {/* Result Banner Card (Clean White with Green/Red Accents) */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 text-center space-y-6 shadow-sm bg-white ${
                isPassed
                  ? "border-emerald-300 bg-gradient-to-b from-emerald-50/40 to-white"
                  : "border-rose-300 bg-gradient-to-b from-rose-50/40 to-white"
              }`}
            >
              {/* Circular Percentage Ring */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (289 * Math.min(100, Math.max(0, Number(percentage)))) / 100}
                    className={isPassed ? "stroke-emerald-600" : "stroke-rose-600"}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-extrabold text-slate-900">{percentage}%</span>
                </div>
              </div>

              {/* Title & Status */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
                  {isPassed ? " Quiz Passed!" : " Quiz Not Passed"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  You scored <strong className="text-slate-900">{score.toFixed(2)}</strong> out of{" "}
                  <strong className="text-slate-900">{totalMarks.toFixed(2)}</strong> marks · Passing was {passingThreshold}%
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {isPassed ? (
                  nextLesson ? (
                    <button
                      onClick={() => onLessonSelect?.(nextLesson)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#35175a] hover:bg-[#271042] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      Continue to Next Lesson <FiArrowRight size={15} />
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-xl">
                      ✓ Course Section Completed
                    </span>
                  )
                ) : (
                  canAttempt && (
                    <button
                      onClick={handleStartQuiz}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#35175a] hover:bg-[#271042] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw size={14} /> Retake Quiz ({attemptsRemaining} attempts left)
                    </button>
                  )
                )}

                <button
                  onClick={() => setViewState("intro")}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition border border-slate-300"
                >
                  Back to Quiz Details
                </button>
              </div>
            </div>

            {/* Question Breakdown List (Clean White Cards) */}
            {answersList.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
                  Question Breakdown
                </h4>

                <div className="space-y-2">
                  {answersList.map((ans, idx) => {
                    const correct = !!ans.is_correct;
                    return (
                      <div
                        key={ans.answer_id || idx}
                        className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between text-xs gap-3 shadow-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            Q{idx + 1}. {ans.question_text || `Question ${idx + 1}`}
                          </p>
                          {ans.selected_option && (
                            <p className="text-[11px] text-slate-500">
                              Your answer: <span className="text-slate-800 font-semibold">{ans.selected_option}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-bold ${correct ? "text-emerald-600" : "text-rose-600"}`}>
                            {correct ? `+${Number(ans.marks_awarded || 0).toFixed(2)} pts` : "0.00 pts"}
                          </span>
                          {correct ? (
                            <FiCheckCircle size={16} className="text-emerald-600" />
                          ) : (
                            <FiXCircle size={16} className="text-rose-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-white flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-[9999] h-screen w-screen overflow-hidden"
          : "flex-1 w-full h-full relative"
      }`}
    >
      {renderContent()}
    </div>
  );
};

export default QuizPlayer;
