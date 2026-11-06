/* Previous */
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

// const CTABanner = () => {
//     const navigate = useNavigate();

//     return (
//         <section className="py-6 sm:py-8 md:py-10 bg-slate-50 relative overflow-hidden">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="relative rounded-3xl bg-gradient-to-r from-[#0B1E39] via-[#16294D] to-[#C41E2E] text-white p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
                    
//                     {/* Decorative Background Elements */}
//                     <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
//                     <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

//                     <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                        
//                         <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-rose-200 text-xs font-bold uppercase tracking-wider">
//                             <span>Ready to Begin?</span>
//                         </span>

//                         <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
//                             Start Your Japanese Learning Journey Today
//                         </h2>

//                         <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto">
//                             Join hundreds of students mastering Japanese with our structured video lessons, speaking labs, interactive quizzes, and verified certificates.
//                         </p>

//                         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
//                             <button
//                                 onClick={() => navigate("/courses")}
//                                 className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[#0B1E39] font-bold bg-white hover:bg-slate-100 shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
//                             >
//                                 <span>Browse All Courses</span>
//                                 <FiArrowRight className="text-lg" />
//                             </button>

//                             <button
//                                 onClick={() => navigate("/register")}
//                                 className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-bold bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
//                             >
//                                 <span>Create Free Account</span>
//                             </button>
//                         </div>

//                         {/* Guarantee Badges */}
//                         <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-6 text-xs text-slate-300">
//                             <div className="flex items-center gap-2">
//                                 <FiCheckCircle className="text-emerald-400" />
//                                 <span>Instant course access</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <FiCheckCircle className="text-emerald-400" />
//                                 <span>Certified Japanese trainers</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <FiCheckCircle className="text-emerald-400" />
//                                 <span>Official verifiable certificate</span>
//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default CTABanner;

/* New */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

const CTABanner = () => {
    const navigate = useNavigate();

    return (
        <section className="py-4 sm:py-6 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-3xl bg-gradient-to-r from-[#0B1E39] via-[#16294D] to-[#C41E2E] text-white py-6 px-6 sm:py-8 sm:px-10 lg:py-9 lg:px-14 shadow-2xl overflow-hidden">
                    
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
                        
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-rose-200 text-xs font-bold uppercase tracking-wider">
                            <span>Ready to Begin?</span>
                        </span>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                            Start Your Japanese Learning Journey Today
                        </h2>

                        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
                            Join hundreds of students mastering Japanese with our structured video lessons, speaking labs, interactive quizzes, and verified certificates.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                            <button
                                onClick={() => navigate("/courses")}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-[#0B1E39] font-bold bg-white hover:bg-slate-100 shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer text-sm sm:text-base"
                            >
                                <span>Browse All Courses</span>
                                <FiArrowRight className="text-lg" />
                            </button>

                            <button
                                onClick={() => navigate("/register")}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white font-bold bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer text-sm sm:text-base"
                            >
                                <span>Create Free Account</span>
                            </button>
                        </div>

                        {/* Guarantee Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 sm:pt-4 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                                <FiCheckCircle className="text-emerald-400" />
                                <span>Instant course access</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiCheckCircle className="text-emerald-400" />
                                <span>Certified Japanese trainers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiCheckCircle className="text-emerald-400" />
                                <span>Official verifiable certificate</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTABanner;
