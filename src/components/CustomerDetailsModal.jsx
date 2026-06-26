import { useState } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import PhoneNumberModal from './PhoneNumberModal';
import { Button } from '@/components/ui/button';

export default function CustomerDetailsModal({ selectedSlots, totalPrice, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setGoogleUser({ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL });
      setLoading(false);
      setShowPhoneModal(true);
    } catch (err) {
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') errorMessage = 'Sign-in cancelled. Please try again.';
      else if (err.code === 'auth/popup-blocked') errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePhoneNumberComplete = (completeUserData) => {
    onSuccess(completeUserData);
  };

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
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Sign In to Continue
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Secure your booking with Google
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Booking summary */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
          </span>
          <span className="text-sm font-semibold text-foreground">₹{totalPrice}</span>
        </div>

        <div className="p-5">
          {/* Steps */}
          <div className="flex items-center gap-2 mb-5">
            {[{ n: '1', label: 'Sign In', active: true }, { n: '2', label: 'Details', active: false }, { n: '3', label: 'Payment', active: false }].map((step, i) => (
              <div key={step.n} className="flex items-center gap-2">
                {i > 0 && <div className="w-6 h-px bg-border" />}
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-semibold ${
                    step.active ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'
                  }`}>
                    {step.n}
                  </div>
                  <span className={`text-xs ${step.active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Info box */}
          <div className="border border-border rounded-md p-4 mb-4">
            <p className="text-xs font-medium text-foreground mb-2">Quick & Easy Booking</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>Sign in with Google</li>
              <li>Enter your details</li>
              <li>Complete payment</li>
              <li>Get instant confirmation</li>
            </ul>
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-background border border-border hover:bg-secondary/10 rounded-md py-3 px-4 text-sm font-medium text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-3 border border-destructive/30 bg-destructive/5 rounded-md p-3">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-4">
            Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}