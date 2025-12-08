import { useState } from 'react';

export default function PaymentModal({ customerData, selectedSlots, totalPrice, onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Mock payment processing (3 seconds delay)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate successful payment
    setProcessing(false);
    onPaymentSuccess({
      transactionId: `TXN${Date.now()}`,
      paymentMethod,
      amount: totalPrice,
      timestamp: new Date()
    });
  };

  const taxAmount = Math.round(totalPrice * 0.18); // 18% GST
  const finalAmount = totalPrice + taxAmount;

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
            <div className="text-3xl">💳</div>
            <div>
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <p className="text-blue-100 text-sm mt-1">Secure checkout for your booking</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-xl">👤</span>
              <span className="font-semibold text-blue-900">{customerData.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">📱</span>
              <span className="text-blue-800 font-medium">{customerData.phone}</span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center">
              <span className="text-xl mr-2">🏓</span>
              Price Breakdown
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 text-sm">
                {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''} × ₹{selectedSlots[0]?.price}
              </span>
              <span className="font-semibold text-gray-800">₹{totalPrice}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 text-sm">GST (18%)</span>
              <span className="font-semibold text-gray-800">₹{taxAmount}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg shadow-lg">
              <span className="font-bold text-lg">Total Amount</span>
              <span className="font-bold text-2xl">₹{finalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment} className="p-6">
          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span className="text-xl mr-2">💰</span>
              Select Payment Method
            </label>
            <div className="space-y-3">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center transform hover:scale-105 ${
                  paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'upi' ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'upi' && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">UPI Payment</div>
                  <div className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</div>
                </div>
                <span className="text-3xl">📱</span>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center transform hover:scale-105 ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'card' ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'card' && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Debit/Credit Card</div>
                  <div className="text-xs text-gray-500">Visa, Mastercard, Rupay</div>
                </div>
                <span className="text-3xl">💳</span>
              </button>

              {/* Net Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center transform hover:scale-105 ${
                  paymentMethod === 'netbanking'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-300 hover:border-blue-400 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'netbanking' ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'netbanking' && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Net Banking</div>
                  <div className="text-xs text-gray-500">All major banks</div>
                </div>
                <span className="text-3xl">🏦</span>
              </button>
            </div>
          </div>

          {/* UPI ID Input (if UPI selected) */}
          {paymentMethod === 'upi' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Enter UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@paytm"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                required={paymentMethod === 'upi'}
              />
            </div>
          )}

          {/* Mock Payment Notice */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-3 mb-6">
            <p className="text-xs text-yellow-800 text-center flex items-center justify-center">
              <span className="mr-2 text-lg">🧪</span>
              <span><strong>Demo Mode:</strong> This is a mock payment. No real transaction will occur.</span>
            </p>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={processing || (paymentMethod === 'upi' && !upiId)}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all text-lg transform ${
              processing || (paymentMethod === 'upi' && !upiId)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 text-xl">⏳</span>
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Pay ₹{finalAmount}
                <span className="ml-2">→</span>
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-b-2xl border-t border-blue-200">
          <p className="text-xs text-blue-700 text-center flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Secure payment powered by Firebase
          </p>
        </div>
      </div>
    </div>
  );
}