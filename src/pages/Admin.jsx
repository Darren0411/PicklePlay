import { useState, useEffect } from 'react';
import { initializeSlotsForDate } from '../utils/firestoreHelper';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(30);
  const [lastSlotDate, setLastSlotDate] = useState(null);
  const [loadingLastDate, setLoadingLastDate] = useState(false);

   const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

   useEffect(() => {
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      fetchLastSlotDate();
    }
  }, []);

  // Fetch the last available slot date
  const fetchLastSlotDate = async () => {
    setLoadingLastDate(true);
    try {
      const slotsQuery = query(
        collection(db, 'slots'),
        orderBy('date', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(slotsQuery);
      
      if (!querySnapshot.empty) {
        const lastSlot = querySnapshot.docs[0].data();
        const lastDate = new Date(lastSlot.date);
        setLastSlotDate(lastDate);
        console.log('✅ Last slot date:', lastDate.toLocaleDateString());
      } else {
        setLastSlotDate(null);
        console.log('📭 No existing slots found');
      }
    } catch (error) {
      console.error('❌ Error fetching last slot date:', error);
      setLastSlotDate(null);
    } finally {
      setLoadingLastDate(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      setPassword('');
      fetchLastSlotDate();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    setResult(null);
    setProgress('');
    setLastSlotDate(null);
  };

  const generateSlots = async () => {
    setLoading(true);
    setProgress('Starting slot generation...');
    setResult(null);
    
    try {
      // Determine start date
      let startDate;
      
      if (lastSlotDate) {
        // Start from day after last slot
        startDate = new Date(lastSlotDate);
        startDate.setDate(startDate.getDate() + 1);
        console.log('📅 Starting from day after last slot:', startDate.toLocaleDateString());
      } else {
        // No existing slots, start from today
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        console.log('📅 No existing slots, starting from today:', startDate.toLocaleDateString());
      }
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + selectedDays - 1);
      
      let currentDate = new Date(startDate);
      let totalDays = selectedDays;
      let completedDays = 0;
      let newSlotsCreated = 0;
      let existingSlotsSkipped = 0;
      
      // Generate slots for each day
      while (currentDate <= endDate) {
        const dateStr = currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        
        setProgress(`Processing ${dateStr}... (${completedDays + 1}/${totalDays})`);
        
        const result = await initializeSlotsForDate(new Date(currentDate));
        
        if (result.success) {
          newSlotsCreated += result.created || 0;
          existingSlotsSkipped += result.skipped || 0;
        }
        
        completedDays++;
        currentDate.setDate(currentDate.getDate() + 1);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Update last slot date after generation
      await fetchLastSlotDate();
      
      setResult({
        success: true,
        totalDays: completedDays,
        newSlots: newSlotsCreated,
        skipped: existingSlotsSkipped,
        startDate: startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        endDate: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
      
      setProgress('');
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Password Modal (same as before)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-[slideUp_0.3s_ease-out]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Access</h1>
            <p className="text-gray-600 text-sm">
              Enter the admin password to continue
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start animate-shake">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔓</span>
                Access Admin Panel
              </span>
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <p className="text-xs text-yellow-800">
                <strong>Authorized Access Only:</strong> Only administrators with the correct password can access this panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">⚙️</div>
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-green-100 text-sm mt-1">Manage court booking slots</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm opacity-90">Status</div>
                <div className="font-semibold flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                  Authenticated
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Current Slots Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📊</span>
            <h2 className="text-xl font-bold text-gray-800">Current Slots Status</h2>
          </div>

          {loadingLastDate ? (
            <div className="flex items-center justify-center py-4">
              <span className="animate-spin text-2xl mr-2">⏳</span>
              <span className="text-gray-600">Checking existing slots...</span>
            </div>
          ) : lastSlotDate ? (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-3xl mr-3">📅</span>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Slots Available Until</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {lastSlotDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    Next generation will start from <strong>{new Date(lastSlotDate.getTime() + 86400000).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-3xl mr-3">📭</span>
                <div>
                  <h3 className="font-bold text-yellow-900 mb-1">No Existing Slots</h3>
                  <p className="text-sm text-yellow-700">
                    No slots found in the system. Generation will start from today.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slot Generation Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center mb-6">
            <span className="text-3xl mr-3">📅</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Generate Booking Slots</h2>
              <p className="text-sm text-gray-600 mt-1">
                Create slots for the next 30-60 days
              </p>
            </div>
          </div>

          {/* Days Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Duration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[30, 45, 60].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                    selectedDays === days
                      ? 'bg-green-600 text-white border-green-700 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                  }`}
                >
                  <div className="text-2xl font-bold">{days}</div>
                  <div className="text-xs mt-1">days</div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">ℹ️</span>
              What will happen:
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  {lastSlotDate ? (
                    <>Start from <strong>{new Date(lastSlotDate.getTime() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong> (day after last slot)</>
                  ) : (
                    <>Start from <strong>today</strong> (no existing slots)</>
                  )}
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Generate slots for <strong>next {selectedDays} days</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Each day gets <strong>13 time slots</strong> (8:00 AM - 9:00 PM)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>All slots priced at <strong>₹200 per hour</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Existing slots won't be duplicated</strong></span>
              </li>
            </ul>
          </div>

          {/* Generate Button */}
          {!result && (
            <button
              onClick={generateSlots}
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-3 text-2xl">⏳</span>
                  Generating Slots...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="mr-3 text-2xl">🚀</span>
                  Generate {selectedDays} Days of Slots
                </span>
              )}
            </button>
          )}

          {/* Progress */}
          {progress && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center">
                <span className="animate-spin mr-3 text-2xl">⏳</span>
                <span className="text-blue-800 font-semibold">{progress}</span>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="mt-4 space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-start mb-4">
                  <span className="text-5xl mr-4">✅</span>
                  <div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">
                      Slots Generated Successfully!
                    </h3>
                    <p className="text-green-700">
                      Your booking slots are ready for customers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {result.totalDays}
                    </div>
                    <div className="text-sm text-gray-600">Days Processed</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {result.newSlots}
                    </div>
                    <div className="text-sm text-gray-600">New Slots Created</div>
                  </div>
                </div>

                {result.skipped > 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-yellow-800">
                      <strong>{result.skipped} slots</strong> already existed and were skipped
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg p-4 border-2 border-green-200 mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Date Range:</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-500">From:</span>
                      <span className="ml-2 font-semibold text-gray-800">{result.startDate}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div>
                      <span className="text-gray-500">To:</span>
                      <span className="ml-2 font-semibold text-gray-800">{result.endDate}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                >
                  Generate More Slots
                </button>
              </div>
            </div>
          )}

          {/* Error Result */}
          {result && !result.success && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <span className="text-4xl mr-3">❌</span>
                <div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">
                    Error Generating Slots
                  </h3>
                  <p className="text-red-700 text-sm mb-4">{result.error}</p>
                  <button
                    onClick={() => setResult(null)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">📖</span>
            <h2 className="text-xl font-bold text-gray-800">How It Works</h2>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="font-bold text-green-600 mr-3">1.</span>
              <span>
                <strong>Smart Detection:</strong> System automatically finds your last available slot date
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-green-600 mr-3">2.</span>
              <span>
                <strong>Continuous Generation:</strong> New slots start from the day after your last slot
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-green-600 mr-3">3.</span>
              <span>
                <strong>No Gaps:</strong> Ensures uninterrupted availability for customers
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-green-600 mr-3">4.</span>
              <span>
                <strong>Safe Operation:</strong> Existing slots are never duplicated or overwritten
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
            <h4 className="font-bold text-purple-900 mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Pro Tip
            </h4>
            <p className="text-sm text-purple-800">
              Visit monthly to extend slots. For example: If slots exist until <strong>Jan 21</strong>, generating 30 days will create slots from <strong>Jan 22 to Feb 20</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}