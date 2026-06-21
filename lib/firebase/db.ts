import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  limit,
  Timestamp,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db, isMockMode } from "./config";
import { EmissionFactors, DEFAULT_EMISSION_FACTORS } from "../emissions/engine";

export interface Activity {
  id?: string;
  category: "transport" | "electricity" | "cooking" | "diet" | "consumption";
  subType: string;
  quantity: number;
  unit: string;
  co2eKg: number;
  source: "manual" | "ai_parsed" | "bill_ocr";
  factorVersion: string;
  loggedAt: Date;
  note?: string;
}

export interface UserProfile {
  city: string;
  state: string;
  dietType: "vegan" | "vegetarian" | "eggetarian" | "non_veg_low" | "non_veg_high";
  householdSize: number;
  createdAt: Date;
}

export interface DailySummary {
  id?: string; // date string YYYY-MM-DD
  totalCo2eKg: number;
  byCategory: {
    transport: number;
    electricity: number;
    cooking: number;
    diet: number;
    consumption: number;
  };
  factorVersion: string;
}

export interface WeeklySummary {
  id?: string; // week string YYYY-Wxx
  totalCo2eKg: number;
  deltaFromPriorWeek: number;
  topCategory: string;
}

// ----------------------------------------------------
// Mock Mode Local Storage Events & Pub/Sub
// ----------------------------------------------------
const mockDbListeners = new Set<() => void>();

export function notifyMockDbChange() {
  if (typeof window !== "undefined") {
    mockDbListeners.forEach(cb => cb());
  }
}

export function subscribeToMockDb(cb: () => void) {
  mockDbListeners.add(cb);
  return () => {
    mockDbListeners.delete(cb);
  };
}

// Helper to rebuild aggregates in mock local storage
function rebuildMockSummaries(userId: string, activities: Activity[]) {
  const dailyMap: { [date: string]: DailySummary } = {};
  const weeklyMap: { 
    [weekId: string]: { 
      totalCo2eKg: number; 
      byCategory: { transport: number; electricity: number; cooking: number; diet: number; consumption: number } 
    } 
  } = {};

  activities.forEach((act) => {
    const loggedDate = new Date(act.loggedAt);
    const dateStr = loggedDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // Calculate Week ID: YYYY-Wxx
    const year = loggedDate.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((loggedDate.getTime() - oneJan.getTime()) / (86400000));
    const weekNumber = Math.ceil((loggedDate.getDay() + 1 + numberOfDays) / 7);
    const weekStr = `${year}-W${String(weekNumber).padStart(2, "0")}`;

    const cat = act.category;
    const co2e = act.co2eKg || 0;

    // Daily Accumulation
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        id: dateStr,
        totalCo2eKg: 0,
        byCategory: { transport: 0, electricity: 0, cooking: 0, diet: 0, consumption: 0 },
        factorVersion: act.factorVersion || "v20.0-2024"
      };
    }
    dailyMap[dateStr].totalCo2eKg += co2e;
    dailyMap[dateStr].byCategory[cat] += co2e;

    // Weekly Accumulation
    if (!weeklyMap[weekStr]) {
      weeklyMap[weekStr] = {
        totalCo2eKg: 0,
        byCategory: { transport: 0, electricity: 0, cooking: 0, diet: 0, consumption: 0 }
      };
    }
    weeklyMap[weekStr].totalCo2eKg += co2e;
    weeklyMap[weekStr].byCategory[cat] += co2e;
  });

  // Save Daily Summaries to LocalStorage
  localStorage.setItem(
    `mock_dailySummaries_${userId}`,
    JSON.stringify(Object.values(dailyMap))
  );

  // Save Weekly Summaries to LocalStorage with deltas and topCategories
  const sortedWeeks = Object.keys(weeklyMap).sort();
  const weeklySummaries: WeeklySummary[] = sortedWeeks.map((weekStr, idx) => {
    const weeklyData = weeklyMap[weekStr];
    
    // Find top emitting category
    let topCategory = "transport";
    let maxEmissions = -1;
    for (const [cat, val] of Object.entries(weeklyData.byCategory)) {
      if ((val as number) > maxEmissions) {
        maxEmissions = val as number;
        topCategory = cat;
      }
    }

    // Calculate delta from prior week
    let delta = 0;
    if (idx > 0) {
      const priorWeekStr = sortedWeeks[idx - 1];
      const priorTotal = weeklyMap[priorWeekStr].totalCo2eKg;
      delta = priorTotal > 0 
        ? Number((((weeklyData.totalCo2eKg - priorTotal) / priorTotal) * 100).toFixed(1))
        : 0;
    }

    return {
      id: weekStr,
      totalCo2eKg: Number(weeklyData.totalCo2eKg.toFixed(2)),
      topCategory,
      deltaFromPriorWeek: delta
    };
  });

  localStorage.setItem(
    `mock_weeklySummaries_${userId}`,
    JSON.stringify(weeklySummaries)
  );
}
function cleanUndefinedFields<T extends object>(obj: T): T {
  const cleaned = { ...obj } as Record<string, unknown>;
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned as unknown as T;
}

// ----------------------------------------------------
// Database Operations (Firebase & Mock switch)
// ----------------------------------------------------

/**
 * Seed default emission factors to Firestore if the collection is empty.
 */
export async function seedEmissionFactors(): Promise<void> {
  if (isMockMode) {
    if (typeof window !== "undefined" && !localStorage.getItem("mock_emissionFactors")) {
      localStorage.setItem("mock_emissionFactors", JSON.stringify(DEFAULT_EMISSION_FACTORS));
    }
    return;
  }
  try {
    if (!db) throw new Error("Database not initialized");
    const factorsCol = collection(db, "emissionFactors");
    const q = query(factorsCol, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("Database empty. Seeding default versioned emission factors...");
      const docRef = doc(factorsCol, DEFAULT_EMISSION_FACTORS.version);
      await setDoc(docRef, {
        ...DEFAULT_EMISSION_FACTORS,
        effectiveFrom: Timestamp.fromDate(new Date(DEFAULT_EMISSION_FACTORS.effectiveFrom)),
        createdAt: serverTimestamp()
      });
      console.log("Successfully seeded emission factors version:", DEFAULT_EMISSION_FACTORS.version);
    }
  } catch (error) {
    console.error("Error seeding emission factors:", error);
  }
}

/**
 * Retrieves the latest versioned emission factors from Firestore.
 * Falls back to local DEFAULT_EMISSION_FACTORS if loading fails.
 */
export async function getLatestEmissionFactors(): Promise<EmissionFactors> {
  if (isMockMode) {
    await seedEmissionFactors();
    const data = localStorage.getItem("mock_emissionFactors");
    return data ? JSON.parse(data) : DEFAULT_EMISSION_FACTORS;
  }
  try {
    await seedEmissionFactors();

    if (!db) throw new Error("Database not initialized");
    const factorsCol = collection(db, "emissionFactors");
    const q = query(factorsCol, orderBy("effectiveFrom", "desc"), limit(1));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      return {
        version: data.version,
        sourceDocument: data.sourceDocument,
        effectiveFrom: data.effectiveFrom instanceof Timestamp 
          ? data.effectiveFrom.toDate().toISOString().split("T")[0]
          : data.effectiveFrom,
        electricity: data.electricity,
        transport: data.transport,
        cooking: data.cooking,
        diet: data.diet,
        consumption: data.consumption
      } as EmissionFactors;
    }
  } catch (error) {
    console.error("Error fetching emission factors from Firestore, falling back to local defaults:", error);
  }
  return DEFAULT_EMISSION_FACTORS;
}

/**
 * Creates or updates user profile metadata in Firestore.
 */
export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  if (isMockMode) {
    localStorage.setItem(`mock_profile_${userId}`, JSON.stringify(profile));
    notifyMockDbChange();
    return;
  }
  if (!db) throw new Error("Database not initialized");
  const userRef = doc(db, "users", userId);
  const cleanProfile = cleanUndefinedFields(profile);
  await setDoc(userRef, {
    profile: {
      ...cleanProfile,
      createdAt: Timestamp.fromDate(cleanProfile.createdAt)
    }
  }, { merge: true });
}

/**
 * Retrieves user profile metadata.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isMockMode) {
    const data = localStorage.getItem(`mock_profile_${userId}`);
    if (data) {
      const p = JSON.parse(data);
      return {
        ...p,
        createdAt: new Date(p.createdAt)
      } as UserProfile;
    }
    return null;
  }
  if (!db) throw new Error("Database not initialized");
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    if (data.profile) {
      return {
        ...data.profile,
        createdAt: data.profile.createdAt instanceof Timestamp ? data.profile.createdAt.toDate() : new Date(data.profile.createdAt)
      } as UserProfile;
    }
  }
  return null;
}

/**
 * Logs a new activity entry to Firestore under the user's activities sub-collection.
 */
export async function addActivity(userId: string, activity: Omit<Activity, "id">): Promise<string> {
  if (isMockMode) {
    const actId = `act_${Math.random().toString(36).substring(2, 11)}`;
    const activities = await getActivities(userId);
    const newAct: Activity = {
      id: actId,
      ...activity,
      loggedAt: new Date(activity.loggedAt)
    };
    activities.push(newAct);
    localStorage.setItem(`mock_activities_${userId}`, JSON.stringify(activities));
    
    // Rebuild summaries client-side
    rebuildMockSummaries(userId, activities);
    
    notifyMockDbChange();
    return actId;
  }
  if (!db) throw new Error("Database not initialized");
  const activitiesCol = collection(db, "users", userId, "activities");
  const cleanActivity = cleanUndefinedFields(activity);
  const docRef = await addDoc(activitiesCol, {
    ...cleanActivity,
    loggedAt: Timestamp.fromDate(cleanActivity.loggedAt)
  });
  return docRef.id;
}

/**
 * Deletes an activity entry from Firestore.
 */
export async function deleteActivity(userId: string, activityId: string): Promise<void> {
  if (isMockMode) {
    const activities = await getActivities(userId);
    const updated = activities.filter(a => a.id !== activityId);
    localStorage.setItem(`mock_activities_${userId}`, JSON.stringify(updated));
    
    rebuildMockSummaries(userId, updated);
    
    notifyMockDbChange();
    return;
  }
  if (!db) throw new Error("Database not initialized");
  const activityDoc = doc(db, "users", userId, "activities", activityId);
  await deleteDoc(activityDoc);
}

/**
 * Fetches activities for a user within a specific date range.
 */
export async function getActivities(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Activity[]> {
  if (isMockMode) {
    const data = localStorage.getItem(`mock_activities_${userId}`);
    if (!data) return [];
    
    let activities: Activity[] = (JSON.parse(data) as Activity[]).map((a: Activity) => ({
      ...a,
      loggedAt: new Date(a.loggedAt)
    }));

    if (startDate) {
      activities = activities.filter(a => a.loggedAt.getTime() >= startDate.getTime());
    }
    if (endDate) {
      activities = activities.filter(a => a.loggedAt.getTime() <= endDate.getTime());
    }
    
    // Sort descending by loggedAt
    return activities.sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
  }

  if (!db) throw new Error("Database not initialized");
  const activitiesCol = collection(db, "users", userId, "activities");
  let q = query(activitiesCol, orderBy("loggedAt", "desc"));
  
  if (startDate) {
    q = query(q, where("loggedAt", ">=", Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    q = query(q, where("loggedAt", "<=", Timestamp.fromDate(endDate)));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      loggedAt: data.loggedAt instanceof Timestamp ? data.loggedAt.toDate() : new Date(data.loggedAt)
    } as Activity;
  });
}

/**
 * Sets up a live listener on user activities, filtering by date range.
 */
export function subscribeToActivities(
  userId: string,
  startDate: Date | undefined,
  endDate: Date | undefined,
  callback: (activities: Activity[]) => void
): () => void {
  if (isMockMode) {
    const fetchAndCallback = () => {
      getActivities(userId, startDate, endDate).then(callback);
    };
    fetchAndCallback();
    return subscribeToMockDb(fetchAndCallback);
  }

  if (!db) {
    console.error("Database not initialized");
    return () => {};
  }
  const activitiesCol = collection(db, "users", userId, "activities");
  let q = query(activitiesCol, orderBy("loggedAt", "desc"));
  
  if (startDate) {
    q = query(q, where("loggedAt", ">=", Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    q = query(q, where("loggedAt", "<=", Timestamp.fromDate(endDate)));
  }
  
  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        loggedAt: data.loggedAt instanceof Timestamp ? data.loggedAt.toDate() : new Date(data.loggedAt)
      } as Activity;
    });
    callback(activities);
  }, (error) => {
    console.error("Live activities subscription failed:", error);
  });
}

/**
 * Sets up a live listener on user daily summaries.
 */
export function subscribeToDailySummaries(
  userId: string,
  callback: (summaries: DailySummary[]) => void
): () => void {
  if (isMockMode) {
    const fetchAndCallback = () => {
      const data = localStorage.getItem(`mock_dailySummaries_${userId}`);
      const list: DailySummary[] = data ? JSON.parse(data) : [];
      // Sort descending by id date string
      callback(list.sort((a, b) => b.id!.localeCompare(a.id!)).slice(0, 30));
    };
    fetchAndCallback();
    return subscribeToMockDb(fetchAndCallback);
  }

  if (!db) {
    console.error("Database not initialized");
    return () => {};
  }
  const summariesCol = collection(db, "users", userId, "dailySummaries");
  const q = query(summariesCol, orderBy("__name__", "desc"), limit(30)); // Last 30 days
  
  return onSnapshot(q, (snapshot) => {
    const summaries = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as DailySummary;
    });
    callback(summaries);
  }, (error) => {
    console.error("Daily summaries subscription failed:", error);
  });
}

/**
 * Sets up a live listener on user weekly summaries.
 */
export function subscribeToWeeklySummaries(
  userId: string,
  callback: (summaries: WeeklySummary[]) => void
): () => void {
  if (isMockMode) {
    const fetchAndCallback = () => {
      const data = localStorage.getItem(`mock_weeklySummaries_${userId}`);
      const list: WeeklySummary[] = data ? JSON.parse(data) : [];
      callback(list.sort((a, b) => b.id!.localeCompare(a.id!)).slice(0, 12));
    };
    fetchAndCallback();
    return subscribeToMockDb(fetchAndCallback);
  }

  if (!db) {
    console.error("Database not initialized");
    return () => {};
  }
  const summariesCol = collection(db, "users", userId, "weeklySummaries");
  const q = query(summariesCol, orderBy("__name__", "desc"), limit(12)); // Last 12 weeks
  
  return onSnapshot(q, (snapshot) => {
    const summaries = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as WeeklySummary;
    });
    callback(summaries);
  }, (error) => {
    console.error("Weekly summaries subscription failed:", error);
  });
}
