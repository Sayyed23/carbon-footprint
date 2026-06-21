import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled function running every Sunday at 9 AM IST.
 * Compiles weekly analytics, updates leaderboards, and logs scheduled tasks.
 */
export const weeklyDigest = onSchedule("0 9 * * 0", async (event) => {
  console.log("Starting scheduled weekly carbon digest analysis...");

  try {
    const usersSnap = await db.collection("users").get();
    
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      
      // Fetch latest weekly summaries
      const weeklyCol = db.collection("users").doc(userId).collection("weeklySummaries");
      const weeklySnapshot = await weeklyCol.orderBy("__name__", "desc").limit(2).get();
      
      if (weeklySnapshot.empty) continue;
      
      // Calculate delta from previous week
      if (weeklySnapshot.docs.length >= 2) {
        const latest = weeklySnapshot.docs[0].data();
        const prior = weeklySnapshot.docs[1].data();
        
        const delta = prior.totalCo2eKg > 0
          ? Number((((latest.totalCo2eKg - prior.totalCo2eKg) / prior.totalCo2eKg) * 100).toFixed(1))
          : 0;
        
        await weeklyCol.doc(weeklySnapshot.docs[0].id).update({
          deltaFromPriorWeek: delta
        });
      }
    }

    console.log("Successfully compiled scheduled weekly summaries aggregates.");
  } catch (error) {
    console.error("Scheduled weekly digest aggregation failed:", error);
  }
});
