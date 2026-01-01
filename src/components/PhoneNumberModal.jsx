import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function PhoneNumberModal({ user, onComplete, onClose }) {
  const [name, setName] = useState(user.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneNumber) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!phoneRegex.test(phoneNumber)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Save user data to Firestore
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        phoneNumber: phoneNumber,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalBookings: 0
      };

      await setDoc(userRef, userData, { merge: true });

      console.log('✅ User data saved:', userData);
      
      // Call completion callback with complete user data
      onComplete({
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        phoneNumber: phoneNumber,
        photoURL: user.photoURL
      });
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      setErrors({ submit: 'Failed to save information. Please try again.' });
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, '');
    // Limit to 10 digits
    return cleaned.slice(0, 10);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📝</div>
            <div>
              <h2 className="text-2xl font-bold">Complete Your Profile</h2>
              <p className="text-green-100 text-sm mt-1">Just a few more details to continue</p>
            </div>
          </div>
        </div>

        {/* User Email Display */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-200">
          <div className="flex items-center space-x-3">
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-green-300"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📧</span>
                <span className="text-sm text-green-700 font-medium">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Name Input */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                👤
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="Enter your full name"
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                  errors.name
                    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200'
                }`}
                required
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold flex items-center">
                📱 <span className="ml-2">+91</span>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(formatPhoneNumber(e.target.value));
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="9876543210"
                className={`w-full pl-20 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                  errors.phone
                    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200'
                }`}
                maxLength={10}
                required
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.phone}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              📌 We'll use this for booking confirmations and updates
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 flex items-center">
                <span className="mr-2">⚠️</span>
                {errors.submit}
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <span className="text-xl">ℹ️</span>
              <div className="flex-1">
                <p className="text-xs text-blue-900 font-semibold mb-1">Why we need this:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Booking confirmation via Email</li>
                  <li>• Quick check-in at the venue</li>
                  <li>• Emergency updates about your booking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !name.trim() || !phoneNumber}
            className={`w-full py-4 rounded-lg font-bold text-white transition-all text-lg transform ${
              loading || !name.trim() || !phoneNumber
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2 text-xl">⏳</span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">✓</span>
                Continue to Payment
                <span className="ml-2">→</span>
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-b-2xl border-t border-green-200">
          <p className="text-xs text-green-700 text-center flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Your information is secure and will never be shared
          </p>
        </div>
      </div>
    </div>
  );
}