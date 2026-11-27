import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useScrollToTop from "../../../hooks/useScrollToTop";
import CompanyCourseTable from "../../../components/company/CompanyCourseTable";
import CompanyCourseDetails from "../../../components/company/CompanyCourseDetails";
import { socket } from "../../../services/notificationSocket";
import { useLocation, useNavigate } from "react-router-dom";

const CompanyCoursesManagement = ({ }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [showDetails, setShowDetails] = useState(false);
    useScrollToTop(showDetails ? "details" : "table");

    const [companyCourses, setCompanyCourses] = useState([]);
    const [companyCoursesLoading, setCompanyCoursesLoading] = useState(false);

    const [selectedCompanyCourses, setSelectedCompanyCourses] = useState(null);

    // HIGH LIGHT Training - WHEN CLICKED FROM NOTIFICATION BELL.
    const [highlightedTraining, setHighlightedTraining] = useState(null);


    useEffect(() => {
        const handleNewNotification = (notification) => {
            // Refetch table data live whenever a notification arrives
            fetchCompanyCourses();
        };
        socket.on("notification:new", handleNewNotification);
        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, []);

    // Fetch Company Courses
    const fetchCompanyCourses = async (signal) => {
        setCompanyCoursesLoading(true);

        try {
            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                // `${import.meta.env.VITE_API_BASE_URL}/api/company/courses`,
                `${import.meta.env.VITE_API_BASE_URL}/api/company/trainings`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal,
                }
            );

            if (response.data?.success) {
                setCompanyCourses(response.data.data || []);
            } else {
                setCompanyCourses([]);
            }


        } catch (error) {
            if (axios.isCancel(error) || error.code === "ERR_CANCELED") return;

            console.error("Failed to fetch company courses:", error);
            toast.error("Failed to fetch company courses.");
            setCompanyCourses([]);

        } finally {
            if (!signal?.aborted) {
                setCompanyCoursesLoading(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchCompanyCourses(controller.signal);

        return () => controller.abort();
    }, []);

    // Highlight course when opened from notification
    // useEffect(() => {
    //     const trainingId = location.state?.training_id;

    //     if (!trainingId || !companyCourses.length) {
    //         return;
    //     }

    //     const numericTrainingId = Number(trainingId);

    //     const course = companyCourses.find(
    //         (item) => Number(item.training_id) === numericTrainingId
    //     );

    //     if (!course) {
    //         console.log("Course from notification not found:", numericTrainingId);
    //         return;
    //     }

    //     console.log("Focusing assigned course:", numericTrainingId);

    //     setHighlightedTraining(numericTrainingId);

    //     // Wait for the table row to render
    //     setTimeout(() => {

    //         const row = document.getElementById(
    //             `company-course-${numericTrainingId}`
    //         );

    //         if (row) {
    //             row.scrollIntoView({
    //                 behavior: "smooth",
    //                 block: "center"
    //             });
    //         }

    //     }, 150);

    //     // Consume navigation state so it does not highlight again on refresh/navigation
    //     navigate(location.pathname, {
    //         replace: true,
    //         state: {},
    //     });

    // }, [location.state, location.pathname, companyCourses, navigate]);

    useEffect(() => {
        const trainingId = location.state?.training_id;

        if (!trainingId || companyCoursesLoading || !companyCourses.length) {
            return;
        }

        const numericTrainingId = Number(trainingId);

        const course = companyCourses.find(
            item => Number(item.training_id) === numericTrainingId
        );

        console.log("Matching course:", course);

        if (!course) {
            return;
        }


        setHighlightedTraining(numericTrainingId);

        navigate(location.pathname, {
            replace: true,
            state: {},
        });

    }, [
        location.state,
        location.pathname,
        companyCourses,
        companyCoursesLoading,
        navigate,
    ]);

    // Remove highlight after 4 seconds
    useEffect(() => {
        if (!highlightedTraining) return;

        const timer = setTimeout(() => {
            console.log("✨ Removing course highlight");

            setHighlightedTraining(null);
        }, 4000);

        return () => clearTimeout(timer);
    }, [highlightedTraining]);


    const handleView = (companyCourses) => {
        setSelectedCompanyCourses(companyCourses);
        setShowDetails(true);
    };

    return (
        <div className="relative">
            {!showDetails ? (
                <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                Company Courses
                            </h1>
                            <p className="text-sm text-slate-500">
                                Manage all courses under your organization
                            </p>
                        </div>


                    </div>

                    {/* Table */}
                    <CompanyCourseTable
                        companyCourses={companyCourses}
                        companyCoursesLoading={companyCoursesLoading}
                        handleView={handleView}
                        highlightedTraining={highlightedTraining}
                    // handleEnrollEmployee={handleEnrollEmployee}
                    />
                </>
            ) : (
                <CompanyCourseDetails
                    companyCourses={selectedCompanyCourses}
                    onBack={() => setShowDetails(false)}
                // handleEdit={handleEdit}
                />
            )}
        </div>
    )
};

export default CompanyCoursesManagement;