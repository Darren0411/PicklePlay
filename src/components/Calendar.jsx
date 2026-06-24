import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '@/components/ui/button';

export default function Calendar({ selectedDate, onDateSelect, onClose }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);

  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate]);

  const fetchAvailableDates = async () => {
    setLoadingDates(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      const slotsQuery = query(collection(db, 'slots'), where('date', '>=', todayStr));
      const querySnapshot = await getDocs(slotsQuery);
      const dateMap = {};
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!dateMap[data.date]) dateMap[data.date] = [];
        if (data.status === 'available') dateMap[data.date].push(data);
      });
      const datesWithSlots = Object.keys(dateMap)
        .filter(date => dateMap[date].length > 0)
        .map(date => new Date(date));
      setAvailableDates(datesWithSlots);
    } catch (error) {
      console.error('❌ Error fetching available dates:', error);
    } finally {
      setLoadingDates(false);
    }
  };

  const hasAvailableSlots = (date) =>
    availableDates.some(d => d.toDateString() === date.toDateString());

  const isSlotPast = (slotDate, slotTime) => {
    const now = new Date();
    const slotDateTime = new Date(slotDate);
    const startTime = slotTime.split(' - ')[0];
    const [hours, minutes] = startTime.split(':').map(Number);
    slotDateTime.setHours(hours, minutes || 0, 0, 0);
    return slotDateTime < new Date(now.getTime() + 60 * 60 * 1000);
  };

  const fetchSlots = async (date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const slotsQuery = query(collection(db, 'slots'), where('date', '==', dateStr));
      const querySnapshot = await getDocs(slotsQuery);
      if (querySnapshot.empty) {
        setSlots([]);
      } else {
        const now = new Date();
        const isToday = dateStr === now.toISOString().split('T')[0];
        const processedSlots = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .map(slot => ({
            ...slot,
            isPast: isToday && isSlotPast(dateStr, slot.time),
            status: isToday && isSlotPast(dateStr, slot.time) ? 'past' : slot.status,
          }))
          .sort((a, b) => a.time.split(' - ')[0].localeCompare(b.time.split(' - ')[0]));
        setSlots(processedSlots);
      }
    } catch (error) {
      console.error('❌ Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array(firstDay.getDay()).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      days.push({
        date: day,
        fullDate: date,
        isPast: date < today,
        hasSlots: hasAvailableSlots(date),
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
      });
    }
    return days;
  };

  const monthHasSlots = (month) =>
    availableDates.some(
      date => date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear()
    );

  const goToPreviousMonth = () => {
    let newMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1);
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    while (newMonth >= currentMonth && !monthHasSlots(newMonth)) {
      newMonth = new Date(newMonth.getFullYear(), newMonth.getMonth() - 1, 1);
    }
    if (newMonth >= currentMonth) setDisplayMonth(newMonth);
  };

  const goToNextMonth = () => {
    let newMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);
    let attempts = 0;
    while (!monthHasSlots(newMonth) && attempts < 12) {
      newMonth = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 1);
      attempts++;
    }
    if (monthHasSlots(newMonth)) setDisplayMonth(newMonth);
  };

  const canGoPrevious = () => {
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return availableDates.some(date => {
      const m = new Date(date.getFullYear(), date.getMonth(), 1);
      return m >= currentMonth && m < displayMonth;
    });
  };

  const canGoNext = () => {
    const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);
    return availableDates.some(date => {
      const m = new Date(date.getFullYear(), date.getMonth(), 1);
      return m >= nextMonth;
    });
  };

  const handleDateClick = (day) => {
    if (!day || day.isPast || !day.hasSlots) return;
    onDateSelect(day.fullDate);
  };

  const calendarDays = generateCalendarDays(displayMonth);

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Select Date
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoPrevious()}
              className={`w-7 h-7 flex items-center justify-center rounded-md border border-border transition-colors ${
                canGoPrevious()
                  ? 'text-foreground hover:bg-secondary/10'
                  : 'text-muted-foreground/30 cursor-not-allowed'
              }`}
            >
              ←
            </button>
            <span className="text-sm font-medium text-foreground">
              {displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext()}
              className={`w-7 h-7 flex items-center justify-center rounded-md border border-border transition-colors ${
                canGoNext()
                  ? 'text-foreground hover:bg-secondary/10'
                  : 'text-muted-foreground/30 cursor-not-allowed'
              }`}
            >
              →
            </button>
          </div>

          {loadingDates ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Loading available dates...</p>
            </div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {calendarDays.map((day, index) => {
                  if (!day) return <div key={`empty-${index}`} className="aspect-square" />;

                  const isDisabled = day.isPast || !day.hasSlots;

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(day)}
                      disabled={isDisabled}
                      className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                        isDisabled
                          ? 'text-muted-foreground/30 cursor-not-allowed'
                          : day.isSelected
                          ? 'bg-primary text-primary-foreground'
                          : day.isToday
                          ? 'border border-primary text-primary hover:bg-primary/10'
                          : 'text-foreground hover:bg-secondary/10 border border-border'
                      }`}
                    >
                      {day.date}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-[10px] text-muted-foreground">
                {availableDates.length > 0
                  ? 'Only dates with available slots are selectable'
                  : 'No slots available. Check back later.'}
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}