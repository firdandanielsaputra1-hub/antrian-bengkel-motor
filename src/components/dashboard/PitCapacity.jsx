
import { Store } from "lucide-react";
import { NAVY } from "../../constants/theme";

const PIT_UTAMA = ["Pit 1", "Pit 2", "Pit 3"];

export default function PitCapacity({
  queues = [],
  pitCadangan = false,
  onTogglePitCadangan
}) {
  const today = new Date().toLocaleDateString("en-CA");

  const daftarPit = pitCadangan
    ? [...PIT_UTAMA, "Pit 4"]
    : PIT_UTAMA;

  const antreanHariIni = queues.filter(
    (q) => q.tanggal === today
  );

  const pitData = daftarPit.map((pit) => {
    const antrean = antreanHariIni.find(
      (q) =>
        q.pit === pit &&
        q.status === "Sedang Dilayani"
    );

    return {
      pit,
      antrean,
      status: antrean ? "Terisi" : "Kosong"
    };
  });

  const jumlahTerisi = pitData.filter(
    (p) => p.status === "Terisi"
  ).length;

  return (
    <section className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Store size={18} style={{ color: NAVY }} />
          Kapasitas Pit Mekanik
        </h3>

        <span className="text-xs text-neutral-600">
          {jumlahTerisi} dari {daftarPit.length} Terisi
        </span>
      </div>

      <div className="space-y-3">
        {pitData.map((p) => (
          <div
            key={p.pit}
            className="bg-stone-100 rounded-xl p-4 text-sm"
          >
            <div className="flex justify-between items-center gap-2">
              <b>
                <span
                  className={
                    p.antrean
                      ? "text-violet-600"
                      : "text-emerald-600"
                  }
                >
                  ●
                </span>{" "}
                {p.pit}
                <span className="font-normal text-xs text-neutral-600">
                  {" "}• Mekanik belum ditentukan
                </span>
              </b>

              <span
                className={`text-[11px] rounded-full px-2.5 py-0.5 ${
                  p.antrean
                    ? "bg-violet-100 text-violet-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {p.status}
              </span>
            </div>

            <div className="flex justify-between gap-2 text-xs text-neutral-700 mt-2">
              <span>
                {p.antrean
                  ? `${p.antrean.motor || "Motor"} • ${p.antrean.plat}`
                  : "Belum ada kendaraan"}
              </span>

              <span>
                {p.antrean
                  ? p.antrean.servis
                  : "Siap menerima servis"}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    p.antrean
                      ? "bg-violet-600"
                      : "bg-emerald-500"
                  }`}
                  style={{
                    width: p.antrean ? "100%" : "0%"
                  }}
                />
              </div>

              <span className="text-xs">
                {p.antrean ? "Sedang servis" : "Tersedia"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center gap-3 text-xs mt-5 text-neutral-600">
        <span>
          {jumlahTerisi === daftarPit.length
            ? "Semua pit sedang digunakan"
            : `${daftarPit.length - jumlahTerisi} pit tersedia`}
        </span>

        <button
          type="button"
          onClick={onTogglePitCadangan}
          className="font-semibold"
          style={{ color: NAVY }}
        >
          {pitCadangan
            ? "⊖ Tutup Pit Cadangan (Pit 4)"
            : "⊕ Buka Pit Cadangan (Pit 4)"}
        </button>
      </div>
    </section>
  );
}
