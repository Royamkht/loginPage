/** Demo credentials for local testing and API examples */
export const DEMO_USER = {
  username: "demo",
  password: "Demo12345",
};

export const PASSWORD_POLICY = {
  minLength: 8,
  messages: {
    minLength: "password must be at least 8 characters",
    uppercase: "password must include at least one capital letter",
    digit: "password must include at least one number",
  },
};

/**
 * Returns policy violation messages (empty if password satisfies all rules).
 */
export function getPasswordPolicyViolations(password) {
  const { messages } = PASSWORD_POLICY;
  const violations = [];

  if (typeof password !== "string" || password.length < PASSWORD_POLICY.minLength) {
    violations.push(messages.minLength);
  }
  if (typeof password !== "string" || !/[A-Z]/.test(password)) {
    violations.push(messages.uppercase);
  }
  if (typeof password !== "string" || !/\d/.test(password)) {
    violations.push(messages.digit);
  }

  return violations;
}

export const USERNAME_RULES = {
  minLength: 3,
  message: "username must be at least 3 characters",
};

export function normalizeUsername(raw) {
  return String(raw ?? "").trim().toLowerCase();
}

export function getUsernameViolation(rawUsername) {
  const normalized = normalizeUsername(rawUsername);
  if (normalized.length < USERNAME_RULES.minLength) {
    return USERNAME_RULES.message;
  }
  return null;
}
