import { useState, useEffect } from "react";
import { initializeSlotsForDate } from "../utils/firestoreHelper";
import {
  collection, query, orderBy, limit, getDocs,
  doc, getDoc, updateDoc, deleteDoc, where,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTabs from "@/components/admin/AdminTabs";
import StatsGrid from "@/components/admin/StatsGrid";
import BookingsFilter from "@/components/admin/BookingsFilter";
import BookingsTable from "@/components/admin/BookingsTable";
import ManageSlots from "@/components/admin/ManageSlots";
import GenerateSlots from "@/components/admin/GenerateSlots";

const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateString = (dateStr) => {
  if (!dateStr || dateStr === "N/A") return null;
  if (typeof dateStr === "string" && dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState("bookings");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [lastSlotDate, setLastSlotDate] = useState(null);
  const [loadingLastDate, setLoadingLastDate] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, pendingPayments: 0, todayBookings: 0 });
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
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
    if (isAuthenticated && activeTab === "manageSlots") fetchSlotsForDate();
  }, [selectedSlotDate, isAuthenticated, activeTab]);

  const handleLogin = (pwd) => {
    setAuthError("");
    if (pwd === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuthenticated", "true");
      fetchLastSlotDate();
      fetchBookings();
    } else {
      setAuthError("Incorrect password. Please try again.");
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

  const fetchSlotsForDate = async () => {
    setLoadingSlotsForDate(true);
    try {
      const dateString = formatDateString(selectedSlotDate);
      const slotsQuery = query(collection(db, "slots"), where("date", "==", dateString));
      const querySnapshot = await getDocs(slotsQuery);
      const slotsData = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const hourA = a.hour || parseInt(a.startTime?.split(":")[0]) || 0;
          const hourB = b.hour || parseInt(b.startTime?.split(":")[0]) || 0;
          return hourA - hourB;
        });
      setSlotsForDate(slotsData);
    } catch (error) {
      setSlotsForDate([]);
    } finally {
      setLoadingSlotsForDate(false);
    }
  };

  const toggleSlotAvailability = async (slotId, currentStatus) => {
    if (currentStatus === "booked") return;
    const newStatus = currentStatus === "available" ? "unavailable" : "available";
    if (!window.confirm(`Mark this slot as ${newStatus}?`)) return;
    setUpdatingSlot(slotId);
    try {
      await updateDoc(doc(db, "slots", slotId), { status: newStatus });
      setSlotsForDate((prev) => prev.map((s) => s.id === slotId ? { ...s, status: newStatus } : s));
    } catch (error) {
      await fetchSlotsForDate();
    } finally {
      setUpdatingSlot(null);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const querySnapshot = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc")));
      const bookingsDataPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        let totalAmount = (data.slots || []).reduce((sum, slot) => sum + (slot.price || 0), 0);
        let createdAtDate = new Date();
        if (data.createdAt) {
          createdAtDate = typeof data.createdAt.toDate === "function"
            ? data.createdAt.toDate()
            : new Date(data.createdAt);
        }
        let phoneNumber = "N/A";
        if (data.userId) {
          try {
            const userDoc = await getDoc(doc(db, "users", data.userId));
            if (userDoc.exists()) phoneNumber = userDoc.data().phoneNumber || "N/A";
          } catch {}
        }
        const processedSlots = (data.slots || []).map((slot) => ({
          ...slot,
          timeDisplay: slot.time || slot.displayTime || (slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : slot.hour !== undefined ? `${String(slot.hour).padStart(2,"0")}:00 - ${String(slot.hour+1).padStart(2,"0")}:00` : "Not specified"),
          price: slot.price || 0,
        }));
        return {
          id: docSnapshot.id,
          customerName: data.customerName || "N/A",
          customerEmail: data.customerEmail || "N/A",
          customerPhone: phoneNumber,
          date: data.date || "N/A",
          paymentStatus: data.paymentStatus || "pending",
          paymentMethod: data.paymentMethod || "N/A",
          bookingStatus: data.bookingStatus || "pending",
          slots: processedSlots,
          totalAmount,
          createdAt: createdAtDate,
        };
      });
      const bookingsData = await Promise.all(bookingsDataPromises);
      setBookings(bookingsData);
      calculateStats(bookingsData);
    } catch (error) {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const today = formatDateString(new Date());
    setStats({
      totalBookings: bookingsData.length,
      totalRevenue: bookingsData.filter((b) => b.paymentStatus === "paid").reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      pendingPayments: bookingsData.filter((b) => b.paymentStatus === "pending").reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      todayBookings: bookingsData.filter((b) => b.date === today).length,
    });
  };

  const updatePaymentStatus = async (bookingId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        paymentStatus: newStatus,
        ...(newStatus === "paid" && { bookingStatus: "confirmed" }),
      });
      const updated = bookings.map((b) => b.id === bookingId ? { ...b, paymentStatus: newStatus, ...(newStatus === "paid" && { bookingStatus: "confirmed" }) } : b);
      setBookings(updated);
      calculateStats(updated);
      setEditingBookingId(null);
    } catch {
      alert("Failed to update payment status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm("Delete this booking? This cannot be undone.")) return;
    setDeletingBookingId(bookingId);
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      const updated = bookings.filter((b) => b.id !== bookingId);
      setBookings(updated);
      calculateStats(updated);
    } catch {
      alert("Failed to delete booking.");
    } finally {
      setDeletingBookingId(null);
    }
  };

  const fetchLastSlotDate = async () => {
    setLoadingLastDate(true);
    try {
      const querySnapshot = await getDocs(query(collection(db, "slots"), orderBy("date", "desc"), limit(1)));
      if (!querySnapshot.empty) {
        const lastSlot = querySnapshot.docs[0].data();
        const [year, month, day] = lastSlot.date.split("-").map(Number);
        setLastSlotDate(new Date(year, month - 1, day));
      } else {
        setLastSlotDate(null);
      }
    } catch {
      setLastSlotDate(null);
    } finally {
      setLoadingLastDate(false);
    }
  };

  const generateSlots = async () => {
    setLoading(true);
    setProgress("Starting slot generation...");
    setResult(null);
    try {
      let startDate = lastSlotDate ? new Date(lastSlotDate) : new Date();
      if (lastSlotDate) startDate.setDate(startDate.getDate() + 1);
      else startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + selectedDays - 1);
      let currentDate = new Date(startDate);
      let completedDays = 0, newSlotsCreated = 0, existingSlotsSkipped = 0;
      while (currentDate <= endDate) {
        setProgress(`Processing ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}... (${completedDays + 1}/${selectedDays})`);
        const r = await initializeSlotsForDate(new Date(currentDate));
        if (r.success) { newSlotsCreated += r.created || 0; existingSlotsSkipped += r.skipped || 0; }
        completedDays++;
        currentDate.setDate(currentDate.getDate() + 1);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      await fetchLastSlotDate();
      setResult({
        success: true, totalDays: completedDays, newSlots: newSlotsCreated, skipped: existingSlotsSkipped,
        startDate: startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        endDate: endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      });
      setProgress("");
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filterStatus === "all"
      || (filterStatus === "confirmed" && (booking.paymentStatus === "paid" || booking.bookingStatus === "confirmed"))
      || (filterStatus === "pending" && booking.paymentStatus === "pending");
    const matchesSearch = searchTerm === ""
      || booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      || booking.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      || booking.customerPhone?.includes(searchTerm)
      || booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onSignOut={handleSignOut} />
      <div className="max-w-[1600px] mx-auto p-6">
        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "bookings" && (
          <>
            <StatsGrid stats={stats} />
            <BookingsFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onRefresh={fetchBookings}
            />
            <BookingsTable
              bookings={bookings}
              filteredBookings={filteredBookings}
              loading={loadingBookings}
              editingBookingId={editingBookingId}
              setEditingBookingId={setEditingBookingId}
              updatingStatus={updatingStatus}
              deletingBookingId={deletingBookingId}
              onUpdateStatus={updatePaymentStatus}
              onDelete={deleteBooking}
            />
          </>
        )}

        {activeTab === "manageSlots" && (
          <ManageSlots
            selectedSlotDate={selectedSlotDate}
            setSelectedSlotDate={setSelectedSlotDate}
            slotsForDate={slotsForDate}
            loadingSlotsForDate={loadingSlotsForDate}
            updatingSlot={updatingSlot}
            onToggleSlot={toggleSlotAvailability}
          />
        )}

        {activeTab === "slots" && (
          <GenerateSlots
            loading={loading}
            progress={progress}
            result={result}
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            lastSlotDate={lastSlotDate}
            loadingLastDate={loadingLastDate}
            onGenerate={generateSlots}
            onReset={() => setResult(null)}
          />
        )}
      </div>
    </div>
  );
}