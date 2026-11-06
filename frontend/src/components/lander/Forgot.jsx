// Forgot.jsx

import { useState } from "react";
import { toast } from "react-toastify";

const Forgot = ({ setShowForgot }) => {

  const [email, setEmail] = useState("");

  const [emailError, setEmailError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendLink = async (e) => {

    e.preventDefault();

    setEmailError("");

    let valid = true;

    if (!email.trim()) {

      setEmailError("Email is required");

      valid = false;

    } else if (!/^\S+@\S+\.\S+$/.test(email)) {

      setEmailError("Enter a valid email address");

      valid = false;
    }

    if (!valid) return;

    setIsSubmitting(true);

    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {

        toast.success("Reset link sent successfully!");

        setShowForgot(false);

      } else {

        toast.error(data.message || "Failed to send reset link.");
      }

    } catch (error) {

      console.error(error);

      toast.error("Something went wrong.");

    } finally {

      setIsSubmitting(false);

    }
  };

  return (

    <form
      onSubmit={handleSendLink}
      className="space-y-5"
    >

      <div>

        <label className="block text-sm font-medium text-gray-700">
          Registered Email <span className="text-red-500">*</span>
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 "
          placeholder="Enter your registered email"
        />

        {emailError && (
          <p className="text-red-500 text-sm mt-1">
            {emailError}
          </p>
        )}

      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        // bg-gradient-to-r from-red-500 to-orange-500
        className="w-full px-4 py-3 bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] text-white rounded-xl shadow-lg hover:scale-[1.02]  transition-all cursor-pointer"
      >

        {isSubmitting
          ? "Sending..."
          : "Send Reset Link"}

      </button>

      <p className="text-sm text-center text-gray-600">

        Remembered your password?{" "}

        <button
          type="button"
          onClick={() => setShowForgot(false)}
          className="text-blue-700 hover:underline cursor-pointer"
        >
          Back to Login
        </button>

      </p>

    </form>
  );
};

export default Forgot;