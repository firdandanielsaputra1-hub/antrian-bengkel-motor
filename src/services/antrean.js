
import { api } from "./api";

export async function buatAntrean(data) {
  return api("antrean/create.php", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function ambilDaftarAntrean(tanggal = "") {
  const query = tanggal
    ? `?tanggal=${encodeURIComponent(tanggal)}`
    : "";

  return api(`antrean/index.php${query}`);
}
