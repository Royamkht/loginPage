import {
  createStatusBinder,
  errorMessageFromResponse,
} from "./auth_common.js";
import { API_PATHS } from "./api_paths.js";

const form = document.getElementById("forgot_form");
const tokenPanel = document.getElementById("token_panel");
const tokenValueEl = document.getElementById("token_value");
const setStatus = createStatusBinder(
  document.getElementById("status_message"),
  document.getElementById("status_error_list"),
);

function showTokenPanel(token, demoNote) {
  tokenValueEl.textContent = token;
  tokenPanel.hidden = false;
  const resetLink = document.getElementById("reset_link");
  if (resetLink) {
    const username = String(
      document.getElementById("username").value ?? "",
    ).trim();
    const query = new URLSearchParams({ token, username });
    resetLink.href = `/reset.html?${query.toString()}`;
  }
  if (typeof demoNote === "string" && demoNote.length > 0) {
    setStatus(demoNote, "success");
  }
}

function hideTokenPanel() {
  tokenPanel.hidden = true;
  tokenValueEl.textContent = "";
  const resetLink = document.getElementById("reset_link");
  if (resetLink) {
    resetLink.href = "/reset.html";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideTokenPanel();
  setStatus("Sending request…");

  const formData = new FormData(form);
  const username = String(formData.get("username") ?? "").trim();

  try {
    const response = await fetch(API_PATHS.forgetPassword, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.ok) {
      if (typeof data.reset_token === "string" && data.reset_token.length > 0) {
        setStatus(
          typeof data.message === "string" ? data.message : "Reset token issued.",
          "success",
        );
        showTokenPanel(data.reset_token, data.demo_note);
        return;
      }
      setStatus(
        typeof data.message === "string"
          ? data.message
          : "If this account exists, check your email (in production).",
        "success",
      );
      return;
    }

    setStatus(errorMessageFromResponse(data, response), "error");
  } catch {
    setStatus("Network error. Is the server running?", "error");
  }
});
