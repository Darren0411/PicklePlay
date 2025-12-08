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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">💳 Payment</h2>
          <p className="text-orange-100 text-sm mt-1">Complete your booking payment</p>
        </div>

        {/* Customer Info */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold text-gray-800">{customerData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold text-gray-800">{customerData.phone}</span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="p-6 border-b">
          <h3 className="font-bold text-gray-800 mb-3">Price Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{selectedSlots.length} Slot(s) × ₹{selectedSlots[0]?.price}</span>
              <span className="font-semibold">₹{totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-semibold">₹{taxAmount}</span>
            </div>
            <div className="border-t-2 pt-2 flex justify-between text-lg">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="font-bold text-green-600">₹{finalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePayment} className="p-6">
          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-2">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
                  paymentMethod === 'upi'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-300 hover:border-orange-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'upi' ? 'border-orange-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'upi' && (
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">UPI Payment</div>
                  <div className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</div>
                </div>
                <span className="text-2xl">📱</span>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
                  paymentMethod === 'card'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-300 hover:border-orange-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'card' ? 'border-orange-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'card' && (
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Debit/Credit Card</div>
                  <div className="text-xs text-gray-500">Visa, Mastercard, Rupay</div>
                </div>
                <span className="text-2xl">💳</span>
              </button>

              {/* Net Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
                  paymentMethod === 'netbanking'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-300 hover:border-orange-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  paymentMethod === 'netbanking' ? 'border-orange-600' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'netbanking' && (
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Net Banking</div>
                  <div className="text-xs text-gray-500">All major banks</div>
                </div>
                <span className="text-2xl">🏦</span>
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                required={paymentMethod === 'upi'}
              />
            </div>
          )}

          {/* Mock Payment Notice */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-yellow-800 text-center">
              🧪 <strong>Demo Mode:</strong> This is a mock payment. No real transaction will occur.
            </p>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={processing || (paymentMethod === 'upi' && !upiId)}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all text-lg ${
              processing || (paymentMethod === 'upi' && !upiId)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Processing Payment...
              </span>
            ) : (
              `Pay ₹${finalAmount}`
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-2xl border-t">
          <p className="text-xs text-gray-500 text-center">
            🔒 Secure payment powered by Firebase
          </p>
        </div>
      </div>
    </div>
  );
}