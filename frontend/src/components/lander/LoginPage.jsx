// LoginPage.jsx
import { FiLock, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../login/Login";
import Forgot from "./Forgot";

import Navbar from "./Navbar";
import Footer from "./Footer";
import useScrollToTop from "../../hooks/useScrollToTop";

const LoginPage = () => {
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();
  useScrollToTop(showForgot);

  // useEffect(() => {
  //   window.scrollTo({
  //     top: 0,
  //     behavior: "smooth",
  //   });
  // }, [showForgot]);


   useEffect(() => {
    window.scrollTo(0, 0);
  }, [showForgot]);

  return (
    // <div className="min-h-screen flex flex-col p-4 sm:p-8 md:p-12 lg:p-20">
    <div className="w-full flex justify-center py-10">
      {/* Back */}
      {/* <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute top-10 left-1/2 -translate-x-1/2 sm:left-[calc(50%-38rem)] sm:translate-x-0 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 cursor-pointer w-fit z-10"
      >
        <FiArrowLeft size={16} />
        Back
      </button> */}

      {/* <div className="flex-1 flex items-center justify-center py-10 pt-24"> */}
      <div className="flex-1 flex items-center justify-center py-6 sm:py-10" >
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

          {/* LEFT SIDE - FORM */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">

            {/* Icon */}
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <FiLock className="text-2xl text-red-500" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold text-gray-800 mb-1 text-center lg:text-left">
              {showForgot ? "Reset Password" : "Welcome Back"}
            </h2>

            <p className="text-gray-500 mb-5 text-center lg:text-left">
              {showForgot
                ? "Enter your registered email to receive password reset instructions."
: "Login to continue your technical learning and training journey."}
            </p>

            {showForgot ? (
              <Forgot setShowForgot={setShowForgot} />
            ) : (
              <Login setShowForgot={setShowForgot} />
            )}

          </div>

          {/* RIGHT SIDE - ILLUSTRATION */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-[#1E2A4A] via-[#7B3B5C] to-[#da3232] items-center justify-center p-10 overflow-hidden">

            {/* Background circles */}
            <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-10 -left-10"></div>
            <div className="absolute w-96 h-96 bg-white/10 rounded-full -bottom-24 -right-20"></div>

            {/* Content */}
            <div className="relative z-10 text-center text-white">
              <img
                src="/LearningIcon.png"
                alt="Japanese Learning"
                className="w-80 mx-auto drop-shadow-2xl"
              />

              {/* <h3 className="text-4xl font-bold mt-8 mb-4">
                Welcome Back
              </h3> */}

              <p className="text-lg text-red-100 leading-relaxed max-w-md">
                Continue developing your technical knowledge, engineering concepts,
                and professional skills through interactive learning and practical training.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>


  );
};

export default LoginPage;