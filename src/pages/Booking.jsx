import { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import CustomerDetailsModal from "../components/CustomerDetailsModal";
import PaymentModal from "../components/PaymentModal";
import SuccessModal from "../components/SuccessModal";
import { getSlotsForDate } from "../utils/firestoreHelper";
import BookingHeader from "@/components/booking/BookingHeader";
import DateSelector from "@/components/booking/DateSelector";
import SlotList from "@/components/booking/SlotList";
import SlotLegend from "@/components/booking/SlotLegend";
import BookingBottomBar from "@/components/booking/BookingBottomBar";

const formatTime = (hour) => {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

const isSlotPast = (slotDate, slotHour) => {
  const now = new Date();
  const slotDateTime = new Date(slotDate);
  slotDateTime.setHours(slotHour, 0, 0, 0);
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  return slotDateTime < oneHourFromNow;
};

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

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  const availableDates = generateAvailableDates();

  useEffect(() => {
    loadSlotsForDate(selectedDate);
  }, [selectedDate]);

  const loadSlotsForDate = async (date) => {
    setLoading(true);
    setSelectedSlots([]);
    const result = await getSlotsForDate(date);
    if (result.success) {
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const formattedSlots = result.slots.map((slot) => {
        const isPast = isToday && isSlotPast(date, slot.hour);
        const startTime = formatTime(slot.hour);
        const endTime = formatTime(slot.hour + 1);
        let effectiveStatus = slot.status;
        if (isPast) effectiveStatus = "past";
        return {
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          displayTime: `${startTime} - ${endTime}`,
          price: slot.price,
          available: effectiveStatus === "available",
          status: effectiveStatus,
          originalStatus: slot.status,
          isPast,
          hour: slot.hour,
          bookingId: slot.bookingId,
        };
      });
      formattedSlots.sort((a, b) => a.hour - b.hour);
      setTimeSlots(formattedSlots);
    } else {
      setTimeSlots([]);
    }
    setLoading(false);
  };

  const toggleSlotSelection = (slot) => {
    if (!slot.available || slot.isPast || slot.status !== "available") return;
    if (selectedSlots.find((s) => s.id === slot.id)) {
      setSelectedSlots(selectedSlots.filter((s) => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleProceedClick = () => {
    if (selectedSlots.length === 0) return;
    setShowCustomerModal(true);
  };

  const handleCustomerDetailsSuccess = (data) => {
    setCustomerData(data);
    setShowCustomerModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (bookingDetails) => {
    setShowPaymentModal(false);
    setBookingResult(bookingDetails);
    setShowSuccessModal(true);
    setSelectedSlots([]);
    loadSlotsForDate(selectedDate);
    setPaymentLoading(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setBookingResult(null);
    setCustomerData(null);
  };

  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <BookingHeader />
      <DateSelector
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availableDates={availableDates}
        onOpenCalendar={() => setShowDatePicker(true)}
      />

      <div className="container mx-auto px-4 pt-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm bg-primary" />
            <span className="text-xs text-muted-foreground">
              Available Slots ({timeSlots.filter((s) => s.status === "available").length})
            </span>
          </div>
          <span className="text-xs text-muted-foreground">₹200 per hour</span>
        </div>
      </div>

      {paymentLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-foreground mb-1">Processing Payment</h3>
            <p className="text-xs text-muted-foreground">Please don't close this window</p>
          </div>
        </div>
      )}

      <SlotList
        timeSlots={timeSlots}
        selectedSlots={selectedSlots}
        toggleSlotSelection={toggleSlotSelection}
        loading={loading}
      />

      {!loading && timeSlots.length > 0 && <SlotLegend />}

      <BookingBottomBar
        selectedSlots={selectedSlots}
        totalPrice={totalPrice}
        onProceed={handleProceedClick}
        loading={loading || paymentLoading}
      />

      {showCustomerModal && (
        <CustomerDetailsModal
          selectedSlots={selectedSlots}
          totalPrice={totalPrice}
          onClose={() => setShowCustomerModal(false)}
          onSuccess={handleCustomerDetailsSuccess}
        />
      )}
      {showPaymentModal && customerData && (
        <PaymentModal
          customerData={customerData}
          selectedSlots={selectedSlots}
          selectedDate={selectedDate}
          totalPrice={totalPrice}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      {showSuccessModal && bookingResult && (
        <SuccessModal
          bookingDetails={bookingResult}
          onClose={handleSuccessClose}
        />
      )}
      {showDatePicker && (
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            setSelectedDate(date);
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}