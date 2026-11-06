import React, { useState } from "react";
import { FiList, FiPlus, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import Select from "react-select";

import AlarmTimePicker from "./AlarmTimePicker.jsx";

const TimePicker12h = AlarmTimePicker;

const getQuizSelectStyles = (primaryColor) => {
  const isBlue = primaryColor === "blue";
  return {
    control: (provided, state) => ({
      ...provided,
      minHeight: "32px",
      borderRadius: "8px",
      borderColor: "#cbd5e1",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#cbd5e1",
      },
      fontSize: "12px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? (isBlue ? "#EFF6FF" : "#FEF2F2")
        : state.isFocused
          ? (isBlue ? "#EFF6FF" : "#FEF2F2")
          : "#fff",
      color: state.isSelected ? (isBlue ? "#1B357F" : "#501D1D") : "#374151",
      cursor: "pointer",
      fontSize: "12px",
    }),
    // was: no overflow handling — a long selected label (e.g. "Multiple Choice MCQ") had nowhere to go but wider than the select's container, and since that container is a flex column child with no min-w-0, the whole select pushed past the card edge on phone instead of shrinking. Added ellipsis truncation so the text clips instead of forcing extra width.
    singleValue: (provided) => ({
      ...provided,
      color: "#374151",
      fontSize: "12px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: "100%",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "4px 8px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 8px",
    })
  };
};

const QuizBuilder = ({
  quizDuration = 15,
  setQuizDuration,
  quizPassingMarks = 70,
  setQuizPassingMarks,
  quizAttempts = 1,
  setQuizAttempts,
  quizInstructions = "",
  setQuizInstructions,
  quizQuestions = [],
  setQuizQuestions,
  quizStartDatetime = "",
  setQuizStartDatetime,
  quizEndDatetime = "",
  setQuizEndDatetime,
  primaryColor = "red",
  showValidationErrors = false,
  isReadOnly = false,
  topicTitle = "",
  lessonTitle = ""
}) => {
  const isBlue = primaryColor === "blue";
  const brandColor = isBlue ? "text-[#1B357F]" : "text-red-600";
  const brandLightBg = isBlue
    ? "bg-blue-50 text-[#1B357F] hover:bg-blue-100 font-semibold"
    : "bg-red-50 text-red-600 hover:bg-red-100 font-semibold";
  const accentClass = isBlue ? "accent-[#1B357F]" : "accent-red-600";
  const borderLeftClass = isBlue ? "border-blue-200" : "border-red-200";

  const [localShowErrors, setLocalShowErrors] = useState(false);
  const effectiveShowErrors = showValidationErrors || localShowErrors;

  const handleAddQuestion = (e) => {
    e?.stopPropagation();
    if ((quizQuestions || []).length >= 25) {
      toast.error("Maximum 25 questions allowed per quiz.");
      return;
    }

    // Validate that all existing questions are fully completed before adding a new one
    for (let i = 0; i < (quizQuestions || []).length; i++) {
      const q = quizQuestions[i];
      const qNum = i + 1;

      // 1. Question text validation
      if (!q.question_text || !q.question_text.trim()) {
        setLocalShowErrors(true);
        toast.error(`Please enter question text for Question ${qNum} before adding a new question.`);
        return;
      }

      // 2. Marks validation
      if (!q.question_marks || Number(q.question_marks) < 1) {
        setLocalShowErrors(true);
        toast.error(`Please enter valid marks for Question ${qNum} (minimum 1 mark).`);
        return;
      }

      // 3. Options validation for MCQ types
      if (q.question_type !== "true_false") {
        if (!q.options || q.options.length < 2) {
          setLocalShowErrors(true);
          toast.error(`Question ${qNum} must have at least 2 options.`);
          return;
        }

        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].option_text || !q.options[j].option_text.trim()) {
            setLocalShowErrors(true);
            toast.error(`Please fill in Option ${j + 1} for Question ${qNum} before adding a new question.`);
            return;
          }
        }

        // Duplicate options check
        const optTexts = q.options.map(o => (o.option_text || "").trim().toLowerCase());
        const uniqueOpts = new Set(optTexts);
        if (uniqueOpts.size !== optTexts.length) {
          setLocalShowErrors(true);
          toast.error(`Question ${qNum} has duplicate options. All options must be unique.`);
          return;
        }
      }

      // 4. Correct answer selection
      const hasCorrect = (q.options || []).some(o => o.is_correct);
      if (!hasCorrect) {
        setLocalShowErrors(true);
        toast.error(`Please select at least one correct answer for Question ${qNum}.`);
        return;
      }
    }

    // All existing questions are valid, clear error state and add new question
    setLocalShowErrors(false);
    setQuizQuestions(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        question_text: "",
        question_type: "single_mcq",
        question_marks: 5,
        options: [
          { option_text: "", is_correct: true },
          { option_text: "", is_correct: false }
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (qIndex, e) => {
    e?.stopPropagation();
    if (quizQuestions.length <= 1) {
      toast.error("A quiz must have at least 1 question.");
      return;
    }
    setQuizQuestions(prev => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setQuizQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const updatedQ = { ...q, [field]: value };
        if (field === "question_type") {
          if (value === "true_false") {
            updatedQ.options = [
              { option_text: "True", is_correct: true },
              { option_text: "False", is_correct: false }
            ];
          } else if (
            q.question_type === "true_false" ||
            (updatedQ.options?.length === 2 &&
              (updatedQ.options[0]?.option_text || "").trim().toLowerCase() === "true" &&
              (updatedQ.options[1]?.option_text || "").trim().toLowerCase() === "false")
          ) {
            // Reset options when switching from True/False to Single/Multiple choice
            updatedQ.options = [
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false }
            ];
          } else if (value === "single_mcq") {
            let foundCorrect = false;
            updatedQ.options = (updatedQ.options || []).map(opt => {
              if (opt.is_correct && !foundCorrect) {
                foundCorrect = true;
                return opt;
              }
              return { ...opt, is_correct: false };
            });
          }
        }
        return updatedQ;
      })
    );
  };

  const handleAddOption = (qIndex, e) => {
    e?.stopPropagation();
    setQuizQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentOpts = q.options || [];
        if (currentOpts.length >= 4) {
          toast.error("Maximum 4 options allowed per question.");
          return q;
        }
        return {
          ...q,
          options: [...currentOpts, { option_text: "", is_correct: false }]
        };
      })
    );
  };

  const handleRemoveOption = (qIndex, oIndex, e) => {
    e?.stopPropagation();
    setQuizQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentOpts = q.options || [];
        if (currentOpts.length <= 2) {
          toast.error("Question must have at least 2 options.");
          return q;
        }
        const filtered = currentOpts.filter((_, i) => i !== oIndex);
        if (!filtered.some(o => o.is_correct) && filtered.length > 0) {
          filtered[0] = { ...filtered[0], is_correct: true };
        }
        return { ...q, options: filtered };
      })
    );
  };

  const handleOptionTextChange = (qIndex, oIndex, text) => {
    setQuizQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const opts = (q.options || []).map((opt, i) =>
          i === oIndex ? { ...opt, option_text: text } : opt
        );
        return { ...q, options: opts };
      })
    );
  };

  const handleOptionCorrectChange = (qIndex, oIndex) => {
    setQuizQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const qType = q.question_type || "single_mcq";
        const opts = (q.options || []).map((opt, i) => {
          if (qType === "multiple_mcq") {
            return i === oIndex ? { ...opt, is_correct: !opt.is_correct } : opt;
          } else {
            return { ...opt, is_correct: i === oIndex };
          }
        });
        return { ...q, options: opts };
      })
    );
  };

  const getTodayDateString = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const todayStr = getTodayDateString();
  const now = new Date();

  const isDurationInvalid = !quizDuration || Number(quizDuration) < 1 || Number(quizDuration) > 300;
  const isPassingMarksInvalid = !quizPassingMarks || Number(quizPassingMarks) < 1 || Number(quizPassingMarks) > 100;
  const isAttemptsInvalid = !quizAttempts || Number(quizAttempts) < 1 || Number(quizAttempts) > 10;

  const isStartInPast = !!(quizStartDatetime && new Date(quizStartDatetime) < now);
  const isEndInPast = !!(quizEndDatetime && new Date(quizEndDatetime) < now);
  const isEndBeforeStart = !!(quizStartDatetime && quizEndDatetime && new Date(quizEndDatetime) <= new Date(quizStartDatetime));

  const startDate = quizStartDatetime ? quizStartDatetime.split("T")[0] : "";
  const startTime = quizStartDatetime && quizStartDatetime.includes("T") ? quizStartDatetime.split("T")[1].slice(0, 5) : "";

  const endDate = quizEndDatetime ? quizEndDatetime.split("T")[0] : "";
  const endTime = quizEndDatetime && quizEndDatetime.includes("T") ? quizEndDatetime.split("T")[1].slice(0, 5) : "";

  const handleStartDateChange = (e) => {
    const dVal = e.target.value;
    if (!dVal) {
      setQuizStartDatetime && setQuizStartDatetime("");
      return;
    }
    const tVal = startTime || "09:00";
    setQuizStartDatetime && setQuizStartDatetime(`${dVal}T${tVal}`);
  };

  const handleStartTimeChange = (e) => {
    const tVal = e.target.value;
    const dVal = startDate || todayStr;
    if (!tVal) {
      setQuizStartDatetime && setQuizStartDatetime(`${dVal}T09:00`);
      return;
    }
    setQuizStartDatetime && setQuizStartDatetime(`${dVal}T${tVal}`);
  };

  const handleEndDateChange = (e) => {
    const dVal = e.target.value;
    if (!dVal) {
      setQuizEndDatetime && setQuizEndDatetime("");
      return;
    }
    const tVal = endTime || "23:59";
    setQuizEndDatetime && setQuizEndDatetime(`${dVal}T${tVal}`);
  };

  const handleEndTimeChange = (e) => {
    const tVal = e.target.value;
    const dVal = endDate || startDate || todayStr;
    if (!tVal) {
      setQuizEndDatetime && setQuizEndDatetime(`${dVal}T23:59`);
      return;
    }
    setQuizEndDatetime && setQuizEndDatetime(`${dVal}T${tVal}`);
  };

  if (isReadOnly) {
    return (
      <div className="space-y-5 my-2">
        {/* Summary Card / Metadata Row */}
        {/* was: p-5 at all widths — same compounding-padding issue as the builder side, on the View Quiz (read-only) card. p-3.5 sm:p-5 trims it on phone only. */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-2xs space-y-4">
          {(topicTitle || lessonTitle) && (
            <div className="border-b border-slate-100 pb-3">
              {topicTitle && (
                <span className="text-xs font-medium text-slate-400">
                  {topicTitle} {lessonTitle ? "· " + lessonTitle : ""}
                </span>
              )}
              {lessonTitle && (
                <h2 className="text-lg font-bold text-slate-800 mt-0.5">
                  {lessonTitle}
                </h2>
              )}
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="block text-xs font-medium text-slate-400 mb-0.5">Time limit</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">{quizDuration || 15} mins</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-400 mb-0.5">Passing marks</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">{quizPassingMarks || 70}%</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-400 mb-0.5">Allowed attempts</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">{quizAttempts || 1}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-400 mb-0.5">Questions</span>
              <span className="text-sm sm:text-base font-bold text-slate-800">{(quizQuestions || []).length}</span>
            </div>
          </div>

          {(quizStartDatetime || quizEndDatetime) && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
              {quizStartDatetime && (
                <div><span className="font-semibold text-slate-700">Starts:</span> {new Date(quizStartDatetime).toLocaleString()}</div>
              )}
              {quizEndDatetime && (
                <div><span className="font-semibold text-slate-700">Ends:</span> {new Date(quizEndDatetime).toLocaleString()}</div>
              )}
            </div>
          )}

          {quizInstructions && (
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-700 block mb-0.5">Instructions:</span>
              <p className="leading-relaxed">{quizInstructions}</p>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {(quizQuestions || []).map((q, qIdx) => {
            const qType = q.question_type || "single_mcq";
            const typeLabel = qType === "true_false" ? "True / False" : qType === "multiple_mcq" ? "Multiple choice" : "Single choice";

            return (
              // {/* was: p-5 on phone (only sm: stepped up to p-6) — still too much given the nesting depth. p-3.5 sm:p-6 trims it further on phone only. */}
              <div key={qIdx} className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-6 space-y-4 shadow-2xs">
                {/* Question Header */}
                {/* was: flex items-start justify-between gap-4 at all widths, with the title having no min-w-0 and the marks/type badge shrink-0 — neither side could give up width, so on phone both fought for the same row: the badge held its full "5.00 pts · Single choice" width and the title got squeezed down to almost nothing, wrapping word-by-word and pushing the badge toward the card edge. Stacked to flex-col below sm:, badge moved to its own line below the title; sm: and up reverts to the original single-row layout. */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 min-w-0">
                    Q{qIdx + 1}. {q.question_text || "Untitled Question"}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium shrink-0 sm:pt-0.5">
                    {Number(q.question_marks || 5).toFixed(2)} pts · {typeLabel}
                  </span>
                </div>

                {/* Options Render */}
                {qType === "true_false" ? (
                  <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 sm:gap-3 pt-1">
                    {["True", "False"].map((tfVal) => {
                      const matchedOpt = (q.options || []).find(o => (o.option_text || "").toLowerCase() === tfVal.toLowerCase());
                      const isCorrect = matchedOpt ? !!matchedOpt.is_correct : (tfVal === "True" && (q.options || [])[0]?.is_correct);

                      return (
                        <div
                          key={tfVal}
                          className={`min-w-0 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${isCorrect
                            ? "border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-500"
                            }`}
                        >
                          {isCorrect && <FiCheck className="text-emerald-600 shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          <span>{tfVal}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    {(q.options || []).map((opt, oIdx) => {
                      const isCorrect = !!opt.is_correct;

                      return (
                        <div
                          key={oIdx}
                          className={`w-full py-3 px-4 rounded-xl border text-sm font-medium flex items-center gap-3 transition-all ${isCorrect
                            ? "border-emerald-500 bg-emerald-50/80 text-emerald-900 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700"
                            }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isCorrect
                              ? "border-emerald-500 bg-emerald-100/60 text-emerald-700"
                              : "border-slate-300 bg-white text-transparent"
                              }`}
                          >
                            {isCorrect && <FiCheck size={13} />}
                          </div>
                          <span className="break-words">{opt.option_text || `Option ${oIdx + 1}`}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    /* was: p-4 at all widths — this wrapper sits several nesting levels deep (topic card > lesson form > here > question card), so its own padding was part of what compounded to leave too little width for the Marks box and Select on phone. p-2.5 sm:p-4 trims it on phone only. Bare comment here, not {/* *​/}, since this sits directly inside the return(...) JS expression, not JSX children. */
    <div className="space-y-4 border border-slate-200 rounded-xl p-2.5 sm:p-4 bg-slate-50/50 my-2">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <FiList className="text-slate-600" size={15} /> Quiz Builder & Settings
        </h4>
        <span className="text-[11px] text-slate-500 font-semibold">{(quizQuestions || []).length} Question(s)</span>
      </div>

      {/* Quiz Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Time Limit (Mins) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="300"
            disabled={isReadOnly}
            value={quizDuration}
            onChange={(e) => setQuizDuration && setQuizDuration(e.target.value === "" ? "" : Number(e.target.value))}
            className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors ${isReadOnly ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" :
              effectiveShowErrors && isDurationInvalid
                ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                : "border-slate-200 bg-white"
              }`}
          />
          {!isReadOnly && effectiveShowErrors && isDurationInvalid && (
            <p className="text-[10px] text-red-500 font-medium mt-1">
              {!quizDuration ? "Time limit is required" : "Must be between 1 and 300 mins"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Passing Marks (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="100"
            disabled={isReadOnly}
            value={quizPassingMarks}
            onChange={(e) => setQuizPassingMarks && setQuizPassingMarks(e.target.value === "" ? "" : Number(e.target.value))}
            className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors ${isReadOnly ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" :
              effectiveShowErrors && isPassingMarksInvalid
                ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                : "border-slate-200 bg-white"
              }`}
          />
          {!isReadOnly && effectiveShowErrors && isPassingMarksInvalid && (
            <p className="text-[10px] text-red-500 font-medium mt-1">
              {!quizPassingMarks ? "Passing marks are required" : "Must be between 1% and 100%"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Allowed Attempts <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max="10"
            disabled={isReadOnly}
            value={quizAttempts}
            onChange={(e) => setQuizAttempts && setQuizAttempts(e.target.value === "" ? "" : Number(e.target.value))}
            className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors ${isReadOnly ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" :
              effectiveShowErrors && isAttemptsInvalid
                ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                : "border-slate-200 bg-white"
              }`}
          />
          {!isReadOnly && effectiveShowErrors && isAttemptsInvalid && (
            <p className="text-[10px] text-red-500 font-medium mt-1">
              {!quizAttempts ? "Allowed attempts is required" : "Must be between 1 and 10 attempts"}
            </p>
          )}
        </div>
      </div>

      {/* Quiz Scheduling (Start & End Date/Time) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              Quiz Start Date & Time (Optional)
            </label>
            {!isReadOnly && quizStartDatetime && (
              <button
                type="button"
                onClick={() => setQuizStartDatetime && setQuizStartDatetime("")}
                className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
              >
                Clear Start
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              disabled={isReadOnly}
              min={todayStr}
              value={startDate}
              onChange={handleStartDateChange}
              className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors cursor-pointer ${isReadOnly ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" :
                (showValidationErrors && isStartInPast) || isStartInPast
                  ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                  : "border-slate-200 bg-white"
                }`}
            />
            <TimePicker12h
              disabled={isReadOnly}
              time24={startTime}
              onChange={(tVal) => {
                const dVal = startDate || todayStr;
                setQuizStartDatetime && setQuizStartDatetime(`${dVal}T${tVal}`);
              }}
              hasError={!isReadOnly && ((showValidationErrors && isStartInPast) || isStartInPast)}
              primaryColor={primaryColor}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Select date & time from which test opens for students.</p>
          {!isReadOnly && isStartInPast && (
            <p className="text-[10px] text-red-500 font-medium mt-0.5">
              Start date & time cannot be in the past.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              Quiz End Date & Time (Optional)
            </label>
            {!isReadOnly && quizEndDatetime && (
              <button
                type="button"
                onClick={() => setQuizEndDatetime && setQuizEndDatetime("")}
                className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
              >
                Clear End
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              disabled={isReadOnly}
              min={startDate || todayStr}
              value={endDate}
              onChange={handleEndDateChange}
              className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors cursor-pointer ${isReadOnly ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" :
                (showValidationErrors && (isEndInPast || isEndBeforeStart)) || isEndInPast || isEndBeforeStart
                  ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                  : "border-slate-200 bg-white"
                }`}
            />
            <TimePicker12h
              disabled={isReadOnly}
              time24={endTime}
              onChange={(tVal) => {
                const dVal = endDate || startDate || todayStr;
                setQuizEndDatetime && setQuizEndDatetime(`${dVal}T${tVal}`);
              }}
              hasError={!isReadOnly && ((showValidationErrors && (isEndInPast || isEndBeforeStart)) || isEndInPast || isEndBeforeStart)}
              primaryColor={primaryColor}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Select date & time after which test automatically closes.</p>
          {!isReadOnly && (
            isEndInPast ? (
              <p className="text-[10px] text-red-500 font-medium mt-0.5">
                End date & time cannot be in the past.
              </p>
            ) : isEndBeforeStart ? (
              <p className="text-[10px] text-red-500 font-medium mt-0.5">
                End date & time must be after start date & time.
              </p>
            ) : null
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Instructions / Description
          </label>
          <span
            className={`text-[10px] font-semibold transition-colors 
              ${(quizInstructions || "").length === 500
                ? "text-green-600"
                : "text-slate-400"
              }`}
          >
            {(quizInstructions || "").length}/500 characters
          </span>
        </div>

        <textarea
          maxLength={500}
          rows={2}
          disabled={isReadOnly}
          value={quizInstructions}
          onChange={(e) => setQuizInstructions && setQuizInstructions(e.target.value)}
          placeholder="Enter instructions for students before starting the quiz..."
          className={`w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none resize-none ${isReadOnly ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
        />
      </div>

      {/* Questions Builder */}
      <div className="space-y-3 pt-2">
        {/* was: className="flex items-center justify-between" — no wrap meant the label and the "Add Question" pill button fought for the same row, and once nested padding/borders ate into the available width on phone, the button got pushed past the card's right edge instead of dropping to a second line. flex-wrap lets it wrap below the label when space runs out. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-700">Quiz Questions <span className="text-red-500">*</span></label>

          </div>

          {!isReadOnly && (
            (quizQuestions || []).length < 25 ? (
              <button
                type="button"
                onClick={handleAddQuestion}
                className={`px-2.5 py-1 ${brandLightBg} rounded-lg text-xs flex items-center gap-1 transition cursor-pointer`}
              >
                <FiPlus size={13} /> Add Question
              </button>
            ) : (
              <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                (Max 25 questions limit reached)
              </span>
            )
          )}
        </div>

        {!isReadOnly && effectiveShowErrors && (!quizQuestions || quizQuestions.length === 0) && (
          <p className="text-[11px] text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
            Please add at least 1 question to the quiz.
          </p>
        )}

        {(quizQuestions || []).map((q, qIdx) => {
          const isQuestionTextEmpty = !q.question_text || !q.question_text.trim();
          const isMarksInvalid = !q.question_marks || Number(q.question_marks) < 1;
          const hasNoCorrectOption = !(q.options || []).some(o => o.is_correct);

          return (
            /* was: p-3.5 at all widths — same compounding-padding issue as the wrapper above, one level deeper. p-2.5 sm:p-3.5 trims it on phone only. Bare comment here since this sits directly inside a return(...) JS expression (the .map() callback), not JSX children. */
            <div key={q.id || qIdx} className="border border-slate-200 bg-white rounded-xl p-2.5 sm:p-3.5 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <div className="flex flex-col sm:flex-row items-start gap-0.5 sm:gap-2 flex-1 min-w-0 w-full">
                  <span className="text-xs font-bold text-slate-800 shrink-0 sm:pt-2">Q{qIdx + 1}.</span>

                  {/* <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      maxLength={500}
                      disabled={isReadOnly}
                      value={q.question_text || ""}
                      onChange={(e) => handleQuestionChange(qIdx, "question_text", e.target.value)}
                      placeholder="Enter question text..."
                      className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors ${isReadOnly ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" :
                        effectiveShowErrors && isQuestionTextEmpty
                          ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                          : "border-slate-200 bg-white"
                        }`}
                    />
                    {!isReadOnly && effectiveShowErrors && isQuestionTextEmpty && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">Please enter question text here</p>
                    )}
                  </div> */}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mb-1">
                      <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                        Question Text <span className="text-red-500">*</span>
                      </span>

                      <span
                        className={`text-[10px] font-semibold transition-colors whitespace-nowrap ml-auto ${(q.question_text || "").length === 500
                          ? "text-green-600"
                          : "text-slate-400"
                          }`}
                      >
                        {(q.question_text || "").length}/500 characters
                      </span>
                    </div>

                    <input
                      type="text"
                      maxLength={500}
                      disabled={isReadOnly}
                      value={q.question_text || ""}
                      onChange={(e) =>
                        handleQuestionChange(
                          qIdx,
                          "question_text",
                          e.target.value
                        )
                      }
                      placeholder="Enter question text..."
                      className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors ${isReadOnly
                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                        : effectiveShowErrors && isQuestionTextEmpty
                          ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                          : "border-slate-200 bg-white"
                        }`}
                    />

                    {!isReadOnly && effectiveShowErrors && isQuestionTextEmpty && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">
                        Please enter question text here
                      </p>
                    )}
                  </div>
                </div>

                {/* was: pl-6 on phone (indenting this row to align under the question text above) plus a fixed w-20 Marks input left too little width for label + input + delete icon to fit in the deeply-nested phone container (topic card > lesson form > quiz builder > question card each add their own padding). Dropped the phone indent (pl-0) and narrowed the gap so the row starts flush left, reclaiming room; sm: and up is unchanged. */}
                {/* was: className="flex items-center gap-1 sm:gap-1.5 sm:shrink-0 pl-0 sm:pl-0" — no wrap fallback, so on very narrow phones (this component sits several padded/bordered cards deep) the "Marks:" label, its input, and the delete icon could still run out of room together, pushing the delete icon past the card edge. flex-wrap lets the trio drop the icon to a second line instead of overflowing. */}

                {/* div before input was: w-20 (80px) fixed at all widths — too wide to fit alongside the label and delete icon in the narrow nested phone container. w-14 sm:w-20 narrows it on phone only. */}

                {/* isReadOnly was: className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer" on the button below — no shrink-0 meant this button could get squeezed or forced out of the row instead of holding its size and wrapping with the row per the flex-wrap change above. Comment moved here as a JSX child above the conditional block, since the space directly inside the "condition and (...)" parens is JS expression position, not a JSX children list, and a comment there breaks the oxc/Vite parser. */}

                <div className="flex flex-col gap-1 sm:shrink-0">
                  <label className="text-[10px] font-semibold text-slate-500">
                    Marks <span className="text-red-500">*</span>
                  </label>

                  <div className="flex items-start gap-1 sm:gap-1.5">
                    <div className="w-14 sm:w-20 shrink-0">
                      <input
                        type="number"
                        min="1"
                        disabled={isReadOnly}
                        value={q.question_marks || ""}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIdx,
                            "question_marks",
                            Number(e.target.value) || ""
                          )
                        }
                        placeholder="5"
                        title="Question Marks"
                        className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors ${isReadOnly
                          ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                          : effectiveShowErrors && isMarksInvalid
                            ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                            : "border-slate-200 bg-white"
                          }`}
                      />

                      {!isReadOnly && effectiveShowErrors && isMarksInvalid && (
                        <p className="text-[10px] text-red-500 font-medium mt-1">
                          {!q.question_marks ? "Marks are required" : "Min 1 mark"}
                        </p>
                      )}
                    </div>

                    {!isReadOnly && (quizQuestions || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer shrink-0"
                        title="Delete Question"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* was: no min-w-0 on this flex column — a long selected option label had no room to shrink into, so it forced the Select wider than the card, pushing it outside the visible box on phone. min-w-0 lets it shrink properly now that singleValue also truncates with ellipsis. */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[11px] font-semibold text-slate-600 shrink-0">Question Type:</label>
                <Select
                  isDisabled={isReadOnly}
                  value={{
                    value: q.question_type || "single_mcq",
                    label:
                      q.question_type === "multiple_mcq"
                        ? "Multiple Choice Question"
                        : q.question_type === "true_false"
                          ? "True / False"
                          : "Single Choice Question"
                  }}
                  onChange={(option) => handleQuestionChange(qIdx, "question_type", option.value)}
                  options={[
                    { value: "single_mcq", label: "Single Choice Question" },
                    { value: "multiple_mcq", label: "Multiple Choice Question" },
                    { value: "true_false", label: "True / False" }
                  ]}
                  styles={{ ...getQuizSelectStyles(primaryColor), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  isSearchable={false}
                  className="w-full"
                />
              </div>

              {/* Options */}
              <div className={`pl-2 space-y-2 border-l-2 ${borderLeftClass}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Options / Answers (Select correct answer)
                  </span>
                  {!isReadOnly && q.question_type !== "true_false" && (
                    (q.options || []).length < 4 ? (
                      <button
                        type="button"
                        onClick={(e) => handleAddOption(qIdx, e)}
                        className={`px-2.5 py-1 ${brandLightBg} rounded-lg text-xs flex items-center gap-1 transition cursor-pointer font-semibold self-start sm:self-auto shrink-0`}
                      >
                        <FiPlus size={13} /> Add Option
                      </button>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md self-start sm:self-auto shrink-0">
                        (Max 4 options limit reached)
                      </span>
                    )
                  )}
                </div>

                {(q.options || []).map((opt, oIdx) => {
                  const cleanText = (opt.option_text || "").trim().toLowerCase();
                  const isOptionTextEmpty = q.question_type !== "true_false" && !cleanText;
                  const firstDuplicateIdx = (q.options || []).findIndex(
                    (otherOpt) => (otherOpt.option_text || "").trim().toLowerCase() === cleanText
                  );
                  const isDuplicateOption =
                    q.question_type !== "true_false" &&
                    cleanText !== "" &&
                    firstDuplicateIdx !== -1 &&
                    firstDuplicateIdx < oIdx;
                  const hasOptionError = (effectiveShowErrors && isOptionTextEmpty) || isDuplicateOption;

                  return (
                    <div key={oIdx} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type={q.question_type === "multiple_mcq" ? "checkbox" : "radio"}
                          disabled={isReadOnly}
                          name={`correct-option-${qIdx}`}
                          checked={opt.is_correct}
                          onChange={() => handleOptionCorrectChange(qIdx, oIdx)}
                          className={`h-4 w-4 ${accentClass} ${isReadOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                          title="Mark as correct answer"
                        />
                        {/* Previous */}
                        {/* <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={opt.option_text}
                            disabled={isReadOnly || q.question_type === "true_false"}
                            onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1} text...`}
                            className={`w-full text-xs border rounded-lg px-2.5 py-1 focus:outline-none transition-colors ${isReadOnly || q.question_type === "true_false"
                              ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                              : hasOptionError
                                ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                                : "border-slate-200 bg-white"
                              }`}
                          />
                          {!isReadOnly && effectiveShowErrors && isOptionTextEmpty && (
                            <p className="text-[10px] text-red-500 font-medium mt-0.5">Please enter option text here</p>
                          )}
                          {!isReadOnly && isDuplicateOption && (
                            <p className="text-[10px] text-red-500 font-medium mt-0.5">Duplicate option: this option is already entered</p>
                          )}
                        </div> */}

                        <div className="flex-1 min-w-0">
                          {q.question_type !== "true_false" && (
                            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 mb-1">
                              <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                                Option {oIdx + 1} <span className="text-red-500">*</span>
                              </span>

                              <span
                                className={`text-[10px] font-semibold transition-colors whitespace-nowrap ml-auto ${(opt.option_text || "").length === 200
                                  ? "text-green-600"
                                  : "text-slate-400"
                                  }`}
                              >
                                {(opt.option_text || "").length}/200 characters
                              </span>
                            </div>
                          )}

                          <input
                            type="text"
                            maxLength={200}
                            value={opt.option_text || ""}
                            disabled={
                              isReadOnly ||
                              q.question_type === "true_false"
                            }
                            onChange={(e) =>
                              handleOptionTextChange(
                                qIdx,
                                oIdx,
                                e.target.value
                              )
                            }
                            placeholder={`Option ${oIdx + 1} text...`}
                            className={`w-full text-xs border rounded-lg px-2.5 py-1 focus:outline-none transition-colors ${isReadOnly ||
                              q.question_type === "true_false"
                              ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                              : hasOptionError
                                ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900"
                                : "border-slate-200 bg-white"
                              }`}
                          />

                          {!isReadOnly &&
                            effectiveShowErrors &&
                            isOptionTextEmpty && (
                              <p className="text-[10px] text-red-500 font-medium mt-0.5">
                                Please enter option text here
                              </p>
                            )}

                          {!isReadOnly && isDuplicateOption && (
                            <p className="text-[10px] text-red-500 font-medium mt-0.5">
                              Duplicate option: this option is already entered
                            </p>
                          )}
                        </div>

                        {!isReadOnly && q.question_type !== "true_false" && q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, oIdx)}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Remove Option"
                          >
                            <FiX size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!isReadOnly && effectiveShowErrors && hasNoCorrectOption && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                    Please select at least one correct answer for Question {qIdx + 1}.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizBuilder;
