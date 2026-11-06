import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Save, X, Camera } from "lucide-react";

const getInitialFormData = (user) => ({
  user_full_name: user?.user_full_name || "",
  username: user?.username || "",
  user_email: user?.user_email || "",
  user_mobile_no: user?.user_mobile_no || "",
  address: user?.address || "",
  qualification: user?.qualification || "",
  experience: user?.experience || "",
  biography: user?.biography || ""
});

const ProfileEditModal = ({ user, isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(user));
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.user_profile_photo || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
  if (isOpen) {
    setFormData(getInitialFormData(user));
    setFormErrors({});
    setError("");
    setPhotoFile(null);
    setPhotoPreview(user?.user_profile_photo || null);
  }
}, [isOpen]);

  const isInstructor = user?.role_code === "INS";
  const isStudent = user?.role_code === "STD";

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "user_mobile_no"
      ? value.replace(/\D/g, "").slice(0, 10)
      : value;

    setFormData((current) => ({ ...current, [name]: nextValue }));
    setFormErrors((current) => ({ ...current, [name]: "" }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setFormData(getInitialFormData(user));
    setFormErrors({});
    setError("");
    setPhotoFile(null);
    setPhotoPreview(user?.user_profile_photo || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const normalizeText = (value) => {
    return value?.replace(/\s+/g, " ").trim() || "";
  };

  const validateForm = () => {
    const errors = {};
    const fullName = normalizeText(formData.user_full_name);
    const username = formData.username.trim();
    const email = formData.user_email.trim();
    const mobile = formData.user_mobile_no.trim();
    const emailRegex =
      /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._]{3,90}@([a-zA-Z-]+\.)+(com|org|net|info|tech|biz|name|pro|in|co\.in|us|uk|co\.uk|ca|au|nz|jp|cn|de|fr|edu|gov|ac\.in|edu\.in)$/;

    if (!fullName) {
      errors.user_full_name = "Full name is required";
    } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(fullName)) {
      errors.user_full_name = "Name must contain only letters";
    } else if (fullName.length < 2 || fullName.length > 50) {
      errors.user_full_name = "Name must be between 2 and 50 characters";
    }

    if (!username) {
      errors.username = "Username is required";
    } else if (username.length < 5 || username.length > 30) {
      errors.username = "Username must be between 5 and 30 characters";
    } else if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      errors.username = "Username can contain only letters, numbers, underscores, and dots";
    }

    if (!email) {
      errors.user_email = "Email is required";
    } else if (!emailRegex.test(email) || /\s/.test(email)) {
      errors.user_email = "Enter a valid email address";
    }

    if (!mobile) {
      errors.user_mobile_no = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      if (!/^[6-9]/.test(mobile)) {
        errors.user_mobile_no = "Mobile number must start with 6, 7, 8, or 9";
      } else if (mobile.length !== 10) {
        errors.user_mobile_no = "Mobile number must be exactly 10 digits";
      } else {
        errors.user_mobile_no = "Invalid mobile number format";
      }
    }
    if (formData.address.length > 200) {
      errors.address = "Postal address must not exceed 255 characters";
    }

    if (formData.qualification.length > 200) {
      errors.qualification = "Qualification must not exceed 255 characters";
    }

    if (formData.experience.length > 200) {
      errors.experience = "Experience must not exceed 255 characters";
    }

    if (formData.biography.length > 1000) {
      errors.biography = "Biography must not exceed 1000 characters";
    }

    return errors;
  };

  const setServerFieldErrors = (message) => {
    const nextErrors = {};

    if (message.includes("Email")) {
      nextErrors.user_email = message;
    }

    if (message.includes("Mobile number")) {
      nextErrors.user_mobile_no = message;
    }

    if (message.includes("Username")) {
      nextErrors.username = message;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors((current) => ({ ...current, ...nextErrors }));
      return true;
    }

    return false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationErrors = validateForm();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);

    const normalizedFullName = normalizeText(formData.user_full_name);
    const normalizedUsername = formData.username.trim();
    const normalizedEmail = formData.user_email.trim();
    const normalizedMobile = formData.user_mobile_no.trim();
    const normalizedAddress = normalizeText(formData.address);
    const normalizedQualification = normalizeText(formData.qualification);
    const normalizedExperience = normalizeText(formData.experience);
    const normalizedBiography = formData.biography?.trim() || "";

    // Sync state with trimmed values
    setFormData((prev) => ({
      ...prev,
      user_full_name: normalizedFullName,
      username: normalizedUsername,
      user_email: normalizedEmail,
      user_mobile_no: normalizedMobile,
      address: normalizedAddress,
      qualification: normalizedQualification,
      experience: normalizedExperience,
      biography: normalizedBiography
    }));

    try {
      const token = sessionStorage.getItem("token");
      const formDataPayload = new FormData();

      formDataPayload.append("user_full_name", normalizedFullName);
      formDataPayload.append("username", normalizedUsername);
      formDataPayload.append("user_email", normalizedEmail);
      formDataPayload.append("user_mobile_no", normalizedMobile);

      if (isStudent) {
        formDataPayload.append("address", normalizedAddress);
      }

      if (isInstructor) {
        formDataPayload.append("qualification", normalizedQualification);
        formDataPayload.append("experience", normalizedExperience);
        formDataPayload.append("biography", normalizedBiography);
      }

      if (photoFile) {
        formDataPayload.append("user_profile_photo", photoFile);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
        formDataPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      sessionStorage.setItem("token", response.data.token);
      if (response.data.user) {
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
      }
      window.dispatchEvent(new Event("authChanged"));
      onSaved();
    } catch (requestError) {
      const serverMessage = requestError.response?.data?.message ||
        "Unable to update your profile. Please try again.";

      if (!setServerFieldErrors(serverMessage)) {
        setError(serverMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1E2A4A]">Edit Profile</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 cursor-pointer"
            aria-label="Close edit profile"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-white shadow-sm">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <div className="text-2xl font-semibold text-gray-500">
                  {user?.user_full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-700">Profile photo</p>
              <p className="mt-1">Choose a new image to replace your current profile photo.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-3 block w-full text-sm text-gray-500 file:mr-3 file:rounded-full file:border-0 file:bg-[#1E2A4A] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#27395f]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Previous */}
            {/* <label className="text-sm font-medium text-gray-600">
              Full Name <span className="text-red-500">*</span>
              <input
                name="user_full_name"
                value={formData.user_full_name}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    user_full_name: normalizeText(e.target.value)
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />
              {formErrors.user_full_name && <p className="mt-1 text-sm font-normal text-red-500">{formErrors.user_full_name}</p>}
            </label> */}

            <label className="text-sm font-medium text-gray-600">
              <div className="flex justify-between items-center">
                <span>
                  Full Name <span className="text-red-500">*</span>
                </span>

                <span
                  className={`text-[11px] font-semibold ${formData.user_full_name.length === 30
                    ? "text-green-600"
                    : "text-gray-400"
                    }`}
                >
                  {formData.user_full_name.length}/30 characters
                </span>
              </div>

              <input
                name="user_full_name"
                maxLength={30}
                value={formData.user_full_name}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    user_full_name: normalizeText(e.target.value)
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />

              {formErrors.user_full_name && (
                <p className="mt-1 text-sm font-normal text-red-500">
                  {formErrors.user_full_name}
                </p>
              )}
            </label>

            {/* Previous */}
            {/* <label className="text-sm font-medium text-gray-600">
              Username <span className="text-red-500">*</span>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value.trim()
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />
              {formErrors.username && <p className="mt-1 text-sm font-normal text-red-500">{formErrors.username}</p>}
            </label> */}

            <label className="text-sm font-medium text-gray-600">
              <div className="flex justify-between items-center">
                <span>
                  Username <span className="text-red-500">*</span>
                </span>

                <span
                  className={`text-[11px] font-semibold ${formData.username.length === 30
                    ? "text-green-600"
                    : "text-gray-400"
                    }`}
                >
                  {formData.username.length}/30 characters
                </span>
              </div>

              <input
                name="username"
                maxLength={30}
                value={formData.username}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value.trim()
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />

              {formErrors.username && (
                <p className="mt-1 text-sm font-normal text-red-500">
                  {formErrors.username}
                </p>
              )}
            </label>

            {/* Previous */}
            {/* <label className="text-sm font-medium text-gray-600">
              Email <span className="text-red-500">*</span>
              <input
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    user_email: e.target.value.trim()
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />
              {formErrors.user_email && <p className="mt-1 text-sm font-normal text-red-500">{formErrors.user_email}</p>}
            </label> */}

            <label className="text-sm font-medium text-gray-600">
              <div className="flex justify-between items-center">
                <span>
                  Email <span className="text-red-500">*</span>
                </span>

                <span
                  className={`text-[11px] font-semibold ${formData.user_email.length === 100
                    ? "text-green-600"
                    : "text-gray-400"
                    }`}
                >
                  {formData.user_email.length}/100 characters
                </span>
              </div>

              <input
                name="user_email"
                maxLength={100}
                value={formData.user_email}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    user_email: e.target.value.trim()
                  }))
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />

              {formErrors.user_email && (
                <p className="mt-1 text-sm font-normal text-red-500">
                  {formErrors.user_email}
                </p>
              )}
            </label>

            {/* <label className="text-sm font-medium text-gray-600">
              Mobile <span className="text-red-500">*</span>
              <input
                name="user_mobile_no"
                value={formData.user_mobile_no}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    user_mobile_no: e.target.value.trim()
                  }))
                }
                inputMode="numeric"
                maxLength={10}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />
              {formErrors.user_mobile_no && <p className="mt-1 text-sm font-normal text-red-500">{formErrors.user_mobile_no}</p>}
            </label> */}

            <label className="text-sm font-medium text-gray-600">
              <div className="flex justify-between items-center">
                <span>
                  Mobile <span className="text-red-500">*</span>
                </span>

                <span
                  className={`text-[11px] font-semibold ${formData.user_mobile_no.length === 10
                    ? "text-green-600"
                    : "text-gray-400"
                    }`}
                >
                  {formData.user_mobile_no.length}/10 digits
                </span>
              </div>

              <input
                name="user_mobile_no"
                value={formData.user_mobile_no}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    user_mobile_no: e.target.value.trim()
                  }))
                }
                inputMode="numeric"
                maxLength={10}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />

              {formErrors.user_mobile_no && (
                <p className="mt-1 text-sm font-normal text-red-500">
                  {formErrors.user_mobile_no}
                </p>
              )}
            </label>
          </div>

          {isStudent && (
            // Previous
            // <label className="block text-sm font-medium text-gray-600">
            //   Postal Address
            //   <textarea
            //     name="address"
            //     value={formData.address}
            //     onChange={handleChange}
            //     onBlur={(e) =>
            //       setFormData((prev) => ({
            //         ...prev,
            //         address: normalizeText(e.target.value)
            //       }))
            //     }
            //     rows={3}
            //     className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
            //   />
            // </label>

            <label className="block text-sm font-medium text-gray-600">
              <div className="flex justify-between items-center">
                <span>Postal Address</span>

                <span
                  className={`text-[11px] font-semibold ${formData.address.length === 200
                      ? "text-green-600"
                      : "text-gray-400"
                    }`}
                >
                  {formData.address.length}/200 characters
                </span>
              </div>

              <textarea
                name="address"
                maxLength={200}
                value={formData.address}
                onChange={handleChange}
                onBlur={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: normalizeText(e.target.value)
                  }))
                }
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
              />

              {formErrors.address && (
                <p className="mt-1 text-sm font-normal text-red-500">
                  {formErrors.address}
                </p>
              )}
            </label>
          )}

          {isInstructor && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Previous */}
                {/* <label className="text-sm font-medium text-gray-600">
                  Qualification
                  <input
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    onBlur={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualification: normalizeText(e.target.value)
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
                  />
                </label> */}

                <label className="text-sm font-medium text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Qualification</span>

                    <span
                      className={`text-[11px] font-semibold ${formData.qualification.length === 200
                        ? "text-green-600"
                        : "text-gray-400"
                        }`}
                    >
                      {formData.qualification.length}/200 characters
                    </span>
                  </div>

                  <input
                    name="qualification"
                    maxLength={200}
                    value={formData.qualification}
                    onChange={handleChange}
                    onBlur={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        qualification: normalizeText(e.target.value)
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
                  />

                  {formErrors.qualification && (
                    <p className="mt-1 text-sm font-normal text-red-500">
                      {formErrors.qualification}
                    </p>
                  )}
                </label>

                {/* Previous */}
                {/* <label className="text-sm font-medium text-gray-600">
                  Experience
                  <input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    onBlur={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experience: normalizeText(e.target.value)
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
                  />
                </label> */}

                <label className="text-sm font-medium text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Experience</span>

                    <span
                      className={`text-[11px] font-semibold ${formData.experience.length === 200
                        ? "text-green-600"
                        : "text-gray-400"
                        }`}
                    >
                      {formData.experience.length}/200 characters
                    </span>
                  </div>

                  <input
                    name="experience"
                    maxLength={200}
                    value={formData.experience}
                    onChange={handleChange}
                    onBlur={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experience: normalizeText(e.target.value)
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
                  />

                  {formErrors.experience && (
                    <p className="mt-1 text-sm font-normal text-red-500">
                      {formErrors.experience}
                    </p>
                  )}
                </label>
              </div>

              {/* Previous */}
              {/* <label className="block text-sm font-medium text-gray-600">
                Biography
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  onBlur={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      biography: e.target.value.trim()
                    }))
                  }
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
                />
              </label> */}

              <label className="block text-sm font-medium text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Biography</span>

                  <span
                    className={`text-[11px] font-semibold ${formData.biography.length === 1000
                      ? "text-green-600"
                      : "text-gray-400"
                      }`}
                  >
                    {formData.biography.length}/1000 characters
                  </span>
                </div>

                <textarea
                  name="biography"
                  maxLength={1000}
                  value={formData.biography}
                  onChange={handleChange}
                  onBlur={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      biography: e.target.value.trim()
                    }))
                  }
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#7B3B5C]"
                />

                {formErrors.biography && (
                  <p className="mt-1 text-sm font-normal text-red-500">
                    {formErrors.biography}
                  </p>
                )}
              </label>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              // className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition cursor-pointer font-medium shadow-xs"
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 px-4 py-2 transition cursor-pointer font-medium shadow-xs"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#1E2A4A] px-4 py-2 text-white hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              <Save size={18} />
              {/* {isSaving ? "Saving..." : "Save Changes"} */}
              {isSaving ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
