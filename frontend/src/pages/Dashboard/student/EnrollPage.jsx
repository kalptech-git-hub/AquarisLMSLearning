import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiArrowLeft, FiX, FiCheckCircle, FiSave } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import Navbar from "../../../components/lander/Navbar";
import { X } from "lucide-react";

const EnrollPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [course, setCourse] = useState(location.state?.course || null);
    const [loadingCourse, setLoadingCourse] = useState(!location.state?.course);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const [token, setToken] = useState(sessionStorage.getItem("token"));

    const [formData, setFormData] = useState({
        em_postal_address: "",
        em_contact_number: "",
        em_qualification: "",
        em_photo: null,
        em_optional_upload: null
    });

    const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData(prev => ({
                    ...prev,
                    em_contact_number: user.user_mobile_no || ""
                }));
                if (user.user_profile_photo &&
                    user.user_profile_photo !== "null" &&
                    user.user_profile_photo !== "undefined" &&
                    !String(user.user_profile_photo).includes("undefined") &&
                    !String(user.user_profile_photo).includes("null") &&
                    String(user.user_profile_photo).trim() !== "") {
                    setProfilePhotoUrl(user.user_profile_photo);
                }
            } catch (e) {
                console.error("Failed to parse user details:", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!token) {
            sessionStorage.setItem("pendingEnrollCourseId", id);
            sessionStorage.setItem("redirectAfterLogin", `/enroll/${id}`);
            toast.info("Please login to complete your course enrollment.");
            navigate("/login", {
                state: {
                    redirectTo: `/enroll/${id}`,
                    course: location.state?.course
                }
            });
        } else {
            try {
                const decoded = jwtDecode(token);
                if (decoded.role_code !== "STD") {
                    toast.warning("Admins and Instructors cannot enroll in courses.");
                    navigate("/");
                }
            } catch (err) {
                console.error(err);
            }
        }
    }, [token, id, navigate, location.state]);

    useEffect(() => {
        if (location.state?.course) {
            setCourse(location.state.course);
            setLoadingCourse(false);
            return;
        }

        const fetchCourse = async () => {
            try {
                setLoadingCourse(true);
                const activeToken = sessionStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/courses`,
                    {
                        headers: activeToken ? { Authorization: `Bearer ${activeToken}` } : {}
                    }
                );
                if (response.data.success && Array.isArray(response.data.data)) {
                    const matched = response.data.data.find(
                        (c) => String(c.training_id) === String(id) || String(c.course_id) === String(id)
                    );
                    if (matched) {
                        setCourse(matched);
                    } else {
                        toast.error("Course not found.");
                    }
                }
            } catch (err) {
                console.error("Failed to load course for enrollment:", err);
                toast.error("Failed to load course details.");
            } finally {
                setLoadingCourse(false);
            }
        };

        if (id) {
            fetchCourse();
        }
    }, [id, location.state]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.em_postal_address.trim()) {
            errors.em_postal_address = "Postal address is required";
        }
        if (!formData.em_qualification.trim()) {
            errors.em_qualification = "Qualification is required";
        }
        if (!formData.em_photo && !profilePhotoUrl) {
            errors.em_photo = "Photo is required";
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setSubmitting(true);
            const activeToken = sessionStorage.getItem("token");

            const courseIdVal = course?.training_id || course?.course_id || id;
            const payload = new FormData();
            payload.append("training_id", Number(courseIdVal));
            payload.append("enroll_postal_address", formData.em_postal_address.trim());
            payload.append("enroll_qualification", formData.em_qualification.trim());

            if (formData.em_photo) {
                payload.append("user_profile_photo", formData.em_photo);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${activeToken}`
                    }
                }
            );

            if (response.data.success) {
                toast.success("Enrollment submitted successfully!");
                sessionStorage.removeItem("pendingEnrollCourseId");
                sessionStorage.removeItem("redirectAfterLogin");
                navigate("/my-learning");
            }
        } catch (error) {
            console.error("Enrollment error:", error);
            toast.error(error.response?.data?.message || "Failed to submit enrollment.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingCourse) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E182B]"></div>
                    <span className="text-sm font-medium text-gray-600">Loading enrollment form...</span>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
                <p className="text-gray-500 mb-6">The requested course could not be found for enrollment.</p>
                {/* <button
                    onClick={() => navigate("/")}
                    className="px-5 py-2.5 bg-[#0E182B] text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
                >
                    <FiArrowLeft size={18} />
                    Back to Courses
                </button> */}

                <button
                    onClick={() => navigate("/")}
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-sm font-semibold text-slate-700 hover:text-[#0E182B] hover:border-slate-400 hover:bg-slate-50 shadow-xs transition-all duration-200 cursor-pointer"
                >
                    <FiArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1 text-slate-500 group-hover:text-[#0E182B]" />
                    Back to Courses
                </button>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-24">
            <style>{`
                .formatted-desc u, .formatted-desc span, .formatted-desc p, .formatted-desc li, .formatted-desc a {
                    text-decoration: none !important;
                }
                .formatted-desc strong, .formatted-desc b {
                    font-weight: 400 !important;
                }
            `}</style>
            <Navbar />

            {/* Main Enrollment Container */}
            {/* was: className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6" — max-w-7xl (1280px) meant the 2-col grid stretched to the full 1024px viewport width on iPad Pro/Nest Hub with only 24px side padding, leaving the two panels feeling oversized/sparse rather than a tightened centered layout. Capped to max-w-5xl for the lg→xl tablet band, reopening to max-w-7xl from xl: (1280px+) where the original wider layout was already right. */}
            <main className="flex-1 max-w-5xl xl:max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
                {/* Back link */}
                {/* <button
                    onClick={() => navigate(`/course/${id}`, { state: { course } })}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0E182B] transition cursor-pointer"
                >
                    <FiArrowLeft size={16} />
                    Back to Course Details
                </button> */}

                <button
                    onClick={() => navigate(`/course/${id}`, { state: { course } })}
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-sm font-semibold text-slate-700 hover:text-[#0E182B] hover:border-slate-400 hover:bg-slate-50 shadow-xs transition-all duration-200 cursor-pointer"
                >
                    <FiArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1 text-slate-500 group-hover:text-[#0E182B]" />
                    Back to Course Details
                </button>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* LEFT SIDE: COURSE ENROLLMENT SUMMARY */}
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
                        {/* was: className="h-[280px] overflow-hidden bg-slate-100 relative" with img className="w-full h-full object-cover" — fixed-height box + object-cover cropped the banner's left/right edges (including title text) on phone, same root cause as the other modules. h-auto on phone lets the box follow the image's own rendered height at full width (zero crop); md: and up keeps the original fixed 280px + object-cover unchanged. */}
                        <div className="h-auto md:h-[280px] overflow-hidden bg-slate-100 relative">
                            {course?.training_thumbnail || course?.cm_thumbnail ? (
                                <img
                                    src={(() => {
                                        const thumb = course?.training_thumbnail || course?.cm_thumbnail;
                                        if (!thumb) return "";
                                        return /^https?:\/\//i.test(thumb)
                                            ? thumb
                                            : `${import.meta.env.VITE_API_BASE_URL}${thumb}`;
                                    })()}
                                    alt={course?.training_title || course?.cm_title}
                                    className="w-full h-auto object-contain md:h-full md:object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-br from-[#0E182B] to-[#1E2E4B] p-6 text-center">
                                    <span className="text-xl font-bold">{course.training_title || course.cm_title}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-8 space-y-4">
                            <p className="uppercase tracking-[0.2em] text-red-600 text-xs font-bold">
                                Course Enrollment
                            </p>

                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                {course.training_title || course.cm_title}
                            </h1>

                            <div
                                className="formatted-desc text-gray-600 text-sm leading-relaxed line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: course.training_description || course.cm_description || "" }}
                            />

                            <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Instructor</span>
                                    <span className="font-semibold text-gray-900">
                                        {(course.instructors && course.instructors.length > 0)
                                            ? course.instructors.map(inst => inst.instructor_name || inst.user_full_name).filter(Boolean).join(", ")
                                            : (course.cm_instructor_name || "Assigned Instructor")}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Level</span>
                                    <span className="font-semibold text-gray-900">
                                        {course.course_level || course.cm_level || "Standard"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-semibold text-gray-900">
                                        {course.training_duration_hours ? `${course.training_duration_hours} Hours` : (course.cm_duration || "Flexible")}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-gray-500 font-medium">Price</span>
                                    <span className="text-2xl font-bold text-[#0E182B]">
                                        ₹{course.training_fee || course.cm_price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: STUDENT DETAILS ENROLLMENT FORM */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 relative">
                        <div className="mb-6">
                            <p className="uppercase tracking-[0.2em] text-blue-600 text-xs font-bold mb-2">
                                Student Details
                            </p>

                            <h2 className="text-2xl font-bold text-gray-900">
                                Enroll Now
                            </h2>

                            <p className="text-gray-500 text-sm mt-1">
                                Fill your details carefully before submitting.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Postal Address */}
                            <div>
                                <div className="flex justify-between items-center mb-1">

                                    <label className="block text-sm font-semibold text-gray-700">
                                        Postal Address <span className="text-red-500">*</span>
                                    </label>

                                    <span className={`text-[11px] font-semibold transition-colors ${formData.em_postal_address.length === 200 ? "text-green-600" : "text-gray-400"
                                        }`}>
                                        {formData.em_postal_address.length}/200 characters
                                    </span>
                                </div>

                                <textarea
                                    rows="3"
                                    name="em_postal_address"
                                    maxLength="200"
                                    placeholder="Postal Address"
                                    value={formData.em_postal_address}
                                    onChange={handleChange}
                                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-1 focus:ring-slate-500 ${formErrors.em_postal_address ? "border-red-500" : "border-gray-300 focus:border-slate-500"
                                        }`}
                                />
                                {formErrors.em_postal_address && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.em_postal_address}</p>
                                )}
                                {/* <p className="mt-1 text-xs text-gray-400 text-right">
                                    {formData.em_postal_address.length}/200 characters
                                </p> */}
                            </div>

                            {/* Qualification */}
                            <div>
                                <div className="flex justify-between items-center mb-1">

                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Qualification <span className="text-red-500">*</span>
                                    </label>

                                    <span className={`text-[11px] font-semibold transition-colors ${formData.em_qualification.length === 200 ? "text-green-600" : "text-gray-400"
                                        }`}>
                                        {formData.em_qualification.length}/200 characters
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    name="em_qualification"
                                    maxLength="200"
                                    placeholder="Qualification"
                                    value={formData.em_qualification}
                                    onChange={handleChange}
                                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-1 focus:ring-slate-500 ${formErrors.em_qualification ? "border-red-500" : "border-gray-300 focus:border-slate-500"
                                        }`}
                                />
                                {formErrors.em_qualification && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.em_qualification}</p>
                                )}
                                {/* <p className="mt-1 text-xs text-gray-400 text-right">
                                    {formData.em_qualification.length}/200 characters
                                </p> */}
                            </div>

                            {/* Photo */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center justify-between">
                                    <span>Photo {!profilePhotoUrl && <span className="text-red-500">*</span>}</span>
                                    {profilePhotoUrl && (
                                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                            Registered Photo Found
                                        </span>
                                    )}
                                </label>

                                {profilePhotoUrl && (
                                    <div className="flex items-center gap-3 mb-3 p-3 bg-slate-50 border border-slate-250 rounded-xl">
                                        <img
                                            src={profilePhotoUrl && /^https?:\/\//i.test(profilePhotoUrl)
                                                ? profilePhotoUrl
                                                : `${import.meta.env.VITE_API_BASE_URL}${profilePhotoUrl}`}
                                            alt="Profile Preview"
                                            onError={() => setProfilePhotoUrl(null)}
                                            className="w-12 h-12 rounded-full object-cover border border-slate-300"
                                        />
                                        <div className="text-[11px] text-gray-500 leading-normal">
                                            <p className="font-semibold text-gray-700">Using photo from your registration.</p>
                                            <p>Upload a new image below only if you want to replace it.</p>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    name="em_photo"
                                    onChange={handleChange}
                                    accept="image/*"
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer"
                                />
                                {formErrors.em_photo && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.em_photo}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            {/* <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center justify-center gap-2 w-full bg-[#0E182B] hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm transition shadow cursor-pointer disabled:opacity-50 mt-4"
                                title="Submit Enrollment"
                            >
                                <FiSave size={16} />
                                {submitting ? "Submitting..." : "Submit"}
                            </button> */}

                            <div className="flex gap-3 mt-4">
                                {/* Cancel Button */}
                                <button
                                    type="button"
                                    onClick={() => navigate(`/course/${id}`, { state: { course } })}
                                    className="flex items-center justify-center gap-2 flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3.5 rounded-xl font-bold text-sm transition shadow cursor-pointer"
                                    title="Cancel Enrollment"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center justify-center gap-2 flex-1 bg-[#0E182B] hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm transition shadow cursor-pointer disabled:opacity-50"
                                    title="Submit Enrollment"
                                >
                                    <FiSave size={16} />
                                    {submitting ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EnrollPage;
