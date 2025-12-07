const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// Runs every day at 12:01 AM IST (India Standard Time)
exports.generateDailySlots = onSchedule(
  {
    schedule: "1 0 * * *",
    timeZone: "Asia/Kolkata",
  },
  async (event) => {
    try {
      console.log("🔄 Starting daily slot generation...");

      // Calculate date 60 days from today
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 60);

      const dateStr = targetDate.toISOString().split("T")[0];

      // Check if slots already exist for this date
      const existingSlots = await db
        .collection("slots")
        .where("date", "==", dateStr)
        .limit(1)
        .get();

      if (!existingSlots.empty) {
        console.log(`⏭️  Slots already exist for ${dateStr}, skipping...`);
        return null;
      }

      // Create 13 slots for the day (8 AM to 9 PM)
      const batch = db.batch();
      let slotsCreated = 0;

      for (let hour = 8; hour < 21; hour++) {
        const slotId = `SLOT_${dateStr}_${hour}`;
        const slotRef = db.collection("slots").doc(slotId);

        batch.set(slotRef, {
          date: dateStr,
          hour: hour,
          startTime: `${hour}:00`,
          endTime: `${hour + 1}:00`,
          price: 200,
          status: "available",
          bookingId: null,
          createdAt: Timestamp.now(),
        });

        slotsCreated++;
      }

      await batch.commit();

      console.log(`✅ Created ${slotsCreated} slots for ${dateStr}`);
      return null;
    } catch (error) {
      console.error("❌ Error generating slots:", error);
      throw error;
    }
  }
);

// Manual trigger for initial setup
exports.generateSlotsManual = require("firebase-functions").https.onCall(
  async (data, context) => {
    try {
      const daysToGenerate = data.days || 60;
      const today = new Date();
      let totalCreated = 0;

      for (let i = 0; i < daysToGenerate; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        const dateStr = targetDate.toISOString().split("T")[0];

        const existing = await db
          .collection("slots")
          .where("date", "==", dateStr)
          .limit(1)
          .get();

        if (existing.empty) {
          const batch = db.batch();

          for (let hour = 8; hour < 21; hour++) {
            const slotId = `SLOT_${dateStr}_${hour}`;
            const slotRef = db.collection("slots").doc(slotId);

            batch.set(slotRef, {
              date: dateStr,
              hour: hour,
              startTime: `${hour}:00`,
              endTime: `${hour + 1}:00`,
              price: 200,
              status: "available",
              bookingId: null,
              createdAt: Timestamp.now(),
            });
          }

          await batch.commit();
          totalCreated += 13;
        }
      }

      return { success: true, slotsCreated: totalCreated };
    } catch (error) {
      console.error("Error:", error);
      throw new Error(error.message);
    }
  }
);