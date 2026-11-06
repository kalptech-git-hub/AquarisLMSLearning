import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import {
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiDownload,
  FiAlertCircle,
  FiLoader
} from "react-icons/fi";

// Set worker source with multiple fallback mechanisms
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    pdfWorker || `${import.meta.env.BASE_URL}pdf.worker.mjs`;
}

const InlinePdfViewer = ({ url, isFullscreen = false, themeColor = "#35175a" }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scaleMultiplier, setScaleMultiplier] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState(null);

  // Load PDF Document
  useEffect(() => {
    if (!url) {
      setError("No document URL provided");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setPdf(null);
    setCurrentPage(1);
    setNumPages(0);
    setScaleMultiplier(1.0);
    setRotation(0);

    const loadingTask = pdfjsLib.getDocument({
      url,
      cMapUrl: "https://unpkg.com/pdfjs-dist@latest/cmaps/",
      cMapPacked: true,
    });

    loadingTask.promise
      .then((loadedPdf) => {
        if (!isMounted) return;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("PDF.js Load Error:", err);
        setError("Unable to load this PDF document on your device.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (loadingTask && loadingTask.destroy) {
        loadingTask.destroy();
      }
    };
  }, [url]);

  // Render Page onto Canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdf || !canvasRef.current || !containerRef.current) return;

    try {
      // Cancel previous render task if still in progress
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      setRendering(true);
      const page = await pdf.getPage(currentPage);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      const containerWidth = containerRef.current.clientWidth || 360;

      // Base unscaled viewport with rotation
      const unscaledViewport = page.getViewport({ scale: 1, rotation });

      // Calculate width fit with user zoom multiplier
      const baseScale = Math.max(0.2, (containerWidth - 24) / unscaledViewport.width);
      const effectiveScale = baseScale * scaleMultiplier;

      const viewport = page.getViewport({ scale: effectiveScale, rotation });
      const pixelRatio = window.devicePixelRatio || 1;

      // Set physical canvas pixel dimensions
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);

      // Set CSS display dimensions
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;

      await task.promise;
      setRendering(false);
    } catch (err) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("PDF Page Render Error:", err);
      }
      setRendering(false);
    }
  }, [pdf, currentPage, scaleMultiplier, rotation]);

  // Trigger render on state updates
  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  // Responsive re-render on container resize (e.g. phone orientation change, window resize)
  useEffect(() => {
    const handleResize = () => {
      renderCurrentPage();
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        renderCurrentPage();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [renderCurrentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1 && !rendering) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages && !rendering) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScaleMultiplier((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScaleMultiplier((prev) => Math.max(prev - 0.25, 0.6));
  };

  const handleResetZoom = () => {
    setScaleMultiplier(1.0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-300 gap-3 min-h-[300px]">
        <FiLoader className="animate-spin text-purple-400" size={32} />
        <p className="text-xs sm:text-sm font-medium text-slate-400">Loading PDF document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-slate-300 flex flex-col items-center gap-3">
        <FiAlertCircle size={32} className="text-amber-400" />
        <p className="text-xs sm:text-sm font-medium">{error}</p>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <FiDownload size={14} /> Download / Open PDF
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col bg-slate-900 ${
        isFullscreen ? "h-full flex-1 overflow-hidden" : ""
      }`}
    >
      {/* Scrollable Canvas Viewport */}
      <div
        className={`w-full overflow-auto flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 ${
          isFullscreen ? "flex-1 min-h-0" : "max-h-[600px] min-h-[320px]"
        }`}
      >
        <div className="bg-white shadow-2xl rounded-sm overflow-hidden inline-block transition-transform duration-150">
          <canvas ref={canvasRef} className="block max-w-none" />
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-slate-950 text-white px-3 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Pagination Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || rendering}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition cursor-pointer border border-slate-700"
            title="Previous Page"
          >
            <FiChevronLeft size={16} />
          </button>

          <span className="text-xs font-medium text-slate-300 px-1.5 whitespace-nowrap">
            {currentPage} <span className="text-slate-500">/</span> {numPages}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || rendering}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition cursor-pointer border border-slate-700"
            title="Next Page"
          >
            <FiChevronRight size={16} />
          </button>
        </div>

        {/* Zoom & Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scaleMultiplier <= 0.6 || rendering}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition cursor-pointer border border-slate-700"
            title="Zoom Out"
          >
            <FiZoomOut size={14} />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition cursor-pointer border border-slate-700"
            title="Reset Zoom"
          >
            {Math.round(scaleMultiplier * 100)}%
          </button>

                    <button
            type="button"
            onClick={handleZoomIn}
            disabled={scaleMultiplier >= 3.0 || rendering}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition cursor-pointer border border-slate-700"
            title="Zoom In"
          >
            <FiZoomIn size={14} />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
            title="Rotate 90°"
          >
            <FiRotateCw size={14} />
          </button>

          {/* was: Download PDF button in the toolbar — hidden so students can't download from the inline viewer
          {url && (
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700 hidden sm:inline-flex"
              title="Download PDF"
            >
              <FiDownload size={14} />
            </a>
          )}
          */}
        </div>
      </div>
    </div>
  );
};

export default InlinePdfViewer;