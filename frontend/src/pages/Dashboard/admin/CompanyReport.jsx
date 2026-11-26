import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import useScrollToTop from "../../../hooks/useScrollToTop.js";
import CompanyReportTable from "../../../components/CompanyReport/CompanyReportTable.jsx";
import CompanyReportDetails from "../../../components/CompanyReport/CompanyReportDetails.jsx";

const CompanyReport = ({ }) => {

    const [showDetails, setShowDetails] = useState(false);
    useScrollToTop(showDetails ? "details" : "table");
    const [selectedReport, setSelectedReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleView = (report) => {
        setSelectedReport(report);
        setShowDetails(true);
    };

    const fetchReports = async (signal) => {
            try {
                setLoading(true);
    
                const token = sessionStorage.getItem('token');
    
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/company/company-training`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal,
                    }
                );
    
                console.log("Fetched Reports:", response.data.report);
                if (response.data.success) {
                    setReports(response.data.report);
                }
    
                console.log(response.data);
    
            } catch (error) {
    
                if (axios.isCancel(error)) {
                    return;
                }
                console.error(error);
    
                toast.error(
                    error.response?.data?.message || "Failed to fetch reports."
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        };
    
        useEffect(() => {
            const controller = new AbortController();
    
            fetchReports(controller.signal);
    
            return () => {
                controller.abort();
            };
        }, []);

    return (
        // <div>CompanyTrainingReport</div>
        <div className="relative">
            {!showDetails ? (
                <>
                    {/* Header */}
                    {/* was: className="flex justify-between items-center" */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>
                            {/* was: className="text-3xl font-bold text-slate-800"*/}
                            <h1 className="text-2xl font-bold text-slate-800">
                                Company Course Report
                            </h1>

                            {/* was: className="text-base text-slate-500"*/}
                            {/* <p className="text-sm text-slate-500">
                                        Manage all Instructors in the system
                                    </p> */}
                        </div>

                        {/* <button
                            onClick={() => {
                                setSelectedUser(null);
                                setEditingUserId(null);
                                setShowForm(true);
                            }}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg cursor-pointer"
                        >
                            + Add New Instructor
                        </button> */}

                    </div>

                    <CompanyReportTable
                        reports={reports}
                        loading={loading}
                        handleView={handleView}
                        // handleEdit={handleEdit}
                    />
                </>
            ) : (
                <CompanyReportDetails
                    reports={selectedReport}
                    setViewingReport={setShowDetails}
                    // handleEdit={handleEdit}
                />
            )}
        </div>
    )
};

export default CompanyReport;