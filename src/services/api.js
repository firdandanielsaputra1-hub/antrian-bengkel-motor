
let csrfToken = "";

export async function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  const response = await fetch(`/api/${path}`, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(method !== "GET" && csrfToken
        ? { "X-CSRF-Token": csrfToken }
        : {}),
      ...options.headers,
    },
  });

  const result = await response.json();

  // Simpan token terbaru dari server
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
