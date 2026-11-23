
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";

import {
    FiArrowLeft,
    // FiBuilding,
    FiUser,
    FiBookOpen,
    FiPlus,
    FiTrash2,
    FiCalendar,
    FiUsers,
    FiMail,
    FiPhone,
    FiMapPin,
    FiLock,
    FiInfo,
    FiSave,
    FiX,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";

import { selectStyles } from "../../utils/selectStyles.js";
import { X } from "lucide-react";

const initialCompany = {
    company_name: "",
    company_email: "",
    company_mobile_no: "",
    company_address: "",
};

const initialAdmin = {
    user_id: null,
    user_full_name: "",
    username: "",
    user_email: "",
    user_mobile_no: "",
    password: "",
};


const validateEmail = (email, maxLength = 100) => {
    const value = (email || "").trim();

    if (!value) return "Email is required";

    if (/\s/.test(value)) {
        return "Email must not contain spaces";
    }

    if (value.length > maxLength) {
        return `Email must not exceed ${maxLength} characters`;
    }

    const emailRegex =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

    const [localPart] = value.split("@");

    if (
        !emailRegex.test(value) ||
        localPart.startsWith(".") ||
        localPart.endsWith(".") ||
        localPart.includes("..")
    ) {
        return "Invalid email format";
    }

    return "";
};

const validateMobile = (mobile, required = true) => {
    const value = (mobile || "").trim();

    if (!value && required) {
        return "Mobile number is required";
    }

    if (!value && !required) {
        return "";
    }

    if (!/^[6-9]\d{9}$/.test(value)) {
        if (!/^[6-9]/.test(value)) {
            return "Mobile number must start with 6, 7, 8, or 9";
        }

        if (!/^\d+$/.test(value)) {
            return "Mobile number must contain digits only";
        }

        if (value.length !== 10) {
            return "Mobile number must be exactly 10 digits";
        }

        return "Invalid mobile number format";
    }

    return "";
};


const CompanyForm = ({
    editingCompanyId,
    fetchCompanies,
    setShowForm,
    onSaveSuccess,
}) => {

    const [company, setCompany] = useState(initialCompany);
    const [admin, setAdmin] = useState(initialAdmin);

    const [availableTrainings, setAvailableTrainings] = useState([]);
    const [selectedTrainings, setSelectedTrainings] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetchingTrainings, setFetchingTrainings] = useState(true);

    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({});

    /* FETCH AVAILABLE TRAININGS */
    // const fetchTrainings = async () => {
    //     try {
    //         setFetchingTrainings(true);

    //         const token = sessionStorage.getItem("token");

    //         const response = await axios.get(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/trainings/dropdown`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );

    //         if (response.data.success) {
    //             setAvailableTrainings(
    //                 response.data.trainings || []
    //             );
    //         } else {
    //             setAvailableTrainings([]);
    //         }

    //     } catch (error) {
    //         console.error("Fetch Trainings Error:", error);

    //         toast.error(
    //             error.response?.data?.message ||
    //             "Failed to load available trainings."
    //         );

    //         setAvailableTrainings([]);

    //     } finally {
    //         setFetchingTrainings(false);
    //     }
    // };

    /* FETCH EXISTING COMPANY DETAILS (EDIT) */

    const fetchCompanyDetails = async () => {
        if (!editingCompanyId) return;

        try {
            setLoading(true);

            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/company/${editingCompanyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                const { company, admin, trainings } = response.data.data;

                setCompany({
                    company_name: company.company_name || "",
                    company_email: company.company_email || "",
                    company_mobile_no: company.company_mobile_no || "",
                    company_address: company.company_address || "",
                });

                setAdmin({
                    user_id: admin.user_id,
                    user_full_name: admin.user_full_name || "",
                    username: admin.username || "",
                    user_email: admin.user_email || "",
                    user_mobile_no: admin.user_mobile_no || "",
                    password: "",
                });

                setSelectedTrainings(
                    trainings.map(training => ({
                        training_id: Number(training.training_id),
                        training_title: training.training_title,
                        training_users_limit: String(
                            training.training_users_limit
                        ),
                        training_expiry_on: training.training_expiry_on,
                    }))
                );
            }

        } catch (error) {
            console.error("Fetch Company Details Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load company details."
            );

        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchTrainings();
    // }, []);

    useEffect(() => {
        if (editingCompanyId) {
            fetchCompanyDetails();
        }
    }, [editingCompanyId]);

    // ---------------------------------------
    // HELPERS
    // ---------------------------------------

    const normalizeText = (value) => {
        return value?.replace(/\s+/g, " ").trim() || "";
    };

    const todayLocal = () => {
        const date = new Date();

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // const handleCompanyChange = (e) => {
    //     const { name, value } = e.target;

    //     setCompany(prev => ({
    //         ...prev,
    //         [name]: value,
    //     }));

    //     setErrors(prev => ({
    //         ...prev,
    //         [name]: "",
    //     }));
    // };

    // const handleAdminChange = (e) => {
    //     const { name, value } = e.target;

    //     setAdmin(prev => ({
    //         ...prev,
    //         [name]: value,
    //     }));

    //     setErrors(prev => ({
    //         ...prev,
    //         [name]: "",
    //     }));
    // };


    const handleCompanyChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;

        if (name === "company_mobile_no") {
            value = value.replace(/\D/g, "");

            if (value.length > 10) return;
        }

        setCompany(prev => ({
            ...prev,
            [name]: value,
        }));

        setErrors(prev => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleAdminChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;

        if (name === "user_mobile_no") {
            value = value.replace(/\D/g, "");

            if (value.length > 10) return;
        }

        setAdmin(prev => ({
            ...prev,
            [name]: value,
        }));

        setErrors(prev => ({
            ...prev,
            [name]: "",
        }));
    };

    // ---------------------------------------
    // TRAINING SELECTION
    // ---------------------------------------

    const handleTrainingSelect = (options) => {
        const selected = options || [];

        setSelectedTrainings(prev => {

            const existingMap = new Map(
                prev.map(item => [
                    Number(item.training_id),
                    item
                ])
            );

            return selected.map(option => {

                const existing = existingMap.get(
                    Number(option.value)
                );

                return existing || {
                    training_id: Number(option.value),
                    training_title: option.label,
                    training_users_limit: "",
                    training_expiry_on: "",
                };
            });
        });

        setErrors(prev => ({
            ...prev,
            trainings: "",
        }));
    };

    const handleTrainingFieldChange = (
        trainingId,
        field,
        value
    ) => {
        setSelectedTrainings(prev =>
            prev.map(training =>
                Number(training.training_id) === Number(trainingId)
                    ? {
                        ...training,
                        [field]: value,
                    }
                    : training
            )
        );

        setErrors(prev => ({
            ...prev,
            [`${trainingId}_${field}`]: "",
        }));
    };

    const removeTraining = (trainingId) => {

        setSelectedTrainings(prev =>
            prev.filter(
                training =>
                    Number(training.training_id) !== Number(trainingId)
            )
        );
    };

    // ---------------------------------------
    // VALIDATION
    // ---------------------------------------

    // const validate = () => {

    //     const tempErrors = {};

    //     // Company validation
    //     if (!normalizeText(company.company_name)) {
    //         tempErrors.company_name = "Company name is required.";
    //     }

    //     if (
    //         company.company_email &&
    //         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.company_email.trim())
    //     ) {
    //         tempErrors.company_email = "Enter a valid company email.";
    //     }

    //     // Admin validation
    //     if (!normalizeText(admin.user_full_name)) {
    //         tempErrors.user_full_name = "Full name is required.";
    //     }

    //     if (!normalizeText(admin.username)) {
    //         tempErrors.username = "Username is required.";
    //     }

    //     if (!admin.user_email.trim()) {
    //         tempErrors.user_email = "Email is required.";
    //     } else if (
    //         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin.user_email.trim())
    //     ) {
    //         tempErrors.user_email = "Enter a valid email address.";
    //     }

    //     if (!admin.password) {
    //         tempErrors.password = "Password is required.";
    //     } else if (admin.password.length < 8) {
    //         tempErrors.password = "Password must contain at least 8 characters.";
    //     }

    //     // Training validation
    //     if (selectedTrainings.length === 0) {
    //         tempErrors.trainings = "Please assign at least one training.";
    //     }

    //     selectedTrainings.forEach(training => {

    //         const id = training.training_id;

    //         if (
    //             !training.training_users_limit ||
    //             !Number.isInteger(Number(training.training_users_limit)) ||
    //             Number(training.training_users_limit) <= 0
    //         ) {
    //             tempErrors[`${id}_training_users_limit`] =
    //                 "Enter a valid user limit.";
    //         }

    //         if (!training.training_expiry_on) {
    //             tempErrors[`${id}_training_expiry_on`] =
    //                 "Expiry date is required.";
    //         } else if (
    //             training.training_expiry_on <= todayLocal()
    //         ) {
    //             tempErrors[`${id}_training_expiry_on`] =
    //                 "Expiry date must be after today.";
    //         }
    //     });

    //     setErrors(tempErrors);

    //     return Object.keys(tempErrors).length === 0;
    // };


    const validate = () => {
        const tempErrors = {};
        const hasSpaces = /\s/;

        // =====================================
        // COMPANY VALIDATION
        // =====================================

        const companyName = normalizeText(company.company_name);

        if (!companyName) {
            tempErrors.company_name = "Company name is required";
        } else if (companyName.length < 2 || companyName.length > 255) {
            tempErrors.company_name =
                "Company name must be between 2 and 255 characters";
        }

        // Company Email
        const companyEmailError = validateEmail(company.company_email, 255);

        if (companyEmailError) {
            tempErrors.company_email = companyEmailError;
        }

        // Company Mobile
        const companyMobileError = validateMobile(
            company.company_mobile_no,
            true
        );

        if (companyMobileError) {
            tempErrors.company_mobile_no = companyMobileError;
        }

        // Company Address
        if (!normalizeText(company.company_address)) {
            tempErrors.company_address = "Company address is required";
        } else if (company.company_address.trim().length > 255) {
            tempErrors.company_address =
                "Company address must not exceed 255 characters";
        }

        // =====================================
        // COMPANY ADMIN VALIDATION
        // =====================================

        const normalizedFullName = normalizeText(admin.user_full_name);

        const nameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;

        if (!normalizedFullName) {
            tempErrors.user_full_name = "Full name is required";
        } else if (!nameRegex.test(normalizedFullName)) {
            tempErrors.user_full_name =
                "Name must contain only letters and spaces";
        } else if (
            normalizedFullName.length < 2 ||
            normalizedFullName.length > 30
        ) {
            tempErrors.user_full_name =
                "Name must be between 2 and 30 characters";
        }

        // Username
        const username = admin.username.trim();
        const usernameRegex = /^[a-zA-Z0-9_.]+$/;

        if (!username) {
            tempErrors.username = "Username is required";
        } else if (hasSpaces.test(username)) {
            tempErrors.username = "Username must not contain spaces";
        } else if (username.length < 5 || username.length > 30) {
            tempErrors.username =
                "Username must be between 5 and 30 characters";
        } else if (!usernameRegex.test(username)) {
            tempErrors.username =
                "Username can only contain letters, numbers, underscores (_), and dots (.)";
        } else if (!/[a-zA-Z]/.test(username)) {
            tempErrors.username =
                "Username must contain at least one letter";
        } else if (
            !/^[a-zA-Z0-9]/.test(username) ||
            !/[a-zA-Z0-9]$/.test(username)
        ) {
            tempErrors.username =
                "Username cannot start or end with an underscore (_) or dot (.)";
        }

        // Admin Email
        const adminEmailError = validateEmail(admin.user_email, 100);

        if (adminEmailError) {
            tempErrors.user_email = adminEmailError;
        }

        // Admin Mobile (Optional)
        const adminMobileError = validateMobile(
            admin.user_mobile_no,
            false
        );

        if (adminMobileError) {
            tempErrors.user_mobile_no = adminMobileError;
        }

        // // Password
        // const passwordRegex =
        //     /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/;

        // if (!admin.password) {
        //     tempErrors.password = "Password is required";
        // } else if (hasSpaces.test(admin.password)) {
        //     tempErrors.password = "Password must not contain spaces";
        // } else if (!passwordRegex.test(admin.password)) {
        //     tempErrors.password =
        //         "Must be 6-20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (!@#$%^&*)";
        // }

        // Password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,20}$/;

        if (!editingCompanyId && !admin.password) {
            tempErrors.password = "Password is required";
        } else if (admin.password) {
            if (hasSpaces.test(admin.password)) {
                tempErrors.password = "Password must not contain spaces";
            } else if (!passwordRegex.test(admin.password)) {
                tempErrors.password =
                    "Must be 6-20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (!@#$%^&*)";
            }
        }

        // =====================================
        // TRAINING VALIDATION
        // =====================================

        // if (selectedTrainings.length === 0) {
        //     tempErrors.trainings = "Please assign at least one course";
        // }

        // selectedTrainings.forEach(training => {
        //     const id = training.training_id;

        //     // User Limit
        //     if (!training.training_users_limit) {
        //         tempErrors[`${id}_training_users_limit`] =
        //             "User limit is required";
        //     } else if (
        //         !Number.isInteger(Number(training.training_users_limit)) ||
        //         Number(training.training_users_limit) <= 0
        //     ) {
        //         tempErrors[`${id}_training_users_limit`] =
        //             "Enter a valid positive whole number";
        //     }

        //     // Expiry Date
        //     if (!training.training_expiry_on) {
        //         tempErrors[`${id}_training_expiry_on`] =
        //             "Expiry date is required";
        //     } else if (training.training_expiry_on <= todayLocal()) {
        //         tempErrors[`${id}_training_expiry_on`] =
        //             "Expiry date must be after today";
        //     }
        // });

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    // ---------------------------------------
    // SUBMIT FORM
    // ---------------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!validate()) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        setLoading(true);

        const payload = {
            company: {
                company_name: normalizeText(company.company_name),
                company_email: normalizeText(company.company_email) || null,
                company_mobile_no: normalizeText(company.company_mobile_no) || null,
                company_address: company.company_address.trim() || null,
            },

            admin: {
                user_id: admin.user_id,
                user_full_name: normalizeText(admin.user_full_name),
                username: normalizeText(admin.username),
                user_email: normalizeText(admin.user_email),
                user_mobile_no: normalizeText(admin.user_mobile_no) || null,
                password: admin.password,
            },

            // trainings: selectedTrainings.map(training => ({
            //     training_id: Number(training.training_id),

            //     training_users_limit: Number(
            //         training.training_users_limit
            //     ),

            //     // Store expiry at the end of the selected date
            //     training_expiry_on:
            //         `${training.training_expiry_on} 23:59:59`,
            // })),
        };

        try {

            const token = sessionStorage.getItem("token");

            const url = editingCompanyId
                ? `${import.meta.env.VITE_API_BASE_URL}/api/company/company/${editingCompanyId}`
                : `${import.meta.env.VITE_API_BASE_URL}/api/company/create`;


            // const response = await axios.post(
            //     `${import.meta.env.VITE_API_BASE_URL}/api/company/create`,
            //     payload,
            //     {
            //         headers: {
            //             Authorization: `Bearer ${token}`,
            //         },
            //     }
            // );

            const response = editingCompanyId
                ? await axios.put(url, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                : await axios.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

            if (response.data.success) {

                // toast.success(
                //     response.data.message ||
                //     "Company created successfully!"
                // );

                toast.success(
                    response.data.message ||
                    (editingCompanyId
                        ? "Company updated successfully!"
                        : "Company created successfully!")
                );

                if (onSaveSuccess) {
                    await onSaveSuccess();
                } else {
                    if (fetchCompanies) {
                        await fetchCompanies();
                    }

                    setShowForm(false);
                }
            }

        } catch (error) {

            console.error("Create Company Error:", error);

            const message =
                error.response?.data?.message ||
                "Failed to create company.";

            toast.error(message);

        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------
    // REUSABLE INPUT STYLES
    // ---------------------------------------

    const inputClass = (error) => `
        w-full px-3 py-2 border rounded-md
        focus:outline-none focus:ring-1 transition
        ${error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
        }
    `;

    const renderError = (error) => (
        error ? (
            <p className="text-xs text-red-500 mt-1">
                {error}
            </p>
        ) : null
    );

    /* LOADING */

    // if (fetchingTrainings) {
    //     return (
    //         <div className="flex justify-center items-center py-20">
    //             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>

    //             <span className="ml-3 text-gray-600 font-medium">
    //                 Loading available trainings...
    //             </span>
    //         </div>
    //     );
    // }

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 w-full overflow-hidden animate-fade-in">

            {/* HEADER */}
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600 cursor-pointer"
                        title="Back to Companies"
                        disabled={loading}
                    >
                        <FiArrowLeft size={20} />
                    </button>

                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {editingCompanyId
                                ? "Edit Company"
                                : "Create New Company"
                            }
                        </h2>

                        <p className="text-xs text-gray-500">
                            Configure company information, admin account and assigned courses.
                        </p>
                    </div>

                </div>
            </div>

            <form
                noValidate
                onSubmit={handleSubmit}
                className="p-6 pb-10 space-y-7"
            >

                {/* ================================= */}
                {/* SECTION 1: COMPANY INFORMATION */}
                {/* ================================= */}

                <div>

                    <div className="flex items-center gap-2 mb-4">
                        {/* <FiBuilding className="text-[#0E182B]" size={17} /> */}

                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B]">
                            1. Company Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                        {/* Company Name */}
                        <div className="sm:col-span-2 xl:col-span-2">
                            <div className="flex justify-between items-center mb-1">

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${company.company_name.length === 255
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {company.company_name.length}/255 characters
                                </span>
                            </div>


                            <input
                                type="text"
                                name="company_name"
                                value={company.company_name}
                                onChange={handleCompanyChange}
                                maxLength={255}
                                placeholder="Enter company name"
                                // className={inputClass(errors.company_name)}
                                className={`${inputClass(errors.company_mobile_no)} pl-3`}
                                disabled={loading}
                            />

                            {renderError(errors.company_name)}
                        </div>

                        {/* Company Email */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Email <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${company.company_email.length === 255
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {company.company_email.length}/255 characters
                                </span>

                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    name="company_email"
                                    value={company.company_email}
                                    onChange={handleCompanyChange}
                                    maxLength={255}
                                    placeholder="company@example.com"
                                    // className={`${inputClass(errors.company_email)} pl-9`}
                                    className={`${inputClass(errors.company_address)} pl-3 resize-none`}
                                    disabled={loading}
                                />
                            </div>

                            {renderError(errors.company_email)}
                        </div>

                        {/* Company Mobile */}
                        <div>
                            <div className="flex justify-between items-center mb-1">

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Mobile Number
                                    <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${company.company_mobile_no.length === 10
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {company.company_mobile_no.length}/10 digits
                                </span>
                            </div>


                            <div className="relative">
                                <input
                                    type="tel"
                                    name="company_mobile_no"
                                    value={company.company_mobile_no}
                                    onChange={handleCompanyChange}
                                    maxLength={10}
                                    placeholder="Enter 10-digit mobile number"
                                    className={`${inputClass(false)} pl-3`}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Company Address */}
                        <div className="sm:col-span-2 xl:col-span-3">
                            <div className="flex justify-between items-center mb-1">

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Address
                                    <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${company.company_address.length === 255
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {company.company_address.length}/255 characters
                                </span>
                            </div>

                            <div className="relative">
                                <textarea
                                    name="company_address"
                                    value={company.company_address}
                                    onChange={handleCompanyChange}
                                    rows={3}
                                    maxLength={255}
                                    placeholder="Enter company address"
                                    className={`${inputClass(false)} pl-3 resize-none`}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* ================================= */}
                {/* SECTION 2: COMPANY ADMIN */}
                {/* ================================= */}

                <div className="pt-5 border-t border-gray-100">

                    <div className="flex items-center gap-2 mb-4">
                        <FiUser className="text-[#0E182B]" size={17} />

                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B]">
                            2. Company Admin Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                        {/* Full Name */}
                        <div>
                            <div className="flex justify-between items-center mb-1">

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <span
                                    className={`text-[11px] font-semibold transition-colors ${admin.user_full_name.length === 255
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {admin.user_full_name.length}/255 characters
                                </span>
                            </div>


                            <input
                                type="text"
                                name="user_full_name"
                                value={admin.user_full_name}
                                onChange={handleAdminChange}
                                maxLength={255}
                                placeholder="Enter admin full name"
                                className={inputClass(errors.user_full_name)}
                                disabled={loading}
                            />

                            {renderError(errors.user_full_name)}
                        </div>

                        {/* Username */}
                        <div>
                            <div className="flex justify-between items-center mb-1">

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${admin.username.length === 30
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {admin.username.length}/30 characters
                                </span>
                            </div>

                            <input
                                type="text"
                                name="username"
                                value={admin.username}
                                onChange={handleAdminChange}
                                maxLength={30}
                                placeholder="Enter username (min 5 chars)"
                                className={inputClass(errors.username)}
                                disabled={loading}
                            />

                            {/* {renderError(errors.username)} */}
                            {errors.username ? (
                                renderError(errors.username)
                            ) : (
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                                    Letters, numbers, underscores (_) and dots (.) only. Min 5 characters.
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <div className="flex justify-between items-center mb-1">

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admin Email <span className="text-red-500">*</span>
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${admin.user_email.length === 100
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {admin.user_email.length}/100 characters
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    name="user_email"
                                    value={admin.user_email}
                                    onChange={handleAdminChange}
                                    maxLength={100}
                                    placeholder="admin@company.com"
                                    className={`${inputClass(errors.user_email)} pl-3`}
                                    disabled={loading}
                                />
                            </div>

                            {renderError(errors.user_email)}
                        </div>

                        {/* Mobile */}
                        <div>
                            <div className="flex justify-between items-center mb-1">

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admin Mobile Number
                                </label>

                                <span
                                    className={`text-[11px] font-semibold transition-colors ${admin.user_mobile_no.length === 10
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {admin.user_mobile_no.length}/10 digits
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    type="tel"
                                    name="user_mobile_no"
                                    value={admin.user_mobile_no}
                                    onChange={handleAdminChange}
                                    maxLength={10}
                                    placeholder="Enter 10-digit mobile number"
                                    // className={`${inputClass(false)} pl-9`}
                                    className={`${inputClass(errors.user_mobile_no)} pl-3`}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        {/* <div className="sm:col-span-2">
                            <div className="flex justify-between items-center mb-1">

                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>

                                
                            </div>

                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    value={admin.password}
                                    // maxLength={20}
                                    onChange={handleAdminChange}
                                    placeholder="Password (minimum 8 characters)"
                                    className={`${inputClass(errors.password)} pl-3`}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                            </div>

                            {renderError(errors.password)}

                            <p className="text-[11px] text-gray-400 mt-1">
                                This password will be used by the Company Admin to log in.
                            </p>
                        </div> */}

                        {/* Password */}
                        <div className="sm:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    {/* Password <span className="text-red-500">*</span> */}
                                    Password {!editingCompanyId && <span className="text-red-500">*</span>}
                                </label>


                                <span
                                    className={`text-[11px] font-semibold transition-colors ${admin.password.length === 20
                                        ? "text-green-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {admin.password.length}/20 characters
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={admin.password}
                                    maxLength={20}
                                    onChange={handleAdminChange}
                                    // placeholder="••••••••"
                                    placeholder={
                                        editingCompanyId
                                            ? "••••••••"
                                            : "Enter password"
                                    }
                                    className={`${inputClass(errors.password)} pl-3 pr-10`}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    disabled={loading}
                                >
                                    {showPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                </button>
                            </div>

                            {errors.password ? (
                                renderError(errors.password)
                            ) : (
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">
                                    Min 6 characters, must include 1 uppercase, 1 lowercase, 1 number & 1 special character.
                                </p>
                            )}

                            {/* <p className="text-[11px] text-gray-400 mt-1">
                                This password will be used by the Company Admin to log in.
                            </p> */}
                            <p className="text-[11px] text-gray-400 mt-1">
                                {editingCompanyId
                                    ? "Leave blank if you do not want to change the Company Admin password."
                                    : "This password will be used by the Company Admin to log in."
                                }
                            </p>
                        </div>

                    </div>
                </div>

                {/* ================================= */}
                {/* SECTION 3: ASSIGN TRAININGS */}
                {/* ================================= */}

                {/* <div className="pt-5 border-t border-gray-100">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">

                        <div className="flex items-center gap-2">
                            <FiBookOpen className="text-[#0E182B]" size={17} />

                            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B]">
                                3. Assign Courses
                            </h3>
                        </div>

                        <span className="text-xs text-gray-500">
                            {selectedTrainings.length} course(s) selected
                        </span>
                    </div>

                    <div className="mb-4">

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Courses <span className="text-red-500">*</span>
                        </label>

                        <Select
                            isMulti
                            options={availableTrainings.map(training => ({
                                value: training.training_id,
                                label: training.training_title,
                            }))}
                            value={selectedTrainings.map(training => ({
                                value: training.training_id,
                                label: training.training_title,
                            }))}
                            onChange={handleTrainingSelect}
                            placeholder="Search and select courses..."
                            noOptionsMessage={() => "No active courses available"}
                            closeMenuOnSelect={false}
                            isDisabled={loading}
                            styles={{
                                ...selectStyles,

                                control: (base, state) => ({
                                    ...(selectStyles.control
                                        ? selectStyles.control(base, state)
                                        : base
                                    ),
                                    borderColor: errors.trainings
                                        ? "#ef4444"
                                        : state.isFocused
                                            ? "#64748b"
                                            : "#cbd5e1",
                                    boxShadow: state.isFocused
                                        ? "0 0 0 1px #64748b"
                                        : "none",
                                    "&:hover": {
                                        borderColor: "#64748b",
                                    },
                                }),
                            }}
                        />

                        {renderError(errors.trainings)}
                    </div>


                    {selectedTrainings.length > 0 ? (

                        <div className="space-y-4">

                            {selectedTrainings.map((training, index) => (

                                <div
                                    key={training.training_id}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >

                                    <div className="bg-slate-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100">

                                        <div className="flex items-center gap-3">

                                            <div className="w-8 h-8 rounded-lg bg-[#0E182B] text-white flex items-center justify-center shrink-0">
                                                <FiBookOpen size={15} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {training.training_title}
                                                </p>

                                                <p className="text-[11px] text-gray-500">
                                                    Course {index + 1}
                                                </p>
                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeTraining(training.training_id)}
                                            disabled={loading}
                                            className="flex items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                                        >
                                            <FiTrash2 size={14} />
                                            Remove
                                        </button>

                                    </div>

                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FiUsers size={14} />
                                                    Maximum Users
                                                    <span className="text-red-500">*</span>
                                                </span>
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={training.training_users_limit}
                                                onChange={(e) =>
                                                    handleTrainingFieldChange(
                                                        training.training_id,
                                                        "training_users_limit",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g. 50"
                                                className={inputClass(
                                                    errors[`${training.training_id}_training_users_limit`]
                                                )}
                                                disabled={loading}
                                            />

                                            {renderError(
                                                errors[`${training.training_id}_training_users_limit`]
                                            )}

                                            <p className="text-[11px] text-gray-400 mt-1">
                                                Maximum employees allowed for this course.
                                            </p>

                                        </div>

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FiCalendar size={14} />
                                                    Course Expiry Date
                                                    <span className="text-red-500">*</span>
                                                </span>
                                            </label>

                                            <input
                                                type="date"
                                                min={todayLocal()}
                                                value={training.training_expiry_on}
                                                onChange={(e) =>
                                                    handleTrainingFieldChange(
                                                        training.training_id,
                                                        "training_expiry_on",
                                                        e.target.value
                                                    )
                                                }
                                                className={inputClass(
                                                    errors[`${training.training_id}_training_expiry_on`]
                                                )}
                                                disabled={loading}
                                            />

                                            {renderError(
                                                errors[`${training.training_id}_training_expiry_on`]
                                            )}

                                            <p className="text-[11px] text-gray-400 mt-1">
                                                Access to this course will expire on the selected date.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <div className="border-2 border-dashed border-gray-200 rounded-lg py-10 px-4 flex flex-col items-center justify-center text-center">

                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                <FiBookOpen className="text-slate-500" size={22} />
                            </div>

                            <p className="text-sm font-medium text-gray-700">
                                No Courses Selected
                            </p>

                            <p className="text-xs text-gray-400 mt-1 max-w-sm">
                                Select one or more courses from the dropdown above.
                                You can configure the user limit and expiry date separately for each course.
                            </p>

                        </div>

                    )}

                </div> */}

                {/* ================================= */}
                {/* INFORMATION NOTE */}
                {/* ================================= */}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">

                    <FiInfo className="text-blue-600 shrink-0 mt-0.5" size={17} />

                    <div className="text-xs text-blue-800 leading-relaxed">

                        <strong>Before creating the company:</strong>

                        <p className="mt-1">
                            {/* The Company Admin account and all selected course assignments
                            will be created together. The Company Admin will be associated
                            with this company automatically. */}

                            The Company Admin account will be created together. The Company Admin will be associated
                            with this company automatically.
                        </p>

                    </div>

                </div>

                {/* ================================= */}
                {/* ACTION BUTTONS */}
                {/* ================================= */}

                <div className="pt-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 font-medium cursor-pointer min-h-[44px]"

                    >
                        <X size={17} />
                        Cancel
                    </button>

                    <button
                        type="submit"
                        // disabled={loading || availableTrainings.length === 0}
                        disabled={loading}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded flex items-center justify-center gap-2 font-medium transition shadow disabled:opacity-50 cursor-pointer min-h-[44px] whitespace-nowrap"

                    >

                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <FiSave size={17} />
                                Submit
                            </>
                        )}

                    </button>

                </div>

            </form>

        </div>
    );
};

export default CompanyForm;
