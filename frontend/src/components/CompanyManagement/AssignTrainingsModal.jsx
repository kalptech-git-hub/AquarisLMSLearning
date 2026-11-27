
import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from "react-toastify";
import {
    FiBookOpen,
    FiCalendar,
    FiUsers,
    FiTrash2,
    FiX,
    FiSave,
    FiInfo,
} from "react-icons/fi";
import { selectStyles } from "../../utils/selectStyles.js";
import { X } from "lucide-react";

const AssignTrainigsModal = ({
    company,
    onClose,
    onSuccess,
}) => {
    const [availableTrainings, setAvailableTrainings] = useState([]);
    const [selectedTrainings, setSelectedTrainings] = useState([]);

    const [assignedTrainingIds, setAssignedTrainingIds] = useState([]);
    const [assignedTrainings, setAssignedTrainings] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState({});

    const todayLocal = () => {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");
    };

    // Fetch available courses and existing company assignments
    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetching(true);

                const token = sessionStorage.getItem("token");
                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                const [trainingResponse, companyResponse] =
                    await Promise.all([
                        // axios.get(
                        //     `${import.meta.env.VITE_API_BASE_URL}/api/trainings/dropdown`,
                        //     { headers }
                        // ),

                        axios.get(
                            `${import.meta.env.VITE_API_BASE_URL}/api/trainings/dropdown`,
                            {
                                headers,
                                params: {
                                    company_id: company.company_id
                                }
                            }
                        ),
                        axios.get(
                            `${import.meta.env.VITE_API_BASE_URL}/api/company/${company.company_id}`,
                            { headers }
                        ),
                    ]);

                if (trainingResponse.data.success) {
                    setAvailableTrainings(
                        trainingResponse.data.trainings || []
                    );
                }

                // if (companyResponse.data.success) {
                //     const existingTrainings =
                //         companyResponse.data.data?.trainings || [];

                //     setAssignedTrainingIds(
                //         existingTrainings.map(item =>
                //             Number(item.training_id)
                //         )
                //     );
                // }

                if (companyResponse.data.success) {
                    const existingTrainings =
                        companyResponse.data.data?.trainings || [];

                    setAssignedTrainings(existingTrainings);
                }

            } catch (error) {
                console.error("Fetch Assign Course Data Error:", error);

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load course information."
                );
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [company.company_id]);

    const handleTrainingSelect = (options) => {
        const selected = options || [];

        setSelectedTrainings(previous => {
            const existingMap = new Map(
                previous.map(item => [
                    Number(item.training_id),
                    item,
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

        setErrors(previous => ({
            ...previous,
            trainings: "",
        }));
    };

    const handleFieldChange = (trainingId, field, value) => {
        setSelectedTrainings(previous =>
            previous.map(training =>
                Number(training.training_id) === Number(trainingId)
                    ? { ...training, [field]: value }
                    : training
            )
        );

        setErrors(previous => ({
            ...previous,
            [`${trainingId}_${field}`]: "",
        }));
    };

    const removeTraining = (trainingId) => {
        setSelectedTrainings(previous =>
            previous.filter(
                item => Number(item.training_id) !== Number(trainingId)
            )
        );
    };

    const validate = () => {
        const nextErrors = {};

        if (selectedTrainings.length === 0) {
            nextErrors.trainings = "Please select at least one course.";
        }

        selectedTrainings.forEach(training => {
            const id = training.training_id;
            const limit = Number(training.training_users_limit);

            if (
                !training.training_users_limit ||
                !Number.isInteger(limit) ||
                limit <= 0
            ) {
                nextErrors[`${id}_training_users_limit`] =
                    "Enter a valid positive whole number.";
            }

            if (!training.training_expiry_on) {
                nextErrors[`${id}_training_expiry_on`] =
                    "Expiry date is required.";
            } else if (
                training.training_expiry_on <= todayLocal()
            ) {
                nextErrors[`${id}_training_expiry_on`] =
                    "Expiry date must be after today.";
            }
        });

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        try {
            setLoading(true);

            const token = sessionStorage.getItem("token");

            const payload = {
                trainings: selectedTrainings.map(training => ({
                    training_id: Number(training.training_id),
                    training_users_limit: Number(
                        training.training_users_limit
                    ),
                    training_expiry_on: training.training_expiry_on,
                })),
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/company/${company.company_id}/assign-trainings`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                toast.success(
                    response.data.message ||
                    "Courses assigned successfully."
                );

                await onSuccess?.();
                onClose();
            }

        } catch (error) {
            console.error("Assign Courses Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to assign courses."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (error) => `
        w-full px-3 py-2 border rounded-md
        focus:outline-none focus:ring-1 transition
        ${error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
        }
    `;

    const renderError = (error) =>
        error ? (
            <p className="text-xs text-red-500 mt-1">{error}</p>
        ) : null;

    if (fetching) {
        return (
            <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-8 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-red-600" />
                    <span className="text-gray-600 font-medium">
                        Loading course information...
                    </span>
                </div>
            </div>
        );
    }

    // const selectableTrainings = availableTrainings.filter(
    //     training =>
    //         !assignedTrainingIds.includes(Number(training.training_id))
    // );


    // const assignedTrainingIds = assignedTrainings.map(
    //     training => Number(training.training_id)
    // );

    // const selectableTrainings = availableTrainings.filter(
    //     training =>
    //         !assignedTrainingIds.includes(Number(training.training_id))
    // );

    const selectableTrainings = availableTrainings;

    const selectedOptions = selectedTrainings.map(training => ({
        value: training.training_id,
        label: training.training_title,
    }));

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-3 sm:p-5"
            onMouseDown={e => {
                if (e.target === e.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="bg-slate-50 border-b border-gray-200 px-5 sm:px-6 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <FiBookOpen className="text-[#0E182B]" size={19} />
                            <h2 className="text-lg font-bold text-slate-800">
                                Assign Courses
                            </h2>
                        </div>

                        <p className="text-sm text-gray-500 mt-1">
                            Company:{" "}
                            <span className="font-semibold text-gray-700">
                                {company.company_name}
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer disabled:opacity-50"
                    >
                        <FiX size={21} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col min-h-0"
                >
                    <div className="overflow-y-auto p-5 sm:p-6 space-y-5">

                        {/* Existing assignments */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                            <FiInfo className="text-blue-600 shrink-0 mt-0.5" />

                            <div className="text-xs text-blue-800 leading-relaxed">
                                <p className="font-semibold">
                                    Company course assignment
                                </p>
                                <p className="mt-1">
                                    Select courses purchased by this company.
                                    Existing assignments are excluded from
                                    the selection.
                                </p>
                            </div>
                        </div>

                        {/* {assignedTrainingIds.length > 0 && (
                            <p className="text-xs text-gray-500">
                                {assignedTrainingIds.length} course(s)
                                already assigned to this company.
                            </p>
                        )} */}


                        {/* Already Assigned Courses */}
                        {assignedTrainings.length > 0 && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">

                                <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Already Assigned Courses
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Courses currently assigned to this company
                                        </p>
                                    </div>

                                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                        {assignedTrainings.length} Assigned
                                    </span>
                                </div>

                                {/* <div className="divide-y divide-gray-100">
                                    {assignedTrainings.map((training) => (
                                        <div
                                            key={training.company_trainings_id}
                                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <FiBookOpen
                                                        className="text-slate-600"
                                                        size={17}
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {training.training_title}
                                                    </p>

                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            Max users: {training.training_users_limit}
                                                        </span>

                                                        <span className="text-xs text-gray-500">
                                                            Expires: {training.training_expiry_on}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1 self-start sm:self-center">
                                                Assigned
                                            </span>
                                        </div>
                                    ))}
                                </div> */}


                                <div className="divide-y divide-gray-100">
                                    {assignedTrainings.map((training) => (
                                        <div
                                            key={training.company_trainings_id}
                                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="flex items-start gap-1">
                                                <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <FiBookOpen
                                                        className="text-slate-600"
                                                        size={17}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {training.training_title}
                                                    </p>
                                                    <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1 self-start sm:self-center">
                                                        Assigned
                                                    </span>

                                                </div>
                                            </div>


                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Course selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Courses
                                <span className="text-red-500"> *</span>
                            </label>

                            <Select
                                isMulti
                                options={selectableTrainings.map(training => ({
                                    value: Number(training.training_id),
                                    label: training.training_title,
                                }))}
                                value={selectedOptions}
                                onChange={handleTrainingSelect}
                                placeholder="Search and select courses..."
                                // noOptionsMessage={() =>
                                //     assignedTrainingIds.length > 0 &&
                                //         selectableTrainings.length === 0
                                //         ? "All available courses are already assigned."
                                //         : "No active courses available."
                                // }

                                noOptionsMessage={() =>
                                    selectableTrainings.length === 0
                                        ? assignedTrainings.length > 0
                                            ? "All available courses are already assigned."
                                            : "No active courses available."
                                        : "No matching courses found."
                                }
                                closeMenuOnSelect={false}
                                isDisabled={loading}
                                styles={{
                                    ...selectStyles,
                                    menuPortal: base => ({
                                        ...base,
                                        zIndex: 1100,
                                    }),
                                }}
                                menuPortalTarget={document.body}
                            />

                            {renderError(errors.trainings)}
                        </div>

                        {/* Selected courses */}
                        {selectedTrainings.length > 0 ? (
                            <div className="space-y-4">
                                {selectedTrainings.map((training, index) => (
                                    <div
                                        key={training.training_id}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#0E182B] text-white flex items-center justify-center">
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
                                                onClick={() =>
                                                    removeTraining(training.training_id)
                                                }
                                                disabled={loading}
                                                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                            >
                                                <FiTrash2 size={14} />
                                                Remove
                                            </button>
                                        </div>

                                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* User limit */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FiUsers size={14} />
                                                        Users limit
                                                        <span className="text-red-500">*</span>
                                                    </span>
                                                </label>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={training.training_users_limit}
                                                    onChange={e =>
                                                        handleFieldChange(
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
                                            </div>

                                            {/* Expiry */}
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
                                                    onChange={e =>
                                                        handleFieldChange(
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg py-10 px-4 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                    <FiBookOpen className="text-slate-500" size={22} />
                                </div>

                                <p className="text-sm font-medium text-gray-700">
                                    No Courses Selected
                                </p>

                                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                                    Select one or more courses above.
                                    Set a separate user limit and expiry
                                    date for each course.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 p-4 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium cursor-pointer min-h-[44px] disabled:opacity-50"

                        >
                            <X size={17} />
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || selectableTrainings.length === 0}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center justify-center gap-2 font-medium shadow disabled:opacity-50 cursor-pointer min-h-[44px]"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
        </div>
    );
};

export default AssignTrainigsModal;
