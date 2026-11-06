import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";

const EnrollmentModal = ({ course, onClose }) => {
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        em_postal_address: "",
        em_contact_number: "",
        em_qualification: "",
        em_photo: null,
        em_optional_upload: null
    });

    const [loading, setLoading] = useState(false);

    // const handleChange = (e) => {

    //     setFormData({
    //         ...formData,
    //         [e.target.name]: e.target.value
    //     });

    // };

    // const validateForm = () => {
    //     const errors = {};
    //     if (!formData.em_postal_address) {
    //         errors.em_postal_address = "Postal address is required";
    //     }
    //     if (!formData.em_contact_number) {
    //         errors.em_contact_number = "Contact number is required";
    //     }
    //     if (!formData.em_qualification) {
    //         errors.em_qualification = "Qualification is required";
    //     }
    //     return errors;
    // }

    const validateForm = () => {

        const errors = {};

        if (!formData.em_postal_address.trim()) {

            errors.em_postal_address =
                "Address is required";

        }

        if (!formData.em_contact_number.trim()) {

            errors.em_contact_number =
                "Contact number is required";

        }
        else if (
            !/^[0-9]{10}$/.test(
                formData.em_contact_number
            )
        ) {

            errors.em_contact_number =
                "Enter valid 10 digit number";

        }

        if (!formData.em_qualification.trim()) {

            errors.em_qualification =
                "Qualification is required";

        }

        // PHOTO VALIDATION

        if (formData.em_photo) {

            const allowedImageTypes = [

                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/webp"

            ];

            if (
                !allowedImageTypes.includes(
                    formData.em_photo.type
                )
            ) {

                errors.em_photo =
                    "Only image files allowed";

            }

            if (
                formData.em_photo.size >
                5 * 1024 * 1024
            ) {

                errors.em_photo =
                    "Photo must be under 5MB";

            }

        }

        // OPTIONAL FILE VALIDATION

        if (formData.em_optional_upload) {

            const allowedOptionalTypes = [

                "application/pdf",
                "image/jpeg",
                "image/png",
                "image/jpg"

            ];

            if (
                !allowedOptionalTypes.includes(
                    formData.em_optional_upload.type
                )
            ) {

                errors.em_optional_upload =
                    "Only PDF/Image allowed";

            }

            if (
                formData.em_optional_upload.size >
                10 * 1024 * 1024
            ) {

                errors.em_optional_upload =
                    "File must be under 10MB";

            }

        }

        return errors;

    };

    const handleChange = (e) => {

        const { name, value, files } = e.target;

        setFormData({

            ...formData,

            [name]: files
                ? files[0]
                : value

        });

        setFormErrors({

            ...formErrors,

            [name]: ""

        });

    };

    const handleSubmit = async (e) => {
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {

            setFormErrors(errors);
            return;

        }

        e.preventDefault();

        try {

            setLoading(true);

            const token = sessionStorage.getItem("token");
            // console.log(token);
            const courseIdVal = course?.training_id || course?.course_id || course?.cm_id;
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
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                toast.success("Enrollment submitted");

                onClose();

            }

        } catch (error) {

            console.log(error);

            toast.error(
                error?.response?.data?.message ||
                "Enrollment failed"
            );

        } finally {

            setLoading(false);

        }

    };

    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fadeIn">
                        {/* was: className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 md:p-8 my-auto" — max-w-6xl (1152px) left the modal nearly full-bleed on tablets in the lg 2-col range (iPad Pro 1024, Nest Hub 1024), so the 2-col grid inside had oversized gutters around it. Tightened to max-w-4xl for that lg→xl range, reopening to max-w-6xl from xl: (1280px+) where the wider layout was already fine. */}
            <div className="relative w-full max-w-4xl xl:max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 md:p-8 my-auto">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition z-10 cursor-pointer"
                    title="Close"
                >
                    <FiX size={22} />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT SIDE: COURSE DETAILS */}
                    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                                                {/* Thumbnail */}
                        {/* was: className="h-[260px] md:h-[300px] overflow-hidden bg-slate-200" — the fixed 260px height on phone still forced the image into a box shape that didn't match the banner's actual aspect ratio, so the title text was still coming out visibly cut at the edges despite object-contain. Switched to h-auto on phone so the box height follows the image's own rendered height at full container width — that guarantees zero cropping since there's no mismatched box to fit into. md: and up unchanged (still fixed 300px + object-cover, same as before). */}
                        <div className="h-auto md:h-[300px] overflow-hidden bg-slate-200">
                            {course?.training_thumbnail || course?.cm_thumbnail ? (
                                /* was: className="w-full h-full object-contain md:object-cover" — this comment previously sat mid-attribute-list on the <img> tag below (between alt and className), which is the exact pattern that broke the parser before. Moved above the element here. */
                                <img
                                    src={(() => {
                                        const thumb = course.training_thumbnail || course.cm_thumbnail;
                                        if (!thumb) return "";
                                        return /^https?:\/\//i.test(thumb)
                                            ? thumb
                                            : `${import.meta.env.VITE_API_BASE_URL}${thumb}`;
                                    })()}
                                    alt={course.training_title || course.cm_title}
                                    className="w-full h-auto object-contain md:h-full md:object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-[#0E182B] to-[#1E2E4B] text-white p-6 text-center">
                                    <span className="text-xl font-bold">{course.training_title || course.cm_title}</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <style>{`
                                .formatted-desc u, .formatted-desc span, .formatted-desc p, .formatted-desc li, .formatted-desc a {
                                    text-decoration: none !important;
                                }
                                .formatted-desc strong, .formatted-desc b {
                                    font-weight: 400 !important;
                                }
                            `}</style>
                            <p className="uppercase tracking-[0.2em] text-red-500 text-xs font-bold mb-2">
                                Course Enrollment
                            </p>

                            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3">
                                {course.training_title || course.cm_title}
                            </h3>

                            <div 
                                className="formatted-desc text-gray-600 text-xs leading-relaxed mb-6 line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: course.training_description || course.cm_description || "" }}
                            />

                            {/* Course Info */}
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="text-gray-500">Instructor</span>
                                    <span className="font-semibold text-gray-900">
                                        {(course.instructors && course.instructors.length > 0)
                                            ? course.instructors.map(inst => inst.instructor_name || inst.user_full_name).filter(Boolean).join(", ")
                                            : (course.cm_instructor_name || "Assigned Teacher")}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="text-gray-500">Level</span>
                                    <span className="font-semibold text-gray-900">
                                        {course.course_level || course.cm_level || "Standard"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="text-gray-500">Duration</span>
                                    <span className="font-semibold text-gray-900">
                                        {course.training_duration_hours ? `${course.training_duration_hours} Hours` : (course.cm_duration || "Flexible")}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-gray-500 font-medium">Price</span>
                                    <span className="text-xl font-bold text-[#0E182B]">
                                        ₹{course.training_fee || course.cm_price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* RIGHT SIDE */}
                {/* ENROLLMENT FORM */}

                <div className="bg-white rounded-3xl shadow-lg p-8 relative">

                    <div className="mb-8">
                        {/* Close Button */}

                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 w-10
                                h-10 rounded-full bg-gray-100
                                hover:bg-red-500 hover:text-white
                                text-gray-600 transition-all duration-300
                                flex items-center justify-center text-lg font-bold">
                            <FiX size={20}/>
                        </button>

                        <p className="uppercase tracking-[0.2em] text-indigo-500 text-sm font-semibold mb-3">
                            Student Details
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900">
                            Enroll Now
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Fill your details carefully before submitting.
                        </p>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Address */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Postal Address <span className="text-red-500">*</span>
                            </label>

                            <textarea
                                type="text"
                                rows="2"
                                name="em_postal_address"
                                maxLength="200"
                                placeholder="Postal Address"
                                value={formData.em_postal_address}
                                onChange={handleChange}
                                required
                                // className="w-full border rounded-xl p-3 outline-none"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 ${formErrors.em_postal_address ? "border-red-500" : "border-gray-300"
                                    } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                            />
                            {formErrors.em_postal_address && (
                                <p className="text-red-500 text-sm mt-1">
                                    {formErrors.em_postal_address}
                                </p>
                            )}

                            <p className="mt-1 text-xs text-gray-500">
                                {formData.em_postal_address.length}/200 characters
                            </p>
                        </div>

                        {/* Contact */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Number <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="text"
                                name="em_contact_number"
                                maxLength="10"
                                placeholder="Contact Number"
                                value={formData.em_contact_number}
                                onChange={handleChange}
                                required
                                // className="w-full border rounded-xl p-3 outline-none"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 ${formErrors.em_contact_number ? "border-red-500" : "border-gray-300"
                                    } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                            />
                            {formErrors.em_contact_number && (
                                <p className="text-red-500 text-sm mt-1">
                                    {formErrors.em_contact_number}
                                </p>
                            )}

                            <p className="mt-1 text-xs text-gray-500">
                                {formData.em_contact_number.length}/10 characters
                            </p>
                        </div>

                        {/* Qualification */}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Qualification <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="em_qualification"
                                maxLength="200"
                                placeholder="Qualification"
                                value={formData.em_qualification}
                                onChange={handleChange}
                                required
                                // className="w-full border rounded-xl p-3 outline-none"
                                className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-indigo-500 ${formErrors.source_url ? "border-red-500" : "border-gray-300"
                                    } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                            />
                            {formErrors.em_qualification && (
                                <p className="text-red-500 text-sm mt-1">
                                    {formErrors.em_qualification}
                                </p>
                            )}

                            {/* New line added length count */}
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.em_qualification.length}/200 characters
                            </p>
                        </div>


                        {/* Photo URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Photo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                name="em_photo"
                                // placeholder="Photo URL"
                                // value={formData.em_photo}
                                onChange={handleChange}
                                accept="image/*"
                                // className="w-full border rounded-xl p-3 outline-none"
                                className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4 file:rounded-lg
                            file:border-0 file:text-sm file:font-medium
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100 file:cursor-pointer
                            disabled:cursor-not-allowed"
                            />
                            {formErrors.em_photo && (
                                <p className="text-red-500 text-sm mt-1">
                                    {formErrors.em_photo}
                                </p>
                            )}
                        </div>


                        {/* Optional Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload
                                {/* <span className="text-red-500">*</span> */}
                            </label>
                        </div>

                        <input
                            type="file"
                            name="em_optional_upload"
                            // placeholder="Optional Upload URL"
                            // value={formData.em_optional_upload}
                            onChange={handleChange}
                            accept=".pdf,image/*"
                            // className="w-full border rounded-xl p-3 outline-none"
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4 file:rounded-lg
                            file:border-0 file:text-sm file:font-medium
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100 file:cursor-pointer
                            disabled:cursor-not-allowed"
                        />

                        {formErrors.em_optional_upload && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.em_optional_upload}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                            w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                        >
                            {
                                loading
                                    ? "Submitting..."
                                    : "Submit Enrollment"
                            }
                        </button>

                    </form>


                </div>
            </div>
        </div>
    </div>
);
};

export default EnrollmentModal;