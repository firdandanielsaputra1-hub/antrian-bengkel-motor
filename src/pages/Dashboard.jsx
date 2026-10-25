import { useState } from "react";
import { Volume2, Plus } from "lucide-react";
import { NAVY, ORANGE } from "../constants/theme";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import StatCards from "../components/dashboard/StatCards";
import ActiveCall from "../components/dashboard/ActiveCall";
import PitCapacity from "../components/dashboard/PitCapacity";
import QueueTable from "../components/dashboard/QueueTable";

export default function Dashboard({ go }) {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="min-h-screen flex bg-stone-50 text-neutral-900">
      <Sidebar active={active} setActive={setActive} go={go} />

      <main className="flex-1 min-w-0">
        <Topbar />

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <h1 className="text-3xl font-extrabold">Ringkasan Operasional Antrean</h1>
              <p className="text-sm text-neutral-600 mt-1">Pantauan antrean bengkel langsung, utilisasi pit mekanik, dan panggilan servis aktif hari ini.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-[11px] bg-stone-200 rounded-full px-3 py-1 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Live Sync 5s</span>
              <button className="bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2" style={{ color: NAVY }}><Volume2 size={16} /> Panggil Suara Berikutnya</button>
              <button className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2" style={{ background: ORANGE }}><Plus size={16} /> Pendaftaran Antrian Baru</button>
            </div>
          </div>

          <StatCards />

          <div className="grid gap-6 xl:grid-cols-5">
            <ActiveCall />
            <PitCapacity />
          </div>

          <QueueTable />
        </div>
      </main>
    </div>
  );
}