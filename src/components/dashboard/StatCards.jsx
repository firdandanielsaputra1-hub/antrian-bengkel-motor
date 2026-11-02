
import {
  Hourglass,
  Wrench,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function StatCards({ queues = [] }) {
  const today = new Date().toLocaleDateString("en-CA");
  const data = queues.filter(q => q.tanggal === today);

  const menunggu = data.filter(q => q.status === "Menunggu").length;
  const dilayani = data.filter(q => q.status === "Sedang Dilayani").length;
  const selesai = data.filter(q => q.status === "Selesai").length;
  const dilewati = data.filter(q => q.status === "Dilewati").length;

  const stats = [
    {
      label: "Menunggu",
      n: menunggu,
      icon: Hourglass,
      tone: "bg-orange-50 text-orange-700",
      chip: `${menunggu} Motor`,
      note: "Menunggu panggilan"
    },
    {
      label: "Sedang Dilayani",
      n: dilayani,
      icon: Wrench,
      tone: "bg-violet-100 text-violet-700",
      chip: `${dilayani} Pit Aktif`,
      note: "Motor sedang dikerjakan"
    },
    {
      label: "Selesai Hari Ini",
      n: selesai,
      icon: CheckCircle2,
      tone: "bg-emerald-100 text-emerald-700",
      chip: `${selesai} Motor Selesai`,
      note: "Servis telah selesai"
    },
    {
      label: "Dilewati",
      n: dilewati,
      icon: AlertTriangle,
      tone: "bg-amber-100 text-amber-700",
      chip: `${dilewati} Terlewat`,
      note: "Antrean dilewati admin"
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, n, icon: Icon, tone, chip, note }) => (
        <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-neutral-700">{label}</div>
              <div className="text-4xl font-extrabold mt-1">{n}</div>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}>
              <Icon size={22} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 text-xs text-neutral-600">
            <span className={`rounded-full px-2.5 py-1 font-semibold ${tone}`}>
              {chip}
            </span>
            {note}
          </div>
        </div>
      ))}
    </div>
  );
}
