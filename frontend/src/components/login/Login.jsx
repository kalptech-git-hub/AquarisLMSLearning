// Login.jsx

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
// import { toast } from "react-toastify";

const Login = ({ setShowForgot }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {

    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    let valid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email address");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    }

    if (!valid) return;

    setIsSubmitting(true);

    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_email: email,
            user_password: password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setLoginError(data.message || "Login failed");

        return;
      }

      const token = data.token;

      sessionStorage.setItem("token", token);
      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }
      window.dispatchEvent(new Event("authChanged"));

      const decoded = jwtDecode(token);

      const role = decoded.role_code;

      // if (decoded.um_status !== "1") {
      //   setLoginError("User account is inactive.");
      //   return;
      // }

      // toast.success("Login successful!");

      const redirectPath = location.state?.redirectTo || sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");

      if (redirectPath && role === "STD") {
        navigate(redirectPath, {
          replace: true,
          state: {
            autoEnroll: true,
            course: location.state?.course
          }
        });
      } else if (role === "ADM") {

        navigate("/admin/dashboard", { replace: true });
      }
      else if (role === "CAD") {
        navigate("/company/dashboard", { replace: true });
      }
      else if (role === "STD") {
        navigate("/my-learning", { replace: true });
      } else if (role === "INS") {

        navigate("/instructor/dashboard", { replace: true });
      }
      else {
        setLoginError("Unknown role");
      }

    } catch (error) {

      console.error(error);

      setLoginError("Something went wrong.");

    } finally {

      setIsSubmitting(false);

    }
  };

  return (

    <form
      onSubmit={handleLogin}
      noValidate
      className="space-y-5"
    >

      {/* Email */}
      <div>

        <div className="flex justify-between items-center mb-1">

          <label className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <span className={`text-[11px] font-semibold transition-colors ${email.length === 100 ? "text-green-600" : "text-gray-400"
            }`}>
            {email.length}/100 characters
          </span>
        </div>

        <input
          type="email"
          maxLength={100}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 ${emailError ? "border-red-500" : "border-gray-300"
            }`}
          placeholder="Enter your email"
        />

        {emailError && (
          <p className="text-red-500 text-sm mt-1">
            {emailError}
          </p>
        )}

      </div>

      {/* Password */}
      <div>
        <div className="flex justify-between items-center mb-1">

          <label className="block text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <span className={`text-[11px] font-semibold transition-colors ${password.length === 20 ? "text-green-600" : "text-gray-400"
            }`}>
            {password.length}/20 characters
          </span>
        </div>


        <div className="relative">

          <input
            type={showPassword ? "text" : "password"}
            maxLength={20}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError("");
            }}
            className={`w-full mt-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-1 ${passwordError ? "border-red-500" : "border-gray-300"
              }`}
            placeholder="Enter your password"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-4 text-gray-500 cursor-pointer"
          >
            {showPassword
              ? <FaEye />
              : <FaEyeSlash />}
          </button>

        </div>

        {passwordError && (
          <p className="text-red-500 text-sm mt-1">
            {passwordError}
          </p>
        )}

        {/* Forgot */}
        <div className="text-right">

          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="text-sm text-blue-700 hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>

        </div>
      </div>


      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] rounded-xl shadow-lg hover:scale-[1.02] transition-all cursor-pointer">

        {isSubmitting
          ? "Logging in..."
          : "Login"}

      </button>

      {/* Error */}
      {loginError && (
        <p className="text-red-500 text-sm text-center">
          {loginError}
        </p>
      )}

      {/* Register */}
      <p className="text-sm text-center text-gray-600">

        Don&apos;t have an account?{" "}

        <button
          type="button"
          // onClick={() => navigate("/register")}
          onClick={() => navigate("/register", { replace: true })}
          className="text-blue-700 hover:underline cursor-pointer"
        >
          Register
        </button>

      </p>

    </form>
  );
};

export default Login;