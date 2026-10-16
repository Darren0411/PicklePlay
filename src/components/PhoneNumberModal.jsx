import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PhoneNumberModal({ user, onComplete, onClose }) {
  const [name, setName] = useState(user.displayName || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Please enter your name";
    else if (name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters";
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneNumber) newErrors.phone = "Please enter your phone number";
    else if (!phoneRegex.test(phoneNumber))
      newErrors.phone = "Please enter a valid 10-digit number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userData = {
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        phoneNumber,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalBookings: 0,
      };
      await setDoc(userRef, userData, { merge: true });
      onComplete({
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        phoneNumber,
        photoURL: user.photoURL,
      });
    } catch (error) {
      setErrors({ submit: "Failed to save information. Please try again." });
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => value.replace(/\D/g, "").slice(0, 10);

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Complete Your Profile
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              A few more details to continue
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Google account info */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-md border border-border"
            />
          )}
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="Enter your full name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Phone Number <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 border border-border rounded-md bg-secondary/10 text-xs text-muted-foreground font-medium">
                +91
              </div>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(formatPhoneNumber(e.target.value));
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                maxLength={10}
                className={errors.phone ? "border-destructive" : ""}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive mt-1">{errors.phone}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Used for booking confirmations and updates.
            </p>
          </div>

          {/* Why we need this */}
          <div className="border border-border rounded-md p-3">
            <p className="text-xs font-medium text-foreground mb-1.5">
              Why we need this
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Booking confirmation via email</li>
              <li>Quick check-in at the venue</li>
              <li>Emergency updates about your booking</li>
            </ul>
          </div>

          {errors.submit && (
            <div className="border border-destructive/30 bg-destructive/5 rounded-md p-3">
              <p className="text-xs text-destructive">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !name.trim() || !phoneNumber}
            className="w-full"
          >
            {loading ? "Saving..." : "Continue to Payment →"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Your information is secure and will never be shared.
          </p>
        </form>
      </div>
    </div>
  );
}
