
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  Clock,
  Wrench,
  CheckCircle,
  ClipboardList,
  RefreshCw,
  LogOut,
  Bike,
  Menu,
  X,
  User,
  Receipt
} from "lucide-react";

import { NAVY, ORANGE, CREAM } from "../constants/theme";
import { api } from "../services/api";

export default function OwnerDashboard({ user, onLogout }) {
  const [menu, setMenu] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ambilData = async () => {
    setLoading(true);
    setError("");

    try {
      const hasil = await api("owner/summary.php");
      setData(hasil);
    } catch (err) {
      setError(err.message || "Gagal mengambil data Owner.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilData();
  }, []);

  const angka = (nilai) => Number(nilai || 0);

  const rupiah = (nilai) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(angka(nilai));

  const antrean = data?.antrean || {};
  const pembayaran = data?.pembayaran || {};

  const menus = [
    { nama: "Dashboard", icon: LayoutDashboard },
    { nama: "Laporan Pendapatan", icon: Wallet },
    { nama: "Monitoring Antrean", icon: ClipboardList }
  ];

  const kartu = (judul, nilai, Icon) => (
    <div className="bg-white rounded-2xl p-5 border border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-neutral-500">{judul}</p>
        <Icon size={23} style={{ color: ORANGE }} />
      </div>

      <h3
        className="text-2xl font-extrabold"
        style={{ color: NAVY }}
      >
        {nilai}
      </h3>
    </div>
  );

  const pilihMenu = (nama) => {
    setMenu(nama);
    setSidebarOpen(false);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: CREAM }}
    >
      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-neutral-200
          p-5 flex flex-col
          transform transition-transform
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
                Portal Owner
              </p>
            </div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.nama}
                onClick={() => pilihMenu(item.nama)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold"
                style={{
                  background:
                    menu === item.nama ? ORANGE : "transparent",
                  color:
                    menu === item.nama ? "white" : NAVY
                }}
              >
                <Icon size={20} />
                {item.nama}
              </button>
            );
          })}
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
            <button
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
                Dashboard Pemilik Bengkel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold">
            <User size={19} style={{ color: ORANGE }} />
            <span className="hidden sm:inline">
              {user?.nama || "Owner"}
            </span>
          </div>
        </header>

        <div className="p-5 md:p-8 max-w-6xl mx-auto">
          {/* JUDUL */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div>
              <h2
                className="text-xl font-extrabold"
                style={{ color: NAVY }}
              >
                Ringkasan Operasional
              </h2>

              <p className="text-sm text-neutral-500 mt-1">
                Data bengkel untuk hari ini
              </p>
            </div>

            <button
              onClick={ambilData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
              style={{ background: ORANGE }}
            >
              <RefreshCw size={18} />
              {loading ? "Memuat..." : "Perbarui Data"}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 mb-5">
              {error}
            </div>
          )}

          {loading && !data && (
            <p className="text-neutral-500">
              Sedang mengambil data dari MySQL...
            </p>
          )}

          {!loading && !data && !error && (
            <p className="text-neutral-500">
              Belum ada data yang tersedia.
            </p>
          )}

          {data && (
            <>
              {/* DASHBOARD */}
              {menu === "Dashboard" && (
                <>
                  <div
                    className="rounded-2xl p-6 md:p-8 text-white mb-6"
                    style={{ background: NAVY }}
                  >
                    <p className="text-sm opacity-80">
                      Selamat datang
                    </p>

                    <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
                      Halo, {user?.nama || "Owner"}!
                    </h2>

                    <p className="mt-3 text-sm opacity-90">
                      Pantau aktivitas antrean dan pendapatan
                      bengkel melalui halaman ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {kartu(
                      "Total Antrean Hari Ini",
                      angka(antrean.total),
                      ClipboardList
                    )}

                    {kartu(
                      "Antrean Menunggu",
                      angka(antrean.menunggu),
                      Clock
                    )}

                    {kartu(
                      "Sedang Dilayani",
                      angka(antrean.dilayani),
                      Wrench
                    )}

                    {kartu(
                      "Servis Selesai",
                      angka(antrean.selesai),
                      CheckCircle
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {kartu(
                      "Pendapatan Hari Ini",
                      rupiah(pembayaran.pendapatan),
                      Wallet
                    )}

                    {kartu(
                      "Transaksi Lunas",
                      angka(pembayaran.transaksi),
                      Receipt
                    )}
                  </div>
                </>
              )}

              {/* LAPORAN PENDAPATAN */}
              {menu === "Laporan Pendapatan" && (
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <h2
                    className="text-xl font-extrabold mb-5"
                    style={{ color: NAVY }}
                  >
                    Laporan Pendapatan Hari Ini
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {kartu(
                      "Total Pendapatan",
                      rupiah(pembayaran.pendapatan),
                      Wallet
                    )}

                    {kartu(
                      "Transaksi Lunas",
                      angka(pembayaran.transaksi),
                      Receipt
                    )}
                  </div>

                  <p className="text-sm text-neutral-500">
                    Data berasal dari tabel pembayaran
                    dengan status Lunas dan tanggal
                    pembayaran hari ini.
                  </p>
                </div>
              )}

              {/* MONITORING ANTREAN */}
              {menu === "Monitoring Antrean" && (
                <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                  <h2
                    className="text-xl font-extrabold mb-5"
                    style={{ color: NAVY }}
                  >
                    Monitoring Antrean Hari Ini
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {kartu(
                      "Total Antrean",
                      angka(antrean.total),
                      ClipboardList
                    )}

                    {kartu(
                      "Menunggu",
                      angka(antrean.menunggu),
                      Clock
                    )}

                    {kartu(
                      "Sedang Dilayani",
                      angka(antrean.dilayani),
                      Wrench
                    )}

                    {kartu(
                      "Selesai",
                      angka(antrean.selesai),
                      CheckCircle
                    )}
                  </div>

                  <p className="text-sm text-neutral-500">
                    Owner hanya memantau jumlah antrean.
                    Pengelolaan antrean tetap dilakukan Admin.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

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
