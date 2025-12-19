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
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="text-2xl mr-2">⚙️</span>
        Initialize Booking Slots
      </h2>
      
      <p className="text-sm text-gray-600 mb-4">
        This will create all time slots from today until the end of next month.
        Each day will have 13 slots (8 AM - 9 PM).
      </p>
      
      <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-xs">
        <strong className="text-blue-900 block mb-2">📊 Current Setup:</strong>
        <ul className="space-y-1 text-blue-800">
          <li>• <strong>Today:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</li>
          <li>• <strong>Until:</strong> {new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</li>
          <li>• <strong>Total Days:</strong> ~{Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0) - new Date()) / (1000 * 60 * 60 * 24))}</li>
          <li>• <strong>Slots per day:</strong> 13 (8:00 AM - 9:00 PM)</li>
        </ul>
      </div>

      <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-xs">
        <strong className="text-yellow-900 block mb-2">⚠️ Important Notes:</strong>
        <ul className="space-y-1 text-yellow-800">
          <li>• Past slots are automatically hidden</li>
          <li>• 1-hour booking buffer applied</li>
          <li>• Only future slots are bookable</li>
        </ul>
      </div>
      
      {!completed && (
        <button
          onClick={initializeAllSlots}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⏳</span>
              Initializing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <span className="mr-2">🚀</span>
              Initialize Slots
            </span>
          )}
        </button>
      )}
      
      {progress && (
        <div className={`mt-4 p-3 rounded text-sm ${
          completed 
            ? 'bg-green-50 text-green-800 border-2 border-green-200' 
            : 'bg-blue-50 text-blue-800 border-2 border-blue-200'
        }`}>
          {progress}
        </div>
      )}
      
      {completed && (
        <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-semibold flex items-center">
            <span className="text-2xl mr-2">🎉</span>
            All slots have been initialized!
          </p>
          <p className="text-xs text-green-700 mt-2">
            You can now close this and start booking. Past slots will be automatically hidden based on current time.
          </p>
        </div>
      )}
    </div>
  );
}