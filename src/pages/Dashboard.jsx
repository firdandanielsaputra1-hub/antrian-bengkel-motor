import { useEffect, useRef, useState } from "react";
import {
  AlertCircle, BellRing, CheckCircle2, LoaderCircle, Plus, RefreshCw,
  Sparkles, Volume2, MapPin, X,
} from "lucide-react";
import { NAVY, ORANGE } from "../constants/theme";


import Sidebar from "../components/dashboard/Sidebar";
import KelolaMekanik from "./KelolaMekanik";
import Topbar from "../components/dashboard/Topbar";
import StatCards from "../components/dashboard/StatCards";
import ActiveCall from "../components/dashboard/ActiveCall";
import PitCapacity from "../components/dashboard/PitCapacity";
import QueueTable from "../components/dashboard/QueueTable";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

import { speakQueue } from "../services/queue";
import { api } from "../services/api";
import {
  getAntreanAdmin, tambahAntreanAdmin, panggilAntreanAdmin,
  ubahStatusAntrean, getPitAdmin,
} from "../services/adminAntrean";
import {
  simpanPembayaran,
  ambilPembayaran,
} from "../services/pembayaranAdmin";

// Tampilan saja: seluruh fungsi API, status, dan suara tetap menggunakan kode lama.
const INPUT_CLASS =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none " +
  "transition duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

const gayaStatus = (status) => ({
  Menunggu: "bg-amber-50 text-amber-700 border-amber-200",
  Dipanggil: "bg-blue-50 text-blue-700 border-blue-200",
  "Sedang Dilayani": "bg-violet-50 text-violet-700 border-violet-200",
  Selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Dilewati: "bg-rose-50 text-rose-700 border-rose-200",
}[status] || "bg-stone-100 text-stone-600 border-stone-200");

function sapaanHari() {
  const jam = new Date().getHours();
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function Dashboard({ go }) {
  const [active, setActive] = useState("Dashboard");
  const [queues, setQueues] = useState([]);
  const [pitDatabase, setPitDatabase] = useState([]);
  const [loadingAntrean, setLoadingAntrean] = useState(true);
  const [busy, setBusy] = useState(false);
  const [daftarPembayaran, setDaftarPembayaran] = useState([]);
  const [prosesBayar, setProsesBayar] = useState(false);
  const [idBayar, setIdBayar] = useState(null);
  const [pembayaranDimuat, setPembayaranDimuat] = useState(false);
  const [pembayaranError, setPembayaranError] = useState("");
  const [audio, setAudio] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncError, setSyncError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kehadiranMap, setKehadiranMap] = useState({});
  // Pratinjau khusus pengembangan agar skeleton dapat diperiksa meski API cepat.
  const [previewSkeleton, setPreviewSkeleton] = useState(false);
  const previewTimer = useRef(null);

  const beriPesan = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), type === "error" ? 6500 : 4500);
  };

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (previewTimer.current) clearTimeout(previewTimer.current);
  }, []);

  const pratinjauSkeleton = () => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreviewSkeleton(true);
    previewTimer.current = setTimeout(() => setPreviewSkeleton(false), 3000);
  };

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
    try {
      const data = await getAntreanAdmin();
      if (tanggalMulai === tanggalLokal()) {
        setQueues(data);
        setLastSynced(new Date());
        setSyncError(false);
      } else {
        // Hindari menampilkan hasil dari hari sebelumnya.
        setQueues([]);
        setLastSynced(null);
      }
    } catch (error) {
      setSyncError(true);
      throw error;
    } finally {
      setLoadingAntrean(false);
    }
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
          setLastSynced(null);
          setLoadingAntrean(true);
        }
      }

      // Hindari permintaan interval bertumpuk.
      if (sedangMemuat) return;
      sedangMemuat = true;

      try {
        // Kegagalan mengambil data pit tidak boleh memblokir data antrean.
        const [hasilAntrean, hasilPit] = await Promise.allSettled([
          getAntreanAdmin(),
          getPitAdmin(),
        ]);

        // Hasil lama tidak boleh ditampilkan setelah pergantian hari.
        if (mounted && tanggalLokal() === tanggalSekarang) {
          if (hasilAntrean.status === "fulfilled") {
            setQueues(hasilAntrean.value);
            setLastSynced(new Date());
            setSyncError(false);
          } else {
            setSyncError(true);
            console.error("Gagal menyegarkan antrean:", hasilAntrean.reason);
          }

          if (hasilPit.status === "fulfilled") {
            setPitDatabase(hasilPit.value);
          } else {
            console.error("Gagal menyegarkan pit:", hasilPit.reason);
          }
        }
      } catch (error) {
        if (mounted) setSyncError(true);
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


  // Informasi hadir hanya indikator, tidak mengubah algoritma panggilan antrean.
  useEffect(() => {
    let mounted = true;
    let fetching = false;
    const ambilKehadiran = async () => {
      if (fetching) return;
      fetching = true;
      try {
        const hasil = await api("antrean/kehadiran.php");
        if (mounted && Array.isArray(hasil?.data)) {
          setKehadiranMap(Object.fromEntries(
            hasil.data.map(item => [String(item.antrean_id), item])
          ));
        }
      } catch (error) {
        console.warn("Gagal memperbarui kehadiran pelanggan:", error);
      } finally {
        fetching = false;
      }
    };
    ambilKehadiran();
    const interval = setInterval(ambilKehadiran, 5000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const pitCadangan = false; // Simulasi menggunakan tiga pit saja
  const todayQueues = queues;
  // Skeleton tampil pada pemuatan awal. Tombol pratinjau hanya tersedia saat npm run dev.
  const skeletonAwal = (loadingAntrean && !lastSynced) || previewSkeleton;
  const gagalMuatAwal = syncError && !lastSynced && !loadingAntrean;
  const ringkasan = [
    { label: "Menunggu", status: "Menunggu", jumlah: queues.filter(q => q.status === "Menunggu").length, warna: "#f59e0b" },
    { label: "Dipanggil", status: "Dipanggil", jumlah: queues.filter(q => q.status === "Dipanggil").length, warna: "#3b82f6" },
    { label: "Dilayani", status: "Sedang Dilayani", jumlah: queues.filter(q => q.status === "Sedang Dilayani").length, warna: "#8b5cf6" },
    { label: "Selesai", status: "Selesai", jumlah: queues.filter(q => q.status === "Selesai").length, warna: "#10b981" },
  ];
  const totalTerpantau = ringkasan.reduce((jumlah, item) => jumlah + item.jumlah, 0);

  const handleRefreshManual = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshAntrean();
      beriPesan("Data antrean berhasil diperbarui.");
    } catch (error) {
      setSyncError(true);
      beriPesan("Gagal memperbarui data: " + error.message, "error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCall = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await panggilAntreanAdmin();
      const q = { ...result.data, nama: result.data.nama_pelanggan };
      if (audio) {
        try {
          Promise.resolve(speakQueue(q)).catch(err => {
            console.error("Audio panggilan gagal:", err);
          });
        } catch (err) {
          console.error("Audio panggilan gagal:", err);
        }
      }
      // Feedback baru muncul setelah API memproses panggilan.
      // Ini tidak mengklaim push notification sudah diterima HP.
      beriPesan(`Antrean ${q.nomor} atas nama ${q.nama} berhasil dipanggil.`, "call");
      try { await refreshAntrean(); }
      catch (err) {
        console.error("Panggilan berhasil, tetapi refresh antrean gagal:", err);
        setSyncError(true);
      }
    } catch (error) {
      beriPesan(error.message || "Gagal memanggil antrean.", "error");
    } finally { setBusy(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!form.nama.trim() || !form.motor.trim() || !form.plat.trim() || !form.servis.trim()) {
      beriPesan("Lengkapi semua data yang wajib diisi.", "error");
      return;
    }
    setBusy(true);
    try {
      const result = await tambahAntreanAdmin({
        nama: form.nama.trim(), hp: form.hp.trim(), motor: form.motor.trim(),
        plat: form.plat.trim().toUpperCase(), servis: form.servis.trim(),
      });
      setForm({ nama: "", hp: "", motor: "", plat: "", servis: "" });
      setActive("Kelola Antrian");
      beriPesan(`Pendaftaran berhasil! Nomor antrean: ${result.data.nomor}`);
      try { await refreshAntrean(); }
      catch (err) { console.error("Pendaftaran berhasil, refresh gagal:", err); setSyncError(true); }
    } catch (error) {
      beriPesan("Gagal menambah antrean: " + error.message, "error");
    } finally { setBusy(false); }
  };

  const handleStatus = async (id, status) => {
    if (busy) return;
    let pitId = null;
    if (status === "Sedang Dilayani") {
      let latestPits;
      try { latestPits = await getPitAdmin(); setPitDatabase(latestPits); }
      catch (error) { beriPesan(error.message, "error"); return; }
      const available = latestPits.filter(p => Number(p.aktif) === 1 &&
        !queues.some(q => q.id !== id && q.status === "Sedang Dilayani" && Number(q.pit_id) === Number(p.id)));
      if (!available.length) {
        beriPesan("Tidak ada pit aktif yang tersedia.", "error");
        return;
      }
      const pilihan = prompt(`Pilih ID pit:\n${available.map(p => `${p.id} - ${p.nama}`).join("\n")}`, String(available[0].id));
      if (pilihan === null) return;
      const selected = available.find(p => String(p.id) === pilihan.trim());
      if (!selected) { beriPesan("ID pit tidak tersedia.", "error"); return; }
      pitId = Number(selected.id);
    }
    setBusy(true);
    try {
      await ubahStatusAntrean(id, status, pitId);
      beriPesan(`Status antrean berhasil diperbarui menjadi ${status}.`);
      try { await refreshAntrean(); }
      catch (err) { console.error("Status berhasil diubah, refresh gagal:", err); setSyncError(true); }
    } catch (error) {
      beriPesan("Gagal mengubah status: " + error.message, "error");
    } finally { setBusy(false); }
  };

  // Halaman Dashboard utama: banner sambutan, ringkasan progres, dan aksi cepat.
  const renderDashboard = () => (
    <>
      <section
        className="relative isolate overflow-hidden rounded-3xl p-5 sm:p-7 text-white shadow-sm"
        style={{ background: `linear-gradient(115deg, ${NAVY} 5%, #244a76 100%)` }}
      >
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[38px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-white/5 blur-xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
              <Sparkles size={13} /> Panel Operasional Bengkel
            </span>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
              {sapaanHari()}, Admin!
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Pantau antrean, panggil pelanggan, dan kelola pelayanan bengkel dari satu tempat.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                {queues.length} antrean hari ini
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                {ringkasan[0].jumlah} menunggu
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                {ringkasan[2].jumlah} sedang dilayani
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[340px] lg:justify-end">
            <button
              type="button"
              onClick={handleCall}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ color: NAVY }}
            >
              {busy ? <LoaderCircle size={17} className="animate-spin" /> : <Volume2 size={17} />}
              Panggil Antrean
            </button>
            <button
              type="button"
              onClick={() => setActive("Input Pelanggan")}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
              style={{ background: ORANGE }}
            >
              <Plus size={17} /> Antrean Baru
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold sm:text-2xl" style={{ color: NAVY }}>
            Ringkasan Operasional Antrean
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Data antrean dan kapasitas pit hari ini.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              syncError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
            title={lastSynced ? `Terakhir sinkron ${lastSynced.toLocaleTimeString("id-ID")}` : "Menunggu sinkronisasi"}
          >
            <span className={`relative h-2 w-2 rounded-full ${syncError ? "bg-rose-500" : "bg-emerald-500"}`}>
              {!syncError && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />}
            </span>
            {syncError ? "Koneksi bermasalah" : loadingAntrean ? "Memuat..." : "Live Sync 5 detik"}
          </span>
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={pratinjauSkeleton}
              disabled={previewSkeleton}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
              title="Menampilkan contoh skeleton selama 3 detik untuk pengujian"
            >
              {previewSkeleton ? "Menampilkan Skeleton..." : "Tes Skeleton"}
            </button>
          )}
          <button
            type="button"
            onClick={handleRefreshManual}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 transition-all hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Perbarui
          </button>
        </div>
      </div>

      {skeletonAwal ? (
        <DashboardSkeleton />
      ) : gagalMuatAwal ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <div className="flex items-start gap-3 text-rose-800">
            <AlertCircle size={22} className="shrink-0" />
            <div>
              <h3 className="font-bold">Data dashboard belum berhasil dimuat</h3>
              <p className="mt-1 text-sm">Periksa Apache, MySQL, atau koneksi API PHP, lalu coba kembali.</p>
              <button type="button" onClick={handleRefreshManual} disabled={refreshing}
                className="mt-4 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-rose-100 disabled:opacity-60">
                {refreshing ? "Memuat ulang..." : "Coba Lagi"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
      <div className="bengkel-stat-cards"><StatCards queues={queues} /></div>

      <section className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold" style={{ color: NAVY }}>Alur Antrean Hari Ini</h3>
            <p className="mt-1 text-xs text-stone-500">Ringkasan antrean berdasarkan status terkini.</p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
            {totalTerpantau} dalam alur
          </span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-stone-100">
          {ringkasan.map(item => (
            <div
              key={item.status}
              title={`${item.label}: ${item.jumlah}`}
              className="h-full transition-all duration-500"
              style={{ width: `${totalTerpantau ? (item.jumlah / totalTerpantau) * 100 : 0}%`, background: item.warna }}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ringkasan.map(item => (
            <div key={item.status} className="flex items-center justify-between gap-2 rounded-xl bg-stone-50 px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.warna }} />
                {item.label}
              </span>
              <strong className="text-sm" style={{ color: NAVY }}>{item.jumlah}</strong>
            </div>
          ))}
        </div>
        {queues.some(q => q.status === "Dilewati") && (
          <p className="mt-3 text-xs text-stone-500">
            {queues.filter(q => q.status === "Dilewati").length} antrean berstatus dilewati (di luar alur utama).
          </p>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
          <MapPin size={18} /> Konfirmasi Kedatangan Pelanggan
        </div>
        <span className="text-sm font-semibold text-emerald-800">
          {queues.filter(q => ["Menunggu", "Dipanggil"].includes(q.status) && kehadiranMap[String(q.id)]).length} pelanggan aktif sudah hadir
        </span>
        <button type="button" onClick={() => setActive("Kelola Antrian")} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
          Lihat di Kelola Antrean
        </button>
      </section>

      <div className="grid gap-6 xl:grid-cols-5">
        <ActiveCall queues={queues} audio={audio} pitCadangan={pitCadangan} />
        <PitCapacity queues={queues} />
      </div>

      <QueueTable queues={queues} audio={audio} />
        </>
      )}
    </>
  );

  // Halaman Input Pelanggan
  const renderInputPelanggan = () => (
    <section className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm sm:p-7">
      <h1 className="text-2xl font-extrabold mb-2" style={{ color: NAVY }}>
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
            className={INPUT_CLASS}
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
            className={INPUT_CLASS}
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
            className={INPUT_CLASS}
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
            className={INPUT_CLASS}
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
            className={INPUT_CLASS}
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
            className="rounded-xl px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: ORANGE }}
          >
            {busy ? <span className="inline-flex items-center gap-2"><LoaderCircle size={16} className="animate-spin" /> Menyimpan...</span> : "Simpan dan Buat Antrean"}
          </button>

          <button
            type="button"
            onClick={() => setActive("Dashboard")}
            className="rounded-xl bg-stone-100 px-6 py-3 font-semibold transition hover:bg-stone-200"
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
          <h1 className="text-2xl font-extrabold" style={{ color: NAVY }}>
            Kelola Antrean
          </h1>

          <p className="text-sm text-neutral-500 mt-1">
            Atur status antrean pelanggan bengkel.
          </p>
        </div>

        <button
          onClick={() => setActive("Input Pelanggan")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: ORANGE }}
        >
          <Plus size={16} />
          Tambah Antrean
        </button>
      </div>

      <p className="text-xs text-stone-500">"Belum konfirmasi" berarti pelanggan belum menekan tombol hadir, bukan bukti bahwa pelanggan belum datang.</p>

      <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white p-3 shadow-sm sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="p-3">No. Antrean</th>
                <th className="p-3">Pelanggan</th>
                <th className="p-3">Motor</th>
                <th className="p-3">Plat</th>
                <th className="p-3">Layanan</th>
                <th className="p-3">Kehadiran</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {skeletonAwal ? (
                [1, 2, 3, 4].map(nomor => (
                  <tr key={nomor} aria-hidden="true"><td colSpan={8} className="p-3">
                    <div className="h-9 animate-pulse rounded-xl bg-stone-200/80 motion-reduce:animate-none" />
                  </td></tr>
                ))
              ) : gagalMuatAwal ? (
                <tr><td colSpan={8} className="p-6 text-center text-sm text-rose-700">
                  Data antrean gagal dimuat. Periksa koneksi API, lalu klik Perbarui pada Dashboard.
                </td></tr>
              ) : todayQueues.map((q) => (
                <tr key={q.id} className="border-b border-stone-100 transition-colors hover:bg-orange-50/40">
                  <td className="p-3 font-bold" style={{ color: NAVY }}>
                    {q.nomor}
                  </td>

                  <td className="p-3">{q.nama}</td>
                  <td className="p-3">{q.motor || "-"}</td>
                  <td className="p-3">{q.plat}</td>
                  <td className="p-3">{q.servis}</td>
                  <td className="p-3">
                    {kehadiranMap[String(q.id)] ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <MapPin size={13} /> Hadir {kehadiranMap[String(q.id)].jam_hadir || ""}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500">
                        Belum konfirmasi
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${gayaStatus(q.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
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
                      className="rounded-lg border border-stone-200 bg-white px-2 py-2 transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
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

              {!skeletonAwal && !gagalMuatAwal && todayQueues.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
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
    const menunggu = todayQueues.filter(q => q.status === "Menunggu").length;
    const dilayani = todayQueues.filter(q => q.status === "Sedang Dilayani").length;
    const selesai = todayQueues.filter(q => q.status === "Selesai").length;
    const laporan = [
      { label: "Total Antrean", value: todayQueues.length, tone: "bg-blue-50 text-blue-700" },
      { label: "Menunggu", value: menunggu, tone: "bg-amber-50 text-amber-700" },
      { label: "Sedang Dilayani", value: dilayani, tone: "bg-violet-50 text-violet-700" },
      { label: "Selesai", value: selesai, tone: "bg-emerald-50 text-emerald-700" },
    ];

    return (
      <section className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: NAVY }}>Laporan Harian</h1>
          <p className="mt-1 text-sm text-neutral-500">Ringkasan pekerjaan servis hari ini.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {laporan.map(item => (
            <div key={item.label} className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${item.tone}`}>
                {item.label}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold" style={{ color: NAVY }}>{item.value}</h2>
              <p className="mt-1 text-xs text-neutral-500">Data dari antrean hari ini</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-extrabold" style={{ color: NAVY }}>Progres Penyelesaian Servis</h2>
            <span className="text-sm font-bold text-emerald-600">
              {todayQueues.length ? Math.round((selesai / todayQueues.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${todayQueues.length ? (selesai / todayQueues.length) * 100 : 0}%` }} />
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {selesai} dari {todayQueues.length} antrean hari ini sudah selesai.
          </p>
        </div>
      </section>
    );
  };

  // Memuat pembayaran yang sudah tercatat di MySQL
  const refreshPembayaran = async () => {
    try {
      setPembayaranError("");
      const data = await ambilPembayaran();
      setDaftarPembayaran(data);
    } catch (error) {
      console.error("Gagal mengambil pembayaran:", error);
      setPembayaranError(error.message || "Gagal mengambil data pembayaran.");
    } finally {
      setPembayaranDimuat(true);
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
      beriPesan("Nominal pembayaran harus lebih dari 0.", "error");
      return;
    }

    const inputMetode = prompt("Pilih metode pembayaran:\n1. Tunai\n2. Transfer\n3. QRIS", "1");
    if (inputMetode === null) return;
    const metode = { "1": "Tunai", "2": "Transfer", "3": "QRIS" }[inputMetode.trim()];
    if (!metode) {
      beriPesan("Metode pembayaran tidak valid.", "error");
      return;
    }

    if (!confirm(`Simpan pembayaran ${q.nomor} sebesar Rp${jumlah.toLocaleString("id-ID")} melalui ${metode}?`)) return;

    setProsesBayar(true);
    setIdBayar(q.id);
    try {
      await simpanPembayaran(q.id, jumlah, metode);
      await refreshPembayaran();
      beriPesan(`Pembayaran ${q.nomor} berhasil disimpan.`);
    } catch (error) {
      beriPesan("Gagal menyimpan pembayaran: " + error.message, "error");
      await refreshPembayaran();
    } finally {
      setProsesBayar(false);
      setIdBayar(null);
    }
  };

  const renderPembayaran = () => {
    const selesai = todayQueues.filter(q => q.status === "Selesai");
    const rupiah = nilai => new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0
    }).format(Number(nilai) || 0);

    return (
      <section className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-2xl font-extrabold mb-2" style={{ color: NAVY }}>Pembayaran</h1>
        <p className="text-sm text-neutral-500 mb-5">
          Daftar pelanggan yang sudah menyelesaikan servis.
        </p>
        {!pembayaranDimuat && (
          <div role="status" aria-label="Memuat data pembayaran" className="space-y-3">
            <span className="sr-only">Sedang memuat pembayaran...</span>
            {[1, 2, 3].map(nomor => (
              <div key={nomor} aria-hidden="true" className="flex animate-pulse items-center gap-4 rounded-xl border border-stone-100 p-4 motion-reduce:animate-none">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 max-w-full rounded-lg bg-stone-200" />
                  <div className="h-3 w-60 max-w-full rounded-lg bg-stone-200" />
                </div>
                <div className="h-9 w-28 rounded-xl bg-stone-200" />
              </div>
            ))}
          </div>
        )}
        {pembayaranError && (
          <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Data pembayaran belum bisa diperbarui: {pembayaranError}
            <button type="button" onClick={refreshPembayaran} className="ml-2 font-bold underline">Coba lagi</button>
          </p>
        )}
        {pembayaranDimuat && !pembayaranError && selesai.map(q => {
          const pembayaran = daftarPembayaran.find(
            p => Number(p.antrean_id) === Number(q.id)
          );
          return (
            <div key={q.id} className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 p-4 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/40 hover:shadow-sm">
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
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                  style={{ background: ORANGE }}
                >
                  {prosesBayar && Number(idBayar) === Number(q.id)
                    ? <span className="inline-flex items-center gap-2"><LoaderCircle size={15} className="animate-spin" /> Memproses...</span>
                    : "Proses Pembayaran"}
                </button>
              )}
            </div>
          );
        })}
        {pembayaranDimuat && !pembayaranError && selesai.length === 0 && (
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
          <section className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
            <h1 className="mb-2 text-2xl font-extrabold" style={{ color: NAVY }}>Pengaturan Sistem</h1>
            <p className="mb-6 text-sm text-stone-500">Sesuaikan kenyamanan operasional bengkel.</p>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-stone-200 p-4 transition hover:bg-orange-50/30">
              <span className="flex items-center gap-3">
                <span className="rounded-xl bg-orange-50 p-3" style={{ color: ORANGE }}><Volume2 size={20} /></span>
                <span>
                  <span className="block text-sm font-bold" style={{ color: NAVY }}>Audio panggilan antrean</span>
                  <span className="block text-xs text-stone-500">Suara diputar ketika Admin memanggil antrean.</span>
                </span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-orange-500"
                checked={audio}
                onChange={(e) => setAudio(e.target.checked)}
              />
            </label>
          </section>
        );

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] text-neutral-900">
      <style>{`
        @keyframes bengkelMasuk {
          from { opacity: 0; transform: translateY(9px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bengkelToast {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bengkelBell {
          0%, 100% { transform: rotate(0); }
          20%, 60% { transform: rotate(-14deg); }
          40%, 80% { transform: rotate(14deg); }
        }
        .bengkel-bell-feedback { animation: bengkelBell .5s ease-in-out 1; }
        .bengkel-halaman { animation: bengkelMasuk .28s ease-out both; }
        .bengkel-toast { animation: bengkelToast .22s ease-out both; }
        .bengkel-stat-cards > * > * {
          transition: transform .22s ease, box-shadow .22s ease;
        }
        .bengkel-stat-cards > * > *:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(20, 35, 60, .08);
        }
        @media (prefers-reduced-motion: reduce) {
          .bengkel-halaman, .bengkel-toast, .bengkel-bell-feedback { animation: none; }
          .bengkel-stat-cards > * > * { transition: none; }
          .bengkel-stat-cards > * > *:hover { transform: none; box-shadow: none; }
        }
      `}</style>

      <Sidebar active={active} setActive={setActive} go={go} />

      <main className="min-w-0 flex-1">
        <Topbar audio={audio} setAudio={setAudio} />

        <div key={active} aria-busy={active === "Dashboard" && skeletonAwal} className="bengkel-halaman mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className="bengkel-toast fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-2xl sm:right-6 sm:top-6"
        >
          <span className={`rounded-full p-2 ${toast.type === "error" ? "bg-rose-50 text-rose-600" : toast.type === "call" ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>
            {toast.type === "error" ? <AlertCircle size={19} /> : toast.type === "call" ? <BellRing size={19} className="bengkel-bell-feedback" /> : <CheckCircle2 size={19} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold" style={{ color: NAVY }}>
              {toast.type === "error" ? "Perhatian" : toast.type === "call" ? "Panggilan Antrean" : "Berhasil"}
            </p>
            <p className="mt-1 break-words text-sm text-stone-600">{toast.message}</p>
          </div>
          <button type="button" onClick={() => { if (toastTimer.current) clearTimeout(toastTimer.current); setToast(null); }}
            className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700" aria-label="Tutup pesan">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
