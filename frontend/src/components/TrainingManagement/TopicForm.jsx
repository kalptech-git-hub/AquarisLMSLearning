//TopicForm.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiArrowLeft, FiSave, FiLock, FiInfo } from "react-icons/fi";
import RichTextEditor from "./RichTextEditor.jsx";
import Select from "react-select";
import { selectStyles } from "../../utils/selectStyles.js";


const TopicForm = ({
    training,
    editingTopic = null,
    onSuccess,
    onCancel,
}) => {


    const [topicData, setTopicData] = useState({
        training_id: training.training_id,
        topic_title: editingTopic?.topic_title || "",
        topic_description: editingTopic?.topic_description || "",
    });


    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const isModuleTitleDisabled = Boolean(
        editingTopic && (
            training?.publish_status === "PUBLISHED" ||
            (editingTopic?.lesson_count && Number(editingTopic.lesson_count) > 0) ||
            (editingTopic?.topic_recording_count && Number(editingTopic.topic_recording_count) > 0)
        )
    );

    useEffect(() => {
        if (editingTopic) {
            setTopicData({
                training_id: editingTopic.training_id || "",
                topic_title: editingTopic.topic_title || "",

                topic_description: editingTopic.topic_description || "",
            });
        }
    }, [editingTopic]);


    // const handleDurationPartChange = (part, value) => {
    //     const max = part === "hr" ? 23 : 59;
    //     const clamped = Math.min(Math.max(Number(value) || 0, 0), max);

    //     const updatedParts = { ...durationParts, [part]: clamped };
    //     setDurationParts(updatedParts);

    //     setTopicData((prev) => ({
    //         ...prev,
    //         topic_duration: buildDuration(
    //             updatedParts.hr,
    //             updatedParts.min,
    //             updatedParts.sec
    //         ),
    //     }));

    //     if (errors.topic_duration) {
    //         setErrors((prev) => ({ ...prev, topic_duration: "" }));
    //     }
    // };

    // Fetch existing courses to populate the "select course" dropdown





    const validate = () => {

        const tempErrors = {};

        if (!topicData.topic_title.trim()) {
            tempErrors.topic_title = "Module name is required";
        } else if (
            topicData.topic_title.length < 3 ||
            topicData.topic_title.length > 200
        ) {
            tempErrors.topic_title =
                "Module name must be between 3 and 200 characters";
        }


        // if (!topicData.topic_duration || topicData.topic_duration === "00:00:00") {
        //     tempErrors.topic_duration =
        //         "Video duration is required";
        // }

        if (!topicData.topic_description.trim()) {
            tempErrors.topic_description =
                "Module description is required";
        } else if (topicData.topic_description.length < 10) {
            tempErrors.topic_description =
                "Description must be at least 10 characters";
        } else if (topicData.topic_description.length > 700) {
            tempErrors.topic_description =
                "Description must not exceed 700 characters";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;

    };

    const handleChange = (e) => {

        const { name, value } = e.target;
        if (name === "topic_title" && isModuleTitleDisabled) return;

        setTopicData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

    };

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
                training_id: topicData.training_id,
                topic_title: topicData.topic_title,
                // topic_duration: topicData.topic_duration,
                topic_description: topicData.topic_description,
            };

            const response = editingTopic
                ? await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/api/topics/${editingTopic.topic_id}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                : await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/topics/`,
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
                    (editingTopic
                        ? "Module updated successfully!"
                        : "Module created successfully!")
                );

                // setShowTopicForm(false);
                onSuccess();

            }

        } catch (error) {

            console.error("API error saving topic:", error);

            const errMsg =
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to save module.";

            toast.error(errMsg);

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 w-full overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        // onClick={() => setShowTopicForm(false)}
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600 cursor-pointer"
                        // title="Back to Topic Management"
                        title="Back to Module Management"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {/* {editingTopic ? "Edit Topic" : "Add New Topic"} */}
                            {editingTopic ? "Edit Module" : "Add New Module"}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {/* Manage topics for this training. */}
                            Manage modules for this course.
                        </p>
                    </div>
                </div>
            </div>



            <form onSubmit={handleSubmit} className="p-6 space-y-6">

                <div>
                    {/* <h3 className="text-sm font-semibold uppercase tracking-wider text-[#0E182B] mb-4">
                        Topic Details
                    </h3> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course
                            </label>

                            <div className="bg-slate-50 border rounded-md px-3 py-2">

                                <p className="font-medium text-gray-800">
                                    {training.training_title}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {training.course_name}
                                </p>

                            </div>

                        </div>
                        {/* Topic Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                                {/* Topic Name  */}
                                Module Name 
                                <span className="text-red-500">*</span>
                                {isModuleTitleDisabled && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                                        <FiLock size={10} /> Locked
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                name="topic_title"
                                value={topicData.topic_title}
                                onChange={handleChange}
                                placeholder="e.g. Introduction to Hiragana"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition ${
                                    isModuleTitleDisabled
                                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed select-none"
                                        : errors.topic_title
                                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                    }`}
                                disabled={isModuleTitleDisabled || loading}
                                title={isModuleTitleDisabled ? "Module name cannot be edited once published or lessons are added." : ""}
                            />
                            {isModuleTitleDisabled ? (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                    <FiInfo size={12} className="shrink-0" />
                                    Module name cannot be edited once published or lessons are added.
                                </p>
                            ) : errors.topic_title ? (
                                <p className="text-xs text-red-500 mt-1">{errors.topic_title}</p>
                            ) : null}
                        </div>

                        {/* Video Duration */}
                        {/* duration not needed on topics, commented out
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Video Duration <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="w-full">
                                        <input
                                            type="number"
                                            min={0}
                                            max={23}
                                            value={durationParts.hr}
                                            onChange={(e) => handleDurationPartChange("hr", e.target.value)}
                                            placeholder="HH"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition text-right ${
                                                errors.topic_duration
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                            }`}
                                            disabled={loading}
                                        />
                                        <p className="text-[10px] text-gray-400 text-center mt-0.5">hrs</p>
                                    </div>

                                    <span className="text-gray-400 pb-4">:</span>

                                    <div className="w-full">
                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={durationParts.min}
                                            onChange={(e) => handleDurationPartChange("min", e.target.value)}
                                            placeholder="MM"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition text-right ${
                                                errors.topic_duration
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                            }`}
                                            disabled={loading}
                                        />
                                        <p className="text-[10px] text-gray-400 text-center mt-0.5">min</p>
                                    </div>

                                    <span className="text-gray-400 pb-4">:</span>

                                    <div className="w-full">
                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={durationParts.sec}
                                            onChange={(e) => handleDurationPartChange("sec", e.target.value)}
                                            placeholder="SS"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition text-right ${
                                                errors.topic_duration
                                                    ? "border-red-500 focus:ring-red-500"
                                                    : "border-gray-300 focus:ring-slate-500 focus:border-slate-500"
                                            }`}
                                            disabled={loading}
                                        />
                                        <p className="text-[10px] text-gray-400 text-center mt-0.5">sec</p>
                                    </div>
                                </div>
                                {errors.topic_duration && (
                                    <p className="text-xs text-red-500 mt-1">{errors.topic_duration}</p>
                                )}
                            </div>
                            */}

                        {/* Topic Description */}
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    {/* Topic Description  */}
                                    Module Description 
                                    <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-[10px] font-semibold transition-colors ${(topicData.topic_description || "").length >= 700 ? "text-green-600 font-bold" : "text-slate-400"}`}>
                                    {Math.min((topicData.topic_description || "").length, 700)}/700 characters
                                </span>
                            </div>
                            <RichTextEditor
                                value={topicData.topic_description}
                                onChange={(val) => {
                                    const safeVal = (val || "").slice(0, 700);
                                    setTopicData((prev) => ({
                                        ...prev,
                                        topic_description: safeVal,
                                    }));
                                    if (errors.topic_description) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            topic_description: "",
                                        }));
                                    }
                                }}
                                placeholder="Describe what this module covers..."
                                disabled={loading}
                                maxLength={700}
                            />
                            {errors.topic_description && (
                                <p className="text-xs text-red-500 mt-1">{errors.topic_description}</p>
                            )}
                            {(topicData.topic_description || "").length >= 700 && !errors.topic_description && (
                                <p className="text-xs text-red-500 mt-1">Maximum limit of 700 characters reached.</p>
                            )}
                        </div>

                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    <button
                        type="button"
                        // onClick={() => setShowTopicForm(false)}
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-700 font-medium cursor-pointer"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded flex items-center gap-2 font-medium transition shadow disabled:opacity-50 cursor-pointer"
                        disabled={loading}
                    >
                        <FiSave />
                        {/* {loading ? (editingTopic ? "Updating..." : "Creating...") : (editingTopic ? "Update Topic" : "Create Topic")} */}
                        {loading ? (editingTopic ? "Updating..." : "Creating...") : (editingTopic ? "Update Module" : "Create Module")}
                    </button>
                </div>

            </form>



        </div>
    );
};

export default TopicForm;


