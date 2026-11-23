import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiClock,
  FiUser,
  FiEdit2,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiAlertCircle,
  FiVideo,
  FiCheckCircle,
  FiChevronDown,
} from "react-icons/fi";

const formatDuration = (minutes) => {
  const totalMinutes = Number(minutes || 0);

  if (totalMinutes === 0) return "Duration unavailable";

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0) {
    return remainingMinutes > 0
      ? `${hours} hr ${remainingMinutes} min`
      : `${hours} hr`;
  }

  return `${remainingMinutes} min`;
};

const EmployeeDetails = ({ employee, onBack, handleEdit }) => {
  const [showAllTrainings, setShowAllTrainings] = useState(false);

  const [videoActivity, setVideoActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [trainingProgress, setTrainingProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const [expandedTrainingId, setExpandedTrainingId] = useState(null);

  // useEffect(() => {
  //   if (!employee?.user_id) return;

  //   const controller = new AbortController();

  //   const fetchVideoActivity = async () => {
  //     try {
  //       setActivityLoading(true);
  //       setVideoActivity([]);

  //       const token = sessionStorage.getItem("token");

  //       const response = await axios.get(
  //         `${import.meta.env.VITE_API_BASE_URL}/api/company/employees/${employee.user_id}/video-activity`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //           signal: controller.signal,
  //         }
  //       );

  //       if (response.data?.success) {
  //         setVideoActivity(response.data.data || []);
  //       }

  //     } catch (error) {
  //       if (axios.isCancel(error)) return;

  //       console.error("Fetch Video Activity Error:", error);

  //       toast.error(
  //         error.response?.data?.message ||
  //         "Failed to fetch video activity"
  //       );

  //     } finally {
  //       if (!controller.signal.aborted) {
  //         setActivityLoading(false);
  //       }
  //     }
  //   };

  //   fetchVideoActivity();

  //   return () => controller.abort();

  // }, [employee?.user_id]);

  useEffect(() => {
    console.log("EmployeeDetails mounted");
    console.log("Selected employee:", employee?.user_id);

    if (!employee?.user_id) return;

    const controller = new AbortController();

    const fetchVideoActivity = async () => {
      try {
        setActivityLoading(true);
        setVideoActivity([]);

        const token = sessionStorage.getItem("token");

        const url = `${import.meta.env.VITE_API_BASE_URL}/api/company/employees/${employee.user_id}/video-activity`;

        console.log("Video Activity API URL:", url);

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        console.log("Video Activity Response:", response.data);

        if (response.data?.success) {
          setVideoActivity(response.data.data || []);
        }

      } catch (error) {
        if (axios.isCancel(error)) return;

        console.error("Video Activity API Error:", error);
        console.error("Response:", error.response?.data);

        toast.error(
          error.response?.data?.message ||
          "Failed to fetch video activity"
        );

      } finally {
        if (!controller.signal.aborted) {
          setActivityLoading(false);
        }
      }
    };

    fetchVideoActivity();

    return () => controller.abort();

  }, [employee?.user_id]);

  useEffect(() => {
    if (!employee?.user_id) return;

    const controller = new AbortController();

    const fetchTrainingProgress = async () => {
      console.log("fetch progress");
      try {
        setProgressLoading(true);
        setTrainingProgress([]);

        const token = sessionStorage.getItem("token");

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/company/employees/${employee.user_id}/training-progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.data?.success) {
          setTrainingProgress(response.data.data || []);
        }

        console.log("progress: ", response.data.data)

      } catch (error) {
        if (axios.isCancel(error)) return;

        console.error("Fetch Course Progress Error:", error);
      } finally {
        if (!controller.signal.aborted) {
          setProgressLoading(false);
        }
      }
    };

    fetchTrainingProgress();

    return () => controller.abort();

  }, [employee?.user_id]);

  if (!employee) return null;

  const isActive =
    employee.is_active === 1 ||
    employee.is_active === "1";

  const fullName =
    employee.user_full_name || employee.name || "Employee";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // Convert comma-separated training names into an array
  // const trainings = employee.training_titles
  //   ? employee.training_titles
  //     .split(",")
  //     .map((title) => title.trim())
  //     .filter(Boolean)
  //   : [];

  // const trainingCount =
  //   employee.training_count !== undefined &&
  //     employee.training_count !== null
  //     ? Number(employee.training_count)
  //     : trainings.length;

  // const trainings = trainingProgress;

  // const trainingCount = trainings.length;

  // Enrolled trainings received from /api/company/employees
  const trainings = Array.isArray(employee.trainings)
    ? employee.trainings
    : typeof employee.trainings === "string"
      ? JSON.parse(employee.trainings || "[]")
      : [];

  const trainingCount = trainings.length;

  const getTrainingProgress = (training) => {
    return trainingProgress.find(
      (item) => item.training_title === training
    );
  };



  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-x-hidden pb-20">

      {/* Header */}
      <div className="p-6 relative">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

          {/* Employee Profile */}
          <div className="flex gap-4 sm:gap-5 items-center min-w-0 flex-1">

            {employee.user_profile_photo ? (
              <img
                src={
                  /^https?:\/\//i.test(employee.user_profile_photo)
                    ? employee.user_profile_photo
                    : `${import.meta.env.VITE_API_BASE_URL}${employee.user_profile_photo}`
                }
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover border shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-red-600">
                  {initials}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">

              <h1 className="text-xl sm:text-3xl font-bold text-gray-800 pr-8 sm:pr-0">
                {fullName}
              </h1>

              <div className="flex items-center flex-wrap justify-between gap-2 sm:gap-3 mt-3">

                <div className="flex items-center flex-wrap gap-2 sm:gap-3">

                  <span className="px-2.5 py-1 sm:px-3 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium whitespace-nowrap">
                    Employee
                  </span>

                  <span
                    className={`px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-1.5 ${isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive
                        ? "bg-green-600"
                        : "bg-red-600"
                        }`}
                    />
                    {isActive ? "Active" : "Inactive"}
                  </span>

                </div>

                {/* Mobile Close */}
                <div className="absolute top-3 right-3 z-10 sm:hidden">
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
                    title="Close"
                  >
                    <FiX aria-hidden="true" />
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-2 shrink-0">

            {/*
                        <button
                            onClick={() => handleEdit(employee)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2"
                        >
                            <FiEdit2 size={16} />
                            Edit
                        </button>
                        */}

            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
              title="Close"
            >
              <FiX aria-hidden="true" />
            </button>

          </div>

        </div>

        {/* Created / Updated Information */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100 pt-4">

          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <FiUser className="text-gray-500" size={16} />
            <span>
              Created by{" "}
              <span className="font-semibold text-gray-800">
                {employee.created_by_name || "Unknown"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <FiClock className="text-gray-500" size={16} />
            <span>
              Updated{" "}
              <span className="font-semibold text-gray-800">
                {formatDate(employee.updated_at)}
              </span>
            </span>
          </div>

        </div>

      </div>

      {/* Details */}
      <div className="px-6 pb-6 space-y-4">

        {/* Enrolled Courses */}
        <div className="bg-slate-50 p-4 rounded-lg">

          <div className="flex items-center justify-between mb-3">

            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FiBookOpen />
              ENROLLED COURSES & VIDEO ACTIVITY
            </h3>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

              {trainingCount > 0 && (
                <span className="text-xs sm:text-sm font-medium text-gray-400">
                  {trainingCount}{" "}
                  {trainingCount === 1 ? "Course" : "Courses"}
                </span>
              )}

              {trainings.length > 3 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllTrainings((prev) => !prev)
                  }
                  className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 transition cursor-pointer"
                >
                  {showAllTrainings
                    ? "View Less"
                    : `View All (${trainings.length - 3})`}
                </button>
              )}

            </div>
          </div>


         
{trainings.length > 0 ? (

  <div className="space-y-3">

    {(showAllTrainings
      ? trainings
      : trainings.slice(0, 3)
    ).map((training, index) => {

      const courseActivity = videoActivity.find(
        (item) =>
          Number(item.training_id) === Number(training.training_id)
      );

      const isExpanded =
        Number(expandedTrainingId) === Number(training.training_id);

      return (
        <div
          key={training.training_id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          {/* Course Header - Always Visible */}
          <button
            type="button"
            onClick={() =>
              setExpandedTrainingId(
                isExpanded ? null : training.training_id
              )
            }
            className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-slate-50 transition"
          >
            <div className="flex items-center gap-3 min-w-0">

              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-slate-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  {training.training_title}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  View course video activity
                </p>
              </div>

            </div>

            <FiChevronDown
              size={20}
              className={`text-gray-500 shrink-0 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Expanded Course Content */}
          {isExpanded && (
            <div className="border-t border-gray-100">

              {/* Video Activity */}
              <div className="border-t border-gray-100 bg-slate-50 p-3">

                {activityLoading ? (

                  <div className="text-sm text-gray-500 py-3 text-center">
                    Loading video activity...
                  </div>

                ) : courseActivity ? (

                  courseActivity.modules?.length > 0 ? (

                    <div className="space-y-3">

                      {courseActivity.modules.map((module) => (

                        <div
                          key={module.module_id}
                          className="bg-white border border-gray-200 rounded-lg p-3"
                        >

                          {/* Module Name */}
                          <div className="flex items-center gap-2">
                            <FiBookOpen
                              size={15}
                              className="text-slate-500 shrink-0"
                            />

                            <h5 className="text-sm font-semibold text-gray-700">
                              {module.module_name}
                            </h5>
                          </div>

                          {/* Lessons */}
                          {module.lessons?.length > 0 ? (

                            <div className="space-y-2 mt-3">

                              {module.lessons.map((lesson) => (

                                <div
                                  key={lesson.lesson_id}
                                  className="border border-gray-100 rounded-lg p-3"
                                >

                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                                    <div className="flex items-start gap-2 min-w-0">

                                      <FiVideo
                                        size={15}
                                        className="text-gray-400 mt-0.5 shrink-0"
                                      />

                                      <div className="min-w-0">

                                        <p className="text-sm font-medium text-gray-800 break-words">
                                          {lesson.lesson_title}
                                        </p>

                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                          <FiClock size={12} />
                                          {formatDuration(lesson.video_duration)}
                                        </p>

                                      </div>

                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">

                                      {lesson.is_completed ? (

                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                          <FiCheckCircle size={13} />
                                          Completed
                                        </span>

                                      ) : (

                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                          <FiAlertCircle size={13} />
                                          Not Completed
                                        </span>

                                      )}

                                      {Number(lesson.skip_count) > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                          <FiAlertCircle size={13} />
                                          {lesson.skip_count}{" "}
                                          {Number(lesson.skip_count) === 1
                                            ? "Skip"
                                            : "Skips"}
                                        </span>
                                      )}

                                    </div>

                                  </div>

                                </div>

                              ))}

                            </div>

                          ) : (

                            <p className="text-xs text-gray-500 py-2">
                              No video lessons available in this module.
                            </p>

                          )}

                        </div>

                      ))}

                    </div>

                  ) : (

                    <p className="text-sm text-gray-500 py-2">
                      No modules available.
                    </p>

                  )

                ) : (

                  <p className="text-sm text-gray-500 py-2">
                    No video activity available.
                  </p>

                )}

              </div>

            </div>
          )}

        </div>
      );

    })}

  </div>

) : (

  <div className="bg-white border border-dashed border-gray-300 rounded-lg px-4 py-6 text-center">
    <p className="text-sm text-gray-500">
      No enrolled trainings
    </p>
  </div>

)}






        </div>

        {/* Employee Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Username */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              USERNAME
            </h3>
            <p className="text-gray-800 break-all">
              {employee.username || "-"}
            </p>
          </div>

          {/* Email */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              EMAIL
            </h3>
            <p className="text-gray-800 break-all">
              {employee.user_email || "-"}
            </p>
          </div>

          {/* Mobile */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              MOBILE
            </h3>
            <p className="text-gray-800">
              {employee.user_mobile_no || "-"}
            </p>
          </div>

          {/* Qualification */}
          {/* <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              QUALIFICATION
            </h3>
            <p className="text-gray-800">
              {employee.user_qualification || "-"}
            </p>
          </div> */}

          {/* Postal Address */}
          {/* <div className="bg-slate-50 p-4 rounded-lg md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
              <FiMapPin />
              POSTAL ADDRESS
            </h3>
            <p className="text-gray-800 whitespace-pre-wrap break-words">
              {employee.user_postal_address || "-"}
            </p>
          </div> */}

        </div>

        {/* Created On */}
        <div className="bg-slate-50 p-4 rounded-lg">

          <h3 className="text-sm font-medium text-gray-500 mb-2">
            CREATED ON
          </h3>

          <p className="text-gray-800">
            {formatDate(employee.created_at)}
          </p>

        </div>

      </div>

    </div>
  );
};

export default EmployeeDetails;
