import { useState } from 'react';
import { initializeSlotsForDate } from '../utils/firestoreHelper';

export default function SlotInitializer() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [completed, setCompleted] = useState(false);

  const initializeAllSlots = async () => {
    setLoading(true);
    setProgress('Starting initialization...');
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate end date: last day of next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    
    let currentDate = new Date(today);
    let totalDays = 0;
    let completedDays = 0;
    
    // Count total days from today to end of next month
    const tempDate = new Date(today);
    while (tempDate <= nextMonth) {
      totalDays++;
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    // Initialize slots for each day
    while (currentDate <= nextMonth) {
      const dateStr = currentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      setProgress(`Initializing ${dateStr}... (${completedDays + 1}/${totalDays})`);
      
      await initializeSlotsForDate(new Date(currentDate));
      
      completedDays++;
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Small delay to avoid overwhelming Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setProgress(`✅ Completed! Initialized ${completedDays} days of slots.`);
    setCompleted(true);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Initialize Booking Slots</h2>
      
      <p className="text-sm text-gray-600 mb-4">
        This will create all time slots from today until the end of next month.
        Each day will have 13 slots (8 AM - 9 PM).
      </p>
      
      <div className="mb-4 p-3 bg-blue-50 rounded text-xs">
        <strong>Current Setup:</strong>
        <ul className="mt-2 space-y-1">
          <li>• Today: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</li>
          <li>• Until: {new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</li>
          <li>• Total Days: ~{Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0) - new Date()) / (1000 * 60 * 60 * 24))}</li>
        </ul>
      </div>
      
      {!completed && (
        <button
          onClick={initializeAllSlots}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-white ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Initializing...' : 'Initialize Slots'}
        </button>
      )}
      
      {progress && (
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          {progress}
        </div>
      )}
      
      {completed && (
        <div className="mt-4 p-3 bg-green-50 rounded text-sm text-green-800">
          🎉 All slots have been initialized! You can now close this and start booking.
        </div>
      )}
    </div>
  );
}