
import { api } from "./api";

// Mengambil data antrean dari MySQL
export async function getAntreanAdmin() {
  const hasil = await api("antrean/index.php");

  return (hasil.data || []).map((item) => ({
    ...item,
    id: Number(item.id),
    pit_id:
      item.pit_id == null
        ? null
        : Number(item.pit_id),
    nama: item.nama_pelanggan,
    motor: item.motor_nama,
    pit: item.pit_nama || "-",
  }));
}

// Admin menambahkan antrean pelanggan
export async function tambahAntreanAdmin(data) {
  return api("antrean/create.php", {
    method: "POST",
    body: JSON.stringify({
      nama: data.nama,
      hp: data.hp || "",
      motor: data.motor,
      plat: data.plat,
      servis: data.servis,
    }),
  });
}

// Admin memanggil antrean berikutnya
export async function panggilAntreanAdmin() {
  return api("antrean/call-next.php", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// Mengubah status antrean pelanggan
export async function ubahStatusAntrean(
  id,
  status,
  pitId = null
) {
  return api("antrean/status.php", {
    method: "POST",
    body: JSON.stringify({
      id: Number(id),
      status,
      ...(pitId !== null
        ? { pit_id: Number(pitId) }
        : {}),
    }),
  });
}

// Mengambil hanya Pit 1, Pit 2, dan Pit 3
export async function getPitAdmin() {
  const hasil = await api("pit/index.php");

  return (hasil.data || [])
    .map((pit) => ({
      ...pit,
      id: Number(pit.id),
      aktif: Number(pit.aktif),
    }))
    .filter((pit) =>
      [1, 2, 3].includes(pit.id)
    );
}
