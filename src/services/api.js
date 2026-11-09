
let csrfToken = "";

export async function api(path, options = {}) {
  const response = await fetch(`/api/${path}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken
        ? { "X-CSRF-Token": csrfToken }
        : {}),
      ...options.headers,
    },
  });

  const result = await response.json();

  if (result.csrf) {
    csrfToken = result.csrf;
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.message || "Permintaan gagal");
  }

  return result;
}

export async function initSession() {
  return api("auth/me.php");
}
