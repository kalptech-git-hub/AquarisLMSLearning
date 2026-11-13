import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import TrainingTable from "../../../components/TrainingManagement/TrainingTable";
import TrainingDetails from "../../../components/TrainingManagement/TrainingDetails";
import TrainingForm from "../../../components/TrainingManagement/TrainingForm";
import TopicForm from "../../../components/TrainingManagement/TopicForm";
import TopicManagement from "../../../components/TrainingManagement/TopicManagement";
import useScrollToTop from "../../../hooks/useScrollToTop.js";

const TrainingManagement = ({ }) => {

    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [showTopicForm, setShowTopicForm] = useState(false);
    const [showTopicManagement, setShowTopicManagement] = useState(false);



    useScrollToTop(
        showForm
            ? "form"
            : showTopicForm
                ? "topicForm"
                : showTopicManagement
                    ? "topicManagement"
                    : showDetails
                        ? "details"
                        : "table"
    );

    const [editingTopic, setEditingTopic] = useState(null);
    const [courseDetailsTab, setCourseDetailsTab] = useState("details"); //
    // const [editingCourseId, setEditingCourseId] = useState(null);
    const [editingTrainingId, setEditingTrainingId] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    /* To know the source of edit - table or details */
    const [editSource, setEditSource] = useState(null);

    const [topics, setTopics] = useState([]);
    const [loadingTopics, setLoadingTopics] = useState(true);


    
    /* DOUBLE TOAST PREVENTED */
    /* Actually fetching training- but anyway name is changed to Courses */
    /* Training Route */
    const fetchCourses = async (signal) => {
        try {
            setLoading(true);

            const token = sessionStorage.getItem('token');

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/trainings/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal,
                }
            );

            if (response.data.success) {
                // setCourses(response.data.courses);
                setCourses(response.data.trainings);
            }

            // console.log(response.data);

        } catch (error) {

            if (axios.isCancel(error)) {
                return;
            }
            console.error(error);

            toast.error(
                error.response?.data?.message || "Failed to fetch courses."
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchCourses(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);

    const handleView = (course) => {
        setSelectedCourse(course);
        setCourseDetailsTab("details");
        setShowDetails(true);
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setEditingTrainingId(course.training_id);

        setEditSource("table");
        setShowForm(true);
    };

    const handleEditFromDetails = (course) => {
        setSelectedCourse(course);
        setEditingTrainingId(course.training_id);
        setEditSource("details");
        setShowDetails(false);
        setShowForm(true);
    };

    const handleManageTopics = (course) => {
        setSelectedCourse(course);
        setShowTopicManagement(true);
    };


    const handleEditTopic = (topic) => {
        setEditingTopic(topic);

        setShowDetails(false);
        setShowTopicForm(true);
    };

    const fetchTopics = async () => {
        try {
            setLoadingTopics(true);

            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                // `${import.meta.env.VITE_API_BASE_URL}/api/topics/training/${course?.training_id}`,
                `${import.meta.env.VITE_API_BASE_URL}/api/topics/training/${selectedCourse?.training_id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setTopics(response.data.topics || []);
            } else {
                setTopics([]);
            }

        } catch (error) {
            console.error("Failed to fetch topics:", error);
            toast.error("Failed to load modules.");
            setTopics([]);
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleDeleteTopic = async (topic, onSuccess) => {
        try {

            const token = sessionStorage.getItem("token");

            const response = await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/topics/${topic.topic_id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success(response.data.message || "Module deleted successfully.");
                // fetchTopics();
                // await fetchTopics(selectedCourse.training_id);
                await onSuccess();
            }

        } catch (error) {
            console.error("Failed to delete topic:", error);
            toast.error(
                error.response?.data?.message || "Failed to delete module."
            );
        }

    };

    const handleFormSuccess = async () => {
        await fetchCourses();

        // if (editingCourseId) {
        if (editingTrainingId && editSource === "details") {
            try {
                const token = sessionStorage.getItem("token");

                // console.log("Before", selectedCourse.instructors);
                const response = await axios.get(
                    // `${import.meta.env.VITE_API_BASE_URL}/api/courses/${editingCourseId}`,
                    `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${editingTrainingId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    // console.log("After", response.data.training.instructors);
                    // setSelectedCourse(response.data.training);
                    setSelectedCourse({
                        ...response.data.training,
                        instructors: [...response.data.training.instructors],
                        books: [...response.data.training.books],
                    });
                    setShowForm(false);
                    setShowDetails(true);
                    return;
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            // Came from table or creating a new training
            setShowForm(false);
            setShowDetails(false);
        }

        // setShowForm(false);
        // setShowDetails(false);
        setEditingTrainingId(null);
        setEditSource(null);
    };

    return (
        <div className="relative">
            {!showForm && !showDetails && !showTopicManagement && !showTopicForm ? (
                <>
                    {/* Header */}
                    {/* was: className="flex justify-between items-center mb-6" */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            {/* was: className="text-2xl font-bold text-gray-800" */}
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                Manage Courses
                            </h1>
                            {/* <p className="text-gray-500 text-sm sm:text-base">
                                Manage all Courses in the system
                            </p> */}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    // setEditingCourseId(null);
                                    setEditingTrainingId(null);
                                    setShowForm(true);
                                }}
                                // was: className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2 cursor-pointer"
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto min-h-[44px]"
                            >
                                <FiPlus />
                                Add New Course
                            </button>




                        </div>
                    </div>

                    <TrainingTable
                        courses={courses}
                        loading={loading}
                        handleView={handleView}
                        handleEdit={handleEdit}
                        handleManageTopics={handleManageTopics}
                    />
                </>

            ) : showForm ? (

                <TrainingForm
                    editingTrainingId={editingTrainingId}
                    fetchCourses={fetchCourses}
                    setShowForm={setShowForm}
                    onSaveSuccess={handleFormSuccess}
                />

            ) : showTopicForm ? (

                <TopicForm
                    training={selectedCourse}
                    editingTopic={editingTopic}
                    onSuccess={async () => {
                        setShowTopicForm(false);

                        const token = sessionStorage.getItem("token");

                        const response = await axios.get(
                            `${import.meta.env.VITE_API_BASE_URL}/api/trainings/${selectedCourse.training_id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (response.data.success) {
                            setSelectedCourse({
                                ...response.data.training,
                                instructors: [...response.data.training.instructors],
                                books: [...response.data.training.books],
                            });
                        }

                        setCourseDetailsTab("topics");
                        setShowDetails(true);
                    }}
                    onCancel={() => {
                        setShowTopicForm(false);
                        setShowDetails(true);
                    }}
                />

            ) : showTopicManagement ? (


                // <TopicForm
                //     setShowTopicForm={setShowTopicForm}
                //     editingTopic={editingTopic}
                // />

                <TopicManagement
                    training={selectedCourse}
                    setShowTopicManagement={setShowTopicManagement}
                    fetchCourses={fetchCourses}
                    handleDeleteTopic={handleDeleteTopic}
                />

            ) : (
                <TrainingDetails
                    course={selectedCourse}
                    setViewingCourse={setShowDetails}
                    // handleEdit={handleEdit}
                    handleEdit={handleEditFromDetails}
                    handleEditTopic={handleEditTopic}
                    initialTab={courseDetailsTab}
                    handleDeleteTopic={handleDeleteTopic}
                />

            )}

        </div>
    );

};

export default TrainingManagement;

