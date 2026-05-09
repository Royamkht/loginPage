export function createStatusBinder(statusEl, passwordErrorListEl) {
  function clearPasswordErrorList() {
    passwordErrorListEl.replaceChildren();
    passwordErrorListEl.hidden = true;
  }

  function setPasswordErrorList(messages) {
    clearPasswordErrorList();
    if (!Array.isArray(messages) || messages.length === 0) {
      return;
    }
    passwordErrorListEl.hidden = false;
    for (const text of messages) {
      const item = document.createElement("li");
      item.textContent = text;
      passwordErrorListEl.appendChild(item);
    }
  }

  return function setStatus(message, variant, options = {}) {
    const { passwordErrors } = options;
    statusEl.textContent = message;
    statusEl.classList.remove("is_success", "is_error");
    clearPasswordErrorList();

    if (variant === "success") {
      statusEl.classList.add("is_success");
      return;
    }

    if (variant === "error") {
      statusEl.classList.add("is_error");
      setPasswordErrorList(passwordErrors);
    }
  };
}

export function passwordErrorsFromResponse(data) {
  return Array.isArray(data.password_errors)
    ? data.password_errors.filter((x) => typeof x === "string")
    : [];
}

export function errorMessageFromResponse(data, response) {
  if (typeof data.error === "string") {
    return data.error;
  }
  return `Request failed (${response.status})`;
}
