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
    title: "Industry-Focused Training",
    description:
      "Learn practical engineering concepts through structured training programs designed around industry requirements.",
  },
  {
    icon: <FiHelpCircle className="text-xl text-[#b8233a]" />,
    title: "Expert Technical Guidance",
    description:
      "Get guidance and support from experienced professionals to strengthen your technical knowledge and skills.",
  },
  {
    icon: <FiAward className="text-xl text-[#b8233a]" />,
    title: "Practical Learning Experience",
    description:
      "Gain hands-on experience through real-world projects, technical assignments, and practical activities.",
  },
  {
    icon: <FiClock className="text-xl text-[#b8233a]" />,
    title: "Flexible Learning Schedule",
    description:
      "Learn at your own pace with organized training schedules and flexible learning opportunities.",
  },
  {
    icon: <FiFileText className="text-xl text-[#b8233a]" />,
    title: "Skill Development & Certification",
    description:
      "Enhance your professional skills and receive course completion certificates after successful training.",
  },
  {
    icon: <FiTrendingUp className="text-xl text-[#b8233a]" />,
    title: "Career Development Opportunities",
    description:
      "Build confidence, improve your technical abilities, and prepare yourself for future career opportunities.",
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
             Discover the Exclusive Benefits of  <br className="hidden sm:inline" />
              Our Engineering Training Platform
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
              Enhance your technical skills with industry-focused training, expert mentorship, and practical learning opportunities designed to prepare you for a successful engineering career.
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
