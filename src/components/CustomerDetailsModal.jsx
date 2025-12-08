import { useState } from 'react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function CustomerDetailsModal({ selectedSlots, totalPrice, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Initialize reCAPTCHA
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA solved');
        }
      });
    }
  };

  // Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!phone.match(/^[6-9]\d{9}$/)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setupRecaptcha();
      const phoneNumber = `+91${phone}`;
      console.log('📱 Attempting to send OTP to:', phoneNumber);
      
      const appVerifier = window.recaptchaVerifier;
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      console.log('✅ OTP sent successfully!', confirmation);
      
      setConfirmationResult(confirmation);
      setStep(2);
      setLoading(false);
    } catch (err) {
      console.error('❌ Full error:', err);
      
      let userFriendlyMessage = 'Failed to send OTP. Please try again.';
      
      // Handle specific error codes
      if (err.code === 'auth/quota-exceeded') {
        userFriendlyMessage = '⚠️ SMS quota exceeded. Please use test number: 9999999999 (OTP: 123456)';
      } else if (err.code === 'auth/too-many-requests') {
        userFriendlyMessage = '⚠️ Too many requests. Please try again in 5 minutes or use test number: 9999999999';
      } else if (err.code === 'auth/invalid-phone-number') {
        userFriendlyMessage = '❌ Invalid phone number format. Use 10 digits starting with 6-9.';
      } else if (err.message.includes('quota')) {
        userFriendlyMessage = '⚠️ SMS limit reached. For testing, use: 9999999999 (OTP: 123456)';
      }
      
      setError(userFriendlyMessage);
      setLoading(false);
      
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmationResult.confirm(otp);
      setLoading(false);
      onSuccess({ name, phone: `+91${phone}` });
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setOtp('');
    setError('');
    setStep(1);
    
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
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
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {step === 1 ? '📝' : '🔐'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {step === 1 ? 'Enter Your Details' : 'Verify OTP'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {step === 1 ? 'We need your details to confirm booking' : 'Enter the OTP sent to your phone'}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏓</span>
              <span className="text-sm text-blue-800 font-medium">
                {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''} Selected
              </span>
            </div>
            <span className="font-bold text-blue-900 text-lg">₹{totalPrice}</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {step === 1 ? (
            // Step 1: Customer Details
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* Test Number Helper */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🧪</span>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1 text-sm">Demo Mode - Use Test Number</h4>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>Phone:</span>
                        <code className="bg-blue-200 px-2 py-1 rounded font-mono font-semibold">9999999999</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>OTP:</span>
                        <code className="bg-blue-200 px-2 py-1 rounded font-mono font-semibold">123456</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3 bg-gray-100 border-2 border-r-0 border-gray-300 rounded-l-lg text-gray-600 font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9999999999"
                    maxLength="10"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <span className="mr-1">📱</span>
                  You'll receive an OTP for verification
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 animate-[shake_0.3s_ease-in-out]">
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠️</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all transform ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Send OTP
                    <span className="ml-2">→</span>
                  </span>
                )}
              </button>

              {/* reCAPTCHA container */}
              <div id="recaptcha-container"></div>
            </form>
          ) : (
            // Step 2: OTP Verification
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* OTP Display Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-center">
                  <span className="text-2xl mr-2">📱</span>
                  <span>
                    <span className="font-semibold">OTP sent to:</span> +91 {phone}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-2 font-semibold"
                >
                  ← Change number
                </button>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  Enter 6-Digit OTP *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength="6"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none text-center text-3xl tracking-[0.5em] font-bold transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 animate-[shake_0.3s_ease-in-out]">
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">⚠️</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-blue-700 hover:text-blue-900 hover:underline font-semibold"
                >
                  Didn't receive OTP? Resend →
                </button>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all transform ${
                  loading || otp.length !== 6
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Verify & Continue
                    <span className="ml-2">✓</span>
                  </span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-b-2xl border-t border-blue-200">
          <p className="text-xs text-blue-700 text-center flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}