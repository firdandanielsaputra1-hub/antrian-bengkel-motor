import { Hourglass, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Menunggu", n: 8, icon: Hourglass, tone: "bg-orange-50 text-orange-700", chip: "8 Motor", note: "Estimasi tunggu ~35 mnt" },
  { label: "Sedang Dilayani", n: 3, icon: Wrench, tone: "bg-violet-100 text-violet-700", chip: "3 Pit Aktif (100%)", note: "Pit 1, Pit 2, Pit 3 terisi" },
  { label: "Selesai Hari Ini", n: 15, icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700", chip: "15 Motor Selesai", note: "Total Rp 2.450.000" },
  { label: "Dilewati", n: 2, icon: AlertTriangle, tone: "bg-amber-100 text-amber-700", chip: "2 Terlewat", note: "Toleransi >10 mnt habis" },
];

export default function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, n, icon: Icon, tone, chip, note }) => (
        <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-neutral-700">{label}</div>
              <div className="text-4xl font-extrabold mt-1">{n}</div>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}><Icon size={22} /></div>
          </div>
          <div className="flex items-center gap-2 mt-5 text-xs text-neutral-600">
            <span className={`rounded-full px-2.5 py-1 font-semibold ${tone}`}>{chip}</span> {note}
          </div>
        </div>
      ))}
    </div>
  );
}