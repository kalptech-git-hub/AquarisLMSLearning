import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft, FiPlus, FiChevronDown, FiChevronUp, FiChevronRight, FiEdit2, FiTrash2,
  FiPlay, FiFileText, FiList, FiUsers, FiSettings, FiCheck, FiX, FiLayers, FiInfo, FiImage, FiEye, FiVideo,
  FiLink, FiLock, FiCalendar, FiClock, FiCopy, FiExternalLink, FiDownload,
  FiSave, FiAlertCircle, FiXCircle
} from "react-icons/fi";
import { MdFileUpload } from "react-icons/md";
import { MdFileUploadOff } from "react-icons/md";
import { SiZoom, SiGooglemeet } from "react-icons/si";
import axios from "axios";
import { toast } from "react-toastify";
import RichTextEditor from "../../../components/TrainingManagement/RichTextEditor.jsx";
import Select from "react-select";
import { selectStyles } from "../../../utils/selectStyles.js";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import InlineMediaViewer from "../../../components/common/InlineMediaViewer.jsx";
import QuizBuilder from "../../../components/TrainingManagement/QuizBuilder.jsx";
import LiveSessionForm, { validateMeetingUrl } from "../../../components/TrainingManagement/LiveSessionForm.jsx";
import useScrollToTop from "../../../hooks/useScrollToTop.js";
import { X } from "lucide-react";

const COMMON_VALIDATION_MSG = "Please fill all required fields correctly.";

const instructorSelectStyles = {
  ...selectStyles,
  control: (provided, state) => ({
    ...provided,
    minHeight: "38px",
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
      ? "#1B357F"
      : state.isFocused
        ? "#F1F5F9"
        : "#fff",
    color: state.isSelected ? "#fff" : "#374151",
    cursor: "pointer",
    fontSize: "12px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#374151",
    fontSize: "12px",
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: "#cbd5e1",
    "&:hover": {
      color: "#cbd5e1",
    },
    padding: "4px 8px",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0 8px",
  })
};

const ManageCourse = () => {
  // console.log(import.meta.env.VITE_API_BASE_URL);
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: "topics" | "students" | "settings"
  const [activeTab, setActiveTab] = useState("topics");

  // Reset scroll position whenever the tab changes or a new training is loaded
  useScrollToTop(activeTab);
  useScrollToTop(trainingId);

  // Accordion open states (single module and single lesson open at a time)
  const [expandedTopics, setExpandedTopics] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [expandedContents, setExpandedContents] = useState({});
  const [deletedContentIds, setDeletedContentIds] = useState({});

  // Active lesson preview state (video, file, or live session)
  const [activeLessonPreviewId, setActiveLessonPreviewId] = useState(null);
  const activeLessonPreviewRef = useRef(null);

  const handleToggleLessonPreview = (lessonId) => {
    if (activeLessonPreviewId === lessonId) {
      setActiveLessonPreviewId(null);
    } else {
      setActiveLessonPreviewId(lessonId);
      setExpandedLessons({ [lessonId]: true });
    }
  };

  // Backward compatibility alias for any older references
  const activeLessonVideoId = activeLessonPreviewId;
  const setActiveLessonVideoId = setActiveLessonPreviewId;
  const activeLessonVideoRef = activeLessonPreviewRef;
  const handleToggleLessonVideo = handleToggleLessonPreview;

  // Click outside to dismiss preview viewer
  useEffect(() => {
    if (!activeLessonPreviewId) return;

    const handleOutsideClick = (e) => {
      if (activeLessonPreviewRef.current && activeLessonPreviewRef.current.contains(e.target)) {
        return;
      }
      if (e.target.closest && (
        e.target.closest(`[data-lesson-preview-btn="${activeLessonPreviewId}"]`) ||
        e.target.closest(`[data-lesson-video-btn="${activeLessonPreviewId}"]`) ||
        e.target.closest(`[data-lesson-box="${activeLessonPreviewId}"]`)
      )) {
        return;
      }
      setActiveLessonPreviewId(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [activeLessonPreviewId]);

  // Helpers to resolve file URL, file type, and live session data for a lesson
  const getLessonFileUrl = (lesson) => {
    return lesson?.resource?.resource_url || (lesson?.lesson_content_type !== "video" ? lesson?.lesson_video_url : null) || lesson?.resource_url || (lesson?.contents || []).find(c => c.content_url)?.content_url || null;
  };

  const getLessonFileType = (lesson) => {
    const url = getLessonFileUrl(lesson) || "";
    const resType = lesson?.resource?.resource_type;
    if (resType) return resType;
    if (url.match(/\.(mp4|webm|ogg)$/i)) return "video";
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return "image";
    if (url.match(/\.(pdf)$/i)) return "pdf";
    if (url.match(/\.(mp3|wav|ogg)$/i)) return "audio";
    return "pdf";
  };

  const getLessonLiveData = (lesson) => {
    return lesson?.liveData || (lesson?.contents || []).find(c => c.type === "live")?.liveData || null;
  };

  const hasLessonPreview = (lesson) => {
    if (!lesson) return false;
    if (lesson.lesson_content_type === "video") {
      return Boolean(lesson.lesson_video_url);
    }
    if (lesson.lesson_content_type === "text" || lesson.lesson_content_type === "file") {
      return Boolean(getLessonFileUrl(lesson));
    }
    if (lesson.lesson_content_type === "live") {
      return Boolean(getLessonLiveData(lesson));
    }
    if (lesson.lesson_content_type === "quiz") {
      return true;
    }
    return false;
  };

  const toggleContentPreview = (contentId) => {
    setExpandedContents(prev => ({
      ...prev,
      [contentId]: !prev[contentId]
    }));
  };

  // Inline forms state
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);

  // Edit states
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);

  // Form contexts
  const [activeTopicIdForLesson, setActiveTopicIdForLesson] = useState(null);
  const [activeLessonIdForContent, setActiveLessonIdForContent] = useState(null);
  const [activeTopicIdForContent, setActiveTopicIdForContent] = useState(null);

  // Form states
  const [newTopicData, setNewTopicData] = useState({ title: "", description: "" });
  const [newLessonData, setNewLessonData] = useState({ title: "", status: "Published", type: "video", lessonFile: null, existingFileUrl: null, existingFileName: null, existingFileType: null, freePreview: false });
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [newContentData, setNewContentData] = useState({ title: "", type: "pdf", duration: "", pages: "", allow_download: true });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);


  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  // Quiz Builder State
  const [quizInstructions, setQuizInstructions] = useState("");
  const [quizDuration, setQuizDuration] = useState(15);
  const [quizPassingMarks, setQuizPassingMarks] = useState(70);
  const [quizAttempts, setQuizAttempts] = useState(1);
  const [quizStartDatetime, setQuizStartDatetime] = useState("");
  const [quizEndDatetime, setQuizEndDatetime] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([
    {
      id: 1,
      question_text: "",
      question_type: "single_mcq",
      question_marks: 5,
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false }
      ]
    }
  ]);

  // Live Session State
  const [livePlatform, setLivePlatform] = useState("google_meet");
  const [liveMeetingLink, setLiveMeetingLink] = useState("");
  const [liveMeetingPassword, setLiveMeetingPassword] = useState("");
  const [liveStartTime, setLiveStartTime] = useState("");
  const [liveEndTime, setLiveEndTime] = useState("");
  const [liveValidationErrors, setLiveValidationErrors] = useState({});
  const [liveSessionStatus, setLiveSessionStatus] = useState("SCHEDULED");
  const [isCancellingLiveSession, setIsCancellingLiveSession] = useState(false);

  const isLiveSessionInPast = Boolean(
    isEditingLesson &&
    newLessonData.type === "live" &&
    (
      (liveStartTime && !isNaN(new Date(liveStartTime).getTime()) && new Date(liveStartTime) <= new Date()) ||
      (liveEndTime && !isNaN(new Date(liveEndTime).getTime()) && new Date(liveEndTime) <= new Date())
    )
  );

  const handleAddQuestion = () => {
    setQuizQuestions(prev => [
      ...prev,
      {
        id: Date.now(),
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

  const handleRemoveQuestion = (qIndex) => {
    if (quizQuestions.length <= 1) {
      toast.error("A quiz must have at least 1 question.");
      return;
    }
    setQuizQuestions(prev => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setQuizQuestions(prev => {
      const updated = [...prev];
      const q = updated[qIndex];
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
      updated[qIndex] = updatedQ;
      return updated;
    });
  };

  const handleAddOption = (qIndex) => {
    setQuizQuestions(prev => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      if (opts.length >= 6) {
        toast.error("Maximum 6 options allowed per question.");
        return prev;
      }
      opts.push({ option_text: "", is_correct: false });
      updated[qIndex].options = opts;
      return updated;
    });
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    setQuizQuestions(prev => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      if (opts.length <= 2) {
        toast.error("Question must have at least 2 options.");
        return prev;
      }
      opts.splice(oIndex, 1);
      if (!opts.some(o => o.is_correct)) {
        opts[0].is_correct = true;
      }
      updated[qIndex].options = opts;
      return updated;
    });
  };

  const handleOptionTextChange = (qIndex, oIndex, text) => {
    setQuizQuestions(prev => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      opts[oIndex] = { ...opts[oIndex], option_text: text };
      updated[qIndex].options = opts;
      return updated;
    });
  };

  const handleOptionCorrectChange = (qIndex, oIndex) => {
    setQuizQuestions(prev => {
      const updated = [...prev];
      const q = updated[qIndex];
      const opts = q.options.map((opt, idx) => {
        if (q.question_type === "single_mcq" || q.question_type === "true_false") {
          return { ...opt, is_correct: idx === oIndex };
        } else {
          return idx === oIndex ? { ...opt, is_correct: !opt.is_correct } : opt;
        }
      });
      updated[qIndex].options = opts;
      return updated;
    });
  };

  // Validation error states
  const [topicTitleError, setTopicTitleError] = useState("");
  const [topicDescriptionError, setTopicDescriptionError] = useState("");
  const [lessonTitleError, setLessonTitleError] = useState("");
  const [lessonFileError, setLessonFileError] = useState("");
const [contentTitleError, setContentTitleError] = useState("");
const [contentFileError, setContentFileError] = useState("");

  useEffect(() => {
    setLessonFileError("");
  }, [newLessonData.type]);
  const [showQuizValidation, setShowQuizValidation] = useState(false);
  const [isViewOnlyQuiz, setIsViewOnlyQuiz] = useState(false);
  const [isDirectQuizAdd, setIsDirectQuizAdd] = useState(false);

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    confirmVariant: "danger",
    onConfirm: () => { }
  });

  const triggerConfirm = (
    title,
    message,
    onConfirm,
    confirmText = "Delete",
    confirmVariant = "danger"
  ) => {
    setConfirmModalState({
      isOpen: true,
      title,
      message,
      confirmText,
      confirmVariant,
      onConfirm
    });
  };

  const normalizeText = (value) => {
    return value?.replace(/\s+/g, " ").trim() || "";
  };

  const formatForDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n) => String(n).padStart(2, "0");
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      return "";
    }
  };

  // Topic specific lesson loading
  const [loadingLessons, setLoadingLessons] = useState({});

  // TO make topic edit form appear inline
  const [activeTopicIdForEdit, setActiveTopicIdForEdit] = useState(null);


  /* COMMENTED OUT PREVIOUS MOCK DATA STATE:
  // Frontend State-Driven Topics & Lessons list
  const [topics, setTopics] = useState([
    {
      id: 1,
      title: "Greetings and self introduction",
      description: "Covers common greeting phrases and self introduction basics.",
      lessons: [
        {
          id: 101,
          title: "Greetings and Introduction",
          status: "Published",
          contents: [
            { id: 201, title: "Lecture video", type: "video", detail: "Video • 12 min" },
            { id: 202, title: "Vocabulary handout", type: "pdf", detail: "PDF • 2 pages" }
          ]
        },
        {
          id: 102,
          title: "Practice greetings quiz",
          status: "Draft",
          contents: []
        }
      ]
    },
    {
      id: 2,
      title: "Introduction to Hiragana and Katakana",
      description: "Learn the basic Japanese writing scripts and phonetic pronunciation rules.",
      lessons: [
        {
          id: 103,
          title: "Hiragana Vowel Sounds",
          status: "Published",
          contents: [
            { id: 203, title: "Vowels pronunciation guide", type: "video", detail: "Video • 15 min" }
          ]
        }
      ]
    }
  ]);
  */

  // New Database-driven states:
  const [topics, setTopics] = useState([]);
  const [lessonsByTopic, setLessonsByTopic] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);



  // Course configuration states (derived from training prop)
  // Course configuration states (derived from training prop or verified assigned course)
  const [courseSettings, setCourseSettings] = useState({
    title: location.state?.course?.training_title || "",
    code: location.state?.course?.course_code || "",
    level: location.state?.course?.course_level || location.state?.course?.level || "N5",
    duration: location.state?.course?.training_duration_hours ? `${location.state.course.training_duration_hours} hrs` : "",
    mode: location.state?.course?.training_mode || "",
    fee: location.state?.course?.training_fee || ""
  });

  const [publishStatus, setPublishStatus] = useState(location.state?.course?.publish_status || "DRAFT");
  const [canPublish, setCanPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [trainingStatus, setTrainingStatus] = useState("ACTIVE");
  const [enrollmentStatus, setEnrollmentStatus] = useState("NOT_STARTED");
  const [trainingStartDate, setTrainingStartDate] = useState(null);
  const [trainingEndDate, setTrainingEndDate] = useState(null);

  const formatCourseDate = (value) => {
    if (!value) return "–";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "–";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };
  const [enrollmentUpdating, setEnrollmentUpdating] = useState(false);

  const isCoursePublished = String(publishStatus || location.state?.course?.publish_status || "").toUpperCase() === "PUBLISHED";

  const isLockedForModules = !isActive || trainingStatus === "COMPLETED";

  const fetchTrainingDetails = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${trainingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && response.data.training) {
        const t = response.data.training;
        setCourseSettings({
          title: t.training_title || "",
          code: t.course_code || "",
          level: t.course_level || t.level || "N5",
          duration: `${t.training_duration_hours || 20} hrs`,
          mode: t.training_mode || "Online",
          fee: t.training_fee || ""
        });
        setPublishStatus(t.publish_status || "DRAFT");
        setIsActive(t.is_active === undefined ? true : !!Number(t.is_active));
        setTrainingStatus(t.training_status || "ACTIVE");
        setCanPublish(!!t.can_publish);
        setEnrollmentStatus(t.enrollment_status || "NOT_STARTED");
        setTrainingStartDate(t.training_start_date || null);
        setTrainingEndDate(t.training_end_date || null);
      }
    } catch (error) {
      console.error("Failed to load training details:", error);
    }
  };

  useEffect(() => {
    setCourseSettings(prev => ({
      ...prev,
      title: location.state?.course?.training_title || ""
    }));
    if (location.state?.course?.publish_status) {
      setPublishStatus(location.state.course.publish_status);
    }
    if (trainingId) {
      fetchTrainingDetails();
    }
  }, [trainingId, location.state]);

  const [isAssigned, setIsAssigned] = useState(
    Boolean(location.state?.course && String(location.state.course.training_id) === String(trainingId))
  );
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Verify that the logged-in instructor is genuinely assigned to this course
  useEffect(() => {
    let isMounted = true;

    const verifyInstructorAccess = async () => {
      try {
        setCheckingAccess(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          if (isMounted) {
            setIsAssigned(false);
            setCheckingAccess(false);
          }
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/instructors/instructorCourses`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!isMounted) return;

        if (response.data.success) {
          const assignedCourses = response.data.courses || [];
          const matchedCourse = assignedCourses.find(
            (c) => String(c.training_id) === String(trainingId)
          );

          if (matchedCourse) {
            setIsAssigned(true);
            setCourseSettings({
              title: matchedCourse.training_title || "",
              code: matchedCourse.course_code || "",
              level: matchedCourse.course_level || matchedCourse.level || "N5",
              duration: `${matchedCourse.training_duration_hours || 20} hrs`,
              mode: matchedCourse.training_mode || "Online",
              fee: matchedCourse.training_fee || ""
            });
          } else if (response.data.training) {
            const t = response.data.training;
            setIsAssigned(true);
            setCourseSettings({
              title: t.training_title || "",
              code: t.course_code || "",
              level: t.course_level || t.level || "N5",
              duration: `${t.training_duration_hours || 20} hrs`,
              mode: t.training_mode || "Online",
              fee: t.training_fee || ""
            });
          } else {
            setIsAssigned(false);
          }
        } else {
          setIsAssigned(false);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error verifying instructor course assignment:", error);
        setIsAssigned(false);
      } finally {
        if (isMounted) {
          setCheckingAccess(false);
        }
      }
    };

    if (trainingId) {
      verifyInstructorAccess();
    }
  }, [trainingId]);

  const fetchStudents = async () => {
    // console.log("fetchStudents called");
    try {
      const token = sessionStorage.getItem("token");
      // console.log("Token:", sessionStorage.getItem("token"));
      // console.log("trainingId:", trainingId);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/training/${trainingId}/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents(response.data.data || []);
      // console.log("Students: ", response.data.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  // Fetch Topics from DB
  const fetchTopics = async (signal) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/topics/training/${trainingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal,
        }
      );
      if (response.data.success) {
        setTopics(response.data.topics || []);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      console.error("Failed to fetch topics:", error);
      toast.error("Failed to load modules from database.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  // Fetch Lessons for a specific Topic
  // const fetchLessonsForTopic = async (topicId) => {
  //   try {
  //     const token = sessionStorage.getItem("token");
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/lessons/topic/${topicId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` }
  //       }
  //     );
  //     if (response.data.success) {
  //       const mappedLessons = (response.data.lessons || []).map(lesson => {
  //         const contents = [];
  //         if (lesson.lesson_video_url) {
  //           contents.push({
  //             id: lesson.lesson_id + "_content",
  //             title: lesson.lesson_content_type === "video" ? "Lecture video" : lesson.lesson_content_type === "quiz" ? "Interactive Quiz" : "Resource document",
  //             type: lesson.lesson_content_type,
  //             detail: lesson.lesson_content_type === "video" 
  //               ? `Video • ${Math.ceil((lesson.lesson_duration || 0) / 60)} min` 
  //               : "Document"
  //           });
  //         }
  //         return {
  //           ...lesson,
  //           contents: contents
  //         };
  //       });
  //       setLessonsByTopic(prev => ({ ...prev, [topicId]: mappedLessons }));
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch lessons:", error);
  //   }
  // }; 

  const fetchLessonsForTopic = async (topicId) => {
    try {
      setLoadingLessons(prev => ({
        ...prev,
        [topicId]: true,
      }));

      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lessons/topic/${topicId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        const lessons = response.data.lessons || [];

        const mappedLessons = await Promise.all(
          lessons.map(async (lesson) => {
            const contents = [];
            let resource = null;
            let liveObj = null;

            if (lesson.lesson_content_type === "quiz") {
              let quizObj = null;
              try {
                const lessonRes = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lesson.lesson_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (lessonRes.data.success && lessonRes.data.quiz) {
                  quizObj = lessonRes.data.quiz;
                }
              } catch (err) {
                console.warn(`Failed to fetch quiz details for lesson ${lesson.lesson_id}:`, err);
              }

              const duration = quizObj?.quiz_duration_minutes || 15;
              const passing = quizObj?.passing_marks || 70;
              const attempts = quizObj?.allowed_attempts || 1;
              const qCount = quizObj?.total_questions || 0;

              contents.push({
                id: lesson.lesson_id + "_quiz",
                title: quizObj?.quiz_title || lesson.lesson_title || "Interactive Quiz",
                type: "quiz",
                detail: quizObj?.quiz_duration_minutes ? `Quiz • ${quizObj.quiz_duration_minutes} min` : "Quiz",
                quizData: quizObj,
                isQuizResource: true
              });
            } else if (lesson.lesson_content_type === "live") {
              try {
                const liveRes = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/${lesson.lesson_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (liveRes.data.success && liveRes.data.live_session) {
                  liveObj = liveRes.data.live_session;
                }
              } catch (err) {
                console.warn(`Failed to fetch live session details for lesson ${lesson.lesson_id}:`, err);
              }

              const platformName = liveObj?.meeting_platform === "zoom" ? "Zoom Meeting" : "Google Meet";
              const timeStr = liveObj?.start_time ? new Date(liveObj.start_time).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "Scheduled";

              contents.push({
                id: lesson.lesson_id + "_live",
                title: lesson.lesson_title || "Live Lecture",
                type: "live",
                detail: `${platformName} • ${timeStr}`,
                liveData: liveObj,
                isLiveResource: true
              });
            } else if (lesson.lesson_video_url) {
              if (lesson.lesson_content_type === "video") {
                // Lecture video is now accessed via the eye icon on the lesson header row
              } else if (lesson.lesson_content_type === "text") {
                contents.push({
                  id: lesson.lesson_id + "_content",
                  title: "Resource document",
                  type: "file",
                  detail: "File uploaded",
                  content_url: lesson.lesson_video_url
                });
              } else {
                contents.push({
                  id: lesson.lesson_id + "_content",
                  title: lesson.lesson_content_type === "quiz" ? "Interactive Quiz" : "Resource document",
                  type: lesson.lesson_content_type,
                  detail: lesson.lesson_content_type === "quiz" ? "Quiz" : "Document",
                  content_url: lesson.lesson_video_url
                });
              }
            }

            // Fetch primary resource details for text/file lessons
            try {
              const lessonRes = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lesson.lesson_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (lessonRes.data.success && lessonRes.data.resource) {
                resource = lessonRes.data.resource;
                const resType = resource.resource_type || "pdf";
                contents.push({
                  id: lesson.lesson_id + "_resource",
                  title: resource.resource_title || lesson.lesson_title || "Resource document",
                  type: resType,
                  detail: resType === "pdf" ? "PDF Document" : resType === "image" ? "Image Resource" : resType === "audio" ? "Audio File" : "Document",
                  content_url: resource.resource_url,
                  isPrimaryResource: true
                });
              } else if (lesson.lesson_content_type === "quiz" && lessonRes.data.success && lessonRes.data.quiz && contents.length === 0) {
                const quizObj = lessonRes.data.quiz;
                const duration = quizObj.quiz_duration_minutes || 15;
                const passing = quizObj.passing_marks || 70;
                const attempts = quizObj.allowed_attempts || 1;
                const qCount = quizObj.total_questions || 0;
                contents.push({
                  id: lesson.lesson_id + "_quiz",
                  title: quizObj.quiz_title || lesson.lesson_title || "Interactive Quiz",
                  type: "quiz",
                  detail: quizObj?.quiz_duration_minutes ? `Quiz • ${quizObj.quiz_duration_minutes} min` : "Quiz",
                  quizData: quizObj,
                  isQuizResource: true
                });
              }
            } catch (err) {
              console.warn(`Failed to fetch lesson details for ${lesson.lesson_id}:`, err);
            }

            try {
              const contentsRes = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/lessons-contents/${lesson.lesson_id}/contents`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (contentsRes.data.success && contentsRes.data.contents?.length > 0) {
                contentsRes.data.contents.forEach((c) => {
                  contents.push({
                    id: c.content_id,
                    title: c.content_title,
                    type: c.content_type,
                    detail: c.content_type === "pdf"
                      ? "PDF Document"
                      : c.content_type === "image"
                        ? "Image Resource"
                        : c.content_type === "audio"
                          ? "Audio File"
                          : "Document",
                    content_url: c.content_url,
                    download_url: c.download_url,
                    content_allow_download: !!c.content_allow_download,
                  });
                });
              }
            } catch (err) {
              console.warn(`Failed to fetch contents for lesson ${lesson.lesson_id}:`, err);
            }

            return {
              ...lesson,
              resource: resource,
              liveData: liveObj,
              contents: contents
            };
          })
        );
        setLessonsByTopic(prev => ({ ...prev, [topicId]: mappedLessons }));
        setExpandedLessons(prev => {
          const alreadyOpenLessonId = Object.keys(prev).find(
            id => prev[id] && mappedLessons.some(l => String(l.lesson_id) === String(id))
          );
          if (alreadyOpenLessonId) {
            return { [alreadyOpenLessonId]: true };
          }
          const firstVideo = mappedLessons.find(l => l.lesson_content_type === "video");
          return firstVideo ? { [firstVideo.lesson_id]: true } : {};
        });
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setLoadingLessons(prev => ({
        ...prev,
        [topicId]: false,
      }));
    }
  };

  useEffect(() => {
    if (topics.length > 0) {
      const firstTopicId = topics[0].topic_id;
      setExpandedTopics({ [firstTopicId]: true });
      fetchLessonsForTopic(firstTopicId);
    }
  }, [topics]);

  useEffect(() => {
    const controller = new AbortController();

    if (trainingId && isAssigned && !checkingAccess) {
      fetchStudents();
      fetchTopics(controller.signal);
    }

    return () => {
      controller.abort();
    };
  }, [trainingId, isAssigned, checkingAccess]);

  useEffect(() => {
    if (activeTab !== "students" || !trainingId || !isAssigned) return;

    const fetchStudentsTrainingProgress = async () => {
      try {
        setStudentsLoading(true);

        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lessons-progress/${trainingId}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStudents(response.data.students || []);
        console.log(response.data.contents);

      } catch (error) {
        console.error("Failed to fetch training students:", error);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudentsTrainingProgress();
  }, [activeTab, trainingId]);


  // Calculate totals
  const totalTopics = topics.length;
  const totalLessons = topics.reduce((sum, t) => sum + (t.topic_recording_count || 0), 0);

  /* COMMENTED OUT OLD ACCORDION TOGGLE HANDLERS:
  // Accordion handlers
  const toggleTopic = (id) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Accordion toggles for lessons
  const toggleLesson = (id) => {
    setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  };
  */

  // Accordion handlers (only one module and only one lesson open at a time):
  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => {
      const isCurrentlyOpen = !!prev[topicId];
      if (isCurrentlyOpen) {
        return {};
      }
      fetchLessonsForTopic(topicId);
      return { [topicId]: true };
    });
    setExpandedLessons({});
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => {
      const isCurrentlyOpen = !!prev[lessonId];
      return isCurrentlyOpen ? {} : { [lessonId]: true };
    });
  };

  // Topic Edit handlers
  const handleEditTopicClick = async (topic) => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/topics/${topic.topic_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        const fetchedTopic = response.data.topic;
        setNewTopicData({
          title: fetchedTopic.topic_title,
          description: fetchedTopic.topic_description || ""
        });
        setIsEditingTopic(true);
        setEditingTopicId(fetchedTopic.topic_id);
        setTopicTitleError("");
        setTopicDescriptionError("");
        // setShowTopicForm(true);
        setActiveTopicIdForEdit(fetchedTopic.topic_id);

        // automatically expand topic (single open)
        setExpandedTopics({ [fetchedTopic.topic_id]: true });
        setExpandedLessons({});
      }
    } catch (error) {
      console.error("Failed to preload topic details:", error);
      toast.error("Failed to load module details from API.");
    }
  };

  const handleCancelTopicForm = () => {
    setShowTopicForm(false);
    setIsEditingTopic(false);
    setEditingTopicId(null);
    setActiveTopicIdForEdit(null);
    setTopicTitleError("");
    setTopicDescriptionError("");

    setNewTopicData({ title: "", description: "" });
  };

  const handleViewQuizClick = async (topicId, lesson) => {
    if (isEditingLesson && editingLessonId === lesson.lesson_id && isViewOnlyQuiz) {
      handleCancelLessonForm();
      return;
    }
    setIsEditingLesson(true);
    setEditingLessonId(lesson.lesson_id);
    setActiveTopicIdForLesson(topicId);
    setIsViewOnlyQuiz(true);
    setShowQuizValidation(false);
    setLessonTitleError("");
    setNewLessonData({
      title: lesson.lesson_title,
      status: lesson.lesson_is_published ? "Published" : "Draft",
      type: "quiz",
      freePreview: lesson.lesson_content_type === "video" && [true, 1, "1", "true"].includes(lesson.lesson_is_free_preview),
      lessonFile: null,
      existingFileUrl: null,
      existingFileName: null,
      existingFileType: null
    });
    setQuizInstructions("");
    setQuizDuration(15);
    setQuizPassingMarks(70);
    setQuizAttempts(1);
    setQuizStartDatetime("");
    setQuizEndDatetime("");
    setQuizQuestions([]);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lesson.lesson_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success && res.data.quiz) {
        const qObj = res.data.quiz;
        setQuizInstructions(qObj.quiz_instructions || "");
        setQuizDuration(qObj.quiz_duration_minutes || 15);
        setQuizPassingMarks(qObj.passing_marks || 70);
        setQuizAttempts(qObj.allowed_attempts || 1);
        setQuizStartDatetime(formatForDateTimeLocal(qObj.quiz_start_datetime));
        setQuizEndDatetime(formatForDateTimeLocal(qObj.quiz_end_datetime));
        if (qObj.questions && Array.isArray(qObj.questions) && qObj.questions.length > 0) {
          setQuizQuestions(qObj.questions.map(q => ({
            id: q.question_id || Date.now() + Math.random(),
            question_text: q.question_text || "",
            question_type: q.question_type || "single_mcq",
            question_marks: q.question_marks || 5,
            options: (q.options || []).map(o => ({
              option_text: o.option_text || "",
              is_correct: !!o.is_correct
            }))
          })));
        }
      }
    } catch (err) {
      console.warn("Could not fetch quiz for view:", err);
    }
    setShowLessonForm(true);
  };

  const handleEditLessonClick = async (topicId, lesson) => {
    // if (isCoursePublished) {
    //   toast.error("Lessons cannot be edited once course is published.");
    //   return;
    // }

    if (isCoursePublished && lesson.lesson_content_type !== "live") {
      toast.error("Lessons cannot be edited once course is published.");
      return;
    }
    let existingFileUrl = lesson.resource?.resource_url || (lesson.lesson_content_type === "video" ? lesson.lesson_video_url : null);
    let existingFileName = lesson.resource?.resource_title || (lesson.lesson_content_type === "video" && lesson.lesson_video_url ? (lesson.lesson_title ? `${lesson.lesson_title}.mp4` : "Uploaded Video") : null);
    let existingFileType = lesson.resource?.resource_type || (lesson.lesson_content_type === "video" ? "video" : null);

    if (!existingFileUrl && (lesson.lesson_content_type === "text" || lesson.lesson_content_type === "file")) {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lesson.lesson_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          if (res.data.resource) {
            existingFileUrl = res.data.resource.resource_url;
            existingFileName = res.data.resource.resource_title || "Uploaded File";
            existingFileType = res.data.resource.resource_type;
          } else if (res.data.lesson?.lesson_video_url) {
            existingFileUrl = res.data.lesson.lesson_video_url;
            existingFileName = res.data.lesson.lesson_title ? `${res.data.lesson.lesson_title}.mp4` : "Uploaded Video";
            existingFileType = "video";
          }
        }
      } catch (err) {
        console.warn("Could not fetch existing lesson resource:", err);
      }
    }

    if (lesson.lesson_content_type === "quiz") {
      setIsViewOnlyQuiz(false);
      setShowQuizValidation(false);
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lesson.lesson_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success && res.data.quiz) {
          const qObj = res.data.quiz;
          setQuizInstructions(qObj.quiz_instructions || "");
          setQuizDuration(qObj.quiz_duration_minutes || 15);
          setQuizPassingMarks(qObj.passing_marks || 70);
          setQuizAttempts(qObj.allowed_attempts || 1);
          setQuizStartDatetime(formatForDateTimeLocal(qObj.quiz_start_datetime));
          setQuizEndDatetime(formatForDateTimeLocal(qObj.quiz_end_datetime));
          if (qObj.questions && qObj.questions.length > 0) {
            setQuizQuestions(qObj.questions);
          }
        }
      } catch (err) {
        console.warn("Could not fetch existing lesson quiz:", err);
      }
    }

    if (lesson.lesson_content_type === "live") {
      setLiveValidationErrors({});
      const initialStatus = lesson.liveData?.session_status || "SCHEDULED";
      setLiveSessionStatus(initialStatus);
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/${lesson.lesson_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success && res.data.live_session) {
          const ls = res.data.live_session;
          setLivePlatform(ls.meeting_platform || "google_meet");
          setLiveMeetingLink(ls.meeting_link || "");
          setLiveMeetingPassword(ls.meeting_password || "");
          setLiveStartTime(formatForDateTimeLocal(ls.start_time));
          setLiveEndTime(formatForDateTimeLocal(ls.end_time));
          setLiveSessionStatus(ls.session_status || "SCHEDULED");
        }
      } catch (err) {
        console.warn("Could not fetch live session details:", err);
      }
    } else {
      setLiveSessionStatus("SCHEDULED");
    }

    setNewLessonData({
      title: lesson.lesson_title,
      status: lesson.lesson_is_published ? "Published" : "Draft",
      type: lesson.lesson_content_type === "quiz" ? "quiz" : lesson.lesson_content_type === "live" ? "live" : (lesson.lesson_content_type === "text" || lesson.lesson_content_type === "file") ? "file" : "video",
      freePreview: lesson.lesson_content_type === "video" && [true, 1, "1", "true"].includes(lesson.lesson_is_free_preview),
      lessonFile: null,
      existingFileUrl,
      existingFileName,
      existingFileType
    });
    setIsEditingLesson(true);
    setEditingLessonId(lesson.lesson_id);
    setActiveTopicIdForLesson(topicId);
    setExpandedLessons({ [lesson.lesson_id]: true });
    setLessonTitleError("");
    setShowLessonForm(true);
  };

  const handleCancelLessonForm = () => {
    setShowLessonForm(false);
    setIsEditingLesson(false);
    setEditingLessonId(null);
    setLessonTitleError("");
    setLessonFileError("");
    setShowQuizValidation(false);
    setIsViewOnlyQuiz(false);
    setIsDirectQuizAdd(false);
    setNewLessonData({ title: "", status: "Published", type: "video", lessonFile: null, existingFileUrl: null, existingFileName: null, existingFileType: null, freePreview: false });
    setLivePlatform("google_meet");
    setLiveMeetingLink("");
    setLiveMeetingPassword("");
    setLiveStartTime("");
    setLiveEndTime("");
    setLiveValidationErrors({});
    setLiveSessionStatus("SCHEDULED");
    setIsCancellingLiveSession(false);
    setQuizInstructions("");
    setQuizDuration(15);
    setQuizPassingMarks(70);
    setQuizAttempts(1);
    setQuizStartDatetime("");
    setQuizEndDatetime("");
    setQuizQuestions([
      {
        id: 1,
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

  const handleCancelLiveSession = async () => {
    if (!editingLessonId) return;

    if (
      (liveStartTime && new Date(liveStartTime) <= new Date()) ||
      (liveEndTime && new Date(liveEndTime) <= new Date())
    ) {
      toast.error("Cannot cancel a live session that has already started or ended.");
      return;
    }

    triggerConfirm(
      "Cancel Live Session",
      "Are you sure you want to cancel this live session? Once cancelled, it cannot be rescheduled or edited.",
      async () => {
        try {
          setIsCancellingLiveSession(true);
          const token = sessionStorage.getItem("token");
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/${editingLessonId}`,
            { action: "CANCEL" },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            toast.success("Live session has been cancelled.");
            setLiveSessionStatus("CANCELLED");
            if (activeTopicIdForLesson) {
              await fetchLessonsForTopic(activeTopicIdForLesson);
            } else {
              await fetchTopics();
            }
          }
        } catch (error) {
          console.error("Failed to cancel live session:", error);
          toast.error(error.response?.data?.message || "Failed to cancel live session.");
        } finally {
          setIsCancellingLiveSession(false);
        }
      },
      "Yes, Cancel Session",
      "danger"
    );
  };

  /* COMMENTED OUT OLD STATE-DRIVEN SUBMIT HANDLERS:
  // Add / Edit Topic Action
  const handleAddTopicSubmit = (e) => {
    e.preventDefault();
    if (!newTopicData.title.trim()) return;

    if (isEditingTopic) {
      setTopics(prev => prev.map(t => {
        if (t.id === editingTopicId) {
          return {
            ...t,
            title: newTopicData.title,
            description: newTopicData.description || "No description provided."
          };
        }
        return t;
      }));
      toast.success("Module section updated successfully!");
    } else {
      const newTopic = {
        id: Date.now(),
        title: newTopicData.title,
        description: newTopicData.description || "No description provided.",
        lessons: []
      };
      setTopics(prev => [...prev, newTopic]);
      setExpandedTopics({ [newTopic.id]: true });
      toast.success("New module section added successfully!");
    }
    handleCancelTopicForm();
  };

  // Add / Edit Lesson Action
  const handleAddLessonSubmit = (e) => {
    e.preventDefault();
    if (!newLessonData.title.trim()) return;

    if (isEditingLesson) {
      setTopics(prev => prev.map(topic => {
        if (topic.id === activeTopicIdForLesson) {
          return {
            ...topic,
            lessons: topic.lessons.map(l => {
              if (l.id === editingLessonId) {
                return {
                  ...l,
                  title: newLessonData.title,
                  status: newLessonData.status
                };
              }
              return l;
            })
          };
        }
        return topic;
      }));
      toast.success("Lesson updated successfully!");
    } else {
      setTopics(prev => prev.map(topic => {
        if (topic.id === activeTopicIdForLesson) {
          return {
            ...topic,
            lessons: [
              ...topic.lessons,
              {
                id: Date.now(),
                title: newLessonData.title,
                status: newLessonData.status,
                contents: []
              }
            ]
          };
        }
        return topic;
      }));
      toast.success("New lesson added successfully!");
    }
    handleCancelLessonForm();
  };

  // Add Content Action
  const handleAddContentSubmit = (e) => {
    e.preventDefault();
    if (!newContentData.title.trim()) return;

    let detail = "";
    if (newContentData.type === "video") {
      detail = `Video • ${newContentData.duration || "10"} min`;
    } else if (newContentData.type === "pdf") {
      detail = `PDF • ${newContentData.pages || "2"} pages`;
    } else if (newContentData.type === "image") {
      detail = "Image Resource";
    } else {
      detail = "Interactive Quiz";
    }

    setTopics(prev => prev.map(topic => ({
      ...topic,
      lessons: topic.lessons.map(lesson => {
        if (lesson.id === activeLessonIdForContent) {
          return {
            ...lesson,
            contents: [
              ...lesson.contents,
              {
                id: Date.now(),
                title: newContentData.title,
                type: newContentData.type,
                detail: detail
              }
            ]
          };
        }
        return lesson;
      })
    })));

    setNewContentData({ title: "", type: "video", duration: "", pages: "" });
    setSelectedFile(null);
    setShowContentForm(false);
    toast.success("Content item added successfully!");
  };

  // Delete handlers (UI state only)
  const handleDeleteTopicLocal = (topicId) => {
    if (window.confirm("Are you sure you want to delete this module?")) {
      setTopics(prev => prev.filter(t => t.id !== topicId));
      toast.info("Module removed.");
    }
  };

  const handleDeleteLesson = (topicId, lessonId) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setTopics(prev => prev.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            lessons: topic.lessons.filter(l => l.id !== lessonId)
          };
        }
        return topic;
      }));
      toast.info("Lesson removed.");
    }
  };
  */

  // New Database-linked Action Handlers:
  /* was:
  const handleTogglePublish = async () => {
    const isCurrentlyPublished = publishStatus === "PUBLISHED";

    triggerConfirm(
      isCurrentlyPublished ? "Unpublish Training" : "Publish Training",
      isCurrentlyPublished
        ? "Students will no longer be able to see or enroll in this training. Continue?"
        : "This training will become visible to students for enrollment. Continue?",
      async () => {
        try {
          setPublishing(true);
          const token = sessionStorage.getItem("token");
          const endpoint = isCurrentlyPublished ? "unpublish" : "publish";

          const response = await axios.put(
            // `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${training.training_id}/${endpoint}`,
            `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${trainingId}/${endpoint}`,

  
  */
  const handleTogglePublish = async () => {
    const isCurrentlyPublished = publishStatus === "PUBLISHED";

    if (!isCurrentlyPublished) {
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
      const startDateStr = trainingStartDate ? String(trainingStartDate).slice(0, 10) : null;

      if (startDateStr && startDateStr <= todayStr) {
        toast.error(
          "This course's start date has already passed. Please update the start date before publishing — once published, the start date cannot be edited."
        );
        return;
      }
    }

    triggerConfirm(
      isCurrentlyPublished ? "Unpublish Training" : "Publish Training",
      isCurrentlyPublished
        ? "Students will no longer be able to see or enroll in this training. Continue?"
        : "This training will become visible to students for enrollment. Continue?",
      async () => {
        try {
          setPublishing(true);
          const token = sessionStorage.getItem("token");
          const endpoint = isCurrentlyPublished ? "unpublish" : "publish";

          const response = await axios.put(
            // `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${training.training_id}/${endpoint}`,
            `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${trainingId}/${endpoint}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            toast.success(
              isCurrentlyPublished
                ? "Training unpublished. Students can no longer see it."
                : "Training published successfully!"
            );
            setPublishStatus(isCurrentlyPublished ? "DRAFT" : "PUBLISHED");
            setEnrollmentStatus(isCurrentlyPublished ? "NOT_STARTED" : "OPEN");
            fetchTrainingDetails();
          }
        } catch (error) {
          console.error("Failed to update publish status:", error);
          toast.error(
            error.response?.data?.message || "Failed to update publish status."
          );
        } finally {
          setPublishing(false);
        }
      },
      isCurrentlyPublished ? "Unpublish" : "Publish",
      isCurrentlyPublished ? "danger" : "success"
    );
  };

  const hasTrainingStarted = trainingStartDate
    ? new Date() >= new Date(trainingStartDate)
    : false;

  const handleToggleEnrollment = async () => {
    const isCurrentlyOpen = enrollmentStatus === "OPEN";

    triggerConfirm(
      isCurrentlyOpen ? "Stop Enrollment" : "Start Enrollment",
      isCurrentlyOpen
        ? "New students will no longer be able to enroll. Already-enrolled students are unaffected."
        : "Students will be able to enroll in this course.",
      async () => {
        try {
          setEnrollmentUpdating(true);
          const token = sessionStorage.getItem("token");
          const endpoint = isCurrentlyOpen ? "stop" : "start";

          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${trainingId}/${endpoint}-enrollment`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success !== false) {
            toast.success(
              isCurrentlyOpen
                ? "Enrollment stopped."
                : "Enrollment opened. Students can now enroll."
            );
            setEnrollmentStatus(isCurrentlyOpen ? "CLOSED" : "OPEN");
          }
        } catch (error) {
          console.error("Failed to update enrollment status:", error);
          toast.error(
            error.response?.data?.message || "Failed to update enrollment status."
          );
        } finally {
          setEnrollmentUpdating(false);
        }
      },
      isCurrentlyOpen ? "Stop Enrollment" : "Start Enrollment",
      isCurrentlyOpen ? "danger" : "success"
    );
  };

  const handleAddTopicSubmit = async (e) => {
    e.preventDefault();
    const normalizedTitle = normalizeText(newTopicData.title);
    let hasError = false;

    if (!normalizedTitle) {
      setTopicTitleError("Module title is required");
      hasError = true;
    } else {
      setTopicTitleError("");
    }

    const plainDescription = (newTopicData.description || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!plainDescription) {
      setTopicDescriptionError("Module description is required");
      hasError = true;
    } else if (newTopicData.description.length > 700) {
      setTopicDescriptionError("Module description must not exceed 700 characters.");
      hasError = true;
    } else {
      setTopicDescriptionError("");
    }

    if (hasError) {
      toast.error(COMMON_VALIDATION_MSG, { toastId: "form-validation" });
      return;
    }

    setNewTopicData(prev => ({ ...prev, title: normalizedTitle }));
    try {
      const token = sessionStorage.getItem("token");
      if (isEditingTopic) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/topics/${editingTopicId}`,
          {
            training_id: trainingId,
            topic_title: normalizedTitle,
            topic_description: newTopicData.description
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (response.data.success) {
          toast.success("Module section updated successfully!");
          handleCancelTopicForm();
          fetchTopics();
          fetchTrainingDetails();
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/topics/`,
          {
            training_id: trainingId,
            topic_title: normalizedTitle,
            topic_description: newTopicData.description
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (response.data.success) {
          toast.success("New module section added successfully!");
          handleCancelTopicForm();
          fetchTopics();
          fetchTrainingDetails();
        }
      }
    } catch (error) {
      console.error("Failed to save topic:", error);
      toast.error(error.response?.data?.message || "Failed to save module section.");
    }
  };

  const getLessonUploadAccept = (type) => {
    if (type === "file" || type === "text") {
      return ".pdf,.doc,.docx,.txt";
    }
    if (type === "quiz") {
      return ".xlsx,.xls,.csv,.json";
    }
    return "video/mp4,video/webm";
  };

  const mapLessonTypeToContentType = (type) => {
    if (type === "quiz") return "quiz";
    if (type === "live") return "live";
    if (type === "file" || type === "text") return "text";
    return "video";
  };

    const handleAddLessonSubmit = async (e) => {
    e.preventDefault();

    if (newLessonData.type === "live" && isEditingLesson && liveSessionStatus === "CANCELLED") {
      toast.error("This live session is cancelled and cannot be modified or rescheduled.");
      setIsSubmittingLesson(false);
      return;
    }

        const normalizedTitle = normalizeText(newLessonData.title);
    const itemLabel =
      newLessonData.type === "quiz" ? "Quiz" : newLessonData.type === "live" ? "Live session" : "Lesson";

    // ---- 1. Title (all form types) ----
    let titleError = "";
    if (!normalizedTitle) {
      titleError = `${itemLabel} title is required.`;
    } else if (normalizedTitle.length < 3) {
      titleError = `${itemLabel} title must be at least 3 characters.`;
    } else if (normalizedTitle.length > 200) {
      titleError = `${itemLabel} title must not exceed 200 characters.`;
    } else {
      const currentTopicLessons = lessonsByTopic[activeTopicIdForLesson] || [];
      const isDuplicate = currentTopicLessons.some(l =>
        l.lesson_title?.trim().toLowerCase() === normalizedTitle.toLowerCase() &&
        (!isEditingLesson || l.lesson_id !== editingLessonId)
      );
      if (isDuplicate) {
        titleError = `A ${itemLabel.toLowerCase()} with this title already exists in this module.`;
      }
    }

    // ---- 2. File (video / file lessons, add mode only) ----
    let fileError = "";
    if (
      newLessonData.type !== "live" &&
      newLessonData.type !== "quiz" &&
      !isEditingLesson &&
      !newLessonData.lessonFile
    ) {
      fileError = "Please upload a lesson file.";
    }

    // ---- 3. Live session ----
    const liveErrors = {};
    if (newLessonData.type === "live") {
      const meetingUrlError = validateMeetingUrl(liveMeetingLink, livePlatform);
      if (meetingUrlError) liveErrors.meeting_link = meetingUrlError;
      if (!liveStartTime) liveErrors.start_time = "Start date and time is required.";
      if (liveEndTime && liveStartTime && new Date(liveEndTime) <= new Date(liveStartTime)) {
        liveErrors.end_time = "End date & time must be after start date & time.";
      }
    }

    // ---- 4. Quiz ----
    const isQuizInvalid = () => {
      if (!quizDuration || Number(quizDuration) < 1 || Number(quizDuration) > 300) return true;
      if (!quizPassingMarks || Number(quizPassingMarks) < 1 || Number(quizPassingMarks) > 100) return true;
      if (!quizAttempts || Number(quizAttempts) < 1 || Number(quizAttempts) > 10) return true;
      const now = new Date();
      if (quizStartDatetime && new Date(quizStartDatetime) < now) return true;
      if (quizEndDatetime && new Date(quizEndDatetime) < now) return true;
      if (quizStartDatetime && quizEndDatetime && new Date(quizEndDatetime) <= new Date(quizStartDatetime)) return true;
      if (!quizQuestions || quizQuestions.length === 0) return true;
      return quizQuestions.some(q => {
        if (!q.question_text || !q.question_text.trim()) return true;
        if (q.options.some(o => !o.option_text || !o.option_text.trim())) return true;
        if (q.question_type !== "true_false") {
          const texts = q.options.map(o => o.option_text.trim().toLowerCase());
          if (new Set(texts).size !== texts.length) return true;
        }
        return !q.options.some(o => o.is_correct);
      });
    };
    const quizInvalid = newLessonData.type === "quiz" && isQuizInvalid();

    // ---- Show every inline error at once ----
    setLessonTitleError(titleError);
    setLessonFileError(fileError);
    if (newLessonData.type === "live") setLiveValidationErrors(liveErrors);
    if (newLessonData.type === "quiz") setShowQuizValidation(true);

    // ---- One common toast ----
    if (titleError || fileError || Object.keys(liveErrors).length > 0 || quizInvalid) {
      toast.error(COMMON_VALIDATION_MSG, { toastId: "form-validation" });
      setIsSubmittingLesson(false);
      return;
    }

    setNewLessonData(prev => ({ ...prev, title: normalizedTitle }));
    setIsSubmittingLesson(true);

    let uploadToastId = null;

    try {
      const token = sessionStorage.getItem("token");

      if (newLessonData.type === "quiz") {
        const quizPayload = {
          topic_id: activeTopicIdForLesson,
          lesson_title: normalizedTitle,
          lesson_content_type: "quiz",
          lesson_is_free_preview: newLessonData.type === "video" && newLessonData.freePreview ? "true" : "false",
          lesson_is_published: newLessonData.status === "Published" ? "true" : "false",
          quiz_title: normalizedTitle,
          quiz_instructions: quizInstructions || "Complete all questions.",
          quiz_duration_minutes: Number(quizDuration) || 15,
          passing_marks: Number(quizPassingMarks) || 70,
          allowed_attempts: Number(quizAttempts) || 1,
          quiz_start_datetime: quizStartDatetime ? quizStartDatetime : null,
          quiz_end_datetime: quizEndDatetime ? quizEndDatetime : null,
          questions: quizQuestions.map((q, idx) => ({
            question_text: q.question_text.trim(),
            question_type: q.question_type,
            question_marks: Number(q.question_marks) || 5,
            question_order: idx + 1,
            options: q.options.map((opt, oIdx) => ({
              option_text: opt.option_text.trim(),
              is_correct: !!opt.is_correct,
              option_order: oIdx + 1
            }))
          }))
        };

        if (isEditingLesson) {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${editingLessonId}`,
            quizPayload,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
          );
          if (response.data.success) {
            toast.success("Quiz lesson updated successfully!");
            const currentEditingId = editingLessonId;
            handleCancelLessonForm();
            await fetchLessonsForTopic(activeTopicIdForLesson);
            if (currentEditingId) {
              setExpandedLessons({ [currentEditingId]: true });
            }
          }
        } else {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/lessons/`,
            quizPayload,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
          );
          if (response.data.success) {
            toast.success("New Quiz lesson added successfully!");
            handleCancelLessonForm();
            await fetchLessonsForTopic(activeTopicIdForLesson);
            if (response.data.lessonId) {
              setExpandedLessons({ [response.data.lessonId]: true });
            }
            fetchTopics();
            fetchTrainingDetails();
          }
        }
      } else if (newLessonData.type === "live") {
        const liveErrors = {};
        const meetingUrlError = validateMeetingUrl(liveMeetingLink, livePlatform);
        if (meetingUrlError) {
          liveErrors.meeting_link = meetingUrlError;
        }
        if (!liveStartTime) {
          liveErrors.start_time = "Start date and time is required.";
        }
        if (liveEndTime && liveStartTime && new Date(liveEndTime) <= new Date(liveStartTime)) {
          liveErrors.end_time = "End date & time must be after start date & time.";
        }
        if (Object.keys(liveErrors).length > 0) {
          setLiveValidationErrors(liveErrors);
          toast.error(COMMON_VALIDATION_MSG);
          setIsSubmittingLesson(false);
          return;
        }

        try {
          const token = sessionStorage.getItem("token");
          const lessonPayload = {
            topic_id: activeTopicIdForLesson,
            lesson_title: normalizedTitle,
            lesson_content_type: "live",
            lesson_is_free_preview: newLessonData.type === "video" && newLessonData.freePreview ? "true" : "false",
            lesson_is_published: newLessonData.status === "Published" ? "true" : "false",
          };

          if (isEditingLesson) {
            await axios.put(
              `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${editingLessonId}`,
              lessonPayload,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            try {
              await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/${editingLessonId}`,
                {
                  meeting_platform: livePlatform,
                  meeting_link: liveMeetingLink.trim(),
                  meeting_password: liveMeetingPassword?.trim() || null,
                  start_time: liveStartTime,
                  end_time: liveEndTime || null
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (putErr) {
              if (putErr.response?.status === 404) {
                await axios.post(
                  `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/`,
                  {
                    lesson_id: editingLessonId,
                    meeting_platform: livePlatform,
                    meeting_link: liveMeetingLink.trim(),
                    meeting_password: liveMeetingPassword?.trim() || null,
                    start_time: liveStartTime,
                    end_time: liveEndTime || null
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } else {
                throw putErr;
              }
            }

            toast.success("Live session updated successfully!");
            const currentEditingId = editingLessonId;
            handleCancelLessonForm();
            await fetchLessonsForTopic(activeTopicIdForLesson);
            if (currentEditingId) {
              setExpandedLessons({ [currentEditingId]: true });
            }
          } else {
            const res = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/lessons/`,
              lessonPayload,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const newLessonId = res.data.lessonId || res.data.lesson?.lesson_id;

            if (newLessonId) {
              await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/`,
                {
                  lesson_id: newLessonId,
                  meeting_platform: livePlatform,
                  meeting_link: liveMeetingLink.trim(),
                  meeting_password: liveMeetingPassword?.trim() || null,
                  start_time: liveStartTime,
                  end_time: liveEndTime || null
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            }

            toast.success("New Live session added successfully!");
            handleCancelLessonForm();
            await fetchLessonsForTopic(activeTopicIdForLesson);
            if (newLessonId) {
              setExpandedLessons({ [newLessonId]: true });
            }
            fetchTopics();
            fetchTrainingDetails();
          }
        } catch (err) {
          console.error("Live session save error:", err);
          toast.error(err.response?.data?.message || "Failed to save live session.");
        } finally {
          setIsSubmittingLesson(false);
        }
        return;
      } else {
        const formData = new FormData();
        formData.append("topic_id", activeTopicIdForLesson);
        formData.append("lesson_title", normalizedTitle);
        formData.append("lesson_is_free_preview", newLessonData.type === "video" && newLessonData.freePreview ? "true" : "false");
        formData.append("lesson_is_published", newLessonData.status === "Published" ? "true" : "false");
        formData.append("lesson_content_type", mapLessonTypeToContentType(newLessonData.type));

        if (newLessonData.lessonFile) {
          formData.append("lesson_video", newLessonData.lessonFile);
          if (newLessonData.type === "video") {
            uploadToastId = toast.loading("Uploading lesson video, please wait, this process can take time...");
          } else {
            uploadToastId = toast.loading("Uploading lesson file, please wait, this process can take time...");
          }
        }

        if (isEditingLesson) {
          const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${editingLessonId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
              }
            }
          );
          if (uploadToastId) toast.dismiss(uploadToastId);
          if (response.data.success) {
            toast.success("Lesson updated successfully!");
            const currentEditingId = editingLessonId;
            handleCancelLessonForm();
            await fetchLessonsForTopic(activeTopicIdForLesson);
            if (currentEditingId) {
              setExpandedLessons({ [currentEditingId]: true });
            }
          }
        } else {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/lessons/`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
              }
            }
          );
          if (uploadToastId) toast.dismiss(uploadToastId);
          if (response.data.success) {
            toast.success("New lesson added successfully!");
            handleCancelLessonForm();
            await fetchLessonsForTopic(activeTopicIdForLesson);
            if (response.data.lessonId) {
              setExpandedLessons({ [response.data.lessonId]: true });
            }
            fetchTopics();
            fetchTrainingDetails();
          }
        }
      }
    } catch (error) {
      if (uploadToastId) toast.dismiss(uploadToastId);
      console.error("Failed to save lesson:", error);
      toast.error(error.response?.data?.message || "Failed to save lesson.");
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  const handleAddContentSubmit = async (e) => {
    e.preventDefault();
        const normalizedTitle = normalizeText(newContentData.title);

    const titleErr = normalizedTitle ? "" : "Content title is required.";
    const fileErr = selectedFile ? "" : "Please upload a file.";
    setContentTitleError(titleErr);
    setContentFileError(fileErr);

    if (titleErr || fileErr) {
      toast.error(COMMON_VALIDATION_MSG, { toastId: "form-validation" });
      return;
    }
    setNewContentData(prev => ({ ...prev, title: normalizedTitle }));

    if (!selectedFile) {
      toast.error("Please upload a file before submitting.");
      return;
    }

    setIsSubmittingContent(true);
    let uploadToastId = null;
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("content_title", normalizedTitle);
      formData.append("content_type", newContentData.type);
      formData.append("content_file", selectedFile);
      formData.append("content_allow_download", newContentData.allow_download ? "true" : "false");

      uploadToastId = toast.loading("Uploading content file, please wait, this process can take time...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/lessons-contents/${activeLessonIdForContent}/contents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      if (uploadToastId) toast.dismiss(uploadToastId);
      if (response.data.success) {
        toast.success("Resource added successfully!");
        setExpandedLessons({ [activeLessonIdForContent]: true });

        const newContentItem = {
          id: response.data.content_id || Date.now(),
          title: normalizedTitle,
          type: newContentData.type,
          detail: newContentData.type === "pdf"
            ? "PDF Document"
            : newContentData.type === "image"
              ? "Image Resource"
              : newContentData.type === "audio"
                ? "Audio File"
                : "Document",
          content_allow_download: !!newContentData.allow_download,
        };

        if (activeTopicIdForContent) {
          setLessonsByTopic(prev => {
            const currentLessons = prev[activeTopicIdForContent] || [];
            const updatedLessons = currentLessons.map(l => {
              if (l.lesson_id === activeLessonIdForContent) {
                return {
                  ...l,
                  contents: [...(l.contents || []), newContentItem]
                };
              }
              return l;
            });
            return { ...prev, [activeTopicIdForContent]: updatedLessons };
          });
        }

        setShowContentForm(false);
        setNewContentData({ title: "", type: "pdf", duration: "", pages: "", allow_download: true });
        setSelectedFile(null);
        if (activeTopicIdForContent) {
          fetchLessonsForTopic(activeTopicIdForContent);
        } else {
          fetchTopics();
          fetchTrainingDetails();
        }
      }
    } catch (error) {
      if (uploadToastId) toast.dismiss(uploadToastId);
      console.error("Failed to add content:", error);
      toast.error(error.response?.data?.message || "Failed to add content resource.");
    } finally {
      setIsSubmittingContent(false);
    }
  };

  const handleDeleteTopicLocal = (topicId) => {
    triggerConfirm(
      "Delete Module Confirmation",
      "Are you sure you want to delete this module section?",
      async () => {
        try {
          const token = sessionStorage.getItem("token");
          const response = await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/api/topics/${topicId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          if (response.data.success) {
            toast.success("Module section deleted successfully.");
            fetchTopics();
            fetchTrainingDetails();
          }
        } catch (error) {
          console.error("Failed to delete topic:", error);
          toast.error(error.response?.data?.message || "Failed to delete module. Remove lessons first.");
        }
      }
    );
  };

  const handleDeleteLesson = (topicId, lessonId, contentType) => {
    if (isCoursePublished) {
      toast.error("Lessons cannot be deleted once course is published.");
      return;
    }

    // if (isCoursePublished && contentType !== "live") {
    //   toast.error("Lessons cannot be deleted once course is published.");
    //   return;
    // }
    const isLive = contentType === "live";
    const isQuiz = contentType === "quiz";
    triggerConfirm(
      isLive ? "Delete Live Session Confirmation" : isQuiz ? "Delete Quiz Confirmation" : "Delete Lesson Confirmation",
      isLive ? "Are you sure you want to delete this live session?" : isQuiz ? "Are you sure you want to delete this quiz?" : "Are you sure you want to delete this lesson?",
      async () => {
        toast.dismiss();
        setDeletingLessonId(lessonId);

        // Optimistically remove from state for instant UI update
        setLessonsByTopic(prev => {
          const currentLessons = prev[topicId] || [];
          return {
            ...prev,
            [topicId]: currentLessons.filter(l => String(l.lesson_id) !== String(lessonId))
          };
        });

        try {
          const token = sessionStorage.getItem("token");
          if (isLive) {
            try {
              await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/${lessonId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (liveErr) {
              console.warn("Could not delete live session record:", liveErr);
            }
          }
          try {
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lessonId}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
          } catch (lessonErr) {
            // If already deleted or cascaded (404), treat as success
            if (lessonErr.response?.status !== 404) {
              throw lessonErr;
            }
          }

          toast.success(isLive ? "Live session deleted successfully." : isQuiz ? "Quiz deleted successfully." : "Lesson deleted successfully.");
          fetchLessonsForTopic(topicId);
          fetchTopics();
          fetchTrainingDetails();
        } catch (error) {
          console.error("Failed to delete lesson:", error);
          toast.error(error.response?.data?.message || (isLive ? "Failed to delete live session." : isQuiz ? "Failed to delete quiz." : "Failed to delete lesson."));
          fetchLessonsForTopic(topicId);
        } finally {
          setDeletingLessonId(null);
        }
      }
    );
  };

  const handleToggleContentDownload = async (content, topicId, lessonId) => {
    const currentVal = !!content.content_allow_download;
    const newVal = !currentVal;

    // Optimistic UI update
    setLessonsByTopic(prev => {
      const currentLessons = prev[topicId] || [];
      const updatedLessons = currentLessons.map(l => {
        if (l.lesson_id === lessonId) {
          return {
            ...l,
            contents: (l.contents || []).map(c => {
              if (c.id === content.id) {
                return { ...c, content_allow_download: newVal };
              }
              return c;
            })
          };
        }
        return l;
      });
      return { ...prev, [topicId]: updatedLessons };
    });

    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("content_title", content.title);
      formData.append("content_allow_download", newVal ? "true" : "false");

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/lessons-contents/contents/${content.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.success) {
        toast.success(newVal ? "Student download enabled." : "Student download disabled.");
      }
    } catch (err) {
      console.error("Failed to update download permission:", err);
      toast.error(err.response?.data?.message || "Failed to update download permission.");
      // Rollback optimistic update
      setLessonsByTopic(prev => {
        const currentLessons = prev[topicId] || [];
        const updatedLessons = currentLessons.map(l => {
          if (l.lesson_id === lessonId) {
            return {
              ...l,
              contents: (l.contents || []).map(c => {
                if (c.id === content.id) {
                  return { ...c, content_allow_download: currentVal };
                }
                return c;
              })
            };
          }
          return l;
        });
        return { ...prev, [topicId]: updatedLessons };
      });
    }
  };

  const handleDeleteContent = (contentId, topicId, contentType, lessonId) => {
    triggerConfirm(
      "Delete Content Confirmation",
      contentType === "live"
        ? "Are you sure you want to delete this live session?"
        : "Are you sure you want to delete this content item?",
      async () => {
        try {
          const token = sessionStorage.getItem("token");

          if (contentType === "live") {
            toast.dismiss();
            setDeletedContentIds(prev => ({ ...prev, [contentId]: true }));
            setLessonsByTopic(prev => {
              const currentLessons = prev[topicId] || [];
              return {
                ...prev,
                [topicId]: currentLessons.filter(l => String(l.lesson_id) !== String(lessonId))
              };
            });

            try {
              await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/live-sessions/${lessonId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (liveErr) {
              console.warn("Could not delete live session record:", liveErr);
            }
            try {
              await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lessonId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (lessonErr) {
              if (lessonErr.response?.status !== 404) throw lessonErr;
            }

            toast.success("Live session deleted successfully.");
            fetchLessonsForTopic(topicId);
            fetchTopics();
            fetchTrainingDetails();
            return;
          }

          setDeletedContentIds(prev => ({ ...prev, [contentId]: true }));
          setLessonsByTopic(prev => {
            const currentLessons = prev[topicId] || [];
            const updatedLessons = currentLessons.map(l => ({
              ...l,
              contents: (l.contents || []).filter(c => String(c.id) !== String(contentId))
            }));
            return { ...prev, [topicId]: updatedLessons };
          });

          if (!String(contentId).includes("_") && !isNaN(Number(contentId))) {
            await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/api/lessons-contents/contents/${contentId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
          toast.success("Content removed successfully.");
        } catch (error) {
          console.error("Failed to delete content:", error);
          toast.error(error.response?.data?.message || "Failed to delete content.");
        }
      }
    );
  };


  const getViewContentLabel = (type) => {
    const labels = {
      video: "View Video",
      pdf: "View PDF",
      image: "View Image",
      audio: "Play Audio",
      quiz: "View Quiz",
      live: "View Live Session",
    };

    return labels[type] || "View File";
  };

  const getDeleteContentLabel = (type) => {
    const labels = {
      video: "Delete Video",
      pdf: "Delete PDF",
      image: "Delete Image",
      audio: "Delete Audio",
      quiz: "Delete Quiz",
      live: "Delete Live Session",
    };

    return labels[type] || "View File";
  };

  if (checkingAccess) {
    return (
      <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-6 pb-20">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button
            onClick={() => navigate("/instructor/my-courses")}
            className="text-slate-500 hover:text-[#1B357F] transition-colors cursor-pointer font-medium"
          >
            My Courses
          </button>
          <span className="text-slate-300 font-light">/</span>
          <span className="inline-block w-32 h-4 bg-slate-200 animate-pulse rounded"></span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm max-w-xl mx-auto my-8">
          <div className="w-10 h-10 border-3 border-[#1B357F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-600">Verifying course assignment...</p>
        </div>
      </div>
    );
  }

  if (!isAssigned) {
    return (
      <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-6 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/instructor/my-courses")}
            className="text-slate-500 hover:text-[#1B357F] transition-colors cursor-pointer font-medium"
          >
            My Courses
          </button>
          <span className="text-slate-300 font-light">/</span>
          <span className="text-red-600 font-semibold">Access Restricted</span>
        </div>

        {/* Restricted Access Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 text-center max-w-xl mx-auto my-6">
          <div className="w-16 h-16 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FiLock size={30} />
          </div>

          <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200/60 mb-3">
            Access Restricted
          </span>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
            Course Not Assigned
          </h1>

          <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
            You have not been assigned as an instructor to this course (Training ID: #{trainingId}). You can only manage courses that have been assigned to your profile.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 max-w-md mx-auto mb-6 flex items-start gap-2.5 text-left">
            <FiInfo className="text-[#1B357F] shrink-0 mt-0.5" size={15} />
            <p className="text-slate-500 leading-normal">
              If you believe you should have access to this course, please contact the administrator to assign this course to your profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/instructor/my-courses")}
              className="px-5 py-2.5 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <FiArrowLeft size={14} /> Back to My Courses
            </button>
            <button
              onClick={() => navigate("/instructor/dashboard")}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // was: className="max-w-6xl mx-auto p-2 md:p-6 space-y-6" — no bottom clearance meant the last module card sat flush against the scrollable area's edge, same clipping issue as the Footer and InstructorCourses grid. Added pb-20 to match the established pattern.
    <div className="max-w-6xl mx-auto p-2 md:p-6 space-y-6 pb-20">

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate("/instructor/my-courses")}
          className="text-slate-500 hover:text-[#1B357F] transition-colors cursor-pointer font-medium"
        >
          My Courses
        </button>
        <span className="text-slate-300 font-light">/</span>
        {/* <span className="text-slate-900 font-semibold">
          {courseSettings.title}
        </span> */}

        <span className="text-slate-900 font-semibold">
          {courseSettings.title ? (
            courseSettings.title
          ) : (
            <span className="inline-block w-32 h-4 bg-slate-200 animate-pulse rounded"></span>
          )}
        </span>
      </div>

      {/* Header Container (pt-10 top padding to provide vertical clearance for back button) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6">

        {/* Back Arrow in top-left corner */}
        {/* <button
          onClick={() => navigate("/instructor/my-courses")}
          className="absolute top-3 left-3 w-7 h-7 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 hover:text-[#1B357F] transition shadow-sm cursor-pointer"
          title="Back to My Courses"
        >
          <FiArrowLeft size={14} />
        </button> */}

        {/* Left Side: Course Details (added ml-6 to shift the content right, away from the back arrow) */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 bg-blue-50 border border-blue-100 text-[#1B357F] rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
            {/* {courseSettings.code.includes("-") ? courseSettings.code.split("-")[1] : courseSettings.code || "N5"} */}
            {courseSettings.level || "N5"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {courseSettings.title}
              </h1>

              {/* was: h-8 px-4 */}
              {/* was: border border-green-700 */}
              <span className={`h-6 px-3 flex items-center gap-1.5 rounded-3xl font-semibold text-sm 
                ${trainingStatus === "COMPLETED"
                  // ? "bg-slate-200 text-slate-600"
                  ? "bg-violet-100 text-violet-700"
                  : isActive
                    ? "bg-emerald-100 text-emerald-700 "
                    : "bg-red-100 text-red-700"
                }`
              }
              >
                <span className={`w-1.5 h-1.5 rounded-full 
                  ${trainingStatus === "COMPLETED"
                    // ? "bg-slate-500"
                    ? "bg-violet-500"
                    : isActive
                      ? "bg-emerald-500"
                      : "bg-red-500"}`
                }
                />
                {trainingStatus === "COMPLETED" ? "Completed" : isActive ? "Active" : "Inactive"}
              </span>

              {/* {publishStatus === "PUBLISHED" && (
                // was: h-8 px-5 border border-blue-700
                // <span className="h-6 px-3 flex items-center border border-green-700 rounded-3xl bg-green-100 text-green-700 font-semibold text-sm">
                <span className="h-6 px-3 flex items-center gap-2 rounded-3xl bg-blue-100 text-blue-700 font-semibold text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full bg-blue-500`} />
                  Published
                </span>
              )} */}

              {publishStatus === "PUBLISHED" ? (
                <span className="h-6 px-3 flex items-center gap-2 rounded-3xl bg-blue-100 text-blue-700 font-semibold text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Published
                </span>
              ) : publishStatus === "DRAFT" ? (
                <span className="h-6 px-3 flex items-center gap-2 rounded-3xl bg-amber-100 text-amber-700 font-semibold text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Draft
                </span>
              ) : null}

            </div>
            <p className="text-xs text-slate-500 font-medium">
              Course: {courseSettings.code} • {courseSettings.duration} • {courseSettings.mode}
            </p>

            {/* Inline Stats list */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                {/* <FiLayers className="text-slate-400" /> {totalTopics} {totalTopics === 1 ? "topic" : "topics"} */}
                <FiLayers className="text-slate-400" /> {totalTopics} {totalTopics === 1 ? "module" : "modules"}
              </span>
              <span className="flex items-center gap-1">
                <FiFileText className="text-slate-400" /> {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
              </span>
              <span className="flex items-center gap-1">
                <FiUsers className="text-slate-400" /> {students.length} {students.length === 1 ? "student" : "students"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Progress & Actions */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Circular Progress Ring */}
          {/* <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" strokeWidth="4" fill="transparent"
                  strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * 45) / 100} className="stroke-[#1B357F]" />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800">45%</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight">
              Avg.<br />completion
            </div>
          </div> */}

          {/* Add Topic Action Button */}
          <button
            disabled={isLockedForModules}
            onClick={() => {
              if (isLockedForModules) return;
              setActiveTab("topics");
              setIsEditingTopic(false);
              setNewTopicData({ title: "", description: "" });
              setTopicTitleError("");
              setTopicDescriptionError("");
              setShowTopicForm(true);
            }}
            className={`h-10 px-4 rounded-xl font-semibold shadow-sm transition duration-200 flex items-center justify-center gap-2 text-sm ${isLockedForModules
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#1B357F] hover:bg-[#152B66] text-white cursor-pointer"
              }`}
            title={
              isLockedForModules
                ? (trainingStatus === "COMPLETED" ? "Course is completed — modules are locked" : "Course is inactive — modules are locked")
                : "Create Module"
            }
          >
            {/* <FiPlus size={16} /> Add topic */}
            <FiPlus size={16} /> Module
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={
              publishing ||
              !isActive ||
              (!canPublish && publishStatus !== "PUBLISHED") ||
              (publishStatus !== "PUBLISHED" && totalLessons === 0) ||
              (publishStatus === "PUBLISHED" && students.length > 0) ||
              trainingStatus === "COMPLETED"  // NEW LINE ADDED - WHEN STATUS IS COMPLETED UNPUBLISH DISABLED 
            }
            title={
              !isActive
                ? "This course is inactive and can't be published"
                : publishStatus !== "PUBLISHED" && totalLessons === 0
                  ? "Add at least one lesson before publishing"
                  : publishStatus === "PUBLISHED" && students.length > 0
                    ? `Cannot unpublish — ${students.length} student${students.length === 1 ? " is" : "s are"} already enrolled`
                    : ""
            }
            className={`min-w-[110px] h-10 px-4 rounded-xl font-semibold shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-sm cursor-pointer
              ${publishStatus === "PUBLISHED"
                ? "bg-red-600 text-white hover:bg-red-700"
                // : "bg-green-600 text-white hover:bg-green-700"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
          >
            {publishing ? (
              "Updating..."
            ) : publishStatus === "PUBLISHED" ? (
              <>
                <MdFileUploadOff className="w-5 h-5 shrink-0" />
                Unpublish
              </>
            ) : (
              <>
                <MdFileUpload className="w-5 h-5 shrink-0" />
                Publish
              </>
            )}
            </button>

          </div>
        </div>

      {/* Divider + dates row */}
      <div className="mx-6 border-t border-slate-200 py-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs">
          <FiCalendar className="text-slate-400" size={14} />
          <span className="text-slate-500">Start date</span>
          <span className="font-semibold text-slate-900">{formatCourseDate(trainingStartDate)}</span>
        </span>
        <span className="text-slate-300 text-xs">→</span>
        <span className="inline-flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-1.5 text-xs">
          <FiCalendar className="text-slate-400" size={14} />
          <span className="text-slate-500">End date</span>
          <span className="font-semibold text-slate-900">{formatCourseDate(trainingEndDate)}</span>
        </span>
        {trainingStartDate && trainingEndDate && (() => {
          const n = Math.round((new Date(trainingEndDate) - new Date(trainingStartDate)) / 86400000);
          return n > 0 ? <span className="text-xs text-slate-400">• {n} days</span> : null;
        })()}
      </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 -mb-px">
          {[
            // { id: "topics", label: "Topics" },
            { id: "topics", label: "Modules" },
            { id: "students", label: "Students" },
            // { id: "settings", label: "Settings" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 text-sm font-semibold transition border-b-2 cursor-pointer ${activeTab === tab.id
                ? "border-[#1B357F] text-[#1B357F]"
                : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">

        {/* TOPICS / SYLLABUS BUILDER TAB */}
        {activeTab === "topics" && (
          <div className="space-y-4">

            {/* INLINE TOPIC CREATION / EDIT FORM */}
            {showTopicForm && !isEditingTopic && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">
                    {isEditingTopic ? "Edit Module Section" : "Create Module Section"}
                  </h3>
                  <button onClick={handleCancelTopicForm} className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Close"><FiX size={20} /></button>
                </div>

                <form onSubmit={handleAddTopicSubmit} noValidate className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-600">Module Title <span className="text-red-500">*</span></label>
                      <span className={`text-[10px] font-semibold transition-colors ${(newTopicData.title || "").length === 200 ? "text-green-600 font-bold" : "text-slate-400"}`}>
                        {(newTopicData.title || "").length}/200 characters
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={200}
                      value={newTopicData.title}
                      onChange={(e) => {
                        setNewTopicData(prev => ({ ...prev, title: e.target.value }));
                        if (topicTitleError && e.target.value.trim()) {
                          setTopicTitleError("");
                        }
                      }}
                      onBlur={(e) => setNewTopicData(prev => ({ ...prev, title: normalizeText(e.target.value) }))}
                      placeholder="e.g. Basic greetings and vocabulary"
                      className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none transition ${topicTitleError
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-slate-200 focus:border-slate-300 focus:ring-0"
                        }`}
                    />
                    {topicTitleError && (
                      <p className="text-xs text-red-500 mt-1">{topicTitleError}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-600">Module Description <span className="text-red-500">*</span></label>
                      <span className={`text-[10px] font-semibold transition-colors ${(newTopicData.description || "").length >= 700 ? "text-green-600 font-bold" : "text-slate-400"}`}>
                        {Math.min((newTopicData.description || "").length, 700)}/700 characters
                      </span>
                    </div>
                    <RichTextEditor
                      value={newTopicData.description}
                      onChange={(val) => {
                        const trimmedVal = (val || "").slice(0, 700);
                        setNewTopicData(prev => ({ ...prev, description: trimmedVal }));
                        const plain = trimmedVal.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
                        if (topicDescriptionError && plain) {
                          setTopicDescriptionError("");
                        }
                      }}
                      placeholder="Describe what will be covered in this module section..."
                      maxLength={700}
                    />
                    {topicDescriptionError ? (
                      <p className="text-xs text-red-500 mt-1">{topicDescriptionError}</p>
                    ) : (newTopicData.description || "").length >= 700 ? (
                      <p className="text-xs text-red-500 mt-1">Maximum limit of 700 characters reached.</p>
                    ) : null}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button type="button" onClick={handleCancelTopicForm}
                      className="flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                    >
                      <X size={13} />
                      Cancel
                    </button>
                    <button type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-xs font-semibold shadow cursor-pointer">
                      <FiSave size={13} />
                      {/* {isEditingTopic ? "Save Changes" : "Create Module"} */}
                      {isEditingTopic ? "Submit" : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="bg-white border rounded-2xl p-12 text-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 mx-auto border-b-2 border-[#1B357F] mb-2"></div>
                Loading syllabus structure from database...
              </div>
            ) : topics.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center text-slate-400">
                <FiInfo className="mx-auto mb-2 text-slate-300" size={32} />
                {/* No sections added. Click "+ Add topic" to create one. */}
                No sections added. Click "+ Module" to create one.
              </div>
            ) : (
              topics.map((topic, topicIdx) => {
                const topicLessons = lessonsByTopic[topic.topic_id] || [];

                const isLessonsLoading = loadingLessons[topic.topic_id];
                const isModuleTitleDisabled =
                  isCoursePublished ||
                  (topicLessons && topicLessons.length > 0) ||
                  Number(topic.topic_recording_count || 0) > 0;

                return (
                  <div
                    key={topic.topic_id}
                    className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm"
                  >

                    {/* Topic Title Row */}
                    {/* was: className="... px-6 py-4 flex items-center justify-between gap-4" — no wrap meant
                        the title block and the 4-button action row (Add lesson/Add quiz/edit/delete) fought
                        for space on one line, running the buttons off the card edge on phone (image 1).
                        Stacked to flex-col below sm:, reverting to the original flex-row layout from sm: up. */}
                    <div className="bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] border-b border-blue-100/60 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">

                      {/* Collapsible toggle info */}
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-grow"
                        onClick={() => toggleTopic(topic.topic_id)}
                      >
                        {expandedTopics[topic.topic_id] ? (
                          <FiChevronDown className="w-5 h-5 text-[#1B357F] bg-blue-100/80 rounded-full p-0.5" title="Collapse module" />
                        ) : (
                          <FiChevronRight className="w-5 h-5 text-[#1B357F] bg-blue-100/80 rounded-full p-0.5" title="Expand module" />
                        )}
                        <div className="text-left">
                          <h3 className="font-semibold text-[#ffffff] text-base">
                            {topicIdx + 1}. {topic.topic_title}
                          </h3>
                          <p className="text-xs text-white/95 font-medium">
                            {(topic.topic_recording_count ?? topicLessons.length)} {(topic.topic_recording_count ?? topicLessons.length) === 1 ? "lesson" : "lessons"}
                          </p>
                        </div>
                      </div>

                      {/* Topic Action Items */}
                      {/* was: className="flex items-center gap-2" — buttons never wrapped, so on phone
                          they overflowed past the card's right edge instead of dropping to a second row.
                          flex-wrap only matters below sm:, since the row now has its own line there
                          (see the header row change above) with room to wrap if needed. */}
                      {/* was: gap-2 at all widths — shaving a bit of gap on phone helps the row fit Add lesson + Add quiz + edit/delete on one line instead of wrapping the icon pair to a second line. sm: and up reverts to the original gap-2. */}
                      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                        {/* was: px-2.5 py-1, text-xs, no explicit height — on phone this rendered shorter than the sibling "Add quiz" button (py-1.5) and much shorter than the edit/delete icon buttons (w-8 h-8), so all four sat at different heights in the same row despite items-center; horizontal padding and font size also trimmed slightly on phone so the row fits Add lesson + Add quiz + edit/delete on one line instead of wrapping. h-7 sm:h-auto locks phone to a fixed 28px height; sm: and up reverts to the original padding-driven height and px-2.5/text-xs. Comment moved above the tag: a JSX comment can't sit inside a tag's attribute list between props (it broke the oxc/Vite parser here) — only as a JSX child between tags or, as here, above the opening tag entirely. */}
                        {/* was: px-2.5 py-1.5, text-xs, no explicit height — same height-mismatch issue as "Add lesson" above (this button didn't even match "Add lesson"'s own py-1 to begin with); horizontal padding and font size trimmed the same way on phone. h-7 sm:h-auto locks phone to a fixed 28px height matching the other three row elements; sm: and up reverts to the original padding-driven height and px-2.5/text-xs. */}
                        <button
                          disabled={isLockedForModules}
                          onClick={() => {
                            if (isLockedForModules) return;
                            setExpandedTopics({ [topic.topic_id]: true });
                            setExpandedLessons({});
                            fetchLessonsForTopic(topic.topic_id);
                            setActiveTopicIdForLesson(topic.topic_id);
                            setIsEditingLesson(false);
                            setNewLessonData({ title: "", status: "Published", type: "video", lessonFile: null, freePreview: false });
                            setLessonTitleError("");
                            setLessonFileError("");
                            setShowQuizValidation(false);
                            setIsViewOnlyQuiz(false);
                            setIsDirectQuizAdd(false);
                            setShowLessonForm(true);
                          }}
                          title={
                            isLockedForModules
                              ? (trainingStatus === "COMPLETED"
                                ? "Course is completed — modules are locked"
                                : "Course is inactive — modules are locked")
                              : undefined
                          }
                          className={`border shadow-sm px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold shadow-sm transition flex items-center gap-1 shrink-0 whitespace-nowrap h-7 sm:h-auto ${isLockedForModules
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-[#ffffff] text-[#1B357F] hover:text-white/95 hover:bg-blue-50/40 cursor-pointer"
                            }`}
                        >
                          <FiPlus size={14} /> Add lesson
                        </button>

                        <button
                          disabled={isLockedForModules}
                          onClick={() => {
                            if (isLockedForModules) return;
                            setExpandedTopics({ [topic.topic_id]: true });
                            setExpandedLessons({});
                            fetchLessonsForTopic(topic.topic_id);
                            setActiveTopicIdForLesson(topic.topic_id);
                            setIsEditingLesson(false);
                            setNewLessonData({ title: "", status: "Published", type: "quiz", lessonFile: null, freePreview: false });
                            setQuizInstructions("");
                            setQuizDuration(15);
                            setQuizPassingMarks(70);
                            setQuizAttempts(1);
                            setQuizStartDatetime("");
                            setQuizEndDatetime("");
                            setQuizQuestions([
                              {
                                id: Date.now(),
                                question_text: "",
                                question_type: "single_mcq",
                                question_marks: 5,
                                options: [
                                  { option_text: "", is_correct: true },
                                  { option_text: "", is_correct: false }
                                ]
                              }
                            ]);
                            setLessonTitleError("");
                            setShowQuizValidation(false);
                            setIsViewOnlyQuiz(false);
                            setIsDirectQuizAdd(true);
                            setShowLessonForm(true);
                          }}
                          title={
                            isLockedForModules
                              ? (trainingStatus === "COMPLETED"
                                ? "Course is completed — modules are locked"
                                : "Course is inactive — modules are locked")
                              : undefined
                          }
                          // was: py-1.5
                          className={`border shadow-sm px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold shadow-sm transition flex items-center gap-1 shrink-0 whitespace-nowrap h-7 sm:h-auto ${isLockedForModules
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-[#ffffff] text-[#1B357F] hover:text-white/95 hover:bg-blue-50/40 cursor-pointer"
                            }`}
                        >
                          <FiPlus size={14} /> Add quiz
                        </button>

                        <button
                          disabled={isLockedForModules}
                          onClick={() => {
                            if (isLockedForModules) return;
                            setExpandedTopics({ [topic.topic_id]: true });
                            setExpandedLessons({});
                            fetchLessonsForTopic(topic.topic_id);
                            setActiveTopicIdForLesson(topic.topic_id);
                            setIsEditingLesson(false);
                            setNewLessonData({ title: "", status: "Published", type: "live", lessonFile: null, freePreview: false });
                            setLivePlatform("google_meet");
                            setLiveMeetingLink("");
                            setLiveMeetingPassword("");
                            setLiveStartTime("");
                            setLiveEndTime("");
                            setLiveValidationErrors({});
                            setLessonTitleError("");
                            setLessonFileError("");
                            setShowQuizValidation(false);
                            setIsViewOnlyQuiz(false);
                            setIsDirectQuizAdd(false);
                            setShowLessonForm(true);
                          }}
                          title={
                            isLockedForModules
                              ? (trainingStatus === "COMPLETED"
                                ? "Course is completed — modules are locked" : "Course is inactive — modules are locked")
                              : undefined
                          }
                          className={`border shadow-sm px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold shadow-sm transition flex items-center gap-1 shrink-0 whitespace-nowrap h-7 sm:h-auto ${isLockedForModules
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border-[#ffffff] text-[#1B357F] hover:text-white/95 hover:bg-blue-50/40 cursor-pointer"
                            }`}
                        >
                          <FiPlus size={14} /> Add live session
                        </button>

                        {/* was: edit and delete were two separate flex-wrap items in the same row as
                            Add lesson/Add quiz — when the row wrapped on phone, edit fit on line 1 next
                            to the buttons but delete alone got pushed to line 2, misaligning the pair.
                            Grouped into their own flex container so they wrap together as one unit and
                            always stay side by side. */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Topic Edit icon */}
                          <button
                            disabled={isCoursePublished || isLockedForModules}
                            onClick={() => {
                              if (isCoursePublished || isLockedForModules) return;
                              handleEditTopicClick(topic);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition  
                              ${(isCoursePublished || isLockedForModules)
                                ? "opacity-40 cursor-not-allowed text-white/50"
                                : "cursor-pointer text-white  hover:bg-red-50/10"}`}
                            title={
                              isLockedForModules
                                ? (trainingStatus === "COMPLETED" ? "Course is completed — modules are locked" : "Course is inactive — modules are locked")
                                : isCoursePublished ? "Cannot edit once course is published" : "Edit Module"
                            }
                          >
                            <FiEdit2 size={16} />
                          </button>

                          {/* Topic Delete icon */}
                          <button
                            disabled={isCoursePublished || isLockedForModules || (topicLessons && topicLessons.length > 0) || Number(topic.topic_recording_count || 0) > 0}
                            onClick={() => {
                              if (isCoursePublished || isLockedForModules || (topicLessons && topicLessons.length > 0) || Number(topic.topic_recording_count || 0) > 0) return;
                              handleDeleteTopicLocal(topic.topic_id);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition ${isCoursePublished || isLockedForModules || (topicLessons && topicLessons.length > 0) || Number(topic.topic_recording_count || 0) > 0
                              ? "opacity-40 cursor-not-allowed text-white/50"
                              : "text-white hover:bg-red-50/10 cursor-pointer"
                              }`}
                            title={
                              isLockedForModules
                                ? (trainingStatus === "COMPLETED" ? "Course is completed — modules are locked" : "Course is inactive — modules are locked")
                                : isCoursePublished
                                  ? "Module cannot be deleted once published"
                                  : (topicLessons && topicLessons.length > 0) || Number(topic.topic_recording_count || 0) > 0
                                    ? "Cannot delete module with existing lessons"
                                    : "Delete Module"
                            }
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Module Content Body (expanded) */}
                    {expandedTopics[topic.topic_id] && (
                      <div className="p-6 space-y-6">

                        {isEditingTopic &&
                          activeTopicIdForEdit === topic.topic_id && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                              <div className="flex justify-between items-center pb-3">
                                <h4 className="font-bold text-slate-800 text-base">
                                  Edit Module
                                </h4>

                                <button
                                  onClick={handleCancelTopicForm}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                  title="Close"
                                >
                                  <FiX size={20} />
                                </button>
                              </div>

                              <form
                                onSubmit={handleAddTopicSubmit}
                                noValidate
                                className="space-y-4"
                              >
                                <div>

                                  <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                      Module Title <span className="text-red-500">*</span>
                                      {isModuleTitleDisabled && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                                          <FiLock size={10} /> Locked
                                        </span>
                                      )}
                                    </label>
                                    <span className={`text-[10px] font-semibold transition-colors ${(newTopicData.title || "").length === 200 ? "text-green-600 font-bold" : "text-slate-400"}`}>
                                      {(newTopicData.title || "").length}/200 characters
                                    </span>
                                  </div>

                                  <input
                                    type="text"
                                    maxLength={200}
                                    value={newTopicData.title}
                                    disabled={isModuleTitleDisabled}
                                    title={isModuleTitleDisabled ? "Module title cannot be edited once published or lessons are added." : ""}
                                    onChange={(e) => {
                                      if (isModuleTitleDisabled) return;
                                      setNewTopicData(prev => ({
                                        ...prev,
                                        title: e.target.value
                                      }));
                                      if (topicTitleError && e.target.value.trim()) {
                                        setTopicTitleError("");
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (isModuleTitleDisabled) return;
                                      setNewTopicData(prev => ({
                                        ...prev,
                                        title: normalizeText(e.target.value)
                                      }));
                                    }}
                                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none transition ${isModuleTitleDisabled
                                      ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                                      : topicTitleError
                                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        : "border-slate-200 focus:border-slate-300 focus:ring-0"
                                      }`}
                                  />
                                  {isModuleTitleDisabled ? (
                                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                                      <FiInfo size={12} className="shrink-0" />
                                      Module title cannot be edited once published or lessons are added.
                                    </p>
                                  ) : topicTitleError ? (
                                    <p className="text-xs text-red-500 mt-1">{topicTitleError}</p>
                                  ) : null}
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-semibold text-slate-600">Module Description <span className="text-red-500">*</span></label>
                                    <span className={`text-[10px] font-semibold transition-colors ${(newTopicData.description || "").length >= 700 ? "text-green-600 font-bold" : "text-slate-400"}`}>
                                      {Math.min((newTopicData.description || "").length, 700)}/700 characters
                                    </span>
                                  </div>
                                  <RichTextEditor
                                    value={newTopicData.description}
                                    onChange={(val) => {
                                      const trimmedVal = (val || "").slice(0, 700);
                                      setNewTopicData(prev => ({
                                        ...prev,
                                        description: trimmedVal
                                      }));
                                      const plain = trimmedVal.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
                                      if (topicDescriptionError && plain) {
                                        setTopicDescriptionError("");
                                      }
                                    }}
                                    maxLength={700}
                                  />
                                  {topicDescriptionError ? (
                                    <p className="text-xs text-red-500 mt-1">{topicDescriptionError}</p>
                                  ) : (newTopicData.description || "").length >= 700 ? (
                                    <p className="text-xs text-red-500 mt-1">Maximum limit of 700 characters reached.</p>
                                  ) : null}
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                                  <button
                                    type="button"
                                    onClick={handleCancelTopicForm}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                                  >
                                    <X size={13} />
                                    Cancel
                                  </button>

                                  <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-xs font-semibold shadow cursor-pointer">

                                    <FiSave size={13} />
                                    {/* Save Changes */}
                                    Submit
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}

                        {/* Module Description */}
                        {topic.topic_description && (
                          <div
                            className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-[#1B357F] pl-3"
                            dangerouslySetInnerHTML={{ __html: topic.topic_description }}
                          />
                        )}

                        {/* This is only handling add lesson not edit */}
                        {/* INLINE LESSON CREATION / EDIT FORM (Positioned at top of expanded contents) - Now lesson edit will open in side the lesson itself */}
                        {showLessonForm && !isEditingLesson && activeTopicIdForLesson === topic.topic_id && (
                          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm mb-4">
                            {/* border-b border-slate-200 */}
                            <div className="flex justify-between items-center pb-2">
                              <h4 className="font-bold text-slate-800 text-sm">
                                {isViewOnlyQuiz ? "View Quiz" : isDirectQuizAdd ? "Add New Quiz" : newLessonData.type === "live" ? "Add Live Session" : "Add New Lesson"}
                              </h4>
                              <button type="button" onClick={handleCancelLessonForm} className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Close"><FiX size={16} /></button>

                            </div>

                            <form onSubmit={handleAddLessonSubmit} noValidate className="space-y-4">
                              {!isViewOnlyQuiz && (
                                <>
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="block text-xs font-semibold text-slate-600">{isDirectQuizAdd ? "Quiz Title" : newLessonData.type === "live" ? "Live Session Title" : "Lesson Title"}<span className="text-red-500">*</span></label>
                                      <span className={`text-[10px] font-semibold transition-colors ${(newLessonData.title || "").length === 200 ? "text-green-600" : "text-slate-400"}`}>
                                        {(newLessonData.title || "").length}/200 characters
                                      </span>
                                    </div>
                                    <input
                                      type="text"
                                      maxLength={200}
                                      value={newLessonData.title}
                                      onChange={(e) => {
                                        setNewLessonData(prev => ({ ...prev, title: e.target.value }));
                                        if (lessonTitleError && e.target.value.trim()) {
                                          setLessonTitleError("");
                                        }
                                      }}
                                      onBlur={(e) => setNewLessonData(prev => ({ ...prev, title: normalizeText(e.target.value) }))}
                                      placeholder={isDirectQuizAdd ? "e.g. Section 1 Quiz" : newLessonData.type === "live" ? "e.g. Live Q&A and Discussion" : "e.g. Greetings and Introductions lecture"}
                                      className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none transition ${lessonTitleError
                                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        : "border-slate-200 focus:border-slate-300 focus:ring-0"
                                        }`}
                                    />
                                    {lessonTitleError && (
                                      <p className="text-xs text-red-500 mt-1">{lessonTitleError}</p>
                                    )}
                                  </div>
                                  {!isDirectQuizAdd && newLessonData.type !== "live" && (
                                    <div>
                                      <label className="block text-xs font-semibold text-slate-600 mb-1">Lesson Type <span className="text-red-500">*</span></label>
                                      <Select
                                        options={[
                                          { value: "video", label: "Video" },
                                          { value: "file", label: "File" }
                                        ]}
                                        value={{
                                          value: newLessonData.type || "video",
                                          label: (newLessonData.type === "file" || newLessonData.type === "text")
                                            ? "File"
                                            : "Video"
                                        }}
                                        onChange={(option) => {
                                          setNewLessonData(prev => ({ ...prev, type: option.value, lessonFile: null, freePreview: option.value === "video" ? prev.freePreview : false }));
                                          setShowQuizValidation(false);
                                          setLiveValidationErrors({});
                                        }}
                                        styles={instructorSelectStyles}
                                        isSearchable={false}
                                      />
                                    </div>
                                  )}
                                </>
                              )}
                              {newLessonData.type === "quiz" ? (
                                <QuizBuilder
                                  quizDuration={quizDuration}
                                  setQuizDuration={setQuizDuration}
                                  quizPassingMarks={quizPassingMarks}
                                  setQuizPassingMarks={setQuizPassingMarks}
                                  quizAttempts={quizAttempts}
                                  setQuizAttempts={setQuizAttempts}
                                  quizInstructions={quizInstructions}
                                  setQuizInstructions={setQuizInstructions}
                                  quizQuestions={quizQuestions}
                                  setQuizQuestions={setQuizQuestions}
                                  quizStartDatetime={quizStartDatetime}
                                  setQuizStartDatetime={setQuizStartDatetime}
                                  quizEndDatetime={quizEndDatetime}
                                  setQuizEndDatetime={setQuizEndDatetime}
                                  primaryColor="blue"
                                  showValidationErrors={showQuizValidation}
                                  isReadOnly={isViewOnlyQuiz}
                                  topicTitle={topic.topic_title}
                                  lessonTitle={newLessonData.title}
                                />
                              ) : newLessonData.type === "live" ? (
                                <LiveSessionForm
                                  livePlatform={livePlatform}
                                  setLivePlatform={setLivePlatform}
                                  liveMeetingLink={liveMeetingLink}
                                  setLiveMeetingLink={setLiveMeetingLink}
                                  liveMeetingPassword={liveMeetingPassword}
                                  setLiveMeetingPassword={setLiveMeetingPassword}
                                  liveStartTime={liveStartTime}
                                  setLiveStartTime={setLiveStartTime}
                                  liveEndTime={liveEndTime}
                                  setLiveEndTime={setLiveEndTime}
                                  validationErrors={liveValidationErrors}
                                  setLiveValidationErrors={setLiveValidationErrors}
                                  isReadOnly={isViewOnlyQuiz || (isEditingLesson && liveSessionStatus === "CANCELLED")}
                                  isCancelled={isEditingLesson && liveSessionStatus === "CANCELLED"}
                                />
                              ) : (
                                <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Upload File <span className="text-red-500">*</span></label>
                                  <div
                                        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDraggingVideo
                                          ? "border-blue-400 bg-blue-50/40"
                                          : lessonFileError && !newLessonData.lessonFile
                                            ? "border-red-500 bg-red-50/30"
                                            : "border-slate-300 bg-slate-50/50 hover:border-slate-400"
                                          }`}
                                    onClick={() => document.getElementById(`lesson-file-upload-${topic.topic_id}`).click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                                    onDragLeave={() => setIsDraggingVideo(false)}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      setIsDraggingVideo(false);
                                      const file = e.dataTransfer.files[0];
                                      if (file) {
                                        setNewLessonData(prev => ({ ...prev, lessonFile: file }));
                                      }
                                    }}
                                  >
                                    <input
                                      type="file"
                                      id={`lesson-file-upload-${topic.topic_id}`}
                                      accept={getLessonUploadAccept(newLessonData.type)}
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          setNewLessonData(prev => ({ ...prev, lessonFile: e.target.files[0] }));
                                        }
                                      }}
                                    />
                                    {newLessonData.lessonFile ? (
                                      <div className="space-y-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setNewLessonData(prev => ({ ...prev, lessonFile: null }));
                                          }}
                                          className="absolute top-2.5 right-2.5 p-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-full cursor-pointer hover:text-slate-700 transition shadow-sm"
                                          title="Remove File"
                                        >
                                          <FiX size={14} />
                                        </button>
                                        {newLessonData.type === "file" || (newLessonData.lessonFile?.name && /\.(pdf|doc|docx|txt)$/i.test(newLessonData.lessonFile.name)) ? (
                                          <FiFileText className="mx-auto text-[#1B357F]" size={22} />
                                        ) : (
                                          <FiPlay className="mx-auto text-[#1B357F]" size={22} />
                                        )}
                                        <p className="text-xs font-semibold text-slate-700">{newLessonData.lessonFile.name}</p>
                                        <p className="text-[10px] text-slate-400">
                                          {(newLessonData.lessonFile.size / 1024 / 1024).toFixed(1)} MB
                                        </p>
                                      </div>
                                    ) : newLessonData.existingFileUrl ? (
                                      <div className="space-y-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setNewLessonData(prev => ({ ...prev, existingFileUrl: null, existingFileName: null, existingFileType: null }));
                                          }}
                                          className="absolute top-2.5 right-2.5 p-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-full cursor-pointer hover:text-slate-700 transition shadow-sm"
                                          title="Remove / Replace File"
                                        >
                                          <FiX size={14} />
                                        </button>
                                        {newLessonData.type === "video" ? (
                                          <FiPlay className="mx-auto text-[#1B357F]" size={22} />
                                        ) : (
                                          <FiFileText className="mx-auto text-[#1B357F]" size={22} />
                                        )}
                                        <p className="text-xs font-semibold text-slate-700">{newLessonData.existingFileName || (newLessonData.type === "video" ? "Uploaded Video" : "Uploaded File")}</p>
                                        <p className="text-[10px] text-slate-400">
                                          Existing {newLessonData.type === "video" ? "video" : "file"} attached • Click or drag to replace
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <FiPlus className="mx-auto text-slate-400" size={22} />
                                        <p className="text-xs font-semibold text-slate-600">Click or drag file to upload</p>
                                        <p className="text-[10px] text-slate-400">
                                          {newLessonData.type === "video"
                                            ? "Supports MP4, WebM up to 80MB"
                                                                                        : "Supports PDF, DOCX, TXT up to 80MB"}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {lessonFileError && !newLessonData.lessonFile && (
                                    <p className="text-xs text-red-500 mt-1">{lessonFileError}</p>
                                  )}
                                </div>
                              )}
                              {!isViewOnlyQuiz && newLessonData.type === "video" && (
                                  <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Free preview</label>
                                    <div className="flex items-center">
                                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={newLessonData.freePreview}
                                          onChange={(e) => setNewLessonData(prev => ({ ...prev, freePreview: e.target.checked }))}
                                          className="h-4 w-4"
                                        />
                                        Allow free preview
                                      </label>
                                    </div>
                                  </div>
                                )}
                              <div className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:justify-end">
                                <button
                                  type="button"
                                  onClick={handleCancelLessonForm}
                                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <X size={13} />
                                  {isViewOnlyQuiz
                                    ? "Close" : "Cancel"}
                                </button>
                                {!isViewOnlyQuiz && (
                                  <button
                                    type="submit"
                                    disabled={isSubmittingLesson}
                                    className="px-4 py-2 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-xs font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                  >
                                    {isSubmittingLesson ? (
                                      <>
                                        <svg
                                          className="animate-spin h-3 w-3 text-white"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          />
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                          />
                                        </svg>
                                        {/* Saving... */}
                                        Submitting...
                                      </>
                                    ) : (
                                      // isDirectQuizAdd ? "Add Quiz" : newLessonData.type === "live" ? "Add Live Session" : "Add Lesson"
                                      <>
                                        <FiSave className="h-3 w-3" />
                                        {/* {isDirectQuizAdd ? "Add Quiz" : newLessonData.type === "live" ? "Add Live Session" : "Add Lesson"} */}
                                        {isDirectQuizAdd ? "Submit" : newLessonData.type === "live" ? "Submit" : "Submit"}
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Lessons Grid list */}
                        <div className="space-y-4">

                          {isLessonsLoading ? (
                            <div className="py-4 text-sm text-slate-500">
                              Loading lessons...
                            </div>
                          ) : topicLessons.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                              No lessons in this section yet. Click "+ Add lesson" to add one.
                            </p>
                          ) :


                            topicLessons.map((lesson) => {
                              const isVideo = lesson.lesson_content_type === "video";
                              const hasContentBelow = (isEditingLesson && editingLessonId === lesson.lesson_id) ||
                                (activeLessonPreviewId === lesson.lesson_id) ||
                                (isVideo && expandedLessons[lesson.lesson_id]);

                              return (
                                <div
                                  key={lesson.lesson_id}
                                  className={`bg-slate-50/50 rounded-xl border border-slate-100 p-4 ${hasContentBelow ? "space-y-3" : ""}`}
                                >

                                  {/* Lesson Header */}
                                  {/* was: flex items-center justify-between at all widths, with no min-w-0/wrap on the title block — a long lesson title plus the Free Preview badge left no room for the Edit/Delete icons, pushing them past the card edge on phone (the same pattern as the module header row fixed earlier, one level down). Stacked to flex-col below sm:, title block gets min-w-0 so it can shrink/wrap instead of forcing overflow, actions move to their own row via self-end; sm: and up reverts to the original single-row layout. */}
                                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 ${hasContentBelow ? "border-b border-slate-100 pb-2.5" : ""}`}>
                                    <div
                                      data-lesson-box={lesson.lesson_id}
                                      className="flex items-start gap-2 min-w-0 flex-1 cursor-pointer select-none"
                                      onClick={() => {
                                        if (lesson.lesson_content_type === "quiz") {
                                          handleViewQuizClick(topic.topic_id, lesson);
                                        } else if (lesson.lesson_content_type === "file" || lesson.lesson_content_type === "text" || lesson.lesson_content_type === "live") {
                                          handleToggleLessonPreview(lesson.lesson_id);
                                        } else if (isVideo) {
                                          toggleLesson(lesson.lesson_id);
                                        }
                                      }}
                                    >
                                      <span className="mt-0.5">
                                        {isVideo ? (
                                          expandedLessons[lesson.lesson_id] ? (
                                            <FiChevronDown className="w-4 h-4 text-slate-500 shrink-0" title="Collapse lesson" />
                                          ) : (
                                            <FiChevronRight className="w-4 h-4 text-slate-500 shrink-0" title="Expand lesson" />
                                          )
                                        ) : (
                                          <FiChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                                        )}
                                      </span>
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                          {lesson.lesson_content_type === "live" && getLessonLiveData(lesson)?.session_status === "CANCELLED" && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider shrink-0">
                                              <FiXCircle size={11} /> Cancelled
                                            </span>
                                          )}
                                          <h4 className="font-bold text-slate-800 text-sm min-w-0 break-words">
                                            {lesson.lesson_title}
                                          </h4>
                                          {(lesson.lesson_is_free_preview === true || lesson.lesson_is_free_preview === 1 || lesson.lesson_is_free_preview === "1" || lesson.lesson_is_free_preview === "true") && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B357F]/10 text-[#1B357F] border border-[#1B357F]/20 shadow-2xs shrink-0">
                                              <FiEye size={11} /> Free Preview
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-normal">
                                          {lesson.lesson_content_type === "quiz"
                                            ? "Quiz"
                                            : lesson.lesson_content_type === "live"
                                              ? "Live Session"
                                              : lesson.lesson_content_type === "video"
                                                ? "Video"
                                                : "File"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div
                                      className="flex items-center gap-1.5 sm:gap-3 self-end sm:self-auto shrink-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Preview Action (Video / File / Live Session / Quiz) */}
                                      {hasLessonPreview(lesson) && (
                                        <button
                                          type="button"
                                          data-lesson-preview-btn={lesson.lesson_id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (lesson.lesson_content_type === "quiz") {
                                              handleViewQuizClick(topic.topic_id, lesson);
                                            } else {
                                              handleToggleLessonPreview(lesson.lesson_id);
                                            }
                                          }}
                                          className={`w-7 h-7 rounded flex items-center justify-center transition cursor-pointer ${(activeLessonPreviewId === lesson.lesson_id || (lesson.lesson_content_type === "quiz" && isEditingLesson && editingLessonId === lesson.lesson_id && isViewOnlyQuiz))
                                            ? "text-[#1B357F] bg-blue-100 shadow-2xs"
                                            : "text-slate-400 hover:text-[#1B357F] hover:bg-blue-50"
                                            }`}
                                          title={
                                            (activeLessonPreviewId === lesson.lesson_id || (lesson.lesson_content_type === "quiz" && isEditingLesson && editingLessonId === lesson.lesson_id && isViewOnlyQuiz))
                                              ? "Hide Preview"
                                              : lesson.lesson_content_type === "quiz"
                                                ? "View Quiz"
                                                : lesson.lesson_content_type === "live"
                                                  ? "View Live Session Details"
                                                  : lesson.lesson_content_type === "video"
                                                    ? "View Lecture Video"
                                                    : "View File"
                                          }
                                        >
                                          <FiEye size={15} />
                                        </button>
                                      )}

                                      {/* Edit Action */}
                                      {/* <button
                                        disabled={isCoursePublished}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isCoursePublished) return;
                                          handleEditLessonClick(topic.topic_id, lesson);
                                        }}
                                        className={`w-7 h-7 rounded flex items-center justify-center transition ${isCoursePublished
                                          ? "opacity-40 cursor-not-allowed text-slate-300"
                                          : "text-slate-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer"
                                          }`}
                                        title={
                                          isCoursePublished
                                            ? "Cannot edit lesson once course is published"
                                            : lesson.lesson_content_type === "quiz"
                                              ? "Edit Quiz"
                                              : lesson.lesson_content_type === "live"
                                                ? "Edit Live Session"
                                                : "Edit Lesson"
                                        }
                                      >
                                        <FiEdit2 size={14} />
                                      </button> */}

                                      <button
                                        disabled={isCoursePublished && lesson.lesson_content_type !== "live" || isLockedForModules}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isCoursePublished && lesson.lesson_content_type !== "live" || isLockedForModules) return;
                                          handleEditLessonClick(topic.topic_id, lesson);
                                        }}
                                        className={`w-7 h-7 rounded flex items-center justify-center transition ${isCoursePublished && lesson.lesson_content_type !== "live"
                                          ? "opacity-40 cursor-not-allowed text-slate-300"
                                          : "text-slate-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer"
                                          }`}
                                        title={
                                          isLockedForModules
                                            ? (trainingStatus === "COMPLETED" ? "Course is completed — modules are locked" : "Course is inactive — modules are locked")
                                            : isCoursePublished && lesson.lesson_content_type !== "live"
                                              ? "Cannot edit lesson once course is published"
                                              : lesson.lesson_content_type === "quiz"
                                                ? "Edit Quiz"
                                                : lesson.lesson_content_type === "live"
                                                  ? "Edit Live Session"
                                                  : "Edit Lesson"
                                        }
                                      >
                                        <FiEdit2 size={14} />
                                      </button>

                                      {/* <button
                                        disabled={(isCoursePublished && lesson.lesson_content_type !== "live") || isLockedForModules || deletingLessonId === lesson.lesson_id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if ((isCoursePublished && lesson.lesson_content_type !== "live") || isLockedForModules) return;
                                          handleDeleteLesson(topic.topic_id, lesson.lesson_id, lesson.lesson_content_type);
                                        }}
                                        className={`w-7 h-7 rounded flex items-center justify-center transition ${(isCoursePublished && lesson.lesson_content_type !== "live") || deletingLessonId === lesson.lesson_id
                                          ? "opacity-40 cursor-not-allowed text-slate-300"
                                          : "text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                                          }`}
                                        title={
                                          isCoursePublished && lesson.lesson_content_type !== "live"
                                            ? "Cannot delete lesson once course is published"
                                            : lesson.lesson_content_type === "quiz"
                                              ? "Delete Quiz"
                                              : lesson.lesson_content_type === "live"
                                                ? "Delete Live Session"
                                                : "Delete Lesson"
                                        }
                                      >
                                        {deletingLessonId === lesson.lesson_id ? (
                                          <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block" />
                                        ) : (
                                          <FiTrash2 size={14} />
                                        )}
                                      </button> */}

                                      {/* Disbaled the delete after pupblish as well */}
                                      <button
                                        disabled={isCoursePublished || isLockedForModules || deletingLessonId === lesson.lesson_id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isCoursePublished || isLockedForModules) return;
                                          handleDeleteLesson(topic.topic_id, lesson.lesson_id, lesson.lesson_content_type);
                                        }}
                                        className={`w-7 h-7 rounded flex items-center justify-center transition ${isCoursePublished || deletingLessonId === lesson.lesson_id
                                          ? "opacity-40 cursor-not-allowed text-slate-300"
                                          : "text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                                          }`}
                                        title={
                                          isCoursePublished
                                            ? "Cannot delete lesson once course is published"
                                            : lesson.lesson_content_type === "quiz"
                                              ? "Delete Quiz"
                                              : lesson.lesson_content_type === "live"
                                                ? "Delete Live Session"
                                                : "Delete Lesson"
                                        }
                                      >
                                        {deletingLessonId === lesson.lesson_id ? (
                                          <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block" />
                                        ) : (
                                          <FiTrash2 size={14} />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* This is only handling edit lesson */}
                                  {isEditingLesson &&
                                    editingLessonId === lesson.lesson_id && (
                                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm mb-4">
                                        <div className="flex justify-between items-center pb-2">
                                          <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800 text-sm">
                                              {isViewOnlyQuiz ? "View Quiz" : newLessonData.type === "quiz" ? "Edit Quiz" : newLessonData.type === "live" ? "Edit Live Session" : isEditingLesson ? "Edit Lesson" : "Add New Lesson"}
                                            </h4>
                                            {isEditingLesson && newLessonData.type === "live" && liveSessionStatus === "CANCELLED" && (
                                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                                                <FiXCircle size={11} /> Cancelled
                                              </span>
                                            )}
                                          </div>
                                          <button type="button" onClick={handleCancelLessonForm} className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Close"><FiX size={16} /></button>
                                        </div>

                                        <form onSubmit={handleAddLessonSubmit} noValidate className="space-y-4">
                                          {!isViewOnlyQuiz && (
                                            <>
                                              <div>
                                                <div className="flex justify-between items-center mb-1">
                                                  <div className="flex items-center gap-1.5">
                                                    <label className="block text-xs font-semibold text-slate-600">
                                                      {newLessonData.type === "quiz" ? "Quiz Title" : newLessonData.type === "live" ? "Live Session Title" : "Lesson Title"} <span className="text-red-500">*</span>
                                                    </label>
                                                    {/* {isEditingLesson && newLessonData.type === "live" && liveSessionStatus === "CANCELLED" && (
                                                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                                        (Cancelled)
                                                      </span>
                                                    )} */}
                                                  </div>
                                                  <span className={`text-[10px] font-semibold transition-colors ${(newLessonData.title || "").length === 200 ? "text-green-600" : "text-slate-400"}`}>
                                                    {(newLessonData.title || "").length}/200 characters
                                                  </span>
                                                </div>
                                                <div className="flex items-stretch">
                                                  {/* {isEditingLesson && newLessonData.type === "live" && liveSessionStatus === "CANCELLED" && (
                                                    <span className="inline-flex items-center gap-1 px-3 bg-red-50 border border-r-0 border-red-300 rounded-l-lg text-xs font-bold text-red-700 select-none shrink-0">
                                                      <FiXCircle size={13} className="text-red-600" />
                                                      Cancelled
                                                    </span>
                                                  )} */}
                                                  <input
                                                    type="text"
                                                    maxLength={200}
                                                    disabled={isViewOnlyQuiz || (isEditingLesson && newLessonData.type === "live" && (liveSessionStatus === "CANCELLED" || isLiveSessionInPast))}
                                                    value={newLessonData.title}
                                                    onChange={(e) => {
                                                      setNewLessonData(prev => ({ ...prev, title: e.target.value }));
                                                      if (lessonTitleError && e.target.value.trim()) {
                                                        setLessonTitleError("");
                                                      }
                                                    }}
                                                    onBlur={(e) => setNewLessonData(prev => ({ ...prev, title: normalizeText(e.target.value) }))}
                                                    placeholder={newLessonData.type === "quiz" ? "e.g. Section 1 Quiz" : newLessonData.type === "live" ? "e.g. Live Q&A and Discussion" : "e.g. Greetings and Introductions lecture"}
                                                    className={`w-full text-sm border px-3 py-2 focus:outline-none transition ${isEditingLesson && newLessonData.type === "live" && (liveSessionStatus === "CANCELLED" || isLiveSessionInPast) ? "rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed border-slate-300" : "rounded-lg"} ${lessonTitleError
                                                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                                      : "border-slate-200 focus:border-slate-300 focus:ring-0"
                                                      }`}
                                                  />
                                                </div>
                                                {lessonTitleError && (
                                                  <p className="text-xs text-red-500 mt-1">{lessonTitleError}</p>
                                                )}
                                              </div>

                                              {!isDirectQuizAdd && newLessonData.type !== "quiz" && newLessonData.type !== "live" && (
                                                <div>
                                                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lesson Type <span className="text-red-500">*</span></label>
                                                  <Select
                                                    isDisabled={isViewOnlyQuiz}
                                                    options={[
                                                      { value: "video", label: "Video" },
                                                      { value: "file", label: "File" }
                                                    ]}
                                                    value={{
                                                      value: newLessonData.type || "video",
                                                      label: (newLessonData.type === "file" || newLessonData.type === "text")
                                                        ? "File"
                                                        : "Video"
                                                    }}
                                                    onChange={(option) => {
                                                      setNewLessonData(prev => ({ ...prev, type: option.value, lessonFile: null, freePreview: option.value === "video" ? prev.freePreview : false }));
                                                      setShowQuizValidation(false);
                                                      setLiveValidationErrors({});
                                                    }}
                                                    styles={instructorSelectStyles}
                                                    isSearchable={false}
                                                  />
                                                </div>
                                              )}
                                            </>
                                          )}
                                          {newLessonData.type === "quiz" ? (
                                            <QuizBuilder
                                              quizDuration={quizDuration}
                                              setQuizDuration={setQuizDuration}
                                              quizPassingMarks={quizPassingMarks}
                                              setQuizPassingMarks={setQuizPassingMarks}
                                              quizAttempts={quizAttempts}
                                              setQuizAttempts={setQuizAttempts}
                                              quizInstructions={quizInstructions}
                                              setQuizInstructions={setQuizInstructions}
                                              quizQuestions={quizQuestions}
                                              setQuizQuestions={setQuizQuestions}
                                              quizStartDatetime={quizStartDatetime}
                                              setQuizStartDatetime={setQuizStartDatetime}
                                              quizEndDatetime={quizEndDatetime}
                                              setQuizEndDatetime={setQuizEndDatetime}
                                              primaryColor="blue"
                                              showValidationErrors={showQuizValidation}
                                              isReadOnly={isViewOnlyQuiz}
                                              topicTitle={topic.topic_title}
                                              lessonTitle={newLessonData.title}
                                            />
                                          ) : newLessonData.type === "live" ? (
                                            <LiveSessionForm
                                              livePlatform={livePlatform}
                                              setLivePlatform={setLivePlatform}
                                              liveMeetingLink={liveMeetingLink}
                                              setLiveMeetingLink={setLiveMeetingLink}
                                              liveMeetingPassword={liveMeetingPassword}
                                              setLiveMeetingPassword={setLiveMeetingPassword}
                                              liveStartTime={liveStartTime}
                                              setLiveStartTime={setLiveStartTime}
                                              liveEndTime={liveEndTime}
                                              setLiveEndTime={setLiveEndTime}
                                              validationErrors={liveValidationErrors}
                                              setLiveValidationErrors={setLiveValidationErrors}
                                              isReadOnly={isViewOnlyQuiz || (isEditingLesson && (liveSessionStatus === "CANCELLED" || isLiveSessionInPast))}
                                              isCancelled={isEditingLesson && liveSessionStatus === "CANCELLED"}
                                            />
                                          ) : (
                                            <div>
                                              <label className="block text-xs font-semibold text-slate-600 mb-1">Upload File <span className="text-red-500">*</span></label>
                                              <div
                                                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDraggingVideo
                                                  ? "border-blue-400 bg-blue-50/40"
                                                  : "border-slate-300 bg-slate-50/50 hover:border-slate-400"
                                                  }`}
                                                onClick={() => document.getElementById(`lesson-file-upload-${topic.topic_id}`).click()}
                                                onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                                                onDragLeave={() => setIsDraggingVideo(false)}
                                                onDrop={(e) => {
                                                  e.preventDefault();
                                                  setIsDraggingVideo(false);
                                                  const file = e.dataTransfer.files[0];
                                                  if (file) {
                                                    setNewLessonData(prev => ({ ...prev, lessonFile: file }));
                                                  }
                                                }}
                                              >
                                                <input
                                                  type="file"
                                                  id={`lesson-file-upload-${topic.topic_id}`}
                                                  accept={getLessonUploadAccept(newLessonData.type)}
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                      setNewLessonData(prev => ({ ...prev, lessonFile: e.target.files[0] }));
                                                    }
                                                  }}
                                                />
                                                {newLessonData.lessonFile ? (
                                                  <div className="space-y-1">
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNewLessonData(prev => ({ ...prev, lessonFile: null }));
                                                      }}
                                                      className="absolute top-2.5 right-2.5 p-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-full cursor-pointer hover:text-slate-700 transition shadow-sm"
                                                      title="Remove File"
                                                    >
                                                      <FiX size={14} />
                                                    </button>
                                                    {newLessonData.type === "file" || (newLessonData.lessonFile?.name && /\.(pdf|doc|docx|txt)$/i.test(newLessonData.lessonFile.name)) ? (
                                                      <FiFileText className="mx-auto text-[#1B357F]" size={22} />
                                                    ) : (
                                                      <FiPlay className="mx-auto text-[#1B357F]" size={22} />
                                                    )}
                                                    <p className="text-xs font-semibold text-slate-700">{newLessonData.lessonFile.name}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                      {(newLessonData.lessonFile.size / 1024 / 1024).toFixed(1)} MB
                                                    </p>
                                                  </div>
                                                ) : newLessonData.existingFileUrl ? (
                                                  <div className="space-y-1">
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNewLessonData(prev => ({ ...prev, existingFileUrl: null, existingFileName: null, existingFileType: null }));
                                                      }}
                                                      className="absolute top-2.5 right-2.5 p-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-full cursor-pointer hover:text-slate-700 transition shadow-sm"
                                                      title="Remove / Replace File"
                                                    >
                                                      <FiX size={14} />
                                                    </button>
                                                    {newLessonData.type === "video" ? (
                                                      <FiPlay className="mx-auto text-[#1B357F]" size={22} />
                                                    ) : (
                                                      <FiFileText className="mx-auto text-[#1B357F]" size={22} />
                                                    )}
                                                    <p className="text-xs font-semibold text-slate-700">{newLessonData.existingFileName || (newLessonData.type === "video" ? "Uploaded Video" : "Uploaded File")}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                      Existing {newLessonData.type === "video" ? "video" : "file"} attached • Click or drag to replace
                                                    </p>
                                                  </div>
                                                ) : (
                                                  <div className="space-y-1">
                                                    <FiPlus className="mx-auto text-slate-400" size={22} />
                                                    <p className="text-xs font-semibold text-slate-600">Click or drag file to upload</p>
                                                    <p className="text-[10px] text-slate-400">
                                                      {newLessonData.type === "video"
                                                        ? "Supports MP4, WebM up to 80MB"
                                                        : "Supports PDF, DOCX, TXT up to 80MB"}
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {!isViewOnlyQuiz && newLessonData.type === "video" && (
                                          <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-2">Free preview</label>
                                            <div className="flex items-center">
                                              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  disabled={isViewOnlyQuiz}
                                                  checked={newLessonData.freePreview}
                                                  onChange={(e) => setNewLessonData(prev => ({ ...prev, freePreview: e.target.checked }))}
                                                  className="h-4 w-4"
                                                />
                                                Allow free preview
                                              </label>
                                            </div>
                                          </div>
                                        )}
                                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
                                            <div className="w-full sm:w-auto">
                                              {isEditingLesson && newLessonData.type === "live" && (
                                                liveSessionStatus === "CANCELLED" ? (
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                                    <FiXCircle size={14} className="text-red-600 shrink-0" />
                                                    This live session is cancelled
                                                  </span>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    disabled={isCancellingLiveSession || isLiveSessionInPast}
                                                    onClick={handleCancelLiveSession}
                                                    className={`w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-xs ${
                                                      isLiveSessionInPast
                                                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                                                        : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    }`}
                                                    title={
                                                      isLiveSessionInPast
                                                        ? "Cannot cancel a live session that has already started or ended"
                                                        : "Cancel this scheduled live session"
                                                    }
                                                  >
                                                    <FiXCircle size={14} className={isLiveSessionInPast ? "text-slate-400 shrink-0" : "text-red-600 shrink-0"} />
                                                    {isCancellingLiveSession ? "Cancelling..." : "Cancel Live Session"}
                                                  </button>
                                                )
                                              )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
  <button type="button" onClick={handleCancelLessonForm} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer min-w-0">
                                                <X size={13} />
                                                {isViewOnlyQuiz || (isEditingLesson && newLessonData.type === "live" && liveSessionStatus === "CANCELLED") ? "Close" : "Cancel"}
                                              </button>
                                              {!isViewOnlyQuiz && !(isEditingLesson && newLessonData.type === "live" && liveSessionStatus === "CANCELLED") && (
                                                <button
                                                  type="submit"
                                                  disabled={isSubmittingLesson || isLiveSessionInPast}
                                                  className={`px-3 sm:px-4 py-2 text-white rounded-xl text-xs font-semibold shadow flex items-center justify-center gap-2 min-w-0 ${
                                                    isLiveSessionInPast
                                                      ? "bg-slate-400 cursor-not-allowed opacity-60"
                                                      : "bg-[#1B357F] hover:bg-[#152B66] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                                  }`}
                                                  title={isLiveSessionInPast ? "Cannot edit a live session that has already started or ended" : "Save Changes"}
                                                >
                                                  {isSubmittingLesson ? (
                                                    <>
                                                      <svg
                                                        className="animate-spin h-3 w-3 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <circle
                                                          className="opacity-25"
                                                          cx="12"
                                                          cy="12"
                                                          r="10"
                                                          stroke="currentColor"
                                                          strokeWidth="4"
                                                        />
                                                        <path
                                                          className="opacity-75"
                                                          fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                        />
                                                      </svg>
                                                      {/* Saving... */}
                                                      Submitting...
                                                    </>
                                                  ) : (
                                                    // "Save Changes"
                                                    <>
                                                      <FiSave size={13} />
                                                      Submit
                                                    </>
                                                  )}
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </form>
                                      </div>
                                    )}
                                  {hasContentBelow && !(isEditingLesson && editingLessonId === lesson.lesson_id) && (
                                    <div className="pl-6 space-y-2 pt-2">
                                      {/* Inline Media / Session Previewer */}
                                      {activeLessonPreviewId === lesson.lesson_id && (
                                        <div
                                          ref={activeLessonPreviewRef}
                                          onClick={(e) => e.stopPropagation()}
                                          className="mb-3"
                                        >
                                          {/* Video Inline Viewer */}
                                          {lesson.lesson_content_type === "video" && lesson.lesson_video_url && (
                                            <div className="rounded-xl overflow-hidden shadow-md">
                                              <InlineMediaViewer
                                                content={{
                                                  title: `${lesson.lesson_title} - Video`,
                                                  type: "video",
                                                  content_url: lesson.lesson_video_url
                                                }}
                                                onClose={() => setActiveLessonPreviewId(null)}
                                                themeColor="#1B357F"
                                              />
                                            </div>
                                          )}
                                          {/* File Inline Viewer (PDF, image, audio, doc) */}
                                          {(lesson.lesson_content_type === "text" || lesson.lesson_content_type === "file") && getLessonFileUrl(lesson) && (
                                            <div className="rounded-xl overflow-hidden shadow-md">
                                              <InlineMediaViewer
                                                content={{
                                                  title: lesson.resource?.resource_title || lesson.lesson_title,
                                                  type: getLessonFileType(lesson),
                                                  content_url: getLessonFileUrl(lesson)
                                                }}
                                                onClose={() => setActiveLessonPreviewId(null)}
                                                themeColor="#1B357F"
                                              />
                                            </div>
                                          )}
                                          {/* Live Session Inline Details Viewer */}
                                          {lesson.lesson_content_type === "live" && getLessonLiveData(lesson) && (
                                            <div className="bg-slate-50/90 rounded-xl border border-blue-100 p-4 space-y-3 shadow-2xs">
                                              <div className="flex items-start sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                  <div className={`p-1.5 rounded-lg shrink-0 ${getLessonLiveData(lesson)?.meeting_platform === "zoom" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                    {getLessonLiveData(lesson)?.meeting_platform === "zoom" ? <SiZoom size={16} /> : <SiGooglemeet size={16} />}
                                                  </div>
                                                  <div className="min-w-0">
                                                    <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
                                                      <h5 className="font-bold text-xs text-slate-800">
                                                        {getLessonLiveData(lesson)?.meeting_platform === "zoom" ? "Zoom Meeting" : "Google Meet"} Details
                                                      </h5>
                                                      {getLessonLiveData(lesson)?.session_status === "CANCELLED" && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider shrink-0">
                                                          Cancelled
                                                        </span>
                                                      )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500">Live lecture schedule & access information</p>
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => setActiveLessonPreviewId(null)}
                                                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 shrink-0"
                                                  title="Close Details"
                                                >
                                                </button>
                                              </div>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                {/* Meeting Link */}
                                                <div className="bg-white rounded-lg border border-slate-200 p-3 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                  <div className="min-w-0 flex-1">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Meeting Link</span>
                                                    <a
                                                      href={getLessonLiveData(lesson)?.meeting_link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate flex items-center gap-1.5"
                                                    >
                                                      <FiLink className="shrink-0" />
                                                      <span className="truncate">{getLessonLiveData(lesson)?.meeting_link || "No meeting link configured"}</span>
                                                      <FiExternalLink className="shrink-0 text-slate-400" size={12} />
                                                    </a>
                                                  </div>
                                                  {getLessonLiveData(lesson)?.meeting_link && (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        navigator.clipboard.writeText(getLessonLiveData(lesson).meeting_link);
                                                        toast.success("Meeting link copied to clipboard!");
                                                      }}
                                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
                                                    >
                                                      <FiCopy size={11} /> Copy
                                                    </button>
                                                  )}
                                                </div>
                                                {/* Passcode */}
                                                {getLessonLiveData(lesson)?.meeting_password && (
                                                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Passcode / Password</span>
                                                    <div className="flex items-center justify-between">
                                                      <span className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                                        <FiLock className="text-slate-400" /> {getLessonLiveData(lesson).meeting_password}
                                                      </span>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          navigator.clipboard.writeText(getLessonLiveData(lesson).meeting_password);
                                                          toast.success("Passcode copied to clipboard!");
                                                        }}
                                                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                                        title="Copy Passcode"
                                                      >
                                                        <FiCopy size={12} />
                                                      </button>
                                                    </div>
                                                  </div>
                                                )}
                                                {/* Start Time */}
                                                <div className={`bg-white rounded-lg border border-slate-200 p-3 ${!getLessonLiveData(lesson)?.meeting_password ? "sm:col-span-1" : ""}`}>
                                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Start Date & Time</span>
                                                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                                                    <FiCalendar className="text-slate-400 shrink-0" />
                                                    <span>
                                                      {getLessonLiveData(lesson)?.start_time
                                                        ? new Date(getLessonLiveData(lesson).start_time).toLocaleString("en-IN", {
                                                          dateStyle: "medium",
                                                          timeStyle: "short"
                                                        })
                                                        : "Not set"}
                                                    </span>
                                                  </div>
                                                </div>
                                                {/* End Time */}
                                                {getLessonLiveData(lesson)?.end_time && (
                                                  <div className="bg-white rounded-lg border border-slate-200 p-3 sm:col-span-2">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">End Date & Time</span>
                                                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                                                      <FiClock className="text-slate-400 shrink-0" />
                                                      <span>
                                                        {new Date(getLessonLiveData(lesson).end_time).toLocaleString("en-IN", {
                                                          dateStyle: "medium",
                                                          timeStyle: "short"
                                                        })}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {/* Render content list (excluding primary lecture video, primary resource file, and primary live session to prevent duplicate display) */}
                                      {(() => {
                                        const extraContents = (lesson.contents || []).filter(c =>
                                          !deletedContentIds[c.id] &&
                                          c.id !== lesson.lesson_id + "_content" &&
                                          c.title !== "Lecture video" &&
                                          c.id !== lesson.lesson_id + "_resource" &&
                                          !c.isPrimaryResource &&
                                          c.id !== lesson.lesson_id + "_live" &&
                                          !c.isLiveResource &&
                                          c.type !== "live" &&
                                          c.id !== lesson.lesson_id + "_quiz" &&
                                          !c.isQuizResource &&
                                          c.type !== "quiz"
                                        );
                                        if (extraContents.length === 0) {
                                          return lesson.lesson_content_type === "video" ? (
                                            <p className="text-xs text-slate-400 italic">No content uploaded for this lesson yet.</p>
                                          ) : null;
                                        }
                                        return extraContents.map((content) => {
                                          const isExpanded = !!expandedContents[content.id];
                                          return (
                                            <div key={content.id} className="space-y-1">
                                              {/* was: className={`flex items-center justify-between py-2.5 px-3.5 ...`} — title
                                                and View/Delete shared one row with no wrap, so truncate kicked in
                                                aggressively on phone, cutting titles down to "Lectur...", "Hando..."
                                                etc (image 4). Stacked to flex-col below sm:, so the title gets its own
                                                full-width line and actions sit on a second line; sm: and up reverts to
                                                the original single-row layout. */}
                                              <div
                                                onClick={() => (content.type === "live" || content.content_url) && toggleContentPreview(content.id)}
                                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 py-2.5 px-3.5 bg-white rounded-lg border transition-all select-none ${(content.content_url || content.type === "live") ? "cursor-pointer hover:border-[#1B357F]/60 hover:shadow-xs" : ""
                                                  } ${isExpanded ? "border-[#1B357F] bg-blue-50/20 shadow-xs" : "border-slate-100"}`}
                                              >
                                                <div className="flex items-center gap-2.5 text-slate-700 font-medium min-w-0 pr-2">
                                                  {content.type === "video" ? (
                                                    <FiPlay className="text-[#1B357F] shrink-0" size={15} />
                                                  ) : content.type === "live" ? (
                                                    <FiVideo className="text-[#1B357F] shrink-0" size={15} />
                                                  ) : content.type === "image" ? (
                                                    <FiImage className="text-slate-400 shrink-0" size={15} />
                                                  ) : content.type === "pdf" ? (
                                                    <FiFileText className="text-[#1B357F] shrink-0" size={15} />
                                                  ) : content.type === "quiz" ? (
                                                    <FiList className="text-[#1B357F] shrink-0" size={15} />
                                                  ) : (
                                                    <FiFileText className="text-slate-500 shrink-0" size={15} />
                                                  )}
                                                  <div className="flex flex-col min-w-0">
                                                    <span className="truncate font-semibold text-slate-800 text-xs">{content.title}</span>
                                                    <span className="text-[11px] text-slate-400 font-normal">
                                                      {content.type === "video" ? "Video" : content.type === "live" ? (content.detail || "Live Lecture") : content.type === "pdf" ? "PDF Document" : content.type === "image" ? "Image Resource" : content.type === "quiz" ? "Quiz" : content.type === "audio" ? "Audio File" : "File"}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                                  {(content.content_url || content.type === "quiz") && (
                                                    <button
                                                      type="button"
                                                      onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (content.type === "quiz") {
                                                          setIsEditingLesson(true);
                                                          setEditingLessonId(lesson.lesson_id);
                                                          setActiveTopicIdForLesson(topic.topic_id);
                                                          setIsViewOnlyQuiz(true);
                                                          setShowQuizValidation(false);
                                                          setLessonTitleError("");
                                                          setNewLessonData({
                                                            title: lesson.lesson_title,
                                                            status: lesson.lesson_is_published ? "Published" : "Draft",
                                                            type: "quiz",
                                                            freePreview: lesson.lesson_content_type === "video" && [true, 1, "1", "true"].includes(lesson.lesson_is_free_preview),
                                                            lessonFile: null,
                                                            existingFileUrl: null,
                                                            existingFileName: null,
                                                            existingFileType: null
                                                          });
                                                          setQuizInstructions("");
                                                          setQuizDuration(15);
                                                          setQuizPassingMarks(70);
                                                          setQuizAttempts(1);
                                                          setQuizStartDatetime("");
                                                          setQuizEndDatetime("");
                                                          setQuizQuestions([]);
                                                          try {
                                                            const token = sessionStorage.getItem("token");
                                                            const res = await axios.get(
                                                              `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lesson.lesson_id}`,
                                                              { headers: { Authorization: `Bearer ${token}` } }
                                                            );
                                                            if (res.data.success && res.data.quiz) {
                                                              const qObj = res.data.quiz;
                                                              setQuizInstructions(qObj.quiz_instructions || "");
                                                              setQuizDuration(qObj.quiz_duration_minutes || 15);
                                                              setQuizPassingMarks(qObj.passing_marks || 70);
                                                              setQuizAttempts(qObj.allowed_attempts || 1);
                                                              setQuizStartDatetime(formatForDateTimeLocal(qObj.quiz_start_datetime));
                                                              setQuizEndDatetime(formatForDateTimeLocal(qObj.quiz_end_datetime));
                                                              if (qObj.questions && Array.isArray(qObj.questions) && qObj.questions.length > 0) {
                                                                setQuizQuestions(qObj.questions.map(q => ({
                                                                  id: q.question_id || Date.now() + Math.random(),
                                                                  question_text: q.question_text || "",
                                                                  question_type: q.question_type || "single_mcq",
                                                                  question_marks: q.question_marks || 5,
                                                                  options: (q.options || []).map(o => ({
                                                                    option_text: o.option_text || "",
                                                                    is_correct: !!o.is_correct
                                                                  }))
                                                                })));
                                                              }
                                                            }
                                                          } catch (err) {
                                                            console.warn("Could not fetch quiz for view:", err);
                                                          }
                                                          setShowLessonForm(true);
                                                        } else if (content.content_url) {
                                                          toggleContentPreview(content.id);
                                                        }
                                                      }}
                                                      className="p-1 text-slate-400 hover:text-[#1B357F] hover:bg-blue-50/60 rounded-md transition-colors cursor-pointer"
                                                      // title="View Content"
                                                      title={getViewContentLabel(content.type)}

                                                    >
                                                      <FiEye size={15} />
                                                    </button>
                                                  )}

                                                  {/* Download Permission Toggle Button */}
                                                  {content.type !== "live" && (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleContentDownload(content, topic.topic_id, lesson.lesson_id);
                                                      }}
                                                      className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                      title={
                                                        content.content_allow_download
                                                          ? "Student Download Permission: Allowed (Students can download this file. Click to disable)"
                                                          : "Student Download Permission: Disabled (Students cannot download this file. Click to allow)"
                                                      }
                                                      aria-label="Toggle student download permission"
                                                    >
                                                      <FiDownload
                                                        size={15}
                                                        className={`shrink-0 transition-colors ${content.content_allow_download ? "text-[#1B357F]" : "text-slate-400"
                                                          }`}
                                                      />
                                                      <div
                                                        className={`w-8 h-[18px] rounded-full transition-colors relative flex items-center p-[2px] ${content.content_allow_download ? "bg-[#1B357F]" : "bg-slate-300"
                                                          }`}
                                                      >
                                                        <div
                                                          className={`w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-xs ${content.content_allow_download ? "translate-x-[14px]" : "translate-x-0"
                                                            }`}
                                                        />
                                                      </div>
                                                    </button>
                                                  )}

                                                  <button
                                                    type="button"
                                                    disabled={isCoursePublished || isLockedForModules}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (isCoursePublished || isLockedForModules) return;
                                                      handleDeleteContent(content.id, topic.topic_id, content.type, lesson.lesson_id);
                                                    }}
                                                    className={`p-1 rounded-md transition-colors ${isCoursePublished
                                                      ? "opacity-40 cursor-not-allowed text-slate-300"
                                                      : "text-slate-400 hover:text-red-500 hover:bg-red-50/60 cursor-pointer"
                                                      }`}
                                                    title={
                                                      isLockedForModules
                                                        ? (trainingStatus === "COMPLETED" ? "Course is completed — modules are locked" : "Course is inactive — modules are locked")
                                                        : isCoursePublished ? "Cannot delete content once course is published" : getDeleteContentLabel(content.type)}
                                                  >
                                                    <FiTrash2 size={15} />
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Inline Media Player */}
                                              {isExpanded && content.content_url && (
                                                <InlineMediaViewer
                                                  content={content}
                                                  onClose={() => toggleContentPreview(content.id)}
                                                  themeColor="#1B357F"
                                                />
                                              )}

                                              {/* Inline Live Session Details Viewer */}
                                              {isExpanded && content.type === "live" && (
                                                <div className="bg-slate-50/90 rounded-xl border border-blue-100 p-4 space-y-3 mt-2 shadow-2xs">
                                                  <div className="flex items-start sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                      <div className={`p-1.5 rounded-lg shrink-0 ${content.liveData?.meeting_platform === "zoom" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                                                        {content.liveData?.meeting_platform === "zoom" ? <SiZoom size={16} /> : <SiGooglemeet size={16} />}
                                                      </div>
                                                      <div className="min-w-0">
                                                        <h5 className="font-bold text-xs text-slate-800">
                                                          {content.liveData?.meeting_platform === "zoom" ? "Zoom Meeting" : "Google Meet"} Details
                                                        </h5>
                                                        <p className="text-[10px] text-slate-500">Live lecture schedule & access information</p>
                                                      </div>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      onClick={() => toggleContentPreview(content.id)}
                                                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 shrink-0"
                                                      title="Close Details"
                                                    >
                                                      <FiX size={15} />
                                                    </button>
                                                  </div>

                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                    {/* Meeting Link */}
                                                    <div className="bg-white rounded-lg border border-slate-200 p-3 sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                      <div className="min-w-0 flex-1">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Meeting Link</span>
                                                        <a
                                                          href={content.liveData?.meeting_link}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline truncate flex items-center gap-1.5"
                                                        >
                                                          <FiLink className="shrink-0" />
                                                          <span className="truncate">{content.liveData?.meeting_link || "No meeting link configured"}</span>
                                                          <FiExternalLink className="shrink-0 text-slate-400" size={12} />
                                                        </a>
                                                      </div>
                                                      {content.liveData?.meeting_link && (
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            navigator.clipboard.writeText(content.liveData.meeting_link);
                                                            toast.success("Meeting link copied to clipboard!");
                                                          }}
                                                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition flex items-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
                                                        >
                                                          <FiCopy size={11} /> Copy
                                                        </button>
                                                      )}
                                                    </div>

                                                    {/* Passcode */}
                                                    {content.liveData?.meeting_password && (
                                                      <div className="bg-white rounded-lg border border-slate-200 p-3">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Passcode / Password</span>
                                                        <div className="flex items-center justify-between">
                                                          <span className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                                            <FiLock className="text-slate-400" /> {content.liveData.meeting_password}
                                                          </span>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              navigator.clipboard.writeText(content.liveData.meeting_password);
                                                              toast.success("Passcode copied to clipboard!");
                                                            }}
                                                            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                                            title="Copy Passcode"
                                                          >
                                                            <FiCopy size={12} />
                                                          </button>
                                                        </div>
                                                      </div>
                                                    )}

                                                    {/* Start Time */}
                                                    <div className={`bg-white rounded-lg border border-slate-200 p-3 ${!content.liveData?.meeting_password ? "sm:col-span-1" : ""}`}>
                                                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Start Date & Time</span>
                                                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                                                        <FiCalendar className="text-slate-400 shrink-0" />
                                                        <span>
                                                          {content.liveData?.start_time
                                                            ? new Date(content.liveData.start_time).toLocaleString("en-IN", {
                                                              dateStyle: "medium",
                                                              timeStyle: "short"
                                                            })
                                                            : "Not set"}
                                                        </span>
                                                      </div>
                                                    </div>

                                                    {/* End Time */}
                                                    {content.liveData?.end_time && (
                                                      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:col-span-2">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">End Date & Time</span>
                                                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                                                          <FiClock className="text-slate-400 shrink-0" />
                                                          <span>
                                                            {new Date(content.liveData.end_time).toLocaleString("en-IN", {
                                                              dateStyle: "medium",
                                                              timeStyle: "short"
                                                            })}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        });
                                      })()}

                                      {/* "+ Add content" trigger */}
                                      {lesson.lesson_content_type === "video" && (!showContentForm || activeLessonIdForContent !== lesson.lesson_id) && (
                                        <div className="pt-2">
                                          <button
                                            onClick={() => {
                                              setActiveLessonIdForContent(lesson.lesson_id);
                                              setActiveTopicIdForContent(topic.topic_id);
                                              setContentTitleError("");
                                              setContentFileError("");
                                              setShowContentForm(true);
                                            }}
                                            className="border border-[#D1E4FF] text-[#1B357F] hover:bg-blue-50/40 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition flex items-center gap-1 cursor-pointer bg-white"
                                            title="Add content"
                                          >
                                            <FiPlus size={11} /> Add content
                                          </button>
                                        </div>
                                      )}

                                      {/* INLINE CONTENT CREATION FORM */}
                                      {lesson.lesson_content_type === "video" && showContentForm && activeLessonIdForContent === lesson.lesson_id && (
                                        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 mt-3 space-y-4 shadow-sm min-w-0">
                                          {/* border-b border-slate-200 */}
                                          <div className="flex justify-between items-center pb-2">
                                            <h5 className="font-bold text-slate-800 text-xs">Add Content Item</h5>
                                            <button type="button" onClick={() => { setShowContentForm(false); setSelectedFile(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Close"><FiX size={14} /></button>
                                          </div>

                                          <form onSubmit={handleAddContentSubmit} noValidate className="space-y-4">
                                            <div>
                                              <div className="flex justify-between items-center mb-1">
                                                <label className="block text-xs font-semibold text-slate-600">Content Title <span className="text-red-500">*</span></label>
                                                <span className={`text-[10px] font-semibold transition-colors ${(newContentData.title || "").length === 200 ? "text-green-600" : "text-slate-400"}`}>
                                                  {(newContentData.title || "").length}/200 characters
                                                </span>
                                              </div>
                                              <input
                                                type="text"
                                                maxLength={200}
                                                required
                                                value={newContentData.title}
                                                onChange={(e) => {
                                                  setNewContentData(prev => ({ ...prev, title: e.target.value }));
                                                  if (contentTitleError && e.target.value.trim()) setContentTitleError("");
                                                }}
                                                onBlur={(e) => setNewContentData(prev => ({ ...prev, title: normalizeText(e.target.value) }))}
                                                placeholder="e.g. Vocabulary Handout sheet"
                                                className={`w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-0 ${contentTitleError ? "border-red-500" : "border-slate-200 focus:border-slate-300"
                                                  }`}
                                              />
                                              {contentTitleError && (
                                                <p className="text-xs text-red-500 mt-1">{contentTitleError}</p>
                                              )}
                                            </div>

                                            <div>
                                              <label className="block text-xs font-semibold text-slate-600 mb-1">Content Type <span className="text-red-500">*</span></label>
                                              <Select
                                                options={[
                                                  { value: "pdf", label: "PDF Document" },
                                                  { value: "image", label: "Image / Graphic Resource" },
                                                  { value: "audio", label: "Audio File" },
                                                  { value: "document", label: "Document" }
                                                ]}
                                                value={{
                                                  value: newContentData.type,
                                                  label: newContentData.type === "pdf"
                                                    ? "PDF Document"
                                                    : newContentData.type === "image"
                                                      ? "Image / Graphic Resource"
                                                      : newContentData.type === "audio"
                                                        ? "Audio File"
                                                        : "Document"
                                                }}
                                                onChange={(option) => {
                                                  setNewContentData(prev => ({ ...prev, type: option.value }));
                                                  setSelectedFile(null);
                                                }}
                                                styles={instructorSelectStyles}
                                                isSearchable={false}
                                              />
                                            </div>

                                            <div>
                                              <div className="flex justify-between items-center mb-1">
                                                <label className="block text-[11px] font-semibold text-slate-600">
                                                  Upload File <span className="text-red-500">*</span>
                                                </label>
                                                {newContentData.type === "quiz" && (
                                                  <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); toast.info("Downloading quiz template.xlsx..."); }}
                                                    className="text-[10px] text-[#1B357F] hover:underline font-bold"
                                                  >
                                                    Download template (.xlsx)
                                                  </a>
                                                )}
                                              </div>

                                              {selectedFile ? (
                                                <div className="relative border border-slate-200 bg-slate-50/50 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                                  <div className="flex items-center gap-2">
                                                    {newContentData.type === "video" ? (
                                                      <FiPlay className="text-[#1B357F]" size={18} />
                                                    ) : newContentData.type === "pdf" ? (
                                                      <FiFileText className="text-red-500" size={18} />
                                                    ) : (
                                                      <FiList className="text-[#1B357F]" size={18} />
                                                    )}
                                                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[280px]">
                                                      {selectedFile.name}
                                                    </span>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setSelectedFile(null);
                                                    }}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center transition bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 cursor-pointer"
                                                    title="Remove File"
                                                  >
                                                    <FiX size={14} />
                                                  </button>
                                                </div>
                                              ) : (
                                                  <div className={`border-2 border-dashed hover:bg-slate-50/50 rounded-xl p-5 text-center transition relative group cursor-pointer ${contentFileError && !selectedFile ? "border-red-500 bg-red-50/30" : "border-slate-200"
                                                    }`}>
                                                  <input
                                                    type="file"
                                                    accept={
                                                      newContentData.type === "pdf"
                                                        ? "application/pdf,.pdf"
                                                        : newContentData.type === "image"
                                                          ? "image/*"
                                                          : newContentData.type === "audio"
                                                            ? "audio/*,.mp3,.wav"
                                                            : ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                    }
                                                    onChange={(e) => {
                                                      if (e.target.files && e.target.files[0]) {
                                                        setSelectedFile(e.target.files[0]);
                                                      }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                  />
                                                  <div className="space-y-1.5">
                                                    <FiPlus className="mx-auto text-slate-400 group-hover:text-slate-600 transition" size={24} />
                                                    <p className="text-xs font-bold text-slate-600">Click or drag file to upload</p>
                                                    <p className="text-[10px] text-slate-400">
                                                      {newContentData.type === "pdf"
                                                        ? "Supports PDF up to 20MB"
                                                        : newContentData.type === "image"
                                                          ? "Supports JPG, PNG, WebP up to 10MB"
                                                          : newContentData.type === "audio"
                                                            ? "Supports MP3, WAV up to 20MB"
                                                            : "Supports DOC, DOCX up to 20MB"}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}
                                              {contentFileError && !selectedFile && (
                                                <p className="text-xs text-red-500 mt-1">{contentFileError}</p>
  )}
                                            </div>

                                            {/* Download Permission Toggle */}
                                            <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-0">
                                              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                                                <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center transition-colors ${newContentData.allow_download ? "bg-blue-100 text-[#1B357F]" : "bg-slate-200 text-slate-400"}`}>
                                                  {newContentData.allow_download ? <FiDownload size={14} /> : <FiLock size={14} />}
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="text-xs font-bold text-slate-700">Download Permission</p>
                                                  <p className="text-[10px] text-slate-500">Allow students to download this file</p>
                                                </div>
                                              </div>
                                              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input
                                                  type="checkbox"
                                                  checked={!!newContentData.allow_download}
                                                  onChange={(e) => setNewContentData(prev => ({ ...prev, allow_download: e.target.checked }))}
                                                  className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1B357F]"></div>
                                              </label>
                                            </div>

                                                                                        {/* border-t border-slate-200 */}
                                            <div className="grid grid-cols-2 gap-2 pt-2 sm:flex sm:justify-end">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setShowContentForm(false);
                                                  setSelectedFile(null);
                                                }}
                                                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer min-w-0"
                                              >
                                                <X size={13} />
                                                Cancel
                                              </button>
                                              <button
                                                type="submit"
                                                disabled={isSubmittingContent}
                                                className="px-3 sm:px-4 py-2 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-xs font-semibold shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-0"
                                                title="Submit"
                                              >
                                                {isSubmittingContent ? (
                                                  <>
                                                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                    {/* Uploading... */}
                                                    Submitting...
                                                  </>
                                                ) :
                                                  // "Add Content"
                                                  <>
                                                    <FiSave className="h-3 w-3" />
                                                    Submit
                                                  </>}
                                              </button>
                                            </div>
                                          </form>
                                        </div>
                                      )}

                                    </div>
                                  )}

                                </div>
                              );
                            })
                          }
                        </div>

                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ENROLLED STUDENTS TAB */}
        {activeTab === "students" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Enrolled Students
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {/* Review student learning progress in this course. */}
                  Review student learning progress in this course.
                </p>
              </div>

              {publishStatus === "PUBLISHED" && (
                <div className="flex items-center gap-3 shrink-0">
                  {/* <span className={`text-xs font-semibold px-3 py-1 rounded-full ${enrollmentStatus === "OPEN"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                    }`}>
                    Enrollment:
                    {enrollmentStatus === "OPEN"
                      ? "Open"
                      : enrollmentStatus === "CLOSED"
                        ? "Closed"
                        : "Not Started"
                    }
                  </span> */}

                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${enrollmentStatus === "OPEN"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                    }`}>
                    Enrollment:
                    {enrollmentStatus === "OPEN"
                      ? " Open"
                      : " Closed"
                    }
                  </span>

                  {!hasTrainingStarted && !isLockedForModules && (
                    <button
                      onClick={handleToggleEnrollment}
                      disabled={enrollmentUpdating || isLockedForModules}
                      title={
                        isLockedForModules
                          ? (trainingStatus === "COMPLETED" ? "Course is completed — enrollment is locked" : "Course is inactive — enrollment is locked")
                          : hasTrainingStarted
                            ? "Training has already started"
                            : undefined
                      }
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${enrollmentStatus === "OPEN"
                        ? "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                    >
                      {enrollmentUpdating
                        ? "Updating..."
                        : enrollmentStatus === "OPEN"
                          ? "Stop Enrollment"
                          : "Start Enrollment"}
                    </button>
                  )}
                </div>
              )}


            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-6">Progress</th>
                    <th className="py-3 px-6">Joined Date</th>
                  </tr>
                </thead>

              
                <tbody className="divide-y divide-slate-100 text-sm">
                  {studentsLoading ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-8 text-center text-slate-500"
                      >
                        Loading students...
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr
                        key={student.user_id}
                        className="hover:bg-slate-50/50"
                      >
                        <td className="py-4 px-6 font-semibold text-slate-800">
                          <div>{student.user_full_name}</div>

                          <div className="text-[11px] text-slate-400 font-normal">
                            {student.user_email}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3 max-w-[200px]">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{
                                  width: `${student.progress || 0}%`
                                }}
                              />
                            </div>

                            <span className="text-xs font-bold text-slate-600">
                              {student.progress || 0}%
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-500 text-xs">
                          {student.joined_date
                            ? new Date(
                              student.joined_date
                            ).toLocaleDateString('en-GB')
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-8 text-center text-slate-500"
                      >
                        No students enrolled yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>


            </div>
          </div>
        )}

        {/* SETTINGS TAB
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Course Settings</h3>
              <p className="text-xs text-slate-500 mt-1">Manage configuration settings of the training class.</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3 max-w-xl">
              <FiInfo className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-amber-800 leading-relaxed font-medium">
                <strong>Read-only access:</strong> Course configuration parameters (Title, Code, and Fee) can only be modified by system administrators. Please contact support if adjustments are required.
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Course Title</label>
                <input
                  type="text"
                  disabled
                  value={courseSettings.title}
                  className="w-full text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Course Code</label>
                  <input
                    type="text"
                    disabled
                    value={courseSettings.code}
                    className="w-full text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-3 py-2 cursor-not-allowed"
                  />
                </div>
              </div>
            </form>
          </div>
        )} */}

      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        confirmVariant={confirmModalState.confirmVariant}
      />

    </div>
  );
};

export default ManageCourse;
