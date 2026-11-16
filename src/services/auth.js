
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
// LOGOUT - CEGAH PERMINTAAN GANDA
// =====================================
let prosesLogout = null;

async function jalankanLogout() {
  // Maksimal dua percobaan jika token berubah
  for (let percobaan = 0; percobaan < 2; percobaan++) {

    // 1. Ambil CSRF terbaru langsung dari PHP
    const responseSesi = await fetch("/api/auth/me.php", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!responseSesi.ok) {
      throw new Error("Gagal mengambil sesi terbaru.");
    }

    const sesi = await responseSesi.json();

    // Jika sesi sudah berakhir, Logout dianggap selesai
    if (!sesi.user) {
      return {
        ok: true,
        message: "Sesi sudah berakhir.",
      };
    }

    const token = sesi.csrf;

    if (!token) {
      throw new Error("Token CSRF tidak tersedia.");
    }

    // 2. Kirim Logout dengan token terbaru
    const responseLogout = await fetch("/api/auth/logout.php", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token,
      },
      body: JSON.stringify({}),
    });

    const hasil = await responseLogout.json().catch(() => null);

    // 3. Jika berhasil
    if (responseLogout.ok && hasil?.ok === true) {
      return hasil;
    }

    const pesan = hasil?.message || "Logout gagal.";

    // 4. Jika token tidak valid, coba sekali lagi
    const tokenBermasalah =
      responseLogout.status === 403 ||
      responseLogout.status === 419 ||
      pesan.toLowerCase().includes("csrf");

    if (tokenBermasalah && percobaan === 0) {
      continue;
    }

    throw new Error(pesan);
  }

  throw new Error("Logout gagal. Silakan coba kembali.");
}

// =====================================
// FUNGSI LOGOUT UTAMA
// =====================================
export function logout() {
  // Mencegah Logout dipanggil dua kali bersamaan
  if (prosesLogout) {
    return prosesLogout;
  }

  prosesLogout = jalankanLogout().finally(() => {
    prosesLogout = null;
  });

  return prosesLogout;
}
