import React from 'react';

export default function SuccessModal({ bookingDetails, onClose }) {

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
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  const formatTime = (time) => {
    return time || 'N/A';
  };

  // Safely extract data with multiple fallback options
  const bookingId = bookingDetails?.bookingId || bookingDetails?.id || 'N/A';
  const customerName = bookingDetails?.customerName || bookingDetails?.name || 'Guest';
  const customerEmail = bookingDetails?.customerEmail || bookingDetails?.email || 'N/A';
  
  // Try multiple date field names
  const bookingDate = bookingDetails?.date || 
                       bookingDetails?.ookingDate || 
                       bookingDetails?.formattedDate || 
                       bookingDetails?.selectedDate;
  
  // Safely get slots
  const slots = Array.isArray(bookingDetails?.slots) ? bookingDetails.slots : [];
  
  // Calculate total amount - try multiple approaches
  let totalAmount = 0;
  if (bookingDetails?.totalAmount) {
    totalAmount = bookingDetails.totalAmount;
  } else if (slots.length > 0) {
    totalAmount = slots.reduce((sum, slot) => sum + (Number(slot.price) || 0), 0);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-[slideUp_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
        {/* Success Animation Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-t-2xl text-center">
          <div className="mb-4 animate-bounce">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-5xl text-green-600">✓</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-green-100 text-sm">
            Your court has been successfully reserved
          </p>
        </div>

        {/* Booking Details */}
        <div className="p-6">
          {/* Booking ID */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-xs text-blue-700 font-semibold mb-1">BOOKING ID</div>
            <div className="text-lg font-bold text-blue-900 font-mono break-all">
              {bookingId}
            </div>
          </div>

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
            </div>
          </div>

          {/* Date & Time */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
              <span className="text-lg mr-2">📅</span>
              Booking Details
            </h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 mb-3">
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

          {/* Selected Slots */}
          {slots.length > 0 ? (
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
                      {slot.time || slot.startTime || `Slot ${index + 1}`}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      ₹{slot.price || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">No slot details available</p>
            </div>
          )}

          {/* Total Amount */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm opacity-90 mb-1">
                  Total Amount {bookingDetails?.paymentStatus === 'paid' ? 'Paid' : ''}
                </div>
                <div className="text-3xl font-bold">₹{totalAmount}</div>
              </div>
              <div className="text-5xl opacity-20">💳</div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">✓</span>
                <div>
                  <div className="text-sm font-bold text-green-900">
                    {bookingDetails?.paymentStatus === 'paid' ? 'Payment Successful' : 'Booking Confirmed'}
                  </div>
                  <div className="text-xs text-green-700">
                    {customerEmail !== 'N/A' ? `Confirmation sent to ${customerEmail}` : 'Booking confirmed successfully'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-bold text-yellow-900 mb-2 flex items-center">
              <span className="mr-2">ℹ️</span>
              Important Information
            </h4>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• Please arrive 5 minutes before your slot time</li>
              <li>• For cancellations, contact us atleast 2 hours in advance</li>
              <li>• Contact: +91 9096467169</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <span className="flex items-center justify-center">
                Done
                <span className="ml-2">✓</span>
              </span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-white border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 rounded-lg font-semibold transition-all"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🖨️</span>
                Print Confirmation
              </span>
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">Need help with your booking?</p>
            <a 
              href="tel:+919096467169" 
              className="text-sm text-green-600 hover:text-green-700 font-semibold"
            >
              📞 Contact Support: +91 9096467169
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}