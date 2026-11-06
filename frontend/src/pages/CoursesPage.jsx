import { useEffect } from "react";
import Navbar from "../components/lander/Navbar";
import Courses from "../components/lander/Courses";
import Footer from "../components/lander/Footer";

const CoursesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden pt-16 sm:pt-20">
            <Navbar />
            <main className="flex-1">
                <Courses />
            </main>
            <Footer />
        </div>
    );
};

export default CoursesPage;
