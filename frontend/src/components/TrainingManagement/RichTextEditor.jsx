import { useRef, useEffect, useState } from "react";
import { FiBold, FiItalic, FiUnderline, FiLink, FiList } from "react-icons/fi";
import { MdFormatListNumbered, MdFormatClear } from "react-icons/md";

const RichTextEditor = ({ value, onChange, placeholder, disabled, maxLength }) => {
    const editorRef = useRef(null);
    const lastValidHtmlRef = useRef(value || "");
    const [activeStates, setActiveStates] = useState({
        bold: false,
        italic: false,
        underline: false,
        bulletList: false,
        numberList: false,
    });
    const [activeBlock, setActiveBlock] = useState("p");

    // Sync value from prop to contentEditable innerHTML
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            const safeVal = maxLength && (value || "").length > maxLength
                ? (value || "").slice(0, maxLength)
                : (value || "");
            editorRef.current.innerHTML = safeVal;
            lastValidHtmlRef.current = safeVal;
        }
    }, [value, maxLength]);

    const checkActiveStates = () => {
        try {
            setActiveStates({
                bold: document.queryCommandState("bold"),
                italic: document.queryCommandState("italic"),
                underline: document.queryCommandState("underline"),
                bulletList: document.queryCommandState("insertUnorderedList"),
                numberList: document.queryCommandState("insertOrderedList"),
            });

            let blockVal = document.queryCommandValue("formatBlock") || "p";
            if (blockVal === "h3" || blockVal === "heading-3" || blockVal === "<h3>") {
                blockVal = "h3";
            } else if (blockVal === "h4" || blockVal === "heading-4" || blockVal === "<h4>") {
                blockVal = "h4";
            } else {
                blockVal = "p";
            }
            setActiveBlock(blockVal);
        } catch (e) {
            // Ignore selection read errors
        }
    };

    // Helper to calculate the length of selected HTML inside editor
    const getSelectedHtmlLength = () => {
        try {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                return 0;
            }
            const range = selection.getRangeAt(0);
            if (!editorRef.current || !editorRef.current.contains(range.commonAncestorContainer)) {
                return 0;
            }
            const cloned = range.cloneContents();
            const tempDiv = document.createElement("div");
            tempDiv.appendChild(cloned);
            return tempDiv.innerHTML.length;
        } catch {
            return 0;
        }
    };

    // Intercept input before insertion to strictly prevent exceeding maxLength
    const handleBeforeInput = (e) => {
        if (!maxLength) return;

        // Allow deletion, backspace, cut, and undo/redo operations
        if (
            e.inputType &&
            (e.inputType.startsWith("delete") || e.inputType.startsWith("history"))
        ) {
            return;
        }

        const currentHtml = editorRef.current ? editorRef.current.innerHTML : "";
        const selectedLen = getSelectedHtmlLength();

        let incomingLen = 1;
        if (e.data) {
            incomingLen = e.data.length;
        } else if (e.inputType === "insertParagraph" || e.inputType === "insertLineBreak") {
            incomingLen = 7;
        }

        if (currentHtml.length - selectedLen + incomingLen > maxLength) {
            e.preventDefault();
        }
    };

    // Intercept keystrokes to ensure fast typing stops cleanly at maxLength
    const handleKeyDown = (e) => {
        if (!maxLength) return;

        // Allow navigation, modifier keys, backspace, delete, shortcuts (Ctrl+A, Ctrl+C, Ctrl+Z, Ctrl+V, etc.)
        if (
            e.key === "Backspace" ||
            e.key === "Delete" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.key === "Home" ||
            e.key === "End" ||
            e.key === "PageUp" ||
            e.key === "PageDown" ||
            e.key === "Tab" ||
            e.key === "Escape" ||
            e.ctrlKey ||
            e.metaKey ||
            e.altKey
        ) {
            return;
        }

        const currentHtml = editorRef.current ? editorRef.current.innerHTML : "";
        const selectedLen = getSelectedHtmlLength();
        const incomingLen = e.key === "Enter" ? 7 : 1;

        if (currentHtml.length - selectedLen + incomingLen > maxLength) {
            e.preventDefault();
        }
    };

    // Intercept paste to truncate pasted content so it never overflows maxLength
    const handlePaste = (e) => {
        if (!maxLength) return;
        e.preventDefault();

        const clipboardText = (e.clipboardData || window.clipboardData)?.getData("text/plain") || "";
        if (!clipboardText) return;

        const currentHtml = editorRef.current ? editorRef.current.innerHTML : "";
        const selectedLen = getSelectedHtmlLength();
        const available = maxLength - (currentHtml.length - selectedLen);

        if (available <= 0) {
            return;
        }

        const textToInsert = clipboardText.slice(0, available);
        document.execCommand("insertText", false, textToInsert);
        handleInput();
    };

    // Listen to document selection changes to update active button styles as cursor moves
    useEffect(() => {
        const handleSelectionChange = () => {
            if (document.activeElement === editorRef.current) {
                checkActiveStates();
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, []);

    const handleInput = () => {
        if (editorRef.current) {
            let html = editorRef.current.innerHTML;
            // If contenteditable is completely empty except for browser br tags, clear it
            if (html === "<br>" || html === "<div><br></div>" || html === "<p><br></p>") {
                html = "";
            }

            if (maxLength && html.length > maxLength) {
                if (lastValidHtmlRef.current && lastValidHtmlRef.current.length <= maxLength) {
                    editorRef.current.innerHTML = lastValidHtmlRef.current;
                    html = lastValidHtmlRef.current;
                } else {
                    html = html.slice(0, maxLength);
                    editorRef.current.innerHTML = html;
                }
            } else {
                lastValidHtmlRef.current = html;
            }

            onChange(html);
            checkActiveStates();
        }
    };

    const executeCommand = (command, arg = null) => {
        document.execCommand(command, false, arg);
        if (editorRef.current && maxLength) {
            const newHtml = editorRef.current.innerHTML;
            if (newHtml.length > maxLength) {
                document.execCommand("undo");
                return;
            }
        }
        handleInput();
    };

    return (
        <div className="border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-1 focus-within:ring-slate-500 focus-within:border-slate-500 transition">
            <style>{`
                .rich-editor-content ul {
                    list-style-type: disc !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .rich-editor-content ol {
                    list-style-type: decimal !important;
                    padding-left: 1.5rem !important;
                    margin-top: 0.5rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .rich-editor-content li {
                    margin-bottom: 0.25rem !important;
                }
                .rich-editor-content a {
                    color: #dc2626 !important;
                    text-decoration: underline !important;
                }
                .rich-editor-content h3 {
                    font-size: 1.2rem !important;
                    font-weight: 700 !important;
                    margin-top: 0.75rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .rich-editor-content h4 {
                    font-size: 1.05rem !important;
                    font-weight: 600 !important;
                    margin-top: 0.75rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .rich-editor-content[contenteditable]:empty::before {
                    content: attr(placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
            `}</style>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border-b border-gray-200 select-none">
                {/* Format Block Select */}
                <select
                    value={activeBlock}
                    onChange={(e) => executeCommand("formatBlock", e.target.value)}
                    className="text-xs border border-gray-300 rounded px-1.5 py-1 bg-white text-gray-700 focus:outline-none font-medium cursor-pointer"
                    disabled={disabled}
                >
                    <option value="p">Normal</option>
                    <option value="h3">Heading 1</option>
                    <option value="h4">Heading 2</option>
                </select>

                <div className="h-4 w-px bg-gray-300 mx-1"></div>

                {/* Bold */}
                <button
                    type="button"
                    onClick={() => executeCommand("bold")}
                    className={`p-1.5 rounded transition ${
                        activeStates.bold 
                            ? "bg-gray-200 text-gray-900 font-semibold" 
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                    title="Bold"
                    disabled={disabled}
                >
                    <FiBold size={14} />
                </button>

                {/* Italic */}
                <button
                    type="button"
                    onClick={() => executeCommand("italic")}
                    className={`p-1.5 rounded transition ${
                        activeStates.italic 
                            ? "bg-gray-200 text-gray-900" 
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                    title="Italic"
                    disabled={disabled}
                >
                    <FiItalic size={14} />
                </button>

                {/* Underline */}
                <button
                    type="button"
                    onClick={() => executeCommand("underline")}
                    className={`p-1.5 rounded transition ${
                        activeStates.underline 
                            ? "bg-gray-200 text-gray-900" 
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                    title="Underline"
                    disabled={disabled}
                >
                    <FiUnderline size={14} />
                </button>

                {/* Link */}
                <button
                    type="button"
                    onClick={() => {
                        const url = prompt("Enter URL Link:");
                        if (url) executeCommand("createLink", url);
                    }}
                    className="p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded transition"
                    title="Insert Link"
                    disabled={disabled}
                >
                    <FiLink size={14} />
                </button>

                <div className="h-4 w-px bg-gray-300 mx-1"></div>

                {/* Unordered List */}
                <button
                    type="button"
                    onClick={() => executeCommand("insertUnorderedList")}
                    className={`p-1.5 rounded transition ${
                        activeStates.bulletList 
                            ? "bg-gray-200 text-gray-900" 
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                    title="Bullet List"
                    disabled={disabled}
                >
                    <FiList size={14} />
                </button>

                {/* Ordered List */}
                <button
                    type="button"
                    onClick={() => executeCommand("insertOrderedList")}
                    className={`p-1.5 rounded transition ${
                        activeStates.numberList 
                            ? "bg-gray-200 text-gray-900" 
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                    title="Numbered List"
                    disabled={disabled}
                >
                    <MdFormatListNumbered size={14} />
                </button>

                <div className="h-4 w-px bg-gray-300 mx-1"></div>

                {/* Clear Formatting */}
                <button
                    type="button"
                    onClick={() => executeCommand("removeFormat")}
                    className="p-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded transition"
                    title="Clear Formatting"
                    disabled={disabled}
                >
                    <MdFormatClear size={14} />
                </button>
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable={!disabled}
                onBeforeInput={handleBeforeInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onInput={handleInput}
                onKeyUp={checkActiveStates}
                onMouseUp={checkActiveStates}
                onFocus={checkActiveStates}
                placeholder={placeholder}
                className="rich-editor-content p-3 min-h-[160px] max-h-[300px] overflow-y-auto focus:outline-none text-sm text-gray-800"
                style={{
                    wordBreak: "break-word"
                }}
            />
        </div>
    );
};

export default RichTextEditor;
