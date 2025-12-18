import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (bookingDetails) => {
  try {
    console.log('📧 Sending confirmation email to:', bookingDetails.customerEmail);
    console.log('📧 Booking details:', bookingDetails);

    // Format slot times
    const slotTimes = bookingDetails.slots
      .map(slot => slot.time)
      .join(', ');

    // Prepare email parameters
    const templateParams = {
      customerName: bookingDetails.customerName,
      to_email: bookingDetails.customerEmail,
      bookingId: bookingDetails.bookingId.slice(0, 8).toUpperCase(),
      formattedDate: bookingDetails.formattedDate,
      slotTimes: slotTimes,
      totalPrice: bookingDetails.amount,
      paymentMethod: bookingDetails.paymentMethod
    };

    console.log('📧 Template params:', templateParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Email sent successfully!', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
};