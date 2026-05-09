import { randomBytes } from "node:crypto";
import {
  DEMO_USER,
  getPasswordPolicyViolations,
  getUsernameViolation,
  normalizeUsername,
} from "./auth_policy.js";

const users = new Map();
/** token -> { usernameNorm, expiresAt } */
const resetRecords = new Map();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function seedDemoUser() {
  const key = normalizeUsername(DEMO_USER.username);
  users.set(key, { password: DEMO_USER.password });
}

seedDemoUser();

export function resetUserStoreForTests() {
  users.clear();
  resetRecords.clear();
  seedDemoUser();
}

function randomResetToken() {
  return randomBytes(24).toString("hex");
}

export function registerUser(rawUsername, password) {
  const usernameError = getUsernameViolation(rawUsername);
  if (usernameError) {
    return { ok: false, error: usernameError };
  }
  const usernameNorm = normalizeUsername(rawUsername);
  if (users.has(usernameNorm)) {
    return { ok: false, error: "username is already taken" };
  }
  const violations = getPasswordPolicyViolations(password);
  if (violations.length > 0) {
    return { ok: false, password_errors: violations };
  }
  users.set(usernameNorm, { password });
  return { ok: true, username: usernameNorm };
}

export function checkCredentials(rawUsername, password) {
  const usernameNorm = normalizeUsername(rawUsername);
  const row = users.get(usernameNorm);
  if (!row) {
    return false;
  }
  return row.password === password;
}

/**
 * Demo flow: returns a token when the user exists (no email).
 * In production you would email a link instead of returning the token.
 */
export function requestPasswordReset(rawUsername) {
  const usernameNorm = normalizeUsername(rawUsername);
  if (!users.has(usernameNorm)) {
    return { ok: true, userExists: false };
  }
  const token = randomResetToken();
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  resetRecords.set(token, { usernameNorm, expiresAt });
  return { ok: true, userExists: true, reset_token: token };
}

export function completePasswordReset(rawUsername, token, newPassword) {
  if (typeof token !== "string" || !token.trim()) {
    return { ok: false, error: "invalid or expired reset token" };
  }
  const rec = resetRecords.get(token.trim());
  if (!rec || rec.expiresAt < Date.now()) {
    return { ok: false, error: "invalid or expired reset token" };
  }
  const usernameNorm = normalizeUsername(rawUsername);
  if (rec.usernameNorm !== usernameNorm) {
    return { ok: false, error: "invalid or expired reset token" };
  }
  const violations = getPasswordPolicyViolations(newPassword);
  if (violations.length > 0) {
    return { ok: false, password_errors: violations };
  }
  users.set(usernameNorm, { password: newPassword });
  resetRecords.delete(token.trim());
  return { ok: true };
}
