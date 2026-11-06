// src/hooks/useScrollToTop.js
import { useEffect } from "react";

const SCROLL_CONTAINER_IDS = [
    "admin-main-scroll",
    "instructor-main-scroll",
    "app-scroll-container",
];

const useScrollToTop = (trigger) => {
    useEffect(() => {
        let scrolled = false;

        for (const id of SCROLL_CONTAINER_IDS) {
            const el = document.getElementById(id);
            if (el) {
                el.scrollTo({ top: 0, left: 0, behavior: "instant" });
                scrolled = true;
            }
        }

        if (!scrolled) {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
    }, [trigger]);
};

export default useScrollToTop;