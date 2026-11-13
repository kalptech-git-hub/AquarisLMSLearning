import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiUserPlus, FiArrowLeft, FiX } from "react-icons/fi";

import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../lander/Navbar";
import Footer from "../lander/Footer";

const Register = () => {

    const navigate = useNavigate();

    // const [name, setName] = useState("");
    // const [mobileNo, setMobileNo] = useState("");
    // const [username, setUsername] = useState("");
    // const [email, setEmail] = useState("");
    // const [password, setPassword] = useState("");
    // const [profilePhoto, setProfilePhoto] = useState(null);

    const [formData, setFormData] = useState({
        user_full_name: "",
        user_mobile_no: "",
        username: "",
        user_email: "",
        user_password: "",
        user_profile_photo: null,
    });

    const [formErrors, setFormErrors] = useState({});

    const [showPassword, setShowPassword] = useState(false);


    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    const handleRemovePhoto = () => {
        setFormData(prev => ({
            ...prev,
            user_profile_photo: null
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setFormErrors(prev => ({
            ...prev,
            user_profile_photo: ""
        }));
    };

    // const handleRegister = async (e) => {

    //     e.preventDefault();

    //     const newErrors = {};

    //     if (!name.trim()) {
    //         newErrors.name = "Name is required";
    //     }

    //     if (!mobileNo.trim()) {
    //         newErrors.mobileNo = "Mobile number is required";
    //     }

    //     if (!username.trim()) {
    //         newErrors.username = "Username is required";
    //     } else if (username.length < 5) {
    //         newErrors.username = "Username must be at least 5 characters";
    //     }

    //     if (!email.trim()) {
    //         newErrors.email = "Email is required";
    //     } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    //         newErrors.email = "Enter valid email";
    //     }

    //     // if (!password.trim()) {
    //     //     newErrors.password = "Password is required";
    //     // } else if (password.length < 6) {
    //     //     newErrors.password = "Password must be at least 6 characters";
    //     // }

    //     const passwordRegex =
    //         /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,20}$/;

    //     if (!password.trim()) {
    //         newErrors.password = "Password is required";
    //     } else if (!passwordRegex.test(password)) {
    //         newErrors.password =
    //             "Password must contain uppercase, lowercase, number and special character";
    //     }

    //     setErrors(newErrors);

    //     if (Object.keys(newErrors).length > 0) {
    //         return;
    //     }

    //     setIsSubmitting(true);

    //     try {

    //         const res = await fetch(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/users/register`,
    //             {
    //                 method: "POST",
    //                 body: formData,
    //                 // body: JSON.stringify({
    //                 //     user_full_name: name,
    //                 //     user_mobile_no: mobileNo,
    //                 //     username,
    //                 //     user_email: email,
    //                 //     user_password: password,
    //                 // }),

    //             }
    //         );

    //         const formData = new FormData();

    //         formData.append("user_full_name", name);
    //         formData.append("user_mobile_no", mobileNo);
    //         formData.append("username", username);
    //         formData.append("user_email", email);
    //         formData.append("user_password", password);

    //         if (profilePhoto) {
    //             formData.append("profilePhoto", profilePhoto);
    //         }

    //         const data = await res.json();

    //         if (!res.ok) {

    //             // toast.error(data.message || "Registration failed");
    //             toast.error(data.error || data.message || "Registration failed");

    //             return;
    //         }

    //         toast.success("Registration successful!");

    //         navigate("/");

    //     } catch (error) {

    //         console.error(error);

    //         toast.error("Something went wrong");

    //     } finally {

    //         setIsSubmitting(false);

    //     }
    // };

    const validateForm = () => {

        const errors = {};

        // Full Name
        const hasSpaces = /\s/;

        const normalizedFullName = formData.user_full_name
            .trim()
            .replace(/\s+/g, " ");

        const nameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;

        if (!normalizedFullName) {
            errors.user_full_name = "Full name is required";
        }
        else if (!nameRegex.test(normalizedFullName)) {
            errors.user_full_name = "Name must contain only letters";
        }
        else if (
            normalizedFullName.length < 2 ||
            normalizedFullName.length > 50
        ) {
            errors.user_full_name =
                "Name must be between 2 and 50 characters";
        }

        // Mobile Number
        const mobileRegex = /^[6-9]\d{9}$/;

        if (!formData.user_mobile_no.trim()) {

            errors.user_mobile_no =
                "Mobile number is required";

        }
        else if (!mobileRegex.test(formData.user_mobile_no)) {

            if (!/^[6-9]/.test(formData.user_mobile_no)) {

                errors.user_mobile_no =
                    "Mobile number must start with 6, 7, 8, or 9";

            }
            else if (formData.user_mobile_no.length !== 10) {

                errors.user_mobile_no =
                    "Mobile number must be exactly 10 digits";

            }
            else {

                errors.user_mobile_no =
                    "Invalid mobile number format";

            }

        }

        // Username
        const usernameRegex = /^[a-zA-Z0-9_.]+$/;

        if (!formData.username.trim()) {
            errors.username = "Username is required";
        }
        else if (hasSpaces.test(formData.username)) {
            errors.username = "Username must not contain spaces";
        }
        else if (
            formData.username.length < 5 ||
            formData.username.length > 30
        ) {
            errors.username =
                "Username must be between 5 and 30 characters";
        }
        else if (!usernameRegex.test(formData.username)) {
            errors.username =
                "Username can only contain letters, numbers, underscores (_), and dots (.)";
        }
        else if (!/[a-zA-Z]/.test(formData.username)) {
            errors.username =
                "Username must contain at least one letter";
        }
        else if (
            !/^[a-zA-Z0-9]/.test(formData.username) ||
            !/[a-zA-Z0-9]$/.test(formData.username)
        ) {
            errors.username =
                "Username cannot start or end with an underscore (_) or dot (.)";
        }

        // Email
        const emailRegex =
            /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._]{3,90}@([a-zA-Z-]+\.)+(com|org|net|info|tech|biz|name|pro|in|co\.in|us|uk|co\.uk|ca|au|nz|jp|cn|de|fr|edu|gov|ac\.in|edu\.in)$/;

        if (!formData.user_email.trim()) {
            errors.user_email = "Email is required";
        }
        else if (
            !emailRegex.test(formData.user_email) ||
            hasSpaces.test(formData.user_email)
        ) {
            errors.user_email = "Invalid email format";
        }
        else if (formData.user_email.length > 100) {
            errors.user_email =
                "Email must not exceed 100 characters";
        }

        // Password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,20}$/;

        if (!formData.user_password) {
            errors.user_password = "Password is required";
        }
        else if (hasSpaces.test(formData.user_password)) {
            errors.user_password =
                "Password must not contain spaces";
        }
        else if (!passwordRegex.test(formData.user_password)) {
            errors.user_password =
                "Must be 6-20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character";
        }

        // Profile Photo (Optional)
        if (formData.user_profile_photo) {

            const allowedImageTypes = [

                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/webp"

            ];

            if (
                !allowedImageTypes.includes(
                    formData.user_profile_photo.type
                )
            ) {

                errors.user_profile_photo =
                    "Only JPG, JPEG, PNG and WEBP images are allowed";

            }

            if (
                formData.user_profile_photo.size >
                2 * 1024 * 1024
            ) {

                errors.user_profile_photo =
                    "Image must be under 2 MB";

            }

        }

        return errors;

    };

    // const handleChange = (e) => {

    //     const { name, value, files } = e.target;

    //     setFormData({

    //         ...formData,

    //         [name]: files
    //             ? files[0]
    //             : value

    //     });

    //     setFormErrors({

    //         ...formErrors,

    //         [name]: ""

    //     });

    // };


    /* New version - which will handle mobile no validations as well. */
    const handleChange = (e) => {

        const { name, value, files } = e.target;

        // Handle file input
        if (files) {

            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));

            setFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));

            return;

        }

        // Mobile Number
        if (name === "user_mobile_no") {

            const cleanDigits = value.replace(/\D/g, "");

            if (cleanDigits.length > 10) return;

            setFormData(prev => ({
                ...prev,
                [name]: cleanDigits
            }));

            if (formErrors[name]) {

                setFormErrors(prev => ({
                    ...prev,
                    [name]: ""
                }));

            }

            return;

        }

        // Other fields
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {

            setFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));

        }

    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const errors = validateForm();

        if (Object.keys(errors).length > 0) {

            setFormErrors(errors);

            return;

        }


        try {

            setIsSubmitting(true);

            // const token = sessionStorage.getItem("token");

            const form = new FormData();

            form.append(
                "user_full_name",
                formData.user_full_name
            );

            form.append(
                "user_mobile_no",
                formData.user_mobile_no
            );

            form.append(
                "username",
                formData.username
            );

            form.append(
                "user_email",
                formData.user_email
            );

            form.append(
                "user_password",
                formData.user_password
            );

            if (formData.user_profile_photo) {

                form.append(
                    "user_profile_photo",
                    formData.user_profile_photo
                );

            }

            const response = await axios.post(

                `${import.meta.env.VITE_API_BASE_URL}/api/users/register`,

                form,

                {
                    headers: {
                        // Authorization: `Bearer ${token}`
                    }
                }

            );

            if (response.data.success) {

                toast.success(response.data.message);

                navigate("/");

            }

        } catch (error) {

            console.log(error);

            toast.error(

                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Registration failed"

            );

        } finally {

            setIsSubmitting(false);

        }

    };


    return (
        // bg-gradient-to-br from-red-50 via-white to-orange-50
        // <div className="p-2 relative">

        //     {/* Back */}
        //     {/* <button
        //         type="button"
        //         onClick={() => navigate("/")}
        //         className="absolute top-10 left-6 sm:left-10 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 cursor-pointer w-fit z-10"
        //     >
        //     <FiArrowLeft size={16} />
        //         Back
        //     </button> */}

        //     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

        //         <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        //             {/* LEFT SIDE - FORM */}
        //             <div className="p-8 lg:p-10 flex flex-col justify-center">

        //                 {/* Icon */}
        //                 <div className="flex justify-center lg:justify-start mb-6">

        //                     <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">

        //                         <FiUserPlus className="text-2xl text-red-500" />

        //                     </div>

        //                 </div>

        //                 {/* Heading */}
        //                 <h2 className="text-4xl font-bold text-gray-800 mb-1 text-center lg:text-left">
        //                     Create Account
        //                 </h2>

        //                 <p className="text-gray-500 mb-5 text-center lg:text-left">
        //                     Start your Japanese learning journey today.
        //                 </p>

        //                 {/* FORM */}
        //                 <form
        //                     onSubmit={handleRegister}
        //                     className="space-y-5"
        //                 >

        //                     {/*Full Name */}
        //                     <div>

        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Full Name <span className="text-red-500">*</span>
        //                         </label>

        //                         <input
        //                             type="text"
        //                             name="user_full_name"
        //                             maxLength={50}
        //                             placeholder="Enter your full name"
        //                             value={formData.user_full_name}
        //                             onChange={handleChange}

        //                             onBlur={(e) =>
        //                                 setFormData(prev => ({
        //                                     ...prev,
        //                                     user_full_name: e.target.value
        //                                         .trim()
        //                                         .replace(/\s+/g, " ")
        //                                 }))
        //                             }

        //                             // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
        //                             // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.user_full_name ? "border-red-500" : "border-gray-300"
        //                             //     } disabled:bg-gray-200 disabled:cursor-not-allowed`}

        //                             className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}


        //                         />

        //                         {formErrors.user_full_name && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_full_name}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500">
        //                             {formData.user_full_name.length}/50 characters
        //                         </p>

        //                     </div>

        //                     {/* Mobile no. */}
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Mobile Number <span className="text-red-500">*</span>
        //                         </label>

        //                         <input
        //                             type="tel"
        //                             name="user_mobile_no"
        //                             maxLength={10}
        //                             value={formData.user_mobile_no}
        //                             onChange={handleChange}
        //                             placeholder="Enter mobile number"
        //                             // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
        //                             // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.user_mobile_no ? "border-red-500" : "border-gray-300"
        //                             //     } disabled:bg-gray-200 disabled:cursor-not-allowed`}

        //                             className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}


        //                         />

        //                         {formErrors.user_mobile_no && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_mobile_no}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500">
        //                             {formData.user_mobile_no.length}/10 numbers
        //                         </p>
        //                     </div>

        //                     {/* Username */}
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Username <span className="text-red-500">*</span>
        //                             <span className="text-xs font-normal text-gray-400 ml-1">
        //                                 (Use Letters, numbers, underscores (_) and dots (.) only)
        //                             </span>
        //                         </label>

        //                         <input
        //                             type="text"
        //                             name="username"
        //                             maxLength={50}
        //                             value={formData.username}
        //                             onChange={handleChange}
        //                             placeholder="Enter username"
        //                             // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.username ? "border-red-500" : "border-gray-300"} disabled:bg-gray-200 disabled:cursor-not-allowed`}
        //                             className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}

        //                         />

        //                         {formErrors.username && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.username}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500 text-left">
        //                             {formData.username.length}/50
        //                         </p>
        //                     </div>
        //                     {/* Email */}
        //                     <div>

        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Email <span className="text-red-500">*</span>
        //                         </label>

        //                         <input
        //                             name="user_email"
        //                             maxLength={100}
        //                             type="email"
        //                             value={formData.user_email}
        //                             onChange={handleChange}
        //                             // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
        //                             className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}
        //                             // ${formErrors.user_email ? "border-red-500" : "border-gray-300"} disabled:bg-gray-200 disabled:cursor-not-allowed

        //                             placeholder="Enter your email"
        //                         />

        //                         {formErrors.user_email && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_email}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500">
        //                             {formData.user_email.length}/100 characters
        //                         </p>


        //                     </div>

        //                      <div>
        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Profile Photo (Optional)
        //                             <span className="text-xs font-normal text-gray-400 ml-1">
        //                                 (JPG, JPEG, PNG, WEBP only, max 2 MB)
        //                             </span>
        //                         </label>

        //                         <div className="mt-2 flex items-center gap-3">
        //                             <input
        //                                 ref={fileInputRef}
        //                                 type="file"
        //                                 name="user_profile_photo"
        //                                 id="user_profile_photo"
        //                                 accept="image/jpeg,image/png,image/jpg,image/webp"
        //                                 onChange={handleChange}
        //                                 className="hidden"
        //                             />
        //                             <label
        //                                 htmlFor="user_profile_photo"
        //                                 className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium cursor-pointer transition select-none"
        //                             >
        //                                 Choose File
        //                             </label>
        //                             {formData.user_profile_photo ? (
        //                                 <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
        //                                     <span className="text-xs font-medium text-gray-600 max-w-[200px] truncate">
        //                                         {formData.user_profile_photo.name || "Photo Selected"}
        //                                     </span>
        //                                     <button
        //                                         type="button"
        //                                         onClick={handleRemovePhoto}
        //                                         className="text-red-500 hover:text-red-700 font-bold p-0.5 transition cursor-pointer flex items-center justify-center rounded-md hover:bg-red-50"
        //                                     >
        //                                         <FiX size={14} />
        //                                     </button>
        //                                 </div>
        //                             ) : (
        //                                 <span className="text-xs text-gray-400">No file chosen</span>
        //                             )}
        //                         </div>

        //                          {formErrors.user_profile_photo && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_profile_photo}
        //                             </p>
        //                         )}

        //                         </div>

        //                     {/* Password */}
        //                     <div>

        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Password <span className="text-red-500">*</span>
        //                         </label>

        //                         <div className="relative">

        //                             <input
        //                                 type={showPassword ? "text" : "password"}
        //                                 name="user_password"
        //                                 maxLength={20}
        //                                 value={formData.user_password}
        //                                 onChange={handleChange}
        //                                 className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1"
        //                                 placeholder="Enter password"
        //                             />

        //                             <button
        //                                 type="button"
        //                                 onClick={() => setShowPassword(!showPassword)}
        //                                 className="absolute inset-y-0 right-0 px-4 text-gray-500 cursor-pointer"
        //                             >

        //                                 {showPassword
        //                                     ? <FaEye />
        //                                     : <FaEyeSlash />}

        //                             </button>

        //                         </div>

        //                         {formErrors.user_password && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_password}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500">
        //                             {formData.user_password.length}/20 characters
        //                         </p>

        //                     </div>

        //                     {/* Submit */}
        //                     <button
        //                         type="submit"
        //                         disabled={isSubmitting}
        //                         className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2c024d] to-[#f75c39] text-white font-semibold shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        //                         {isSubmitting
        //                             ? "Creating Account..."
        //                             : "Register"}

        //                     </button>

        //                     {/* Login */}
        //                     <p className="text-center text-sm text-gray-600">

        //                         Already have an account?{" "}

        //                         <button
        //                             type="button"
        //                             // onClick={() => navigate("/login")}
        //                             onClick={() => navigate("/login", { replace: true })}
        //                             className="text-blue-700 hover:underline cursor-pointer"
        //                         >
        //                             Login
        //                         </button>

        //                     </p>

        //                 </form>

        //             </div>

        //             {/* RIGHT SIDE - ILLUSTRATION */}
        //             <div className="hidden lg:flex relative bg-gradient-to-br from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] items-center justify-center p-10 overflow-hidden">

        //                 {/* Background circles */}
        //                 <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-10 -left-10"></div>

        //                 <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-24 -right-20"></div>

        //                 {/* Content */}
        //                 <div className="relative z-10 text-center text-white">

        //                     <img
        //                         src="\LearningIcon.png"
        //                         alt="Japanese Learning"
        //                         className="w-80 mx-auto drop-shadow-2xl"
        //                     />

        //                     <h3 className="text-4xl font-bold mt-8 mb-4">
        //                         Learn Japanese
        //                     </h3>

        //                     <p className="text-lg text-red-100 leading-relaxed max-w-md">
        //                         Master Hiragana, Katakana, Kanji, grammar, and speaking
        //                         skills with immersive interactive lessons.
        //                     </p>

        //                 </div>

        //             </div>

        //         </div>

        //     </div>
        // </div>

        // <div className="min-h-screen flex flex-col p-4 sm:p-8 md:p-12 lg:p-20">

        //     <Navbar />
        //     {/* Back */}
        //     {/* <button
        //         type="button"
        //         onClick={() => navigate("/")}
        //         className="absolute top-10 left-6 sm:left-10 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 cursor-pointer w-fit z-10"
        //     >
        //     <FiArrowLeft size={16} />
        //         Back
        //     </button> */}

        //     <div className="flex-1 flex items-center justify-center py-10 pt-24">
        //         <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        //             {/* LEFT SIDE - FORM */}
        //             <div className="p-8 lg:p-10 flex flex-col justify-center">

        //                 {/* Icon */}
        //                 <div className="flex justify-center lg:justify-start mb-6">

        //                     <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">

        //                         <FiUserPlus className="text-2xl text-red-500" />

        //                     </div>

        //                 </div>

        //                 {/* Heading */}
        //                 <h2 className="text-4xl font-bold text-gray-800 mb-1 text-center lg:text-left">
        //                     Create Account
        //                 </h2>

        //                 <p className="text-gray-500 mb-5 text-center lg:text-left">
        //                     Start your Japanese learning journey today.
        //                 </p>

        //                 {/* FORM */}
        //                 <form
        //                     onSubmit={handleRegister}
        //                     className="space-y-5"
        //                 >

        //                     {/*Full Name */}
        //                     <div>

        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Full Name <span className="text-red-500">*</span>
        //                         </label>

        //                         <input
        //                             type="text"
        //                             name="user_full_name"
        //                             maxLength={50}
        //                             placeholder="Enter your full name"
        //                             value={formData.user_full_name}
        //                             onChange={handleChange}

        //                             onBlur={(e) =>
        //                                 setFormData(prev => ({
        //                                     ...prev,
        //                                     user_full_name: e.target.value
        //                                         .trim()
        //                                         .replace(/\s+/g, " ")
        //                                 }))
        //                             }

        //                             // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
        //                             // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.user_full_name ? "border-red-500" : "border-gray-300"
        //                             //     } disabled:bg-gray-200 disabled:cursor-not-allowed`}

        //                             className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}


        //                         />

        //                         {formErrors.user_full_name && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_full_name}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500">
        //                             {formData.user_full_name.length}/50 characters
        //                         </p>

        //                     </div>

        //                     {/* Mobile no. */}
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Mobile Number <span className="text-red-500">*</span>
        //                         </label>

        //                         <input
        //                             type="tel"
        //                             name="user_mobile_no"
        //                             maxLength={10}
        //                             value={formData.user_mobile_no}
        //                             onChange={handleChange}
        //                             placeholder="Enter mobile number"
        //                             // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
        //                             // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.user_mobile_no ? "border-red-500" : "border-gray-300"
        //                             //     } disabled:bg-gray-200 disabled:cursor-not-allowed`}

        //                             className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}


        //                         />

        //                         {formErrors.user_mobile_no && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_mobile_no}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500">
        //                             {formData.user_mobile_no.length}/10 numbers
        //                         </p>
        //                     </div>

        //                     {/* Username */}
        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Username <span className="text-red-500">*</span>
        //                             <span className="text-xs font-normal text-gray-400 ml-1">
        //                                 (Use Letters, numbers, underscores (_) and dots (.) only)
        //                             </span>
        //                         </label>

        //                         <input
        //                             type="text"
        //                             name="username"
        //                             maxLength={50}
        //                             value={formData.username}
        //                             onChange={handleChange}
        //                             placeholder="Enter username"
        //                             // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.username ? "border-red-500" : "border-gray-300"} disabled:bg-gray-200 disabled:cursor-not-allowed`}
        //                             className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}

        //                         />

        //                         {formErrors.username && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.username}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500 text-left">
        //                             {formData.username.length}/50
        //                         </p>
        //                     </div>
        //                     {/* Email */}
        //                     <div>

        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Email <span className="text-red-500">*</span>
        //                         </label>

        //                         <input
        //                             name="user_email"
        //                             maxLength={100}
        //                             type="email"
        //                             value={formData.user_email}
        //                             onChange={handleChange}
        //                             // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
        //                             className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}
        //                             // ${formErrors.user_email ? "border-red-500" : "border-gray-300"} disabled:bg-gray-200 disabled:cursor-not-allowed

        //                             placeholder="Enter your email"
        //                         />

        //                         {formErrors.user_email && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_email}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500">
        //                             {formData.user_email.length}/100 characters
        //                         </p>


        //                     </div>

        //                     <div>
        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Profile Photo (Optional)
        //                             <span className="text-xs font-normal text-gray-400 ml-1">
        //                                 (JPG, JPEG, PNG, WEBP only, max 2 MB)
        //                             </span>
        //                         </label>

        //                         <div className="mt-2 flex items-center gap-3">
        //                             <input
        //                                 ref={fileInputRef}
        //                                 type="file"
        //                                 name="user_profile_photo"
        //                                 id="user_profile_photo"
        //                                 accept="image/jpeg,image/png,image/jpg,image/webp"
        //                                 onChange={handleChange}
        //                                 className="hidden"
        //                             />
        //                             <label
        //                                 htmlFor="user_profile_photo"
        //                                 className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium cursor-pointer transition select-none"
        //                             >
        //                                 Choose File
        //                             </label>
        //                             {formData.user_profile_photo ? (
        //                                 <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
        //                                     <span className="text-xs font-medium text-gray-600 max-w-[200px] truncate">
        //                                         {formData.user_profile_photo.name || "Photo Selected"}
        //                                     </span>
        //                                     <button
        //                                         type="button"
        //                                         onClick={handleRemovePhoto}
        //                                         className="text-red-500 hover:text-red-700 font-bold p-0.5 transition cursor-pointer flex items-center justify-center rounded-md hover:bg-red-50"
        //                                     >
        //                                         <FiX size={14} />
        //                                     </button>
        //                                 </div>
        //                             ) : (
        //                                 <span className="text-xs text-gray-400">No file chosen</span>
        //                             )}
        //                         </div>

        //                         {formErrors.user_profile_photo && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_profile_photo}
        //                             </p>
        //                         )}

        //                     </div>

        //                     {/* Password */}
        //                     <div>

        //                         <label className="block text-sm font-medium text-gray-700">
        //                             Password <span className="text-red-500">*</span>
        //                         </label>

        //                         <div className="relative">

        //                             <input
        //                                 type={showPassword ? "text" : "password"}
        //                                 name="user_password"
        //                                 maxLength={20}
        //                                 value={formData.user_password}
        //                                 onChange={handleChange}
        //                                 className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1"
        //                                 placeholder="Enter password"
        //                             />

        //                             <button
        //                                 type="button"
        //                                 onClick={() => setShowPassword(!showPassword)}
        //                                 className="absolute inset-y-0 right-0 px-4 text-gray-500 cursor-pointer"
        //                             >

        //                                 {showPassword
        //                                     ? <FaEye />
        //                                     : <FaEyeSlash />}

        //                             </button>

        //                         </div>

        //                         {formErrors.user_password && (
        //                             <p className="text-red-500 text-sm mt-1">
        //                                 {formErrors.user_password}
        //                             </p>
        //                         )}

        //                         <p className="mt-1 text-xs text-gray-500">
        //                             {formData.user_password.length}/20 characters
        //                         </p>

        //                     </div>

        //                     {/* Submit */}
        //                     <button
        //                         type="submit"
        //                         disabled={isSubmitting}
        //                         className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2c024d] to-[#f75c39] text-white font-semibold shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        //                         {isSubmitting
        //                             ? "Creating Account..."
        //                             : "Register"}

        //                     </button>

        //                     {/* Login */}
        //                     <p className="text-center text-sm text-gray-600">

        //                         Already have an account?{" "}

        //                         <button
        //                             type="button"
        //                             // onClick={() => navigate("/login")}
        //                             onClick={() => navigate("/login", { replace: true })}
        //                             className="text-blue-700 hover:underline cursor-pointer"
        //                         >
        //                             Login
        //                         </button>

        //                     </p>

        //                 </form>

        //             </div>

        //             {/* RIGHT SIDE - ILLUSTRATION */}
        //             <div className="hidden lg:flex relative bg-gradient-to-br from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] items-center justify-center p-10 overflow-hidden">

        //                 {/* Background circles */}
        //                 <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-10 -left-10"></div>

        //                 <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-24 -right-20"></div>

        //                 {/* Content */}
        //                 <div className="relative z-10 text-center text-white">

        //                     <img
        //                         src="\LearningIcon.png"
        //                         alt="Japanese Learning"
        //                         className="w-80 mx-auto drop-shadow-2xl"
        //                     />

        //                     <h3 className="text-4xl font-bold mt-8 mb-4">
        //                         Learn Japanese
        //                     </h3>

        //                     <p className="text-lg text-red-100 leading-relaxed max-w-md">
        //                         Master Hiragana, Katakana, Kanji, grammar, and speaking
        //                         skills with immersive interactive lessons.
        //                     </p>

        //                 </div>

        //             </div>

        //         </div>

        //     </div>

        //     <Footer />
        // </div>

        // <div className="min-h-screen flex flex-col p-4 sm:p-8 md:p-12 lg:p-20">
        <div className="w-full flex justify-center py-10">

            {/* Back */}
            {/* <button
                type="button"
                onClick={() => navigate("/")}
                className="absolute top-10 left-6 sm:left-10 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 cursor-pointer w-fit z-10"
            >
            <FiArrowLeft size={16} />
                Back
            </button> */}

            {/* <div className="flex-1 flex items-center justify-center py-10 pt-24"> */}
            <div className="flex-1 flex items-center justify-center py-6 sm:py-10">
                <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

                    {/* LEFT SIDE - FORM */}
                    <div className="p-8 lg:p-10 flex flex-col justify-center">

                        {/* Icon */}
                        <div className="flex justify-center lg:justify-start mb-6">

                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">

                                <FiUserPlus className="text-2xl text-red-500" />

                            </div>

                        </div>

                        {/* Heading */}
                        <h2 className="text-4xl font-bold text-gray-800 mb-1 text-center lg:text-left">
                            Create Account
                        </h2>

                        <p className="text-gray-500 mb-5 text-center lg:text-left">
                          Start your technical learning journey with TrainSphere today.
                        </p>

                        {/* FORM */}
                        <form
                            onSubmit={handleRegister}
                            className="space-y-5"
                        >

                            {/*Full Name */}
                            <div>
                                <div className="flex justify-between items-center mb-1">

                                    <label className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <span className={`text-[11px] font-semibold transition-colors ${formData.user_full_name.length === 50 ? "text-green-600" : "text-gray-400"
                                        }`}>
                                        {formData.user_full_name.length}/50 characters
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    name="user_full_name"
                                    maxLength={50}
                                    placeholder="Enter your full name"
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

                                    // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                                    // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.user_full_name ? "border-red-500" : "border-gray-300"
                                    //     } disabled:bg-gray-200 disabled:cursor-not-allowed`}

                                    className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}


                                />

                                {formErrors.user_full_name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.user_full_name}
                                    </p>
                                )}

                            </div>

                            {/* Mobile no. */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <span className={`text-[11px] font-semibold transition-colors ${formData.user_mobile_no.length === 10 ? "text-green-600" : "text-gray-400"
                                        }`}>
                                        {formData.user_mobile_no.length}/10 characters
                                    </span>
                                </div>

                                <input
                                    type="tel"
                                    name="user_mobile_no"
                                    maxLength={10}
                                    value={formData.user_mobile_no}
                                    onChange={handleChange}
                                    placeholder="Enter mobile number"
                                    // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                                    // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.user_mobile_no ? "border-red-500" : "border-gray-300"
                                    //     } disabled:bg-gray-200 disabled:cursor-not-allowed`}

                                    className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}
                                />

                                {formErrors.user_mobile_no && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.user_mobile_no}
                                    </p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Username <span className="text-red-500">*</span>
                                        <span className="text-xs font-normal text-gray-400 ml-1">
                                            (Use Letters, numbers, underscores (_) and dots (.) only)
                                        </span>
                                    </label>
                                    <span className={`text-[11px] font-semibold transition-colors ${formData.username.length === 50 ? "text-green-600" : "text-gray-400"
                                        }`}>
                                        {formData.username.length}/50 characters
                                    </span>
                                </div>


                                <input
                                    type="text"
                                    name="username"
                                    maxLength={50}
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    // className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-1 focus:ring-indigo-500 ${formErrors.username ? "border-red-500" : "border-gray-300"} disabled:bg-gray-200 disabled:cursor-not-allowed`}
                                    className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}

                                />

                                {formErrors.username && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.username}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <span className={`text-[11px] font-semibold transition-colors ${formData.user_email.length === 100 ? "text-green-600" : "text-gray-400"
                                        }`}>
                                        {formData.user_email.length}/100 characters
                                    </span>

                                </div>


                                <input
                                    name="user_email"
                                    maxLength={100}
                                    type="email"
                                    value={formData.user_email}
                                    onChange={handleChange}
                                    // className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                                    className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1`}
                                    // ${formErrors.user_email ? "border-red-500" : "border-gray-300"} disabled:bg-gray-200 disabled:cursor-not-allowed

                                    placeholder="Enter your email"
                                />

                                {formErrors.user_email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.user_email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Profile Photo (Optional)
                                    <span className="text-xs font-normal text-gray-400 ml-1">
                                        (JPG, JPEG, PNG, WEBP only, max 2 MB)
                                    </span>
                                </label>

                                <div className="mt-2 flex items-center gap-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        name="user_profile_photo"
                                        id="user_profile_photo"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="user_profile_photo"
                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium cursor-pointer transition select-none"
                                    >
                                        Choose File
                                    </label>
                                    {formData.user_profile_photo ? (
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
                                            <span className="text-xs font-medium text-gray-600 max-w-[200px] truncate">
                                                {formData.user_profile_photo.name || "Photo Selected"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="text-red-500 hover:text-red-700 font-bold p-0.5 transition cursor-pointer flex items-center justify-center rounded-md hover:bg-red-50"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">No file chosen</span>
                                    )}
                                </div>

                                {formErrors.user_profile_photo && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.user_profile_photo}
                                    </p>
                                )}

                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password <span className="text-red-500">*</span>
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
                                        className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1"
                                        placeholder="Enter password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-4 text-gray-500 cursor-pointer"
                                    >

                                        {showPassword
                                            ? <FaEye />
                                            : <FaEyeSlash />}

                                    </button>

                                </div>

                                {formErrors.user_password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {formErrors.user_password}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2c024d] to-[#f75c39] text-white font-semibold shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                                {isSubmitting
                                    ? "Creating Account..."
                                    : "Register"}

                            </button>

                            {/* Login */}
                            <p className="text-center text-sm text-gray-600">

                                Already have an account?{" "}

                                <button
                                    type="button"
                                    // onClick={() => navigate("/login")}
                                    onClick={() => navigate("/login", { replace: true })}
                                    className="text-blue-700 hover:underline cursor-pointer"
                                >
                                    Login
                                </button>

                            </p>

                        </form>

                    </div>

                    {/* RIGHT SIDE - ILLUSTRATION */}
                    <div className="hidden lg:flex relative bg-gradient-to-br from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] items-center justify-center p-10 overflow-hidden">

                        {/* Background circles */}
                        <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-10 -left-10"></div>

                        <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-24 -right-20"></div>

                        {/* Content */}
                        <div className="relative z-10 text-center text-white">

                            <img
                                src="\LearningIcon.png"
                                alt="Japanese Learning"
                                className="w-80 mx-auto drop-shadow-2xl"
                            />

                           <h3 className="text-4xl font-bold mt-8 mb-8">
    Learn & Grow with TrainSphere
</h3>

<p className="text-lg text-red-100 leading-relaxed max-w-md mt-4">
    Develop your technical knowledge, engineering expertise, and
    professional skills through interactive lessons and practical
    training programs.
</p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;