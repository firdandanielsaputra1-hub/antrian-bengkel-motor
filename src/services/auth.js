
import { api, initSession } from "./api";

// Login menggunakan PHP + MySQL
export async function login(email, password) {
  try {
    await initSession();

    const res = await api("auth/login.php", {
      method: "POST",
      body: JSON.stringify({
        email,
        password
      })
    });

    return {
      ok: true,
      user: res.user
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Login gagal."
    };
  }
}

// Registrasi customer
export async function register(nama, email, password, hp = "") {
  try {
    await initSession();

    const res = await api("auth/register.php", {
      method: "POST",
      body: JSON.stringify({
        nama,
        email,
        password,
        hp
      })
    });

    return {
      ok: true,
      message: res.message || "Registrasi berhasil."
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Registrasi gagal."
    };
  }
}

// Mengambil sesi dari server
export async function getSession() {
  const res = await initSession();
  return res.user || null;
}

export const getCurrentUser = getSession;

// Logout melalui server
export async function logout() {
  await api("auth/logout.php", {
    method: "POST",
    body: JSON.stringify({})
  });
}
