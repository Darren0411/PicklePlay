import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { sendBookingConfirmationEmail } from '../services/emailService';

export default function PaymentModal({ customerData, selectedSlots, totalPrice, onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('venue'); // 'venue' or 'online'
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Get the date from slots (handle different possible structures)
      let bookingDateStr;
      
      if (selectedSlots[0].date) {
        // If slots have date property
        bookingDateStr = selectedSlots[0].date;
      } else if (selectedSlots[0].slotDate) {
        // Alternative property name
        bookingDateStr = selectedSlots[0].slotDate;
      } else {
        // Fallback to today's date
        bookingDateStr = new Date().toISOString().split('T')[0];
        console.warn('⚠️ No date found in slot, using today:', bookingDateStr);
      }

      // Format booking date
      const bookingDate = new Date(bookingDateStr);
      const formattedDate = bookingDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      console.log('📅 Booking date:', bookingDateStr);
      console.log('📅 Formatted date:', formattedDate);
      
      // Add this right before creating bookingData:
console.log('🔍 Selected slots:', selectedSlots);
console.log('🔍 First slot:', selectedSlots[0]);
console.log('🔍 Slot properties:', Object.keys(selectedSlots[0]));

      // Create booking object
      const bookingData = {
        // User info
        userId: customerData.uid,
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerPhoto: customerData.photoURL || null,
        
        // Booking details
        date: bookingDateStr, // ✅ Fixed: Make sure this is not undefined
        formattedDate: formattedDate,
        slots: selectedSlots.map(slot => ({
          time: slot.time || slot.slotTime || 'Not specified',
          price: slot.price || 0,
          slotId: slot.id || slot.slotId || ''
        })),
        totalSlots: selectedSlots.length,
        totalPrice: totalPrice || 0,
        
        // Payment info
        paymentMethod: paymentMethod === 'venue' ? 'Pay at Venue' : 'Online Payment',
        paymentStatus: paymentMethod === 'venue' ? 'pending' : 'completed',
        upiId: paymentMethod === 'online' ? upiId : null,
        
        // Status
        bookingStatus: 'confirmed',
        
        // Timestamps
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('💾 Booking data to save:', bookingData);
      console.log('💾 Saving booking to Firestore...');
      
      // Save booking to Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      const bookingId = bookingRef.id;
      
      console.log('✅ Booking saved with ID:', bookingId);

      // Update user's total bookings count
      const userRef = doc(db, 'users', customerData.uid);
      await updateDoc(userRef, {
        totalBookings: increment(1),
        lastBookingDate: new Date().toISOString()
      });

      console.log('✅ User booking count updated');

      // Update each slot status to 'booked'
      for (const slot of selectedSlots) {
        const slotRef = doc(db, 'slots', slot.id);
        await updateDoc(slotRef, {
          status: 'booked',
          bookedBy: customerData.uid,
          bookingId: bookingId,
          bookedAt: new Date().toISOString()
        });
      }

      console.log('✅ Slot statuses updated');

      // Mock payment processing delay (for better UX)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Prepare success data
      const successData = {
        bookingId: bookingId,
        transactionId: paymentMethod === 'venue' ? `VENUE${Date.now()}` : `TXN${Date.now()}`,
        paymentMethod: bookingData.paymentMethod,
        amount: totalPrice,
        timestamp: new Date(),
        paymentStatus: bookingData.paymentStatus,
        customerName: customerData.name,
        customerEmail: customerData.email,
        formattedDate: formattedDate,
        slots: selectedSlots
      };

      // Send confirmation email
      console.log('📧 Sending confirmation email...');
      const emailResult = await sendBookingConfirmationEmail(successData);
      
      if (emailResult.success) {
        console.log('✅ Confirmation email sent successfully!');
      } else {
        console.warn('⚠️ Email sending failed, but booking was successful');
        // Still proceed even if email fails
      }

      setProcessing(false);
      
      // Call success callback
      onPaymentSuccess(successData);
    } catch (error) {
      console.error('❌ Error confirming booking:', error);
      console.error('❌ Error details:', error.message);
      alert(`Failed to confirm booking: ${error.message}`);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10 transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎾</div>
            <div>
              <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
              <p className="text-green-100 text-sm mt-1">Choose payment method</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-200">
          <div className="flex items-center space-x-3">
            {customerData.photoURL && (
              <img 
                src={customerData.photoURL} 
                alt={customerData.name}
                className="w-12 h-12 rounded-full border-2 border-green-300"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xl">👤</span>
                <span className="font-semibold text-green-900">{customerData.name}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg">📧</span>
                <span className="text-sm text-green-700">{customerData.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center">
              <span className="text-xl mr-2">🏓</span>
              Booking Summary
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 text-sm">
                {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''} Selected
              </span>
              <span className="font-semibold text-gray-800">{selectedSlots.length} × ₹{selectedSlots[0]?.price}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-lg">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-2xl">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Payment Options Form */}
        <form onSubmit={handleConfirmBooking} className="p-6">
          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span className="text-xl mr-2">💰</span>
              Payment Method
            </label>
            <div className="space-y-3">
              {/* Pay at Venue (Default) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('venue')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center transform hover:scale-105 ${
                  paymentMethod === 'venue'
                    ? 'border-green-600 bg-green-50 shadow-lg'
                    : 'border-gray-300 hover:border-green-400 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'venue' ? 'border-green-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'venue' && (
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Pay at Venue</div>
                  <div className="text-xs text-gray-500">Pay when you arrive at the court</div>
                </div>
                <span className="text-3xl">🏢</span>
              </button>

              {/* Pay Now */}
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center transform hover:scale-105 ${
                  paymentMethod === 'online'
                    ? 'border-green-600 bg-green-50 shadow-lg'
                    : 'border-gray-300 hover:border-green-400 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'online' ? 'border-green-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'online' && (
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Pay Now</div>
                  <div className="text-xs text-gray-500">Pay online via UPI, Card, or Net Banking</div>
                </div>
                <span className="text-3xl">💳</span>
              </button>
            </div>
          </div>

          {/* UPI ID Input (if Pay Now selected) */}
          {paymentMethod === 'online' && (
            <div className="mb-6 animate-[slideDown_0.3s_ease-out]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@paytm"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                required={paymentMethod === 'online'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Or you can pay via Card/Net Banking after confirmation
              </p>
            </div>
          )}

          {/* Demo Mode Notice */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-3 mb-6">
            <p className="text-xs text-yellow-800 text-center flex items-center justify-center">
              <span className="mr-2 text-lg">🧪</span>
              <span><strong>Demo Mode:</strong> This is a test booking. Email confirmation will be sent!</span>
            </p>
          </div>

          {/* Confirm Booking Button */}
          <button
            type="submit"
            disabled={processing || (paymentMethod === 'online' && !upiId)}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all text-lg transform ${
              processing || (paymentMethod === 'online' && !upiId)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 text-xl">⏳</span>
                Confirming Booking...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">✓</span>
                Confirm Booking
                <span className="ml-2">→</span>
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-b-2xl border-t border-green-200">
          <p className="text-xs text-green-700 text-center flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Confirmation email will be sent to {customerData.email}
          </p>
        </div>
      </div>
    </div>
  );
}