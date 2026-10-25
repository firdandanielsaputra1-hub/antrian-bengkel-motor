import { Bike } from "lucide-react";
import { NAVY, ORANGE, CREAM } from "../constants/theme";

export default function CustomerHome({ user, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: CREAM }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: NAVY }}>
        <Bike size={34} />
      </div>
      <h1 className="text-2xl font-extrabold mt-4">Halo, {user.nama}</h1>
      <p className="text-neutral-600 mt-1">Halaman pelanggan sedang disiapkan.</p>
      <button onClick={onLogout} className="mt-6 rounded-2xl px-6 h-12 text-white font-bold" style={{ background: ORANGE }}>
        Keluar
      </button>
    </div>
  );
}