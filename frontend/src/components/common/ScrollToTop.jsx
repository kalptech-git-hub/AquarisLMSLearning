// src/components/common/ScrollToTop.jsx
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const SCROLL_CONTAINER_IDS = [
    "admin-main-scroll",
    "instructor-main-scroll",
    "app-scroll-container",
];

const ScrollToTop = () => {
    const location = useLocation();

    useLayoutEffect(() => {
        const scrollToTop = () => {
            let foundContainer = false;

            for (const id of SCROLL_CONTAINER_IDS) {
                const el = document.getElementById(id);

                if (el) {
                    el.scrollTop = 0;
                    el.scrollLeft = 0;
                    foundContainer = true;
                }
            }

            if (!foundContainer) {
                window.scrollTo(0, 0);
            }
        };

        // Run immediately
        scrollToTop();

        // Run again after the new page has rendered
        requestAnimationFrame(() => {
            scrollToTop();

            requestAnimationFrame(() => {
                scrollToTop();
            });
        });
    }, [location.pathname, location.search, location.hash]);

    return null;
};

export default ScrollToTop;