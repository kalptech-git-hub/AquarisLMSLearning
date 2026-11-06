import React from "react";
import { FiVideo, FiLink, FiLock, FiCheck, FiInfo, FiClock, FiAlertCircle } from "react-icons/fi";
import { SiZoom, SiGooglemeet } from "react-icons/si";
import AlarmTimePicker from "./AlarmTimePicker.jsx";

export const validateMeetingUrl = (url, platform) => {
  if (!url || !url.trim()) {
    return "Meeting link URL is required.";
  }
  const trimmed = url.trim();
  const urlPattern = /^(https?:\/\/)?(([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?$/i;
  if (!urlPattern.test(trimmed)) {
    return "Please enter a valid meeting URL (e.g., https://meet.google.com/... or https://zoom.us/...)";
  }

  try {
    const toTest = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(toTest);
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return "Please enter a valid meeting URL with a valid domain.";
    }
  } catch (_) {
    return "Please enter a valid meeting URL.";
  }

  if (platform === "google_meet" && /zoom\.(us|com)/i.test(trimmed)) {
    return "You selected Google Meet, but entered a Zoom link.";
  }
  if (platform === "zoom" && /meet\.google\.com/i.test(trimmed)) {
    return "You selected Zoom, but entered a Google Meet link.";
  }

  return "";
};

const LiveSessionForm = ({
  livePlatform = "google_meet",
  setLivePlatform,
  liveMeetingLink = "",
  setLiveMeetingLink,
  liveMeetingPassword = "",
  setLiveMeetingPassword,
  liveStartTime = "",
  setLiveStartTime,
  liveEndTime = "",
  setLiveEndTime,
  validationErrors = {},
  setLiveValidationErrors,
  isReadOnly = false,
  primaryColor = "blue",
  isCancelled = false
}) => {
  const parseDatetime = (dtStr) => {
    if (!dtStr) return { date: "", time: "" };
    if (dtStr.includes("T")) {
      const [d, t] = dtStr.split("T");
      return { date: d, time: t.slice(0, 5) };
    }
    const [d, t] = dtStr.split(" ");
    return { date: d || "", time: (t || "").slice(0, 5) };
  };

  const { date: startDate, time: startTime } = parseDatetime(liveStartTime);
  const { date: endDate, time: endTime } = parseDatetime(liveEndTime);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    if (!newDate) {
      setLiveStartTime("");
      return;
    }
    const t = startTime || "09:00";
    setLiveStartTime(`${newDate}T${t}`);
    if (validationErrors.start_time) {
      setLiveValidationErrors?.((prev) => ({ ...prev, start_time: "" }));
    }
  };

  const handleStartTimeChange = (tVal) => {
    const dVal = startDate || todayStr;
    setLiveStartTime(`${dVal}T${tVal}`);
    if (validationErrors.start_time) {
      setLiveValidationErrors?.((prev) => ({ ...prev, start_time: "" }));
    }
  };

  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    if (!newDate) {
      setLiveEndTime("");
      return;
    }
    const t = endTime || "10:00";
    setLiveEndTime(`${newDate}T${t}`);
    if (validationErrors.end_time) {
      setLiveValidationErrors?.((prev) => ({ ...prev, end_time: "" }));
    }
  };

  const handleEndTimeChange = (tVal) => {
    const dVal = endDate || startDate || todayStr;
    setLiveEndTime(`${dVal}T${tVal}`);
    if (validationErrors.end_time) {
      setLiveValidationErrors?.((prev) => ({ ...prev, end_time: "" }));
    }
  };

  // Check if the session is past
  const isStartInPast = liveStartTime && !isNaN(new Date(liveStartTime).getTime())
    ? new Date(liveStartTime) <= new Date()
    : false;

  // If liveStartTime or liveEndTime was already in the past when the form mounted (i.e., editing an existing past session)
  const isPastSessionOnMount = React.useRef(
    Boolean(
      (liveStartTime && !isNaN(new Date(liveStartTime).getTime()) && new Date(liveStartTime) <= new Date()) ||
      (liveEndTime && !isNaN(new Date(liveEndTime).getTime()) && new Date(liveEndTime) <= new Date())
    )
  ).current;

  // Lock all fields if read-only, past session, OR cancelled
  const isLocked = Boolean(isReadOnly || isPastSessionOnMount || isCancelled);
  const effectiveReadOnly = isLocked;

  const isEndBeforeStart =
    liveEndTime && liveStartTime ? new Date(liveEndTime) <= new Date(liveStartTime) : false;

  const getCalculatedDuration = () => {
    if (!liveStartTime || !liveEndTime) return null;
    const start = new Date(liveStartTime);
    const end = new Date(liveEndTime);
    const diffMs = end - start;
    if (diffMs <= 0) return null;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
    if (hours > 0) return `${hours} hr`;
    return `${mins} min`;
  };

  const calculatedDuration = getCalculatedDuration();

  return (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-5">
      {isCancelled && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold shadow-2xs">
          <FiAlertCircle className="text-base text-red-600 shrink-0" />
          <span>This live session has been cancelled and cannot be rescheduled or edited.</span>
        </div>
      )}

      {isLocked && !isCancelled && isPastSessionOnMount && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <FiLock className="text-amber-600 shrink-0 text-sm" />
          <span>This live session has already started or ended. Details are locked and cannot be edited.</span>
        </div>
      )}

      {/* Meeting Platform Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Meeting Platform <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Google Meet Option */}
          <button
            type="button"
            disabled={isLocked}
            onClick={() => {
              if (isLocked) return;
              setLivePlatform("google_meet");
              if (liveMeetingLink && liveMeetingLink.trim()) {
                const err = validateMeetingUrl(liveMeetingLink, "google_meet");
                setLiveValidationErrors?.((prev) => ({ ...prev, meeting_link: err }));
              }
            }}
            className={`relative flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl border transition-all text-left w-full min-w-0 overflow-hidden ${isLocked
                ? "cursor-not-allowed opacity-60 bg-slate-100 border-slate-200"
                : livePlatform === "google_meet"
                  ? "cursor-pointer border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500"
                  : "cursor-pointer border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <SiGooglemeet className="text-lg" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Google Meet</p>
                <p className="text-[10px] text-slate-500 truncate">meet.google.com</p>
              </div>
            </div>
            {livePlatform === "google_meet" && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <FiCheck className="text-xs" />
              </div>
            )}
          </button>

          {/* Zoom Option */}
          <button
            type="button"
            disabled={isLocked}
            onClick={() => {
              if (isLocked) return;
              setLivePlatform("zoom");
              if (liveMeetingLink && liveMeetingLink.trim()) {
                const err = validateMeetingUrl(liveMeetingLink, "zoom");
                setLiveValidationErrors?.((prev) => ({ ...prev, meeting_link: err }));
              }
            }}
            className={`relative flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl border transition-all text-left w-full min-w-0 overflow-hidden ${isLocked
                ? "cursor-not-allowed opacity-60 bg-slate-100 border-slate-200"
                : livePlatform === "zoom"
                  ? "cursor-pointer border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500"
                  : "cursor-pointer border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <SiZoom className="text-lg" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Zoom Meeting</p>
                <p className="text-[10px] text-slate-500 truncate">zoom.us/j/...</p>
              </div>
            </div>
            {livePlatform === "zoom" && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <FiCheck className="text-xs" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Meeting Link & Optional Password */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Meeting Link URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              disabled={isLocked}
              value={liveMeetingLink}
              onChange={(e) => {
                setLiveMeetingLink(e.target.value);
                if (validationErrors.meeting_link) {
                  setLiveValidationErrors?.((prev) => ({ ...prev, meeting_link: "" }));
                }
              }}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val) {
                  const err = validateMeetingUrl(val, livePlatform);
                  if (err) {
                    setLiveValidationErrors?.((prev) => ({ ...prev, meeting_link: err }));
                  }
                }
              }}
              placeholder={
                livePlatform === "zoom"
                  ? "https://zoom.us/j/1234567890?pwd=..."
                  : "https://meet.google.com/abc-defg-hij"
              }
              className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:outline-none transition ${
                isLocked
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-60"
                  : validationErrors.meeting_link
                    ? "bg-white border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-800"
                    : "bg-white border-slate-200 focus:border-slate-400 text-slate-800"
              }`}
            />
          </div>
          {validationErrors.meeting_link && (
            <p className="text-[11px] text-red-500 mt-1">{validationErrors.meeting_link}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Passcode / Password <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              disabled={isLocked}
              value={liveMeetingPassword}
              onChange={(e) => setLiveMeetingPassword(e.target.value)}
              placeholder="e.g. 123456"
              className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:outline-none transition ${
                isLocked
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-60"
                  : "bg-white border-slate-200 focus:border-slate-400 text-slate-800"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Schedule: Start & End Date Time (Split into Date + Phone Alarm Scrollable TimePicker) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Start Date & Time <span className="text-red-500">*</span>
            </label>
            {!isLocked && liveStartTime && (
              <button
                type="button"
                onClick={() => {
                  setLiveStartTime("");
                  setLiveValidationErrors?.((prev) => ({ ...prev, start_time: "" }));
                }}
                className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
              >
                Clear Start
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              disabled={isLocked}
              min={todayStr}
              value={startDate}
              onChange={handleStartDateChange}
              className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors ${
                isLocked
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-60"
                  : validationErrors.start_time
                    ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900 cursor-pointer"
                    : "border-slate-200 bg-white cursor-pointer"
              }`}
            />
            <div className={isLocked ? "cursor-not-allowed opacity-60" : ""}>
              <AlarmTimePicker
                disabled={isLocked}
                time24={startTime}
                onChange={handleStartTimeChange}
                hasError={!isLocked && Boolean(validationErrors.start_time)}
                placeholder="Select Start Time"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Select date & time when the live session starts.</p>
          {validationErrors.start_time && (
            <p className="text-[11px] text-red-500 font-medium mt-0.5">{validationErrors.start_time}</p>
          )}
          {!isLocked && !validationErrors.start_time && isStartInPast && (
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">
              Note: Start date & time is in the past.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-semibold text-slate-700">
                End Date & Time <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              {calculatedDuration && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                  <FiClock className="text-[10px]" /> {calculatedDuration}
                </span>
              )}
            </div>
            {!isLocked && liveEndTime && (
              <button
                type="button"
                onClick={() => {
                  setLiveEndTime("");
                  setLiveValidationErrors?.((prev) => ({ ...prev, end_time: "" }));
                }}
                className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
              >
                Clear End
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="date"
              disabled={isLocked}
              min={startDate || todayStr}
              value={endDate}
              onChange={handleEndDateChange}
              className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors ${
                isLocked
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-60"
                  : validationErrors.end_time || isEndBeforeStart
                    ? "border-red-400 focus:border-red-500 bg-red-50/20 text-red-900 cursor-pointer"
                    : "border-slate-200 bg-white cursor-pointer"
              }`}
            />
            <div className={isLocked ? "cursor-not-allowed opacity-60" : ""}>
              <AlarmTimePicker
                disabled={isLocked}
                time24={endTime}
                onChange={handleEndTimeChange}
                hasError={!isLocked && (Boolean(validationErrors.end_time) || isEndBeforeStart)}
                placeholder="Select End Time"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Select date & time when the live session ends.</p>
          {validationErrors.end_time && (
            <p className="text-[11px] text-red-500 font-medium mt-0.5">{validationErrors.end_time}</p>
          )}
          {!isLocked && !validationErrors.end_time && isEndBeforeStart && (
            <p className="text-[10px] text-red-500 font-medium mt-0.5">
              End date & time must be after start date & time.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white border border-slate-200 rounded-lg p-2.5">
        <FiInfo className="text-slate-400 shrink-0" />
        <span>Enrolled students will receive an email notification and system notification.</span>
      </div>
    </div>
  );
};

export default LiveSessionForm;
