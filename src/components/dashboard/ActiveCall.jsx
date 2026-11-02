
import {
  Volume2,
  Bike,
  Wrench,
  Timer,
  Play,
  SkipForward,
  ArrowLeftRight
} from "lucide-react";

import { NAVY, ORANGE } from "../../constants/theme";
import { updateQueue, speakQueue } from "../../services/queue";

export default function ActiveCall({ queues = [], audio = true }) {
  const today = new Date().toLocaleDateString("en-CA");

  const current = queues.find(
    q => q.tanggal === today && q.status === "Dipanggil"
  );

  const handleStart = () => {
    if (!current) return;

    const pit = window.prompt("Masukkan nomor pit (1, 2, atau 3):", "1");

    if (pit === null) return;

    if (!["1", "2", "3"].includes(pit.trim())) {
      alert("Nomor pit harus 1, 2, atau 3.");
      return;
    }

    const occupied = queues.some(
      q =>
        q.id !== current.id &&
        q.status === "Sedang Dilayani" &&
        q.pit === `Pit ${pit.trim()}`
    );

    if (occupied) {
      alert("Pit tersebut sedang digunakan.");
      return;
    }

    updateQueue(current.id, {
      status: "Sedang Dilayani",
      pit: `Pit ${pit.trim()}`
    });
  };

  const handleSkip = () => {
    if (!current) return;

    if (window.confirm(`Lewati antrean ${current.nomor}?`)) {
      updateQueue(current.id, {
        status: "Dilewati",
        pit: "-"
      });
    }
  };

  const handleMove = () => {
    if (!current) return;

    const pit = window.prompt("Pindah ke pit nomor berapa? (1-3)", "2");

    if (pit === null) return;

    if (!["1", "2", "3"].includes(pit.trim())) {
      alert("Nomor pit tidak valid.");
      return;
    }

    updateQueue(current.id, { pit: `Pit ${pit.trim()}` });
  };

  return (
    <section
      className="xl:col-span-3 bg-white rounded-2xl shadow-sm p-6 border-t-4"
      style={{ borderColor: NAVY }}
    >
      <div className="flex justify-between items-center gap-2">
        <span
          className="text-xs font-bold rounded-full px-3 py-1.5 bg-blue-50"
          style={{ color: NAVY }}
        >
          ● {current ? "PANGGILAN AKTIF" : "BELUM ADA PANGGILAN"}
          {current?.pit && current.pit !== "-" ? ` • ${current.pit}` : ""}
        </span>

        <span className="text-xs text-neutral-600 flex items-center gap-1">
          <Volume2 size={14} />
          Pengeras Suara {audio ? "Siaga" : "Nonaktif"}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6 items-end">
        <div>
          <div className="text-xs text-neutral-600">NOMOR ANTREAN</div>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-extrabold" style={{ color: NAVY }}>
              {current?.nomor || "---"}
            </span>
            <span
              className="text-xs bg-blue-100 rounded-full px-3 py-1 mb-2"
              style={{ color: NAVY }}
            >
              {current ? "Dipanggil" : "Menunggu"}
            </span>
          </div>
        </div>

        <div className="bg-stone-100 rounded-xl p-4 text-sm">
          <div className="text-xs text-neutral-600">Mekanik Bertugas</div>
          <div className="font-bold text-lg">
            {current ? "Belum ditentukan" : "-"}
          </div>
          <div className="text-xs" style={{ color: NAVY }}>
            {current?.pit || "Belum dialokasikan"}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div className="bg-stone-100 rounded-xl p-4 flex gap-3 items-center">
          <Bike size={22} className="text-neutral-600" />
          <div className="text-sm">
            <div className="text-xs text-neutral-600">Pemilik & Kendaraan</div>
            <b>{current?.nama || "Belum ada pelanggan"}</b>
            <div className="text-xs text-neutral-500">
              {current ? `${current.motor || "Motor"} • ${current.plat}` : "-"}
            </div>
          </div>
        </div>

        <div className="bg-stone-100 rounded-xl p-4 flex gap-3 items-center">
          <Wrench size={22} style={{ color: ORANGE }} />
          <div className="text-sm">
            <div className="text-xs text-neutral-600">Paket Perbaikan</div>
            <b>{current?.servis || "Belum ada layanan"}</b>
            <div className="text-xs text-neutral-500">
              {current ? "Menunggu konfirmasi kehadiran" : "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
        <Timer size={18} className="text-red-600" />
        <span className="flex-1 text-neutral-700">
          {current
            ? "Pelanggan sedang dipanggil. Konfirmasi kehadiran atau lewati antrean."
            : "Belum ada antrean aktif yang dipanggil."}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          disabled={!current || !audio}
          onClick={() => speakQueue(current)}
          className="text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ background: ORANGE }}
        >
          <Volume2 size={16} /> Panggil Ulang Suara
        </button>

        <button
          disabled={!current}
          onClick={handleStart}
          className="text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ background: NAVY }}
        >
          <Play size={16} /> Konfirmasi Hadir (Mulai Servis)
        </button>

        <button
          disabled={!current}
          onClick={handleSkip}
          className="bg-stone-100 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <SkipForward size={16} /> Lewati Antrean
        </button>

        <button
          disabled={!current}
          onClick={handleMove}
          className="bg-stone-100 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeftRight size={16} /> Pindah Pit
        </button>
      </div>
    </section>
  );
}
