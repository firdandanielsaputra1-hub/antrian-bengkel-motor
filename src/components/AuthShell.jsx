import { Bike } from "lucide-react";
import { NAVY, CREAM } from "../constants/theme";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8" style={{ background: CREAM }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow" style={{ background: NAVY }}>
        <Bike size={34} />
      </div>
      <h1 className="text-3xl font-extrabold mt-4 text-neutral-900 text-center">Antrian Bengkel Motor</h1>
      <p className="text-neutral-600 mt-1">Sistem Manajemen Servis &amp; Antrean</p>
      <span className="mt-4 inline-flex items-center gap-2 bg-stone-200/70 rounded-full px-4 py-1.5 text-sm text-neutral-700">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bengkel Buka • Pendaftaran Antrean Online
      </span>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-7 mt-8">
        <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
        <p className="text-neutral-600 mt-1 mb-6">{subtitle}</p>
        {children}
      </div>
      <div className="mt-6 text-center text-neutral-700">{footer}</div>
    </div>
  );
}