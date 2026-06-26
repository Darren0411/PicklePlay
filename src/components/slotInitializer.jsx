import { useState } from 'react';
import { initializeSlotsForDate } from '../utils/firestoreHelper';
import { Button } from '@/components/ui/button';

export default function SlotInitializer() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [completed, setCompleted] = useState(false);

  const today = new Date();
  const untilDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const totalDays = Math.ceil((untilDate - today) / (1000 * 60 * 60 * 24));

  const initializeAllSlots = async () => {
    setLoading(true);
    setProgress('Starting initialization...');
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let currentDate = new Date(startDate);
    let completedDays = 0;
    let total = 0;
    const tempDate = new Date(startDate);
    while (tempDate <= untilDate) { total++; tempDate.setDate(tempDate.getDate() + 1); }
    while (currentDate <= untilDate) {
      const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setProgress(`Initializing ${dateStr}... (${completedDays + 1}/${total})`);
      await initializeSlotsForDate(new Date(currentDate));
      completedDays++;
      currentDate.setDate(currentDate.getDate() + 1);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setProgress(`Completed — ${completedDays} days initialized.`);
    setCompleted(true);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 border border-border rounded-lg bg-card p-6">
      <h2 className="text-base font-semibold tracking-tight text-foreground mb-1">
        Initialize Booking Slots
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        Creates all time slots from today until the end of next month.
        Each day will have 13 slots (8 AM – 9 PM).
      </p>

      <div className="border border-border rounded-md p-4 mb-3">
        <p className="text-xs font-medium text-foreground mb-2">Current Setup</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>From</span>
            <span className="font-medium text-foreground">
              {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Until</span>
            <span className="font-medium text-foreground">
              {untilDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Days</span>
            <span className="font-medium text-foreground">~{totalDays}</span>
          </div>
          <div className="flex justify-between">
            <span>Slots per day</span>
            <span className="font-medium text-foreground">13 (8:00 AM – 9:00 PM)</span>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-md p-4 mb-5">
        <p className="text-xs font-medium text-foreground mb-2">Important Notes</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>Past slots are automatically hidden</li>
          <li>1-hour booking buffer applied</li>
          <li>Only future slots are bookable</li>
        </ul>
      </div>

      {!completed && (
        <Button
          onClick={initializeAllSlots}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Initializing...
            </span>
          ) : (
            'Initialize Slots'
          )}
        </Button>
      )}

      {progress && (
        <div className="mt-3 border border-border rounded-md p-3">
          <p className="text-xs text-muted-foreground">{progress}</p>
        </div>
      )}

      {completed && (
        <div className="mt-3 border border-border rounded-md p-4">
          <p className="text-sm font-medium text-foreground mb-1">
            All slots initialized
          </p>
          <p className="text-xs text-muted-foreground">
            You can now close this and start booking. Past slots will be automatically hidden based on current time.
          </p>
        </div>
      )}
    </div>
  );
}