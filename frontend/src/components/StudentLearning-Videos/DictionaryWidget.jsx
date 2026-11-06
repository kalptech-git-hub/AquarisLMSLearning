import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiSearch, FiVolume2, FiClock, FiStar } from "react-icons/fi";
import { TbLanguage } from "react-icons/tb";
import { toRomaji } from "wanakana";
import { searchDictionary } from "../../utils/dictionaryApi";

const SUGGESTIONS = ["eat", "school", "friend", "大丈夫"];

const DictionaryWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [recent, setRecent] = useState([]);
    const [fullscreenElement, setFullscreenElement] = useState(null);
    const inputRef = useRef(null);

    // Track active browser fullscreen element (video, pdf, or quiz)
    useEffect(() => {
        const updateFullscreen = () => {
            const fs = (
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement ||
                null
            );
            setFullscreenElement(fs);
        };

        document.addEventListener("fullscreenchange", updateFullscreen);
        document.addEventListener("webkitfullscreenchange", updateFullscreen);
        document.addEventListener("mozfullscreenchange", updateFullscreen);
        document.addEventListener("MSFullscreenChange", updateFullscreen);

        return () => {
            document.removeEventListener("fullscreenchange", updateFullscreen);
            document.removeEventListener("webkitfullscreenchange", updateFullscreen);
            document.removeEventListener("mozfullscreenchange", updateFullscreen);
            document.removeEventListener("MSFullscreenChange", updateFullscreen);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 150);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    const runSearch = async (term) => {
        const trimmed = term?.trim();
        if (!trimmed) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await searchDictionary(trimmed);

            if (!data || data.notFound) {
                setError(`No result found for "${trimmed}". Try a simpler word.`);
            } else {
                setResult(data);
                setRecent((prev) => [
                    trimmed,
                    ...prev.filter((w) => w !== trimmed),
                ].slice(0, 5));
            }
        } catch (err) {
            console.error(err);
            setError(err?.message || "Couldn't reach the dictionary. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") runSearch(query);
    };

    const speak = (text) => {
        if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const flatMeanings = (result?.senses || []).flatMap((s) => s.meanings || []);
    const showFurigana = result?.reading && result.reading !== result.word;
    const romaji = result ? toRomaji(result.reading || result.word) : "";

    // Target mount node: if container fullscreen is active, mount inside it
    let mountNode = null;
    if (fullscreenElement) {
        mountNode = fullscreenElement.tagName === "VIDEO" ? null : fullscreenElement;
    }

        // was: "absolute bottom-6 right-1 sm:right-2 z-40" for the non-fullscreen case —
    // absolute positioning anchors to the nearest positioned ancestor's own box
    // (the flex-1 wrapper in LearningLayout.jsx), not the actual visible viewport.
    // If that ancestor is even slightly wider than the screen for any reason, right-1
    // measures from the container's true edge rather than the screen's, pushing the
    // FAB mostly off-screen — visible only as a sliver at the corner. Switched to
    // fixed, matching the fullscreen branch's own approach, so the FAB is always
    // pinned to the real screen corner regardless of container width. Tightened the
    // phone offset slightly (bottom-5 right-4) since fixed positioning no longer
    // benefits from any implicit safe margin the flex layout was providing.
        // was: bottom-20 sm:bottom-24 for the fullscreen-mounted case — Chrome shows its
    // own native "exit fullscreen" hint bar at the bottom edge for a few seconds after
    // entering fullscreen (browser chrome, not something this app renders or can
    // reposition), and the FAB sat close enough to it to look crowded while that hint
    // was visible. Bumped up further on phone for clearer separation.
    const widgetContent = (
        <div className={mountNode ? "fixed bottom-28 sm:bottom-24 right-6 z-[99999]" : "fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40"}>
            {/* Panel */}
            <div
                className={`absolute bottom-16 right-0 w-[340px] max-w-[90vw] origin-bottom-right rounded-[22px] p-px bg-gradient-to-br from-purple-600 to-pink-500 shadow-2xl transition-all duration-200 ${
                    isOpen
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                }`}
            >
                <div className="rounded-[21px] bg-[#14151F] overflow-hidden flex flex-col max-h-[75vh]">
                    {/* Header — fixed, never scrolls */}
                    <div className="flex items-center justify-between px-4 pt-3.5 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-[7px] bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shrink-0">
                                <TbLanguage className="text-white text-sm" />
                            </div>
                            <span className="font-medium text-[13px] text-slate-200">
                                Dictionary
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-500 hover:text-white cursor-pointer"
                            aria-label="Close dictionary"
                        >
                            <FiX className="text-base" />
                        </button>
                    </div>

                    {/* Search — fixed, never scrolls */}
                    <div className="px-[18px] pt-3 shrink-0">
                        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-full px-3.5 py-2">
                            <FiSearch className="text-slate-500 text-sm shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search English or Japanese..."
                                className="w-full bg-transparent text-[13px] text-slate-200 placeholder-slate-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Results — fixed height always, regardless of content length.
                        Short results leave empty space below; long results scroll
                        inside this box instead of growing the panel. */}
                    <div className="px-[18px] pt-3 pb-[18px] h-[280px] overflow-y-auto">
                        {loading ? (
                            <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
                                Searching dictionary...
                            </div>
                        ) : error ? (
                            <div className="py-6 px-3 text-center text-rose-400 text-xs bg-rose-500/10 rounded-xl border border-rose-500/20">
                                {error}
                            </div>
                        ) : result ? (
                            <div className="space-y-3 text-left">
                                <div className="flex items-start justify-between gap-2 border-b border-white/[0.08] pb-3">
                                    <div>
                                        {/* Furigana reading above kanji — only when reading differs */}
                                        {showFurigana && (
                                            <ruby className="text-xs text-pink-400 font-medium">
                                                <rp>(</rp>
                                                <rt className="text-[11px] select-none">{result.reading}</rt>
                                                <rp>)</rp>
                                            </ruby>
                                        )}
                                        <div className="text-2xl font-bold text-white tracking-wide">
                                            {result.word}
                                        </div>
                                        {/* Romanized pronunciation line — always shown */}
                                        {romaji && (
                                            <div className="text-[11px] text-slate-400 font-mono tracking-wider">
                                                {romaji}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => speak(result.reading || result.word)}
                                        className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-pink-400 transition cursor-pointer shrink-0"
                                        title="Listen to pronunciation"
                                        aria-label="Listen to pronunciation"
                                    >
                                        <FiVolume2 className="text-base" />
                                    </button>
                                </div>

                                {/* Meanings — flattened, unnumbered */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                                        Meanings
                                    </span>
                                    <div className="space-y-1">
                                        {flatMeanings.map((m, idx) => (
                                            <div
                                                key={idx}
                                                className="text-[12.5px] text-slate-300 leading-snug"
                                            >
                                                {m}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {recent.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1 mb-1.5">
                                            <FiClock /> Recent searches
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {recent.map((w, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setQuery(w);
                                                        runSearch(w);
                                                    }}
                                                    className="text-[11.5px] px-2 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition cursor-pointer"
                                                >
                                                    {w}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <span className="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1 mb-1.5">
                                    <FiStar /> Try searching
                                </span>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {SUGGESTIONS.map((w, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setQuery(w);
                                                runSearch(w);
                                            }}
                                            className="flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full bg-pink-500/[0.08] border border-pink-500/[0.15] text-[11.5px] text-slate-300 hover:border-pink-500/30 cursor-pointer"
                                        >
                                            <FiStar className="text-pink-400 text-[11px]" />
                                            {w}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 shadow-lg shadow-pink-500/30 flex items-center justify-center cursor-pointer transition-transform ${
                    isOpen ? "scale-95" : "hover:-translate-y-0.5"
                }`}
                aria-label="Open dictionary"
            >
                <TbLanguage className="text-white text-2xl" />
            </button>
        </div>
    );

    if (mountNode) {
        return createPortal(widgetContent, mountNode);
    }

    return widgetContent;
};

export default DictionaryWidget;