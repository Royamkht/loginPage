import {
  createStatusBinder,
  passwordErrorsFromResponse,
  errorMessageFromResponse,
} from "./auth_common.js";
import { API_PATHS } from "./api_paths.js";

const form = document.getElementById("signup_form");
const setStatus = createStatusBinder(
  document.getElementById("status_message"),
  document.getElementById("status_error_list"),
);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Creating account…");

  const formData = new FormData(form);
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (password !== passwordConfirm) {
    setStatus("Passwords do not match.", "error");
    return;
  }

  try {
    const response = await fetch(API_PATHS.signUp, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.ok) {
      setStatus("Account created. You can sign in now.", "success");
      return;
    }

    setStatus(errorMessageFromResponse(data, response), "error", {
      passwordErrors: passwordErrorsFromResponse(data),
    });
  } catch {
    setStatus("Network error. Is the server running?", "error");
  }
});
