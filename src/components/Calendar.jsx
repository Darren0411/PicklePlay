import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Calendar({ selectedDate, onDateSelect, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current month and next month
  const getCurrentAndNextMonth = () => {
    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), 1);
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return [current, next];
  };

  const [displayMonth, setDisplayMonth] = useState(getCurrentAndNextMonth()[0]);

  // Fetch slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  // Check if slot is in the past
  const isSlotPast = (slotDate, slotTime) => {
    const now = new Date();
    const slotDateTime = new Date(slotDate);
    
    // Parse slot time (e.g., "8:00 - 9:00")
    const startTime = slotTime.split(' - ')[0];
    const [hours, minutes] = startTime.split(':').map(Number);
    
    slotDateTime.setHours(hours, minutes || 0, 0, 0);
    
    // Add 1 hour buffer - slots within next hour are also unavailable
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
        console.log('No slots found for:', dateStr);
        setSlots([]);
      } else {
        const fetchedSlots = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter out past slots and mark them
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
        
        // Sort slots by time
        processedSlots.sort((a, b) => {
          const timeA = a.time.split(' - ')[0];
          const timeB = b.time.split(' - ')[0];
          return timeA.localeCompare(timeB);
        });
        
        setSlots(processedSlots);
        console.log('✅ Fetched slots:', processedSlots);
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

  const getSlotStatusColor = (slot) => {
    if (slot.isPast) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60';
    }
    if (slot.status === 'booked') {
      return 'bg-red-100 text-red-600 cursor-not-allowed border-red-200';
    }
    return 'bg-white text-gray-800 border-gray-300 hover:border-green-500 hover:shadow-md';
  };

  const getSlotIcon = (slot) => {
    if (slot.isPast) {
      return '⏱️';
    }
    if (slot.status === 'booked') {
      return '✕';
    }
    return '○';
  };

  const calendarDays = generateCalendarDays(displayMonth);

  // Count available slots (excluding past and booked)
  const availableSlotCount = slots.filter(
    slot => slot.status === 'available' && !slot.isPast
  ).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">📅</span>
              <div>
                <h3 className="text-2xl font-bold">Select Date & Time</h3>
                <p className="text-green-100 text-sm mt-1">Choose your preferred slot</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl w-10 h-10 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious()}
              className={`text-2xl p-2 rounded-lg transition-all ${
                canGoPrevious() 
                  ? 'text-gray-700 hover:bg-white hover:shadow-md' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              ←
            </button>
            
            <h4 className="text-xl font-bold text-gray-800">
              {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext()}
              className={`text-2xl p-2 rounded-lg transition-all ${
                canGoNext() 
                  ? 'text-gray-700 hover:bg-white hover:shadow-md' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-bold text-gray-600 py-2">
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
                    className={`aspect-square rounded-xl flex items-center justify-center text-base font-semibold transition-all ${
                      day.isPast
                        ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                        : day.isSelected
                        ? 'bg-green-600 text-white shadow-lg transform scale-110'
                        : day.isToday
                        ? 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                        : 'text-gray-700 hover:bg-green-50 hover:shadow-md border border-gray-200'
                    }`}
                  >
                    {day.date}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Section */}
          {selectedDate && (
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-2">🏓</span>
                  Available Slots
                  {availableSlotCount > 0 && (
                    <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {availableSlotCount} available
                    </span>
                  )}
                </h4>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-white border-2 border-gray-300"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-red-100 border-2 border-red-200"></div>
                  <span className="text-gray-600">Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-gray-200"></div>
                  <span className="text-gray-600">Past Time</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-5xl mb-3">🎾</div>
                  <p className="text-gray-600 font-medium">Loading slots...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-600 font-semibold">No slots available</p>
                  <p className="text-gray-500 text-sm mt-1">Please select another date</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-lg border-2 transition-all ${getSlotStatusColor(slot)}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{getSlotIcon(slot)}</span>
                        {slot.isPast && (
                          <span className="text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full">
                            Past
                          </span>
                        )}
                        {slot.status === 'booked' && !slot.isPast && (
                          <span className="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded-full">
                            Booked
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold">{slot.time}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {slot.isPast ? 'Unavailable' : `₹${slot.price}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-b-2xl border-t-2 border-gray-200">
          <button 
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-base hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105"
          >
            CLOSE
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  );
}