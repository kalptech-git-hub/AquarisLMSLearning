/* Updated version */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiAlertTriangle, FiArrowLeft, FiPlus, FiTrash2, FiSave, FiBook, FiUsers, FiImage, FiX, FiInfo } from "react-icons/fi";
import RichTextEditor from "./RichTextEditor.jsx";
import Select from "react-select";
import { selectStyles } from "../../utils/selectStyles.js";
import { X } from "lucide-react";

// Converts anything the API returns into "YYYY-MM-DD" in the user's LOCAL timezone
const toDateInputValue = (value) => {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; // already a plain date
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};


const todayLocal = () => toDateInputValue(new Date());

const TrainingForm = ({ editingTrainingId, fetchCourses, setShowForm, onSaveSuccess }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [courseData, setCourseData] = useState({
        code: "",
        name: "",
        level: ""
    });

    const [trainingData, setTrainingData] = useState({
        title: "",
        description: "",
        fee: "",
        training_duration_hours: "",
        training_mode: "ONLINE",
        examName: "",
        examFrequency: "",
        training_start_date: "",
        training_end_date: ""
    });

    const [trainingStatus, setTrainingStatus] = useState("ACTIVE");
    const [publishStatus, setPublishStatus] = useState("DRAFT");
    const [isLocked, setIsLocked] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const isPublishLocked = publishStatus === "PUBLISHED" && !isLocked;

    const [books, setBooks] = useState([{ name: "", chapters: "" }]);
    const [selectedInstructors, setSelectedInstructors] = useState([]);
    const [instructorsList, setInstructorsList] = useState([]);

    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [errors, setErrors] = useState({});
    const [enrolledCount, setEnrolledCount] = useState(0);
    const canEditPastStartDate = publishStatus !== "PUBLISHED" && enrolledCount === 0;
    const fileInputRef = useRef(null);

    // console.log("editingTrainingId:", editingTrainingId);

    // Fetch active instructors list from the backend
    const fetchInstructors = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/instructors/active`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response?.data?.success) {
                setInstructorsList(response.data.instructors || []);
            } else {
                setInstructorsList([]);
            }
        } catch (err) {
            console.error("Failed to fetch active instructors:", err);
            setInstructorsList([]);
        }
    };

    /* Fetch courses to create training under particular course */
    const fetchCourseDropdown = async () => {
        try {
            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/courses/dropdown`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setCourses(response.data.courses);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load courses.");
        }
    };

    // Load course data in edit mode
    const loadCourseData = async () => {
        // if (!editingCourseId) return;
        if (!editingTrainingId) return;

        setFetchingData(true);
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(
                // `${import.meta.env.VITE_API_BASE_URL}/api/courses/${editingCourseId}`,
                `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${editingTrainingId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // console.log(response);

            // if (response.data.success && response.data.course) {
            if (response.data.success && response.data.training) {
                // const c = response.data.course;
                const c = response.data.training;
                // setCourseData({
                //     code: c.course_code || "",
                //     name: c.course_name || "",
                //     level: c.course_level || ""
                // });

                setSelectedCourse({
                    value: c.course_id,
                    label: c.course_name
                });

                try {
                    const studentsRes = await axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/training/${editingTrainingId}/students`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setEnrolledCount((studentsRes.data.data || []).length);
                } catch (err) {
                    console.error("Failed to fetch enrolled student count:", err);
                    setEnrolledCount(0);
                }

                setTrainingData({
                    title: c.training_title || "",
                    description: c.training_description || "",
                    fee: c.training_fee || "",
                    training_duration_hours: c.training_duration_hours || "",
                    training_mode: c.training_mode || "ONLINE",
                    examName: c.training_exam_name || "",
                    examFrequency: c.training_exam_frequency || "",
                    training_start_date: toDateInputValue(c.training_start_date),
                    training_end_date: toDateInputValue(c.training_end_date)
                });

                const statusLabel = getTrainingStatusLabel(c);
                setTrainingStatus(statusLabel);
                setIsLocked(c.training_status === "COMPLETED");
                setPublishStatus(c.publish_status || "DRAFT");

                if (c.training_start_date) {
                    setHasStarted(toDateInputValue(c.training_start_date) <= todayLocal());
                }

                if (c.books && c.books.length > 0) {
                    setBooks(c.books.map(b => ({
                        name: b.tb_book_name || "",
                        chapters: b.tb_book_chapters || ""
                    })));
                }

                if (c.instructors && c.instructors.length > 0) {
                    setSelectedInstructors(c.instructors.map(i => i.instructor_id));
                }

                if (c.training_thumbnail) {
                    setThumbnailPreview(`${import.meta.env.VITE_API_BASE_URL}${c.training_thumbnail}`);
                }
            }
        } catch (err) {
            // console.error("Error loading course details:", err);
            console.error("Error loading course details:", err);
            // toast.error("Failed to load course details for editing.");
            toast.error("Failed to load course details for editing.");
            setShowForm(false);
        } finally {
            setFetchingData(false);
        }
    };

    useEffect(() => {
        fetchCourseDropdown();
        fetchInstructors();
        loadCourseData();
    },
        // [editingCourseId]);
        [editingTrainingId]);

    const getTrainingStatusLabel = (training) => {
        if (training.training_status === "COMPLETED") {
            return "COMPLETED";
        }
        return training.is_active ? "ACTIVE" : "INACTIVE";
    };

    // Helper function to normalize multi-spaces and trim leading/trailing whitespace
    const normalizeText = (value) => {
        return value?.replace(/\s+/g, " ").trim() || "";
    };

    const handleStatusChange = (e) => {
        if (e.target.value === "COMPLETED" && publishStatus !== "PUBLISHED") {
            toast.error("Only published courses can be marked as completed.");
            return;
        }
        setTrainingStatus(e.target.value);
    };
    // Validation rules
    const validate = () => {
        const tempErrors = {};

        // Course Validation
        if (!selectedCourse) {
            tempErrors.course_id = "Please select a course";
        }

        // Training Validation
        const normalizedTitle = normalizeText(trainingData.title);
        if (!normalizedTitle) {
            tempErrors.training_title = "Course title is required";
        } else if (normalizedTitle.length < 3 || normalizedTitle.length > 255) {
            tempErrors.training_title = "Course title must be between 3 and 255 characters";
        }

        if (!trainingData.description || !trainingData.description.trim()) {
            tempErrors.training_description = "Course description is required";
        } else if (trainingData.description.length < 10) {
            tempErrors.training_description = "Description must be at least 10 characters";
        } else if (trainingData.description.length > 700) {
            tempErrors.training_description = "Description must not exceed 700 characters";
        }

        if (trainingData.fee === "" || trainingData.fee === null) {
            tempErrors.training_fee = "Course fee is required";
        } else if (isNaN(trainingData.fee) || Number(trainingData.fee) < 0) {
            tempErrors.training_fee = "Fee must be a valid positive number";
        }

        if (!trainingData.training_duration_hours) {
            tempErrors.training_duration_hours = "Course duration is required";
        } else if (isNaN(trainingData.training_duration_hours) || Number(trainingData.training_duration_hours) <= 0) {
            tempErrors.training_duration_hours = "Duration must be greater than 0";
        }

        const validModes = ["ONLINE", "OFFLINE", "HYBRID"];
        if (!trainingData.training_mode) {
            tempErrors.training_mode = "Course mode is required";
        } else if (!validModes.includes(trainingData.training_mode)) {
            tempErrors.training_mode = "Invalid Course mode";
        }

        const normalizedExamName = normalizeText(trainingData.examName);
        if (!normalizedExamName) {
            tempErrors.training_examName = "Exam name is required";
        }
        const normalizedExamFrequency = normalizeText(trainingData.examFrequency);
        if (!normalizedExamFrequency) {
            tempErrors.training_examFrequency = "Exam frequency is required";
        }

        if (!trainingData.training_start_date) {
            tempErrors.training_start_date = "Course start date is required";
        }

        if (!trainingData.training_end_date) {
            tempErrors.training_end_date = "Course end date is required";
        }

        if (!editingTrainingId && trainingData.training_start_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(trainingData.training_start_date);
            startDate.setHours(0, 0, 0, 0);

            if (startDate <= today) {
                tempErrors.training_start_date = "Course start date must be after today";
            }
        }

        if (
            trainingData.training_start_date &&
            trainingData.training_end_date &&
            new Date(trainingData.training_end_date) <= new Date(trainingData.training_start_date)
        ) {
            tempErrors.training_end_date = "Course end date must be after start date";
        }

        // Books Validation
        const bookErrors = [];
        books.forEach((book, index) => {
            const errorsObj = {};
            if (!normalizeText(book.name)) {
                errorsObj.name = "Book name is required";
            }
            if (!normalizeText(book.chapters)) {
                errorsObj.chapters = "Chapters description is required";
            }
            if (Object.keys(errorsObj).length > 0) {
                bookErrors[index] = errorsObj;
            }
        });
        if (bookErrors.length > 0) {
            tempErrors.books = bookErrors;
        }

        // Instructors Validation
        if (selectedInstructors.length === 0) {
            tempErrors.instructors = "Please select at least one instructor";
        }

        // Thumbnail Validation (Only required for new courses)
        // if (!editingCourseId && !thumbnail) {
        if (!editingTrainingId && !thumbnail) {
            tempErrors.thumbnail = "Course thumbnail is required";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // const handleCourseChange = (e) => {
    //     const { name, value } = e.target;
    //     setCourseData(prev => ({ ...prev, [name]: value }));
    //     if (errors[`course_${name}`]) {
    //         setErrors(prev => ({ ...prev, [`course_${name}`]: "" }));
    //     }
    // };

    const handleCourseSelect = (selected) => {
        if (isLocked || isPublishLocked) return;
        setSelectedCourse(selected);

        if (errors.course_id) {
            setErrors(prev => ({
                ...prev,
                course_id: ""
            }));
        }
    };

    const handleTrainingChange = (e) => {
        const { name, value } = e.target;
        setTrainingData(prev => ({ ...prev, [name]: value }));

        if (name === "training_start_date") {
            let startErr = "";
            if (!value) {
                startErr = "Course start date is required";
            } else if (!editingTrainingId) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDate = new Date(value);
                startDate.setHours(0, 0, 0, 0);
                if (startDate <= today) {
                    startErr = "Course start date must be after today";
                }
            }

            setErrors(prev => {
                const nextErrors = { ...prev, training_start_date: startErr };
                if (value && trainingData.training_end_date) {
                    if (new Date(trainingData.training_end_date) <= new Date(value)) {
                        nextErrors.training_end_date = "Course end date must be after start date";
                    } else if (prev.training_end_date === "Course end date must be after start date" || prev.training_end_date === "End date must be after start date") {
                        nextErrors.training_end_date = "";
                    }
                }
                return nextErrors;
            });
            return;
        }

        if (name === "training_end_date") {
            let endErr = "";
            if (!value) {
                endErr = "Course end date is required";
            } else if (trainingData.training_start_date && new Date(value) <= new Date(trainingData.training_start_date)) {
                endErr = "Course end date must be after start date";
            }
            setErrors(prev => ({ ...prev, training_end_date: endErr }));
            return;
        }

        const errorKey = name === "training_duration_hours" ? name : `training_${name}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: "" }));
        }
    };

    const handleStartDateBlur = () => {
        if (!trainingData.training_start_date) {
            setErrors(prev => ({ ...prev, training_start_date: "Course start date is required" }));
        } else if (!editingTrainingId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(trainingData.training_start_date);
            startDate.setHours(0, 0, 0, 0);
            if (startDate <= today) {
                setErrors(prev => ({ ...prev, training_start_date: "Course start date must be after today" }));
            }
        }
    };

    const handleEndDateBlur = () => {
        if (!trainingData.training_end_date) {
            setErrors(prev => ({ ...prev, training_end_date: "Course end date is required" }));
        } else if (
            trainingData.training_start_date &&
            new Date(trainingData.training_end_date) <= new Date(trainingData.training_start_date)
        ) {
            setErrors(prev => ({ ...prev, training_end_date: "Course end date must be after start date" }));
        }
    };

    // Books handlers
    const handleBookChange = (index, field, value) => {
        const updatedBooks = [...books];
        updatedBooks[index][field] = value;
        setBooks(updatedBooks);

        if (errors.books && errors.books[index]) {
            const updatedBookErrors = [...errors.books];
            if (updatedBookErrors[index]) {
                updatedBookErrors[index] = {
                    ...updatedBookErrors[index],
                    [field]: ""
                };
                // Check if all fields in the errors object for this book are now empty
                const hasAnyError = Object.values(updatedBookErrors[index]).some(val => val !== "");
                if (!hasAnyError) {
                    updatedBookErrors[index] = null;
                }
            }
            setErrors(prev => ({ ...prev, books: updatedBookErrors }));
        }
    };

    const addBook = () => {
        if (isLocked) return;
        setBooks([...books, { name: "", chapters: "" }]);
    };

    const removeBook = (index) => {
        if (isLocked) return;
        if (books.length === 1) {
            toast.warn("At least one book is required.");
            return;
        }
        const updatedBooks = books.filter((_, idx) => idx !== index);
        setBooks(updatedBooks);
    };

    // Instructors handlers
    const handleInstructorToggle = (instructorId) => {
        if (isLocked) return;
        setSelectedInstructors(prev => {
            if (prev.includes(instructorId)) {
                return prev.filter(id => id !== instructorId);
            } else {
                return [...prev, instructorId];
            }
        });
        if (errors.instructors) {
            setErrors(prev => ({ ...prev, instructors: "" }));
        }
    };

    // Photo handlers
    const handlePhotoChange = (e) => {
        if (isLocked || isPublishLocked) return;
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File size must be under 5MB.");
                return;
            }
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
            if (errors.thumbnail) {
                setErrors(prev => ({ ...prev, thumbnail: "" }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLocked) {
            toast.error("A completed course cannot be modified.");
            return;
        }


        if (!validate()) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        setLoading(true);

        const formDataPayload = new FormData();

        formDataPayload.append("course_id", selectedCourse.value);

        const processedTraining = {
            ...trainingData,
            title: normalizeText(trainingData.title),
            examName: normalizeText(trainingData.examName) || null,
            examFrequency: normalizeText(trainingData.examFrequency) || null,
            training_status: trainingStatus === "COMPLETED" ? "COMPLETED" : "ACTIVE",
            is_active: trainingStatus === "INACTIVE" ? 0 : 1
        };

        formDataPayload.append(
            "training",
            JSON.stringify(processedTraining)
        );

        const processedBooks = books.map(b => ({
            name: normalizeText(b.name),
            chapters: normalizeText(b.chapters)
        }));

        formDataPayload.append("books", JSON.stringify(processedBooks));
        formDataPayload.append("instructors", JSON.stringify(selectedInstructors));

        if (thumbnail) {
            formDataPayload.append("training_thumbnail", thumbnail);
        }

        try {
            const token = sessionStorage.getItem("token");
            let response;

            // if (editingCourseId) {
            if (editingTrainingId) {
                // If editing, try calling PUT /api/courses/:id (flat request or same payload depending on backend support)
                // Note: The backend put endpoint was commented out in route files, but we still make the request to let it work once uncommented.
                // We'll pass both styles of payload if needed, but normally multipart form data is used.
                response = await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${editingTrainingId}`,
                    formDataPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
                // console.log(response.data);


            } else {
                // Create mode
                response = await axios.post(
                    // `${import.meta.env.VITE_API_BASE_URL}/api/courses/`,
                    `${import.meta.env.VITE_API_BASE_URL}/api/trainings/`,
                    formDataPayload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
            }

            if (response.data.success) {
                // toast.success(response.data.message || (editingCourseId ? "Course updated successfully!" : "Course created successfully!"));
                toast.success(response.data.message || (editingTrainingId ? "Course updated successfully!" : "Course created successfully!"));

                if (onSaveSuccess) {
                    await onSaveSuccess();
                } else {
                    fetchCourses();
                    setShowForm(false);
                }
            }
        } catch (error) {
            console.error("API error saving course:", error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to save course.";
            toast.error(errMsg);

            // Map backend error to specific field if possible
            if (errMsg.toLowerCase().includes("course code already exists")) {
                setErrors(prev => ({ ...prev, course_code: "This course code already exists" }));
            }
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
                <span className="ml-3 text-gray-600 font-medium">Loading course data...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 w-full overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600 cursor-pointer"
                        title="Back to Courses"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {/*{editingCourseId ? "Edit Course & Training" : "Add New Category"}*/}
                            {editingTrainingId ? "Edit Course" : "Add New Course"}
                        </h2>
                        <p className="text-xs text-gray-500">Configure course code, course fees, materials and instructors</p>
                    </div>
                </div>
            </div>

            {/* was: className="p-6 space-y-6" */}
            <form noValidate onSubmit={handleSubmit} className="p-6 pb-10 space-y-6">

                {isLocked && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                        {/* was: <span className="text-amber-600 shrink-0 mt-0.5">⚠</span> */}
                        <FiAlertTriangle className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="text-xs text-amber-800 leading-relaxed font-medium">
                            <strong>Locked:</strong> This course has been marked as completed, so it can no longer be edited.
                        </div>
                    </div>
                )}

                {isPublishLocked && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <FiInfo className="text-blue-600 shrink-0 mt-0.5" size={16} />
                        <div className="text-xs text-blue-800 leading-relaxed font-medium">
                            <strong>Published:</strong> This course is live, so only status, end date, textbooks, instructors, and mode can be edited.
                        </div>
                    </div>
                )}

                {/* Section 1: Course Info */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] mb-4">
                        1. Select Course Category
                    </h3>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Category <span className="text-red-500">*</span>
                    </label>

                    <Select
                        options={courses.map(course => ({
                            value: course.course_id,
                            label: `${course.course_code} - ${course.course_name}`,
                            course
                        }))}
                        value={selectedCourse}
                        // onChange={(option) => setSelectedCourse(option)}
                        onChange={handleCourseSelect}
                        placeholder="Select Course Category Code"
                        // styles={selectStyles}
                        styles={{
                            ...selectStyles,
                            control: (base, state) => ({
                                ...(selectStyles.control ? selectStyles.control(base, state) : base),
                                borderColor: errors.course_id
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
                        isDisabled={loading || isLocked || isPublishLocked}
                    />

                    {errors.course_id && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors.course_id}
                        </p>
                    )}
                </div>

                <fieldset
                    disabled={isLocked}
                    className={isLocked ? "opacity-60 pointer-events-none" : ""}
                >

                    {/* Section 2: Training Details */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] mb-4">
                            2. Course Program details
                        </h3>
                        {/* OLD (kept for reference): className="grid grid-cols-1 md:grid-cols-3 gap-4" */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {/* Training Title */}
                            {/* OLD: className="md:col-span-2" */}
                            {/* <div className="sm:col-span-2 xl:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Training Program Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={trainingData.title}
                                    onChange={handleTrainingChange}
                                    onBlur={(e) =>
                                        setTrainingData(prev => ({
                                            ...prev,
                                            title: normalizeText(e.target.value)
                                        }))
                                    }
                                    placeholder="Enter public title for students"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.training_title
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading}
                                />
                                {errors.training_title && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_title}</p>
                                )}
                            </div> */}

                            {/* Training Title */}
                            <div className="sm:col-span-2 xl:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Course Program Title <span className="text-red-500">*</span>
                                    </label>

                                    <span
                                        className={`text-[11px] font-semibold transition-colors ${trainingData.title.length === 255
                                            ? "text-green-600"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {trainingData.title.length}/255 characters
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    name="title"
                                    maxLength={255}
                                    value={trainingData.title}
                                    onChange={handleTrainingChange}
                                    onBlur={(e) =>
                                        setTrainingData(prev => ({
                                            ...prev,
                                            title: normalizeText(e.target.value)
                                        }))
                                    }
                                    placeholder="Enter public title for students"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${isPublishLocked
                                        ? "opacity-60 bg-gray-50 cursor-not-allowed border-gray-200"
                                        : errors.training_title
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading || isPublishLocked}
                                />

                                {errors.training_title && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.training_title}
                                    </p>
                                )}
                            </div>

                            {/* Thumbnail File Input */}
                            {/* OLD: className="row-span-2" */}
                            <div className="xl:row-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Thumbnail Image <span className="text-red-500">*</span>
                                </label>
                                <div
                                    onClick={() => { if (!isPublishLocked) fileInputRef.current.click(); }}
                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition flex flex-col items-center justify-center min-h-[140px] ${isPublishLocked
                                        ? "opacity-60 bg-gray-50 cursor-not-allowed"
                                        : `cursor-pointer hover:border-[#0E182B] ${errors.thumbnail ? "border-red-500 bg-red-50/50" : "border-gray-300"}`
                                        }`}
                                >
                                    {thumbnailPreview ? (
                                        <div className="relative w-full h-28 rounded overflow-hidden group">
                                            <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setThumbnail(null);
                                                    setThumbnailPreview(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition duration-150 cursor-pointer flex items-center justify-center shadow-sm z-10"
                                                title="Remove image"
                                                disabled={loading || isLocked || isPublishLocked}
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <FiImage className="text-gray-400 mb-2" size={32} />
                                            <p className="text-xs text-gray-500 font-medium">Click to upload thumbnail</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WEBP (Max 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    disabled={loading || isPublishLocked}
                                />
                                {errors.thumbnail && (
                                    <p className="text-xs text-red-500 mt-1">{errors.thumbnail}</p>
                                )}
                            </div>

                            {/* Training Description */}
                            {/* OLD: className="md:col-span-2" */}
                            <div className="sm:col-span-2 xl:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Course Description <span className="text-red-500">*</span>
                                    </label>
                                    <span className={`text-[11px] font-semibold transition-colors ${(trainingData.description || "").length >= 700 ? "text-green-600 font-bold" : "text-gray-400"}`}>
                                        {Math.min((trainingData.description || "").length, 700)}/700 characters
                                    </span>
                                </div>

                                <RichTextEditor
                                    value={trainingData.description}
                                    onChange={(val) => {
                                        const safeVal = (val || "").slice(0, 700);
                                        setTrainingData(prev => ({ ...prev, description: safeVal }));
                                        if (errors.training_description) {
                                            setErrors(prev => ({ ...prev, training_description: "" }));
                                        }
                                    }}
                                    placeholder="Describe what students will learn..."
                                    disabled={loading || isLocked || isPublishLocked}
                                    maxLength={700}
                                />
                                {errors.training_description && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_description}</p>
                                )}
                                {(trainingData.description || "").length >= 700 && !errors.training_description && (
                                    <p className="text-xs text-red-500 mt-1">Maximum limit of 700 characters reached.</p>
                                )}
                            </div>

                            {/* Training Fee */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Fee (INR) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="fee"
                                    value={trainingData.fee}
                                    onChange={handleTrainingChange}
                                    placeholder="e.g. 5000"
                                    min={0}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${isPublishLocked
                                        ? "opacity-60 bg-gray-50 cursor-not-allowed border-gray-200"
                                        : errors.training_fee
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading || isPublishLocked}
                                />
                                {errors.training_fee && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_fee}</p>
                                )}
                            </div>

                            {/* Training Duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (Hours) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="training_duration_hours"
                                    value={trainingData.training_duration_hours}
                                    onChange={handleTrainingChange}
                                    placeholder="e.g. 120"
                                    min={1}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${isPublishLocked
                                        ? "opacity-60 bg-gray-50 cursor-not-allowed border-gray-200"
                                        : errors.training_duration_hours
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading || isPublishLocked}
                                />

                                {errors.training_duration_hours && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_duration_hours}</p>
                                )}
                            </div>

                            {/* Training Mode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mode of Course <span className="text-red-500">*</span>
                                </label>
                                {/* OLD: className="flex gap-4 items-center pt-1.5" */}
                                <div className="flex flex-wrap gap-x-4 gap-y-2 items-center pt-1.5">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="training_mode"
                                            value="ONLINE"
                                            checked={trainingData.training_mode === "ONLINE"}
                                            onChange={handleTrainingChange}
                                            className="text-red-600 focus:ring-red-500"
                                            disabled={loading}
                                        />
                                        Online
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="training_mode"
                                            value="OFFLINE"
                                            checked={trainingData.training_mode === "OFFLINE"}
                                            onChange={handleTrainingChange}
                                            className="text-red-600 focus:ring-red-500"
                                            disabled={loading}
                                        />
                                        Offline
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="training_mode"
                                            value="HYBRID"
                                            checked={trainingData.training_mode === "HYBRID"}
                                            onChange={handleTrainingChange}
                                            className="text-red-600 focus:ring-red-500"
                                            disabled={loading}
                                        />
                                        Hybrid
                                    </label>
                                </div>
                                {errors.training_mode && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_mode}</p>
                                )}
                            </div>

                            {/* Training Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>

                                {isLocked ? (
                                    <div className="text-sm bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-slate-600">
                                        <span className="font-semibold text-slate-800">Completed</span>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            This course has ended and cannot be reactivated.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 items-center pt-1.5">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="trainingStatus"
                                                value="ACTIVE"
                                                checked={trainingStatus === "ACTIVE"}
                                                onChange={handleStatusChange}
                                                className="text-red-600 focus:ring-red-500"
                                                disabled={loading}
                                            />
                                            Active
                                        </label>
                                        {/* <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="trainingStatus"
                                                value="INACTIVE"
                                                checked={trainingStatus === "INACTIVE"}
                                                onChange={handleStatusChange}
                                                className="text-red-600 focus:ring-red-500"
                                                disabled={loading || publishStatus === "PUBLISHED"}
                                            />
                                            Inactive
                                        </label> */}

                                        <div className="relative group">
                                            <label className={`flex items-center gap-2 text-sm text-gray-700 ${publishStatus === "PUBLISHED"
                                                    ? "cursor-not-allowed"
                                                    : "cursor-pointer"
                                                }`}>
                                                <input
                                                    type="radio"
                                                    name="trainingStatus"
                                                    value="INACTIVE"
                                                    checked={trainingStatus === "INACTIVE"}
                                                    onChange={handleStatusChange}
                                                    className="text-red-600 focus:ring-red-500"
                                                    disabled={loading || publishStatus === "PUBLISHED"}
                                                />
                                                Inactive
                                            </label>

                                            {publishStatus === "PUBLISHED" && (
                                                <div className="pointer-events-none absolute left-0 top-full mt-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                                                    This course is already published
                                                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45" />
                                                </div>
                                            )}
                                        </div>
                                    

                                        <div className="relative group inline-block">
                                            <label
                                                className={`flex items-center gap-2 text-sm ${publishStatus !== "PUBLISHED" || !hasStarted
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-gray-700 cursor-pointer"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="trainingStatus"
                                                    value="COMPLETED"
                                                    checked={trainingStatus === "COMPLETED"}
                                                    onChange={handleStatusChange}
                                                    className="text-red-600 focus:ring-red-500"
                                                    disabled={
                                                        loading ||
                                                        publishStatus !== "PUBLISHED" ||
                                                        !hasStarted
                                                    }
                                                />
                                                Completed
                                            </label>

                                            {(publishStatus !== "PUBLISHED" || !hasStarted) && (
                                                <div className="pointer-events-none absolute left-0 top-full mt-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg">
                                                    {publishStatus !== "PUBLISHED"
                                                        ? "This course isn't published yet"
                                                        : "This course hasn't started yet"}
                                                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Training Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="training_start_date"
                                    value={trainingData.training_start_date}
                                    onChange={handleTrainingChange}
                                    onBlur={handleStartDateBlur}
                                    onInvalid={(e) => e.preventDefault()}
                                    min={editingTrainingId ? undefined : toDateInputValue(new Date(Date.now() + 86400000))}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${(isPublishLocked || (hasStarted && !canEditPastStartDate))
                                        ? "opacity-60 bg-gray-50 cursor-not-allowed border-gray-200"
                                        : errors.training_start_date
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading || isPublishLocked || (hasStarted && !canEditPastStartDate)}
                                />
                                {errors.training_start_date && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_start_date}</p>
                                )}
                                <p className="mt-1 text-[11px] text-gray-400">
                                    {hasStarted && !canEditPastStartDate
                                        ? "This course has already started, so its start date is locked."
                                        : hasStarted && canEditPastStartDate
                                            ? "This date has already passed, but you can still update it since the course isn't published and has no enrolled students yet."
                                            : "Enrollment closes automatically on this date."}
                                </p>
                            </div>

                            {/* Training End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Course End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="training_end_date"
                                    value={trainingData.training_end_date}
                                    onChange={handleTrainingChange}
                                    onBlur={handleEndDateBlur}
                                    onInvalid={(e) => e.preventDefault()}
                                    min={
                                        trainingData.training_start_date
                                            ? toDateInputValue(
                                                new Date(
                                                    new Date(trainingData.training_start_date).getTime() + 86400000
                                                )
                                            )
                                            : toDateInputValue(new Date(Date.now() + 86400000))
                                    }
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.training_end_date
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading}
                                />
                                {errors.training_end_date && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_end_date}</p>
                                )}
                            </div>




                            {/* Exam Name */}
                            {/* OLD: className="md:col-span-2" */}
                            {/* <div className="sm:col-span-2 xl:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exam Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="examName"
                                    value={trainingData.examName || ""}
                                    onChange={handleTrainingChange}
                                    onBlur={(e) =>
                                        setTrainingData(prev => ({
                                            ...prev,
                                            examName: normalizeText(e.target.value)
                                        }))
                                    }
                                    placeholder="e.g. JLPT N5 Exam"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.training_examName
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading}
                                />
                                {errors.training_examName && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_examName}</p>
                                )}
                            </div> */}

                            <div className="sm:col-span-2 xl:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Exam Name <span className="text-red-500">*</span>
                                    </label>

                                    <span
                                        className={`text-[11px] font-semibold transition-colors ${trainingData.examName.length === 255
                                            ? "text-green-600"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {trainingData.examName.length}/255 characters
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    name="examName"
                                    maxLength={255}
                                    value={trainingData.examName || ""}
                                    onChange={handleTrainingChange}
                                    onBlur={(e) =>
                                        setTrainingData(prev => ({
                                            ...prev,
                                            examName: normalizeText(e.target.value)
                                        }))
                                    }
                                    placeholder="e.g. JLPT N5 Exam"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${isPublishLocked
                                        ? "opacity-60 bg-gray-50 cursor-not-allowed border-gray-200"
                                        : errors.training_examName
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading || isPublishLocked}
                                />

                                {errors.training_examName && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.training_examName}
                                    </p>
                                )}
                            </div>

                            {/* Exam Frequency */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exam Frequency <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="examFrequency"
                                    value={trainingData.examFrequency || ""}
                                    onChange={handleTrainingChange}
                                    onBlur={(e) =>
                                        setTrainingData(prev => ({
                                            ...prev,
                                            examFrequency: normalizeText(e.target.value)
                                        }))
                                    }
                                    placeholder="e.g. Twice a year (July & December)"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.training_examFrequency
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading}
                                />
                                {errors.training_examFrequency && (
                                    <p className="text-xs text-red-500 mt-1">{errors.training_examFrequency}</p>
                                )}
                            </div> */}

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Exam Frequency <span className="text-red-500">*</span>
                                    </label>

                                    <span
                                        className={`text-[11px] font-semibold transition-colors ${trainingData.examFrequency.length === 100
                                            ? "text-green-600"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        {trainingData.examFrequency.length}/100 characters
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    name="examFrequency"
                                    maxLength={100}
                                    value={trainingData.examFrequency || ""}
                                    onChange={handleTrainingChange}
                                    onBlur={(e) =>
                                        setTrainingData(prev => ({
                                            ...prev,
                                            examFrequency: normalizeText(e.target.value)
                                        }))
                                    }
                                    placeholder="e.g. Twice a year (July & December)"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${isPublishLocked
                                        ? "opacity-60 bg-gray-50 cursor-not-allowed border-gray-200"
                                        : errors.training_examFrequency
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading || isPublishLocked}
                                />

                                {errors.training_examFrequency && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.training_examFrequency}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Dynamic Books */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] flex items-center gap-2">
                                <FiBook /> 3. Textbooks & Course Materials <span className="text-red-500">*</span>
                            </h3>
                            <button
                                type="button"
                                onClick={addBook}
                                className="text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-50 transition flex items-center gap-1 font-semibold cursor-pointer"
                                disabled={loading}
                            >
                                <FiPlus size={14} /> Add Book
                            </button>
                        </div>

                        <div className="space-y-3">
                            {books.map((book, index) => (
                                /* was: className="flex gap-3 items-start bg-slate-50 p-3 rounded-md border border-slate-100" */
                                <div key={index} className="flex flex-col sm:flex-row gap-3 sm:items-start bg-slate-50 p-3 rounded-md border border-slate-100">
                                    {/* Book Name */}
                                    {/* was: className="flex-1" */}
                                    {/* <div className="w-full sm:flex-1">
                                        <input
                                            type="text"
                                            placeholder="Book Title * (required)"
                                            value={book.name}
                                            onChange={(e) => handleBookChange(index, "name", e.target.value)}
                                            onBlur={(e) => handleBookChange(index, "name", normalizeText(e.target.value))}
                                            className={`w-full px-3 py-1.5 border rounded-md focus:outline-none bg-white text-sm transition ${errors.books && errors.books[index]?.name
                                                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                                }`}
                                            disabled={loading}
                                        />
                                        {errors.books && errors.books[index]?.name && (
                                            <p className="text-[11px] text-red-500 mt-1">{errors.books[index].name}</p>
                                        )}
                                    </div> */}

                                    {/* Book Name */}
                                    <div className="w-full sm:flex-1">
                                        <div className="flex justify-end mb-0.5">
                                            {/* <span className="text-[10px] text-gray-400">
                                                {(book.name || "").length}/100
                                            </span> */}

                                            <span
                                                className={`text-[11px] font-semibold transition-colors ${book.name.length === 100
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {(book.name || "").length}/100 characters
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            placeholder="Book Title * (required)"
                                            value={book.name}
                                            onChange={(e) => handleBookChange(index, "name", e.target.value)}
                                            onBlur={(e) => handleBookChange(index, "name", normalizeText(e.target.value))}
                                            className={`w-full px-3 py-1.5 border rounded-md focus:outline-none bg-white text-sm transition ${errors.books && errors.books[index]?.name
                                                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                                }`}
                                            disabled={loading}
                                        />
                                        {errors.books && errors.books[index]?.name && (
                                            <p className="text-[11px] text-red-500 mt-1">{errors.books[index].name}</p>
                                        )}
                                    </div>



                                    {/* Chapters */}
                                    {/* was: className="w-1/3" */}
                                    {/* <div className="w-full sm:w-1/3">
                                        <input
                                            type="text"
                                            placeholder="Chapters * (e.g. 1-12)"
                                            value={book.chapters}
                                            onChange={(e) => handleBookChange(index, "chapters", e.target.value)}
                                            onBlur={(e) => handleBookChange(index, "chapters", normalizeText(e.target.value))}
                                            className={`w-full px-3 py-1.5 border rounded-md focus:outline-none bg-white text-sm transition ${errors.books && errors.books[index]?.chapters
                                                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                                }`}
                                            disabled={loading}
                                        />
                                        {errors.books && errors.books[index]?.chapters && (
                                            <p className="text-[11px] text-red-500 mt-1">{errors.books[index].chapters}</p>
                                        )}
                                    </div> */}

                                    {/* Chapters */}
                                    <div className="w-full sm:w-1/3">
                                        <div className="flex justify-end mb-0.5">
                                            {/* <span className="text-[10px] text-gray-400">
                                                {(book.chapters || "").length}/100
                                            </span> */}

                                            <span
                                                className={`text-[11px] font-semibold transition-colors ${book.chapters.length === 100
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                                    }`}
                                            >
                                                {(book.chapters || "").length}/100 characters
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            placeholder="Chapters * (e.g. 1-12)"
                                            value={book.chapters}
                                            onChange={(e) => handleBookChange(index, "chapters", e.target.value)}
                                            onBlur={(e) => handleBookChange(index, "chapters", normalizeText(e.target.value))}
                                            className={`w-full px-3 py-1.5 border rounded-md focus:outline-none bg-white text-sm transition ${errors.books && errors.books[index]?.chapters
                                                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                                }`}
                                            disabled={loading}
                                        />
                                        {errors.books && errors.books[index]?.chapters && (
                                            <p className="text-[11px] text-red-500 mt-1">{errors.books[index].chapters}</p>
                                        )}
                                    </div>

                                    {/* Delete */}
                                    {/* was: className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded transition mt-0.5" */}
                                    <button
                                        type="button"
                                        onClick={() => removeBook(index)}
                                        className="self-end sm:self-auto p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 cursor-pointer rounded transition sm:mt-0.5"
                                        // className={`self-end sm:self-auto p-2  rounded transition sm:mt-0.5
                                        //     ${isPublishLocked ? "opacity-60 bg-gray-50 cursor-not-allowed" : "text-gray-500 hover:text-red-600 hover:bg-gray-200 cursor-pointer"}`}

                                        disabled={loading}
                                    // disabled={loading || isPublishLocked}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Instructors Selection */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] mb-4 flex items-center gap-2">
                            <FiUsers /> 4. Assign Instructors <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-xs text-gray-500 mb-3 leading-normal">
                            Select one or more qualified instructors to teach this course.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {instructorsList.map((inst) => {
                                const isSelected = selectedInstructors.includes(inst.instructor_id);
                                return (
                                    <div
                                        key={inst.instructor_id}
                                        onClick={() => handleInstructorToggle(inst.instructor_id)}
                                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition select-none ${isSelected
                                            ? "border-[#0E182B] bg-[#0E182B]/5 text-[#0E182B] shadow-sm"
                                            : "border-gray-200 hover:border-slate-400 text-gray-700 bg-white"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => { }} // Handled by outer div click
                                            className="rounded text-[#0E182B] focus:ring-[#0E182B]"
                                            disabled={loading}
                                        />
                                        <span className="text-sm font-medium leading-none">{inst.user_full_name || inst.instructor_name}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.instructors && (
                            <p className="text-xs text-red-500 mt-2">{errors.instructors}</p>
                        )}
                    </div>

                </fieldset>

                {/* Submit Actions */}
                {/* was: className="flex justify-end gap-3 pt-6 border-t border-gray-100" — on narrow
                    phones the two buttons squeezed into one row with no room for "Create Training"'s
                    text, so it wrapped onto a second line inside the button (looked cut off / broken).
                    Now stacked full-width on phone, reopening to the original justify-end inline row
                    from sm: up where there's enough width for both. */}
                {/* was: Cancel first, Save second — swapped so Save is top on phone (primary action),
                    Cancel is bottom. sm:flex-row-reverse keeps desktop left=Cancel right=Save. */}
                <div className="flex flex-col sm:flex-row-reverse sm:justify-start gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded flex items-center justify-center gap-2 font-medium transition shadow disabled:opacity-50 cursor-pointer min-h-[44px] whitespace-nowrap"
                        disabled={loading || isLocked}
                    >
                        <FiSave />
                        {/* {loading ? (editingCourseId ? "Saving..." : "Creating...") : (editingCourseId ? "Save Changes" : "Create Course")} */}
                        {/* {loading ? (editingTrainingId ? "Saving..." : "Creating..."): isLocked ? "Locked" : (editingTrainingId ? "Save Changes" : "Create Training")} */}
                        {loading ? (editingTrainingId ? "Submitting..." : "Submitting...") : isLocked ? "Locked" : (editingTrainingId ? "Submit" : "Submit")}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="w-full flex items-center justify-center gap-2 sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 font-medium cursor-pointer min-h-[44px]"
                        disabled={loading}
                    >
                        <X size={18} />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TrainingForm;