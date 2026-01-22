import { useState, useEffect } from "react";
import { initializeSlotsForDate } from "../utils/firestoreHelper";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { db } from "../firebase";

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [selectedDays, setSelectedDays] = useState(30);
  const [lastSlotDate, setLastSlotDate] = useState(null);
  const [loadingLastDate, setLoadingLastDate] = useState(false);

  // States for bookings
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    todayBookings: 0,
  });
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState(null);

  // States for slot management
  const [selectedSlotDate, setSelectedSlotDate] = useState(new Date());
  const [slotsForDate, setSlotsForDate] = useState([]);
  const [loadingSlotsForDate, setLoadingSlotsForDate] = useState(false);
  const [updatingSlot, setUpdatingSlot] = useState(null);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    const authenticated = sessionStorage.getItem("adminAuthenticated");
    if (authenticated === "true") {
      setIsAuthenticated(true);
      fetchLastSlotDate();
      fetchBookings();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === "manageSlots") {
      fetchSlotsForDate();
    }
  }, [selectedSlotDate, isAuthenticated, activeTab]);

  // Fetch slots with better error handling
  const fetchSlotsForDate = async () => {
    setLoadingSlotsForDate(true);
    try {
      const dateString = selectedSlotDate.toISOString().split('T')[0];
      console.log("🔍 Fetching slots for date:", dateString);

      const slotsQuery = query(
        collection(db, "slots"),
        where("date", "==", dateString)
      );

      const querySnapshot = await getDocs(slotsQuery);
      const slotsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by start time
      slotsData.sort((a, b) => {
        const timeA = a.startTime || a.time || "";
        const timeB = b.startTime || b.time || "";
        return timeA.localeCompare(timeB);
      });

      setSlotsForDate(slotsData);
      console.log(`✅ Fetched ${slotsData.length} slots for ${dateString}`, slotsData);
    } catch (error) {
      console.error("❌ Error fetching slots:", error);
      setSlotsForDate([]);
      alert(`Error fetching slots: ${error.message}`);
    } finally {
      setLoadingSlotsForDate(false);
    }
  };

  // FIXED: Toggle slot availability with real-time Firestore update
  const toggleSlotAvailability = async (slotId, currentStatus) => {
    if (currentStatus === "booked") {
      alert("❌ Cannot modify booked slots!");
      return;
    }

    const newStatus = currentStatus === "available" ? "unavailable" : "available";
    
    if (!window.confirm(`Are you sure you want to mark this slot as ${newStatus}?`)) {
      return;
    }

    setUpdatingSlot(slotId);
    try {
      console.log(`🔄 Updating slot ${slotId} from ${currentStatus} to ${newStatus}`);
      
      // Update in Firestore
      const slotRef = doc(db, "slots", slotId);
      await updateDoc(slotRef, {
        status: newStatus,
      });

      console.log(`✅ Firestore updated successfully for slot ${slotId}`);

      // Update local state immediately for real-time UI update
      setSlotsForDate((prevSlots) =>
        prevSlots.map((slot) =>
          slot.id === slotId ? { ...slot, status: newStatus } : slot
        )
      );

      // Show success message
      const statusEmoji = newStatus === "available" ? "🟢" : "⚫";
      alert(`${statusEmoji} Slot marked as ${newStatus} successfully!`);
      
    } catch (error) {
      console.error("❌ Error updating slot:", error);
      alert(`Failed to update slot status: ${error.message}`);
      
      // Refresh slots to ensure consistency
      await fetchSlotsForDate();
    } finally {
      setUpdatingSlot(null);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const bookingsQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(bookingsQuery);

      const bookingsDataPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();

        let totalAmount = 0;
        if (data.slots && Array.isArray(data.slots)) {
          totalAmount = data.slots.reduce(
            (sum, slot) => sum + (slot.price || 0),
            0
          );
        }

        let createdAtDate = new Date();
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === "function") {
            createdAtDate = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAtDate = data.createdAt;
          } else if (
            typeof data.createdAt === "string" ||
            typeof data.createdAt === "number"
          ) {
            createdAtDate = new Date(data.createdAt);
          }
        }

        let phoneNumber = "N/A";
        if (data.userId) {
          try {
            const userDocRef = doc(db, "users", data.userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              phoneNumber = userDoc.data().phoneNumber || "N/A";
            }
          } catch (error) {
            console.error("Error fetching user phone:", error);
          }
        }

        return {
          id: docSnapshot.id,
          customerName: data.customerName || "N/A",
          customerEmail: data.customerEmail || "N/A",
          customerPhone: phoneNumber,
          date: data.date || "N/A",
          formattedDate: data.formattedDate || "N/A",
          paymentStatus: data.paymentStatus || "pending",
          paymentMethod: data.paymentMethod || "N/A",
          bookingStatus: data.bookingStatus || "pending",
          slots: data.slots || [],
          totalAmount: totalAmount,
          createdAt: createdAtDate,
        };
      });

      const bookingsData = await Promise.all(bookingsDataPromises);

      setBookings(bookingsData);
      calculateStats(bookingsData);
      console.log("✅ Fetched bookings:", bookingsData.length);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const today = new Date().toISOString().split("T")[0];

    const stats = {
      totalBookings: bookingsData.length,
      totalRevenue: bookingsData
        .filter((b) => b.paymentStatus === "paid")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      pendingPayments: bookingsData
        .filter((b) => b.paymentStatus === "pending")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      todayBookings: bookingsData.filter((b) => b.date === today).length,
    };

    setStats(stats);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "confirmed" &&
        (booking.paymentStatus === "paid" ||
          booking.bookingStatus === "confirmed")) ||
      (filterStatus === "pending" && booking.paymentStatus === "pending");

    const matchesSearch =
      searchTerm === "" ||
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone?.includes(searchTerm) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const updatePaymentStatus = async (bookingId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        paymentStatus: newStatus,
        ...(newStatus === "paid" && { bookingStatus: "confirmed" }),
      });

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                paymentStatus: newStatus,
                ...(newStatus === "paid" && { bookingStatus: "confirmed" }),
              }
            : booking
        )
      );

      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              paymentStatus: newStatus,
              ...(newStatus === "paid" && { bookingStatus: "confirmed" }),
            }
          : booking
      );
      calculateStats(updatedBookings);

      setEditingBookingId(null);
      console.log("✅ Payment status updated successfully");
    } catch (error) {
      console.error("❌ Error updating payment status:", error);
      alert("Failed to update payment status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingBookingId(bookingId);
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await deleteDoc(bookingRef);

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== bookingId)
      );

      const updatedBookings = bookings.filter(
        (booking) => booking.id !== bookingId
      );
      calculateStats(updatedBookings);

      console.log("✅ Booking deleted successfully");
      alert("Booking deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  const fetchLastSlotDate = async () => {
    setLoadingLastDate(true);
    try {
      const slotsQuery = query(
        collection(db, "slots"),
        orderBy("date", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(slotsQuery);

      if (!querySnapshot.empty) {
        const lastSlot = querySnapshot.docs[0].data();
        const lastDate = new Date(lastSlot.date);
        setLastSlotDate(lastDate);
      } else {
        setLastSlotDate(null);
      }
    } catch (error) {
      console.error("❌ Error fetching last slot date:", error);
      setLastSlotDate(null);
    } finally {
      setLoadingLastDate(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuthenticated", "true");
      setPassword("");
      fetchLastSlotDate();
      fetchBookings();
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuthenticated");
    setResult(null);
    setProgress("");
    setLastSlotDate(null);
    setBookings([]);
  };

  const generateSlots = async () => {
    setLoading(true);
    setProgress("Starting slot generation...");
    setResult(null);

    try {
      let startDate;

      if (lastSlotDate) {
        startDate = new Date(lastSlotDate);
        startDate.setDate(startDate.getDate() + 1);
      } else {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      }

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + selectedDays - 1);

      let currentDate = new Date(startDate);
      let totalDays = selectedDays;
      let completedDays = 0;
      let newSlotsCreated = 0;
      let existingSlotsSkipped = 0;

      while (currentDate <= endDate) {
        const dateStr = currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        setProgress(
          `Processing ${dateStr}... (${completedDays + 1}/${totalDays})`
        );

        const result = await initializeSlotsForDate(new Date(currentDate));

        if (result.success) {
          newSlotsCreated += result.created || 0;
          existingSlotsSkipped += result.skipped || 0;
        }

        completedDays++;
        currentDate.setDate(currentDate.getDate() + 1);

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await fetchLastSlotDate();

      setResult({
        success: true,
        totalDays: completedDays,
        newSlots: newSlotsCreated,
        skipped: existingSlotsSkipped,
        startDate: startDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        endDate: endDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });

      setProgress("");
    } catch (error) {
      console.error("Error:", error);
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Password Modal
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-[slideUp_0.3s_ease-out]">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <span className="text-5xl">🔐</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-3">
              Admin Access
            </h1>
            <p className="text-gray-600">
              Enter the admin password to continue
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xl"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start animate-shake">
                <span className="text-red-500 mr-3 text-xl">⚠️</span>
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="flex items-center justify-center text-lg">
                <span className="mr-2">🔓</span>
                Access Admin Panel
              </span>
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <p className="text-xs text-yellow-800">
                <strong>Authorized Access Only:</strong> Only administrators
                with the correct password can access this panel.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">🏓</div>
              <div>
                <h1 className="text-3xl font-bold">PicklePlay Admin</h1>
                <p className="text-blue-200 text-sm mt-1">
                  Manage bookings, slots & revenue
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <div className="text-xs text-blue-300">Admin Status</div>
                <div className="font-semibold flex items-center justify-end">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Active
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center shadow-lg"
              >
                <span className="mr-2">🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 flex space-x-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
              activeTab === "bookings"
                ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <span className="mr-2 text-lg">👥</span>
            User Bookings
          </button>
          <button
            onClick={() => setActiveTab("manageSlots")}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
              activeTab === "manageSlots"
                ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <span className="mr-2 text-lg">🎯</span>
            Manage Slots
          </button>
          <button
            onClick={() => setActiveTab("slots")}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${
              activeTab === "slots"
                ? "bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <span className="mr-2 text-lg">📅</span>
            Generate Slots
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">📊</span>
                  <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold">
                    Total
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">
                  {stats.totalBookings}
                </div>
                <div className="text-blue-100 text-sm font-medium">Total Bookings</div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">💰</span>
                  <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold">
                    Paid
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">
                  ₹{stats.totalRevenue}
                </div>
                <div className="text-green-100 text-sm font-medium">Total Revenue</div>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">⏳</span>
                  <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold">
                    Pending
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">
                  ₹{stats.pendingPayments}
                </div>
                <div className="text-orange-100 text-sm font-medium">Pending Payments</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">📅</span>
                  <div className="bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold">
                    Today
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">
                  {stats.todayBookings}
                </div>
                <div className="text-purple-100 text-sm font-medium">Today's Bookings</div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    🔍 Search Bookings
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, phone, or booking ID..."
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                  />
                </div>
                <div className="md:w-64">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    🎯 Filter Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                  >
                    <option value="all">All Bookings</option>
                    <option value="confirmed">Confirmed Only</option>
                    <option value="pending">Pending Only</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchBookings}
                    className="px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-xl font-bold hover:from-blue-800 hover:to-blue-600 transition-all shadow-lg"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-blue-900 flex items-center">
                    <span className="mr-3 text-3xl">📋</span>
                    Booking Details
                  </h2>
                  <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow">
                    Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> bookings
                  </span>
                </div>
              </div>

              {loadingBookings ? (
                <div className="text-center py-16">
                  <div className="animate-spin text-6xl mb-6">🎾</div>
                  <p className="text-gray-600 text-lg font-medium">Loading bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">📭</div>
                  <p className="text-gray-600 text-xl font-bold mb-2">
                    No bookings found
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Bookings will appear here once customers make reservations"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1400px]">
                    <thead className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-[100px]">
                          Booking ID
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-[200px]">
                          Customer
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-[140px]">
                          Contact
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-[220px]">
                          Date & Time Slots
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-[100px]">
                          Amount
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-[120px]">
                          Payment
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-[120px]">
                          Status
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider w-[200px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBookings.map((booking, index) => (
                        <tr
                          key={booking.id}
                          className={`hover:bg-blue-50 transition-colors ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              #{booking.id.slice(0, 8)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 shadow-md flex-shrink-0">
                                <span className="text-white font-bold">
                                  {booking.customerName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-gray-900 truncate">
                                  {booking.customerName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {booking.customerEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                              📱 {booking.customerPhone}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-bold text-gray-900 mb-2">
                              {formatDate(booking.date)}
                            </div>
                            {/* slots with slot number and time */}
                            <div className="space-y-1">
                              {booking.slots?.map((slot, idx) => (
                                <div key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold flex items-center">
                                  <span className="text-blue-600 font-bold mr-1">Slot {idx + 1} Time:</span>
                                  <span>{slot.time || slot.displayTime || `${slot.startTime}-${slot.endTime}`}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-green-600">
                              ₹{booking.totalAmount}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className={`text-xs font-semibold px-2 py-1 rounded inline-block ${
                              booking.paymentMethod === "online"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}>
                              {booking.paymentMethod === "online" ? "💳 Online" : "💵 Venue"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editingBookingId === booking.id ? (
                              <select
                                value={booking.paymentStatus}
                                onChange={(e) => {
                                  if (
                                    window.confirm(
                                      `Change payment status to "${e.target.value}"?`
                                    )
                                  ) {
                                    updatePaymentStatus(booking.id, e.target.value);
                                  }
                                }}
                                disabled={updatingStatus}
                                className="px-3 py-1 text-xs font-bold rounded border-2 border-blue-500 focus:outline-none"
                              >
                                <option value="pending">⏳ Pending</option>
                                <option value="paid">✓ Paid</option>
                              </select>
                            ) : booking.paymentStatus === "paid" ? (
                              <span className="px-3 py-1 text-xs font-bold rounded bg-green-100 text-green-800 inline-block">
                                ✓ Paid
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-bold rounded bg-yellow-100 text-yellow-800 inline-block">
                                ⏳ Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (editingBookingId === booking.id) {
                                    setEditingBookingId(null);
                                  } else {
                                    setEditingBookingId(booking.id);
                                  }
                                }}
                                disabled={updatingStatus || deletingBookingId === booking.id}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                  editingBookingId === booking.id
                                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                } disabled:opacity-50`}
                              >
                                {editingBookingId === booking.id ? "Cancel" : "✏️ Edit"}
                              </button>
                              <button
                                onClick={() => deleteBooking(booking.id)}
                                disabled={deletingBookingId === booking.id || updatingStatus}
                                className="px-3 py-1 rounded text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50"
                              >
                                {deletingBookingId === booking.id ? "..." : "🗑️"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Manage Slots Tab */}
        {activeTab === "manageSlots" && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center mb-6">
                <span className="text-4xl mr-4">🎯</span>
                <div>
                  <h2 className="text-3xl font-bold text-blue-900">
                    Manage Slot Availability
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Mark slots as available or unavailable for bookings
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  📅 Select Date
                </label>
                <input
                  type="date"
                  value={selectedSlotDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedSlotDate(new Date(e.target.value))}
                  className="px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-lg font-semibold"
                />
                <p className="text-sm text-gray-500 mt-3 bg-blue-50 p-3 rounded-lg">
                  Viewing slots for: <strong>{formatDate(selectedSlotDate.toISOString())}</strong>
                </p>
              </div>

              {loadingSlotsForDate ? (
                <div className="text-center py-16">
                  <div className="animate-spin text-6xl mb-6">⏳</div>
                  <p className="text-gray-600 text-lg font-medium">Loading slots...</p>
                </div>
              ) : slotsForDate.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <div className="text-8xl mb-6">📭</div>
                  <p className="text-gray-600 text-xl font-bold mb-2">
                    No slots found for this date
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    The selected date: <strong>{selectedSlotDate.toISOString().split('T')[0]}</strong>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Generate slots first or select a different date
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {slotsForDate.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                        slot.status === 'booked'
                          ? 'bg-red-50 border-red-300'
                          : slot.status === 'unavailable'
                          ? 'bg-gray-100 border-gray-400'
                          : 'bg-green-50 border-green-300'
                      }`}
                    >
                      <div className="flex items-center space-x-6">
                        <div className="text-4xl">
                          {slot.status === 'booked' ? '🔴' : slot.status === 'unavailable' ? '⚫' : '🟢'}
                        </div>
                        <div>
                          <div className="font-bold text-xl text-gray-900 mb-1">
                            {slot.time || slot.displayTime || `${slot.startTime} - ${slot.endTime}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="bg-white px-3 py-1 rounded-lg font-semibold mr-2">₹{slot.price}</span>
                            <span className={`px-3 py-1 rounded-lg font-bold ${
                              slot.status === 'booked'
                                ? 'bg-red-100 text-red-800'
                                : slot.status === 'unavailable'
                                ? 'bg-gray-200 text-gray-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {slot.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSlotAvailability(slot.id, slot.status)}
                        disabled={slot.status === 'booked' || updatingSlot === slot.id}
                        className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                          slot.status === 'booked'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : updatingSlot === slot.id
                            ? 'bg-gray-400 text-white cursor-wait'
                            : slot.status === 'unavailable'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {updatingSlot === slot.id ? (
                          <span className="flex items-center">
                            <span className="animate-spin mr-2">⏳</span>
                            Updating...
                          </span>
                        ) : slot.status === 'booked' ? (
                          '🔒 Booked'
                        ) : slot.status === 'unavailable' ? (
                          '✓ Make Available'
                        ) : (
                          '✕ Make Unavailable'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center text-xl">
                <span className="mr-3 text-2xl">ℹ️</span>
                Important Notes
              </h3>
              <ul className="text-sm text-blue-800 space-y-3">
                <li className="flex items-start">
                  <span className="mr-3 text-lg">🟢</span>
                  <span><strong>Available:</strong> Customers can book this slot</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-lg">⚫</span>
                  <span><strong>Unavailable:</strong> Slot is hidden from booking page</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-lg">🔴</span>
                  <span><strong>Booked:</strong> Cannot be modified (already booked by customer)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-lg">⚠️</span>
                  <span>Use "Make Unavailable" for maintenance, holidays, or private events</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Generate Slots Tab - Keep all existing code */}
        {activeTab === "slots" && (
          <>
            {/* Current Slots Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center mb-6">
                <span className="text-4xl mr-4">📊</span>
                <h2 className="text-3xl font-bold text-blue-900">
                  Current Slots Status
                </h2>
              </div>

              {loadingLastDate ? (
                <div className="flex items-center justify-center py-8">
                  <span className="animate-spin text-4xl mr-3">⏳</span>
                  <span className="text-gray-600 text-lg">Checking existing slots...</span>
                </div>
              ) : lastSlotDate ? (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-6">
                  <div className="flex items-start">
                    <span className="text-5xl mr-4">📅</span>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2 text-xl">
                        Slots Available Until
                      </h3>
                      <p className="text-3xl font-bold text-blue-700 mb-3">
                        {lastSlotDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-blue-600 bg-white px-4 py-2 rounded-lg inline-block">
                        Next generation starts from{" "}
                        <strong>
                          {new Date(lastSlotDate.getTime() + 86400000).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
                  <div className="flex items-start">
                    <span className="text-5xl mr-4">📭</span>
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-2 text-xl">
                        No Existing Slots
                      </h3>
                      <p className="text-sm text-yellow-700">
                        No slots found in the system. Generation will start from today.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Slot Generation Section - Keep all existing code */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">📅</span>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">
                    Generate Booking Slots
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Create slots for the next 30-60 days
                  </p>
                </div>
              </div>

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
                          ? "bg-blue-900 text-white border-blue-900 shadow-lg"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      <div className="text-2xl font-bold">{days}</div>
                      <div className="text-xs mt-1">days</div>
                    </button>
                  ))}
                </div>
              </div>

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
                        <>
                          Start from{" "}
                          <strong>
                            {new Date(
                              lastSlotDate.getTime() + 86400000
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </strong>{" "}
                          (day after last slot)
                        </>
                      ) : (
                        <>
                          Start from <strong>today</strong> (no existing slots)
                        </>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Generate slots for{" "}
                      <strong>next {selectedDays} days</strong>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Each day gets <strong>13 time slots</strong> (8:00 AM - 9:00 PM)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      All slots priced at <strong>₹200 per hour</strong>
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      <strong>Existing slots won't be duplicated</strong>
                    </span>
                  </li>
                </ul>
              </div>

              {!result && (
                <button
                  onClick={generateSlots}
                  disabled={loading}
                  className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105"
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

              {progress && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="animate-spin mr-3 text-2xl">⏳</span>
                    <span className="text-blue-800 font-semibold">
                      {progress}
                    </span>
                  </div>
                </div>
              )}

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
                        <div className="text-sm text-gray-600">
                          Days Processed
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {result.newSlots}
                        </div>
                        <div className="text-sm text-gray-600">
                          New Slots Created
                        </div>
                      </div>
                    </div>

                    {result.skipped > 0 && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="text-sm text-yellow-800">
                          <strong>{result.skipped} slots</strong> already
                          existed and were skipped
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
                          <span className="ml-2 font-semibold text-gray-800">
                            {result.startDate}
                          </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div>
                          <span className="text-gray-500">To:</span>
                          <span className="ml-2 font-semibold text-gray-800">
                            {result.endDate}
                          </span>
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

              {result && !result.success && (
                <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <span className="text-4xl mr-3">❌</span>
                    <div>
                      <h3 className="text-xl font-bold text-red-900 mb-2">
                        Error Generating Slots
                      </h3>
                      <p className="text-red-700 text-sm mb-4">
                        {result.error}
                      </p>
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

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📖</span>
                <h2 className="text-xl font-bold text-blue-900">
                  How It Works
                </h2>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <span className="font-bold text-blue-600 mr-3">1.</span>
                  <span>
                    <strong>Smart Detection:</strong> System automatically finds
                    your last available slot date
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold text-blue-600 mr-3">2.</span>
                  <span>
                    <strong>Continuous Generation:</strong> New slots start from
                    the day after your last slot
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold text-blue-600 mr-3">3.</span>
                  <span>
                    <strong>No Gaps:</strong> Ensures uninterrupted availability
                    for customers
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold text-blue-600 mr-3">4.</span>
                  <span>
                    <strong>Safe Operation:</strong> Existing slots are never
                    duplicated or overwritten
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Pro Tip
                </h4>
                <p className="text-sm text-purple-800">
                  Visit monthly to extend slots. For example: If slots exist
                  until <strong>Jan 21</strong>, generating 30 days will create
                  slots from <strong>Jan 22 to Feb 20</strong>.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}