import { useState } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import PhoneNumberModal from './PhoneNumberModal';

export default function CustomerDetailsModal({ selectedSlots, totalPrice, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('✅ Google Sign-In successful:', user.displayName);

      // Store Google user data temporarily
      setGoogleUser({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });

      setLoading(false);
      
      // Show phone number modal
      setShowPhoneModal(true);
    } catch (err) {
      console.error('❌ Google Sign-In error:', err);
      
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up blocked! Please allow pop-ups and try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Handle completion of phone number modal
  const handlePhoneNumberComplete = (completeUserData) => {
    console.log('✅ User profile completed:', completeUserData);
    
    // Pass complete user data to parent (BookingCalendar)
    onSuccess(completeUserData);
  };

  // Show phone modal after Google sign-in
  if (showPhoneModal && googleUser) {
    return (
      <PhoneNumberModal
        user={googleUser}
        onComplete={handlePhoneNumberComplete}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative animate-[slideUp_0.3s_ease-out]">
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
            <div className="text-3xl">🔐</div>
            <div>
              <h2 className="text-2xl font-bold">Sign In to Continue</h2>
              <p className="text-green-100 text-sm mt-1">Secure your booking with Google</p>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎾</span>
              <span className="text-sm text-green-800 font-medium">
                {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''} Selected
              </span>
            </div>
            <span className="font-bold text-green-900 text-lg">₹{totalPrice}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Steps Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <span className="ml-2 text-sm font-semibold text-green-600">Sign In</span>
              </div>
              <div className="w-12 h-1 bg-gray-300 rounded"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <span className="ml-2 text-sm text-gray-500">Details</span>
              </div>
              <div className="w-12 h-1 bg-gray-300 rounded"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="ml-2 text-sm text-gray-500">Payment</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Quick & Easy Booking</p>
                <ul className="space-y-1 text-xs">
                  <li>✅ Sign in with Google</li>
                  <li>✅ Enter your details</li>
                  <li>✅ Complete payment</li>
                  <li>✅ Get instant confirmation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 rounded-lg py-4 px-4 font-semibold text-gray-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {loading ? (
              <>
                <span className="animate-spin text-xl">⏳</span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-3 animate-[shake_0.3s_ease-in-out]">
              <p className="text-sm text-red-600 flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <span className="mr-1">🔒</span>
              Your information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}