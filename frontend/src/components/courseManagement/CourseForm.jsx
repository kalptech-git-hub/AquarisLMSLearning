import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiAlertTriangle, FiArrowLeft, FiPlus, FiTrash2, FiSave, FiBook, FiUsers, FiImage } from "react-icons/fi";
import Select from "react-select";
import { selectStyles } from "../../utils/selectStyles.js";
import { Save, X } from "lucide-react";

const CourseForm = ({ editingCourseId, fetchCourses, setShowForm, onSaveSuccess }) => {
    const [fetchingData, setFetchingData] = useState(false);

    const [courseData, setCourseData] = useState({
        code: "",
        name: "",
        level: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [hasTrainings, setHasTrainings] = useState(false);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;

    //     setCourseData(prev => ({
    //         ...prev,
    //         [name]: value
    //     }));

    //     if (errors[`course_${name}`]) {
    //         setErrors(prev => ({
    //             ...prev,
    //             [`course_${name}`]: ""
    //         }));
    //     }
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedValue = value;

        // if (name === "code") {
        //     updatedValue = value.replace(/^\s+/, "");
        // }

        setCourseData(prev => ({
            ...prev,
            [name]: updatedValue,
        }));

        if (errors[`course_${name}`]) {
            setErrors(prev => ({
                ...prev,
                [`course_${name}`]: "",
            }));
        }
    };

    useEffect(() => {
        if (!editingCourseId) return;

        loadCourse();
    }, [editingCourseId]);

    const loadCourse = async () => {
        try {
            setFetchingData(true);

            const token = sessionStorage.getItem("token");

            const res = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/courses/${editingCourseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const course = res.data.course;

            setCourseData({
                code: course.course_code,
                name: course.course_name,
                level: course.course_level,
            });

            setHasTrainings(!!course.has_trainings);

        } catch (err) {
            toast.error("Failed to load course category.");
        } finally {
            setFetchingData(false);
        }
    };

    const validate = () => {
        const tempErrors = {};

        // Course Validation
        const courseCodeRegex = /^[a-zA-Z0-9_\s-]+$/;
        const hasAlphanumeric = /[a-zA-Z0-9]/;
        if (!courseData.code.trim()) {
            tempErrors.course_code = "Course category code is required";
        } else if (courseData.code.length > 10) {
            tempErrors.course_code = "Course category code must not exceed 10 characters";
        } else if (!courseCodeRegex.test(courseData.code)) {
            tempErrors.course_code = "Course category code can only contain letters, numbers, spaces, dashes (-), and underscores (_)";
        } else if (!hasAlphanumeric.test(courseData.code)) {
            tempErrors.course_code = "Course category code must contain at least one alphanumeric character (cannot consist only of special characters)";
        }

        if (!courseData.name.trim()) {
            tempErrors.course_name = "Course category name is required";
        } else if (courseData.name.length < 3 || courseData.name.length > 100) {
            tempErrors.course_name = "Course category name must be between 3 and 100 characters";
        }

        if (!courseData.level) {
            tempErrors.course_level = "Please select course category level";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (hasTrainings) {
            toast.error("This course category cannot be edited because courses already exist under it.");
            return;
        }

        if (!validate()) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        setLoading(true);

        try {
            const token = sessionStorage.getItem("token");

            let response;

            const payload = {
                course_code: courseData.code.trim(),
                course_name: courseData.name.trim(),
                course_level: courseData.level,
            };

            if (editingCourseId) {

                response = await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/api/courses/${editingCourseId}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log(response.data);

            } else {

                response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/courses/createCourse`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            }

            // toast.success(response.data.message);

            // fetchCourses();
            // setShowForm(false);

            if (response.data.success) {
                toast.success(response.data.message || (editingCourseId ? "Course category updated successfully!" : "Course category created successfully!"));

                if (onSaveSuccess) {
                    await onSaveSuccess();
                } else {
                    fetchCourses();
                    setShowForm(false);
                }
            }

        } catch (error) {
            console.error("API error saving course category:", error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to save course category.";
            toast.error(errMsg);

            // Map backend error to specific field if possible
            if (errMsg.toLowerCase().includes("Course category code already exists")) {
                setErrors(prev => ({ ...prev, course_code: "This course category code already exists" }));
            }

            if (errMsg.toLowerCase().includes("Course category name already exists")) {
                setErrors(prev => ({ ...prev, course_name: "This course category name already exists" }));
            }

            // toast.error(
            //     error.response?.data?.message ||
            //     "Failed to save course."
            // );

        } finally {
            setLoading(false);

        }
    };

    const levelOptions = [
        { value: "N5", label: "N5 (Beginner)" },
        { value: "N4", label: "N4 (Elementary)" },
        { value: "N3", label: "N3 (Intermediate)" },
        { value: "N2", label: "N2 (Pre-Advanced)" },
        { value: "N1", label: "N1 (Advanced)" },
    ];

    if (fetchingData) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading course category data...</span>
            </div>
        );
    }

    return (
        // <div className="bg-white rounded-lg shadow-md border border-gray-100 w-full overflow-hidden animate-fade-in">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 w-full overflow-visible animate-fade-in">
            {/* <div className="bg-white rounded-lg shadow-md border border-gray-100 w-full animate-fade-in"> */}

            {/* Header */}
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600 cursor-pointer"
                        title="Back to Course Categories"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingCourseId ? "Edit Course Category" : "Add New Course Category"}
                        </h2>
                        <p className="text-xs text-gray-500">Configure course category code, course category name, course category level</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {hasTrainings && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                        {/* was: <span className="text-amber-600 shrink-0 mt-0.5">⚠</span> */}
                        <FiAlertTriangle className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="text-xs text-amber-800 leading-relaxed font-medium">
                            <strong>Locked:</strong> This course category already has one or more courses created under it, so it can no longer be edited.
                        </div>
                    </div>
                )}

                <div>

                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> */}
                    <div className="space-y-4">
                        {/* Course Code */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={courseData.code}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setCourseData(prev => ({
                                        ...prev,
                                        code: e.target.value
                                            .trim()
                                            .replace(/\s+/g, " ")
                                    }))
                                }                                                    
                                placeholder="e.g. JLPT-N5"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.course_code
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.course_code && (
                                <p className="text-xs text-red-500 mt-1">{errors.course_code}</p>
                            )}
                        </div> */}

                        {/* Course Code */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Course Category Code <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${courseData.code.length === 10
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {courseData.code.length}/10 characters
                                </span>
                            </div>

                            <input
                                type="text"
                                name="code"
                                maxLength={10}
                                value={courseData.code}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setCourseData(prev => ({
                                        ...prev,
                                        code: e.target.value
                                            .trim()
                                            .replace(/\s+/g, " ")
                                    }))
                                }
                                placeholder="e.g. JLPT-N5"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.course_code
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    } ${hasTrainings ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`}
                                disabled={loading || hasTrainings}
                            />

                            {errors.course_code && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.course_code}
                                </p>
                            )}
                        </div>

                        {/* Course Name */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={courseData.name}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setCourseData(prev => ({
                                        ...prev,
                                        name: e.target.value
                                            .trim()
                                            .replace(/\s+/g, " ")
                                    }))
                                }
                                placeholder="e.g. Japanese N5 Elementary Course"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.course_name
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.course_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.course_name}</p>
                            )}
                        </div> */}

                        {/* Course Name */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Course Category Name <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${courseData.name.length === 100
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {courseData.name.length}/100 characters
                                </span>
                            </div>

                            <input
                                type="text"
                                name="name"
                                maxLength={100}
                                value={courseData.name}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setCourseData(prev => ({
                                        ...prev,
                                        name: e.target.value
                                            .trim()
                                            .replace(/\s+/g, " ")
                                    }))
                                }
                             placeholder="e.g. Japanese N5 Elementary Course"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.course_name
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    } ${hasTrainings ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`}
                                disabled={loading || hasTrainings}
                            />

                            {errors.course_name && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.course_name}
                                </p>
                            )}
                        </div>

                        {/* Course Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course Category Level <span className="text-red-500">*</span>
                            </label>

                            <Select
                                menuPlacement="auto"
                                options={levelOptions}
                                value={
                                    levelOptions.find(
                                        (option) => option.value === courseData.level
                                    ) || null
                                }
                                // onChange={(selected) =>
                                //     setCourseData((prev) => ({
                                //         ...prev,
                                //         level: selected?.value || "",
                                //     }))
                                // }

                                onChange={(selected) => {
                                    setCourseData(prev => ({
                                        ...prev,
                                        level: selected?.value || "",
                                    }));

                                    setErrors(prev => ({
                                        ...prev,
                                        course_level: "",
                                    }));
                                }}
                                placeholder="Select Level"
                                styles={{
                                    ...selectStyles,
                                    control: (base, state) => ({
                                        ...(selectStyles.control ? selectStyles.control(base, state) : base),
                                        borderColor: errors.course_level
                                            ? "#ef4444"   // red-500, keep validation error visible
                                            : state.isFocused
                                                ? "#64748b"   // slate-500
                                                : "#cbd5e1",  // slate-300
                                        boxShadow: state.isFocused ? "0 0 0 1px #64748b" : "none",
                                        "&:hover": {
                                            borderColor: "#64748b",
                                        },
                                    }),
                                }}
                                classNamePrefix="react-select"
                                isDisabled={loading || hasTrainings}
                            />



                            {errors.course_level && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.course_level}
                                </p>
                            )}
                        </div>

                        {/* <div className="flex justify-end gap-4"> */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="w-full flex items-center justify-center gap-2 sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 font-medium cursor-pointer min-h-[44px]"
                            >
                                <X size={18} />
                                Cancel
                            </button>

                            {!hasTrainings && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded flex items-center justify-center gap-2 font-medium transition shadow disabled:opacity-50 cursor-pointer min-h-[44px]"
                            >
                                <Save size={18} />
                                {/* {loading
                                    ? "Saving..."
                                    : editingCourseId
                                        ? "Update Course"
                                        : "Create Course"
                                } */}

                                {loading
                                    ? "Submitting..."
                                    : editingCourseId
                                        ? "Submit"
                                        : "Submit"
                                }
                            </button>
                            )}

                        </div>

                    </div>
                </div>
            </form>

        </div>
    )
};


export default CourseForm;