import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiSave,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiUser,
} from "react-icons/fi";
import { X } from "lucide-react";
// import { getCurrentUser } from "../../utils/auth";

const validateEmail = (email) => {
  const val = (email || "").trim();
  const hasSpaces = /\s/;

  const emailRegex =
    /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._]{3,90}@([a-zA-Z-]+\.)+(com|org|net|info|tech|biz|name|pro|in|co\.in|us|uk|co\.uk|ca|au|nz|jp|cn|de|fr|edu|gov|ac\.in|edu\.in)$/;

  if (!val) return "Email is required";

  if (!emailRegex.test(val) || hasSpaces.test(val)) {
    return "Invalid email format";
  }

  if (val.length > 100) {
    return "Email must not exceed 100 characters";
  }

  return "";
};

const EmployeeForm = ({
  onCancel,
  onSuccess,
  editingEmployeeId,
}) => {
  const isEditing = Boolean(editingEmployeeId);

  const [formData, setFormData] = useState({
    user_full_name: "",
    username: "",
    user_email: "",
    user_mobile_no: "",
    user_password: "",
    user_qualification: "",
    user_postal_address: "",
    is_active: "1",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  // Load employee details for editing
  useEffect(() => {
    if (!editingEmployeeId) return;

    const loadEmployeeData = async () => {
      setFetchingData(true);

      try {
        const token = sessionStorage.getItem("token");

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/company/employees/${editingEmployeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success && response.data?.data) {
          const emp = response.data.data;

          setFormData({
            user_full_name: emp.user_full_name || emp.name || "",
            username: emp.username || "",
            user_email: emp.user_email || emp.email || "",
            user_mobile_no: emp.user_mobile_no || emp.phone || "",
            user_password: "",
            user_qualification: emp.user_qualification || "",
            user_postal_address: emp.user_postal_address || "",
            is_active: String(emp.is_active ?? "1"),
          });

          setRemovePhoto(false);

          if (emp.user_profile_photo) {
            setPhotoPreview(
              /^https?:\/\//i.test(emp.user_profile_photo)
                ? emp.user_profile_photo
                : `${import.meta.env.VITE_API_BASE_URL}${emp.user_profile_photo}`
            );
          } else {
            setPhotoPreview(null);
          }
        }
      } catch (err) {
        console.error("Error loading employee details:", err);
        toast.error("Failed to load employee details.");

        if (onCancel) onCancel();
      } finally {
        setFetchingData(false);
      }
    };

    loadEmployeeData();
  }, [editingEmployeeId]);

  // Validation
  const validate = () => {
    const tempErrors = {};
    const hasSpaces = /\s/;

    const normalizedFullName = formData.user_full_name
      .trim()
      .replace(/\s+/g, " ");

    // Full Name
    const nameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;

    if (!normalizedFullName) {
      tempErrors.user_full_name = "Full name is required";
    } else if (!nameRegex.test(normalizedFullName)) {
      tempErrors.user_full_name =
        "Name must contain only letters";
    } else if (
      normalizedFullName.length < 2 ||
      normalizedFullName.length > 30
    ) {
      tempErrors.user_full_name =
        "Name must be between 2 and 30 characters";
    }

    // Username
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;

    if (!formData.username.trim()) {
      tempErrors.username = "Username is required";
    } else if (hasSpaces.test(formData.username)) {
      tempErrors.username = "Username must not contain spaces";
    } else if (
      formData.username.length < 5 ||
      formData.username.length > 30
    ) {
      tempErrors.username =
        "Username must be between 5 and 30 characters";
    } else if (!usernameRegex.test(formData.username)) {
      tempErrors.username =
        "Username can only contain letters, numbers, underscores (_) and dots (.)";
    } else if (!/[a-zA-Z]/.test(formData.username)) {
      tempErrors.username =
        "Username must contain at least one letter";
    } else if (
      !/^[a-zA-Z0-9]/.test(formData.username) ||
      !/[a-zA-Z0-9]$/.test(formData.username)
    ) {
      tempErrors.username =
        "Username cannot start or end with an underscore or dot";
    }

    // Email
    const emailError = validateEmail(formData.user_email);

    if (emailError) {
      tempErrors.user_email = emailError;
    }

    // Mobile Number
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!formData.user_mobile_no.trim()) {
      tempErrors.user_mobile_no = "Mobile number is required";
    } else if (!mobileRegex.test(formData.user_mobile_no)) {
      if (!/^[6-9]/.test(formData.user_mobile_no)) {
        tempErrors.user_mobile_no =
          "Mobile number must start with 6, 7, 8, or 9";
      } else if (formData.user_mobile_no.length !== 10) {
        tempErrors.user_mobile_no =
          "Mobile number must be exactly 10 digits";
      } else {
        tempErrors.user_mobile_no =
          "Invalid mobile number format";
      }
    }

    // Password
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,20}$/;

    if (!isEditing && !formData.user_password) {
      tempErrors.user_password = "Password is required";
    } else if (formData.user_password) {
      if (hasSpaces.test(formData.user_password)) {
        tempErrors.user_password =
          "Password must not contain spaces";
      } else if (!passwordRegex.test(formData.user_password)) {
        tempErrors.user_password =
          "Must be 6-20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character";
      }
    }

    if (formData.user_qualification.length > 255) {
      tempErrors.user_qualification =
        "Qualification must not exceed 255 characters";
    }

    if (formData.user_postal_address.length > 255) {
      tempErrors.user_postal_address =
        "Postal address must not exceed 255 characters";
    }

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

  // Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "user_mobile_no") {
      const cleanDigits = value.replace(/\D/g, "");

      if (cleanDigits.length > 10) return;

      setFormData((prev) => ({
        ...prev,
        [name]: cleanDigits,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Photo Upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Please upload an image in PNG, JPG, JPEG, or WEBP format."
      );
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB.");
      e.target.value = "";
      return;
    }

    setProfilePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  // Remove Photo
  const handleRemovePhoto = (e) => {
    e.stopPropagation();

    setPhotoPreview(null);
    setProfilePhoto(null);
    setRemovePhoto(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      const payload = {
        ...formData,

        user_full_name: formData.user_full_name
          .trim()
          .replace(/\s+/g, " "),

        username: formData.username.trim(),

        user_email: formData.user_email.trim().toLowerCase(),

        user_mobile_no: formData.user_mobile_no.trim(),

        user_qualification: formData.user_qualification.trim(),

        user_postal_address: formData.user_postal_address.trim(),
      };

      const submitData = new FormData();

      Object.keys(payload).forEach((key) => {
        if (payload[key] !== undefined && payload[key] !== null) {
          submitData.append(key, payload[key]);
        }
      });

      if (profilePhoto) {
        submitData.append("user_profile_photo", profilePhoto);
      } else if (removePhoto) {
        submitData.append("remove_photo", "1");
      }

      let response;

      if (isEditing) {
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/company/employees/${editingEmployeeId}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/company/employees`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(
          response.data.message ||
          (isEditing
            ? "Employee updated successfully!"
            : "Employee created successfully!")
        );

        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("API error saving employee:", error);

      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to save employee.";

      toast.error(errMsg);

      // Field-specific backend errors
      if (errMsg.toLowerCase().includes("email already exists")) {
        setErrors((prev) => ({
          ...prev,
          user_email: "Email is already registered",
        }));
      }

      if (errMsg.toLowerCase().includes("username already exists")) {
        setErrors((prev) => ({
          ...prev,
          username: "Username is already taken",
        }));
      }

      if (
        errMsg.toLowerCase().includes("mobile number already exists")
      ) {
        setErrors((prev) => ({
          ...prev,
          user_mobile_no: "Mobile number is already registered",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (fetchingData) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
        <span className="ml-3 text-gray-600 font-medium">
          Loading employee data...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 w-full overflow-x-hidden">

      {/* Header */}
      <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600 cursor-pointer"
            title="Back to Employees"
          >
            <FiArrowLeft size={20} />
          </button>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? "Edit Employee" : "Add New Employee"}
            </h2>
            <p className="text-xs text-gray-500">
              Create employee login credentials and professional details
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="p-6 pb-10 space-y-6"
      >

        {/* Profile Photo */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">

          <div
            className="relative group cursor-pointer"
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center transition-all duration-200 group-hover:border-[#0E182B]">

              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Employee preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="text-slate-400" size={40} />
              )}

            </div>

            {photoPreview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={loading}
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
            <h4 className="font-semibold text-gray-700">
              Employee Avatar
            </h4>

            <p className="text-xs text-gray-500 mt-1">
              Upload a high-quality square picture. Supported formats:
              PNG, JPG, JPEG, or WEBP. Max file size: 2MB.
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
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>

                <span className={`text-[11px] font-semibold ${formData.user_full_name.length === 30
                  ? "text-green-600"
                  : "text-gray-400"
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
                  setFormData((prev) => ({
                    ...prev,
                    user_full_name: e.target.value
                      .trim()
                      .replace(/\s+/g, " "),
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
                <p className="text-xs text-red-500 mt-1">
                  {errors.user_full_name}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>

                <span className={`text-[11px] font-semibold ${formData.username.length === 30
                  ? "text-green-600"
                  : "text-gray-400"
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
                <p className="text-xs text-red-500 mt-1 leading-normal">
                  {errors.username}
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                  Letters, numbers, underscores (_) and dots (.) only.
                  Min 5 characters.
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Official Email <span className="text-red-500">*</span>
                </label>

                <span className={`text-[11px] font-semibold ${formData.user_email.length === 100
                  ? "text-green-600"
                  : "text-gray-400"
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

                  setFormData((prev) => ({
                    ...prev,
                    user_email: trimmedEmail,
                  }));

                  const errorMsg = validateEmail(trimmedEmail);

                  setErrors((prev) => ({
                    ...prev,
                    user_email: errorMsg,
                  }));
                }}
                placeholder="example@company.com"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${errors.user_email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                  }`}
                disabled={loading}
              />

              {errors.user_email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.user_email}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number (India) <span className="text-red-500">*</span>
                </label>

                <span className={`text-[11px] font-semibold ${formData.user_mobile_no.length === 10
                  ? "text-green-600"
                  : "text-gray-400"
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
                <p className="text-xs text-red-500 mt-1">
                  {errors.user_mobile_no}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password {!isEditing && (
                    <span className="text-red-500">*</span>
                  )}
                </label>

                <span className={`text-[11px] font-semibold ${formData.user_password.length === 20
                  ? "text-green-600"
                  : "text-gray-400"
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
                  {showPassword ? (
                    <FiEye size={16} />
                  ) : (
                    <FiEyeOff size={16} />
                  )}
                </button>
              </div>

              {errors.user_password ? (
                <p className="text-xs text-red-500 mt-1 leading-normal">
                  {errors.user_password}
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                  Min 6 characters, must include 1 uppercase, 1 lowercase,
                  1 number & 1 special character.
                  {isEditing && " Leave blank to keep the existing password."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Employee Details */}

        {/* Section 2: Employee Profile Details */}
        {/* <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] mb-4">
            2. Employee Profile Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Qualification
                </label>

                <span className="text-[11px] font-semibold text-gray-400">
                  {formData.user_qualification.length}/255 characters
                </span>
              </div>

              <input
                type="text"
                name="user_qualification"
                maxLength={255}
                value={formData.user_qualification}
                onChange={handleChange}
                placeholder="e.g. B.E. Computer Engineering"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                disabled={loading}
              />

              {errors.user_qualification && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.user_qualification}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Address
              </label>

              <textarea
                name="user_postal_address"
                rows={3}
                value={formData.user_postal_address}
                onChange={handleChange}
                placeholder="Enter employee's postal address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 resize-y"
                disabled={loading}
              />
            </div>

          </div>
        </div> */}


        {/* Section 3: Account Status */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] mb-4">
            3. Account Status
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Employee Account
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Active employees are permitted to sign in and view
                their assigned courses.
              </p>
            </div>

            <div className="flex gap-5 items-center">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="is_active"
                  value="1"
                  checked={formData.is_active === "1"}
                  onChange={handleChange}
                  disabled={loading}
                  className="accent-red-600"
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
                  className="accent-red-600"
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row-reverse sm:justify-start gap-3 pt-6 border-t border-gray-100">

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded flex items-center justify-center gap-2 font-medium transition shadow disabled:opacity-50 cursor-pointer min-h-[44px] whitespace-nowrap"
          >
            <FiSave />

            {loading
              ? "Submitting..."
              : "Submit"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 font-medium cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            <X size={18} />
            Cancel
          </button>

        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
