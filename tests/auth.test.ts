process.env.NEXT_PUBLIC_USE_EMULATORS = "mock";
import test from "node:test";
import assert from "node:assert";

// Mock localStorage and window before importing any firebase services
const mockStore: { [key: string]: string } = {};

// Setup mock window and localStorage
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

// DispatchEvent mock
(global.window as unknown as { dispatchEvent: (event: Event) => boolean }).dispatchEvent = () =>
  true;

test("Auth Service Mock Mode - Sign Up", async () => {
  const { signUpUser } = await import("../lib/firebase/authService");
  localStorage.clear();

  // Test successful sign up
  const cred = await signUpUser("newuser@example.com", "securepwd");
  assert.ok(cred.user.uid.startsWith("usr_"));
  assert.strictEqual(cred.user.email, "newuser@example.com");

  // Verify stored data
  const registeredRaw = localStorage.getItem("mock_registered_users");
  assert.ok(registeredRaw);
  const registered = JSON.parse(registeredRaw);
  assert.strictEqual(registered.length, 1);
  assert.strictEqual(registered[0].email, "newuser@example.com");

  const currentRaw = localStorage.getItem("mock_current_user");
  assert.ok(currentRaw);
  const currentUser = JSON.parse(currentRaw);
  assert.strictEqual(currentUser.email, "newuser@example.com");

  // Test duplicate email sign up
  await assert.rejects(
    async () => {
      await signUpUser("newuser@example.com", "otherpwd");
    },
    (err: unknown) => {
      return (err as { code?: string }).code === "auth/email-already-in-use";
    }
  );
});

test("Auth Service Mock Mode - Sign In", async () => {
  const { signInUser } = await import("../lib/firebase/authService");
  localStorage.clear();

  // Seed a registered user
  const seededUser = { uid: "usr_123", email: "existing@example.com", password: "pwd" };
  localStorage.setItem("mock_registered_users", JSON.stringify([seededUser]));

  // Test successful sign in
  const cred = await signInUser("existing@example.com", "pwd");
  assert.strictEqual(cred.user.uid, "usr_123");
  assert.strictEqual(cred.user.email, "existing@example.com");

  const currentRaw = localStorage.getItem("mock_current_user");
  assert.ok(currentRaw);
  const currentUser = JSON.parse(currentRaw);
  assert.strictEqual(currentUser.uid, "usr_123");

  // Test sign in with invalid password
  await assert.rejects(
    async () => {
      await signInUser("existing@example.com", "wrongpwd");
    },
    (err: unknown) => {
      return (err as { code?: string }).code === "auth/invalid-credential";
    }
  );

  // Test sign in with non-existent email
  await assert.rejects(
    async () => {
      await signInUser("nonexistent@example.com", "pwd");
    },
    (err: unknown) => {
      return (err as { code?: string }).code === "auth/invalid-credential";
    }
  );
});

test("Auth Service Mock Mode - Logout", async () => {
  const { logoutUser } = await import("../lib/firebase/authService");
  localStorage.clear();

  // Seed an active session
  localStorage.setItem(
    "mock_current_user",
    JSON.stringify({ uid: "usr_123", email: "user@example.com" })
  );

  // Run logout
  await logoutUser();

  // Verify session is cleared
  const current = localStorage.getItem("mock_current_user");
  assert.strictEqual(current, null);
});
