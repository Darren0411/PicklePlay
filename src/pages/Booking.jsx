import React, { useState, useRef, useEffect } from 'react';
import Calendar from '../components/Calendar';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import PaymentModal from '../components/PaymentModal';
import { getSlotsForDate } from '../utils/firestoreHelper';

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateScrollRef = useRef(null);
  const dateRefs = useRef({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  // Generate dates for current and next month only
  const generateAvailableDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    
    const dates = [];
    const currentDate = new Date(today);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // Fetch slots from Firestore when date changes
  useEffect(() => {
    loadSlotsForDate(selectedDate);
  }, [selectedDate]);

  const loadSlotsForDate = async (date) => {
    setLoading(true);
    setSelectedSlots([]); // Clear selected slots when date changes
    
    const result = await getSlotsForDate(date);
    
    if (result.success) {
      // Transform Firestore data to match UI format
      const formattedSlots = result.slots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        displayTime: `${formatTime(slot.hour)} - ${formatTime(slot.hour + 1)}`,
        price: slot.price,
        available: slot.status === 'available',
        hour: slot.hour,
        bookingId: slot.bookingId
      }));
      
      // Sort by hour (8 AM to 9 PM)
      formattedSlots.sort((a, b) => a.hour - b.hour);
      
      setTimeSlots(formattedSlots);
    } else {
      console.error('Error loading slots:', result.error);
      setTimeSlots([]);
    }
    
    setLoading(false);
  };

  const formatTime = (hour) => {
    if (hour === 12) return '12:00';
    if (hour > 12) return `${hour - 12}:00`;
    return `${hour}:00`;
  };

  const availableDates = generateAvailableDates();

  const toggleSlotSelection = (slot) => {
    if (!slot.available) return;

    if (selectedSlots.find(s => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    
    setTimeout(() => {
      scrollToDate(date);
    }, 100);
  };

  const scrollToDate = (date) => {
    const dateKey = date.toDateString();
    const element = dateRefs.current[dateKey];
    
    if (element && dateScrollRef.current) {
      const container = dateScrollRef.current;
      const elementLeft = element.offsetLeft;
      const containerWidth = container.offsetWidth;
      const elementWidth = element.offsetWidth;
      
      container.scrollTo({
        left: elementLeft - (containerWidth / 2) + (elementWidth / 2),
        behavior: 'smooth'
      });
    }
  };

  // Handle proceed click
  const handleProceedClick = () => {
    setShowCustomerModal(true);
  };

  // Handle OTP verification success
  const handleCustomerDetailsSuccess = (data) => {
    setCustomerData(data);
    setShowCustomerModal(false);
    setShowPaymentModal(true);
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    setShowPaymentModal(false);
    
    // TODO: Save booking to Firestore
    // Show success message
    alert(`🎉 Booking Confirmed!\n\nTransaction ID: ${paymentData.transactionId}\nAmount Paid: ₹${paymentData.amount}\n\nThank you, ${customerData.name}!`);
    
    // Reset state
    setSelectedSlots([]);
    setCustomerData(null);
    loadSlotsForDate(selectedDate); // Reload slots
  };

  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={() => window.history.back()}
              className="text-xl mr-3"
            >
              ←
            </button>
            <h1 className="text-lg font-bold text-gray-800">PicklePlay Court</h1>
          </div>
        </div>
      </div>

      {/* Date Selector - Horizontal Scroll */}
      <div className="bg-white border-b sticky top-[56px] z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => setShowDatePicker(true)}
              className="flex items-center text-gray-800 hover:text-blue-600 transition-colors"
            >
              <span className="text-lg mr-2">📅</span>
              <span className="text-sm font-semibold">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </button>
          </div>

          {/* Horizontal Date Scroll */}
          <div 
            ref={dateScrollRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {availableDates.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              const dateKey = date.toDateString();
              
              return (
                <button
                  key={index}
                  ref={(el) => (dateRefs.current[dateKey] = el)}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-[10px] font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xl font-bold mt-1">
                    {date.getDate().toString().padStart(2, '0')}
                  </div>
                  {isToday && (
                    <div className="text-[8px] mt-1 font-semibold">
                      Today
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Available Slots Info */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            <span>Available Slots ({timeSlots.filter(s => s.available).length})</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span className="mr-1">ℹ️</span>
            <span>₹200 per hour</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600">Loading slots...</span>
          </div>
        </div>
      )}

      {/* No Slots Available */}
      {!loading && timeSlots.length === 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
            <span className="text-4xl mb-2 block">📅</span>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Slots Available</h3>
            <p className="text-sm text-gray-600">
              Slots for this date haven't been created yet. Please try another date.
            </p>
          </div>
        </div>
      )}

      {/* Time Slots Grid */}
      {!loading && timeSlots.length > 0 && (
        <div className="container mx-auto px-4">
          <div className="space-y-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlots.find(s => s.id === slot.id);
              
              return (
                <button
                  key={slot.id}
                  onClick={() => toggleSlotSelection(slot)}
                  disabled={!slot.available}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    !slot.available
                      ? 'bg-gray-100 border-2 border-gray-300 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-green-50 border-2 border-green-600'
                      : 'bg-white border-2 border-gray-200 hover:border-green-400'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-left">
                      <div className="text-base font-semibold text-gray-800">
                        {slot.displayTime}
                      </div>
                      <div className="text-xs text-gray-500">
                        1 hour slot
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-bold text-gray-800">
                        ₹{slot.price}
                      </div>
                    </div>
                    
                    {slot.available ? (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                        isSelected
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <span className="text-white text-lg">✓</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-red-100 border-2 border-red-400">
                        <span className="text-red-600 text-base">✕</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Fixed Bar - Proceed Button */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600">
                  {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''} Selected
                </div>
                <div className="text-xl font-bold text-gray-800">
                  ₹{totalPrice.toLocaleString()}
                  <span className="text-xs text-gray-500 ml-1">+ taxes</span>
                </div>
              </div>
              <button 
                onClick={handleProceedClick}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-orange-700 transition-all shadow-lg"
              >
                PROCEED →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && (
        <CustomerDetailsModal
          selectedSlots={selectedSlots}
          totalPrice={totalPrice}
          onClose={() => setShowCustomerModal(false)}
          onSuccess={handleCustomerDetailsSuccess}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && customerData && (
        <PaymentModal
          customerData={customerData}
          selectedSlots={selectedSlots}
          totalPrice={totalPrice}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}