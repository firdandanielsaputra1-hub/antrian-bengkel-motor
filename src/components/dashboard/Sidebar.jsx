import { Bike, LayoutDashboard, ListOrdered, UserPlus, Receipt, FileBarChart, Settings } from "lucide-react";
import { NAVY, ORANGE } from "../../constants/theme";

const menu = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Kelola Antrian", icon: ListOrdered },
  { label: "Input Pelanggan", icon: UserPlus },
  { label: "Pembayaran", icon: Receipt },
  { label: "Laporan Harian", icon: FileBarChart },
];

export default function Sidebar({ active, setActive, go }) {
  return (
    <aside className="w-64 shrink-0 text-white flex-col p-4 hidden md:flex" style={{ background: NAVY }}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ORANGE }}><Bike size={22} /></div>
        <div className="leading-tight">
          <div className="font-bold">Bengkel Motor</div>
          <div className="text-[11px] text-blue-200">Sistem Antrean Terpadu</div>
        </div>
      </div>
      <div className="text-[11px] tracking-wide text-blue-200 mb-2 px-2">MENU UTAMA</div>
      <nav className="flex flex-col gap-1">
        {menu.map(({ label, icon: Icon }) => (
          <button key={label} onClick={() => setActive(label)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left ${active === label ? "bg-blue-500/40 font-semibold" : "hover:bg-white/10 text-blue-100"}`}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto">
        <button className="flex items-center gap-3 px-3 py-3 text-sm text-blue-100"><Settings size={18} /> Pengaturan Sistem</button>
        <button onClick={() => go("login")} className="text-xs text-blue-200 px-3 mt-2">Keluar</button>
        <div className="flex justify-between text-[11px] text-blue-200 px-3 mt-3 border-t border-white/10 pt-3">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: ORANGE }} /> Server Loket Aktif</span>
          <span>v2.4</span>
        </div>
      </div>
    </aside>
  );
}