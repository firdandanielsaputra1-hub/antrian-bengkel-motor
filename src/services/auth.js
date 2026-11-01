
const USERS_KEY = "bengkel_users";
const SESSION_KEY = "bengkel_session";

// Akun admin khusus untuk demo lokal
const ADMIN_EMAIL = "admin@bengkel.com";
const ADMIN_PASSWORD = "admin123";

function getUsers() {
  try {
    return JSON.parse(
      localStorage.getItem(USERS_KEY) || "[]"
    );
  } catch {
    return [];
  }
}

// Registrasi hanya untuk pelanggan
export function register(nama, email, password, hp = "") {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (!nama.trim() || !normalizedEmail || !hp.trim() || !password) {
    return {
      ok: false,
      error: "Semua kolom wajib diisi."
    };
  }

  if (normalizedEmail === ADMIN_EMAIL) {
    return {
      ok: false,
      error: "Email ini tidak dapat digunakan."
    };
  }

  if (users.some(u => u.email === normalizedEmail)) {
    return {
      ok: false,
      error: "Email sudah terdaftar."
    };
  }

  users.push({
    id: Date.now(),
    nama: nama.trim(),
    email: normalizedEmail,
    hp: hp.trim(),
    password,
    role: "pelanggan"
  });

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  return {
    ok: true,
    message: "Registrasi berhasil."
  };
}

// Login admin dan pelanggan
export function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  // Login khusus admin
  if (
    normalizedEmail === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  ) {
    const admin = {
      id: "admin-001",
      nama: "Administrator",
      email: ADMIN_EMAIL,
      role: "admin"
    };

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(admin)
    );

    return {
      ok: true,
      user: admin
    };
  }

  // Login pelanggan
  const users = getUsers();

  const user = users.find(
    u => u.email === normalizedEmail &&
         u.password === password &&
         u.role === "pelanggan"
  );

  if (!user) {
    return {
      ok: false,
      error: "Email atau kata sandi salah."
    };
  }

  const session = {
    id: user.id,
    nama: user.nama,
    email: user.email,
    hp: user.hp || "",
    role: "pelanggan"
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return {
    ok: true,
    user: session
  };
}

// Mengambil sesi login
export function getSession() {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_KEY) || "null"
    );
  } catch {
    return null;
  }
}

export const getCurrentUser = getSession;

// Logout
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
