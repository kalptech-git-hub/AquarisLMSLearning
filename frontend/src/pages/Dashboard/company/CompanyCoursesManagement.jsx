import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useScrollToTop from "../../../hooks/useScrollToTop";
import CompanyCourseTable from "../../../components/company/CompanyCourseTable";
import CompanyCourseDetails from "../../../components/company/CompanyCourseDetails";

const CompanyCoursesManagement = ({ }) => {
    const [showDetails, setShowDetails] = useState(false);
    useScrollToTop(showDetails ? "details" : "table");

    const [companyCourses, setCompanyCourses] = useState([]);
    const [companyCoursesLoading, setCompanyCoursesLoading] = useState(false);



    // Fetch Company Courses
    const fetchCompanyCourses = async (signal) => {
        setCompanyCoursesLoading(true);

        try {
            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/company/courses`,
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

            console.log("Fetched company courses:", response.data.data);

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
                    // handleView={handleView}
                    // handleEnrollEmployee={handleEnrollEmployee}
                    />
                </>
            ) : (
                <CompanyCourseDetails
                    company={selectedCompany}
                    onBack={() => setShowDetails(false)}
                    handleEdit={handleEdit}
                />
            )}
        </div>
    )
};

export default CompanyCoursesManagement;