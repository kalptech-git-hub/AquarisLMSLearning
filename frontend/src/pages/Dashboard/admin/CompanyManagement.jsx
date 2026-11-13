import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import CompanyDetails from "../../../components/CompanyManagement/CompanyDetails";
import CompanyForm from "../../../components/CompanyManagement/CompanyForm";
import CompanyTable from "../../../components/CompanyManagement/CompanyTable";
import useScrollToTop from "../../../hooks/useScrollToTop.js";


const CompanyManagement = ({ }) => {

    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useScrollToTop(
        showForm
            ? "form"
            : showDetails
                ? "details"
                : "table"
    );

    const [editingCompanyId, setEditingCompanyId] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    /* To know the source of edit - table or details */
    const [editSource, setEditSource] = useState(null);

    const fetchCompanies = async (signal) => {
        try {
            setLoading(true);

            const token = sessionStorage.getItem('token');

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/company/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal,
                }
            );

            console.log("Fetched companies:", response.data.companies);
            if (response.data.success) {
                setCompanies(response.data.companies);
            }

            console.log(response.data);

        } catch (error) {

            if (axios.isCancel(error)) {
                return;
            }
            console.error(error);

            toast.error(
                error.response?.data?.message || "Failed to fetch companies."
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchCompanies(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);


    // const handleView = (company) => {
    //     setSelectedCompany(company);
    //     setCompanyDetailsTab("details");
    //     setShowDetails(true);
    // };

    const handleView = (company) => {
        setSelectedCompany(company);
        setShowDetails(true);
    };

    const handleEdit = (company) => {
        setSelectedCompany(company);
        setEditingCompanyId(company.company_id);

        setEditSource("table");
        setShowForm(true);
    };

    const handleEditFromDetails = (company) => {
        setSelectedCompany(company);
        setEditingCompanyId(company.company_id);
        setEditSource("details");
        setShowDetails(false);
        setShowForm(true);
    };

    const handleFormSuccess = async () => {
        await fetchCompanies();

        if (editingCompanyId && editSource === "details") {
            try {
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
                    setSelectedCompany({
                        ...response.data.company,
                    });
                    setShowForm(false);
                    setShowDetails(true);
                    return;
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            // Came from table or creating a new company
            setShowForm(false);
            setShowDetails(false);
        }

        setEditingCompanyId(null);
        setEditSource(null);
    };

    return (
        <div className="relative">
            {!showForm && !showDetails ? (
                <>
                    {/* Header */}
                    {/* was: className="flex justify-between items-center mb-6" */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            {/* was: className="text-2xl font-bold text-gray-800" */}
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                Manage Companies
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* <button
                                onClick={() => {
                                    // setEditingCourseId(null);
                                    setEditingCompanyId(null);
                                    setShowForm(true);
                                }}
                                // was: className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2 cursor-pointer"
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto min-h-[44px]"
                            >
                                <FiPlus />
                                Add New Company
                            </button> */}

                        </div>
                    </div>

                    <CompanyTable
                        companies={companies}
                        loading={loading}
                        handleView={handleView}
                        handleEdit={handleEdit}
                    />
                </>

            ) : showForm ? (

                <CompanyForm
                    editingCompanyId={editingCompanyId}
                    fetchCompanies={fetchCompanies}
                    setShowForm={setShowForm}
                    onSaveSuccess={handleFormSuccess}
                />

            ) : (
                <CompanyDetails
                    company={selectedCompany}
                    setViewingCompany={setShowDetails}
                    handleEdit={handleEditFromDetails}
                />

            )}

        </div>
    )
};

export default CompanyManagement;