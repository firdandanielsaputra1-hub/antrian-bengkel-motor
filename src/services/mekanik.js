
import { api } from "./api";

export async function getPitMekanik() {
  const res = await api("mekanik/pits.php");
  return res.pits || [];
}

export async function getAntreanMekanik() {
  return api("mekanik/antrean.php");
}

export async function getProgresMekanik() {
  const res = await api("mekanik/progres.php");
  return res.progres || [];
}

export async function aksiPekerjaanMekanik(
  antreanId,
  aksi,
  catatan = ""
) {
  return api("mekanik/pekerjaan.php", {
    method: "POST",
    body: JSON.stringify({
      antrean_id: antreanId,
      aksi,
      catatan,
    }),
  });
}
