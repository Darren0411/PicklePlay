import { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import axios from 'axios';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL;

export default function PaymentModal({
  customerData, selectedSlots, selectedDate,
  totalPrice, onClose, onPaymentSuccess
}) {
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processing, setProcessing] = useState(false);

  const formatDateForDisplay = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentMethod === 'venue') handleVenuePayment();
    else handleOnlinePayment();
  };

  const handleVenuePayment = async () => {
    setProcessing(true);
    try {
      const user = auth.currentUser;
      if (!user) { alert('Please sign in to complete booking'); setProcessing(false); return; }
      const bookingData = {
        userId: user.uid,
        customerName: customerData.name || user.displayName || 'Guest',
        customerEmail: customerData.email || user.email,
        date: selectedDate.toISOString(),
        formattedDate: formatDateForDisplay(selectedDate),
        slots: selectedSlots.map(slot => ({ time: slot.displayTime, price: slot.price, slotId: slot.id })),
        totalAmount: totalPrice,
        paymentStatus: 'pending',
        bookingStatus: 'confirmed',
        paymentMethod: 'venue',
        createdAt: new Date(),
      };
      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      await updateDoc(doc(db, 'bookings', bookingRef.id), { bookingStatus: 'confirmed' });
      await Promise.all(selectedSlots.map(slot => updateDoc(doc(db, 'slots', slot.id), { status: 'booked', bookingId: bookingRef.id })));
      setProcessing(false);
      onPaymentSuccess({
        id: bookingRef.id, userId: user.uid,
        customerName: customerData.name || user.displayName || 'Guest',
        customerEmail: customerData.email || user.email,
        date: selectedDate.toISOString(),
        formattedDate: formatDateForDisplay(selectedDate),
        slots: selectedSlots.map(slot => ({ time: slot.displayTime, price: slot.price })),
        totalAmount: totalPrice, paymentStatus: 'pending',
        bookingStatus: 'confirmed', paymentMethod: 'venue',
      });
    } catch (error) {
      alert('Booking failed: ' + error.message);
      setProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    setProcessing(true);
    try {
      const user = auth.currentUser;
      if (!user) { alert('Please sign in to complete booking'); setProcessing(false); return; }
      const bookingData = {
        userId: user.uid,
        customerName: customerData.name || user.displayName || 'Guest',
        customerEmail: customerData.email || user.email,
        date: selectedDate.toISOString(),
        formattedDate: formatDateForDisplay(selectedDate),
        slots: selectedSlots.map(slot => ({ time: slot.displayTime, price: slot.price, slotId: slot.id })),
        totalAmount: totalPrice, paymentStatus: 'pending',
        bookingStatus: 'pending', paymentMethod: 'online', createdAt: new Date(),
      };
      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
      const orderResponse = await axios.post(`${API_URL}/api/create-order`, {
        amount: totalPrice * 100, currency: 'INR', receipt: bookingRef.id,
        notes: { bookingId: bookingRef.id, customerName: customerData.name || user.displayName || 'Guest', customerEmail: customerData.email || user.email, date: selectedDate.toISOString() },
      });
      const orderData = orderResponse.data;
      if (!orderData.success) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount, currency: orderData.currency,
        name: 'PicklePlay',
        description: `Court Booking — ${formatDateForDisplay(selectedDate)}`,
        image: '/favicon.svg',
        order_id: orderData.orderId,
        prefill: { name: customerData.name || user.displayName || 'Guest', email: customerData.email || user.email, contact: customerData.phone || '9999999999' },
        notes: { bookingId: bookingRef.id },
        theme: { color: 'var(--primary)' },
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(`${API_URL}/api/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (!verifyResponse.data.success) throw new Error('Payment verification failed');
            await updateDoc(doc(db, 'bookings', bookingRef.id), {
              paymentStatus: 'paid', bookingStatus: 'confirmed',
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              paidAt: new Date(), verified: true,
            });
            await Promise.all(selectedSlots.map(slot => updateDoc(doc(db, 'slots', slot.id), { status: 'booked', bookingId: bookingRef.id })));
            setProcessing(false);
            onPaymentSuccess({
              id: bookingRef.id, userId: user.uid,
              customerName: customerData.name || user.displayName || 'Guest',
              customerEmail: customerData.email || user.email,
              date: selectedDate.toISOString(),
              formattedDate: formatDateForDisplay(selectedDate),
              slots: selectedSlots.map(slot => ({ time: slot.displayTime, price: slot.price })),
              totalAmount: totalPrice, paymentStatus: 'paid',
              bookingStatus: 'confirmed', paymentId: response.razorpay_payment_id, paymentMethod: 'online',
            });
          } catch (error) {
            try { await deleteDoc(doc(db, 'bookings', bookingRef.id)); } catch {}
            alert('Payment verification failed. Please contact support with Payment ID: ' + response.razorpay_payment_id);
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: async function () {
            try { await deleteDoc(doc(db, 'bookings', bookingRef.id)); } catch {}
            setProcessing(false);
          },
        },
      };

      if (typeof window.Razorpay === 'undefined') {
        alert('Payment gateway failed to load. Please refresh the page.');
        setProcessing(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async function (response) {
        try { await deleteDoc(doc(db, 'bookings', bookingRef.id)); } catch {}
        alert('Payment failed: ' + response.error.description);
        setProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      alert('Payment failed: ' + error.message);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-sm max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Payment</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Choose your payment method</p>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none disabled:opacity-30"
          >
            ✕
          </button>
        </div>

        {/* Customer info */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          {customerData.photoURL && (
            <img src={customerData.photoURL} alt={customerData.name} className="w-7 h-7 rounded-md border border-border" />
          )}
          <div>
            <p className="text-xs font-medium text-foreground">{customerData.name}</p>
            <p className="text-xs text-muted-foreground">{customerData.email}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Booking summary */}
          <div className="border border-border rounded-md p-4">
            <p className="text-xs font-medium text-foreground mb-3 uppercase tracking-wide">Booking Summary</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Date</span>
              <span className="text-xs font-medium text-foreground">{formatDateForDisplay(selectedDate)}</span>
            </div>
            <div className="space-y-1.5 mb-3">
              {selectedSlots.map((slot, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{slot.displayTime}</span>
                  <span className="text-xs font-medium text-foreground">₹{slot.price}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">₹{totalPrice}</span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Payment Method</p>
            <div className="space-y-2">
              {[
                { value: 'online', label: 'Pay Now', desc: 'UPI, Cards, Net Banking & More' },
                { value: 'venue', label: 'Pay at Venue', desc: 'Pay when you arrive at the court' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentMethod(option.value)}
                  disabled={processing}
                  className={`w-full p-4 rounded-md border transition-colors flex items-center gap-3 text-left disabled:opacity-50 ${
                    paymentMethod === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === option.value ? 'border-primary' : 'border-border'
                  }`}>
                    {paymentMethod === option.value && (
                      <div className="w-2 h-2 rounded-sm bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Online payment info */}
          {paymentMethod === 'online' && (
            <div className="border border-border rounded-md p-4">
              <p className="text-xs font-medium text-foreground mb-2">Accepted Methods</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>UPI — PhonePe, GPay, Paytm, BHIM</li>
                <li>Cards — Visa, Mastercard, Amex, RuPay</li>
                <li>Net Banking — All major banks</li>
                <li>Wallets — Paytm, Mobikwik, etc.</li>
              </ul>
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : paymentMethod === 'online' ? (
              `Pay ₹${totalPrice} →`
            ) : (
              'Confirm Booking →'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}