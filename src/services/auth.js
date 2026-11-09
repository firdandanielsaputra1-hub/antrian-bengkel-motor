
import { api, initSession } from "./api";

// =====================================
// LOGIN MENGGUNAKAN PHP + MYSQL
// =====================================
export async function login(email, password) {
  try {
    await initSession();

    const res = await api("auth/login.php", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    return {
      ok: true,
      user: res.user,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Login gagal.",
    };
  }
}

// =====================================
// REGISTRASI CUSTOMER
// =====================================
export async function register(nama, email, password, hp = "") {
  try {
    await initSession();

    const res = await api("auth/register.php", {
      method: "POST",
      body: JSON.stringify({
        nama,
        email,
        password,
        hp,
      }),
    });

    return {
      ok: true,
      message: res.message || "Registrasi berhasil.",
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Registrasi gagal.",
    };
  }
}

// =====================================
// MENGAMBIL SESI DARI SERVER
// =====================================
export async function getSession() {
  const res = await initSession();
  return res.user || null;
}

export const getCurrentUser = getSession;

// =====================================
// LOGOUT DENGAN TOKEN CSRF TERBARU
// =====================================
export async function logout() {
  try {
    // Ambil token CSRF terbaru dari PHP
    await initSession();

    // Kirim permintaan logout ke server
    const res = await api("auth/logout.php", {
      method: "POST",
      body: JSON.stringify({}),
    });

    return res;
  } catch (error) {
    console.error("Logout gagal:", error);
    throw error;
  }
}
