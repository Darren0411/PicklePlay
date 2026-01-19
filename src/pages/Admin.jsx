import { useState, useEffect } from "react";
import { initializeSlotsForDate } from "../utils/firestoreHelper";
import { collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
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

  // New states for bookings
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

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    const authenticated = sessionStorage.getItem("adminAuthenticated");
    if (authenticated === "true") {
      setIsAuthenticated(true);
      fetchLastSlotDate();
      fetchBookings();
    }
  }, []);

  // Fetch all bookings - FIXED to include phone number from users collection
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

        // Calculate total amount from slots array
        let totalAmount = 0;
        if (data.slots && Array.isArray(data.slots)) {
          totalAmount = data.slots.reduce(
            (sum, slot) => sum + (slot.price || 0),
            0
          );
        }

        // Handle createdAt - it might be a Timestamp, Date, or string
        let createdAtDate = new Date();
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === "function") {
            // Firestore Timestamp
            createdAtDate = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            // Already a Date object
            createdAtDate = data.createdAt;
          } else if (
            typeof data.createdAt === "string" ||
            typeof data.createdAt === "number"
          ) {
            // String or timestamp number
            createdAtDate = new Date(data.createdAt);
          }
        }

        // Fetch phone number from users collection
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
      console.log("✅ Fetched bookings:", bookingsData.length, bookingsData);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Calculate statistics
  const calculateStats = (bookingsData) => {
    const today = new Date().toISOString().split("T")[0];

    const stats = {
      totalBookings: bookingsData.length,
      totalRevenue: bookingsData
        .filter(
          (b) => b.paymentStatus === "paid" || b.bookingStatus === "confirmed"
        )
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      pendingPayments: bookingsData
        .filter((b) => b.paymentStatus === "pending")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      todayBookings: bookingsData.filter((b) => b.date === today).length,
    };

    setStats(stats);
  };

  // Filter bookings
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

  // Update payment status in Firestore
  const updatePaymentStatus = async (bookingId, newStatus) => {
    setUpdatingStatus(true);
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        paymentStatus: newStatus,
        // Optionally update bookingStatus to confirmed when payment is marked as paid
        ...(newStatus === "paid" && { bookingStatus: "confirmed" }),
      });

      // Update local state
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

      // Recalculate stats
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

  // Delete booking from Firestore
  const deleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return;
    }

    setDeletingBookingId(bookingId);
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await deleteDoc(bookingRef);

      // Update local state
      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking.id !== bookingId)
      );

      // Recalculate stats
      const updatedBookings = bookings.filter((booking) => booking.id !== bookingId);
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

  // Fetch the last available slot date
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

  // Format date for display
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

  // Format time for display
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-[slideUp_0.3s_ease-out]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              Admin Access
            </h1>
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
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
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🏓</div>
              <div>
                <h1 className="text-3xl font-bold">PicklePlay Admin</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Manage bookings & court slots
                </p>
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

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === "bookings"
                ? "bg-blue-900 text-white shadow-md"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <span className="mr-2">👥</span>
            User Bookings
          </button>
          <button
            onClick={() => setActiveTab("slots")}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === "slots"
                ? "bg-blue-900 text-white shadow-md"
                : "text-gray-600 hover:bg-blue-50"
            }`}
          >
            <span className="mr-2">📅</span>
            Manage Slots
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📊</span>
                  <div className="bg-white/20 px-2 py-1 rounded text-xs">
                    Total
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {stats.totalBookings}
                </div>
                <div className="text-blue-100 text-sm">Total Bookings</div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💰</span>
                  <div className="bg-white/20 px-2 py-1 rounded text-xs">
                    Paid
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  ₹{stats.totalRevenue}
                </div>
                <div className="text-green-100 text-sm">Total Revenue</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⏳</span>
                  <div className="bg-white/20 px-2 py-1 rounded text-xs">
                    Pending
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  ₹{stats.pendingPayments}
                </div>
                <div className="text-yellow-100 text-sm">Pending Payments</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📅</span>
                  <div className="bg-white/20 px-2 py-1 rounded text-xs">
                    Today
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {stats.todayBookings}
                </div>
                <div className="text-purple-100 text-sm">Today's Bookings</div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Bookings
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, phone, or booking ID..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:w-64">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Booking Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Bookings</option>
                    <option value="confirmed">Confirmed Only</option>
                    <option value="pending">Pending Only</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchBookings}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-blue-900">
                    Booking Details ({filteredBookings.length})
                  </h2>
                  <span className="text-sm text-gray-500">
                    Showing {filteredBookings.length} of {bookings.length}{" "}
                    bookings
                  </span>
                </div>
              </div>

              {loadingBookings ? (
                <div className="text-center py-12">
                  <div className="animate-spin text-4xl mb-4">🎾</div>
                  <p className="text-gray-600">Loading bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600 text-lg font-semibold">
                    No bookings found
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {searchTerm || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "Bookings will appear here once customers make reservations"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Date & Slots
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Payment Status
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Booking Status
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">
                              #{booking.id.slice(0, 8)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-bold">
                                  {booking.customerName
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {booking.customerName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              📱 {booking.customerPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 mb-1">
                              {formatDate(booking.date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {booking.slots?.length || 0} slot(s)
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              ₹{booking.totalAmount}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.paymentMethod === "online"
                                ? "💳 Online"
                                : "💵 Pay at Venue"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editingBookingId === booking.id ? (
                              <select
                                value={booking.paymentStatus}
                                onChange={(e) => {
                                  if (
                                    window.confirm(
                                      `Are you sure you want to change payment status to "${e.target.value}"?`
                                    )
                                  ) {
                                    updatePaymentStatus(booking.id, e.target.value);
                                  }
                                }}
                                disabled={updatingStatus}
                                className="px-3 py-1 text-xs font-semibold rounded-full border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                              </select>
                            ) : booking.paymentStatus === "paid" ? (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                ✓ Paid
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                ⏳ Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {booking.bookingStatus === "confirmed" ? (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                ✓ Confirmed
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
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
                                className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all ${
                                  editingBookingId === booking.id
                                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {updatingStatus && editingBookingId === booking.id
                                  ? "Updating..."
                                  : editingBookingId === booking.id
                                  ? "Cancel"
                                  : "✏️ Edit"}
                              </button>
                              <button
                                onClick={() => deleteBooking(booking.id)}
                                disabled={deletingBookingId === booking.id || updatingStatus}
                                className="px-3 py-2 rounded-lg font-semibold text-xs bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingBookingId === booking.id
                                  ? "Deleting..."
                                  : "🗑️ Delete"}
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

        {/* Slots Tab - keeping existing code */}
        {activeTab === "slots" && (
          <>
            {/* Current Slots Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📊</span>
                <h2 className="text-xl font-bold text-blue-900">
                  Current Slots Status
                </h2>
              </div>

              {loadingLastDate ? (
                <div className="flex items-center justify-center py-4">
                  <span className="animate-spin text-2xl mr-2">⏳</span>
                  <span className="text-gray-600">
                    Checking existing slots...
                  </span>
                </div>
              ) : lastSlotDate ? (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-3xl mr-3">📅</span>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">
                        Slots Available Until
                      </h3>
                      <p className="text-2xl font-bold text-blue-700">
                        {lastSlotDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-blue-600 mt-2">
                        Next generation will start from{" "}
                        <strong>
                          {new Date(
                            lastSlotDate.getTime() + 86400000
                          ).toLocaleDateString("en-US", {
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
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-3xl mr-3">📭</span>
                    <div>
                      <h3 className="font-bold text-yellow-900 mb-1">
                        No Existing Slots
                      </h3>
                      <p className="text-sm text-yellow-700">
                        No slots found in the system. Generation will start from
                        today.
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
                  <h2 className="text-2xl font-bold text-blue-900">
                    Generate Booking Slots
                  </h2>
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
                      Each day gets <strong>13 time slots</strong> (8:00 AM -
                      9:00 PM)
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

              {/* Generate Button */}
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

              {/* Progress */}
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

              {/* Error Result */}
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

            {/* Instructions Card */}
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