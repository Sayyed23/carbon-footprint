/**
 * Unit tests for Cloud Functions business logic.
 * Uses require.cache mocking to intercept firebase-functions and firebase-admin
 * so handlers can be called directly without deploying.
 */
import test from "node:test";
import assert from "node:assert";
import path from "node:path";

// Helper to resolve a module name for both the root node_modules and the nested functions/node_modules
const resolveModule = (moduleName: string) => {
  const paths: string[] = [];
  try {
    paths.push(require.resolve(moduleName));
  } catch {}
  try {
    paths.push(require.resolve(moduleName, { paths: [path.join(process.cwd(), "functions")] }));
  } catch {}
  try {
    paths.push(require.resolve(moduleName, { paths: [path.join(process.cwd(), "functions/src")] }));
  } catch {}
  return Array.from(new Set(paths));
};

const mockModule = (moduleName: string, mockExports: unknown) => {
  const resolvedPaths = resolveModule(moduleName);
  for (const resolvedPath of resolvedPaths) {
    require.cache[resolvedPath] = {
      id: resolvedPath,
      filename: resolvedPath,
      loaded: true,
      exports: mockExports,
      paths: [],
      children: []
    } as unknown as NodeModule;
  }
};

// ──────────────────────────────────────────────────────
// Mock firebase-admin
// ──────────────────────────────────────────────────────

interface MockWeeklyDoc {
  totalCo2eKg: number;
  deltaFromPriorWeek?: number;
  [key: string]: unknown;
}

let shouldThrowDbError = false;

const mockActivitiesDocs: Array<{
  data: () => {
    loggedAt: { toDate: () => Date };
    category: string;
    co2eKg: number;
    factorVersion: string;
  };
}> = [];

const mockWeeklyDocs: Array<{
  id: string;
  data: () => MockWeeklyDoc;
}> = [];

const mockUpdatedWeeklyDocs: Map<string, MockWeeklyDoc> = new Map();
const mockSetDocs: Map<string, Record<string, unknown>> = new Map();

const mockAdminFirestore = {
  collection: (firstPath: string) => {
    return {
      doc: (userId: string) => ({
        collection: (subPath: string) => {
          if (subPath === "activities") {
            return {
              get: async () => ({
                forEach: (cb: (doc: { data: () => unknown }) => void) => {
                  mockActivitiesDocs.forEach(cb);
                }
              })
            };
          }
          if (subPath === "dailySummaries") {
            return {
              doc: (dateStr: string) => ({
                set: async (data: Record<string, unknown>) => {
                  mockSetDocs.set(`daily_${userId}_${dateStr}`, data);
                }
              })
            };
          }
          if (subPath === "weeklySummaries") {
            return {
              doc: (weekStr: string) => ({
                set: async (data: Record<string, unknown>) => {
                  mockSetDocs.set(`weekly_${userId}_${weekStr}`, data);
                },
                update: async (data: Record<string, unknown>) => {
                  mockUpdatedWeeklyDocs.set(weekStr, data as MockWeeklyDoc);
                }
              }),
              orderBy: () => ({
                limit: () => ({
                  get: async () => ({
                    empty: mockWeeklyDocs.length === 0,
                    docs: mockWeeklyDocs
                  })
                })
              })
            };
          }
          return {};
        }
      }),
      get: async () => {
        if (shouldThrowDbError) {
          throw new Error("mock Firestore get error");
        }
        return {
          docs: [{ id: "usr_test_user" }]
        };
      },
      path: firstPath
    };
  }
};

const mockAdmin = {
  apps: [{}], // Simulate already initialized
  initializeApp: () => ({}),
  firestore: () => mockAdminFirestore
};

mockModule("firebase-admin", mockAdmin);

// ──────────────────────────────────────────────────────
// Mock firebase-functions/v2/firestore
// ──────────────────────────────────────────────────────

type FirestoreHandler = (event: {
  params: Record<string, string>;
}) => Promise<void>;

let capturedFirestoreHandler: FirestoreHandler | null = null;

mockModule("firebase-functions/v2/firestore", {
  onDocumentWritten: (_path: string, handler: FirestoreHandler) => {
    capturedFirestoreHandler = handler;
    return handler;
  }
});

// ──────────────────────────────────────────────────────
// Mock firebase-functions/v2/https
// ──────────────────────────────────────────────────────

type HttpsCallableHandler = (request: {
  auth?: { uid: string };
  data: Record<string, unknown>;
}) => Promise<unknown>;

let capturedParseTextHandler: HttpsCallableHandler | null = null;
let capturedParseBillHandler: HttpsCallableHandler | null = null;

mockModule("firebase-functions/v2/https", {
  onCall: (_opts: unknown, handler: HttpsCallableHandler) => {
    // Track which handler is being registered
    if (!capturedParseTextHandler) {
      capturedParseTextHandler = handler;
    } else {
      capturedParseBillHandler = handler;
    }
    return handler;
  },
  HttpsError: class HttpsError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  }
});

// ──────────────────────────────────────────────────────
// Mock firebase-functions/v2/scheduler
// ──────────────────────────────────────────────────────

type SchedulerHandler = () => Promise<void>;
let capturedSchedulerHandler: SchedulerHandler | null = null;

mockModule("firebase-functions/v2/scheduler", {
  onSchedule: (_schedule: string, handler: SchedulerHandler) => {
    capturedSchedulerHandler = handler;
    return handler;
  }
});

// ──────────────────────────────────────────────────────
// Mock @google/generative-ai
// ──────────────────────────────────────────────────────

let mockGeminiResponse = '{"activities":[{"category":"transport","subType":"2w_petrol","quantity":12,"unit":"km","note":"scooter commute"}]}';
let shouldGeminiThrow = false;

mockModule("@google/generative-ai", {
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: async () => {
          if (shouldGeminiThrow) {
            throw new Error("mock API error");
          }
          return {
            response: {
              text: () => mockGeminiResponse
            }
          };
        }
      };
    }
  },
  SchemaType: {
    OBJECT: "object",
    ARRAY: "array",
    STRING: "string",
    NUMBER: "number"
  }
});

// ──────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────

test("Cloud Functions - calculateFootprint handler registration", async () => {
  // Clear previous module cache for functions
  const calcKey = require.resolve("../functions/src/calculateFootprint");
  delete require.cache[calcKey];

  const originalApps = mockAdmin.apps;
  mockAdmin.apps = [];

  // Import the module — this triggers onDocumentWritten and captures the handler
  await import("../functions/src/calculateFootprint");

  mockAdmin.apps = originalApps;

  assert.ok(capturedFirestoreHandler, "calculateFootprint handler should be registered");
});

test("Cloud Functions - calculateFootprint processes activities", async () => {
  assert.ok(capturedFirestoreHandler, "Handler must be registered");

  // Clear previous data
  mockSetDocs.clear();
  mockActivitiesDocs.length = 0;

  // Seed mock activities
  const date0 = new Date("2026-06-09T12:00:00Z"); // Tuesday prior week
  const date1 = new Date("2026-06-16T12:00:00Z"); // Monday
  const date2 = new Date("2026-06-17T12:00:00Z"); // Tuesday
  const date3 = new Date("2026-06-23T12:00:00Z"); // Next Tuesday

  mockActivitiesDocs.push(
    {
      data: () => ({
        loggedAt: { toDate: () => date0 },
        category: "transport",
        co2eKg: 0.0,
        factorVersion: "v20.0-2024"
      })
    },
    {
      data: () => ({
        loggedAt: { toDate: () => date1 },
        category: "transport",
        co2eKg: 1.43,
        factorVersion: "v20.0-2024"
      })
    },
    {
      data: () => ({
        loggedAt: { toDate: () => date2 },
        category: "electricity",
        co2eKg: 3.7,
        factorVersion: "v20.0-2024"
      })
    },
    {
      data: () => ({
        loggedAt: { toDate: () => date3 },
        category: "transport",
        co2eKg: 2.0,
        factorVersion: "v20.0-2024"
      })
    }
  );

  await capturedFirestoreHandler({ params: { userId: "usr_test_user", activityId: "act_1" } });

  // Verify daily summaries were set
  assert.ok(mockSetDocs.has("daily_usr_test_user_2026-06-16"), "Daily summary for 2026-06-16 should exist");
  assert.ok(mockSetDocs.has("daily_usr_test_user_2026-06-17"), "Daily summary for 2026-06-17 should exist");

  const daily1 = mockSetDocs.get("daily_usr_test_user_2026-06-16") as Record<string, unknown>;
  assert.strictEqual(daily1.totalCo2eKg, 1.43);

  const daily2 = mockSetDocs.get("daily_usr_test_user_2026-06-17") as Record<string, unknown>;
  assert.strictEqual(daily2.totalCo2eKg, 3.7);

  // Verify weekly summaries were set
  assert.ok(mockSetDocs.has("weekly_usr_test_user_2026-W25"), "Weekly summary for 2026-W25 should exist");
  assert.ok(mockSetDocs.has("weekly_usr_test_user_2026-W26"), "Weekly summary for 2026-W26 should exist");

  const weeklyW26 = mockSetDocs.get("weekly_usr_test_user_2026-W26") as Record<string, unknown>;
  assert.strictEqual(weeklyW26.deltaFromPriorWeek, -61.0);
});

test("Cloud Functions - calculateFootprint handles activity without loggedAt", async () => {
  assert.ok(capturedFirestoreHandler, "Handler must be registered");

  mockSetDocs.clear();
  mockActivitiesDocs.length = 0;

  // Activity with missing loggedAt should be skipped
  mockActivitiesDocs.push({
    data: () => ({
      loggedAt: null as unknown as { toDate: () => Date },
      category: "transport",
      co2eKg: 1.0,
      factorVersion: "v1.0"
    })
  });

  await capturedFirestoreHandler({ params: { userId: "usr_test_skip", activityId: "act_2" } });

  // No summaries should be created
  assert.strictEqual(mockSetDocs.size, 0, "No summaries should be created for activities without loggedAt");
});

test("Cloud Functions - parseActivityText rejects unauthenticated calls", async () => {
  const parseTextKey = require.resolve("../functions/src/parseActivityText");
  delete require.cache[parseTextKey];
  capturedParseTextHandler = null;

  const originalApps = mockAdmin.apps;
  mockAdmin.apps = [];

  await import("../functions/src/parseActivityText");

  mockAdmin.apps = originalApps;

  assert.ok(capturedParseTextHandler, "parseActivityText handler should be registered");

  // Set API key
  process.env.GEMINI_API_KEY = "test-key-123";

  // Test unauthenticated
  await assert.rejects(async () => {
    await capturedParseTextHandler!({ auth: undefined, data: { text: "rode my scooter 12 km" } });
  }, /Authentication is required/);
});

test("Cloud Functions - parseActivityText rejects missing text", async () => {
  assert.ok(capturedParseTextHandler, "Handler must be registered");

  await assert.rejects(async () => {
    await capturedParseTextHandler!({ auth: { uid: "usr_123" }, data: {} });
  }, /Text parameter is required/);
});

test("Cloud Functions - parseActivityText rejects missing API key", async () => {
  assert.ok(capturedParseTextHandler, "Handler must be registered");

  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  await assert.rejects(async () => {
    await capturedParseTextHandler!({ auth: { uid: "usr_123" }, data: { text: "rode scooter 12 km" } });
  }, /Gemini API key is not configured/);

  process.env.GEMINI_API_KEY = originalKey;
});

test("Cloud Functions - parseActivityText parses text successfully", async () => {
  assert.ok(capturedParseTextHandler, "Handler must be registered");
  process.env.GEMINI_API_KEY = "test-key-123";

  mockGeminiResponse = '{"activities":[{"category":"transport","subType":"2w_petrol","quantity":12,"unit":"km","note":"scooter commute"}]}';

  const result = await capturedParseTextHandler!({
    auth: { uid: "usr_123" },
    data: { text: "Rode my scooter for 12 km today" }
  }) as { activities: Array<{ category: string; quantity: number }> };

  assert.ok(result.activities);
  assert.strictEqual(result.activities.length, 1);
  assert.strictEqual(result.activities[0].category, "transport");
  assert.strictEqual(result.activities[0].quantity, 12);
});

test("Cloud Functions - parseActivityText handles Gemini empty response", async () => {
  assert.ok(capturedParseTextHandler, "Handler must be registered");
  process.env.GEMINI_API_KEY = "test-key-123";

  // Override mock to return empty response
  const originalResponse = mockGeminiResponse;
  mockGeminiResponse = "";

  await assert.rejects(async () => {
    await capturedParseTextHandler!({
      auth: { uid: "usr_123" },
      data: { text: "some activity log" }
    });
  }, /Received empty response from Gemini API/);

  mockGeminiResponse = originalResponse;
});

test("Cloud Functions - parseUtilityBill rejects unauthenticated calls", async () => {
  const parseBillKey = require.resolve("../functions/src/parseUtilityBill");
  delete require.cache[parseBillKey];
  capturedParseBillHandler = null;

  const originalApps = mockAdmin.apps;
  mockAdmin.apps = [];

  await import("../functions/src/parseUtilityBill");

  mockAdmin.apps = originalApps;

  assert.ok(capturedParseBillHandler, "parseUtilityBill handler should be registered");

  process.env.GEMINI_API_KEY = "test-key-123";

  await assert.rejects(async () => {
    await capturedParseBillHandler!({
      auth: undefined,
      data: { imageBase64: "abc", mimeType: "image/png" }
    });
  }, /Authentication is required/);
});

test("Cloud Functions - parseUtilityBill rejects missing image data", async () => {
  assert.ok(capturedParseBillHandler, "Handler must be registered");

  await assert.rejects(async () => {
    await capturedParseBillHandler!({
      auth: { uid: "usr_123" },
      data: {}
    });
  }, /imageBase64 and mimeType parameters are required/);
});

test("Cloud Functions - parseUtilityBill parses bill successfully", async () => {
  assert.ok(capturedParseBillHandler, "Handler must be registered");
  process.env.GEMINI_API_KEY = "test-key-123";

  mockGeminiResponse = '{"state":"Maharashtra","billingPeriod":"May 2026","unitsKwh":200}';

  const result = await capturedParseBillHandler!({
    auth: { uid: "usr_123" },
    data: { imageBase64: "base64data", mimeType: "image/jpeg" }
  }) as { data: { state: string; unitsKwh: number } };

  assert.ok(result.data);
  assert.strictEqual(result.data.state, "Maharashtra");
  assert.strictEqual(result.data.unitsKwh, 200);
});

test("Cloud Functions - weeklyDigest scheduled handler", async () => {
  const digestKey = require.resolve("../functions/src/weeklyDigest");
  delete require.cache[digestKey];
  capturedSchedulerHandler = null;

  const originalApps = mockAdmin.apps;
  mockAdmin.apps = [];

  await import("../functions/src/weeklyDigest");

  mockAdmin.apps = originalApps;

  assert.ok(capturedSchedulerHandler, "weeklyDigest handler should be registered");

  // Set up mock weekly docs for the user
  mockWeeklyDocs.length = 0;
  mockUpdatedWeeklyDocs.clear();

  mockWeeklyDocs.push(
    {
      id: "2026-W25",
      data: () => ({ totalCo2eKg: 15.0 })
    },
    {
      id: "2026-W24",
      data: () => ({ totalCo2eKg: 10.0 })
    }
  );

  await (capturedSchedulerHandler as unknown as SchedulerHandler)();

  // The delta should be ((15 - 10) / 10) * 100 = 50%
  assert.ok(mockUpdatedWeeklyDocs.has("2026-W25"), "Latest week should be updated with delta");
  const updatedData = mockUpdatedWeeklyDocs.get("2026-W25");
  assert.strictEqual(updatedData?.deltaFromPriorWeek, 50.0);
});

test("Cloud Functions - weeklyDigest handles empty weekly summaries", async () => {
  assert.ok(capturedSchedulerHandler, "Handler must be registered");

  mockWeeklyDocs.length = 0;
  mockUpdatedWeeklyDocs.clear();

  // Should complete without error even with no data
  await (capturedSchedulerHandler as unknown as SchedulerHandler)();

  assert.strictEqual(mockUpdatedWeeklyDocs.size, 0, "No updates should occur with empty summaries");
});

test("Cloud Functions - weeklyDigest handles single week (no delta)", async () => {
  assert.ok(capturedSchedulerHandler, "Handler must be registered");

  mockWeeklyDocs.length = 0;
  mockUpdatedWeeklyDocs.clear();

  mockWeeklyDocs.push({
    id: "2026-W25",
    data: () => ({ totalCo2eKg: 15.0 })
  });

  await (capturedSchedulerHandler as unknown as SchedulerHandler)();

  // With only 1 week, no delta calculation should happen
  assert.strictEqual(mockUpdatedWeeklyDocs.size, 0, "No delta update with single week");
});

test("Cloud Functions - weeklyDigest scheduled handler with 0 prior week", async () => {
  assert.ok(capturedSchedulerHandler, "Handler must be registered");

  mockWeeklyDocs.length = 0;
  mockUpdatedWeeklyDocs.clear();

  mockWeeklyDocs.push(
    {
      id: "2026-W25",
      data: () => ({ totalCo2eKg: 15.0 })
    },
    {
      id: "2026-W24",
      data: () => ({ totalCo2eKg: 0.0 })
    }
  );

  await (capturedSchedulerHandler as unknown as SchedulerHandler)();

  assert.ok(mockUpdatedWeeklyDocs.has("2026-W25"), "Latest week should be updated");
  const updatedData = mockUpdatedWeeklyDocs.get("2026-W25");
  assert.strictEqual(updatedData?.deltaFromPriorWeek, 0.0);
});

test("Cloud Functions - weeklyDigest handles database fetch error", async () => {
  assert.ok(capturedSchedulerHandler, "Handler must be registered");

  shouldThrowDbError = true;

  // Should catch the error internally and log it, rather than failing
  await (capturedSchedulerHandler as unknown as SchedulerHandler)();

  shouldThrowDbError = false;
});

test("Cloud Functions - parseUtilityBill rejects missing API key", async () => {
  assert.ok(capturedParseBillHandler, "Handler must be registered");

  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  await assert.rejects(async () => {
    await capturedParseBillHandler!({
      auth: { uid: "usr_123" },
      data: { imageBase64: "base64data", mimeType: "image/png" }
    });
  }, /Gemini API key is not configured/);

  process.env.GEMINI_API_KEY = originalKey;
});

test("Cloud Functions - parseUtilityBill handles Gemini empty response", async () => {
  assert.ok(capturedParseBillHandler, "Handler must be registered");
  process.env.GEMINI_API_KEY = "test-key-123";

  const originalResponse = mockGeminiResponse;
  mockGeminiResponse = "";

  await assert.rejects(async () => {
    await capturedParseBillHandler!({
      auth: { uid: "usr_123" },
      data: { imageBase64: "base64data", mimeType: "image/png" }
    });
  }, /Received empty response from Gemini API/);

  mockGeminiResponse = originalResponse;
});

test("Cloud Functions - parseUtilityBill handles Gemini error", async () => {
  assert.ok(capturedParseBillHandler, "Handler must be registered");
  process.env.GEMINI_API_KEY = "test-key-123";

  shouldGeminiThrow = true;

  await assert.rejects(async () => {
    await capturedParseBillHandler!({
      auth: { uid: "usr_123" },
      data: { imageBase64: "base64data", mimeType: "image/png" }
    });
  }, /mock API error/);

  shouldGeminiThrow = false;
});
