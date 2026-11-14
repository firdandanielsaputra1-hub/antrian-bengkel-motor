// Ditampilkan hanya pada pemuatan awal, bukan setiap sinkronisasi 5 detik.
function Blok({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-stone-200/80 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function DashboardSkeleton() {
  return (
    <section role="status" aria-label="Memuat data dashboard" className="space-y-6">
      <span className="sr-only">Sedang mengambil data antrean dari server.</span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {[1, 2, 3, 4].map((nomor) => (
          <div key={nomor} className="space-y-4 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
            <Blok className="h-3 w-28" />
            <Blok className="h-9 w-16" />
            <Blok className="h-3 w-36 max-w-full" />
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm" aria-hidden="true">
        <Blok className="h-5 w-48 max-w-full" />
        <Blok className="h-3 w-64 max-w-full" />
        <Blok className="h-3 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((nomor) => <Blok key={nomor} className="h-12 w-full" />)}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5" aria-hidden="true">
        <div className="space-y-4 rounded-2xl border border-stone-100 bg-white p-6 shadow-sm xl:col-span-3">
          <Blok className="h-5 w-40" />
          <Blok className="h-20 w-full" />
          <Blok className="h-10 w-3/4" />
        </div>
        <div className="space-y-4 rounded-2xl border border-stone-100 bg-white p-6 shadow-sm xl:col-span-2">
          <Blok className="h-5 w-36" />
          <Blok className="h-12 w-full" />
          <Blok className="h-12 w-full" />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm" aria-hidden="true">
        <Blok className="h-5 w-44" />
        {[1, 2, 3, 4].map((nomor) => (
          <div key={nomor} className="flex items-center gap-4 border-t border-stone-100 pt-4">
            <Blok className="h-5 w-14" />
            <Blok className="h-4 flex-1" />
            <Blok className="h-7 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}
