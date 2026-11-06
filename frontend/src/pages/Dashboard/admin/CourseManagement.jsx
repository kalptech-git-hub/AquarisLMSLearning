import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import CourseForm from "../../../components/courseManagement/CourseForm";
import CourseDetails from "../../../components/courseManagement/CourseDetails";
import useScrollToTop from "../../../hooks/useScrollToTop.js";
import CourseTable from "../../../components/CourseManagement/CourseTable.jsx";

const CourseManagement = ({ }) => {
    const [courses, setCourses] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [editingCourseId, setEditingCourseId] = useState(null);
    const [courseDetailsTab, setCourseDetailsTab] = useState("details"); //

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    /* To know the source of edit - table or details */
    const [editSource, setEditSource] = useState(null);

    // Reset scroll to top 
    useScrollToTop(showForm ? "form" : showDetails ? "details" : "table");


    /* PREVIOUS WHICH WAS GIVING DOUBLE TOAST. */
    // const fetchCourses = async () => {
    //     try {
    //         setLoading(true);

    //         const token = sessionStorage.getItem('token');

    //         const response = await axios.get(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/courses/getCoursesForCourseTable`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );

    //         if (response.data.success) {
    //             setCourses(response.data.courses);
    //         }

    //         // console.log(response.data);

    //     } catch (error) {
    //         console.error(error);

    //         toast.error(
    //             error.response?.data?.message || "Failed to fetch courses."
    //         );
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchCourses();
    // }, []);

    /* DOUBLE TOAST PREVENTED */
    const fetchCourses = async (signal) => {
        try {
            setLoading(true);

            const token = sessionStorage.getItem('token');

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/courses/getCoursesForCourseTable`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal,
                }
            );

            if (response.data.success) {
                setCourses(response.data.courses);
            }

            // console.log(response.data);

        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            }
            console.error(error);

            toast.error(
                error.response?.data?.message || "Failed to fetch course categories."
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
        setEditingCourseId(course.course_id);

        setEditSource("table");
        setShowForm(true);
    };

    const handleEditFromDetails = (course) => {
        setSelectedCourse(course);
        setEditingCourseId(course.course_id);
        setEditSource("details");
        setShowDetails(false);
        setShowForm(true);
    };

    const handleFormSuccess = async () => {
        await fetchCourses();

        if (editingCourseId && editSource === "details") {
            try {
                const token = sessionStorage.getItem("token");

                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/courses/${editingCourseId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setSelectedCourse(response.data.course);

                    setShowForm(false);
                    setShowDetails(true);
                    return;
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            // Came from table or creating a new course
            setShowForm(false);
            setShowDetails(false);
        }

        // Create mode
        // setShowForm(false);
        // setShowDetails(false);
        setEditingCourseId(null);
        setEditSource(null);
    };

    return (
        <div className="relative">
            {!showForm && !showDetails ? (
                <>
                    {/* Header */}
                    {/* was:
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Course Management
                            </h1>
                            <p className="text-gray-500">
                                Manage all Course in the system
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setEditingCourseId(null);
                                    setShowForm(true);
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2 cursor-pointer"
                            >
                                <FiPlus />
                                Add New Course
                            </button>
                        </div>
                    </div>
                    */}
                    {/* Header block pattern (matches TrainingManagement.jsx): flex-col on phone
                        so the title/subtitle and the button don't fight for space at 375px,
                        flex-row + justify-between from sm: up. Font sizes step down on phone,
                        button goes full-width with a 44px min-height touch target on phone
                        and reverts to auto-width from sm: up. */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                Manage Course Categories
                            </h1>
                            {/* <p className="text-sm sm:text-base text-gray-500">
                                Manage all Course Categories in the system
                            </p> */}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setEditingCourseId(null);
                                    setShowForm(true);
                                }}
                                className="w-full sm:w-auto min-h-[44px] bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <FiPlus />
                                Add New Course Category
                            </button>
                        </div>
                    </div>

                    <CourseTable
                        courses={courses}
                        loading={loading}
                        handleView={handleView}
                        handleEdit={handleEdit}
                    />
                </>
            ) : showForm ? (
                <CourseForm
                    editingCourseId={editingCourseId}
                    fetchCourses={fetchCourses}
                    setShowForm={setShowForm}
                    onSaveSuccess={handleFormSuccess}
                />
            ) : (
                <CourseDetails
                    course={selectedCourse}
                    setViewingCourse={setShowDetails}
                    handleEdit={handleEditFromDetails}
                    initialTab={courseDetailsTab}
                />
            )}
        </div>
    );
};

export default CourseManagement;