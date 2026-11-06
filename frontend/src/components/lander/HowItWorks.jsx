import React from "react";
import { FiLogIn, FiSearch, FiCheckSquare, FiAward } from "react-icons/fi";

const steps = [
  {
    num: "01",
    align: "left",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-[#e8efff] flex items-center justify-center shrink-0 text-[#3b82f6]">
        <FiLogIn className="text-lg" />
      </div>
    ),
    title: "Create Your Account",
    desc: "Sign up and create your personalized learning profile in just a few simple steps.",
  },
  {
    num: "02",
    align: "right",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-[#fff2e4] flex items-center justify-center shrink-0 text-[#f59e0b]">
        <FiSearch className="text-lg" />
      </div>
    ),
    title: "Choose Your Course",
    desc: "Explore courses, learning materials, videos, assignments, and assessments based on your learning goals.",
  },
  {
    num: "03",
    align: "left",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-[#f7e8ff] flex items-center justify-center shrink-0 text-[#a855f7]">
        <FiCheckSquare className="text-lg" />
      </div>
    ),
    title: "Complete Course",
    desc: "Take quizzes, assignments, and tests to evaluate your knowledge and track your progress.",
  },
  {
    num: "04",
    align: "right",
    icon: (
      <div className="w-10 h-10 rounded-xl bg-[#fff2e4] flex items-center justify-center shrink-0 text-[#f59e0b]">
        <FiAward className="text-lg" />
      </div>
    ),
    title: "Complete & Get Certified",
    desc: "Complete your course and earn your certificate upon successful completion.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-12 overflow-hidden">
      {/* Soft warm/red ambient glow at bottom right matching the mockup */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#c52d3f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-[1240px] xl:max-w-[1300px] mx-auto">
        {/* Section Heading */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-[#111827] tracking-tight">
            How Our LMS Works
          </h2>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Staggered Floating Step Cards */}
          <div className="lg:col-span-7 flex flex-col space-y-5 sm:space-y-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 sm:gap-6 ${
                  step.align === "right" ? "sm:pl-10 lg:pl-16" : ""
                }`}
              >
                {/* Big watermark number on the left (01, 03) */}
                {step.align === "left" && (
                  <span className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-300 select-none w-10 sm:w-16 shrink-0 text-left">
                    {step.num}
                  </span>
                )}

                {/* Floating Card */}
                <div className="flex-1 bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-200/60 border border-slate-100 flex items-start gap-3.5 sm:gap-4 transition-transform duration-200 hover:-translate-y-1">
                  {step.icon}
                  <div>
                    <h3 className="text-sm sm:text-lg font-bold text-[#111827] leading-snug">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-[13.5px] text-slate-500 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Big watermark number on the right (02, 04) */}
                {step.align === "right" && (
                  <span className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-300 select-none w-10 sm:w-16 shrink-0 text-left sm:text-center">
                    {step.num}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: Real Photos & Learner Community Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[460px] sm:max-w-[500px]">
              {/* Photo Collage with clean rounded styling and shadow */}
              <img
                src="/how_it_works_collage_hd.png"
                alt="Students learning with Nihongo LMS"
                className="w-full h-auto object-contain rounded-3xl drop-shadow-xl select-none pointer-events-none"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[35.1%] top-[76.5%] h-[4.5%] w-[9.5%] bg-white"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
