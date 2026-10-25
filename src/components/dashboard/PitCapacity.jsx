import { Store } from "lucide-react";
import { NAVY } from "../../constants/theme";
import { pits, badge } from "../../data/dashboardData";

export default function PitCapacity() {
  return (
    <section className="xl:col-span-2 bg-white rounded-2xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2"><Store size={18} style={{ color: NAVY }} /> Kapasitas Pit Mekanik</h3>
        <span className="text-xs text-neutral-600">3 dari 3 Aktif</span>
      </div>
      <div className="space-y-3">
        {pits.map((p) => (
          <div key={p.pit} className="bg-stone-100 rounded-xl p-4 text-sm">
            <div className="flex justify-between items-center">
              <b><span className="text-violet-600">●</span> {p.pit} <span className="font-normal text-xs text-neutral-600">• {p.mek}</span></b>
              <span className={`text-[11px] rounded-full px-2.5 py-0.5 ${badge[p.status]}`}>{p.status}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-700 mt-2"><span>{p.motor}</span><span>{p.job}</span></div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-stone-200"><div className="h-full rounded-full bg-violet-600" style={{ width: `${p.pct}%` }} /></div>
              <span className="text-xs">{p.eta ? `${p.pct}% (${p.eta})` : "Panggilan"}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs mt-5 text-neutral-600">
        <span>Butuh jalur cepat tambahan?</span>
        <button className="font-semibold" style={{ color: NAVY }}>⊕ Buka Pit Cadangan (Pit 4)</button>
      </div>
    </section>
  );
}