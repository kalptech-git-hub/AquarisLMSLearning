import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiClock, FiCheck, FiChevronDown, FiX } from "react-icons/fi";

const ITEM_HEIGHT = 40; // Height of each row in px
const VISIBLE_ITEMS = 3; // 3 rows visible: previous, selected in center, next

const WheelColumn = ({ items, selectedValue, onSelect, itemRenderer }) => {
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const selectedIndex = items.indexOf(selectedValue);

  // Scroll to selected item on mount or when value changes externally
  useEffect(() => {
    if (!containerRef.current || isScrollingRef.current) return;
    const targetScroll = selectedIndex * ITEM_HEIGHT;
    if (Math.abs(containerRef.current.scrollTop - targetScroll) > 2) {
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: "smooth"
      });
    }
  }, [selectedIndex]);

  const handleScroll = useCallback(
    (e) => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        if (!containerRef.current) return;
        const index = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
        if (items[clampedIndex] !== selectedValue) {
          onSelect(items[clampedIndex]);
        }
        isScrollingRef.current = false;
      }, 70);
    },
    [items, onSelect, selectedValue]
  );

  const handleItemClick = (index, val) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth"
      });
    }
    onSelect(val);
  };

  return (
    <div className="relative flex-1 select-none">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: `${ITEM_HEIGHT * VISIBLE_ITEMS}px`,
          paddingTop: `${ITEM_HEIGHT}px`,
          paddingBottom: `${ITEM_HEIGHT}px`,
          scrollSnapType: "y mandatory"
        }}
        className="overflow-y-auto no-scrollbar scroll-smooth"
      >
        {items.map((item, idx) => {
          const isSelected = item === selectedValue;
          return (
            <div
              key={item}
              style={{
                height: `${ITEM_HEIGHT}px`,
                scrollSnapAlign: "center"
              }}
              onClick={() => handleItemClick(idx, item)}
              className={`flex items-center justify-center cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "text-slate-900 font-bold text-lg scale-105"
                  : "text-slate-400 font-normal text-sm hover:text-slate-600"
              }`}
            >
              {itemRenderer ? itemRenderer(item, isSelected) : item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AlarmTimePicker = ({
  time24 = "",
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "Select Time"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const popupRef = useRef(null);
  const triggerRef = useRef(null);

  // Parse 24h string "HH:mm" to 12h representation
  const parseTime24 = (tStr) => {
    if (!tStr || !tStr.includes(":")) {
      return { hour: "12", minute: "00", ampm: "AM", hasValue: false };
    }
    const [hStr, mStr] = tStr.split(":");
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return { hour: "12", minute: "00", ampm: "AM", hasValue: false };
    const ampm = h >= 12 ? "PM" : "AM";
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    const min = String(parseInt(mStr, 10) || 0).padStart(2, "0");
    return { hour: String(h12), minute: min, ampm, hasValue: true };
  };

  const { hour, minute, ampm, hasValue } = parseTime24(time24);

  // Convert 12h values back to 24h format "HH:mm"
  const emitChange = (h12, min, ap) => {
    let h = parseInt(h12, 10);
    if (isNaN(h)) h = 12;
    const a = ap || "AM";
    if (a === "PM" && h < 12) h += 12;
    if (a === "AM" && h === 12) h = 0;
    const pad = (n) => String(n).padStart(2, "0");
    onChange(`${pad(h)}:${pad(min)}`);
  };

  const handleHourSelect = (newH) => {
    emitChange(newH, minute, ampm || "AM");
  };

  const handleMinuteSelect = (newM) => {
    emitChange(hour || "12", newM, ampm || "AM");
  };

  const handleAmpmSelect = (newAp) => {
    emitChange(hour || "12", minute || "00", newAp);
  };

  // Auto-detect whether to open upwards or downwards based on viewport space (matching native calendar behavior)
  const updatePlacement = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const POPUP_HEIGHT = 220; // height of the wheel popover
    setOpenUpward(spaceBelow < POPUP_HEIGHT && spaceAbove > spaceBelow);
  }, []);

  const toggleOpen = () => {
    if (!isOpen) {
      updatePlacement();
    }
    setIsOpen((prev) => !prev);
  };

  // Close popup when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleScrollOrResize = () => updatePlacement();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, updatePlacement]);

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutesList = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const ampmList = ["AM", "PM"];

  return (
    <div className="relative w-full" ref={popupRef}>
      {/* Trigger Button Input matching phone alarm format */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between border rounded-lg px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
          disabled
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
            : hasError
            ? "border-red-400 bg-red-50/20 text-red-900 focus:border-red-500"
            : isOpen
            ? "border-[#1B357F] ring-2 ring-[#1B357F]/15 bg-white"
            : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-2">
          <FiClock className={`text-sm ${isOpen ? "text-[#1B357F]" : "text-slate-400"}`} />
          {hasValue ? (
            <div className="flex items-center gap-1 font-medium">
              <span className="text-slate-900 font-semibold">{hour}</span>
              <span className="text-slate-400">:</span>
              <span className="text-slate-900 font-semibold">{minute}</span>
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1B357F]/10 text-[#1B357F] border border-[#1B357F]/20">
                {ampm}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>

        <FiChevronDown
          className={`text-slate-400 text-xs transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#1B357F]" : ""
          }`}
        />
      </button>

      {/* Phone Alarm Scroll Wheel Popover (Opens Up or Down like Calendar) */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 sm:left-auto sm:right-0 sm:w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-3 animate-in fade-in duration-150 backdrop-blur-md ${
            openUpward ? "bottom-full mb-1.5 origin-bottom" : "top-full mt-1.5 origin-top"
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Set Time
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1B357F] bg-[#1B357F]/10 px-2.5 py-0.5 rounded-full border border-[#1B357F]/20">
                {hour}:{minute} {ampm}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Done"
                className="p-1 rounded-md text-slate-400 hover:text-[#1B357F] hover:bg-slate-100 transition cursor-pointer"
              >
                <FiCheck className="text-base text-[#1B357F] font-bold" />
              </button>
            </div>
          </div>

          {/* Wheel Picker Container */}
          <div className="relative mt-2 bg-slate-50/50 rounded-xl py-1 overflow-hidden border border-slate-100">
            {/* Center Selection Highlight Band with Top & Bottom Dividers */}
            <div
              style={{
                top: `${ITEM_HEIGHT}px`,
                height: `${ITEM_HEIGHT}px`
              }}
              className="absolute left-0 right-0 pointer-events-none border-t border-b border-slate-200/90 bg-white/90 shadow-xs"
            />

            {/* 3 Wheel Columns: Hour, Minute, AM/PM */}
            <div className="flex items-center divide-x divide-slate-100 relative z-10">
              {/* Hour Column */}
              <WheelColumn
                items={hoursList}
                selectedValue={hour || "12"}
                onSelect={handleHourSelect}
                itemRenderer={(h, isSelected) => (
                  <div className="flex items-baseline gap-0.5">
                    <span className={isSelected ? "text-[#0B1E39] font-bold text-lg" : ""}>{h}</span>
                    {isSelected && <span className="text-[10px] font-semibold text-slate-400">h</span>}
                  </div>
                )}
              />

              {/* Minute Column */}
              <WheelColumn
                items={minutesList}
                selectedValue={minute || "00"}
                onSelect={handleMinuteSelect}
                itemRenderer={(m, isSelected) => (
                  <div className="flex items-baseline gap-0.5">
                    <span className={isSelected ? "text-[#0B1E39] font-bold text-lg" : ""}>{m}</span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-slate-400">min</span>
                    )}
                  </div>
                )}
              />

              {/* AM / PM Column (Navy Blue Highlight matching Instructor Theme) */}
              <WheelColumn
                items={ampmList}
                selectedValue={ampm || "AM"}
                onSelect={handleAmpmSelect}
                itemRenderer={(ap, isSelected) => (
                  <span
                    className={`${
                      isSelected
                        ? "text-[#1B357F] font-black text-base scale-110"
                        : "text-slate-400 font-medium text-xs"
                    }`}
                  >
                    {ap}
                  </span>
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmTimePicker;
