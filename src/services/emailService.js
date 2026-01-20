import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendBookingConfirmation = async (bookingDetails) => {
  try {
    let formattedSlots = 'N/A';

    if (Array.isArray(bookingDetails.slots) && bookingDetails.slots.length > 0) {
      formattedSlots = bookingDetails.slots.map(slot => {
        if (slot.time) return `${slot.time} (₹${slot.price})`;
        return `₹${slot.price}`;
      }).join(', ');
    }

    const templateParams = {
      to_email: bookingDetails.email,
      booking_id: bookingDetails.id,
      booking_date: bookingDetails.formattedDate || bookingDetails.date,
      time_slots: formattedSlots,
      total_amount: bookingDetails.totalAmount ?? bookingDetails.amount?.toString(),
      payment_method:
        bookingDetails.paymentMethod === 'online'
          ? 'Online Payment'
          : 'Pay at Venue'
    };

    return await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
};
