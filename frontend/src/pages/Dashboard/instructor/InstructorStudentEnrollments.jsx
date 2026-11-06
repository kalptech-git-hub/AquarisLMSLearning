import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import InstructorStudentEnrollmentTable from "../../../components/instructor/InstructorStudentEnrollmentTable";
import InstructorStudentEnrollmentDetails from "../../../components/instructor/InstructorStudentEnrollmentDetails";
import useScrollToTop from "../../../hooks/useScrollToTop.js"; 

const InstructorStudentEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingEnrollment, setViewingEnrollment] = useState(null);
    const navigate = useNavigate();

    useScrollToTop(viewingEnrollment ? "details" : "table");

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem("token");

                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/enrollments/instructor/students`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data.success) {
                    setEnrollments(res.data.enrollments || []);
                }
            } catch (error) {
                console.log("Fetch Instructor Enrollments Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, []);

    const handleView = (enrollment) => {
        setViewingEnrollment(enrollment);
    };

    return (
                <div className="space-y-4 pb-20">

            {!viewingEnrollment ? (
                <>

                    <h1 className="text-2xl font-bold text-slate-800 mb-4">
                        Student Enrollments
                    </h1>
                    <button
                        onClick={() => navigate("/instructor/dashboard")}
                        className="flex items-center gap-2 text-blue-900 cursor-pointer hover:underline mb-2"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>

                    <InstructorStudentEnrollmentTable
                        enrollments={enrollments}
                        loading={loading}
                        handleView={handleView}
                    />
                </>
            ) : (
                <InstructorStudentEnrollmentDetails
                    enrollment={viewingEnrollment}
                    setViewingEnrollment={() => setViewingEnrollment(null)}
                />
            )}
        </div>
    );
};

export default InstructorStudentEnrollments;