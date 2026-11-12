import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import {
    ArrowLeft, ArrowRight, Maximize2,
    Minimize2, Lock
} from "lucide-react";

// import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// pdfjsLib.GlobalWorkerOptions.workerSrc =
//     `${import.meta.env.BASE_URL}pdf.worker.mjs`;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ResourceLesson = ({
    resourceData,
    lessonId,
    onComplete
}) => {

    const viewerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const canvasRef = useRef(null);

    const completionTriggeredRef = useRef(false);
    const timerRef = useRef(null);
    const [isBlur, setIsBlur] = useState(false);

    const [pdf, setPdf] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);

    const [loading, setLoading] = useState(true);
    const [rendering, setRendering] = useState(false);
    const [error, setError] = useState(null);

    /*Temporarily lock PDF when browser window loses focus */
    useEffect(() => {
        const handleWindowBlur = () => {
            setIsBlur(true);
        };

        const handleWindowFocus = () => {
            setIsBlur(false);
        };

        window.addEventListener("blur", handleWindowBlur);
        window.addEventListener("focus", handleWindowFocus);

        return () => {
            window.removeEventListener("blur", handleWindowBlur);
            window.removeEventListener("focus", handleWindowFocus);
        };
    }, []);

    /*
     * Reset completion when lesson changes
     */
    // useEffect(() => {

    //     completionTriggeredRef.current = false;

    //     if (timerRef.current) {
    //         clearTimeout(timerRef.current);
    //     }

    //     return () => {
    //         if (timerRef.current) {
    //             clearTimeout(timerRef.current);
    //         }
    //     };

    // }, [lessonId]);

    useEffect(() => {
        completionTriggeredRef.current = false;
    }, [lessonId]);

    /*
     * Load PDF
     */
    useEffect(() => {

        if (!resourceData?.resource_url) {
            return;
        }

        let cancelled = false;

        const loadPdf = async () => {

            try {

                setLoading(true);
                setError(null);
                setPdf(null);
                setCurrentPage(1);
                setNumPages(0);

                console.log(
                    "Loading PDF:",
                    resourceData.resource_url
                );

                const loadingTask = pdfjsLib.getDocument({
                    url: resourceData.resource_url,
                });

                const loadedPdf = await loadingTask.promise;

                if (cancelled) {
                    return;
                }

                console.log(
                    "PDF loaded:",
                    loadedPdf.numPages,
                    "pages"
                );

                setPdf(loadedPdf);
                setNumPages(loadedPdf.numPages);

            } catch (err) {

                console.error("PDF LOAD ERROR:", err);

                if (!cancelled) {
                    setError(
                        "Unable to load this resource."
                    );
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }
        };

        loadPdf();

        return () => {
            cancelled = true;
        };

    }, [resourceData?.resource_url]);


    /*
     * Render current page
     */
    useEffect(() => {

        if (!pdf || !canvasRef.current) {
            return;
        }

        let cancelled = false;

        const renderPage = async () => {

            try {

                setRendering(true);

                const page = await pdf.getPage(currentPage);

                if (cancelled) {
                    return;
                }

                const canvas = canvasRef.current;
                const context = canvas.getContext("2d");

                /*
                 * Fit PDF to container width
                 */
                const containerWidth =
                    canvas.parentElement.clientWidth;

                const unscaledViewport =
                    page.getViewport({
                        scale: 1,
                    });

                const scale =
                    containerWidth /
                    unscaledViewport.width;

                const viewport =
                    page.getViewport({
                        scale,
                    });


                /*
                 * Device pixel ratio
                 *
                 * This keeps text sharp on phones.
                 */
                const pixelRatio =
                    window.devicePixelRatio || 1;

                canvas.width =
                    Math.floor(
                        viewport.width * pixelRatio
                    );

                canvas.height =
                    Math.floor(
                        viewport.height * pixelRatio
                    );

                canvas.style.width =
                    `${viewport.width}px`;

                canvas.style.height =
                    `${viewport.height}px`;

                context.setTransform(
                    pixelRatio,
                    0,
                    0,
                    pixelRatio,
                    0,
                    0
                );


                await page.render({
                    canvasContext: context,
                    viewport,
                }).promise;


            } catch (err) {

                console.error(
                    "PDF RENDER ERROR:",
                    err
                );

            } finally {

                if (!cancelled) {
                    setRendering(false);
                }

            }
        };

        renderPage();

        return () => {
            cancelled = true;
        };

    }, [pdf, currentPage, isFullscreen]);


    /*
     * Complete lesson when last page is reached
     */
    // useEffect(() => {

    //     if (
    //         !pdf ||
    //         numPages === 0 ||
    //         currentPage !== numPages
    //     ) {
    //         return;
    //     }

    //     /*
    //      * Give the student a little time
    //      * on the final page.
    //      */
    //     if (timerRef.current) {
    //         clearTimeout(timerRef.current);
    //     }

    //     timerRef.current = setTimeout(() => {

    //         if (!completionTriggeredRef.current) {

    //             completionTriggeredRef.current = true;

    //             onComplete?.();

    //         }

    //     }, 3000);

    //     return () => {

    //         if (timerRef.current) {
    //             clearTimeout(timerRef.current);
    //         }

    //     };

    // }, [
    //     currentPage,
    //     numPages,
    //     pdf,
    //     onComplete
    // ]);


    useEffect(() => {
        if (
            !pdf ||
            numPages === 0 ||
            currentPage !== numPages ||
            completionTriggeredRef.current
        ) {
            return;
        }

        completionTriggeredRef.current = true;

        onComplete?.();

    }, [
        currentPage,
        numPages,
        pdf,
        onComplete
    ]);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await viewerRef.current?.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error("Fullscreen error:", error);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                document.fullscreenElement === viewerRef.current
            );
        };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    /*
     * Previous page
     */
    const previousPage = () => {

        setCurrentPage((page) =>
            Math.max(1, page - 1)
        );

    };


    /*
     * Next page
     */
    const nextPage = () => {

        setCurrentPage((page) =>
            Math.min(numPages, page + 1)
        );

    };


    /*
     * Loading
     */
    if (loading) {

        return (
            <div className="flex items-center justify-center h-[500px] text-slate-500">
                Loading resource...
            </div>
        );

    }


    /*
     * Error
     */
    if (error) {

        return (
            <div className="flex flex-col items-center justify-center h-[500px] text-red-500 px-6 text-center">

                <p className="font-medium">
                    {error}
                </p>

                <p className="text-sm text-slate-500 mt-2">
                    Please try refreshing the lesson.
                </p>

            </div>
        );

    }


    return (

        // <div className="w-full bg-slate-100">
        <div
            ref={viewerRef}
            onContextMenu={(e) => e.preventDefault()}
            // className={`w-full bg-slate-100 ${isFullscreen
            //     ? "flex flex-col h-screen overflow-hidden"
            //     : ""
            //     }`}

            className={`relative w-full bg-slate-100 ${isFullscreen
                ? "flex flex-col h-screen overflow-hidden"
                : ""
                }`}
        >

            <div
                className={`w-full flex flex-col flex-1 min-h-0 ${isBlur
                    ? "blur-md pointer-events-none select-none"
                    : ""
                    }`}
            >


                {/* PDF */}
                {/* <div className="w-full overflow-hidden flex justify-center"> */}
                <div
                    className={`w-full flex justify-center ${isFullscreen
                        ? "flex-1 overflow-y-auto overflow-x-hidden"
                        : "overflow-hidden"
                        }`}
                >

                    <div className="w-full bg-white">
                        <canvas
                            ref={canvasRef}
                            onContextMenu={(e) => e.preventDefault()}
                            className="block w-full h-auto"
                        />
                    </div>

                </div>



                {/* was: isFullscreen ? "relative" — no extra bottom clearance in fullscreen,
                so the controls bar (prev/next, page counter, exit-fullscreen button) sat
                flush against the very bottom edge of the screen on phone, with nothing
                to separate it from Chrome's own native "exit fullscreen" hint banner that
                briefly overlaps the bottom edge right after entering fullscreen. Added
                pb-8 on phone only in the fullscreen case, clearing that space; sm: and
                the non-fullscreen (sticky bottom-0) case are unchanged. */}
                <div
                    className={`bg-white border-t border-slate-200 px-4 py-3 shrink-0 ${isFullscreen
                        ? "relative pb-8 sm:pb-3"
                        : "sticky bottom-0"
                        }`}
                >
                    <div className="relative flex items-center justify-center">

                        {/* Previous / Page / Next - CENTER */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={previousPage}
                                disabled={currentPage === 1 || rendering}
                                className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-40 cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                            </button>

                            <span className="text-sm font-medium text-slate-700">
                                {currentPage} / {numPages}
                            </span>

                            <button
                                type="button"
                                onClick={nextPage}
                                disabled={currentPage === numPages || rendering}
                                className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-40 cursor-pointer"
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Maximize / Minimize - RIGHT CORNER */}
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className={`absolute ${isFullscreen ? "right-0" : "right-3 sm:right-5"} w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer shadow-md`}
                            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen"}
                        >
                            {isFullscreen ? (
                                <Minimize2 size={16} />
                            ) : (
                                <Maximize2 size={16} />
                            )}
                        </button>

                    </div>
                </div>
            </div>

            {/* Temporary Lock Overlay - ADD AFTER THE WRAPPER */}
            {isBlur && (
                // <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/90 text-white text-center p-6">
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 text-white text-center p-6">
                    <div>
                        <Lock
                            size={36}
                            className="mx-auto mb-4 text-red-400"
                        />
                        <h3 className="text-lg font-bold mb-2">
                            Resource Temporarily Hidden
                        </h3>
                        <p className="text-sm text-slate-300">
                            This resource has been temporarily hidden because
                            the browser window lost focus.
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                            Return to the learning window to continue.
                        </p>
                    </div>
                </div>
            )}
        </div>

    );
};

export default ResourceLesson;