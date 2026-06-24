import { useRef } from "react";

export default function DateSelector({ selectedDate, setSelectedDate, availableDates, onOpenCalendar }) {
  const dateScrollRef = useRef(null);
  const dateRefs = useRef({});

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateKey = date.toDateString();
    const element = dateRefs.current[dateKey];
    if (element && dateScrollRef.current) {
      const container = dateScrollRef.current;
      container.scrollTo({
        left: element.offsetLeft - container.offsetWidth / 2 + element.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-background border-b border-border sticky top-[49px] z-30">
      <div className="container mx-auto px-4 py-3">
        <button
          onClick={onOpenCalendar}
          className="flex items-center gap-2 mb-2 hover:opacity-70 transition-opacity"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div
          ref={dateScrollRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {availableDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const dateKey = date.toDateString();

            return (
              <button
                key={index}
                ref={(el) => (dateRefs.current[dateKey] = el)}
                onClick={() => handleDateClick(date)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-md transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-secondary/10 border border-border"
                }`}
              >
                <div className="text-[10px] font-medium">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-lg font-semibold mt-0.5">
                  {date.getDate().toString().padStart(2, "0")}
                </div>
                {isToday && (
                  <div className="text-[8px] font-medium mt-0.5 opacity-80">
                    Today
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}