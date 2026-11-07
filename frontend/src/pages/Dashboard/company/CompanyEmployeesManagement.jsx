import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import EmployeeTable from "../../../components/company/EmployeeTable";
import EmployeeForm from "../../../components/company/EmployeeForm";
import EmployeeDetails from "../../../components/company/EmployeeDetails";
import useScrollToTop from "../../../hooks/useScrollToTop";


const DUMMY_EMPLOYEES = [
  {
    user_id: 1,
    user_full_name: "Rahul Verma",
    user_email: "rahul.v@company.com",
    user_mobile_no: "9876543210",
    emp_department: "Engineering",
    emp_code: "EMP-001",
    is_active: 1,
    enrolled_courses_count: 2,
    created_at: "2026-03-01",
  },
  {
    user_id: 2,
    user_full_name: "Pooja Sharma",
    user_email: "pooja.s@company.com",
    user_mobile_no: "9876543211",
    emp_department: "Marketing",
    emp_code: "EMP-002",
    is_active: 1,
    enrolled_courses_count: 1,
    created_at: "2026-03-02",
  },
  {
    user_id: 3,
    user_full_name: "Amit Kulkarni",
    user_email: "amit.k@company.com",
    user_mobile_no: "9876543212",
    emp_department: "Human Resources",
    emp_code: "EMP-003",
    is_active: 1,
    enrolled_courses_count: 3,
    created_at: "2026-03-05",
  },
  {
    user_id: 4,
    user_full_name: "Sneha Patil",
    user_email: "sneha.p@company.com",
    user_mobile_no: "9876543213",
    emp_department: "Finance",
    emp_code: "EMP-004",
    is_active: 0,
    enrolled_courses_count: 0,
    created_at: "2026-03-08",
  },
  {
    user_id: 5,
    user_full_name: "Karan Mehta",
    user_email: "karan.m@company.com",
    user_mobile_no: "9876543214",
    emp_department: "Engineering",
    emp_code: "EMP-005",
    is_active: 1,
    enrolled_courses_count: 2,
    created_at: "2026-03-10",
  },
  {
    user_id: 6,
    user_full_name: "Neha Joshi",
    user_email: "neha.j@company.com",
    user_mobile_no: "9876543215",
    emp_department: "Sales",
    emp_code: "EMP-006",
    is_active: 1,
    enrolled_courses_count: 1,
    created_at: "2026-03-12",
  },
];

const CompanyEmployeesManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  useScrollToTop(showDetails ? "details" : "table");

  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  // const [employees, setEmployees] = useState([]);
  const [employees, setEmployees] = useState(DUMMY_EMPLOYEES);
  const [loading, setLoading] = useState(false);

  // Fetch all employees under this company
  const fetchEmployees = async (signal) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/company/employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        }
      );

      // if (response.data?.success) {
      //   setEmployees(response.data.data || []);
      // } else {
      //   setEmployees([]);
      // }

      if (
        response.data?.success &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error("Failed to fetch employees:", error);
      // Demo fallback if backend is not yet plugged in
      // setEmployees([
      //   {
      //     user_id: 1,
      //     user_full_name: "Rahul Verma",
      //     user_email: "rahul.v@company.com",
      //     user_mobile_no: "9876543210",
      //     emp_department: "Engineering",
      //     emp_code: "EMP-001",
      //     is_active: 1,
      //     enrolled_courses_count: 2,
      //     created_at: "2026-03-01",
      //   },
      //   {
      //     user_id: 2,
      //     user_full_name: "Pooja Sharma",
      //     user_email: "pooja.s@company.com",
      //     user_mobile_no: "9876543211",
      //     emp_department: "Marketing",
      //     emp_code: "EMP-002",
      //     is_active: 1,
      //     enrolled_courses_count: 1,
      //     created_at: "2026-03-02",
      //   },
      // ]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchEmployees(controller.signal);
    return () => controller.abort();
  }, []);

  const handleView = async (employee) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/company/employees/${employee.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        setSelectedEmployee(response.data.data);
      } else {
        setSelectedEmployee(employee);
      }
    } catch (error) {
      setSelectedEmployee(employee);
    }
    setShowDetails(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditingEmployeeId(employee.user_id);
    setShowDetails(false);
    setShowForm(true);
  };

  const handleFormSuccess = async () => {
    await fetchEmployees();
    setShowForm(false);
    setEditingEmployeeId(null);
    setShowDetails(false);
  };

  return (
    <div className="relative">
      {!showForm && !showDetails ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Company Employees
              </h1>
              <p className="text-sm text-slate-500">
                Manage all registered learners under your organization
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedEmployee(null);
                setEditingEmployeeId(null);
                setShowForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition cursor-pointer"
            >
              <FiPlus size={18} />
              Add New Employee
            </button>
          </div>

          {/* Table */}
          <EmployeeTable
            employees={employees}
            loading={loading}
          // handleView={handleView}
          // handleEdit={handleEdit}
          />
        </>
      ) : showForm ? (
        <EmployeeForm
          editingEmployeeId={editingEmployeeId}
          onCancel={() => {
            setShowForm(false);
            setEditingEmployeeId(null);
          }}
          onSuccess={handleFormSuccess}
        />
      ) : (
        <EmployeeDetails
          employee={selectedEmployee}
          onBack={() => setShowDetails(false)}
          handleEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default CompanyEmployeesManagement;