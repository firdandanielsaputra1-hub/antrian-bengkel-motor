import { Store, Volume2, Bell, User } from "lucide-react";
import { NAVY } from "../../constants/theme";

export default function Topbar() {
  return (
    <header className="flex flex-wrap items-center gap-3 px-6 py-3 bg-white border-b border-stone-200">
      <button className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-2 text-xs text-left">
        <Store size={16} /> <span>Bengkel Resmi Motor<br />Cabang Utama</span>
      </button>
      <span className="text-xs text-neutral-600">Senin, 24 Oktober 2024 • <b style={{ color: NAVY }}>09:42 WIB</b></span>
      <div className="ml-auto flex items-center gap-3">
        <button className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 py-2 text-xs"><Volume2 size={14} /> Audio Panggilan</button>
        <Bell size={18} className="text-neutral-600" />
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: NAVY }}><User size={18} /></div>
          <div className="text-xs leading-tight">
            <div className="font-semibold">Rina <span className="text-[10px] bg-blue-100 px-1.5 rounded" style={{ color: NAVY }}>Resepsionis</span></div>
            <div className="text-neutral-500">Loket Pendaftaran 01</div>
          </div>
        </div>
      </div>
    </header>
  );
}