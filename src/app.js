import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  getUsernameViolation,
  getPasswordPolicyViolations,
  normalizeUsername,
} from "./auth_policy.js";
import {
  registerUser,
  checkCredentials,
  requestPasswordReset,
  completePasswordReset,
} from "./user_store.js";
import { API_PATHS } from "./public/api_paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));``

export {
  DEMO_USER,
  PASSWORD_POLICY,
  getPasswordPolicyViolations,
} from "./auth_policy.js";

export { resetUserStoreForTests } from "./user_store.js";

export { API_PATHS };

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));

  app.get(API_PATHS.health, (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post(API_PATHS.signUp, (req, res) => {
    const { username, password } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        ok: false,
        error: "username and password are required",
      });
    }

    const result = registerUser(username, password);
    if (!result.ok) {
      if (result.password_errors) {
        return res.status(400).json({
          ok: false,
          error: "password does not meet requirements",
          password_errors: result.password_errors,
        });
      }
      return res.status(400).json({
        ok: false,
        error: result.error,
      });
    }

    return res.status(201).json({
      ok: true,
      user: { username: result.username },
    });
  });

  app.post(API_PATHS.login, (req, res) => {
    const { username, password } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        ok: false,
        error: "username and password are required",
      });
    }

    const usernameError = getUsernameViolation(username);
    if (usernameError) {
      return res.status(400).json({
        ok: false,
        error: usernameError,
      });
    }

    const passwordViolations = getPasswordPolicyViolations(password);
    if (passwordViolations.length > 0) {
      return res.status(400).json({
        ok: false,
        error: "password does not meet requirements",
        password_errors: passwordViolations,
      });
    }

    if (checkCredentials(username, password)) {
      return res.json({
        ok: true,
        token: "demo-session-token",
        user: { username: normalizeUsername(username) },
      });
    }

    return res.status(401).json({
      ok: false,
      error: "invalid username or password",
    });
  });

  app.post(API_PATHS.forgetPassword, (req, res) => {
    const { username } = req.body ?? {};

    if (typeof username !== "string" || !username.trim()) {
      return res.status(400).json({
        ok: false,
        error: "username is required",
      });
    }

    const result = requestPasswordReset(username);
    const genericMessage =
      "If this account exists, you can set a new password using the reset page.";

    if (!result.userExists) {
      return res.status(404).json({
        ok: false,
        error: "Your username is unknown.",
      });
    }

    return res.json({
      ok: true,
      message: genericMessage,
      reset_token: result.reset_token,
      demo_note:
        "Demo only: copy this token into the reset form. Real apps email a link instead.",
    });
  });

  app.post(API_PATHS.resetPassword, (req, res) => {
    const { username, token, new_password } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof token !== "string" ||
      typeof new_password !== "string" ||
      !username.trim() ||
      !token.trim() ||
      !new_password
    ) {
      return res.status(400).json({
        ok: false,
        error: "username, token, and new_password are required",
      });
    }

    const result = completePasswordReset(username, token, new_password);
    if (!result.ok) {
      if (result.password_errors) {
        return res.status(400).json({
          ok: false,
          error: "password does not meet requirements",
          password_errors: result.password_errors,
        });
      }
      return res.status(400).json({
        ok: false,
        error: result.error,
      });
    }

    return res.json({
      ok: true,
      message: "password updated. you can sign in with your new password.",
    });
  });

  return app;
}
