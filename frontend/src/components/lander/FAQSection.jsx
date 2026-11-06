/* Previous */
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { FiChevronDown, FiHelpCircle } from "react-icons/fi";

// const faqs = [
//     {
//         q: "Are these courses suitable for absolute beginners?",
//         a: "Yes! Our beginner courses start from ground zero, covering writing systems (Hiragana and Katakana), basic phonetics, essential daily greetings, and fundamental sentence grammar step-by-step."
//     },
//     {
//         q: "How do I browse and enroll in available courses?",
//         a: "You can click on the 'Courses' button in the navigation or on any course action button to explore our complete catalog. Click 'Enroll Now' on any course to register and secure your spot."
//     },
//     {
//         q: "How does the Speaking Practice Lab work?",
//         a: "Each course includes integrated voice recording tools. You can listen to native Japanese audio pronunciations, record your own voice via microphone, and practice speaking phrases with clear pitch accents."
//     },
//     {
//         q: "What study materials and resources are included in each course?",
//         a: "Each course includes structured video lessons, PDF grammar notes, textbook references, interactive speaking audio drills, and chapter-wise quiz assessments."
//     },
//     {
//         q: "Will I receive a completion certificate?",
//         a: "Upon completing all required topic modules, lesson recordings, and passing the course quizzes, a verified course completion certificate will be issued under your student profile."
//     },
//     {
//         q: "Can I access the course material on mobile phones and tablets?",
//         a: "Absolutely! The Nihongo LMS platform is fully responsive and optimized for smartphones, tablets, laptops, and desktop computers."
//     }
// ];

// const FAQSection = () => {
//     const [openIdx, setOpenIdx] = useState(0);

//     const toggleAccordion = (idx) => {
//         setOpenIdx(openIdx === idx ? null : idx);
//     };

//     return (
//         <section className="py-6 sm:py-8 md:py-10 bg-white relative">
//             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
//                 {/* Section Header */}
//                 <div className="text-center mb-8 sm:mb-10">
//                     <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#C41E2E] text-xs font-bold uppercase tracking-wider mb-3">
//                         <FiHelpCircle />
//                         <span>Got Questions?</span>
//                     </div>
//                     <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E39] tracking-tight">
//                         Frequently Asked Questions
//                     </h2>
//                     <p className="mt-3 text-base text-slate-600">
//                         Everything you need to know about our Japanese learning platform.
//                     </p>
//                 </div>

//                 {/* FAQ Accordion List */}
//                 <div className="space-y-4">
//                     {faqs.map((faq, index) => {
//                         const isOpen = openIdx === index;
//                         return (
//                             <div
//                                 key={index}
//                                 className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
//                                     isOpen 
//                                         ? "bg-slate-50/80 border-slate-300 shadow-sm" 
//                                         : "bg-white border-slate-200/80 hover:border-slate-300"
//                                 }`}
//                             >
//                                 <button
//                                     onClick={() => toggleAccordion(index)}
//                                     className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer"
//                                 >
//                                     <span className="text-base sm:text-lg font-bold text-[#0B1E39] pr-4">
//                                         {faq.q}
//                                     </span>
//                                     <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
//                                         isOpen ? "bg-red-100 text-[#C41E2E] rotate-180" : "bg-slate-100 text-slate-600"
//                                     }`}>
//                                         <FiChevronDown size={18} />
//                                     </div>
//                                 </button>

//                                 <AnimatePresence>
//                                     {isOpen && (
//                                         <motion.div
//                                             initial={{ opacity: 0, height: 0 }}
//                                             animate={{ opacity: 1, height: "auto" }}
//                                             exit={{ opacity: 0, height: 0 }}
//                                             transition={{ duration: 0.2 }}
//                                             className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-200/60 pt-4"
//                                         >
//                                             {faq.a}
//                                         </motion.div>
//                                     )}
//                                 </AnimatePresence>
//                             </div>
//                         );
//                     })}
//                 </div>

//             </div>
//         </section>
//     );
// };

// export default FAQSection;


/* New */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";

const faqs = [
    {
        q: "Are these courses suitable for absolute beginners?",
        a: "Yes! Our beginner courses start from ground zero, covering writing systems (Hiragana and Katakana), basic phonetics, essential daily greetings, and fundamental sentence grammar step-by-step."
    },
    {
        q: "How do I browse and enroll in available courses?",
        a: "You can click on the 'Courses' button in the navigation or on any course action button to explore our complete catalog. Click 'Enroll Now' on any course to register and secure your spot."
    },
    {
        q: "How does the Speaking Practice Lab work?",
        a: "Each course includes integrated voice recording tools. You can listen to native Japanese audio pronunciations, record your own voice via microphone, and practice speaking phrases with clear pitch accents."
    },
    {
        q: "What study materials and resources are included in each course?",
        a: "Each course includes structured video lessons, PDF grammar notes, textbook references, interactive speaking audio drills, and chapter-wise quiz assessments."
    },
   
];

const FAQSection = () => {
    const [openIdx, setOpenIdx] = useState(0);

    const toggleAccordion = (idx) => {
        setOpenIdx(openIdx === idx ? null : idx);
    };

    return (
    <section className="relative overflow-hidden bg-slite-50 py-14 sm:py-16">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">

    <div className="grid items-center gap-12 lg:grid-cols-2">
    <div className="relative hidden min-h-[500px] items-center justify-center lg:flex">

        {/* Decorative Japanese Text */}
        <div className="absolute right-5 top-5 select-none text-[110px] font-black leading-none text-[#0B1E39]/[0.035]">
          日本語
        </div>

        <div className="absolute bottom-8 left-8 select-none text-[80px] font-black text-[#C41E2E]/[0.06]">
          学ぶ
        </div>

        {/* Main Image */}
        <div className="relative">

          <div className="absolute -inset-6 rounded-full border border-[#C41E2E]/10" />

          <div className="absolute -inset-12 rounded-full border border-[#0B1E39]/5" />

          <img
            src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop"
            alt="Japanese culture and learning"
            className="
              relative
              h-[390px]
              w-[390px]
              rounded-full
              object-cover
              shadow-2xl
              ring-8
              ring-white
            "
          />

          {/* Small Japanese Text */}
          <div className="absolute -right-8 top-16 flex h-20 w-20 items-center justify-center rounded-full bg-[#C41E2E] text-2xl font-bold text-white shadow-xl">
            学
          </div>

          <div className="absolute -bottom-5 left-0 rounded-full bg-[#0B1E39] px-6 py-3 text-sm font-bold text-white shadow-xl">
            Learn • Practice • Grow
          </div>

        </div>

        {/* Vertical Text */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl]">
          <span className="text-sm font-bold tracking-[0.3em] text-[#0B1E39]/40">
            JAPANESE LANGUAGE
          </span>
        </div>

      </div>
      <div>

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#C41E2E]">
            <FiHelpCircle />
            <span>Got Questions?</span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#0B1E39] sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
            Everything you need to know about our Japanese learning platform.
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIdx === index;

            return (
              <div
                key={index}
                className={`overflow-hidden border-b transition-all duration-300 ${
                  isOpen
                    ? "border-[#C41E2E]/30"
                    : "border-slate-200"
                }`}
              >

                <button
                  onClick={() => toggleAccordion(index)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="pr-6 text-base font-bold text-[#0B1E39] sm:text-lg">
                    {faq.q}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 bg-[#C41E2E] text-white"
                        : "bg-slate-100 text-[#0B1E39]"
                    }`}
                  >
                    <FiChevronDown size={17} />
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="pb-5 pr-12 text-sm leading-7 text-slate-600 sm:text-base"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

      </div>

    

    </div>

  </div>
</section>
    );
};

export default FAQSection;
