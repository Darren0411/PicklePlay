import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { sendBookingConfirmation } from '../services/emailService';

export default function SuccessModal({ bookingDetails, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('Loading...');
  const [emailStatus, setEmailStatus] = useState('sending');
  const emailSentRef = useRef(false);
  
  console.log('📋 Booking Details received:', bookingDetails);

  // Fetch phone number from users collection
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      if (bookingDetails?.userId) {
        try {
          const userDocRef = doc(db, 'users', bookingDetails.userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPhoneNumber(userData.phoneNumber || 'Not provided');
            console.log('✅ Phone number fetched:', userData.phoneNumber);
          } else {
            setPhoneNumber('Not provided');
          }
        } catch (error) {
          console.error('❌ Error fetching phone number:', error);
          setPhoneNumber('Not provided');
        }
      } else {
        setPhoneNumber('Not provided');
      }
    };

    fetchPhoneNumber();
  }, [bookingDetails?.userId]);
useEffect(() => {
  const sendEmail = async () => {
    if (!bookingDetails || emailSentRef.current) return;

    emailSentRef.current = true;

    const emailData = {
     email: bookingDetails.customerEmail,
      name: bookingDetails.customerName,
      id: bookingDetails.id,
      formattedDate: bookingDetails.formattedDate,
      date: bookingDetails.date,
      amount: bookingDetails.totalAmount,
      paymentMethod: bookingDetails.paymentMethod,
      slots: bookingDetails.slots
    };

    try {
      console.log('📧 Sending confirmation email:', emailData);
      await sendBookingConfirmation(emailData);
      console.log('✅ Email sent successfully');
      setEmailStatus('sent');
    } catch (error) {
      console.error('❌ Failed to send email:', error);
    }
  };

  sendEmail();
}, [bookingDetails]);


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPhone = (phone) => {
    if (!phone || phone === 'Loading...' || phone === 'Not provided') return phone;
    const cleaned = phone.replace(/[\s+]/g, '').replace(/^91/, '');
    return cleaned ? `+91 ${cleaned}` : 'Not provided';
  };


  // Safely extract data
  const bookingId = bookingDetails?.id || 'N/A';
  const customerName = bookingDetails?.customerName || 'Guest';
  const customerEmail = bookingDetails?.customerEmail || 'N/A';
  const bookingDate = bookingDetails?.date || bookingDetails?.formattedDate;
  const slots = Array.isArray(bookingDetails?.slots) ? bookingDetails.slots : [];
  const totalAmount = bookingDetails?.totalAmount || 0;
  const paymentStatus = bookingDetails?.paymentStatus || 'pending';
  const paymentMethod = bookingDetails?.paymentMethod || 'venue';
  const paymentId = bookingDetails?.paymentId;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-t-2xl text-center">
          <div className="mb-4 animate-bounce">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-5xl text-green-600">✓</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {paymentStatus === 'paid' ? 'Payment Successful!' : 'Booking Confirmed!'}
          </h2>
          <p className="text-green-100 text-sm">
            {paymentStatus === 'paid' 
              ? 'Your payment was successful and booking is confirmed' 
              : 'Your court has been successfully reserved'}
          </p>
        </div>

        <div className="p-6">
          {/* Booking ID */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-xs text-blue-700 font-semibold mb-1">BOOKING ID</div>
            <div className="text-lg font-bold text-blue-900 font-mono break-all">
              {bookingId}
            </div>
          </div>

          {/* Payment ID (if paid online) */}
          {paymentStatus === 'paid' && paymentId && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <div className="text-xs text-green-700 font-semibold mb-1">PAYMENT ID</div>
              <div className="text-sm font-bold text-green-900 font-mono break-all">
                {paymentId}
              </div>
              <div className="text-xs text-green-600 mt-1">✓ Payment verified</div>
            </div>
          )}

          {/* Customer Info */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="text-lg mr-2">👤</span>
              Customer Details
            </h3>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-gray-500 text-sm w-24 flex-shrink-0">Name:</span>
                <span className="text-gray-800 text-sm font-semibold flex-1">
                  {customerName}
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 text-sm w-24 flex-shrink-0">Email:</span>
                <span className="text-gray-800 text-sm flex-1 break-all">
                  {customerEmail}
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 text-sm w-24 flex-shrink-0">Phone:</span>
                <span className="text-gray-800 text-sm font-semibold flex-1">
                  {phoneNumber === 'Loading...' ? (
                    <span className="text-gray-400 italic">Loading...</span>
                  ) : (
                    formatPhone(phoneNumber)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="text-lg mr-2">📅</span>
              Booking Details
            </h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700">Date:</span>
                <span className="text-sm font-bold text-green-900">
                  {formatDate(bookingDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Slots:</span>
                <span className="text-sm font-bold text-green-900">
                  {slots.length} slot{slots.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Time Slots */}
          {slots.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <span className="text-lg mr-2">🎾</span>
                Booked Time Slots
              </h3>
              <div className="space-y-2">
                {slots.map((slot, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 bg-white border-2 border-gray-200 rounded-lg"
                  >
                    <span className="text-sm font-semibold text-gray-700">
                      {slot.time || `Slot ${index + 1}`}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      ₹{slot.price || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-sm opacity-90 mb-1">Total Amount</div>
                <div className="text-3xl font-bold">₹{totalAmount}</div>
              </div>
              <div className="text-5xl opacity-20">
                {paymentStatus === 'paid' ? '✓' : '💳'}
              </div>
            </div>
            <div className="border-t border-green-400 mt-3 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">Payment Method:</span>
                <span className="font-semibold">
                  {paymentMethod === 'online' ? '💳 Online Payment' : '🏢 Pay at Venue'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="opacity-90">Status:</span>
                <span className={`font-semibold px-2 py-1 rounded ${
                  paymentStatus === 'paid' 
                    ? 'bg-white text-green-600' 
                    : 'bg-green-700 text-white'
                }`}>
                  {paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Email Status */}
          <div className={`border-2 rounded-lg p-4 mb-4 ${
            emailStatus === 'sent' 
              ? 'bg-green-50 border-green-200'
              : emailStatus === 'error'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {emailStatus === 'sent' ? '✅' : emailStatus === 'error' ? '⚠️' : '📧'}
              </span>
              <div>
                <div className={`text-sm font-bold ${
                  emailStatus === 'sent' 
                    ? 'text-green-900' 
                    : emailStatus === 'error'
                    ? 'text-yellow-900'
                    : 'text-blue-900'
                }`}>
                  {emailStatus === 'sent' 
                    ? 'Confirmation Email Sent' 
                    : emailStatus === 'error'
                    ? 'Email Delivery Issue'
                    : 'Sending Confirmation...'}
                </div>
                <div className={`text-xs ${
                  emailStatus === 'sent' 
                    ? 'text-green-700' 
                    : emailStatus === 'error'
                    ? 'text-yellow-700'
                    : 'text-blue-700'
                }`}>
                  {emailStatus === 'sent'
                    ? `Confirmation sent to ${customerEmail}`
                    : emailStatus === 'error'
                    ? 'Booking confirmed but email failed. Check your inbox or spam folder.'
                    : 'Please wait...'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Message */}
          {paymentStatus !== 'paid' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">ℹ️</span>
                <div>
                  <div className="text-sm font-bold text-yellow-900">
                    Payment Pending
                  </div>
                  <div className="text-xs text-yellow-700">
                    Please pay at the venue after your slot time
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Important Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center">
              <span className="mr-2">ℹ️</span>
              Important Information
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Please arrive 5 minutes before your slot time</li>
              {paymentStatus !== 'paid' && (
                <li>• Bring cash or Gpay for payment at venue</li>
              )}
              <li>• For cancellations, contact us at least 2 hours in advance</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Done ✓
            </button>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-white border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 rounded-lg font-semibold transition-all"
            >
              🖨️ Print Confirmation
            </button>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">Need help?</p>
            <a 
              href="tel:+919096467169" 
              className="text-sm text-green-600 hover:text-green-700 font-semibold"
            >
              📞 Contact: +91 9096467169
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}