import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Generate unique slot ID
export const generateSlotId = (date, hour) => {
  const dateStr = date.toISOString().split('T')[0]; // "2025-12-09"
  return `SLOT_${dateStr}_${hour}`;
};

// Initialize all slots for a specific date
export const initializeSlotsForDate = async (date) => {
  const dateStr = date.toISOString().split('T')[0];
  
  try {
    // Create slots from 8 AM to 9 PM (8 to 20)
    for (let hour = 8; hour < 21; hour++) {
      const slotId = generateSlotId(date, hour);
      const slotRef = doc(db, 'slots', slotId);
      
      // Check if slot already exists
      const slotDoc = await getDoc(slotRef);
      
      if (!slotDoc.exists()) {
        // Create new slot
        await setDoc(slotRef, {
          date: dateStr,
          hour: hour,
          startTime: `${hour}:00`,
          endTime: `${hour + 1}:00`,
          price: 200,
          status: 'available', // available, booked, blocked
          bookingId: null,
          createdAt: new Date()
        });
        
        console.log(`✅ Created slot: ${slotId}`);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing slots:', error);
    return { success: false, error };
  }
};

// Get all slots for a specific date
export const getSlotsForDate = async (date) => {
  const dateStr = date.toISOString().split('T')[0];
  
  try {
    const slotsQuery = query(
      collection(db, 'slots'),
      where('date', '==', dateStr)
    );
    
    const querySnapshot = await getDocs(slotsQuery);
    const slots = [];
    
    querySnapshot.forEach((doc) => {
      slots.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by hour
    slots.sort((a, b) => a.hour - b.hour);
    
    return { success: true, slots };
  } catch (error) {
    console.error('Error getting slots:', error);
    return { success: false, error, slots: [] };
  }
};

// Book a slot
export const bookSlot = async (slotId, bookingData) => {
  try {
    const slotRef = doc(db, 'slots', slotId);
    const slotDoc = await getDoc(slotRef);
    
    if (!slotDoc.exists()) {
      return { success: false, error: 'Slot does not exist' };
    }
    
    const slotData = slotDoc.data();
    
    if (slotData.status !== 'available') {
      return { success: false, error: 'Slot is not available' };
    }
    
    // Create booking document
    const bookingRef = doc(collection(db, 'bookings'));
    await setDoc(bookingRef, {
      ...bookingData,
      slotIds: [slotId],
      totalAmount: bookingData.totalAmount || 200,
      status: 'confirmed',
      createdAt: new Date()
    });
    
    // Update slot status
    await setDoc(slotRef, {
      ...slotData,
      status: 'booked',
      bookingId: bookingRef.id
    });
    
    return { success: true, bookingId: bookingRef.id };
  } catch (error) {
    console.error('Error booking slot:', error);
    return { success: false, error };
  }
};