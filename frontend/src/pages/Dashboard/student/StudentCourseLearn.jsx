import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import LearningLayout from "../../../components/StudentLearning-Videos/LearningLayout";
import {
    FiAlertCircle,
    FiLock,
    FiClock,
    FiArrowLeft,
    FiCompass,
    FiBookOpen
} from "react-icons/fi";

const StudentCourseLearn = () => {
    const navigate = useNavigate();
    const { trainingId } = useParams();

    const [searchParams] = useSearchParams();

    const lessonId = searchParams.get("lessonId");

    const [training, setTraining] = useState(null);
    const [selectedLesson, setSelectedLesson] = useState(null);

    const [completedLessons, setCompletedLessons] = useState({});

    /* resource lesson */
    const [resourceData, setResourceData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [accessError, setAccessError] = useState(null);

    useEffect(() => {
        fetchTrainingDetails();
    }, [trainingId]);

    // useEffect(() => {
    //     fetchTrainingDetails();
    // }, [trainingId, lessonId]);



    // useEffect(() => {
    //     if (selectedLesson) {
    //         console.log(
    //             "Selected Lesson:",
    //             selectedLesson
    //         );

    //         console.log(
    //             "Video URL:",
    //             selectedLesson.lesson_video_url
    //         );
    //     }
    // }, [selectedLesson]);

    /* ACTIVITY PING — logs today as an active day for the streak calendar */
    const pingActivity = async () => {

        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {

            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/students/activity/ping`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        } catch (error) {
            console.log("Ping Activity Error:", error);
        }

    };

    /* Log activity whenever the student opens a lesson */
    useEffect(() => {
        if (selectedLesson) {
            pingActivity();
        }
    }, [selectedLesson]);

    // const handleLessonSelect = (lesson) => {
    //     setSelectedLesson(lesson);
    // };

    /* */
    // const fetchTrainingDetails = async () => {
    //     try {
    //         const token =
    //             sessionStorage.getItem("token");

    //         const res = await axios.get(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/mylearning/details/${trainingId}`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );

    //         const trainingData =
    //             res.data.training;

    //         setTraining(trainingData);
    //         console.log(trainingData);

    //         const completedMap = {};

    //         trainingData.topics?.forEach(
    //             topic => {
    //                 topic.lessons?.forEach(
    //                     lesson => {

    //                         if (
    //                             lesson.lesson_completed
    //                         ) {
    //                             completedMap[
    //                                 lesson.lesson_id
    //                             ] = true;
    //                         }

    //                     }
    //                 );
    //             }
    //         );

    //         setCompletedLessons(completedMap);

    //         // Select first lesson automatically
    //         const firstLesson =
    //             trainingData?.topics?.[0]
    //                 ?.lessons?.[0];

    //         if (firstLesson) {
    //             setSelectedLesson(firstLesson);
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     }
    // };


    /* Working */
    const fetchTrainingDetails = async () => {
        try {
            setLoading(true);
            setAccessError(null);

            const token =
                sessionStorage.getItem("token");

            if (!token) {
                setAccessError({
                    type: "NOT_ENROLLED",
                    message: "Please login to access this course."
                });
                setLoading(false);
                return;
            }

            const [trainingRes, progressRes] =
                await Promise.all([
                    axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/mylearning/details/${trainingId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),

                    axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/lessons-progress/training/${trainingId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                ]);

            const trainingData =
                trainingRes.data.training;

            setTraining(trainingData);
            // console.log(trainingData);

            const progressMap = {};

            progressRes.data.data.forEach(p => {
                progressMap[p.lesson_id] = {
                    completed: !!p.completed,
                    percentage: Number(p.percentage)
                };
            });

            const completedMap = {};

            // trainingData.topics?.forEach(
            //     topic => {
            //         topic.lessons?.forEach(
            //             lesson => {

            //                 if (
            //                     lesson.lesson_completed
            //                 ) {
            //                     completedMap[
            //                         lesson.lesson_id
            //                     ] = true;
            //                 }

            //             }
            //         );
            //     }
            // );

            Object.entries(progressMap).forEach(
                ([lessonId, progress]) => {

                    if (progress.completed) {
                        completedMap[lessonId] = true;
                    }

                }
            );

            setCompletedLessons(completedMap);

            // Select first lesson automatically
            // const firstLesson =
            //     trainingData?.topics?.[0]
            //         ?.lessons?.[0];

            // if (firstLesson) {
            //     setSelectedLesson(firstLesson);
            // }


            /* */
            // const allLessons =
            //     trainingData.topics?.flatMap(
            //         topic => topic.lessons || []
            //     ) || [];

            // const nextIncompleteLesson =
            //     allLessons.find(
            //         lesson =>
            //             !progressMap[lesson.lesson_id]?.completed
            //     );

            // const lessonToOpen =
            //     nextIncompleteLesson ||
            //     allLessons[0];

            // if (lessonToOpen) {
            //     setSelectedLesson(lessonToOpen);
            // }

            // Flatten all lessons
            // const allLessons =
            //     trainingData?.topics?.flatMap(
            //         topic => topic.lessons || []
            //     ) || [];

            // if (allLessons.length > 0) {

            //     // First lesson that is NOT completed
            //     const nextLesson = allLessons.find(
            //         lesson =>
            //             !progressMap[lesson.lesson_id]?.completed
            //     );

            //     if (nextLesson) {
            //         setSelectedLesson(nextLesson);
            //     } else {
            //         // Everything completed → open last lesson
            //         setSelectedLesson(
            //             allLessons[allLessons.length - 1]
            //         );
            //     }
            // }

            const allLessons =
                trainingData?.topics?.flatMap(
                    topic => topic.lessons || []
                ) || [];

            let resumeLesson = null;

            // Find lesson that was started but not completed
            resumeLesson = allLessons.find(
                lesson => {
                    const p = progressMap[lesson.lesson_id];

                    return (
                        p &&
                        p.percentage > 0 &&
                        p.percentage < 100
                    );
                }
            );

            if (!resumeLesson) {
                resumeLesson = allLessons.find(
                    lesson =>
                        !progressMap[lesson.lesson_id]?.completed
                );
            }

            if (!resumeLesson && allLessons.length > 0) {
                resumeLesson =
                    allLessons[allLessons.length - 1];
            }

            setSelectedLesson(resumeLesson);

        } catch (error) {
            console.error("Fetch Training Details Error:", error);
            const status = error.response?.status;
            const data = error.response?.data;

            if (status === 404 || data?.errorType === "COURSE_NOT_AVAILABLE") {
                setAccessError({
                    type: "NOT_FOUND",
                    message: data?.message || "Course not available",
                    title: null
                });
            } else if (data?.errorType === "ENROLLMENT_PENDING") {
                setAccessError({
                    type: "PENDING",
                    message: data?.message || "Your enrollment for this course is pending approval",
                    title: data?.trainingTitle || null
                });
            } else if (data?.errorType === "COURSE_NOT_STARTED") {
                setAccessError({
                    type: "NOT_STARTED",
                    message: data?.message || "This course has not started yet",
                    title: data?.trainingTitle || null,
                    startDate: data?.trainingStartDate || null
                });
            } else if (status === 403 || data?.errorType === "NOT_ENROLLED") {
                setAccessError({
                    type: "NOT_ENROLLED",
                    message: data?.message || "You are not enrolled in this course",
                    title: data?.trainingTitle || null
                });
            } else {
                setAccessError({
                    type: "NOT_FOUND",
                    message: "Course not available or access restricted",
                    title: null
                });
            }
        } finally {
            setLoading(false);
        }
    };


    // const fetchTrainingDetails = async () => {
    //     try {
    //         const token =
    //             sessionStorage.getItem("token");

    //         const [trainingRes, progressRes] =
    //             await Promise.all([
    //                 axios.get(
    //                     `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/mylearning/details/${trainingId}`,
    //                     {
    //                         headers: {
    //                             Authorization: `Bearer ${token}`,
    //                         },
    //                     }
    //                 ),

    //                 axios.get(
    //                     `${import.meta.env.VITE_API_BASE_URL}/api/lessons-progress/training/${trainingId}`,
    //                     {
    //                         headers: {
    //                             Authorization: `Bearer ${token}`,
    //                         },
    //                     }
    //                 )
    //             ]);

    //         const trainingData =
    //             trainingRes.data.training;

    //         setTraining(trainingData);
    //         console.log(trainingData);

    //         const progressMap = {};

    //         progressRes.data.data.forEach(p => {
    //             progressMap[p.lesson_id] = {
    //                 completed: !!p.completed,
    //                 percentage: Number(p.percentage)
    //             };
    //         });

    //         const allLessons =
    //             trainingData?.topics?.flatMap(
    //                 topic => topic.lessons || []
    //             ) || [];

    //         let lessonToOpen = null;

    //         // 1. If URL contains lessonId, open that lesson
    //         if (lessonId) {
    //             lessonToOpen = allLessons.find(
    //                 lesson =>
    //                     String(lesson.lesson_id) === String(lessonId)
    //             );
    //         }

    //         // 2. Otherwise resume unfinished lesson
    //         if (!lessonToOpen) {
    //             lessonToOpen = allLessons.find(lesson => {
    //                 const progress = progressMap[lesson.lesson_id];

    //                 return (
    //                     progress &&
    //                     progress.percentage > 0 &&
    //                     progress.percentage < 100
    //                 );
    //             });
    //         }

    //         // 3. Otherwise open first incomplete lesson
    //         if (!lessonToOpen) {
    //             lessonToOpen = allLessons.find(
    //                 lesson =>
    //                     !progressMap[lesson.lesson_id]?.completed
    //             );
    //         }

    //         // 4. Everything completed → open last lesson
    //         if (!lessonToOpen && allLessons.length > 0) {
    //             lessonToOpen = allLessons[allLessons.length - 1];
    //         }

    //         setSelectedLesson(lessonToOpen);

    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    /* Previous */
    useEffect(() => {
        if (!training) return;

        const allLessons =
            training.topics?.flatMap(
                topic => topic.lessons || []
            ) || [];

        if (lessonId) {
            const clickedLesson = allLessons.find(
                lesson =>
                    String(lesson.lesson_id) === String(lessonId)
            );

            if (clickedLesson) {
                setSelectedLesson(clickedLesson);
                // handleLessonSelect(clickedLesson);
                
                return;
            }
        }

        // fallback
        if (allLessons.length > 0) {
            setSelectedLesson(allLessons[0]);
        }
    }, [training, lessonId]);

    /* fetching resource lesson details */
    const fetchLessonResource = async (
        lessonId
    ) => {

        try {

            const token =
                sessionStorage.getItem("token");

            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/lessons/${lessonId}/resource`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setResourceData(
                res.data.data
            );

        } catch (error) {

            console.log(
                "Resource fetch error:",
                error
            );

            setResourceData(null);
        }
    };

    useEffect(() => {

        if (!selectedLesson) return;

        if (
            selectedLesson.lesson_content_type ===
            "text"
        ) {

            fetchLessonResource(
                selectedLesson.lesson_id
            );

        } else {

            setResourceData(null);

        }

    }, [selectedLesson]);

    /* COMPLETION UPDATER */
    // const markLessonCompleted = (lessonId) => {
    //     setCompletedLessons(prev => ({
    //         ...prev,
    //         [lessonId]: true
    //     }));
    // };


    /* COMPLETION UPDATER- BACKEND INTEGRATER */
    const markLessonCompleted = async (lessonId) => {
        try {
            const token = sessionStorage.getItem("token");

            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/lessons-progress/complete`,
                {
                    lesson_id: lessonId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCompletedLessons(prev => ({
                ...prev,
                [lessonId]: true
            }));

            return true;

        } catch (error) {
            console.error(
                "Failed to complete lesson:",
                error
            );

            return false;
        }
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center py-24 min-h-[50vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading Course syllabus...</span>
            </div>
        );
    }

    if (accessError) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 md:p-12 text-center max-w-lg w-full mx-auto">
                    {accessError.type === "NOT_FOUND" ? (
                        <>
                            <div className="w-16 h-16 bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <FiAlertCircle size={32} className="text-slate-600" />
                            </div>

                            <span className="inline-block px-3.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 mb-3 uppercase tracking-wider">
                                Course Not Available
                            </span>

                            <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                Course Not Found
                            </h1>

                            <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                The course you are looking for (ID: <span className="font-mono font-semibold text-slate-800">#{trainingId}</span>) does not exist or is currently not available.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                    onClick={() => navigate("/courses")}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FiCompass size={16} /> Browse Courses
                                </button>
                                <button
                                    onClick={() => navigate("/my-learning")}
                                    className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <FiArrowLeft size={16} /> My Learning
                                </button>
                            </div>
                        </>
                    ) : accessError.type === "PENDING" ? (
                        <>
                            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <FiClock size={32} className="text-amber-600" />
                            </div>

                            <span className="inline-block px-3.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 mb-3 uppercase tracking-wider">
                                Approval Pending
                            </span>

                            <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                Enrollment Pending
                            </h1>

                            <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                {accessError.title ? (
                                    <>Your enrollment for <strong className="text-slate-800">"{accessError.title}"</strong> is currently pending administrator approval.</>
                                ) : (
                                    <>Your enrollment for this course is pending administrator approval.</>
                                )} Once approved, you will get full access to the course syllabus and lessons.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                    onClick={() => navigate("/my-learning")}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FiArrowLeft size={16} /> Back to My Learning
                                </button>
                            </div>
                        </>
                    ) : accessError.type === "NOT_STARTED" ? (
                        <>
                            <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <FiClock size={32} className="text-amber-600" />
                            </div>

                            <span className="inline-block px-3.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 mb-3 uppercase tracking-wider">
                                Course Not Started
                            </span>

                            <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                Course Not Started Yet
                            </h1>

                            <p className="text-sm text-slate-600 leading-relaxed mb-2">
                                {accessError.title ? (
                                    <> <strong className="text-slate-800">"{accessError.title}"</strong> has not started yet.</>
                                ) : (
                                    accessError.message
                                )}
                            </p>

                            {accessError.startDate && (
                                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                    Access starts on {new Date(accessError.startDate).toLocaleDateString()}.
                                </p>
                            )}

                            <button
                                onClick={() => navigate("/my-learning")}
                                className="w-full sm:w-auto px-6 py-2.5 bg-[#1B357F] hover:bg-[#152B66] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto"
                            >
                                <FiArrowLeft size={16} /> My Learning
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                                <FiLock size={30} className="text-rose-600" />
                            </div>

                            <span className="inline-block px-3.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-200 mb-3 uppercase tracking-wider">
                                Access Restricted
                            </span>

                            <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                You Are Not Enrolled
                            </h1>

                            <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                {accessError.title ? (
                                    <>You have not enrolled in <strong className="text-slate-800">"{accessError.title}"</strong>.</>
                                ) : (
                                    <>You have not enrolled in this course.</>
                                )} Please enroll in this course to access the syllabus, video lectures, and study materials.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button
                                    onClick={() => navigate(`/student/course/${trainingId}`)}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-[#C0432C] hover:bg-[#a8391f] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FiBookOpen size={16} /> View Course & Enroll
                                </button>
                                <button
                                    onClick={() => navigate("/my-learning")}
                                    className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <FiArrowLeft size={16} /> My Learning
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    const allLessons =
        training.topics?.flatMap(
            topic => topic.lessons || []
        ) || [];

    const currentIndex =
        allLessons.findIndex(
            l =>
                l.lesson_id ===
                selectedLesson?.lesson_id
        );

    const isLastLesson =
        currentIndex === allLessons.length - 1;

    return (
        <LearningLayout
            training={training}
            selectedLesson={selectedLesson}
            setSelectedLesson={setSelectedLesson}
            allLessons={allLessons}
            currentIndex={currentIndex}
            completedLessons={completedLessons}
            markLessonCompleted={markLessonCompleted}

            // resource lesson
            resourceData={resourceData}
        />
    );
};

export default StudentCourseLearn;