import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();

        setPasswordError("");
        setConfirmError("");

        let valid = true;

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,20}$/;

        if (!password.trim()) {
            setPasswordError("New password is required");
            valid = false;
        } else if (!passwordRegex.test(password)) {
            setPasswordError(
                "Password must include 1 uppercase, 1 lowercase, 1 number, and 1 special character (6-20 chars)"
            );
            valid = false;
        }

        if (!confirmPassword.trim()) {
            setConfirmError("Please confirm your password");
            valid = false;
        } else if (password !== confirmPassword) {
            setConfirmError("Passwords do not match");
            valid = false;
        }

        if (!valid) return;

        setIsSubmitting(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/users/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ password }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                toast.success("Password reset successful! Please log in.");
                navigate("/");
            } else {
                toast.error(data.message || "Failed to reset password.");
            }

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-6">
                    <FaLock className="text-red-600" size={22} />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Reset Password
                </h1>

                <p className="text-gray-500 mb-6">
                    Enter your new password below.
                </p>

                <form onSubmit={handleReset} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Enter new password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-4 text-gray-500 cursor-pointer"
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>

                        {passwordError && (
                            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="Confirm new password"
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 px-4 text-gray-500 cursor-pointer"
                            >
                                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>

                        {confirmError && (
                            <p className="text-red-500 text-sm mt-1">{confirmError}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] rounded-xl shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ResetPassword;