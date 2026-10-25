import { useState } from "react";
import { Search, Volume2, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { NAVY, ORANGE } from "../../constants/theme";
import { rows, badge, action } from "../../data/dashboardData";

const heads = ["No. Tiket", "Pelanggan & Kontak", "Kendaraan & Nopol", "Layanan & Estimasi", "Alokasi Pit", "Daftar / Tunggu", "Status", "Aksi"];

export default function QueueTable() {
  const [q, setQ] = useState("");
  const list = rows.filter((r) => (r.no + r.nama + r.plat).toLowerCase().includes(q.toLowerCase()));

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h3 className="font-bold text-lg">Antrian Terdekat &amp; Pengerjaan</h3>
          <p className="text-xs text-neutral-600">Daftar giliran kendaraan yang menunggu dan aktif di bengkel</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 h-10">
            <Search size={15} className="text-neutral-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari no tiket, nama, nopol..." className="bg-transparent outline-none text-sm w-52" />
          </div>
          <select className="bg-stone-100 rounded-xl px-3 h-10 text-sm"><option>Semua Status</option></select>
          <select className="bg-stone-100 rounded-xl px-3 h-10 text-sm"><option>Semua Layanan</option></select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-stone-100 text-left text-xs text-neutral-700">
            <tr>{heads.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.no} className={`border-t border-stone-100 ${r.status === "Dipanggil" ? "bg-blue-50/40" : ""}`}>
                <td className="px-4 py-3 font-extrabold" style={{ color: r.no.startsWith("B") ? ORANGE : r.status === "Dipanggil" ? NAVY : "inherit" }}>{r.no}</td>
                <td className="px-4 py-3"><b>{r.nama}</b><div className="text-xs text-neutral-500">{r.hp}</div></td>
                <td className="px-4 py-3"><b>{r.motor}</b><div className="text-xs text-neutral-500 font-mono">{r.plat}</div></td>
                <td className="px-4 py-3">{r.svc}<div className="text-xs text-neutral-500">{r.dur}</div></td>
                <td className="px-4 py-3 text-neutral-700">{r.pit}</td>
                <td className="px-4 py-3">{r.jam}<div className={`text-xs ${r.late ? "text-red-600" : "text-neutral-500"}`}>{r.tunggu}</div></td>
                <td className="px-4 py-3"><span className={`text-xs rounded-full px-3 py-1 ${badge[r.status]}`}>{r.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {action[r.status]
                      ? <button className="text-xs bg-stone-100 rounded-lg px-3 py-1.5 font-medium">{action[r.status]}</button>
                      : <button aria-label="Panggil" className="bg-stone-100 rounded-lg p-1.5" style={{ color: NAVY }}><Volume2 size={16} /></button>}
                    <button aria-label="Menu" className="bg-stone-100 rounded-lg p-1.5"><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-neutral-500">Tidak ada antrean yang cocok. Coba kata kunci lain.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-stone-100 text-xs text-neutral-700">
        <span>Menampilkan <b>{list.length}</b> dari <b>28</b> antrean hari ini</span>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><ChevronLeft size={14} /></button>
          {[1, 2, 3].map((p) => (
            <button key={p} className={`w-8 h-8 rounded-lg ${p === 1 ? "text-white" : "bg-white"}`} style={p === 1 ? { background: NAVY } : {}}>{p}</button>
          ))}
          <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><ChevronRight size={14} /></button>
        </div>
      </div>
    </section>
  );
}