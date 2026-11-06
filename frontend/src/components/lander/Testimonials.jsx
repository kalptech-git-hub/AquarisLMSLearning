import { motion } from "framer-motion";
import { FiStar, FiCheckCircle } from "react-icons/fi";

const testimonials = [
    {
        name: "Rahul Sharma",
        role: "Software Engineer, Tokyo (Rakuten)",
        text: "The speaking labs and structured video lessons made all the difference. I cleared my Japanese technical interview with confidence!",
        badge: "Working in Japan",
        initials: "RS",
        color: "bg-blue-600"
    },
    {
        name: "Pooja Kulkarni",
        role: "Bilingual Project Coordinator",
        text: "The quiz assessments and practice exercises match the real exam format. Direct trainer guidance helped me immensely.",
        badge: "Certified Learner",
        initials: "PK",
        color: "bg-rose-600"
    },
    {
        name: "Amit Patel",
        role: "Automotive Design Consultant",
        text: "Balancing Japanese with a full-time job was tough. The 24/7 on-demand video lessons and audio fit my schedule perfectly.",
        badge: "Advanced Student",
        initials: "AP",
        color: "bg-indigo-600"
    }
];

const Testimonials = () => {
    return (
        <section className="py-6 sm:py-8 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-9">
                    <p className="uppercase tracking-[0.22em] text-[#C41E2E] font-bold text-xs sm:text-sm mb-2">
                        Student Success
                    </p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B1E39] tracking-tight">
                        Loved by Hundreds of Japanese Language Learners
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
                        Hear from students and professionals who achieved Japanese fluency and opened doors to career success.
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                {/* Rating Stars & Badge */}
                                <div className="flex items-center justify-between gap-2 mb-3.5">
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} className="fill-amber-400" size={16} />
                                        ))}
                                    </div>

                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold shrink-0">
                                        <FiCheckCircle size={12} />
                                        <span>{item.badge}</span>
                                    </span>
                                </div>

                                <p className="text-slate-700 text-sm sm:text-[15px] leading-relaxed mb-5 italic">
                                    &ldquo;{item.text}&rdquo;
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${item.color} text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0`}>
                                    {item.initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-[#0B1E39]">{item.name}</h4>
                                    <p className="text-xs text-slate-500">{item.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Testimonials;
