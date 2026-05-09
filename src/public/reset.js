import {
  createStatusBinder,
  passwordErrorsFromResponse,
  errorMessageFromResponse,
} from "./auth_common.js";
import { API_PATHS } from "./api_paths.js";

const form = document.getElementById("reset_form");
const setStatus = createStatusBinder(
  document.getElementById("status_message"),
  document.getElementById("status_error_list"),
);

const params = new URLSearchParams(window.location.search);
const tokenInput = document.getElementById("token");
const usernameInput = document.getElementById("username");
const tokenFromQuery = params.get("token");
const userFromQuery = params.get("username");
if (tokenFromQuery) {
  tokenInput.value = tokenFromQuery;
}
if (userFromQuery) {
  usernameInput.value = userFromQuery;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Updating password…");

  const formData = new FormData(form);
  const username = String(formData.get("username") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("new_password") ?? "");

  try {
    const response = await fetch(API_PATHS.resetPassword, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        token,
        new_password: newPassword,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.ok) {
      setStatus(
        typeof data.message === "string"
          ? data.message
          : "Password updated.",
        "success",
      );
      return;
    }

    setStatus(errorMessageFromResponse(data, response), "error", {
      passwordErrors: passwordErrorsFromResponse(data),
    });
  } catch {
    setStatus("Network error. Is the server running?", "error");
  }
});
