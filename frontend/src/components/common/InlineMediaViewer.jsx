import React, { useRef, useState, useEffect } from "react";
import {
  FiMaximize,
  FiMinimize,
  FiExternalLink,
  FiX,
  FiPlay,
  FiFileText,
  FiImage,
  FiMusic,
  FiAlertCircle,
  FiDownload
} from "react-icons/fi";
import InlinePdfViewer from "./InlinePdfViewer";

const InlineMediaViewer = ({ content, onClose, themeColor = "#1B357F" }) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      const elem = containerRef.current;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  const isYoutubeVideo = (url) => {
    return url?.includes("youtube.com") || url?.includes("youtu.be");
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";
    const videoId = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    )?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  // Determine media type
  const urlLower = (content?.content_url || "").toLowerCase();
  const rawType = (content?.type || content?.content_type || "").toLowerCase();

  let mediaType = "file";
  if (rawType === "video" || urlLower.match(/\.(mp4|webm|ogg|mov|m4v)$/) || isYoutubeVideo(urlLower)) {
    mediaType = "video";
  } else if (rawType === "pdf" || rawType === "document" || rawType === "text" || urlLower.includes(".pdf")) {
    mediaType = "pdf";
  } else if (rawType === "image" || urlLower.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
    mediaType = "image";
  } else if (rawType === "audio" || urlLower.match(/\.(mp3|wav|ogg|m4a)$/)) {
    mediaType = "audio";
  }

  const renderIcon = () => {
    switch (mediaType) {
      case "video":
        return <FiPlay className="text-red-400 shrink-0" size={16} />;
      case "pdf":
        return <FiFileText className="text-red-400 shrink-0" size={16} />;
      case "image":
        return <FiImage className="text-emerald-400 shrink-0" size={16} />;
      case "audio":
        return <FiMusic className="text-purple-400 shrink-0" size={16} />;
      default:
        return <FiFileText className="text-blue-400 shrink-0" size={16} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`mt-2 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl transition-all ${
        isFullscreen ? "fixed inset-0 z-[9999] rounded-none flex flex-col justify-between" : "w-full"
      }`}
    >
      {/* Header Toolbar */}
            <div className="bg-slate-950/90 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        {/* was: gap-2.5 — tightened to gap-2 on phone (sm: keeps original 2.5) to
            reclaim a little width in the crowded toolbar row. */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
          {renderIcon()}
          {/* was: max-w-[200px] sm:max-w-md — 200px left no room for the type badge
              and the three right-side buttons (Fullscreen/Open/Close) on phones under
              ~390px wide, so the badge got squeezed without truncating and visually
              overlapped the Fullscreen button instead of showing an ellipsis. */}
          <span className="font-semibold text-xs text-slate-100 truncate max-w-[110px] sm:max-w-md">
            {content.title || "Content Preview"}
          </span>
          {/* was: always visible — the media-type badge (IMAGE/PDF/etc.) is decorative,
              not essential (the icon + filename already convey it), and was the exact
              element getting squeezed/overlapped on narrow phones. Hidden below sm:,
              unchanged from sm: up. */}
          <span className="hidden sm:inline-flex shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {mediaType}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 transition cursor-pointer font-medium"
          >
            {isFullscreen ? <FiMinimize size={13} /> : <FiMaximize size={13} />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          {/* Open in New Tab */}
          {content.content_url && (
            <a
              href={content.content_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 transition cursor-pointer font-medium"
            >
              <FiExternalLink size={13} />
              <span className="hidden sm:inline">Open</span>
            </a>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition cursor-pointer"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className={`relative bg-slate-950 flex items-center justify-center ${isFullscreen ? "flex-1" : ""}`}>
        {loadError ? (
          <div className="p-8 text-center text-slate-300 flex flex-col items-center gap-3">
            <FiAlertCircle size={32} className="text-amber-400" />
            <p className="text-xs sm:text-sm font-medium">Unable to display preview directly inside the browser.</p>
            {content.content_url && (
              <a
                href={content.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <FiDownload size={14} /> Download / Open Content
              </a>
            )}
          </div>
        ) : mediaType === "video" ? (
          isYoutubeVideo(content.content_url) ? (
            <div className={`w-full ${isFullscreen ? "h-full" : "aspect-video max-h-[500px]"}`}>
              <iframe
                src={getYoutubeEmbedUrl(content.content_url)}
                className="w-full h-full rounded-b-xl border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              controls
              controlsList="nodownload"
              autoPlay
              onError={() => setLoadError(true)}
              src={content.content_url}
              className={`w-full bg-black rounded-b-xl ${
                isFullscreen ? "h-full object-contain" : "max-h-[500px]"
              }`}
            />
          )
        ) : mediaType === "pdf" ? (
          <InlinePdfViewer
            url={content.content_url}
            isFullscreen={isFullscreen}
            themeColor={themeColor}
          />
        ) : mediaType === "image" ? (
          <div
            className={`w-full flex items-center justify-center p-3 overflow-hidden ${
              isFullscreen ? "h-full" : "min-h-[250px] max-h-[550px]"
            }`}
          >
            <img
              src={content.content_url}
              alt={content.title || "Image Preview"}
              onError={() => setLoadError(true)}
              className="max-h-full max-w-full object-contain rounded shadow-lg"
            />
          </div>
        ) : mediaType === "audio" ? (
          <div className="p-8 w-full flex flex-col items-center justify-center gap-4 text-white">
            <FiMusic size={40} className="text-purple-400 animate-pulse" />
            <p className="text-xs font-semibold text-slate-300">{content.title}</p>
            <audio controls controlsList="nodownload" src={content.content_url} onError={() => setLoadError(true)} className="w-full max-w-lg" />
          </div>
        ) : (
          <iframe
            src={content.content_url}
            onError={() => setLoadError(true)}
            className={`w-full bg-white rounded-b-xl border-0 ${
              isFullscreen ? "h-full" : "h-[500px]"
            }`}
          />
        )}
      </div>
    </div>
  );
};

export default InlineMediaViewer;
