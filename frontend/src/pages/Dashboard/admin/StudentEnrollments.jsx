import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import StudentEnrollmentTable from "../../../components/StudenEnrollment/StudentEnrollmentTable";
import StudentEnrollmentDetails from "../../../components/StudenEnrollment/StudentEnrollmentDetails";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../../../services/notificationSocket";
import useScrollToTop from "../../../hooks/useScrollToTop.js";

const StudentEnrollments = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [showDetails, setShowDetails] = useState(false);

    useScrollToTop(showDetails ? "details" : "table");

    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    const [enrollments, setEnrollments] = useState([]);

    const [loading, setLoading] = useState(false);

    // HIGH LIGHT ENROLLMENT - WHEN CLICKED FROM NOTIFICATION BELL.
    const [highlightedEnrollment, setHighlightedEnrollment] = useState(null);


    const handleView = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowDetails(true);
    };

    useEffect(() => {
        const handleNewNotification = (notification) => {
            // Refetch table data live whenever a notification arrives
            fetchEnrollments();
        };
        socket.on("notification:new", handleNewNotification);
        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, []);

    /* PREVIOUS WHICH WAS GIVING DOUBLE TOAST. */
    // const fetchEnrollments = async () => {

    //     setLoading(true);

    //     try {

    //         const token = sessionStorage.getItem("token");

    //         const response = await axios.get(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/admin`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             }
    //         );
    //         // console.log(response);

    //         if (response.data.success) {
    //             setEnrollments(response.data.enrollments || []);
    //         } else {
    //             setEnrollments([]);
    //         }

    //     } catch (error) {

    //         console.error(error);

    //         toast.error(
    //             error.response?.data?.message ||
    //             "Failed to fetch enrollments."
    //         );

    //         setEnrollments([]);

    //     } finally {

    //         setLoading(false);

    //     }

    // };

    // useEffect(() => {
    //     fetchEnrollments();
    // }, []);

    /* DOUBLE TOAST PREVENTED */
    const fetchEnrollments = async (signal) => {

        setLoading(true);

        try {

            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/admin`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    signal,
                }
            );
            // console.log(response);

            if (response.data.success) {
                setEnrollments(response.data.enrollments || []);
            } else {
                setEnrollments([]);
            }

        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            }
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch enrollments."
            );

            setEnrollments([]);

        } finally {

            if (!signal?.aborted) {
                setLoading(false);
            }
        }

    };

    useEffect(() => {
        const controller = new AbortController();

        fetchEnrollments(controller.signal);
        return () => {
            controller.abort();
        };
    }, []);



    // HIGHT LIGHT USEFFECT FOR ENROLLMENT
    // useEffect(() => {

    //     if (!location.state?.enroll_id) {
    //         return;
    //     }

    //     if (!enrollments.length) {
    //         return;
    //     }

    //     const enrollId = Number(location.state.enroll_id);

    //     const enrollment = enrollments.find(
    //         (item) => Number(item.enroll_id) === enrollId
    //     );

    //     if (!enrollment) {
    //         console.log(
    //             "Enrollment from notification not found:",
    //             enrollId
    //         );
    //         return;
    //     }

    //     console.log(
    //         "🎯 Focusing enrollment:",
    //         enrollment
    //     );

    //     setHighlightedEnrollment(enrollId);

    //     // Scroll to the row
    //     setTimeout(() => {

    //         const row = document.getElementById(
    //             `enrollment-${enrollId}`
    //         );

    //         if (row) {

    //             row.scrollIntoView({
    //                 behavior: "smooth",
    //                 block: "center"
    //             });

    //         }

    //     }, 100);

    //     // Remove highlight after 4 seconds
    //     const timer = setTimeout(() => {
    //         setHighlightedEnrollment(null);
    //     }, 4000);

    //     // IMPORTANT:
    //     // Remove notification navigation state
    //     // window.history.replaceState(
    //     //     {},
    //     //     document.title,
    //     //     window.location.pathname
    //     // );

    //     // Consume the navigation state
    //     navigate(location.pathname, {
    //         replace: true,
    //         state: {}
    //     });

    //     return () => clearTimeout(timer);

    // }, [location.state, enrollments, navigate, location.pathname]);


    /* */
    // useEffect(() => {

    //     const enrollId = location.state?.enroll_id;

    //     if (!enrollId || !enrollments.length) {
    //         return;
    //     }

    //     const numericEnrollId = Number(enrollId);

    //     const enrollment = enrollments.find(
    //         (item) => Number(item.enroll_id) === numericEnrollId
    //     );

    //     if (!enrollment) {
    //         return;
    //     }

    //     console.log("🎯 Focusing enrollment:", numericEnrollId);

    //     setHighlightedEnrollment(numericEnrollId);

    //     setTimeout(() => {

    //         const row = document.getElementById(
    //             `enrollment-${numericEnrollId}`
    //         );

    //         if (row) {
    //             row.scrollIntoView({
    //                 behavior: "smooth",
    //                 block: "center"
    //             });
    //         }

    //     }, 150);

    //     const timer = setTimeout(() => {
    //         setHighlightedEnrollment(null);
    //     }, 4000);

    //     // Consume the navigation state
    //     navigate(location.pathname, {
    //         replace: true,
    //         state: {}
    //     });

    //     return () => clearTimeout(timer);

    // }, [location.state, enrollments, navigate, location.pathname]);

    useEffect(() => {

        const enrollId = location.state?.enroll_id;

        if (!enrollId || !enrollments.length) {
            return;
        }

        const numericEnrollId = Number(enrollId);

        const enrollment = enrollments.find(
            (item) => Number(item.enroll_id) === numericEnrollId
        );

        if (!enrollment) {
            return;
        }

        console.log("🎯 Focusing enrollment:", numericEnrollId);

        setHighlightedEnrollment(numericEnrollId);

        // Wait for the table row to render
        setTimeout(() => {

            const row = document.getElementById(
                `enrollment-${numericEnrollId}`
            );

            if (row) {
                row.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        }, 150);

        // Consume navigation state
        navigate(location.pathname, {
            replace: true,
            state: {}
        });

    }, [location.state, enrollments, navigate, location.pathname]);

    useEffect(() => {

        if (!highlightedEnrollment) {
            return;
        }

        const timer = setTimeout(() => {

            console.log("✨ Removing enrollment highlight");

            setHighlightedEnrollment(null);

        }, 4000);

        return () => clearTimeout(timer);

    }, [highlightedEnrollment]);

    return (

        <div className="relative">

            {!showDetails ? (

                <>

                    <div className="mb-6 sm:min-h-[44px] flex items-center">

                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Manage Student Enrollments
                        </h1>

                        {/* <p className="text-sm sm:text-base text-gray-500">
                            View and manage student enrollment requests.
                        </p> */}

                    </div>

                    <StudentEnrollmentTable
                        enrollments={enrollments}
                        loading={loading}
                        handleView={handleView}
                        highlightedEnrollment={highlightedEnrollment}
                    />

                </>

            ) : (

                <StudentEnrollmentDetails
                    enrollment={selectedEnrollment}
                    setViewingEnrollment={setShowDetails}
                    fetchEnrollments={fetchEnrollments}
                />

            )}

        </div>

    );

};

export default StudentEnrollments;