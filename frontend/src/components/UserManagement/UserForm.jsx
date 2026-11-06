import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiArrowLeft, FiSave, FiEye, FiEyeOff, FiCamera, FiUser } from "react-icons/fi";
import { X } from "lucide-react";

const validateEmail = (email) => {
    const val = (email || "").trim();
    const hasSpaces = /\s/;
    const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._]{3,90}@([a-zA-Z-]+\.)+(com|org|net|info|tech|biz|name|pro|in|co\.in|us|uk|co\.uk|ca|au|nz|jp|cn|de|fr|edu|gov|ac\.in|edu\.in)$/;

    if (!val) {
        return "Email is required";
    }
    if (!emailRegex.test(val) || hasSpaces.test(val)) {
        return "Invalid email format";
    }
    if (val.length > 100) {
        return "Email must not exceed 100 characters";
    }
    return "";
};

const UserForm = ({ onCancel, onSuccess, editingInstructorId, editingUserId }) => {
    const activeEditingId = editingInstructorId || editingUserId;

    const [formData, setFormData] = useState({
        user_full_name: "",
        username: "",
        user_email: "",
        user_mobile_no: "",
        user_password: "",

        ins_qualification: "",
        ins_experience: "",
        ins_bio: "",

        is_active: "1"  //default active

    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [errors, setErrors] = useState({});

    const fileInputRef = useRef(null);

    const loadInstructorData = async () => {
        if (!activeEditingId) return;

        setFetchingData(true);
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/instructors/${activeEditingId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success && response.data.data) {
                const inst = response.data.data;
                setFormData({
                    user_full_name: inst.user_full_name || "",
                    username: inst.username || "",
                    user_email: inst.user_email || "",
                    user_mobile_no: inst.user_mobile_no || "",
                    user_password: "", // Keep blank in edit mode
                    ins_qualification: inst.ins_qualification || "",
                    ins_experience: inst.ins_experience || "",
                    ins_bio: inst.ins_bio || "",

                    is_active: String(inst.user_active)
                });

                setRemovePhoto(false);

                if (inst.user_profile_photo) {
                    setPhotoPreview(
                        /^https?:\/\//i.test(inst.user_profile_photo)
                            ? inst.user_profile_photo
                            : `${import.meta.env.VITE_API_BASE_URL}${inst.user_profile_photo}`
                    );
                } else {
                    setPhotoPreview(null);
                }
            }
        } catch (err) {
            console.error("Error loading instructor details:", err);
            toast.error("Failed to load instructor details for editing.");
            if (onCancel) onCancel();
        } finally {
            setFetchingData(false);
        }
    };

    useEffect(() => {
        loadInstructorData();
    }, [activeEditingId]);

    // Validation rules
    const validate = () => {
        const tempErrors = {};
        const hasSpaces = /\s/;

        const normalizedFullName = formData.user_full_name
            .trim()
            .replace(/\s+/g, " ");

        // Full Name Validation
        const nameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;

        if (!normalizedFullName) {
            tempErrors.user_full_name = "Full name is required";
        } else if (!nameRegex.test(normalizedFullName)) {
            tempErrors.user_full_name = "Name must contain only letters";
        } else if (normalizedFullName.length < 2 || normalizedFullName.length > 30) {
            tempErrors.user_full_name = "Name must be between 2 and 30 characters";
        }

        // Username Validation
        const usernameRegex = /^[a-zA-Z0-9_.]+$/;
        if (!formData.username.trim()) {
            tempErrors.username = "Username is required";
        } else if (hasSpaces.test(formData.username)) {
            tempErrors.username = "Username must not contain spaces";
        } else if (formData.username.length < 5 || formData.username.length > 30) {
            tempErrors.username = "Username must be between 5 and 30 characters";
        } else if (!usernameRegex.test(formData.username)) {
            tempErrors.username = "Username can only contain letters, numbers, underscores (_), and dots (.)";
        } else if (!/[a-zA-Z]/.test(formData.username)) {
            tempErrors.username = "Username must contain at least one letter (cannot be only numbers or underscores)";
        } else if (!/^[a-zA-Z0-9]/.test(formData.username) || !/[a-zA-Z0-9]$/.test(formData.username)) {
            tempErrors.username = "Username cannot start or end with an underscore (_) or dot (.)";
        }

        // Email Validation
        const emailError = validateEmail(formData.user_email);
        if (emailError) {
            tempErrors.user_email = emailError;
        }

        // Mobile Number Validation
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!formData.user_mobile_no.trim()) {
            tempErrors.user_mobile_no = "Mobile number is required";
        } else if (!mobileRegex.test(formData.user_mobile_no)) {
            if (!/^[6-9]/.test(formData.user_mobile_no)) {
                tempErrors.user_mobile_no = "Mobile number must start with 6, 7, 8, or 9";
            } else if (formData.user_mobile_no.length !== 10) {
                tempErrors.user_mobile_no = "Mobile number must be exactly 10 digits";
            } else {
                tempErrors.user_mobile_no = "Invalid mobile number format";
            }
        }

        // Password Validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,20}$/;
        if (!activeEditingId && !formData.user_password) {
            tempErrors.user_password = "Password is required";
        } else if (formData.user_password) {
            if (hasSpaces.test(formData.user_password)) {
                tempErrors.user_password = "Password must not contain spaces";
            } else if (!passwordRegex.test(formData.user_password)) {
                tempErrors.user_password = "Must be 6-20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character";
            }
        }

        // Qualification Validation
        if (!formData.ins_qualification.trim()) {
            tempErrors.ins_qualification = "Qualification is required";
        } else if (formData.ins_qualification.length > 255) {
            tempErrors.ins_qualification = "Qualification must not exceed 255 characters";
        }

        // Experience Validation
        if (!formData.ins_experience.trim()) {
            tempErrors.ins_experience = "Experience details are required";
        } else if (formData.ins_experience.length > 255) {
            tempErrors.ins_experience = "Experience must not exceed 255 characters";
        }

        // Bio Validation (Optional)
        if (formData.ins_bio && formData.ins_bio.length > 1000) {
            tempErrors.ins_bio = "Biography must not exceed 1000 characters";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Strip non-digit characters for mobile number input and limit length to 10 digits
        if (name === "user_mobile_no") {
            const cleanDigits = value.replace(/\D/g, "");
            if (cleanDigits.length > 10) return;

            setFormData(prev => ({
                ...prev,
                [name]: cleanDigits
            }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: "" }));
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Real-time error clearing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Please upload an image in PNG, JPG, JPEG, or WEBP format.");
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error("File size must be under 2MB.");
                return;
            }
            setProfilePhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            setRemovePhoto(false);
        }
    };

    const handleRemovePhoto = (e) => {
        e.stopPropagation();
        setPhotoPreview(null);
        setProfilePhoto(null);
        setRemovePhoto(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        setLoading(true);

        const payload = {
            ...formData,
            user_full_name: formData.user_full_name
                .trim()
                .replace(/\s+/g, " ")
        };

        const submitData = new FormData();

        Object.keys(payload).forEach(key => {
            submitData.append(key, payload[key]);
        });

        if (profilePhoto) {
            submitData.append("user_profile_photo", profilePhoto);
        } else if (removePhoto) {
            submitData.append("remove_photo", "1");
        }

        try {
            const token = sessionStorage.getItem("token");
            let response;

            if (activeEditingId) {
                response = await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/api/instructors/${activeEditingId}`,
                    submitData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
            } else {
                response = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/instructors/`,
                    submitData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
            }

            if (response.data.success) {
                toast.success(response.data.message || (activeEditingId ? "Instructor updated successfully!" : "Instructor added successfully!"));

                if (activeEditingId) {
                    // Keep an instructor panel opened in the same browser session current.
                    const currentUser = sessionStorage.getItem("user");
                    const updatedInstructor = response.data.data;

                    if (currentUser && updatedInstructor) {
                        const parsedUser = JSON.parse(currentUser);

                        if (Number(parsedUser.user_id) === Number(activeEditingId)) {
                            sessionStorage.setItem("user", JSON.stringify({
                                ...parsedUser,
                                ...updatedInstructor,
                                qualification: updatedInstructor.ins_qualification,
                                experience: updatedInstructor.ins_experience,
                                biography: updatedInstructor.ins_bio
                            }));
                        }
                    }

                    window.dispatchEvent(new CustomEvent("instructorProfileUpdated", {
                        detail: updatedInstructor
                    }));
                    window.dispatchEvent(new Event("authChanged"));
                }

                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("API error saving instructor:", error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || "Failed to save instructor.";
            toast.error(errMsg);

            // Map backend error to specific field if possible
            if (errMsg.toLowerCase().includes("email already exists")) {
                setErrors(prev => ({ ...prev, user_email: "Email is already registered" }));
            }
            if (errMsg.toLowerCase().includes("username already exists")) {
                setErrors(prev => ({ ...prev, username: "Username is already taken" }));
            }
            if (errMsg.toLowerCase().includes("mobile number already exists")) {
                setErrors(prev => ({ ...prev, user_mobile_no: "Mobile number is already registered" }));
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="flex justify-center items-center py-20">
                {/* border-[#0E182B] */}
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600 font-medium">Loading instructor data...</span>
            </div>
        );
    }

    return (
        //{/* was: className="bg-white rounded-lg shadow-md border border-gray-100 w-full overflow-hidden" — overflow-hidden clips the bottom submit button on short phone viewports; overflow-x-hidden preserves the horizontal containment without cutting off vertically */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 w-full overflow-x-hidden">
            {/* Header */}
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600 cursor-pointer"
                        title="Back to Instructors"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeEditingId ? "Edit Instructor" : "Add New Instructor"}
                        </h2>
                        <p className="text-xs text-gray-500">Create login credentials and teacher profile details</p>
                    </div>
                </div>
            </div>

            {/* was: className="p-6 space-y-6" — no bottom padding meant the submit buttons were
                flush against the scroll container's bottom edge; the container cuts off before
                the buttons fully scroll into view. pb-10 adds enough clearance at the end of
                the form so the buttons scroll completely visible on short phone viewports. */}
            <form onSubmit={handleSubmit} noValidate className="p-6 pb-10 space-y-6">

                {/* Profile Photo Upload & Header Panel */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center transition-all duration-200 group-hover:border-[#0E182B]">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <FiUser className="text-slate-400" size={40} />
                            )}
                        </div>

                        {photoPreview && (
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="absolute -top-1 -right-1 bg-gray-700 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow transition text-lg leading-none cursor-pointer"
                                title="Remove photo"
                            >
                                −
                            </button>
                        )}

                        <div className="absolute bottom-0 right-0 bg-[#0E182B] text-white p-1.5 rounded-full hover:bg-[#1E2E4B] transition shadow">
                            <FiCamera size={14} />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handlePhotoChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="font-semibold text-gray-700">Instructor Avatar</h4>
                        <p className="text-xs text-gray-500 mt-1">
                            Upload a high-quality square picture. Supported formats: PNG, JPG, JPEG, or WEBP. Max file size: 2MB.
                        </p>
                        {!photoPreview && (
                            <p className="text-xs text-gray-400 mt-1 italic">
                                No photo — initials avatar will be used instead.
                            </p>
                        )}
                    </div>
                </div>

                {/* Section 1: Account Credentials */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] mb-4">
                        1. Account Credentials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="user_full_name"
                                value={formData.user_full_name}
                                onChange={handleChange}

                                onBlur={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        user_full_name: e.target.value
                                            .trim()
                                            .replace(/\s+/g, " ")
                                    }))
                                }

                                placeholder="Enter full name"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.user_full_name
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.user_full_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.user_full_name}</p>
                            )}
                        </div> */}

                        {/* Full Name - limit added*/}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-[11px] font-semibold transition-colors ${formData.user_full_name.length === 30 ? "text-green-600" : "text-gray-400"
                                    }`}>
                                    {formData.user_full_name.length}/30 characters
                                </span>
                            </div>
                            <input
                                type="text"
                                name="user_full_name"
                                maxLength={30}
                                value={formData.user_full_name}
                                onChange={handleChange}
                                onBlur={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        user_full_name: e.target.value
                                            .trim()
                                            .replace(/\s+/g, " ")
                                    }))
                                }
                                placeholder="Enter full name"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.user_full_name
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.user_full_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.user_full_name}</p>
                            )}
                        </div>

                        {/* Username */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username <span className="text-red-500">*</span>
                                <span className="text-xs font-normal text-gray-400 ml-1">
                                    (Use Letters, numbers, underscores (_) and dots (.) only)
                                </span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username (min 5 chars)"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.username
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.username && (
                                <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                            )}
                        </div> */}

                        {/* Username */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-[11px] font-semibold transition-colors ${formData.username.length === 30 ? "text-green-600" : "text-gray-400"
                                    }`}>
                                    {formData.username.length}/30 characters
                                </span>
                            </div>
                            <input
                                type="text"
                                name="username"
                                maxLength={30}
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username (min 5 chars)"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.username
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.username ? (
                                <p className="text-xs text-red-500 mt-1 leading-normal">{errors.username}</p>
                            ) : (
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                                    Letters, numbers, underscores (_) and dots (.) only. Min 5 characters.
                                </p>
                            )}
                        </div>

                        {/* Email Address */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="user_email"
                                value={formData.user_email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.user_email
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.user_email && (
                                <p className="text-xs text-red-500 mt-1">{errors.user_email}</p>
                            )}
                        </div> */}

                        {/* Email Address */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-[11px] font-semibold transition-colors ${formData.user_email.length === 100 ? "text-green-600" : "text-gray-400"
                                    }`}>
                                    {formData.user_email.length}/100 characters
                                </span>
                            </div>
                            <input
                                type="email"
                                name="user_email"
                                maxLength={100}
                                value={formData.user_email}
                                onChange={handleChange}
                                onBlur={(e) => {
                                    const trimmedEmail = e.target.value.trim();
                                    setFormData(prev => ({ ...prev, user_email: trimmedEmail }));
                                    const errorMsg = validateEmail(trimmedEmail);
                                    setErrors(prev => ({ ...prev, user_email: errorMsg }));
                                }}
                                placeholder="example@email.com"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.user_email
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.user_email && (
                                <p className="text-xs text-red-500 mt-1">{errors.user_email}</p>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Mobile Number (India) <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-[11px] font-semibold transition-colors ${formData.user_mobile_no.length === 10 ? "text-green-600" : "text-gray-400"
                                    }`}>
                                    {formData.user_mobile_no.length}/10 digits
                                </span>
                            </div>
                            <input
                                type="tel"
                                name="user_mobile_no"
                                maxLength={10}
                                value={formData.user_mobile_no}
                                onChange={handleChange}
                                placeholder="Enter 10-digit mobile number"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.user_mobile_no
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.user_mobile_no && (
                                <p className="text-xs text-red-500 mt-1">{errors.user_mobile_no}</p>
                            )}
                        </div>

                        {/* Password */}
                        {/* <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="user_password"
                                    value={formData.user_password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.user_password
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                </button>
                            </div>
                            {errors.user_password ? (
                                <p className="text-xs text-red-500 mt-1 leading-normal">{errors.user_password}</p>
                            ) : (
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                                    Min 6 characters, must include 1 uppercase, 1 lowercase, 1 number & 1 special character.
                                </p>
                            )}
                        </div> */}

                        {/* Password */}
                        <div className="relative">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password {!activeEditingId && <span className="text-red-500">*</span>}
                                </label>
                                <span className={`text-[11px] font-semibold transition-colors ${formData.user_password.length === 20 ? "text-green-600" : "text-gray-400"
                                    }`}>
                                    {formData.user_password.length}/20 characters
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="user_password"
                                    maxLength={20}
                                    value={formData.user_password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.user_password
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                        }`}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                </button>
                            </div>
                            {errors.user_password ? (
                                <p className="text-xs text-red-500 mt-1 leading-normal">{errors.user_password}</p>
                            ) : (
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                                    Min 6 characters, must include 1 uppercase, 1 lowercase, 1 number & 1 special character.
                                </p>
                            )}
                        </div>

                        {/* Status - active or inactive  */}
                        {editingUserId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instructor Status
                                </label>

                                <div className="flex gap-4 items-center pt-1.5">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">

                                        <input
                                            type="radio"
                                            name="is_active"
                                            value="1"
                                            checked={formData.is_active === "1"}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <span>Active</span>
                                    </label>

                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="is_active"
                                            value="0"
                                            checked={formData.is_active === "0"}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <span>Inactive</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>



                {/* Section 2: Professional Profile */}
                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] mb-4">
                        2. Professional Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Qualification */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Qualification <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ins_qualification"
                                value={formData.ins_qualification}
                                onChange={handleChange}
                                placeholder="e.g. JLPT N1 Certified, Master's in Japanese"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.ins_qualification
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.ins_qualification && (
                                <p className="text-xs text-red-500 mt-1">{errors.ins_qualification}</p>
                            )}
                        </div> */}

                        {/* Qualification */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Qualification <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-[11px] font-semibold transition-colors ${formData.ins_qualification.length === 200 ? "text-green-600" : "text-gray-400"
                                    }`}>
                                    {formData.ins_qualification.length}/200 characters
                                </span>
                            </div>
                            <input
                                type="text"
                                name="ins_qualification"
                                maxLength={200}
                                value={formData.ins_qualification}
                                onChange={handleChange}
                                placeholder="e.g. JLPT N1 Certified, Master's in Japanese"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.ins_qualification
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.ins_qualification && (
                                <p className="text-xs text-red-500 mt-1">{errors.ins_qualification}</p>
                            )}
                        </div>

                        {/* Experience */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Experience <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="ins_experience"
                                value={formData.ins_experience}
                                onChange={handleChange}
                                placeholder="e.g. 5 Years of Teaching Experience"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.ins_experience
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.ins_experience && (
                                <p className="text-xs text-red-500 mt-1">{errors.ins_experience}</p>
                            )}
                        </div> */}

                        {/* Experience */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Experience <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-[11px] font-semibold transition-colors ${formData.ins_experience.length === 200 ? "text-green-600" : "text-gray-400"
                                    }`}>
                                    {formData.ins_experience.length}/200 characters
                                </span>
                            </div>
                            <input
                                type="text"
                                name="ins_experience"
                                maxLength={200}
                                value={formData.ins_experience}
                                onChange={handleChange}
                                placeholder="e.g. 5 Years of Teaching Experience"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.ins_experience
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.ins_experience && (
                                <p className="text-xs text-red-500 mt-1">{errors.ins_experience}</p>
                            )}
                        </div>

                        {/* Biography */}
                        {/* <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Biography
                            </label>
                            <textarea
                                name="ins_bio"
                                value={formData.ins_bio}
                                onChange={handleChange}
                                placeholder="Write a short summary of background, skills, and specializations..."
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.ins_bio
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.ins_bio && (
                                <p className="text-xs text-red-500 mt-1">{errors.ins_bio}</p>
                            )}
                        </div> */}

                        {/* Biography */}
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Biography
                                </label>
                                <span className={`text-[11px] font-semibold transition-colors ${formData.ins_bio.length === 1000 ? "text-green-600" : "text-gray-400"
                                    }`}>
                                    {formData.ins_bio.length}/1000 characters
                                </span>
                            </div>
                            <textarea
                                name="ins_bio"
                                maxLength={1000}
                                value={formData.ins_bio}
                                onChange={handleChange}
                                placeholder="Write a short summary of background, skills, and specializations..."
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.ins_bio
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={loading}
                            />
                            {errors.ins_bio && (
                                <p className="text-xs text-red-500 mt-1">{errors.ins_bio}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Actions */}
                {/* was: className="flex justify-end gap-3 pt-6 border-t border-gray-100" — on narrow
                    phones the two buttons squeezed into one row with no room for "Save Instructor"'s
                    text, so it wrapped onto a second line inside the button (looked cut off / broken).
                    Now stacked full-width on phone (Cancel on top, Save below, both min-h-[44px] to
                    match this project's touch-target pattern), reopening to the original justify-end
                    inline row from sm: up where there's enough width for both. */}
                {/* was: Cancel first, Save second — on phone (stacked) that put Cancel on top.
                    Swapped so Save is first in source order = top on phone (primary action),
                    Cancel second = bottom on phone. sm:flex-row-reverse keeps desktop
                    left=Cancel, right=Save unchanged visually. */}
                <div className="flex flex-col sm:flex-row-reverse sm:justify-start gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded flex items-center justify-center gap-2 font-medium transition shadow disabled:opacity-50 cursor-pointer min-h-[44px] whitespace-nowrap"
                        disabled={loading}
                    >
                        <FiSave />
                        {/* {loading ? (activeEditingId ? "Updating..." : "Adding...") : (activeEditingId ? "Update Instructor" : "Save Instructor")} */}
                        {loading ? (activeEditingId ? "Submitting..." : "Submitting...") : (activeEditingId ? "Submit" : "Submit")}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 font-medium cursor-pointer min-h-[44px]"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                </div>

            </form>
        </div>
    );
};

export default UserForm;