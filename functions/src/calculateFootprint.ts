import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Triggered on any create, update, or delete of an activity document.
 * Denormalizes activity records to update daily and weekly summaries for the dashboard.
 */
export const calculateFootprint = onDocumentWritten("users/{userId}/activities/{activityId}", async (event) => {
  const userId = event.params.userId;
  
  // 1. Fetch all activities for this user to rebuild summaries
  const activitiesCol = db.collection("users").doc(userId).collection("activities");
  const snapshot = await activitiesCol.get();
  
  const dailyMap: { [date: string]: any } = {};
  const weeklyMap: { [weekId: string]: any } = {};

  snapshot.forEach((docSnap) => {
    const act = docSnap.data();
    if (!act.loggedAt) return;
    
    const loggedDate = act.loggedAt.toDate();
    const dateStr = loggedDate.toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Calculate Week ID: e.g. YYYY-Wxx (ISO standard week)
    const year = loggedDate.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((loggedDate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((loggedDate.getDay() + 1 + numberOfDays) / 7);
    const weekStr = `${year}-W${String(weekNumber).padStart(2, "0")}`;

    const cat = act.category || "consumption";
    const co2e = Number(act.co2eKg) || 0;

    // Daily Accumulation
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        totalCo2eKg: 0,
        byCategory: { transport: 0, electricity: 0, cooking: 0, diet: 0, consumption: 0 },
        factorVersion: act.factorVersion || "v20.0-2024"
      };
    }
    dailyMap[dateStr].totalCo2eKg += co2e;
    dailyMap[dateStr].byCategory[cat] = (dailyMap[dateStr].byCategory[cat] || 0) + co2e;

    // Weekly Accumulation
    if (!weeklyMap[weekStr]) {
      weeklyMap[weekStr] = {
        totalCo2eKg: 0,
        byCategory: { transport: 0, electricity: 0, cooking: 0, diet: 0, consumption: 0 }
      };
    }
    weeklyMap[weekStr].totalCo2eKg += co2e;
    weeklyMap[weekStr].byCategory[cat] = (weeklyMap[weekStr].byCategory[cat] || 0) + co2e;
  });

  // 2. Commit Daily Summaries
  const dailyCol = db.collection("users").doc(userId).collection("dailySummaries");
  for (const [dateStr, dailyData] of Object.entries(dailyMap)) {
    await dailyCol.doc(dateStr).set(dailyData, { merge: true });
  }

  // 3. Commit Weekly Summaries (Calculating top category & deltas)
  const weeklyCol = db.collection("users").doc(userId).collection("weeklySummaries");
  const sortedWeeks = Object.keys(weeklyMap).sort();

  for (let i = 0; i < sortedWeeks.length; i++) {
    const weekStr = sortedWeeks[i];
    const weeklyData = weeklyMap[weekStr];
    
    // Find top emitting category
    let topCategory = "transport";
    let maxEmissions = 0;
    for (const [cat, val] of Object.entries(weeklyData.byCategory)) {
      if ((val as number) > maxEmissions) {
        maxEmissions = val as number;
        topCategory = cat;
      }
    }

    // Calculate delta from prior week
    let delta = 0;
    if (i > 0) {
      const priorWeekStr = sortedWeeks[i - 1];
      const priorTotal = weeklyMap[priorWeekStr].totalCo2eKg;
      delta = priorTotal > 0 
        ? Number((((weeklyData.totalCo2eKg - priorTotal) / priorTotal) * 100).toFixed(1))
        : 0;
    }

    await weeklyCol.doc(weekStr).set({
      totalCo2eKg: Number(weeklyData.totalCo2eKg.toFixed(2)),
      topCategory,
      deltaFromPriorWeek: delta
    }, { merge: true });
  }
});
