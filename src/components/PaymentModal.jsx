import { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export default function PaymentModal({ 
  customerData, 
  selectedSlots, 
  selectedDate,
  totalPrice, 
  onClose, 
  onPaymentSuccess 
}) {
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);

  const formatDateForDisplay = (date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'venue') {
      handleVenuePayment();
    } else {
      handleOnlinePayment();
    }
  };

  const handleVenuePayment = async () => {
    setProcessing(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('⚠️ Please sign in to complete booking');
        setProcessing(false);
        return;
      }

      const bookingData = {
        userId: user.uid,
        customerName: customerData.name || user.displayName || 'Guest',
        customerEmail: customerData.email || user.email,
        date: selectedDate.toISOString(),
        formattedDate: formatDateForDisplay(selectedDate),
        slots: selectedSlots.map(slot => ({
          time: slot.displayTime,
          price: slot.price,
          slotId: slot.id
        })),
        totalAmount: totalPrice,
        paymentStatus: 'pending',
        bookingStatus: 'confirmed',
        paymentMethod: 'venue',
        createdAt: new Date(),
      };

      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      console.log('✅ Booking created for venue payment:', bookingRef.id);

      await updateDoc(doc(db, 'bookings', bookingRef.id), {
        bookingStatus: 'confirmed',
      });

      await Promise.all(
        selectedSlots.map(slot =>
          updateDoc(doc(db, 'slots', slot.id), { 
            status: 'booked',
            bookingId: bookingRef.id
          })
        )
      );

      setProcessing(false);

      onPaymentSuccess({
        id: bookingRef.id,
        userId: user.uid,
        customerName: customerData.name || user.displayName || 'Guest',
        customerEmail: customerData.email || user.email,
        date: selectedDate.toISOString(),
        formattedDate: formatDateForDisplay(selectedDate),
        slots: selectedSlots.map(slot => ({
          time: slot.displayTime,
          price: slot.price,
        })),
        totalAmount: totalPrice,
        paymentStatus: 'pending',
        bookingStatus: 'confirmed',
        paymentMethod: 'venue',
      });

    } catch (error) {
      console.error('❌ Venue booking error:', error);
      alert('❌ Booking failed: ' + error.message);
      setProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    setProcessing(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('⚠️ Please sign in to complete booking');
        setProcessing(false);
        return;
      }

      const totalAmount = totalPrice;

      const bookingData = {
        userId: user.uid,
        customerName: customerData.name || user.displayName || 'Guest',
        customerEmail: customerData.email || user.email,
        date: selectedDate.toISOString(),
        formattedDate: formatDateForDisplay(selectedDate),
        slots: selectedSlots.map(slot => ({
          time: slot.displayTime,
          price: slot.price,
          slotId: slot.id
        })),
        totalAmount: totalAmount,
        paymentStatus: 'pending',
        bookingStatus: 'pending',
        paymentMethod: 'online',
        createdAt: new Date(),
      };

      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      console.log('✅ Booking created for online payment:', bookingRef.id);

      // ✅ SIMPLIFIED: Remove config - show ALL payment methods (includes UPI)
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'PicklePlay',
        description: `Court Booking - ${formatDateForDisplay(selectedDate)}`,
        image: '/favicon.svg',
        
        prefill: {
          name: customerData.name || user.displayName || 'Guest',
          email: customerData.email || user.email,
          contact: customerData.phone || '9999999999',
        },
        notes: {
          bookingId: bookingRef.id,
          date: selectedDate.toISOString(),
          slots: selectedSlots.length,
        },
        theme: {
          color: '#16a34a',
        },
        
        // ✅ REMOVED config - now it will show all payment methods including UPI
        
        handler: async function (response) {
          console.log('✅ Payment successful:', response);
          
          try {
            await updateDoc(doc(db, 'bookings', bookingRef.id), {
              paymentStatus: 'paid',
              bookingStatus: 'confirmed',
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id || '',
              razorpaySignature: response.razorpay_signature || '',
              paidAt: new Date(),
            });

            await Promise.all(
              selectedSlots.map(slot =>
                updateDoc(doc(db, 'slots', slot.id), { 
                  status: 'booked',
                  bookingId: bookingRef.id
                })
              )
            );

            console.log('✅ Booking confirmed and slots updated');
            setProcessing(false);

            onPaymentSuccess({
              id: bookingRef.id,
              userId: user.uid,
              customerName: customerData.name || user.displayName || 'Guest',
              customerEmail: customerData.email || user.email,
              date: selectedDate.toISOString(),
              formattedDate: formatDateForDisplay(selectedDate),
              slots: selectedSlots.map(slot => ({
                time: slot.displayTime,
                price: slot.price,
              })),
              totalAmount: totalAmount,
              paymentStatus: 'paid',
              bookingStatus: 'confirmed',
              paymentId: response.razorpay_payment_id,
              paymentMethod: 'online',
            });

          } catch (error) {
            console.error('❌ Error updating booking:', error);
            alert('Payment successful but booking update failed. Contact support with Payment ID: ' + response.razorpay_payment_id);
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: async function () {
            console.log('❌ Payment cancelled by user');
            
            try {
              await deleteDoc(doc(db, 'bookings', bookingRef.id));
              console.log('🗑️ Deleted pending booking');
            } catch (error) {
              console.error('Error deleting booking:', error);
            }
            
            setProcessing(false);
            alert('❌ Payment was cancelled. Please try again.');
          },
        },
      };

      if (typeof window.Razorpay === 'undefined') {
        alert('❌ Payment gateway failed to load. Please refresh the page.');
        setProcessing(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('❌ Payment error:', error);
      alert('❌ Payment failed: ' + error.message);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
        <button
          onClick={onClose}
          disabled={processing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10 transition-colors disabled:opacity-50"
        >
          ✕
        </button>

        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">💳</div>
            <div>
              <h2 className="text-2xl font-bold">Payment</h2>
              <p className="text-green-100 text-sm mt-1">Choose your payment method</p>
            </div>
          </div>
        </div>

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

        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center">
              <span className="text-xl mr-2">🎾</span>
              Booking Summary
            </h3>
          </div>
          
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Date:</span>
              <span className="text-sm font-bold text-blue-900">
                {formatDateForDisplay(selectedDate)}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {selectedSlots.map((slot, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 text-sm font-medium">
                  Time: {slot.displayTime}
                </span>
                <span className="font-semibold text-gray-800">₹{slot.price}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg shadow-lg">
            <span className="font-bold text-lg">Total Amount</span>
            <span className="font-bold text-2xl">₹{totalPrice}</span>
          </div>
        </div>

        <form onSubmit={handlePayment} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span className="text-xl mr-2">💰</span>
              Payment Method
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                disabled={processing}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  <div className="font-semibold text-gray-800">Pay Now (Recommended)</div>
                  <div className="text-xs text-gray-500">UPI, Cards, Net Banking & More</div>
                </div>
                <span className="text-3xl">💳</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('venue')}
                disabled={processing}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
            </div>
          </div>

          {paymentMethod === 'online' && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg animate-[slideDown_0.3s_ease-out]">
              <div className="flex items-start space-x-2">
                <span className="text-xl">ℹ️</span>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Secure Online Payment</p>
                  <ul className="text-xs space-y-1 text-blue-700">
                    <li>• <strong>UPI:</strong> PhonePe, GPay, Paytm, BHIM</li>
                    <li>• <strong>Cards:</strong> Visa, Mastercard, Amex, RuPay</li>
                    <li>• <strong>Net Banking:</strong> All major banks</li>
                    <li>• <strong>Wallets:</strong> Paytm, Mobikwik, etc.</li>
                    <li>• Instant booking confirmation</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={processing}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all text-lg transform ${
              processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 text-xl">⏳</span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {paymentMethod === 'online' ? (
                  <>
                    <span className="mr-2">💳</span>
                    Pay ₹{totalPrice}
                    <span className="ml-2">→</span>
                  </>
                ) : (
                  <>
                    <span className="mr-2">✓</span>
                    Confirm Booking
                    <span className="ml-2">→</span>
                  </>
                )}
              </span>
            )}
          </button>
        </form>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-b-2xl border-t border-green-200">
          <p className="text-xs text-green-700 text-center flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}