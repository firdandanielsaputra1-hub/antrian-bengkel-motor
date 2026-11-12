
import { useEffect, useState } from "react";
import { Volume2, Plus } from "lucide-react";
import { NAVY, ORANGE } from "../constants/theme";


import Sidebar from "../components/dashboard/Sidebar";
import KelolaMekanik from "./KelolaMekanik";
import Topbar from "../components/dashboard/Topbar";
import StatCards from "../components/dashboard/StatCards";
import ActiveCall from "../components/dashboard/ActiveCall";
import PitCapacity from "../components/dashboard/PitCapacity";
import QueueTable from "../components/dashboard/QueueTable";

import { speakQueue } from "../services/queue";
import {
  getAntreanAdmin, tambahAntreanAdmin, panggilAntreanAdmin,
  ubahStatusAntrean, getPitAdmin,
} from "../services/adminAntrean";
import {
  simpanPembayaran,
  ambilPembayaran,
} from "../services/pembayaranAdmin";

export default function Dashboard({ go }) {
  const [active, setActive] = useState("Dashboard");
  const [queues, setQueues] = useState([]);
  const [pitDatabase, setPitDatabase] = useState([]);
  const [loadingAntrean, setLoadingAntrean] = useState(true);
  const [busy, setBusy] = useState(false);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [prosesBayar, setProsesBayar] = useState(false);
  const [audio, setAudio] = useState(true);

  const [form, setForm] = useState({
    nama: "",
    hp: "",
    motor: "",
    plat: "",
    servis: ""
  });

  // Tanggal lokal komputer, format YYYY-MM-DD.
  const tanggalLokal = () => {
    const d = new Date();
    const tahun = d.getFullYear();
    const bulan = String(d.getMonth() + 1).padStart(2, "0");
    const hari = String(d.getDate()).padStart(2, "0");
    return `${tahun}-${bulan}-${hari}`;
  };

  // Penyegaran setelah admin menambah/memanggil/mengubah antrean.
  const refreshAntrean = async () => {
    const tanggalMulai = tanggalLokal();
    const data = await getAntreanAdmin();
    if (tanggalMulai === tanggalLokal()) {
      setQueues(data);
    } else {
      // Jika tepat berganti hari saat permintaan berlangsung,
      // jangan menampilkan antrean dari hari sebelumnya.
      setQueues([]);
    }
    setLoadingAntrean(false);
  };

  useEffect(() => {
    let mounted = true;
    let sedangMemuat = false;
    let tanggalAktif = tanggalLokal();

    const refresh = async () => {
      const tanggalSekarang = tanggalLokal();

      // Reset tampilan ketika kalender memasuki hari baru.
      if (tanggalSekarang !== tanggalAktif) {
        tanggalAktif = tanggalSekarang;
        if (mounted) {
          setQueues([]);
          setLoadingAntrean(true);
        }
      }

      // Hindari permintaan interval bertumpuk.
      if (sedangMemuat) return;
      sedangMemuat = true;

      try {
        const [data, pits] = await Promise.all([
          getAntreanAdmin(),
          getPitAdmin(),
        ]);

        // Hasil lama tidak boleh ditampilkan setelah pergantian hari.
        if (mounted && tanggalLokal() === tanggalSekarang) {
          setQueues(data);
          setPitDatabase(pits);
        }
      } catch (error) {
        console.error("Gagal menyegarkan data admin:", error);
      } finally {
        sedangMemuat = false;
        if (mounted) setLoadingAntrean(false);
      }
    };

    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const pitCadangan = false; // Simulasi menggunakan tiga pit saja
  const todayQueues = queues;

  const handleCall = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await panggilAntreanAdmin();
      const q = { ...result.data, nama: result.data.nama_pelanggan };
      await refreshAntrean();
      if (audio) speakQueue(q);
      alert(`Antrean ${q.nomor} atas nama ${q.nama} berhasil dipanggil.`);
    } catch (error) {
      alert(error.message);
    } finally { setBusy(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!form.nama.trim() || !form.motor.trim() || !form.plat.trim() || !form.servis.trim()) {
      alert("Lengkapi semua data yang wajib diisi.");
      return;
    }
    setBusy(true);
    try {
      const result = await tambahAntreanAdmin({
        nama: form.nama.trim(), hp: form.hp.trim(), motor: form.motor.trim(),
        plat: form.plat.trim().toUpperCase(), servis: form.servis.trim(),
      });
      setForm({ nama: "", hp: "", motor: "", plat: "", servis: "" });
      await refreshAntrean();
      setActive("Kelola Antrian");
      alert(`Pendaftaran berhasil! Nomor antrean: ${result.data.nomor}`);
    } catch (error) {
      alert("Gagal menambah antrean: " + error.message);
    } finally { setBusy(false); }
  };

  const handleStatus = async (id, status) => {
    if (busy) return;
    let pitId = null;
    if (status === "Sedang Dilayani") {
      let latestPits;
      try { latestPits = await getPitAdmin(); setPitDatabase(latestPits); }
      catch (error) { alert(error.message); return; }
      const available = latestPits.filter(p => Number(p.aktif) === 1 &&
        !queues.some(q => q.id !== id && q.status === "Sedang Dilayani" && Number(q.pit_id) === Number(p.id)));
      if (!available.length) {
        alert("Tidak ada pit aktif yang tersedia.");
        return;
      }
      const pilihan = prompt(`Pilih ID pit:\n${available.map(p => `${p.id} - ${p.nama}`).join("\n")}`, String(available[0].id));
      if (pilihan === null) return;
      const selected = available.find(p => String(p.id) === pilihan.trim());
      if (!selected) { alert("ID pit tidak tersedia."); return; }
      pitId = Number(selected.id);
    }
    setBusy(true);
    try {
      await ubahStatusAntrean(id, status, pitId);
      await refreshAntrean();
    } catch (error) {
      alert("Gagal mengubah status: " + error.message);
    } finally { setBusy(false); }
  };

  // Halaman Dashboard utama
  const renderDashboard = () => (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="text-3xl font-extrabold">
            Ringkasan Operasional Antrean
          </h1>

          <p className="text-sm text-neutral-600 mt-1">
            Pantauan antrean bengkel langsung, utilisasi pit mekanik,
            dan panggilan servis aktif hari ini.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[11px] bg-stone-200 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Live Sync 5s
          </span>

          <button
            onClick={handleCall}
              disabled={busy}
            className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-stone-100"
            style={{ color: NAVY }}
          >
            <Volume2 size={16} />
            Panggil Suara Berikutnya
          </button>

          <button
            onClick={() => setActive("Input Pelanggan")}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90"
            style={{ background: ORANGE }}
          >
            <Plus size={16} />
            Pendaftaran Antrian Baru
          </button>
        </div>
      </div>

      {loadingAntrean && <p className="text-sm text-neutral-500">Memuat antrean dari database...</p>}
      <StatCards queues={queues} />

      <div className="grid gap-6 xl:grid-cols-5">
        <ActiveCall queues={queues} audio={audio} pitCadangan={pitCadangan} />
        <PitCapacity queues={queues} />
      </div>

      <QueueTable queues={queues} audio={audio} />
    </>
  );

  // Halaman Input Pelanggan
  const renderInputPelanggan = () => (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <h1 className="text-2xl font-extrabold mb-2">
        Pendaftaran Antrean Baru
      </h1>

      <p className="text-sm text-neutral-500 mb-6">
        Masukkan data pelanggan dan kendaraan untuk mendapatkan nomor antrean.
      </p>

      <form onSubmit={handleAdd} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Nama Pelanggan *
          </label>

          <input
            type="text"
            value={form.nama}
            onChange={(e) =>
              setForm({ ...form, nama: e.target.value })
            }
            placeholder="Contoh: Budi Santoso"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Nomor HP / WhatsApp
          </label>

          <input
            type="tel"
            value={form.hp}
            onChange={(e) =>
              setForm({ ...form, hp: e.target.value })
            }
            placeholder="Contoh: 081234567890"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Jenis Motor *
          </label>

          <input
            type="text"
            value={form.motor}
            onChange={(e) =>
              setForm({ ...form, motor: e.target.value })
            }
            placeholder="Contoh: Honda Vario 125"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Nomor Polisi / Plat Motor *
          </label>

          <input
            type="text"
            value={form.plat}
            onChange={(e) =>
              setForm({ ...form, plat: e.target.value })
            }
            placeholder="Contoh: AG 1234 AB"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Jenis Servis *
          </label>

          <select
            value={form.servis}
            onChange={(e) =>
              setForm({ ...form, servis: e.target.value })
            }
            className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            required
          >
            <option value="">Pilih Jenis Servis</option>
            <option value="Servis Ringan">Servis Ringan</option>
            <option value="Servis Lengkap">Servis Lengkap</option>
            <option value="Ganti Oli">Ganti Oli</option>
            <option value="Servis CVT">Servis CVT</option>
            <option value="Perbaikan Mesin">Perbaikan Mesin</option>
          </select>
        </div>

        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            disabled={busy}
            className="text-white font-semibold px-6 py-3 rounded-xl"
            style={{ background: ORANGE }}
          >
            Simpan dan Buat Antrean
          </button>

          <button
            type="button"
            onClick={() => setActive("Dashboard")}
            className="bg-stone-100 font-semibold px-6 py-3 rounded-xl"
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  );

  // Halaman Kelola Antrean
  const renderKelolaAntrian = () => (
    <section className="space-y-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">
            Kelola Antrean
          </h1>

          <p className="text-sm text-neutral-500 mt-1">
            Atur status antrean pelanggan bengkel.
          </p>
        </div>

        <button
          onClick={() => setActive("Input Pelanggan")}
          className="text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2"
          style={{ background: ORANGE }}
        >
          <Plus size={16} />
          Tambah Antrean
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-100">
              <tr>
                <th className="p-3">No. Antrean</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Motor</th>
                <th className="p-3">Plat</th>
                <th className="p-3">Layanan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {todayQueues.map((q) => (
                <tr key={q.id} className="border-b border-stone-100">
                  <td className="p-3 font-bold" style={{ color: NAVY }}>
                    {q.nomor}
                  </td>

                  <td className="p-3">{q.nama}</td>
                  <td className="p-3">{q.motor || "-"}</td>
                  <td className="p-3">{q.plat}</td>
                  <td className="p-3">{q.servis}</td>

                  <td className="p-3">
                    <span className="bg-stone-100 rounded-lg px-3 py-1 text-xs">
                      {q.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <select
                      value={q.status}
                      disabled={busy}
                      onChange={(e) =>
                        handleStatus(q.id, e.target.value)
                      }
                      className="border border-stone-200 rounded-lg px-2 py-2"
                    >
                      {[q.status, ...({
                        "Menunggu": ["Dipanggil", "Dilewati"],
                        "Dipanggil": ["Sedang Dilayani", "Dilewati"],
                        "Sedang Dilayani": ["Selesai"],
                        "Dilewati": ["Menunggu"],
                        "Selesai": [],
                      }[q.status] || [])].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}

              {todayQueues.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-neutral-500"
                  >
                    Belum ada antrean hari ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  // Halaman Laporan Harian
  const renderLaporan = () => {
    const menunggu = todayQueues.filter(
      (q) => q.status === "Menunggu"
    ).length;

    const dilayani = todayQueues.filter(
      (q) => q.status === "Sedang Dilayani"
    ).length;

    const selesai = todayQueues.filter(
      (q) => q.status === "Selesai"
    ).length;

    return (
      <section className="space-y-5">
        <h1 className="text-2xl font-extrabold">
          Laporan Harian
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Antrean", value: todayQueues.length },
            { label: "Menunggu", value: menunggu },
            { label: "Sedang Dilayani", value: dilayani },
            { label: "Selesai", value: selesai }
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl shadow-sm p-5"
            >
              <p className="text-sm text-neutral-500">
                {item.label}
              </p>

              <h2 className="text-3xl font-extrabold mt-2">
                {item.value}
              </h2>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Memuat pembayaran yang sudah tercatat di MySQL
  const refreshPembayaran = async () => {
    try {
      const data = await ambilPembayaran();
      setDaftarPembayaran(data);
    } catch (error) {
      console.error("Gagal mengambil pembayaran:", error);
    }
  };

  useEffect(() => {
    refreshPembayaran();
  }, []);

  const handlePembayaran = async (q) => {
    if (prosesBayar) return;

    const inputJumlah = prompt(`Masukkan nominal pembayaran untuk ${q.nomor}:`, "75000");
    if (inputJumlah === null) return;
    const jumlah = Number(inputJumlah.trim());
    if (!inputJumlah.trim() || !Number.isFinite(jumlah) || jumlah <= 0) {
      alert("Nominal pembayaran harus lebih dari 0.");
      return;
    }

    const inputMetode = prompt("Pilih metode pembayaran:\n1. Tunai\n2. Transfer\n3. QRIS", "1");
    if (inputMetode === null) return;
    const metode = { "1": "Tunai", "2": "Transfer", "3": "QRIS" }[inputMetode.trim()];
    if (!metode) {
      alert("Metode pembayaran tidak valid.");
      return;
    }

    if (!confirm(`Simpan pembayaran ${q.nomor} sebesar Rp${jumlah.toLocaleString("id-ID")} melalui ${metode}?`)) return;

    setProsesBayar(true);
    try {
      await simpanPembayaran(q.id, jumlah, metode);
      await refreshPembayaran();
      alert(`Pembayaran ${q.nomor} berhasil disimpan.`);
    } catch (error) {
      alert("Gagal menyimpan pembayaran: " + error.message);
      await refreshPembayaran();
    } finally {
      setProsesBayar(false);
    }
  };

  const renderPembayaran = () => {
    const selesai = todayQueues.filter(q => q.status === "Selesai");
    const rupiah = nilai => new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0
    }).format(Number(nilai) || 0);

    return (
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-extrabold mb-2">Pembayaran</h1>
        <p className="text-sm text-neutral-500 mb-5">
          Daftar pelanggan yang sudah menyelesaikan servis.
        </p>
        {selesai.map(q => {
          const pembayaran = daftarPembayaran.find(
            p => Number(p.antrean_id) === Number(q.id)
          );
          return (
            <div key={q.id} className="flex flex-wrap justify-between items-center gap-3 border border-stone-200 rounded-xl p-4 mb-3">
              <div>
                <b>{q.nomor} - {q.nama}</b>
                <p className="text-sm text-neutral-500">{q.motor} • {q.servis}</p>
                {pembayaran && (
                  <p className="text-sm text-green-700 mt-2">
                    {pembayaran.status} • {rupiah(pembayaran.jumlah)} • {pembayaran.metode}
                  </p>
                )}
              </div>
              {pembayaran ? (
                <span className="bg-green-100 text-green-700 rounded-xl px-4 py-2.5 text-sm font-semibold">Sudah Dicatat</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePembayaran(q)}
                  disabled={prosesBayar}
                  className="text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                  style={{ background: ORANGE }}
                >
                  {prosesBayar ? "Memproses..." : "Proses Pembayaran"}
                </button>
              )}
            </div>
          );
        })}
        {selesai.length === 0 && (
          <p className="text-sm text-neutral-500">Belum ada servis yang selesai.</p>
        )}
      </section>
    );
  };

  // Menentukan halaman yang ditampilkan
  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return renderDashboard();

      case "Input Pelanggan":
        return renderInputPelanggan();

      case "Kelola Antrian":
        return renderKelolaAntrian();

      case "Kelola Mekanik":
        return <KelolaMekanik />;

      case "Pembayaran":
        return renderPembayaran();

      case "Laporan Harian":
        return renderLaporan();

      case "Pengaturan Sistem":
        return (
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h1 className="text-2xl font-extrabold mb-5">
              Pengaturan Sistem
            </h1>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={audio}
                onChange={(e) => setAudio(e.target.checked)}
              />
              Aktifkan audio panggilan antrean
            </label>
          </section>
        );

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 text-neutral-900">
      <Sidebar
        active={active}
        setActive={setActive}
        go={go}
      />

      <main className="flex-1 min-w-0">
        <Topbar audio={audio} setAudio={setAudio} />

        <div className="p-6 space-y-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
