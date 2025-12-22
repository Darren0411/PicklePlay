import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Calendar({ selectedDate, onDateSelect, onClose }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);

  // Start with current month
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Fetch all available dates on mount
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  // Fetch slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  // Fetch all dates that have available slots
  const fetchAvailableDates = async () => {
    setLoadingDates(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Fetch all slots from today onwards
      const slotsQuery = query(
        collection(db, 'slots'),
        where('date', '>=', todayStr)
      );
      
      const querySnapshot = await getDocs(slotsQuery);
      
      // Group by date and check if any slots are available
      const dateMap = {};
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.date;
        
        if (!dateMap[date]) {
          dateMap[date] = [];
        }
        
        // Only count available slots (not booked)
        if (data.status === 'available') {
          dateMap[date].push(data);
        }
      });

      // Filter dates that have at least one available slot
      const datesWithSlots = Object.keys(dateMap)
        .filter(date => dateMap[date].length > 0)
        .map(date => new Date(date));
      
      setAvailableDates(datesWithSlots);
      console.log('✅ Available dates:', datesWithSlots.length);
    } catch (error) {
      console.error('❌ Error fetching available dates:', error);
    } finally {
      setLoadingDates(false);
    }
  };

  // Check if a date has available slots
  const hasAvailableSlots = (date) => {
    return availableDates.some(availDate => 
      availDate.toDateString() === date.toDateString()
    );
  };

  // Check if slot is in the past
  const isSlotPast = (slotDate, slotTime) => {
    const now = new Date();
    const slotDateTime = new Date(slotDate);
    
    const startTime = slotTime.split(' - ')[0];
    const [hours, minutes] = startTime.split(':').map(Number);
    
    slotDateTime.setHours(hours, minutes || 0, 0, 0);
    
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    return slotDateTime < oneHourFromNow;
  };

  const fetchSlots = async (date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const slotsQuery = query(
        collection(db, 'slots'),
        where('date', '==', dateStr)
      );
      
      const querySnapshot = await getDocs(slotsQuery);
      
      if (querySnapshot.empty) {
        setSlots([]);
      } else {
        const fetchedSlots = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const now = new Date();
        const isToday = dateStr === now.toISOString().split('T')[0];
        
        const processedSlots = fetchedSlots.map(slot => {
          if (isToday && isSlotPast(dateStr, slot.time)) {
            return {
              ...slot,
              status: 'past',
              isPast: true
            };
          }
          return {
            ...slot,
            isPast: false
          };
        });
        
        processedSlots.sort((a, b) => {
          const timeA = a.time.split(' - ')[0];
          const timeB = b.time.split(' - ')[0];
          return timeA.localeCompare(timeB);
        });
        
        setSlots(processedSlots);
      }
    } catch (error) {
      console.error('❌ Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days for a month
  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const isPast = date < today;
      const hasSlots = hasAvailableSlots(date);
      
      days.push({
        date: day,
        fullDate: date,
        isPast,
        hasSlots,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString()
      });
    }
    
    return days;
  };

  // Check if month has any available slots
  const monthHasSlots = (month) => {
    return availableDates.some(date => 
      date.getMonth() === month.getMonth() && 
      date.getFullYear() === month.getFullYear()
    );
  };

  const goToPreviousMonth = () => {
    let newMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1);
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Keep going back until we find a month with slots or reach current month
    while (newMonth >= currentMonth && !monthHasSlots(newMonth)) {
      newMonth = new Date(newMonth.getFullYear(), newMonth.getMonth() - 1, 1);
    }
    
    if (newMonth >= currentMonth) {
      setDisplayMonth(newMonth);
    }
  };

  const goToNextMonth = () => {
    let newMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);
    
    // Keep going forward until we find a month with slots
    let attempts = 0;
    while (!monthHasSlots(newMonth) && attempts < 12) {
      newMonth = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 1);
      attempts++;
    }
    
    if (monthHasSlots(newMonth)) {
      setDisplayMonth(newMonth);
    }
  };

  const canGoPrevious = () => {
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Check if there are any available dates before current display month
    return availableDates.some(date => {
      const dateMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      return dateMonth >= currentMonth && dateMonth < displayMonth;
    });
  };

  const canGoNext = () => {
    // Check if there are any available dates after current display month
    const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);
    return availableDates.some(date => {
      const dateMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      return dateMonth >= nextMonth;
    });
  };

  const handleDateClick = (day) => {
    if (!day || day.isPast || !day.hasSlots) return;
    onDateSelect(day.fullDate);
  };

  const calendarDays = generateCalendarDays(displayMonth);

  const availableSlotCount = slots.filter(
    slot => slot.status === 'available' && !slot.isPast
  ).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-3 rounded-t-xl flex justify-between items-center">
          <h3 className="text-base font-bold">Select Date</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl w-6 h-6 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="p-3">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded-lg">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious()}
              className={`text-lg p-1.5 rounded transition-all ${
                canGoPrevious() 
                  ? 'text-gray-700 hover:bg-white' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              ←
            </button>
            
            <h4 className="text-sm font-bold text-gray-800">
              {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext()}
              className={`text-lg p-1.5 rounded transition-all ${
                canGoNext() 
                  ? 'text-gray-700 hover:bg-white' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              →
            </button>
          </div>

          {/* Loading State */}
          {loadingDates ? (
            <div className="text-center py-8">
              <div className="animate-spin text-3xl mb-2">📅</div>
              <p className="text-gray-600 text-xs">Loading available dates...</p>
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="mb-3">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(day)}
                        disabled={day.isPast || !day.hasSlots}
                        className={`aspect-square rounded-md flex items-center justify-center text-xs font-semibold transition-all ${
                          day.isPast || !day.hasSlots
                            ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                            : day.isSelected
                            ? 'bg-green-600 text-white shadow-md scale-105'
                            : day.isToday
                            ? 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                            : 'text-gray-700 hover:bg-green-50 border border-gray-200 hover:border-green-400'
                        }`}
                      >
                        {day.date}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info Text */}
              <div className="text-center mb-3">
                <p className="text-[10px] text-gray-500">
                  {availableDates.length > 0 ? (
                    <>Only dates with available slots are shown</>
                  ) : (
                    <>No slots available. Check back later.</>
                  )}
                </p>
              </div>

              {/* Slots Section */}
              {/* {selectedDate && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-800">
                      Available Slots
                      {availableSlotCount > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]">
                          {availableSlotCount}
                        </span>
                      )}
                    </h4>
                    <div className="text-[10px] text-gray-500">
                      {selectedDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin text-2xl mb-1">🎾</div>
                      <p className="text-gray-600 text-[10px]">Loading...</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-xs">No slots available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto">
                      {slots.filter(slot => !slot.isPast && slot.status === 'available').map((slot) => (
                        <div
                          key={slot.id}
                          className="p-1.5 rounded border border-gray-300 bg-white hover:border-green-500 hover:shadow-sm transition-all"
                        >
                          <div className="text-[10px] font-semibold text-gray-800">{slot.time}</div>
                          <div className="text-[9px] text-gray-500 mt-0.5">₹{slot.price}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )} */}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-2 rounded-b-xl border-t border-gray-200">
          <button 
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-700 transition-all"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}