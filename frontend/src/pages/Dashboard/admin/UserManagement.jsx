import { useState, useEffect } from "react";
import UserForm from "../../../components/UserManagement/UserForm";
import UserTable from "../../../components/UserManagement/UserTable";
import UserDetails from "../../../components/UserManagement/UserDetails";
import { FiPlus } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import useScrollToTop from "../../../hooks/useScrollToTop.js";

const UserManagement = () => {

    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    useScrollToTop(showDetails ? "details" : "table");
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleView = async (user) => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/instructors/${user.user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSelectedUser(response.data.data);
                setShowDetails(true);
            }
        } catch (error) {
            console.error("Failed to fetch instructor details:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to fetch instructor details."
            );
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditingUserId(user.user_id);
        setShowForm(true);
    };
    const handleFormSuccess = async () => {
        await fetchInstructors();

        if (editingUserId) {
            try {
                const token = sessionStorage.getItem("token");

                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/instructors/${editingUserId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.success) {
                    setSelectedUser(response.data.data);
                    setShowForm(false);
                    setEditingUserId(null);
                    setShowDetails(true);
                    return;
                }
            } catch (error) {
                console.error(error);
            }
        }

        setShowForm(false);
        setEditingUserId(null);
        setShowDetails(false);
    };

    /* PREVIOUS WHICH WAS GIVING DOUBLE TOAST. */
    // const fetchInstructors = async () => {
    //     setLoading(true);

    //     try {
    //         const token = sessionStorage.getItem("token");

    //         const response = await axios.get(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/instructors`,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );

    //         if (response.data.success) {
    //             setUsers(response.data.data || []);
    //         } else {
    //             setUsers([]);
    //         }

    //     } catch (error) {
    //         console.error("Failed to fetch instructors:", error);

    //         toast.error(
    //             error.response?.data?.message ||
    //             "Failed to fetch instructors."
    //         );

    //         setUsers([]);

    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchInstructors();
    // }, []);

    /* DOUBLE TOAST PREVENTED */
    const fetchInstructors = async (signal) => {
        setLoading(true);

        try {
            const token = sessionStorage.getItem("token");

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/instructors`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal,
                }
            );

            if (response.data.success) {
                setUsers(response.data.data || []);
            } else {
                setUsers([]);
            }

        } catch (error) {

            if (axios.isCancel(error)) {
                return;
            }

            console.error("Failed to fetch instructors:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to fetch instructors."
            );

            setUsers([]);

        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const controller = new AbortController();

        fetchInstructors(controller.signal);

        return () => {
            controller.abort();
        };
    }, []);



    return (
        <div className="relative">
            {!showForm && !showDetails ? (
                <>
                    {/* Header */}
                    {/* was: className="flex justify-between items-center" */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>
                            {/* was: className="text-3xl font-bold text-slate-800"*/}
                            <h1 className="text-2xl font-bold text-slate-800">
                                Manage Instructors 
                            </h1>

                            {/* was: className="text-base text-slate-500"*/}
                            {/* <p className="text-sm text-slate-500">
                                Manage all Instructors in the system
                            </p> */}
                        </div>

                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                setEditingUserId(null);
                                setShowForm(true);
                            }}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg cursor-pointer"
                        >
                            + Add New Instructor
                        </button>

                    </div>

                    <UserTable
                        users={users}
                        loading={loading}
                        handleView={handleView}
                        handleEdit={handleEdit}
                    />
                </>
            ) : showForm ? (
                // <UserForm
                //     onCancel={() => setShowForm(false)}
                //     onSuccess={() => setShowForm(false)}
                // />

                <UserForm
                    editingUserId={editingUserId}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingUserId(null);
                    }}
                    onSuccess={handleFormSuccess}
                />
            ) : (
                <UserDetails
                    user={selectedUser}
                    setViewingUser={setShowDetails}
                    handleEdit={handleEdit}
                />
            )}
        </div>
    );

};
export default UserManagement;