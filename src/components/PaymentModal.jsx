import { useState } from 'react';

export default function PaymentModal({ customerData, selectedSlots, totalPrice, onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('venue'); // 'venue' or 'online'
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Mock payment processing (2 seconds delay)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful booking
    setProcessing(false);
    onPaymentSuccess({
      transactionId: paymentMethod === 'venue' ? `VENUE${Date.now()}` : `TXN${Date.now()}`,
      paymentMethod: paymentMethod === 'venue' ? 'Pay at Venue' : 'Online Payment',
      amount: totalPrice,
      timestamp: new Date(),
      paymentStatus: paymentMethod === 'venue' ? 'pending' : 'completed'
    });
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
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎾</div>
            <div>
              <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
              <p className="text-blue-100 text-sm mt-1">Choose payment method and confirm</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl">👤</span>
              <span className="text-sm text-gray-600">Name:</span>
              <span className="font-semibold text-blue-900">{customerData.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">📱</span>
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="font-medium text-blue-800">{customerData.phone}</span>
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
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg shadow-lg">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-2xl">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Payment Options Form */}
        <form onSubmit={handleConfirmBooking} className="p-6">
          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
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
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'venue' ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'venue' && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Pay at Venue</div>
                  {/* <div className="text-xs text-gray-500">Pay when you arrive at the court</div> */}
                </div>
                <span className="text-3xl">🏢</span>
              </button>

              {/* Pay Now */}
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center transform hover:scale-105 ${
                  paymentMethod === 'online'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'online' ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'online' && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
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
              <span><strong>Demo Mode:</strong> This is a test booking. No real transaction will occur.</span>
            </p>
          </div>

          {/* Confirm Booking Button */}
          <button
            type="submit"
            disabled={processing || (paymentMethod === 'online' && !upiId)}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all text-lg transform ${
              processing || (paymentMethod === 'online' && !upiId)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 shadow-lg hover:shadow-xl hover:scale-105'
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-b-2xl border-t border-blue-200">
          <p className="text-xs text-blue-700 text-center flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Your booking is secure and will be confirmed instantly
          </p>
        </div>
      </div>
    </div>
  );
}