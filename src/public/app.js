import {
  createStatusBinder,
  passwordErrorsFromResponse,
  errorMessageFromResponse,
} from "./auth_common.js";
import { API_PATHS } from "./api_paths.js";

const form = document.getElementById("login_form");
const setStatus = createStatusBinder(
  document.getElementById("status_message"),
  document.getElementById("status_error_list"),
);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Signing in…");

  const formData = new FormData(form);
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const response = await fetch(API_PATHS.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.ok) {
      setStatus(`Welcome, ${data.user?.username ?? username}.`, "success");
      return;
    }

    setStatus(errorMessageFromResponse(data, response), "error", {
      passwordErrors: passwordErrorsFromResponse(data),
    });
  } catch {
    setStatus("Network error. Is the server running?", "error");
  }
});
