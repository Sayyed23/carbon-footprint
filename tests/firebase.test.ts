import test from "node:test";
import assert from "node:assert";
import type { QuerySnapshot, DocumentSnapshot, DocumentReference } from "firebase/firestore";

// 1. Mock firebase modules in require.cache
const firestoreKey = require.resolve("firebase/firestore");
const authKey = require.resolve("firebase/auth");
const appKey = require.resolve("firebase/app");
const storageKey = require.resolve("firebase/storage");

class MockTimestamp {
  seconds: number;
  nanoseconds: number;
  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  static fromDate(d: Date) {
    return new MockTimestamp(Math.floor(d.getTime() / 1000), 0);
  }
  static now() {
    return new MockTimestamp(Math.floor(Date.now() / 1000), 0);
  }
  toDate() {
    return new Date(this.seconds * 1000);
  }
}

const mockDocRef: Pick<DocumentReference, "id"> = { id: "doc_123" };
const mockDocSnap: Pick<DocumentSnapshot, "id" | "exists" | "data"> = {
  id: "doc_123",
  exists: (() => true) as unknown as DocumentSnapshot["exists"],
  data: () => ({
    profile: {
      city: "Mumbai",
      state: "Maharashtra",
      dietType: "vegetarian",
      householdSize: 4,
      createdAt: MockTimestamp.fromDate(new Date("2026-06-20T10:00:00Z"))
    },
    version: "v20.0-2024",
    effectiveFrom: MockTimestamp.fromDate(new Date("2026-06-20T10:00:00Z")),
    electricity: {
      default: 0.71,
      byRegion: { western: 0.74 },
      byState: { Maharashtra: "western" }
    },
    transport: {},
    cooking: {},
    diet: {},
    consumption: {},
    sourceDocument: "CEA Baseline v20.0"
  })
};

const mockSnapshot: Pick<QuerySnapshot, "empty" | "docs"> & { forEach: (cb: (doc: typeof mockDocSnap) => void) => void } = {
  empty: false,
  docs: [mockDocSnap] as unknown as QuerySnapshot["docs"],
  forEach: (cb: (doc: typeof mockDocSnap) => void) => cb(mockDocSnap)
};

const mockFirestoreInstance = {};
const mockFirestore = {
  getFirestore: () => mockFirestoreInstance,
  connectFirestoreEmulator: () => { /* intentional no-op */ },
  collection: (_db: unknown, ..._paths: string[]) => ({ path: _paths.join("/") }),
  doc: (_db: unknown, ..._paths: string[]) => ({ path: _paths.join("/") }),
  setDoc: async () => { /* intentional no-op */ },
  addDoc: async () => mockDocRef,
  getDocs: async () => mockSnapshot,
  getDoc: async () => mockDocSnap,
  query: (q: unknown) => q,
  where: () => ({}),
  orderBy: () => ({}),
  limit: () => ({}),
  deleteDoc: async () => { /* intentional no-op */ },
  onSnapshot: (
    _q: unknown,
    nextCb: (snap: typeof mockSnapshot) => void,
    errorCb?: (err: Error) => void
  ) => {
    nextCb(mockSnapshot);
    if (errorCb) errorCb(new Error("mock error"));
    return () => { /* unsubscribe no-op */ };
  },
  Timestamp: MockTimestamp,
  serverTimestamp: () => ({})
};

const mockAuthInstance = {
  currentUser: { uid: "usr_real_123", email: "real@example.com" }
};
const mockAuth = {
  getAuth: () => mockAuthInstance,
  connectAuthEmulator: () => { /* intentional no-op */ },
  createUserWithEmailAndPassword: async (_auth: unknown, email: string) => {
    return { user: { uid: "usr_real_signup", email } };
  },
  signInWithEmailAndPassword: async (_auth: unknown, email: string) => {
    return { user: { uid: "usr_real_signin", email } };
  },
  signInWithPopup: async () => {
    return { user: { uid: "usr_real_google", email: "google_real@gmail.com" } };
  },
  signOut: async () => { /* intentional no-op */ },
  GoogleAuthProvider: class {}
};

require.cache[firestoreKey] = {
  id: firestoreKey,
  filename: firestoreKey,
  loaded: true,
  exports: mockFirestore,
  paths: [],
  children: []
} as unknown as NodeModule;

require.cache[authKey] = {
  id: authKey,
  filename: authKey,
  loaded: true,
  exports: mockAuth,
  paths: [],
  children: []
} as unknown as NodeModule;

require.cache[appKey] = {
  id: appKey,
  filename: appKey,
  loaded: true,
  exports: {
    initializeApp: () => ({}),
    getApps: () => [],
    getApp: () => ({})
  },
  paths: [],
  children: []
} as unknown as NodeModule;

require.cache[storageKey] = {
  id: storageKey,
  filename: storageKey,
  loaded: true,
  exports: {
    getStorage: () => ({}),
    connectStorageEmulator: () => { /* intentional no-op */ }
  },
  paths: [],
  children: []
} as unknown as NodeModule;

// 2. Mock config.ts in require.cache to export isMockMode=false
const configKey = require.resolve("../lib/firebase/config");
const mockConfig = {
  isMockMode: false,
  db: mockFirestoreInstance,
  auth: mockAuthInstance,
  storage: {},
  app: {}
};

require.cache[configKey] = {
  id: configKey,
  filename: configKey,
  loaded: true,
  exports: mockConfig,
  paths: [],
  children: []
} as unknown as NodeModule;

// 3. Import services and run tests
test("Firebase Real Mode - Auth Operations", async () => {
  const { signUpUser, signInUser, signInWithGoogle, logoutUser } = await import("../lib/firebase/authService");

  // Signup
  const resSignUp = await signUpUser("real@example.com", "password");
  assert.strictEqual(resSignUp.user.uid, "usr_real_signup");

  // Signin
  const resSignIn = await signInUser("real@example.com", "password");
  assert.strictEqual(resSignIn.user.uid, "usr_real_signin");

  // Google signin
  const resGoogle = await signInWithGoogle();
  assert.strictEqual(resGoogle.user.uid, "usr_real_google");

  // Logout
  await logoutUser();
});

test("Firebase Real Mode - Database Operations", async () => {
  const {
    seedEmissionFactors,
    getLatestEmissionFactors,
    saveUserProfile,
    getUserProfile,
    addActivity,
    deleteActivity,
    getActivities,
    subscribeToActivities,
    subscribeToDailySummaries,
    subscribeToWeeklySummaries
  } = await import("../lib/firebase/db");

  // seedEmissionFactors
  await seedEmissionFactors();

  // getLatestEmissionFactors
  const factors = await getLatestEmissionFactors();
  assert.strictEqual(factors.version, "v20.0-2024");

  // saveUserProfile
  await saveUserProfile("usr_123", {
    city: "Mumbai",
    state: "Maharashtra",
    dietType: "vegetarian",
    householdSize: 4,
    createdAt: new Date()
  });

  // getUserProfile
  const profile = await getUserProfile("usr_123");
  assert.ok(profile);
  assert.strictEqual(profile.state, "Maharashtra");

  // addActivity
  const actId = await addActivity("usr_123", {
    category: "transport",
    subType: "2w_petrol",
    quantity: 10,
    unit: "km",
    co2eKg: 0.56,
    source: "manual",
    factorVersion: "v1.0",
    loggedAt: new Date()
  });
  assert.strictEqual(actId, "doc_123");

  // getActivities
  const acts = await getActivities("usr_123", new Date("2026-01-01"), new Date("2026-12-31"));
  assert.strictEqual(acts.length, 1);
  assert.strictEqual(acts[0].id, "doc_123");

  // deleteActivity
  await deleteActivity("usr_123", "doc_123");

  // subscribeToActivities
  const unsub1 = subscribeToActivities("usr_123", undefined, undefined, (data) => {
    assert.strictEqual(data.length, 1);
  });
  unsub1();

  // subscribeToDailySummaries
  const unsub2 = subscribeToDailySummaries("usr_123", (data) => {
    assert.strictEqual(data.length, 1);
  });
  unsub2();

  // subscribeToWeeklySummaries
  const unsub3 = subscribeToWeeklySummaries("usr_123", (data) => {
    assert.strictEqual(data.length, 1);
  });
  unsub3();
});

test("Firebase Real Mode - Error and Fallback Paths", async () => {
  const { getLatestEmissionFactors, getUserProfile, getActivities } = await import("../lib/firebase/db");

  // Temporarily make getDocs throw to test catch blocks
  const originalGetDocs = mockFirestore.getDocs;
  mockFirestore.getDocs = async () => {
    throw new Error("Firestore read failed");
  };

  const factors = await getLatestEmissionFactors();
  assert.strictEqual(factors.version, "v20.0-2024"); // Fallback to local default

  const originalGetDoc = mockFirestore.getDoc;
  mockFirestore.getDoc = async () => {
    throw new Error("Firestore doc read failed");
  };

  // getUserProfile error path
  await assert.rejects(async () => {
    await getUserProfile("usr_error");
  }, /Firestore doc read failed/);

  // getActivities error path
  await assert.rejects(async () => {
    await getActivities("usr_error");
  }, /Firestore read failed/);

  // Restore mocks
  mockFirestore.getDocs = originalGetDocs;
  mockFirestore.getDoc = originalGetDoc;
});

test("Firebase Real Mode - Empty Snapshot Returns Default Factors", async () => {
  const { getLatestEmissionFactors } = await import("../lib/firebase/db");

  // Make getDocs return empty snapshot to test fallback
  const originalGetDocs = mockFirestore.getDocs;
  mockFirestore.getDocs = async () => ({
    empty: true,
    docs: [],
    forEach: () => { /* no docs */ }
  });

  const factors = await getLatestEmissionFactors();
  assert.strictEqual(factors.version, "v20.0-2024"); // Falls back to DEFAULT_EMISSION_FACTORS

  // Restore
  mockFirestore.getDocs = originalGetDocs;
});

test("Firebase Real Mode - getUserProfile Returns null When Not Found", async () => {
  const { getUserProfile } = await import("../lib/firebase/db");

  // Make getDoc return a snap that doesn't exist
  const originalGetDoc = mockFirestore.getDoc;
  mockFirestore.getDoc = async () => ({
    exists: () => false,
    data: () => null,
    id: "not_found"
  } as unknown as Pick<DocumentSnapshot, "id" | "exists" | "data">);

  const profile = await getUserProfile("usr_nonexistent");
  assert.strictEqual(profile, null);

  // Restore
  mockFirestore.getDoc = originalGetDoc;
});

test("Firebase Real Mode - getUserProfile Missing profile Field", async () => {
  const { getUserProfile } = await import("../lib/firebase/db");

  // Document exists but has no 'profile' field
  const originalGetDoc = mockFirestore.getDoc;
  mockFirestore.getDoc = async () => ({
    exists: () => true,
    data: () => ({ someOtherField: "value" }),
    id: "doc_no_profile"
  } as unknown as Pick<DocumentSnapshot, "id" | "exists" | "data">);

  const profile = await getUserProfile("usr_no_profile");
  assert.strictEqual(profile, null);

  // Restore
  mockFirestore.getDoc = originalGetDoc;
});

test("Firebase Real Mode - Emission Factor effectiveFrom as String", async () => {
  const { getLatestEmissionFactors } = await import("../lib/firebase/db");

  // Return effectiveFrom as a string (non-Timestamp) to test the ternary branch
  const originalGetDocs = mockFirestore.getDocs;
  mockFirestore.getDocs = async () => ({
    empty: false,
    docs: [{
      id: "v20.0-2024",
      exists: () => true,
      data: () => ({
        version: "v20.0-2024",
        sourceDocument: "CEA Baseline v20.0",
        effectiveFrom: "2024-06-01",
        electricity: { default: 0.71, byRegion: {}, byState: {} },
        transport: {},
        cooking: {},
        diet: {},
        consumption: {}
      })
    }]
  } as unknown as typeof mockSnapshot);

  const factors = await getLatestEmissionFactors();
  assert.strictEqual(factors.effectiveFrom, "2024-06-01");

  // Restore
  mockFirestore.getDocs = originalGetDocs;
});

test("Firebase config.ts Initialization", async () => {
  const configPath = require.resolve("../lib/firebase/config");
  const originalCache = require.cache[configPath];

  // 1. Test isMockMode resolution with emulator mode
  delete require.cache[configPath];
  process.env.NEXT_PUBLIC_USE_EMULATORS = "true";
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "RealKey";
  global.window = {} as unknown as Window & typeof globalThis;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const configModule1 = require("../lib/firebase/config");
  assert.strictEqual(configModule1.isMockMode, false);

  // 2. Test initialization error catch block
  delete require.cache[configPath];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const appModule = require("firebase/app");
  const originalInitializeApp = appModule.initializeApp;
  appModule.initializeApp = () => {
    throw new Error("Init fail");
  };

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const configModule2 = require("../lib/firebase/config");
  assert.strictEqual(configModule2.isMockMode, true); // Fallback on error

  // Restore cache and functions
  appModule.initializeApp = originalInitializeApp;
  if (originalCache) {
    require.cache[configPath] = originalCache;
  }
});

test("Firebase Real Mode - Auth Operations handle missing auth", async () => {
  const { signUpUser, signInUser, signInWithGoogle, logoutUser } = await import("../lib/firebase/authService");

  const originalAuth = mockConfig.auth;
  // @ts-expect-error - mock property assignment
  mockConfig.auth = null;

  await assert.rejects(async () => {
    await signUpUser("test@example.com", "password");
  }, /Auth is not initialized/);

  await assert.rejects(async () => {
    await signInUser("test@example.com", "password");
  }, /Auth is not initialized/);

  await assert.rejects(async () => {
    await signInWithGoogle();
  }, /Auth is not initialized/);

  await assert.rejects(async () => {
    await logoutUser();
  }, /Auth is not initialized/);

  mockConfig.auth = originalAuth;
});

test("Firebase Real Mode - Database Operations handle missing db", async () => {
  const {
    seedEmissionFactors,
    getLatestEmissionFactors,
    saveUserProfile,
    getUserProfile,
    addActivity,
    deleteActivity,
    getActivities,
    subscribeToActivities,
    subscribeToDailySummaries,
    subscribeToWeeklySummaries
  } = await import("../lib/firebase/db");

  const originalDb = mockConfig.db;
  // @ts-expect-error - mock property assignment
  mockConfig.db = null;

  // seedEmissionFactors handles exception internally but logs it
  await seedEmissionFactors();

  // getLatestEmissionFactors falls back to DEFAULT_EMISSION_FACTORS on failure
  const factors = await getLatestEmissionFactors();
  assert.ok(factors.version);

  await assert.rejects(async () => {
    await saveUserProfile("usr_123", {
      city: "Mumbai",
      state: "Maharashtra",
      dietType: "vegetarian",
      householdSize: 4,
      createdAt: new Date()
    });
  }, /Database not initialized/);

  await assert.rejects(async () => {
    await getUserProfile("usr_123");
  }, /Database not initialized/);

  await assert.rejects(async () => {
    await addActivity("usr_123", {
      category: "transport",
      subType: "2w_petrol",
      quantity: 10,
      unit: "km",
      note: "test",
      loggedAt: new Date(),
      co2eKg: 1.0,
      source: "manual",
      factorVersion: "v1"
    });
  }, /Database not initialized/);

  await assert.rejects(async () => {
    await deleteActivity("usr_123", "act_123");
  }, /Database not initialized/);

  await assert.rejects(async () => {
    await getActivities("usr_123");
  }, /Database not initialized/);

  // Subscription methods should return a no-op function and handle missing db
  const unsub1 = subscribeToActivities("usr_123", undefined, undefined, () => {});
  assert.strictEqual(typeof unsub1, "function");
  unsub1();

  const unsub2 = subscribeToDailySummaries("usr_123", () => {});
  assert.strictEqual(typeof unsub2, "function");
  unsub2();

  const unsub3 = subscribeToWeeklySummaries("usr_123", () => {});
  assert.strictEqual(typeof unsub3, "function");
  unsub3();

  mockConfig.db = originalDb;
});

test("Firebase Real Mode - subscribeToActivities with date filters", async () => {
  const { subscribeToActivities } = await import("../lib/firebase/db");

  const start = new Date("2026-06-15T00:00:00Z");
  const end = new Date("2026-06-20T00:00:00Z");
  const unsub = subscribeToActivities("usr_123", start, end, (list) => {
    assert.ok(Array.isArray(list));
  });
  assert.strictEqual(typeof unsub, "function");
  unsub();
});

test("Firebase Real Mode - saveUserProfile with undefined fields", async () => {
  const { saveUserProfile } = await import("../lib/firebase/db");
  await saveUserProfile("usr_123", {
    city: "Mumbai",
    state: "Maharashtra",
    dietType: "vegetarian",
    householdSize: 4,
    createdAt: new Date(),
    // @ts-expect-error - intentional undefined field passing
    someUndefinedField: undefined
  });
});

