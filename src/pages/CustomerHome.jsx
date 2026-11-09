
import { useState } from "react";
import {
  Bike,
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  History,
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle,
  User,
  ArrowRight
} from "lucide-react";

import { NAVY, ORANGE, CREAM } from "../constants/theme";

export default function CustomerHome({ user, onLogout }) {
  const [menu, setMenu] = useState("Beranda");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    merk: "",
    tipe: "",
    plat: "",
    keluhan: ""
  });

  const [motor, setMotor] = useState([]);
  const [antrean, setAntrean] = useState([]);

  const menus = [
    { nama: "Beranda", icon: LayoutDashboard },
    { nama: "Ambil Antrean", icon: PlusCircle },
    { nama: "Motor Saya", icon: Bike },
    { nama: "Status Antrean", icon: ListOrdered },
    { nama: "Riwayat Servis", icon: History }
  ];

  const ubahMenu = (nama) => {
    setMenu(nama);
    setSidebarOpen(false);
  };

  const ubahForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const ambilAntrean = (e) => {
    e.preventDefault();

    if (
      !form.merk.trim() ||
      !form.tipe.trim() ||
      !form.plat.trim() ||
      !form.keluhan.trim()
    ) {
      alert("Lengkapi semua data motor dan keluhan.");
      return;
    }

    const nomor = `A-${String(antrean.length + 1).padStart(3, "0")}`;

    const data = {
      id: Date.now(),
      nomor,
      merk: form.merk.trim(),
      tipe: form.tipe.trim(),
      plat: form.plat.trim().toUpperCase(),
      keluhan: form.keluhan.trim(),
      status: "Menunggu",
      tanggal: new Date().toLocaleDateString("id-ID")
    };

    setAntrean((prev) => [...prev, data]);

    setMotor((prev) => {
      const sudahAda = prev.some(
        (item) => item.plat === data.plat
      );

      if (sudahAda) return prev;

      return [
        ...prev,
        {
          id: data.id,
          merk: data.merk,
          tipe: data.tipe,
          plat: data.plat
        }
      ];
    });

    setForm({
      merk: "",
      tipe: "",
      plat: "",
      keluhan: ""
    });

    alert(`Berhasil mengambil antrean ${nomor}`);
    setMenu("Status Antrean");
  };

  const antreanAktif = antrean.filter(
    (item) => item.status !== "Selesai"
  );

  const kartu = (judul, nilai, Icon) => (
    <div className="bg-white rounded-2xl p-5 border border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-neutral-500">{judul}</p>
        <Icon size={22} style={{ color: ORANGE }} />
      </div>
      <h3 className="text-2xl font-extrabold" style={{ color: NAVY }}>
        {nilai}
      </h3>
    </div>
  );

  const tombolMenu = (nama, Icon) => (
    <button
      key={nama}
      onClick={() => ubahMenu(nama)}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition"
      style={{
        background: menu === nama ? ORANGE : "transparent",
        color: menu === nama ? "white" : NAVY
      }}
    >
      <Icon size={20} />
      {nama}
    </button>
  );

  return (
    <div
      className="min-h-screen flex"
      style={{ background: CREAM }}
    >
      {/* Sidebar */}
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
              <h2 className="font-extrabold" style={{ color: NAVY }}>
                Bengkel Motor
              </h2>
              <p className="text-xs text-neutral-500">
                Portal Pelanggan
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

      {/* Konten */}
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

          {/* BERANDA */}
          {menu === "Beranda" && (
            <>
              <div
                className="rounded-2xl p-6 md:p-8 text-white mb-6"
                style={{ background: NAVY }}
              >
                <p className="text-sm opacity-80">
                  Selamat datang kembali
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
                  className="mt-6 px-5 py-3 rounded-xl font-bold flex items-center gap-2"
                  style={{ background: ORANGE }}
                >
                  Ambil Antrean
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
                {kartu("Motor Terdaftar", motor.length, Bike)}
                {kartu(
                  "Antrean Aktif",
                  antreanAktif.length,
                  Clock
                )}
                {kartu(
                  "Servis Selesai",
                  antrean.filter(
                    (item) => item.status === "Selesai"
                  ).length,
                  CheckCircle
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                <h3
                  className="text-lg font-extrabold mb-4"
                  style={{ color: NAVY }}
                >
                  Antrean Saya
                </h3>

                {antreanAktif.length === 0 ? (
                  <p className="text-neutral-500 text-sm">
                    Belum ada antrean aktif. Klik Ambil Antrean
                    untuk mendaftarkan motor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {antreanAktif.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-xl p-4 flex justify-between gap-3"
                      >
                        <div>
                          <p className="font-bold">
                            {item.nomor}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {item.merk} {item.tipe} - {item.plat}
                          </p>
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: ORANGE }}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* AMBIL ANTREAN */}
          {menu === "Ambil Antrean" && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 max-w-2xl">
              <h2
                className="text-xl font-extrabold mb-2"
                style={{ color: NAVY }}
              >
                Formulir Pendaftaran Servis
              </h2>

              <p className="text-sm text-neutral-500 mb-6">
                Isi data motor dan keluhan untuk mengambil antrean.
              </p>

              <form onSubmit={ambilAntrean} className="space-y-4">
                <div>
                  <label className="block font-semibold text-sm mb-2">
                    Merk Motor
                  </label>
                  <input
                    name="merk"
                    value={form.merk}
                    onChange={ubahForm}
                    placeholder="Contoh: Honda"
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-2">
                    Tipe Motor
                  </label>
                  <input
                    name="tipe"
                    value={form.tipe}
                    onChange={ubahForm}
                    placeholder="Contoh: Vario 125"
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-2">
                    Nomor Polisi
                  </label>
                  <input
                    name="plat"
                    value={form.plat}
                    onChange={ubahForm}
                    placeholder="Contoh: AG 1234 XX"
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sm mb-2">
                    Keluhan / Jenis Servis
                  </label>
                  <textarea
                    name="keluhan"
                    value={form.keluhan}
                    onChange={ubahForm}
                    rows={4}
                    placeholder="Contoh: Ganti oli dan cek rem"
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-white font-bold"
                  style={{ background: ORANGE }}
                >
                  Daftar Antrean
                </button>
              </form>
            </div>
          )}

          {/* MOTOR SAYA */}
          {menu === "Motor Saya" && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="text-xl font-extrabold mb-5" style={{ color: NAVY }}>
                Daftar Motor Saya
              </h2>

              {motor.length === 0 ? (
                <p className="text-neutral-500">
                  Belum ada motor terdaftar.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {motor.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-xl p-4 flex items-center gap-4"
                    >
                      <Bike size={28} style={{ color: ORANGE }} />
                      <div>
                        <p className="font-bold">
                          {item.merk} {item.tipe}
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
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="text-xl font-extrabold mb-5" style={{ color: NAVY }}>
                Status Antrean Saya
              </h2>

              {antrean.length === 0 ? (
                <p className="text-neutral-500">
                  Kamu belum mengambil antrean.
                </p>
              ) : (
                <div className="space-y-4">
                  {antrean.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-xl p-5"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-xl font-extrabold" style={{ color: NAVY }}>
                            {item.nomor}
                          </p>
                          <p className="text-sm text-neutral-500 mt-1">
                            {item.merk} {item.tipe} - {item.plat}
                          </p>
                        </div>

                        <span
                          className="font-bold text-sm"
                          style={{ color: ORANGE }}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-sm mt-4">
                        Keluhan: {item.keluhan}
                      </p>

                      <p className="text-xs text-neutral-500 mt-2">
                        Tanggal: {item.tanggal}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RIWAYAT SERVIS */}
          {menu === "Riwayat Servis" && (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h2 className="text-xl font-extrabold mb-5" style={{ color: NAVY }}>
                Riwayat Servis
              </h2>

              {antrean.filter(
                (item) => item.status === "Selesai"
              ).length === 0 ? (
                <p className="text-neutral-500">
                  Belum ada riwayat servis selesai.
                </p>
              ) : (
                antrean
                  .filter((item) => item.status === "Selesai")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-xl p-4 mb-3"
                    >
                      <p className="font-bold">
                        {item.nomor} - {item.plat}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {item.tanggal} - Selesai
                      </p>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </main>

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
