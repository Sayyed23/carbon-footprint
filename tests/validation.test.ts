/**
 * Unit tests for input validation and sanitization utilities.
 */
import test from "node:test";
import assert from "node:assert";
import {
  sanitizeTextInput,
  isValidEmail,
  validatePassword,
  clampNumber,
  checkRateLimit,
  resetRateLimit,
} from "../lib/validation";

// ──────────────────────────────────────────────────────
// sanitizeTextInput
// ──────────────────────────────────────────────────────

test("Validation - sanitizeTextInput strips HTML tags", () => {
  assert.strictEqual(
    sanitizeTextInput('<script>alert("xss")</script>Hello'),
    'alert(&quot;xss&quot;)Hello'
  );
});

test("Validation - sanitizeTextInput encodes special characters", () => {
  const result = sanitizeTextInput('Test & <bold> "quotes"');
  assert.ok(!result.includes("<bold>"));
  assert.ok(result.includes("&amp;"));
  assert.ok(result.includes("&quot;"));
});

test("Validation - sanitizeTextInput handles empty and non-string inputs", () => {
  assert.strictEqual(sanitizeTextInput(""), "");
  assert.strictEqual(sanitizeTextInput(null as unknown as string), "");
  assert.strictEqual(sanitizeTextInput(undefined as unknown as string), "");
  assert.strictEqual(sanitizeTextInput(123 as unknown as string), "");
});

test("Validation - sanitizeTextInput trims whitespace", () => {
  assert.strictEqual(sanitizeTextInput("  hello  "), "hello");
});

// ──────────────────────────────────────────────────────
// isValidEmail
// ──────────────────────────────────────────────────────

test("Validation - isValidEmail accepts valid emails", () => {
  assert.strictEqual(isValidEmail("user@example.com"), true);
  assert.strictEqual(isValidEmail("test.name@domain.co.in"), true);
  assert.strictEqual(isValidEmail("user+tag@gmail.com"), true);
});

test("Validation - isValidEmail rejects invalid emails", () => {
  assert.strictEqual(isValidEmail(""), false);
  assert.strictEqual(isValidEmail("notanemail"), false);
  assert.strictEqual(isValidEmail("@domain.com"), false);
  assert.strictEqual(isValidEmail("user@"), false);
  assert.strictEqual(isValidEmail("user@.com"), false);
  assert.strictEqual(isValidEmail(null as unknown as string), false);
});

// ──────────────────────────────────────────────────────
// validatePassword
// ──────────────────────────────────────────────────────

test("Validation - validatePassword checks length requirements", () => {
  const tooShort = validatePassword("abc");
  assert.strictEqual(tooShort.isValid, false);
  assert.ok(tooShort.message.includes("6 characters"));

  const valid = validatePassword("securepassword");
  assert.strictEqual(valid.isValid, true);
  assert.strictEqual(valid.message, "");

  const empty = validatePassword("");
  assert.strictEqual(empty.isValid, false);

  const nullInput = validatePassword(null as unknown as string);
  assert.strictEqual(nullInput.isValid, false);
});

test("Validation - validatePassword rejects excessively long passwords", () => {
  const tooLong = validatePassword("a".repeat(129));
  assert.strictEqual(tooLong.isValid, false);
  assert.ok(tooLong.message.includes("128"));
});

// ──────────────────────────────────────────────────────
// clampNumber
// ──────────────────────────────────────────────────────

test("Validation - clampNumber clamps values correctly", () => {
  assert.strictEqual(clampNumber(5, 1, 10), 5);
  assert.strictEqual(clampNumber(0, 1, 10), 1);
  assert.strictEqual(clampNumber(15, 1, 10), 10);
  assert.strictEqual(clampNumber(NaN, 1, 10), 1);
  assert.strictEqual(clampNumber("abc" as unknown as number, 1, 10), 1);
});

// ──────────────────────────────────────────────────────
// checkRateLimit
// ──────────────────────────────────────────────────────

test("Validation - checkRateLimit allows requests within limits", () => {
  resetRateLimit("test-key");
  
  // Should allow up to maxRequests
  assert.strictEqual(checkRateLimit("test-key", 3, 60_000), true);
  assert.strictEqual(checkRateLimit("test-key", 3, 60_000), true);
  assert.strictEqual(checkRateLimit("test-key", 3, 60_000), true);

  // 4th request should be blocked
  assert.strictEqual(checkRateLimit("test-key", 3, 60_000), false);
  
  // Different key should still work
  resetRateLimit("other-key");
  assert.strictEqual(checkRateLimit("other-key", 3, 60_000), true);
  
  // Clean up
  resetRateLimit("test-key");
  resetRateLimit("other-key");
});

test("Validation - resetRateLimit clears state", () => {
  resetRateLimit("reset-test");
  checkRateLimit("reset-test", 1, 60_000);
  assert.strictEqual(checkRateLimit("reset-test", 1, 60_000), false);
  
  resetRateLimit("reset-test");
  assert.strictEqual(checkRateLimit("reset-test", 1, 60_000), true);
  
  resetRateLimit("reset-test");
});
