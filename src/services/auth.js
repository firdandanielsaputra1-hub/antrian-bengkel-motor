const USERS_KEY = "bengkel_users";
const SESSION_KEY = "bengkel_session";

// Akun admin dibuat di sini, bukan lewat form Daftar.
// GANTI email dan sandinya sebelum dipakai sungguhan.
const seedUsers = [
  { id: 1, nama: "Admin Bengkel", email: "admin@bengkel.com", hp: "", pass: "admin12345", role: "admin" },
];

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }
  return JSON.parse(raw);
}

export function register({ nama, email, hp, pass }) {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "Email sudah terdaftar. Silakan masuk." };
  }
  // Pendaftaran publik SELALU menjadi pelanggan
  const user = { id: Date.now(), nama, email, hp, pass, role: "pelanggan" };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return { ok: true };
}

export function login(email, pass) {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.pass === pass
  );
  if (!user) return { ok: false, error: "Email atau kata sandi salah." };
  const { pass: _, ...safe } = user; // jangan simpan sandi di sesi
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  return { ok: true, user: safe };
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}