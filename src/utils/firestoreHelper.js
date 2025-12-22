import { collection, addDoc, getDocs, query, where, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export const initializeSlotsForDate = async (date) => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    
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
        { hour: 8, time: '8:00 - 9:00' },
        { hour: 9, time: '9:00 - 10:00' },
        { hour: 10, time: '10:00 - 11:00' },
        { hour: 11, time: '11:00 - 12:00' },
        { hour: 12, time: '12:00 - 1:00' },
        { hour: 13, time: '1:00 - 2:00' },
        { hour: 14, time: '2:00 - 3:00' },
        { hour: 15, time: '3:00 - 4:00' },
        { hour: 16, time: '4:00 - 5:00' },
        { hour: 17, time: '5:00 - 6:00' },
        { hour: 18, time: '6:00 - 7:00' },
        { hour: 19, time: '7:00 - 8:00' },
        { hour: 20, time: '8:00 - 9:00' }
      ];

      const batch = writeBatch(db);
      
      for (const slot of timeSlots) {
        const slotRef = doc(db, 'slots', `${dateStr}_${slot.hour}`);
        
        batch.set(slotRef, {
          date: dateStr,
          time: slot.time,
          hour: slot.hour,
          startTime: `${slot.hour}:00`,
          endTime: `${slot.hour + 1}:00`,
          price: 200,
          status: 'available',
          courtNumber: 1,
          createdAt: new Date(),
          bookingId: null,
          userId: null
        });
        
        created++;
      }

      await batch.commit();
      console.log(`✅ Created ${created} slots for ${dateStr}`);
    } else {
      console.log(`⏭️ Skipped ${dateStr} - ${existingSlots.size} slots already exist`);
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

export const getSlotsForDate = async (date) => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    
    const slotsQuery = query(
      collection(db, 'slots'),
      where('date', '==', dateStr)
    );
    
    const querySnapshot = await getDocs(slotsQuery);
    
    const slots = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, slots };
  } catch (error) {
    console.error('Error fetching slots:', error);
    return { success: false, error: error.message, slots: [] };
  }
};

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
        userId: bookingData.userId
      });
    }

    await batch.commit();

    return { 
      success: true, 
      bookingId: bookingRef.id 
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};