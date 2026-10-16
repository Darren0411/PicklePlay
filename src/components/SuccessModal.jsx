import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { sendBookingConfirmation } from '../services/emailService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SuccessModal({ bookingDetails, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('Loading...');
  const [emailStatus, setEmailStatus] = useState('sending');
  const emailSentRef = useRef(false);

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      if (bookingDetails?.userId) {
        try {
          const userDoc = await getDoc(doc(db, 'users', bookingDetails.userId));
          setPhoneNumber(userDoc.exists() ? userDoc.data().phoneNumber || 'Not provided' : 'Not provided');
        } catch {
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
      try {
        await sendBookingConfirmation({
          email: bookingDetails.customerEmail, name: bookingDetails.customerName,
          id: bookingDetails.id, formattedDate: bookingDetails.formattedDate,
          date: bookingDetails.date, amount: bookingDetails.totalAmount,
          paymentMethod: bookingDetails.paymentMethod, slots: bookingDetails.slots,
        });
        setEmailStatus('sent');
      } catch {
        setEmailStatus('error');
      }
    };
    sendEmail();
  }, [bookingDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch { return dateString; }
  };

  const formatPhone = (phone) => {
    if (!phone || phone === 'Loading...' || phone === 'Not provided') return phone;
    const cleaned = phone.replace(/[\s+]/g, '').replace(/^91/, '');
    return cleaned ? `+91 ${cleaned}` : 'Not provided';
  };

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
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-sm max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="px-5 py-5 border-b border-border text-center">
          <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-base font-semibold tracking-tight text-foreground mb-1">
            {paymentStatus === 'paid' ? 'Payment Successful' : 'Booking Confirmed'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {paymentStatus === 'paid'
              ? 'Your payment was processed and booking is confirmed.'
              : 'Your court has been successfully reserved.'}
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Booking ID */}
          <div className="border border-border rounded-md p-4">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Booking ID</p>
            <p className="text-sm font-mono font-medium text-foreground break-all">{bookingId}</p>
          </div>

          {/* Payment ID */}
          {paymentStatus === 'paid' && paymentId && (
            <div className="border border-border rounded-md p-4">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Payment ID</p>
              <p className="text-sm font-mono font-medium text-foreground break-all">{paymentId}</p>
              <p className="text-xs text-muted-foreground mt-1">Payment verified</p>
            </div>
          )}

          {/* Customer details */}
          <div className="border border-border rounded-md p-4">
            <p className="text-xs font-medium text-foreground mb-3 uppercase tracking-wide">Customer Details</p>
            <div className="space-y-2">
              {[
                { label: 'Name', value: customerName },
                { label: 'Email', value: customerEmail },
                { label: 'Phone', value: phoneNumber === 'Loading...' ? '...' : formatPhone(phoneNumber) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-xs text-muted-foreground min-w-[48px]">{label}</span>
                  <span className="text-xs font-medium text-foreground text-right break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking details */}
          <div className="border border-border rounded-md p-4">
            <p className="text-xs font-medium text-foreground mb-3 uppercase tracking-wide">Booking Details</p>
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="text-xs font-medium text-foreground">{formatDate(bookingDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Slots</span>
                <span className="text-xs font-medium text-foreground">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            {slots.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-border">
                {slots.map((slot, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {slot.time || `Slot ${index + 1}`}
                    </span>
                    <span className="text-xs font-medium text-foreground">₹{slot.price || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment summary */}
          <div className="border border-border rounded-md p-4">
            <p className="text-xs font-medium text-foreground mb-3 uppercase tracking-wide">Payment</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Amount</span>
              <span className="text-lg font-semibold text-foreground">₹{totalAmount}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Method</span>
              <span className="text-xs font-medium text-foreground">
                {paymentMethod === 'online' ? 'Online Payment' : 'Pay at Venue'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge variant={paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                {paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </Badge>
            </div>
          </div>

          {/* Email status */}
          <div className="border border-border rounded-md p-3 flex items-center gap-3">
            {emailStatus === 'sending' && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
            {emailStatus === 'sent' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" className="flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
            <div>
              <p className="text-xs font-medium text-foreground">
                {emailStatus === 'sent' ? 'Confirmation Email Sent' : emailStatus === 'error' ? 'Email Delivery Issue' : 'Sending Confirmation...'}
              </p>
              <p className="text-xs text-muted-foreground">
                {emailStatus === 'sent' ? `Sent to ${customerEmail}` : emailStatus === 'error' ? 'Check your inbox or spam folder.' : 'Please wait...'}
              </p>
            </div>
          </div>

          {/* Pending payment note */}
          {paymentStatus !== 'paid' && (
            <div className="border border-border rounded-md p-3">
              <p className="text-xs font-medium text-foreground mb-0.5">Payment Pending</p>
              <p className="text-xs text-muted-foreground">Please pay at the venue after your slot time.</p>
            </div>
          )}

          {/* Important info */}
          <div className="border border-border rounded-md p-3">
            <p className="text-xs font-medium text-foreground mb-2">Important Information</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Please arrive 5 minutes before your slot time.</li>
              {paymentStatus !== 'paid' && <li>Bring cash or GPay for payment at venue.</li>}
              <li>For cancellations, contact us at least 2 hours in advance.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-1">
            <Button onClick={onClose} className="w-full">Done</Button>
            <Button variant="outline" onClick={() => window.print()} className="w-full">
              Print Confirmation
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Need help?{' '}
            <a href="tel:+919096467169" className="font-medium text-primary hover:underline">
              +91 9096467169
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}