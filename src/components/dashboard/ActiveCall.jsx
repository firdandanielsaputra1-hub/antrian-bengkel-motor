import { Volume2, Bike, Wrench, Timer, Play, SkipForward, ArrowLeftRight } from "lucide-react";
import { NAVY, ORANGE } from "../../constants/theme";

export default function ActiveCall() {
  return (
    <section className="xl:col-span-3 bg-white rounded-2xl shadow-sm p-6 border-t-4" style={{ borderColor: NAVY }}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold rounded-full px-3 py-1.5 bg-blue-50" style={{ color: NAVY }}>● PANGGILAN AKTIF • PIT 2</span>
        <span className="text-xs text-neutral-600 flex items-center gap-1"><Volume2 size={14} /> Pengeras Suara Siaga</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6 items-end">
        <div>
          <div className="text-xs text-neutral-600">NOMOR ANTREAN</div>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-extrabold" style={{ color: NAVY }}>A-007</span>
            <span className="text-xs bg-blue-100 rounded-full px-3 py-1 mb-2" style={{ color: NAVY }}>Dipanggil</span>
          </div>
        </div>
        <div className="bg-stone-100 rounded-xl p-4 text-sm">
          <div className="text-xs text-neutral-600">Mekanik Bertugas</div>
          <div className="font-bold text-lg">Mas Joko Hartanto</div>
          <div className="text-xs" style={{ color: NAVY }}>Pit 2 (Lift Hidrolik A)</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div className="bg-stone-100 rounded-xl p-4 flex gap-3 items-center">
          <Bike size={22} className="text-neutral-600" />
          <div className="text-sm"><div className="text-xs text-neutral-600">Pemilik &amp; Kendaraan</div><b>Budi Santoso</b><div className="text-xs text-neutral-500">Honda Beat • L 1234 AB</div></div>
        </div>
        <div className="bg-stone-100 rounded-xl p-4 flex gap-3 items-center">
          <Wrench size={22} style={{ color: ORANGE }} />
          <div className="text-sm"><div className="text-xs text-neutral-600">Paket Perbaikan</div><b>Servis Rutin + Oli Mesin</b><div className="text-xs text-neutral-500">Estimasi 45 mnt • Rp 125.000</div></div>
        </div>
      </div>

      <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3 text-sm">
        <Timer size={18} className="text-red-600" />
        <span className="flex-1 text-neutral-700">Sisa toleransi konfirmasi kehadiran sebelum dialihkan ke Dilewati</span>
        <span className="font-mono font-bold text-red-700 bg-white rounded-lg px-3 py-1">04:18</span>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        <button className="text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2" style={{ background: ORANGE }}><Volume2 size={16} /> Panggil Ulang Suara</button>
        <button className="text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2" style={{ background: NAVY }}><Play size={16} /> Konfirmasi Hadir (Mulai Servis)</button>
        <button className="bg-stone-100 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2"><SkipForward size={16} /> Lewati Antrean</button>
        <button className="bg-stone-100 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2"><ArrowLeftRight size={16} /> Pindah Pit</button>
      </div>
    </section>
  );
}