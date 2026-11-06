import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/lander/Navbar";
import HeroSection from "../components/lander/HeroSection";
import LMSOverview from "../components/lander/LMSOverview";
import LMSFeatures from "../components/lander/LMSFeatures";
import LMSPreview from "../components/lander/LMSPreview";
import AboutUs from "../components/lander/AboutUs";
import Testimonials from "../components/lander/Testimonials";
import FAQSection from "../components/lander/FAQSection";
import CTABanner from "../components/lander/CTABanner";
import Footer from "../components/lander/Footer";
import Courses from "../components/lander/Courses";
import LoginPage from "../components/lander/LoginPage";
import Register from "../components/Register/Register";

import { useLocation } from "react-router-dom";
import CourseSection from "../components/lander/CoursesNew";

const Landing = () => {
  const [searchParams] = useSearchParams();
  // const activeTab = searchParams.get("tab") || "about"; // defaults to 'about'


  const location = useLocation();
  // Derive active tab from the pathname or query param
  const getActiveTab = () => {
    const tabParam = searchParams.get("tab");
    if (location.pathname === "/courses" || tabParam === "courses") return "courses";
    if (location.pathname === "/login" || tabParam === "login") return "login";
    if (location.pathname === "/register" || tabParam === "register") return "register";
    return "home"; // Default for "/" and "/home"
  };
  const activeTab = getActiveTab();

  const [token, setToken] = useState(sessionStorage.getItem("token"));

  useEffect(() => {
    const updateAuth = () => {
      setToken(sessionStorage.getItem("token"));
    };

    window.addEventListener("authChanged", updateAuth);
    return () => {
      window.removeEventListener("authChanged", updateAuth);
    };
  }, []);



  return (
    // was: className="min-h-screen flex flex-col p-20"
    // className="min-h-screen flex flex-col p-4 sm:p-8 md:p-12 lg:p-20">
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden pt-16 sm:pt-20">
      <Navbar />

      {/* Only show intro for guests */}
      {/* {!token && <AboutUs />} */}

      {/* Courses always visible */}
      {/* <Courses /> */}

      {/* Main Section: Display only the selected tab */}
      {/* <main className="flex-1 pt-16"> */}
      <main className="flex-1">
        {activeTab === "courses" && <Courses />}
        {activeTab === "login" && <LoginPage />}
        {activeTab === "register" && <Register />}
        {/* {activeTab === "about" && ( */}
        {activeTab === "home" && (
          <>
            {/* Modern Interactive Hero Section */}
            <HeroSection />
            <CourseSection/>
            {/* Platform Overview & Core Pillars */}
           {/* <LMSOverview />*/}

            {/* Deep-Dive LMS Features (Lesson Player, Speaking Lab, Quizzes, Progress) */}
            <LMSFeatures />

            {/* Interactive Student Experience & Live Demo (Mini Quiz & Audio) */}
          {/*  <LMSPreview />*/}

            {/* About Us & Learning Benefits */}
            {/* <AboutUs /> */}

            {/* Student Testimonials & Success Stories */}
            {/* <Testimonials /> */}

            {/* Frequently Asked Questions */}
            <FAQSection />

            {/* High Conversion CTA Banner */}
           {/* <CTABanner />*/}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Landing;