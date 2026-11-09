
import { api } from "./api";

export async function simpanPembayaran(antreanId, jumlah, metode) {
  return api("pembayaran/create.php", {
    method: "POST",
    body: JSON.stringify({
      antrean_id: Number(antreanId),
      jumlah: Number(jumlah),
      metode,
    }),
  });
}

export async function ambilPembayaran() {
  const hasil = await api("pembayaran/index.php");
  return hasil.data || [];
}
