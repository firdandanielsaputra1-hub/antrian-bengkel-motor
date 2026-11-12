
import { useCallback, useEffect, useState } from "react";
import {
  Bike,
  Wrench,
  ClipboardList,
  Package,
  History,
  LogOut,
  RefreshCw,
} from "lucide-react";

import {
  getPitMekanik,
  getAntreanMekanik,
  getProgresMekanik,
  aksiPekerjaanMekanik,
} from "../services/mekanik";

const menu = [
  { nama: "Antrean Pit", icon: ClipboardList },
  { nama: "Pekerjaan Aktif", icon: Wrench },
  { nama: "Suku Cadang", icon: Package },
  { nama: "Riwayat", icon: History },
];

function KartuPekerjaan({
  pekerjaan,
  milikSaya,
  progres,
  catatan,
  onCatatanChange,
  onAksi,
  memproses,
}) {
  const dataProgres = progres.find(
    (p) => Number(p.antrean_id) === Number(pekerjaan.id)
  );

  const statusPekerjaan =
    dataProgres?.status_pekerjaan || "Belum Dimulai";

  const dapatDikelola =
    milikSaya && pekerjaan.status === "Sedang Dilayani";

  const sibuk = memproses !== null;

  return (
    <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
      <div className="flex justify-between items-center gap-2">
        <span className="font-bold text-slate-900">
          {pekerjaan.nomor || `#${pekerjaan.id}`}
        </span>

        <span
          className={`text-xs px-3 py-1 rounded-full ${
            pekerjaan.status === "Selesai"
              ? "bg-green-100 text-green-700"
              : pekerjaan.status === "Sedang Dilayani"
              ? "bg-orange-100 text-orange-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {pekerjaan.status}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <p className="font-semibold">
          {pekerjaan.nama_pelanggan}
        </p>

        <p className="text-sm text-neutral-500">
          {pekerjaan.motor_nama} - {pekerjaan.plat}
        </p>

        <p className="text-sm">
          Servis: {pekerjaan.servis}
        </p>
      </div>

      {milikSaya && (
        <div className="mt-3 pt-3 border-t border-stone-200">
          <span className="text-xs font-semibold text-orange-600">
            Pekerjaan pada pit Anda
          </span>
        </div>
      )}

      {dapatDikelola && (
        <div className="mt-4 border-t border-stone-200 pt-4 space-y-3">
          <p className="text-sm font-semibold">
            Status pengerjaan: {statusPekerjaan}
          </p>

          <label
            className="block text-sm font-medium"
            htmlFor={`catatan-${pekerjaan.id}`}
          >
            Catatan mekanik
          </label>

          <textarea
            id={`catatan-${pekerjaan.id}`}
            className="w-full rounded-lg border border-stone-300 bg-white p-3 text-sm"
            placeholder="Tulis hasil pemeriksaan atau tindakan servis..."
            rows={3}
            maxLength={5000}
            value={
              catatan[pekerjaan.id] ??
              dataProgres?.catatan ??
              ""
            }
            onChange={(e) =>
              onCatatanChange(pekerjaan.id, e.target.value)
            }
            disabled={sibuk}
          />

          <p className="text-xs text-neutral-500">
            Catatan tersimpan saat menekan Jeda,
            Lanjutkan, atau Selesai.
          </p>

          <div className="flex flex-wrap gap-2">
            {statusPekerjaan === "Belum Dimulai" && (
              <button
                type="button"
                disabled={sibuk}
                onClick={() =>
                  onAksi(pekerjaan.id, "mulai")
                }
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Mulai Pekerjaan
              </button>
            )}

            {statusPekerjaan === "Berjalan" && (
              <>
                <button
                  type="button"
                  disabled={sibuk}
                  onClick={() =>
                    onAksi(pekerjaan.id, "jeda")
                  }
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  Jeda
                </button>

                <button
                  type="button"
                  disabled={sibuk}
                  onClick={() =>
                    onAksi(pekerjaan.id, "selesai")
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  Selesai
                </button>
              </>
            )}

            {statusPekerjaan === "Dijeda" && (
              <button
                type="button"
                disabled={sibuk}
                onClick={() =>
                  onAksi(pekerjaan.id, "lanjutkan")
                }
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Lanjutkan
              </button>
            )}
          </div>
        </div>
      )}

      {milikSaya &&
        pekerjaan.status === "Selesai" &&
        dataProgres?.catatan && (
          <div className="mt-3 border-t border-stone-200 pt-3">
            <p className="text-xs font-semibold">
              Catatan servis:
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {dataProgres.catatan}
            </p>
          </div>
        )}
    </div>
  );
}

export default function MekanikDashboard({ user, onLogout }) {
  const [active, setActive] = useState("Antrean Pit");
  const [pits, setPits] = useState([]);
  const [antrean, setAntrean] = useState([]);
  const [pitSaya, setPitSaya] = useState(null);
  const [progres, setProgres] = useState([]);
  const [catatan, setCatatan] = useState({});
  const [memproses, setMemproses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const muatPit = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dataPit, dataAntrean, dataProgres] =
        await Promise.all([
          getPitMekanik(),
          getAntreanMekanik(),
          getProgresMekanik(),
        ]);

      setPits(dataPit);
      setAntrean(dataAntrean.antrean || []);
      setPitSaya(Number(dataAntrean.pit_saya));
      setProgres(dataProgres);

      setCatatan((sebelumnya) => {
        const berikutnya = { ...sebelumnya };

        dataProgres.forEach((item) => {
          if (berikutnya[item.antrean_id] === undefined) {
            berikutnya[item.antrean_id] =
              item.catatan || "";
          }
        });

        return berikutnya;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    muatPit();
  }, [muatPit]);

  const ubahCatatan = (id, nilai) => {
    setCatatan((sebelumnya) => ({
      ...sebelumnya,
      [id]: nilai,
    }));
  };

  const jalankanAksi = async (antreanId, aksi) => {
    if (memproses !== null) return;

    if (aksi === "selesai") {
      const yakin = window.confirm(
        "Yakin pekerjaan sudah selesai? Status antrean akan menjadi Selesai."
      );

      if (!yakin) return;
    }

    try {
      setMemproses(antreanId);

      await aksiPekerjaanMekanik(
        antreanId,
        aksi,
        catatan[antreanId] || ""
      );

      await muatPit();

      alert("Pekerjaan berhasil diperbarui.");
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setMemproses(null);
    }
  };

  const pekerjaanAktif = antrean.filter(
    (a) =>
      Number(a.pit_id) === Number(pitSaya) &&
      a.status === "Sedang Dilayani"
  );

  const riwayat = antrean.filter(
    (a) =>
      Number(a.pit_id) === Number(pitSaya) &&
      a.status === "Selesai"
  );

  const renderKartu = (a, milikSaya) => (
    <KartuPekerjaan
      key={a.id}
      pekerjaan={a}
      milikSaya={milikSaya}
      progres={progres}
      catatan={catatan}
      onCatatanChange={ubahCatatan}
      onAksi={jalankanAksi}
      memproses={memproses}
    />
  );

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900">
      {/* HEADER */}
      <header className="bg-slate-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Bike size={28} className="text-orange-400" />

            <div>
              <h1 className="font-bold text-lg">
                Bengkel Motor
              </h1>
              <p className="text-xs text-slate-300">
                Dashboard Mekanik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">
                {user.nama}
              </p>
              <p className="text-xs text-orange-300">
                Mekanik Pit {pitSaya || user.pit_nomor}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg text-sm hover:bg-slate-600"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-5 space-y-6">
        {/* MENU */}
        <nav className="flex flex-wrap gap-2">
          {menu.map(({ nama, icon: Icon }) => (
            <button
              key={nama}
              onClick={() => setActive(nama)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                active === nama
                  ? "bg-orange-500 text-white"
                  : "bg-white border border-stone-200 hover:bg-stone-100"
              }`}
            >
              <Icon size={17} />
              {nama}
            </button>
          ))}
        </nav>

        {/* JUDUL */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-2xl font-extrabold">
              {active}
            </h2>

            <p className="text-sm text-neutral-500 mt-1">
              Selamat bekerja, {user.nama}. Anda bertugas
              di Pit {pitSaya || user.pit_nomor}.
            </p>
          </div>

          <button
            onClick={muatPit}
            disabled={loading || memproses !== null}
            className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading && (
          <p className="text-sm text-neutral-500">
            Memuat data dari database...
          </p>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            Gagal memuat data: {error}
          </div>
        )}

        {/* ANTREAN PIT */}
        {active === "Antrean Pit" && (
          <section className="space-y-5">
            <div className="grid gap-5 md:grid-cols-3">
              {pits.map((pit) => {
                const daftar = antrean.filter(
                  (a) =>
                    Number(a.pit_id) ===
                    Number(pit.pit_nomor)
                );

                const milikSaya =
                  Number(pit.pit_nomor) ===
                  Number(pitSaya);

                return (
                  <div
                    key={pit.pit_nomor}
                    className={`bg-white border-2 rounded-2xl p-5 ${
                      milikSaya
                        ? "border-orange-500"
                        : "border-stone-200"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="font-extrabold text-xl">
                        Pit {pit.pit_nomor}
                      </h3>

                      {milikSaya && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full">
                          Pit Saya
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-neutral-500 mt-3">
                      Mekanik
                    </p>

                    <p className="font-semibold">
                      {pit.nama_mekanik ||
                        "Belum ditugaskan"}
                    </p>

                    <div className="mt-5 border-t pt-4">
                      <h4 className="font-bold text-sm mb-3">
                        Daftar Pekerjaan ({daftar.length})
                      </h4>

                      {daftar.length > 0 ? (
                        <div className="space-y-3">
                          {daftar.map((a) =>
                            renderKartu(a, milikSaya)
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-500">
                          Belum ada pekerjaan pada pit ini.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* PEKERJAAN AKTIF */}
        {active === "Pekerjaan Aktif" && (
          <section className="bg-white rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-2">
              Pekerjaan Aktif - Pit {pitSaya}
            </h2>

            <p className="text-sm text-neutral-500 mb-5">
              Daftar motor yang sedang dikerjakan pada
              pit Anda.
            </p>

            {pekerjaanAktif.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pekerjaanAktif.map((a) =>
                  renderKartu(a, true)
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Belum ada pekerjaan aktif pada pit Anda.
              </p>
            )}
          </section>
        )}

        {/* SUKU CADANG */}
        {active === "Suku Cadang" && (
          <section className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Package
                size={24}
                className="text-orange-500"
              />

              <h2 className="text-xl font-bold">
                Suku Cadang
              </h2>
            </div>

            <p className="text-sm text-neutral-500">
              Data suku cadang dan biaya pekerjaan akan
              dihubungkan dengan database pada tahap
              berikutnya.
            </p>
          </section>
        )}

        {/* RIWAYAT */}
        {active === "Riwayat" && (
          <section className="bg-white rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-2">
              Riwayat Pekerjaan
            </h2>

            <p className="text-sm text-neutral-500 mb-5">
              Pekerjaan yang sudah selesai pada Pit
              {" "}{pitSaya} hari ini.
            </p>

            {riwayat.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {riwayat.map((a) =>
                  renderKartu(a, true)
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Belum ada riwayat pekerjaan selesai
                hari ini.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
