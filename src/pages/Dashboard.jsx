
import { useEffect, useState } from "react";
import { Volume2, Plus } from "lucide-react";
import { NAVY, ORANGE } from "../constants/theme";

import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatCards from "../components/dashboard/StatCards";
import ActiveCall from "../components/dashboard/ActiveCall";
import PitCapacity from "../components/dashboard/PitCapacity";
import QueueTable from "../components/dashboard/QueueTable";

import {
  getQueues,
  addQueue,
  callNextQueue,
  updateQueue,
  speakQueue
} from "../services/queue";

export default function Dashboard({ go }) {
  const [active, setActive] = useState("Dashboard");
  const [queues, setQueues] = useState(() => getQueues());
  const [audio, setAudio] = useState(true);
  const [pitCadangan, setPitCadangan] = useState(
    () => localStorage.getItem("bengkel_pit4") === "true"
  );

  const [form, setForm] = useState({
    nama: "",
    hp: "",
    motor: "",
    plat: "",
    servis: ""
  });

  // Memperbarui data saat antrean berubah
  useEffect(() => {
    const refresh = () => setQueues(getQueues());

    window.addEventListener("queue-updated", refresh);
    window.addEventListener("storage", refresh);

    const timer = setInterval(refresh, 5000);

    return () => {
      window.removeEventListener("queue-updated", refresh);
      window.removeEventListener("storage", refresh);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("bengkel_pit4", String(pitCadangan));
  }, [pitCadangan]);

  const daftarPit = pitCadangan
    ? ["Pit 1", "Pit 2", "Pit 3", "Pit 4"]
    : ["Pit 1", "Pit 2", "Pit 3"];

  const pilihPit = (id) => {
    const kosong = daftarPit.filter(pit => !queues.some(q =>
      q.id !== id && q.status === "Sedang Dilayani" && q.pit === pit
    ));
    if (kosong.length === 0) {
      alert("Semua pit penuh. Selesaikan servis atau buka Pit 4 terlebih dahulu.");
      return null;
    }
    const pilihan = prompt(`Pilih pit tersedia: ${kosong.join(", ")}\nMasukkan angka pit:`, kosong[0].split(" ")[1]);
    if (pilihan === null) return null;
    const pit = `Pit ${pilihan.trim()}`;
    if (!kosong.includes(pit)) {
      alert("Pit tidak tersedia atau sudah terisi.");
      return null;
    }
    return pit;
  };

  const today = new Date().toLocaleDateString("en-CA");

  const todayQueues = queues.filter(
    (q) => q.tanggal === today
  );

  // Panggil antrean berikutnya
  const handleCall = () => {
    const result = callNextQueue();

    if (!result.ok) {
      alert(result.message);
      return;
    }

    if (audio) {
      speakQueue(result.queue);
    }

    alert(
      `Antrean ${result.queue.nomor} atas nama ${result.queue.nama} berhasil dipanggil.`
    );
  };

  // Menambahkan antrean baru
  const handleAdd = (e) => {
    e.preventDefault();

    if (
      !form.nama.trim() ||
      !form.motor.trim() ||
      !form.plat.trim() ||
      !form.servis
    ) {
      alert("Lengkapi semua data yang wajib diisi.");
      return;
    }

    const result = addQueue(
      form.nama.trim(),
      form.plat.trim().toUpperCase(),
      form.servis,
      form.hp.trim(),
      form.motor.trim()
    );

    alert(
      `Pendaftaran berhasil!\nNomor antrean: ${result.nomor}`
    );

    setForm({
      nama: "",
      hp: "",
      motor: "",
      plat: "",
      servis: ""
    });

    setActive("Kelola Antrian");
  };

  // Mengubah status antrean
  const handleStatus = (id, status) => {
    if (status === "Dipanggil") {
      const alreadyActive = queues.some(
        (q) => q.id !== id && q.status === "Dipanggil"
      );

      if (alreadyActive) {
        alert("Masih ada antrean yang sedang dipanggil.");
        return;
      }
    }

    if (status === "Sedang Dilayani") {
      const pit = pilihPit(id);
      if (!pit) return;
      updateQueue(id, { status, pit });
      return;
    }

    updateQueue(id, {
      status,
      ...(status === "Menunggu" || status === "Dilewati" ? { pit: "-" } : {})
    });
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

      <StatCards queues={queues} />

      <div className="grid gap-6 xl:grid-cols-5">
        <ActiveCall queues={queues} audio={audio} pitCadangan={pitCadangan} />
        <PitCapacity
          queues={queues}
          pitCadangan={pitCadangan}
          onTogglePitCadangan={() => {
            if (pitCadangan && queues.some(q =>
              q.status === "Sedang Dilayani" && q.pit === "Pit 4"
            )) {
              alert("Pit 4 masih terisi. Selesaikan servis terlebih dahulu.");
              return;
            }
            setPitCadangan(value => !value);
          }}
        />
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
                      onChange={(e) =>
                        handleStatus(q.id, e.target.value)
                      }
                      className="border border-stone-200 rounded-lg px-2 py-2"
                    >
                      <option value="Menunggu">Menunggu</option>
                      <option value="Dipanggil">Dipanggil</option>
                      <option value="Sedang Dilayani">
                        Sedang Dilayani
                      </option>
                      <option value="Selesai">Selesai</option>
                      <option value="Dilewati">Dilewati</option>
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

  // Halaman Pembayaran (sementara)
  const renderPembayaran = () => (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <h1 className="text-2xl font-extrabold mb-2">
        Pembayaran
      </h1>

      <p className="text-sm text-neutral-500 mb-5">
        Daftar pelanggan yang sudah menyelesaikan servis.
      </p>

      {todayQueues.filter(q => q.status === "Selesai").map(q => (
        <div
          key={q.id}
          className="flex flex-wrap justify-between items-center gap-3 border border-stone-200 rounded-xl p-4 mb-3"
        >
          <div>
            <b>{q.nomor} - {q.nama}</b>
            <p className="text-sm text-neutral-500">
              {q.motor} • {q.servis}
            </p>
          </div>

          <button
            onClick={() =>
              alert("Fitur transaksi pembayaran akan dibuat pada tahap berikutnya.")
            }
            className="text-white rounded-xl px-4 py-2.5 text-sm font-semibold"
            style={{ background: ORANGE }}
          >
            Proses Pembayaran
          </button>
        </div>
      ))}

      {todayQueues.filter(q => q.status === "Selesai").length === 0 && (
        <p className="text-sm text-neutral-500">
          Belum ada servis yang selesai.
        </p>
      )}
    </section>
  );

  // Menentukan halaman yang ditampilkan
  const renderContent = () => {
    switch (active) {
      case "Dashboard":
        return renderDashboard();

      case "Input Pelanggan":
        return renderInputPelanggan();

      case "Kelola Antrian":
        return renderKelolaAntrian();

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
