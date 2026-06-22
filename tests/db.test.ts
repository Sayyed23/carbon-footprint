process.env.NEXT_PUBLIC_USE_EMULATORS = "mock";
import test from "node:test";
import assert from "node:assert";

// Mock localStorage and window before importing db
const mockStore: { [key: string]: string } = {};

global.window = {} as unknown as Window & typeof globalThis;
global.localStorage = {
  getItem: (key: string) => mockStore[key] || null,
  setItem: (key: string, value: string) => {
    mockStore[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStore[key];
  },
  clear: () => {
    Object.keys(mockStore).forEach((key) => {
      delete mockStore[key];
    });
  },
  length: 0,
  key: () => null,
};

(global.window as unknown as { dispatchEvent: (event: Event) => boolean }).dispatchEvent = () =>
  true;

import type { UserProfile, Activity } from "../lib/firebase/db";

test("Database Service Mock Mode - Emission Factors", async () => {
  const { seedEmissionFactors, getLatestEmissionFactors } = await import("../lib/firebase/db");
  localStorage.clear();

  await seedEmissionFactors();
  const factors = await getLatestEmissionFactors();
  assert.ok(factors.version);
  assert.ok(factors.transport);
  assert.ok(factors.electricity);
});

test("Database Service Mock Mode - User Profile", async () => {
  const { saveUserProfile, getUserProfile } = await import("../lib/firebase/db");
  localStorage.clear();

  const userId = "usr_999";
  const profile: UserProfile = {
    city: "Mumbai",
    state: "Maharashtra",
    dietType: "vegetarian",
    householdSize: 3,
    createdAt: new Date("2026-06-20T10:00:00Z"),
  };

  await saveUserProfile(userId, profile);
  const fetched = await getUserProfile(userId);

  assert.ok(fetched);
  assert.strictEqual(fetched.city, "Mumbai");
  assert.strictEqual(fetched.state, "Maharashtra");
  assert.strictEqual(fetched.dietType, "vegetarian");
  assert.strictEqual(fetched.householdSize, 3);
  assert.strictEqual(fetched.createdAt.getTime(), profile.createdAt.getTime());
});

test("Database Service Mock Mode - Activities & Rebuild Summaries", async () => {
  const { addActivity, getActivities, deleteActivity } = await import("../lib/firebase/db");
  localStorage.clear();

  const userId = "usr_888";

  // Date in a specific week
  const date1 = new Date("2026-06-20T12:00:00Z"); // Saturday
  const date2 = new Date("2026-06-21T12:00:00Z"); // Sunday

  const date3 = new Date("2026-06-12T12:00:00Z"); // Previous week

  const act1: Omit<Activity, "id"> = {
    category: "transport",
    subType: "2w_petrol",
    quantity: 10,
    unit: "km",
    co2eKg: 1.43,
    source: "manual",
    factorVersion: "v1.0",
    loggedAt: date1,
    note: "commute 1",
  };

  const act2: Omit<Activity, "id"> = {
    category: "electricity",
    subType: "grid",
    quantity: 5,
    unit: "kWh",
    co2eKg: 3.7,
    source: "manual",
    factorVersion: "v1.0",
    loggedAt: date2,
    note: "power consumption",
  };

  const act3: Omit<Activity, "id"> = {
    category: "diet",
    subType: "vegetarian",
    quantity: 1,
    unit: "day",
    co2eKg: 2.0,
    source: "manual",
    factorVersion: "v1.0",
    loggedAt: date3,
    note: "diet log week 24",
  };

  // Add activities
  const id1 = await addActivity(userId, act1);
  const id2 = await addActivity(userId, act2);
  const id3 = await addActivity(userId, act3);

  assert.ok(id1.startsWith("act_"));
  assert.ok(id2.startsWith("act_"));
  assert.ok(id3.startsWith("act_"));

  // Fetch activities
  const allActs = await getActivities(userId);
  assert.strictEqual(allActs.length, 3);
  assert.strictEqual(allActs[0].note, "power consumption"); // Sorted descending
  assert.strictEqual(allActs[1].note, "commute 1");
  assert.strictEqual(allActs[2].note, "diet log week 24");

  // Date range filtering
  const filtered = await getActivities(userId, new Date("2026-06-21T00:00:00Z"));
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].note, "power consumption");

  // Check Daily Summary rebuild
  const dailyRaw = localStorage.getItem(`mock_dailySummaries_${userId}`);
  assert.ok(dailyRaw);
  const daily = JSON.parse(dailyRaw);
  assert.strictEqual(daily.length, 3); // Three different days

  // Check Weekly Summary rebuild
  const weeklyRaw = localStorage.getItem(`mock_weeklySummaries_${userId}`);
  assert.ok(weeklyRaw);
  const weekly = JSON.parse(weeklyRaw);
  assert.strictEqual(weekly.length, 3); // Three different weeks
  // Sorted ascending by week ID in localStorage:
  // weekly[0] is oldest week (week 24)
  // weekly[1] is prior week (week 25)
  // weekly[2] is current week (week 26)
  assert.strictEqual(weekly[0].deltaFromPriorWeek, 0);
  assert.strictEqual(weekly[1].deltaFromPriorWeek, 85.0); // ((3.7 - 2.0) / 2.0) * 100
  assert.strictEqual(weekly[2].deltaFromPriorWeek, -61.4); // ((1.43 - 3.7) / 3.7) * 100

  // Delete an activity
  await deleteActivity(userId, id1);
  const remaining = await getActivities(userId);
  assert.strictEqual(remaining.length, 2);
});

test("Database Service Mock Mode - Subscriptions", async () => {
  const { subscribeToActivities, addActivity } = await import("../lib/firebase/db");
  localStorage.clear();
  const userId = "usr_777";

  let calledCount = 0;
  let lastActivities: Activity[] = [];

  const unsubscribe = subscribeToActivities(userId, undefined, undefined, (acts) => {
    calledCount++;
    lastActivities = acts;
  });

  // wait for the initial fetch to resolve
  await new Promise((resolve) => setTimeout(resolve, 10));

  // subscription callback runs initially
  assert.strictEqual(calledCount, 1);
  assert.strictEqual(lastActivities.length, 0);

  // Add activity and verify subscription fires
  await addActivity(userId, {
    category: "diet",
    subType: "vegan",
    quantity: 1,
    unit: "day",
    co2eKg: 1.1,
    source: "manual",
    factorVersion: "v1.0",
    loggedAt: new Date(),
  });

  // wait for the subscription callback to fire
  await new Promise((resolve) => setTimeout(resolve, 10));

  assert.strictEqual(calledCount, 2);
  assert.strictEqual(lastActivities.length, 1);
  assert.strictEqual(lastActivities[0].category, "diet");

  unsubscribe();
});

test("Database Service Mock Mode - Extra Coverage Cases", async () => {
  const {
    getActivities,
    addActivity,
    getUserProfile,
    subscribeToDailySummaries,
    subscribeToWeeklySummaries
  } = await import("../lib/firebase/db");

  localStorage.clear();
  const userId = "usr_extra";

  // Test getUserProfile null case
  const profile = await getUserProfile(userId);
  assert.strictEqual(profile, null);

  // Seed two activities
  const d1 = new Date("2026-06-15T12:00:00Z");
  const d2 = new Date("2026-06-25T12:00:00Z");

  await addActivity(userId, {
    category: "transport",
    subType: "2w_petrol",
    quantity: 10,
    unit: "km",
    co2eKg: 0.56,
    source: "manual",
    factorVersion: "v1.0",
    loggedAt: d1
  });

  await addActivity(userId, {
    category: "electricity",
    subType: "grid",
    quantity: 10,
    unit: "kWh",
    co2eKg: 7.1,
    source: "manual",
    factorVersion: "v1.0",
    loggedAt: d2
  });

  // 1. Filter by both startDate and endDate
  const acts1 = await getActivities(userId, new Date("2026-06-10"), new Date("2026-06-20"));
  assert.strictEqual(acts1.length, 1);
  assert.strictEqual(acts1[0].category, "transport");

  // 2. Filter by only endDate
  const acts2 = await getActivities(userId, undefined, new Date("2026-06-20"));
  assert.strictEqual(acts2.length, 1);
  assert.strictEqual(acts2[0].category, "transport");

  // Test daily/weekly subscriptions
  let dailyCalled = false;
  const unsubDaily = subscribeToDailySummaries(userId, (summaries) => {
    dailyCalled = true;
    assert.ok(summaries.length >= 1);
  });
  assert.strictEqual(dailyCalled, true);
  unsubDaily();

  let weeklyCalled = false;
  const unsubWeekly = subscribeToWeeklySummaries(userId, (summaries) => {
    weeklyCalled = true;
    assert.ok(summaries.length >= 1);
  });
  assert.strictEqual(weeklyCalled, true);
  unsubWeekly();
});

