
import { useState } from "react";
import {
  Search,
  Volume2,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { NAVY, ORANGE } from "../../constants/theme";
import {
  updateQueue,
  speakQueue
} from "../../services/queue";

const heads = [
  "No. Tiket",
  "Pelanggan & Kontak",
  "Kendaraan & Nopol",
  "Layanan & Estimasi",
  "Alokasi Pit",
  "Daftar / Tunggu",
  "Status",
  "Aksi"
];

const badge = {
  Menunggu: "bg-orange-100 text-orange-700",
  Dipanggil: "bg-blue-100 text-blue-700",
  "Sedang Dilayani": "bg-violet-100 text-violet-700",
  Selesai: "bg-emerald-100 text-emerald-700",
  Dilewati: "bg-red-100 text-red-700"
};

export default function QueueTable({ queues = [], audio = true }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("Semua Status");
  const [layanan, setLayanan] = useState("Semua Layanan");
  const [page, setPage] = useState(1);

  const today = new Date().toLocaleDateString("en-CA");
  const data = queues.filter(item => item.tanggal === today);

  const layananList = [...new Set(data.map(item => item.servis))];

  const list = data.filter(item => {
    const cocokCari = (
      `${item.nomor} ${item.nama} ${item.plat}`
    ).toLowerCase().includes(q.toLowerCase());

    const cocokStatus =
      status === "Semua Status" || item.status === status;

    const cocokLayanan =
      layanan === "Semua Layanan" || item.servis === layanan;

    return cocokCari && cocokStatus && cocokLayanan;
  });

  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const shown = list.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handleAction = item => {
    if (item.status === "Menunggu") {
      const otherActive = queues.some(
        x => x.id !== item.id && x.status === "Dipanggil"
      );

      if (otherActive) {
        alert("Selesaikan panggilan aktif terlebih dahulu.");
        return;
      }

      updateQueue(item.id, {
        status: "Dipanggil",
        dipanggil: new Date().toISOString()
      });

      if (audio) speakQueue(item);
    } else if (item.status === "Dipanggil") {
      if (audio) speakQueue(item);
    } else if (item.status === "Sedang Dilayani") {
      if (confirm(`Tandai servis ${item.nomor} selesai?`)) {
        updateQueue(item.id, "Selesai");
      }
    } else if (item.status === "Dilewati") {
      updateQueue(item.id, "Menunggu");
    } else {
      alert("Servis sudah selesai.");
    }
  };

  const handleMenu = item => {
    const pilihan = prompt(
      `Ubah status ${item.nomor}:\n1. Menunggu\n2. Dipanggil\n3. Sedang Dilayani\n4. Selesai\n5. Dilewati`
    );

    const statuses = {
      "1": "Menunggu",
      "2": "Dipanggil",
      "3": "Sedang Dilayani",
      "4": "Selesai",
      "5": "Dilewati"
    };

    if (pilihan === null) return;

    if (!statuses[pilihan]) {
      alert("Pilihan tidak valid.");
      return;
    }

    if (
      pilihan === "2" &&
      queues.some(x => x.id !== item.id && x.status === "Dipanggil")
    ) {
      alert("Masih ada panggilan aktif.");
      return;
    }

    updateQueue(item.id, statuses[pilihan]);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h3 className="font-bold text-lg">Antrian Terdekat & Pengerjaan</h3>
          <p className="text-xs text-neutral-600">
            Daftar giliran kendaraan yang menunggu dan aktif di bengkel
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 h-10">
            <Search size={15} className="text-neutral-500" />
            <input
              value={q}
              onChange={e => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Cari no tiket, nama, nopol..."
              className="bg-transparent outline-none text-sm w-52"
            />
          </div>

          <select
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-stone-100 rounded-xl px-3 h-10 text-sm"
          >
            <option>Semua Status</option>
            {Object.keys(badge).map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={layanan}
            onChange={e => {
              setLayanan(e.target.value);
              setPage(1);
            }}
            className="bg-stone-100 rounded-xl px-3 h-10 text-sm"
          >
            <option>Semua Layanan</option>
            {layananList.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-stone-100 text-left text-xs text-neutral-700">
            <tr>
              {heads.map(h => (
                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {shown.map(r => (
              <tr
                key={r.id}
                className={`border-t border-stone-100 ${
                  r.status === "Dipanggil" ? "bg-blue-50/40" : ""
                }`}
              >
                <td className="px-4 py-3 font-extrabold" style={{ color: NAVY }}>
                  {r.nomor}
                </td>

                <td className="px-4 py-3">
                  <b>{r.nama}</b>
                  <div className="text-xs text-neutral-500">{r.hp || "-"}</div>
                </td>

                <td className="px-4 py-3">
                  <b>{r.motor || "Motor"}</b>
                  <div className="text-xs text-neutral-500 font-mono">
                    {r.plat}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {r.servis}
                  <div className="text-xs text-neutral-500">
                    Estimasi belum ditentukan
                  </div>
                </td>

                <td className="px-4 py-3 text-neutral-700">
                  {r.pit || "-"}
                </td>

                <td className="px-4 py-3">
                  {new Date(r.dibuat).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </td>

                <td className="px-4 py-3">
                  <span className={`text-xs rounded-full px-3 py-1 ${
                    badge[r.status] || "bg-stone-100"
                  }`}>
                    {r.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleAction(r)}
                      className="text-xs bg-stone-100 rounded-lg px-3 py-1.5 font-medium"
                      style={{ color: r.status === "Menunggu" ? ORANGE : NAVY }}
                    >
                      {r.status === "Menunggu"
                        ? "Panggil"
                        : r.status === "Dipanggil"
                        ? <Volume2 size={16} />
                        : r.status === "Sedang Dilayani"
                        ? "Selesaikan"
                        : r.status === "Dilewati"
                        ? "Aktifkan"
                        : "Selesai"}
                    </button>

                    <button
                      onClick={() => handleMenu(r)}
                      aria-label="Menu"
                      className="bg-stone-100 rounded-lg p-1.5"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {shown.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-neutral-500">
                  Tidak ada antrean yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-stone-100 text-xs text-neutral-700">
        <span>
          Menampilkan <b>{shown.length}</b> dari <b>{list.length}</b> antrean
        </span>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg ${
                p === currentPage ? "text-white" : "bg-white"
              }`}
              style={p === currentPage ? { background: NAVY } : {}}
            >
              {p}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
