import React from "react";
import { 
  FiBookOpen, 
  FiHelpCircle, 
  FiAward, 
  FiClock, 
  FiFileText, 
  FiTrendingUp 
} from "react-icons/fi";

const features = [
  {
    icon: <FiBookOpen className="text-xl text-[#b8233a]" />,
    title: "Personalized Learning",
    description:
      "Learn at your own pace with personalized courses designed around your learning goals and skill level.",
  },
  {
    icon: <FiHelpCircle className="text-xl text-[#b8233a]" />,
    title: "Personalized Support",
    description:
      "Get instant, intelligent assistance whenever you need help with lessons, questions, or learning activities.",
  },
  {
    icon: <FiAward className="text-xl text-[#b8233a]" />,
    title: "Expert Instructors",
    description:
      "Learn from experienced instructors who provide practical knowledge, guidance, and real-world insights.",
  },
  {
    icon: <FiClock className="text-xl text-[#b8233a]" />,
    title: "Flexible Learning Schedule",
    description:
      "Study anytime, anywhere and manage your learning according to your personal schedule.",
  },
  {
    icon: <FiFileText className="text-xl text-[#b8233a]" />,
    title: "Industry-Recognized Certification",
    description:
      "Complete your courses and earn certificates that showcase your skills and support your professional growth.",
  },
  {
    icon: <FiTrendingUp className="text-xl text-[#b8233a]" />,
    title: "Career & Skill Development",
    description:
      "Build job-ready skills through practical learning, assessments, projects, and career-focused training.",
  },
];

const ExclusiveBenefits = () => {
  return (
    <section className="bg-white py-14 sm:py-16 md:py-20 px-6 sm:px-10 lg:px-12">
      <div className="max-w-[1240px] xl:max-w-[1300px] mx-auto">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-12 sm:pb-16">
          {/* Main Title on Left */}
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#111827] tracking-tight leading-[1.18]">
              Discover the Exclusive Benefits of <br className="hidden sm:inline" />
              Our Learning Platform
            </h2>
          </div>

          {/* Subtitle with asterisk/sparkle badge on Right */}
          <div className="flex items-start sm:items-center gap-3.5 max-w-sm lg:text-left">
            {/* Multi-color sparkle / asterisk symbol */}
            <div className="relative w-8 h-8 shrink-0 flex items-center justify-center mt-0.5 sm:mt-0">
              <span className="text-2xl font-bold bg-gradient-to-br from-[#c52d3f] via-[#7a1f44] to-[#0b2341] bg-clip-text text-transparent select-none">
                ✱
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Transform your learning journey with personalized courses, expert guidance, and flexible learning options.
            </p>
          </div>
        </div>

        {/* 6 Benefits Grid: 3 columns on large screens, 2 on medium, 1 on small */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-10 gap-y-10 sm:gap-y-12">
          {features.map((item, index) => (
            <div key={index} className="flex items-start gap-4 sm:gap-5 group">
              {/* Icon Container with warm peachy-orange background matching mockup */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#ffede4] flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105">
                {item.icon}
              </div>

              {/* Text content */}
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-bold text-[#111827] leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-[13.5px] text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExclusiveBenefits;
