import React, { useState } from 'react';

export default function Calendar({ selectedDate, onDateSelect, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get current month and next month
  const getCurrentAndNextMonth = () => {
    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), 1);
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return [current, next];
  };

  const [displayMonth, setDisplayMonth] = useState(getCurrentAndNextMonth()[0]);

  // Generate calendar days for a month
  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // First day of month and total days
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week (0 = Sunday)
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const isPast = date < today;
      
      days.push({
        date: day,
        fullDate: date,
        isPast,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString()
      });
    }
    
    return days;
  };

  const canGoPrevious = () => {
    const [current] = getCurrentAndNextMonth();
    return displayMonth.getTime() > current.getTime();
  };

  const canGoNext = () => {
    const [, next] = getCurrentAndNextMonth();
    return displayMonth.getTime() < next.getTime();
  };

  const goToPreviousMonth = () => {
    if (canGoPrevious()) {
      setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
    }
  };

  const goToNextMonth = () => {
    if (canGoNext()) {
      setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1));
    }
  };

  const handleDateClick = (day) => {
    if (!day || day.isPast) return;
    onDateSelect(day.fullDate);
  };

  const calendarDays = generateCalendarDays(displayMonth);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">Select Date</h3>
          <button 
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center px-6 py-4">
          <button
            onClick={goToPreviousMonth}
            disabled={!canGoPrevious()}
            className={`text-2xl ${canGoPrevious() ? 'text-gray-700 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'}`}
          >
            ‹
          </button>
          
          <h4 className="text-base font-semibold">
            {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          
          <button
            onClick={goToNextMonth}
            disabled={!canGoNext()}
            className={`text-2xl ${canGoNext() ? 'text-gray-700 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'}`}
          >
            ›
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-6 pb-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={day.isPast}
                  className={`aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    day.isPast
                      ? 'text-gray-300 cursor-not-allowed'
                      : day.isSelected
                      ? 'bg-green-600 text-white shadow-lg'
                      : day.isToday
                      ? 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day.date}
                </button>
              );
            })}
          </div>
        </div>

        {/* Done Button */}
        <div className="p-4 border-t">
          <button 
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            DONE
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}