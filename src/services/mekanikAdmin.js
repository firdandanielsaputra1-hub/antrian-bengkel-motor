import { api, initSession } from "./api";

// Mengambil daftar mekanik dari MySQL
export async function getDaftarMekanik() {
  const res = await api("mekanik/list.php");
  return res.mekanik || [];
}

// Admin membuat akun mekanik
export async function tambahMekanik(data) {
  await initSession();

  return api("mekanik/create.php", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
