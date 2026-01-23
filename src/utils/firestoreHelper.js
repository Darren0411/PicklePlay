import { collection, addDoc, getDocs, query, where, doc, updateDoc, writeBatch, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ✅ Pure string-based date formatting (no timezone issues)
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ Format time with AM/PM
const formatTimeAMPM = (hour) => {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

// ✅ Create slots for a specific date (with string date key)
export const initializeSlotsForDate = async (date) => {
  try {
    // ✅ Use pure string date (no timezone conversion)
    const dateStr = formatDateString(date);
    
    console.log(`📅 Creating slots for: ${dateStr}`);
    
    // Check if slots already exist for this date
    const slotsQuery = query(
      collection(db, 'slots'),
      where('date', '==', dateStr)
    );
    
    const existingSlots = await getDocs(slotsQuery);
    
    let created = 0;
    let skipped = existingSlots.size;
    
    // Only create if no slots exist
    if (existingSlots.empty) {
      const timeSlots = [
        { hour: 8 },
        { hour: 9 },
        { hour: 10 },
        { hour: 11 },
        { hour: 12 },
        { hour: 13 },
        { hour: 14 },
        { hour: 15 },
        { hour: 16 },
        { hour: 17 },
        { hour: 18 },
        { hour: 19 },
        { hour: 20 }
      ];

      const batch = writeBatch(db);
      
      for (const slot of timeSlots) {
        const startTime = `${slot.hour}:00`;
        const endTime = `${slot.hour + 1}:00`;
        const displayTime = `${formatTimeAMPM(slot.hour)} - ${formatTimeAMPM(slot.hour + 1)}`;
        
        // ✅ Use predictable document ID format: SLOT_YYYY-MM-DD_HOUR
        const slotId = `SLOT_${dateStr}_${slot.hour}`;
        const slotRef = doc(db, 'slots', slotId);
        
        batch.set(slotRef, {
          date: dateStr, // ✅ Store as string "YYYY-MM-DD"
          time: displayTime,
          displayTime: displayTime,
          hour: slot.hour,
          startTime: startTime,
          endTime: endTime,
          price: 200,
          status: 'available',
          courtNumber: 1,
          courtName: 'PicklePlay Court',
          createdAt: new Date(),
          bookingId: null,
          userId: null
        });
        
        created++;
      }

      await batch.commit();
      console.log(`Created ${created} slots for ${dateStr}`);
    } else {
      console.log(` Skipped ${dateStr} - ${existingSlots.size} slots already exist`);
    }

    return { 
      success: true, 
      created, 
      skipped,
      date: dateStr 
    };
  } catch (error) {
    console.error('Error initializing slots:', error);
    return { 
      success: false, 
      error: error.message,
      created: 0,
      skipped: 0
    };
  }
};

// ✅ Get slots for a specific date (with string date key)
export const getSlotsForDate = async (date) => {
  try {
    const dateStr = formatDateString(date);
    
    console.log(`🔍 Fetching slots for: ${dateStr}`);
    
    const slotsQuery = query(
      collection(db, 'slots'),
      where('date', '==', dateStr) //  Exact string match
    );
    
    const querySnapshot = await getDocs(slotsQuery);
    
    const slots = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by hour
    slots.sort((a, b) => (a.hour || 0) - (b.hour || 0));

    console.log(`✅ Found ${slots.length} slots for ${dateStr}`);

    return { success: true, slots };
  } catch (error) {
    console.error(' Error fetching slots:', error);
    return { success: false, error: error.message, slots: [] };
  }
};

// ✅ Create booking and update slots
export const createBooking = async (bookingData) => {
  try {
    const bookingRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: new Date(),
      status: 'confirmed'
    });

    const batch = writeBatch(db);
    
    for (const slotId of bookingData.slotIds) {
      const slotRef = doc(db, 'slots', slotId);
      batch.update(slotRef, {
        status: 'booked',
        bookingId: bookingRef.id,
        userId: bookingData.userId || null
      });
    }

    await batch.commit();

    console.log(`✅ Booking created: ${bookingRef.id}`);

    return { 
      success: true, 
      bookingId: bookingRef.id 
    };
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ✅ Update slot status (used by admin)
export const updateSlotStatus = async (slotId, newStatus) => {
  try {
    const slotRef = doc(db, 'slots', slotId);
    await updateDoc(slotRef, {
      status: newStatus
    });

    console.log(`✅ Slot ${slotId} updated to ${newStatus}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating slot:', error);
    return { success: false, error: error.message };
  }
};