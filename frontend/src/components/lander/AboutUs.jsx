import { motion } from "framer-motion";
import {
    FiUsers,
    FiGlobe,
    FiBarChart2,
    FiBookOpen,
    FiCheckCircle
} from "react-icons/fi";

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 40,
    },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
        },
    }),
};

const highlights = [
    {
        icon: FiUsers,
        title: "Expert Trainers",
        desc: "Learn from experienced, certified Japanese instructors with real-world conversational course and cultural immersion.",
        color: "bg-red-100 text-[#C41E2E]"
    },
    {
        icon: FiGlobe,
        title: "Learn Anywhere",
        desc: "Access structured high-definition video lessons, study documents, and audio exercises from any desktop, tablet, or phone.",
        color: "bg-blue-100 text-[#0B1E39]"
    },
    {
        icon: FiBarChart2,
        title: "Visual Progress",
        desc: "Monitor your topic completion, quiz marks, and milestone achievements in real-time through an interactive dashboard.",
        color: "bg-emerald-100 text-emerald-700"
    },
    {
        icon: FiBookOpen,
        title: "Structured Courses",
        desc: "Follow modular, step-by-step curriculums designed to take you from foundational basics to conversational fluency.",
        color: "bg-amber-100 text-amber-700"
    }
];

const AboutUs = () => {
    return (
        <section
            id="about"
            // className="py-24 px-6"
            // className="py-6 sm:py-10 px-4 sm:px-6"
            className="py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80"
        >
            <div className="max-w-7xl mx-auto">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
                    {/* <h2 className="font-bold text-black mb-4">
                        About Us
                    </h2> */}
                    {/* text-red-500 */}
                    <p className="uppercase tracking-[0.25em] text-[#C41E2E] font-bold text-xs sm:text-sm mb-3">
                        About Us
                    </p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1E39] tracking-tight">
                        Learn Japanese The Modern Way
                    </h2>
                    <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                        We empower learners, students, and working professionals with a blended learning experience combining self-paced lessons, interactive practice labs, and direct mentor support.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {highlights.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={index}
                                whileHover={{ y: -6 }}
                                className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-7 shadow-xs hover:shadow-xl hover:bg-white transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    {/* <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 text-2xl mb-5"> */}
                                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-xs`}>
                                        <Icon />
                                    </div>

                                    <h3 className="text-xl font-bold text-[#0B1E39] mb-3">
                                        {item.title}
                                    </h3>

                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-[#0B1E39]">
                                    <FiCheckCircle className="text-emerald-600" />
                                    <span>Included in all programs</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default AboutUs;