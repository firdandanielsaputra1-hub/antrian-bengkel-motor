import { aktifkanPushNotification } from "../services/push";
import { api } from "../services/api";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bike,
  Clock,
  CheckCircle,
  ArrowRight,
  LogOut,
  User,
  Menu,
  X,
  RefreshCw,
  ClipboardList,
  History,
  PlusCircle,
  BellRing,
  Check,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Wrench,
  MapPin,
} from "lucide-react";

import { NAVY, ORANGE, CREAM } from "../constants/theme";
import {
  buatAntrean,
  ambilDaftarAntrean,
} from "../services/antrean";


// Skeleton dipakai hanya untuk pengambilan data pertama, bukan saat polling 15 detik.
function SkeletonBar({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-stone-200/80 motion-reduce:animate-none ${className}`} />;
}

function CustomerSkeleton({ cards = false }) {
  return (
    <div role="status" aria-label="Memuat data pelanggan" className="space-y-5">
      <span className="sr-only">Sedang mengambil data dari server.</span>
      {cards && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-4 rounded-2xl border border-stone-100 bg-white p-5">
              <SkeletonBar className="h-4 w-28" />
              <SkeletonBar className="h-9 w-16" />
              <SkeletonBar className="h-3 w-36 max-w-full" />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-4 rounded-2xl border border-stone-100 bg-white p-5" aria-hidden="true">
        <SkeletonBar className="h-5 w-44" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="space-y-3 rounded-xl border border-stone-100 p-4">
            <div className="flex items-center justify-between gap-2">
              <SkeletonBar className="h-6 w-24" />
              <SkeletonBar className="h-6 w-20" />
            </div>
            <SkeletonBar className="h-4 w-52 max-w-full" />
            <div className="grid grid-cols-4 gap-2"><SkeletonBar className="h-3" /><SkeletonBar className="h-3" /><SkeletonBar className="h-3" /><SkeletonBar className="h-3" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusStyles = {
  Menunggu: "border-amber-200 bg-amber-50 text-amber-700",
  Dipanggil: "border-blue-200 bg-blue-50 text-blue-700",
  "Sedang Dilayani": "border-violet-200 bg-violet-50 text-violet-700",
  Selesai: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Dilewati: "border-rose-200 bg-rose-50 text-rose-700",
};
const tahapan = ["Menunggu", "Dipanggil", "Sedang Dilayani", "Selesai"];

function TimelineAntrean({ status }) {
  const posisi = tahapan.indexOf(status);
  if (status === "Dilewati") {
    return <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700">Antrean ini dilewati. Hubungi petugas bengkel untuk informasi lebih lanjut.</p>;
  }
  if (posisi === -1) return null;
  return (
    <div className="mt-4 border-t border-stone-100 pt-4" aria-label={`Progres antrean: ${status}`}>
      <div className="grid grid-cols-4 gap-1 sm:gap-3">
        {tahapan.map((tahap, i) => (
          <div key={tahap} className="min-w-0 text-center">
            <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 sm:h-9 sm:w-9 ${i <= posisi ? "border-orange-500 bg-orange-500 text-white" : "border-stone-200 bg-white text-stone-400"} ${i === posisi ? "ring-4 ring-orange-100" : ""}`}>
              {i < posisi ? <Check size={16} /> : i + 1}
            </div>
            <div className="mt-2 text-[10px] font-semibold leading-snug sm:text-xs" style={{ color: i <= posisi ? "#374151" : "#a8a29e" }}>{tahap}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1" aria-hidden="true">
        {[0, 1, 2].map(i => <div key={i} className={`h-1 rounded-full transition-colors duration-500 ${posisi > i ? "bg-orange-400" : "bg-stone-200"}`} />)}
      </div>
    </div>
  );
}

function sapaanHari() {
  const jam = new Date().getHours();
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function CustomerHome({ user, onLogout }) {
  const [menu, setMenu] = useState("Beranda");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [antrean, setAntrean] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sudahDimuat, setSudahDimuat] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [error, setError] = useState("");
  const [mengaktifkanPush, setMengaktifkanPush] = useState(false);
  const [pushAktif, setPushAktif] = useState(false);
  // Peta posisi per ID antrean, dihitung oleh PHP dari antrean Menunggu hari ini.
  const [posisiMap, setPosisiMap] = useState({});
  const [posisiGagal, setPosisiGagal] = useState(false);
  // Kehadiran disimpan di PHP/MySQL, terpisah dari status antrean.
  const [kehadiranMap, setKehadiranMap] = useState({});
  const [prosesHadirId, setProsesHadirId] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const beriPesan = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), type === "error" ? 6500 : 4500);
  };

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const aktifkanNotifikasi = async () => {
    if (mengaktifkanPush || pushAktif) return;
    setMengaktifkanPush(true);
    try {
      await aktifkanPushNotification();
      setPushAktif(true);
      beriPesan("Notifikasi browser berhasil diaktifkan untuk akun ini.");
    } catch (err) {
      beriPesan("Gagal mengaktifkan notifikasi: " + (err.message || "Terjadi kesalahan."), "error");
    } finally {
      setMengaktifkanPush(false);
    }
  };

  const [form, setForm] = useState({
    merk: "",
    tipe: "",
    plat: "",
    keluhan: "",
  });

  const menus = [
    { nama: "Beranda", icon: Bike },
    { nama: "Ambil Antrean", icon: PlusCircle },
    { nama: "Motor Saya", icon: Bike },
    { nama: "Status Antrean", icon: ClipboardList },
    { nama: "Riwayat Servis", icon: History },
  ];

  // Permintaan awal menggunakan skeleton. Polling 15 detik tidak membuat halaman berkedip.
  const muatAntrean = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const hasil = await ambilDaftarAntrean();
      setAntrean(Array.isArray(hasil.data) ? hasil.data : []);
      setError("");
      return true;
    } catch (err) {
      setError(err.message || "Gagal mengambil data antrean.");
      if (silent) console.error("Gagal memperbarui antrean:", err);
      return false;
    } finally {
      if (!silent) setLoading(false);
      setSudahDimuat(true);
    }
  }, []);

  useEffect(() => {
    muatAntrean();
    const interval = setInterval(() => muatAntrean({ silent: true }), 15000);
    return () => clearInterval(interval);
  }, [muatAntrean]);

  // API khusus posisi. Tidak mengambil identitas/data antrean pelanggan lain.
  // Jika API posisi gagal, pendaftaran dan tampilan antrean tetap berjalan.
  const muatPosisi = useCallback(async () => {
    try {
      const hasil = await api("antrean/posisi-saya.php");
      if (!Array.isArray(hasil?.data)) {
        throw new Error("Format posisi antrean tidak valid.");
      }
      const map = Object.fromEntries(
        hasil.data.map((item) => [String(item.id), item])
      );
      setPosisiMap(map);
      setPosisiGagal(false);
      return true;
    } catch (error) {
      console.warn("Belum bisa memperbarui posisi antrean:", error);
      setPosisiMap({});
      setPosisiGagal(true);
      return false;
    }
  }, []);

  useEffect(() => {
    muatPosisi();
    const interval = setInterval(muatPosisi, 15000);
    return () => clearInterval(interval);
  }, [muatPosisi]);

  const muatKehadiran = useCallback(async () => {
    try {
      const hasil = await api("antrean/kehadiran.php");
      if (!Array.isArray(hasil?.data)) return;
      setKehadiranMap(Object.fromEntries(
        hasil.data.map(item => [String(item.antrean_id), item])
      ));
    } catch (error) {
      // Kegagalan modul hadir tidak boleh mengganggu status dan pendaftaran antrean.
      console.warn("Status kedatangan belum dapat dimuat:", error);
    }
  }, []);

  useEffect(() => {
    muatKehadiran();
    const interval = setInterval(muatKehadiran, 15000);
    return () => clearInterval(interval);
  }, [muatKehadiran]);

  const konfirmasiHadir = async (item) => {
    if (prosesHadirId !== null || kehadiranMap[String(item.id)]) return;
    if (!window.confirm(`Pastikan Anda sudah tiba di bengkel untuk antrean ${item.nomor}. Konfirmasi sekarang?`)) return;
    setProsesHadirId(item.id);
    try {
      const hasil = await api("antrean/kehadiran.php", {
        method: "POST",
        body: JSON.stringify({ antrean_id: item.id }),
      });
      if (!hasil?.data?.antrean_id) throw new Error("Respons konfirmasi hadir tidak lengkap.");
      setKehadiranMap(prev => ({
        ...prev,
        [String(item.id)]: hasil.data,
      }));
      beriPesan(`Kedatangan antrean ${item.nomor} tercatat. Silakan menunggu giliran.`);
    } catch (error) {
      beriPesan("Konfirmasi hadir gagal: " + (error.message || "Terjadi kesalahan."), "error");
    } finally {
      setProsesHadirId(null);
    }
  };

  const ubahMenu = (nama) => {
    setMenu(nama);
    setSidebarOpen(false);
    if (nama !== "Ambil Antrean") muatAntrean({ silent: true });
  };

  const ubahForm = (e) => {
    setForm((sebelumnya) => ({
      ...sebelumnya,
      [e.target.name]: e.target.value,
    }));
  };

  // Membuat antrean melalui PHP dan MySQL
  const ambilAntrean = async (e) => {
    e.preventDefault();

    if (
      !form.merk.trim() ||
      !form.tipe.trim() ||
      !form.plat.trim() ||
      !form.keluhan.trim()
    ) {
      beriPesan("Lengkapi semua data motor dan keluhan.", "error");
      return;
    }

    if (menyimpan) return;

    setMenyimpan(true);

    try {
      const hasil = await buatAntrean({
        nama: user?.nama || "Pelanggan",
        motor: `${form.merk.trim()} ${form.tipe.trim()}`,
        plat: form.plat.trim().toUpperCase(),
        servis: form.keluhan.trim(),
      });

      setForm({
        merk: "",
        tipe: "",
        plat: "",
        keluhan: "",
      });

      setMenu("Status Antrean");
      await Promise.all([muatAntrean({ silent: true }), muatPosisi(), muatKehadiran()]);
      beriPesan(`Berhasil mengambil antrean ${hasil.data.nomor}`);
    } catch (err) {
      beriPesan("Gagal mengambil antrean: " + (err.message || "Terjadi kesalahan."), "error");
    } finally {
      setMenyimpan(false);
    }
  };

  // Menyesuaikan kolom dari database ke tampilan
  const daftarAntrean = antrean.map((item) => ({
    ...item,
    motor: item.motor_nama || "",
    plat: item.plat || "",
    keluhan: item.servis || "",
    status: item.status || "Menunggu",
  }));

  const antreanAktif = daftarAntrean.filter(
    (item) => item.status !== "Selesai"
  );

  const antreanSelesai = daftarAntrean.filter(
    (item) => item.status === "Selesai"
  );

  // Motor diperoleh dari data antrean yang tersimpan
  const motor = Array.from(
    new Map(
      daftarAntrean.map((item) => [
        item.plat,
        {
          id: item.id,
          nama: item.motor,
          plat: item.plat,
        },
      ])
    ).values()
  );

  const skeletonAwal = loading && !sudahDimuat;

  const kartu = (judul, nilai, Icon) => (
    <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md motion-reduce:transform-none">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-neutral-500">{judul}</p>
        <span className="rounded-xl bg-orange-50 p-2.5" style={{ color: ORANGE }}><Icon size={22} /></span>
      </div>

      <h3
        className="text-3xl font-extrabold"
        style={{ color: NAVY }}
      >
        {nilai}
      </h3>
    </div>
  );

  const tombolMenu = (nama, Icon) => (
    <button
      key={nama}
      onClick={() => ubahMenu(nama)}
      className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 hover:translate-x-0.5 motion-reduce:transform-none"
      style={{
        background: menu === nama ? ORANGE : "transparent",
        color: menu === nama ? "white" : NAVY,
      }}
    >
      <Icon size={20} className="transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none" />
      {nama}
    </button>
  );

  const tampilanAntrean = (item) => (
    <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4 transition-all duration-200 hover:border-orange-200 hover:shadow-md sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Nomor Antrean</p>
          <h3 className="mt-1 text-2xl font-extrabold" style={{ color: NAVY }}>{item.nomor}</h3>
          <p className="mt-1 text-sm text-stone-500">{item.motor} - {item.plat}</p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold transition-colors duration-300 ${statusStyles[item.status] || "border-stone-200 bg-stone-50 text-stone-600"}`}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />{item.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-stone-700"><strong>Keluhan:</strong> {item.keluhan}</p>
      <p className="mt-2 text-xs text-stone-500">Tanggal: {item.tanggal}</p>
      {item.pit_nama && <p className="mt-1 text-xs text-stone-500">Pit: {item.pit_nama}</p>}

      {/* Mengonfirmasi hadir tidak memajukan antrean atau memanggil nomor. */}
      {kehadiranMap[String(item.id)] ? (
        <div role="status" className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={19} />
          Sudah di bengkel
          {kehadiranMap[String(item.id)].jam_hadir && (
            <span className="text-xs font-normal">(konfirmasi {kehadiranMap[String(item.id)].jam_hadir})</span>
          )}
        </div>
      ) : ["Menunggu", "Dipanggil"].includes(item.status) ? (
        <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/50 p-3">
          <p className="mb-3 text-xs text-stone-600">Jika sudah tiba di lokasi bengkel, beri tahu Admin melalui tombol ini.</p>
          <button
            type="button"
            onClick={() => konfirmasiHadir(item)}
            disabled={prosesHadirId !== null}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            style={{ background: ORANGE }}
          >
            {prosesHadirId === item.id
              ? <LoaderCircle size={17} className="animate-spin" />
              : <MapPin size={17} />}
            {prosesHadirId === item.id ? "Mengonfirmasi..." : "Saya Sudah di Bengkel"}
          </button>
          <p className="mt-2 text-xs text-stone-500">Konfirmasi kedatangan tidak mengubah urutan atau status antrean.</p>
        </div>
      ) : null}

      {item.status === "Menunggu" && (() => {
        const posisi = posisiMap[String(item.id)];
        const diDepan = posisi?.di_depan == null ? null : Number(posisi.di_depan);
        const urutan = posisi?.urutan == null ? null : Number(posisi.urutan);
        const valid = Number.isInteger(diDepan) && diDepan >= 0 && Number.isInteger(urutan) && urutan > 0;
        return (
          <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/70 p-4" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: NAVY }}>
                <Clock size={17} style={{ color: ORANGE }} /> Posisi antrean Anda
              </span>
              {valid && <strong className="rounded-full bg-white px-3 py-1 text-sm" style={{ color: NAVY }}>Urutan ke-{urutan}</strong>}
            </div>
            {valid ? (
              <p className="mt-2 text-sm text-stone-700">
                {diDepan === 0
                  ? "Tidak ada antrean berstatus Menunggu di depan Anda."
                  : `${diDepan} antrean berstatus Menunggu masih di depan Anda.`}
              </p>
            ) : (
              <p className="mt-2 text-sm text-stone-600">
                {posisiGagal ? "Posisi belum bisa dimuat. Status antrean tetap dapat dipantau." : "Menghitung posisi antrean..."}
              </p>
            )}
            <p className="mt-2 text-xs text-stone-500">
              Posisi dihitung dari antrean Menunggu hari ini berdasarkan urutan pendaftaran, bukan perkiraan menit.
              {valid && diDepan === 0 ? " Panggilan yang sedang aktif mungkin masih harus diselesaikan." : ""}
            </p>
          </div>
        );
      })()}

      {item.status === "Dipanggil" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700" role="status">
          <BellRing size={18} /> Nomor Anda sedang dipanggil. Silakan menuju petugas bengkel.
        </div>
      )}
      <TimelineAntrean status={item.status} />
    </article>
  );

  const emptyState = (Icon, title, detail, adaAksi = false) => (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 px-5 py-10 text-center">
      <span className="rounded-2xl bg-orange-50 p-4" style={{ color: ORANGE }}><Icon size={30} /></span>
      <h3 className="mt-4 font-extrabold" style={{ color: NAVY }}>{title}</h3>
      <p className="mt-2 max-w-md text-sm text-stone-500">{detail}</p>
      {adaAksi && <button type="button" onClick={() => ubahMenu("Ambil Antrean")} className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none" style={{ background: ORANGE }}>Ambil Antrean <ArrowRight size={16} /></button>}
    </div>
  );

  return (
    <div
      className="min-h-screen flex text-stone-900"
      style={{ background: CREAM }}
    >
      <style>{`
        @keyframes pelangganMasuk { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pelangganToast { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .pelanggan-halaman { animation: pelangganMasuk .3s ease-out both; }
        .pelanggan-toast { animation: pelangganToast .2s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .pelanggan-halaman, .pelanggan-toast { animation: none; } }
      `}</style>
      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-neutral-200
          p-5 flex flex-col overflow-y-auto
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
              style={{ background: NAVY }}
            >
              <Bike size={25} />
            </div>

            <div>
              <h2
                className="font-extrabold"
                style={{ color: NAVY }}
              >
                Bengkel Motor
              </h2>
              <p className="text-xs text-neutral-500">
                Portal Pelanggan
              </p>
            </div>
          </div>

          <button type="button" aria-label="Tutup menu"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav aria-label="Menu pelanggan" className="flex flex-col gap-2">
          {menus.map((item) =>
            tombolMenu(item.nama, item.icon)
          )}
        </nav>

        <div className="mt-auto pt-6">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* KONTEN */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-neutral-200 px-5 md:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Buka menu"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div>
              <h1
                className="text-xl md:text-2xl font-extrabold"
                style={{ color: NAVY }}
              >
                {menu}
              </h1>

              <p className="text-sm text-neutral-500">
                Dashboard Pelanggan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <User size={19} style={{ color: ORANGE }} />
            <span className="hidden sm:inline">
              {user?.nama || "Pelanggan"}
            </span>
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-6xl mx-auto">
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-stone-500">
            <span className="relative h-2 w-2 rounded-full bg-emerald-500">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-50 motion-reduce:animate-none" />
            </span>
            Pembaruan antrean otomatis setiap 15 detik
          </div>
          {/* NOTIFIKASI DAN REFRESH */}
          <div className="flex flex-wrap justify-end gap-3 mb-5">
            <button
              type="button"
              onClick={aktifkanNotifikasi}
              disabled={mengaktifkanPush || pushAktif}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transform-none"
              style={{ background: NAVY }}
            >
              {mengaktifkanPush ? <LoaderCircle size={17} className="animate-spin" /> : <BellRing size={17} />}
              {mengaktifkanPush
                ? "Mengaktifkan..."
                : pushAktif
                ? "Notifikasi Aktif"
                : "Aktifkan Notifikasi"}
            </button>
            <button
              type="button"
              onClick={async () => {
                const [berhasil] = await Promise.all([muatAntrean(), muatPosisi(), muatKehadiran()]);
                beriPesan(berhasil ? "Data antrean berhasil diperbarui." : "Gagal memperbarui data antrean.", berhasil ? "success" : "error");
              }}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold transition-all hover:border-orange-200 hover:bg-orange-50 disabled:opacity-50"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Perbarui Data"}
            </button>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <span className="inline-flex items-center gap-2"><AlertCircle size={18} /> {error}</span>
              <button type="button" onClick={() => muatAntrean()} className="font-bold underline">Coba lagi</button>
            </div>
          )}

          <div key={menu} className="pelanggan-halaman">
          {/* BERANDA */}
          {menu === "Beranda" && (
            <>
              <div
                className="relative isolate overflow-hidden rounded-3xl p-6 md:p-8 text-white mb-6 shadow-sm"
                style={{ background: `linear-gradient(115deg, ${NAVY} 0%, #254d7b 100%)` }}
              >
                <p className="text-sm opacity-80">
                  {sapaanHari()},
                </p>

                <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
                  Halo, {user?.nama || "Pelanggan"}!
                </h2>

                <p className="mt-3 text-sm opacity-90">
                  Daftarkan motor untuk servis dan pantau
                  antrean bengkel dengan mudah.
                </p>

                <button
                  onClick={() => ubahMenu("Ambil Antrean")}
                  className="group mt-6 flex items-center gap-2 rounded-xl px-5 py-3 font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] motion-reduce:transform-none"
                  style={{ background: ORANGE }}
                >
                  Ambil Antrean
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" />
                </button>
              </div>

              {skeletonAwal ? <CustomerSkeleton cards /> : (
                <>
                  <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {kartu("Motor Terdaftar", motor.length, Bike)}
                    {kartu("Antrean Aktif", antreanAktif.length, Clock)}
                    {kartu("Servis Selesai", antreanSelesai.length, CheckCircle)}
                  </div>
                  <section className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <h3 className="text-lg font-extrabold" style={{ color: NAVY }}>Antrean Saya</h3>
                      <button type="button" onClick={() => ubahMenu("Status Antrean")} className="text-xs font-bold hover:underline" style={{ color: ORANGE }}>Lihat Semua</button>
                    </div>
                    {antreanAktif.length === 0
                      ? emptyState(ClipboardList, "Belum ada antrean aktif", "Daftarkan motor untuk mendapatkan nomor antrean servis.", true)
                      : <div className="space-y-4">{antreanAktif.map(tampilanAntrean)}</div>}
                  </section>
                </>
              )}
            </>
          )}

          {/* AMBIL ANTREAN */}
          {menu === "Ambil Antrean" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-2xl">
              <h2
                className="text-xl font-extrabold mb-2"
                style={{ color: NAVY }}
              >
                <Wrench size={20} className="mr-2 inline" style={{ color: ORANGE }} />Formulir Pendaftaran Servis
              </h2>

              <p className="text-sm text-neutral-500 mb-6">
                Isi data motor dan keluhan untuk mengambil antrean.
              </p>

              <form onSubmit={ambilAntrean} className="space-y-4">
                <div>
                  <label htmlFor="customer-merk" className="block font-semibold text-sm mb-2">
                    Merk Motor
                  </label>

                  <input
                    id="customer-merk"
                    name="merk"
                    value={form.merk}
                    onChange={ubahForm}
                    placeholder="Contoh: Honda"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="customer-tipe" className="block font-semibold text-sm mb-2">
                    Tipe Motor
                  </label>

                  <input
                    id="customer-tipe"
                    name="tipe"
                    value={form.tipe}
                    onChange={ubahForm}
                    placeholder="Contoh: Vario 125"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="customer-plat" className="block font-semibold text-sm mb-2">
                    Nomor Polisi
                  </label>

                  <input
                    id="customer-plat"
                    name="plat"
                    value={form.plat}
                    onChange={ubahForm}
                    placeholder="Contoh: AG 1234 XX"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="customer-keluhan" className="block font-semibold text-sm mb-2">
                    Keluhan / Jenis Servis
                  </label>

                  <textarea
                    id="customer-keluhan"
                    name="keluhan"
                    value={form.keluhan}
                    onChange={ubahForm}
                    rows={4}
                    placeholder="Contoh: Ganti oli dan cek rem"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none transition duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={menyimpan}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transform-none"
                  style={{ background: ORANGE }}
                >
                  {menyimpan
                    ? <><LoaderCircle size={18} className="animate-spin" /> Menyimpan Antrean...</>
                    : <><PlusCircle size={18} /> Daftar Antrean</>}
                </button>
              </form>
            </div>
          )}

          {/* MOTOR SAYA */}
          {menu === "Motor Saya" && (
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm sm:p-6">
              <h2
                className="text-xl font-extrabold mb-5"
                style={{ color: NAVY }}
              >
                Daftar Motor Saya
              </h2>

              <p className="text-sm text-neutral-500 mb-5">
                Motor yang tercatat pada antrean hari ini.
              </p>

              {skeletonAwal ? <CustomerSkeleton /> : motor.length === 0 ? (
                emptyState(Bike, "Belum ada motor yang tercatat", "Motor muncul di sini setelah kamu mengambil antrean.", true)
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {motor.map((item) => (
                    <div
                      key={item.plat}
                      className="flex items-center gap-4 rounded-xl border border-stone-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md motion-reduce:transform-none"
                    >
                      <Bike
                        size={28}
                        style={{ color: ORANGE }}
                      />

                      <div>
                        <p className="font-bold">
                          {item.nama}
                        </p>

                        <p className="text-sm text-neutral-500">
                          {item.plat}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STATUS ANTREAN */}
          {menu === "Status Antrean" && (
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm sm:p-6">
              <h2
                className="text-xl font-extrabold mb-5"
                style={{ color: NAVY }}
              >
                Status Antrean Saya
              </h2>

              {skeletonAwal ? <CustomerSkeleton /> : daftarAntrean.length === 0 ? (
                emptyState(ClipboardList, "Belum ada antrean", "Nomor dan progres antrean akan muncul di sini setelah kamu mendaftar.", true)
              ) : (
                <div className="space-y-4">
                  {daftarAntrean.map(tampilanAntrean)}
                </div>
              )}
            </div>
          )}

          {/* RIWAYAT SERVIS */}
          {menu === "Riwayat Servis" && (
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm sm:p-6">
              <h2
                className="text-xl font-extrabold mb-5"
                style={{ color: NAVY }}
              >
                Riwayat Servis
              </h2>

              <p className="text-sm text-neutral-500 mb-5">
                Servis yang selesai hari ini.
              </p>

              {skeletonAwal ? <CustomerSkeleton /> : antreanSelesai.length === 0 ? (
                emptyState(History, "Belum ada servis selesai", "Servis yang selesai hari ini akan tampil di sini.")
              ) : (
                <div className="space-y-3">
                  {antreanSelesai.map(tampilanAntrean)}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </main>

      {/* Visual feedback: hanya muncul setelah aksi pengguna selesai. */}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className="pelanggan-toast fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-2xl sm:right-6 sm:top-6"
        >
          <span className={`rounded-full p-2 ${toast.type === "error" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
            {toast.type === "error" ? <AlertCircle size={19} /> : <CheckCircle2 size={19} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold" style={{ color: NAVY }}>{toast.type === "error" ? "Perhatian" : "Berhasil"}</p>
            <p className="mt-1 break-words text-sm text-stone-600">{toast.message}</p>
          </div>
          <button
            type="button"
            aria-label="Tutup pesan"
            onClick={() => {
              if (toastTimer.current) clearTimeout(toastTimer.current);
              setToast(null);
            }}
            className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          ><X size={18} /></button>
        </div>
      )}

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
