import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function KuotaHarian() {
  const [kuota, setKuota] = useState("12");
  const [terpakai, setTerpakai] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await api("antrean/kuota.php");
        if (res?.ok === false || !res?.data) {
          throw new Error(res?.message || "Data kuota tidak tersedia.");
        }
        if (mounted) {
          setKuota(String(res.data.batas_harian));
          setTerpakai(Number(res.data.terpakai) || 0);
        }
      } catch (err) {
        if (mounted) setError(err?.message || "Gagal mengambil data kuota.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  async function simpanKuota(event) {
    event.preventDefault();
    if (menyimpan) return;
    setError("");
    setPesan("");

    const batas = Number(kuota);
    if (!Number.isInteger(batas) || batas < 1 || batas > 30) {
      setError("Kuota harus berupa bilangan bulat antara 1 sampai 30.");
      return;
    }

    setMenyimpan(true);
    try {
      const res = await api("antrean/kuota.php", {
        method: "POST",
        body: JSON.stringify({ batas_harian: batas }),
      });
      if (res?.ok === false || !res?.data) {
        throw new Error(res?.message || "Kuota gagal disimpan.");
      }
      setKuota(String(res.data.batas_harian));
      setTerpakai(Number(res.data.terpakai) || 0);
      setPesan("Kuota antrean hari ini berhasil diperbarui.");
    } catch (err) {
      setError(err?.message || "Gagal menyimpan kuota.");
    } finally {
      setMenyimpan(false);
    }
  }

  const batas = Number(kuota) || 0;
  const sisa = Math.max(0, batas - terpakai);

  return (
    <section className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-extrabold text-slate-800">Pengaturan Kuota Harian</h2>
      <p className="mt-1 text-sm text-stone-500">Admin dapat menyesuaikan kuota antrean untuk hari ini. Batas awal setiap hari 12 motor.</p>

      {loading ? (
        <p className="mt-4 text-sm text-stone-500">Memuat pengaturan kuota...</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-stone-50 p-3">
              <p className="text-xs text-stone-500">Nomor diterbitkan hari ini</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{terpakai}</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-3">
              <p className="text-xs text-stone-500">Sisa kuota (sesuai input)</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{sisa}</p>
            </div>
          </div>

          <form onSubmit={simpanKuota} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="block text-sm font-semibold text-slate-800">
              Maksimal antrean per hari
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={kuota}
                onChange={(e) => setKuota(e.target.value)}
                className="mt-2 block w-40 rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-orange-400"
              />
            </label>
            <button
              type="submit"
              disabled={menyimpan}
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {menyimpan ? "Menyimpan..." : "Simpan Kuota"}
            </button>
          </form>

          {batas < terpakai && (
            <p className="mt-3 text-sm text-amber-700">
              Kuota tidak boleh lebih kecil dari {terpakai} nomor yang sudah diterbitkan hari ini.
            </p>
          )}
          {sisa === 0 && batas >= terpakai && (
            <p className="mt-3 text-sm text-amber-700">Kuota antrean hari ini penuh.</p>
          )}
        </>
      )}
      {pesan && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">{pesan}</p>}
      {error && <p role="alert" className="mt-3 text-sm font-medium text-rose-700">{error}</p>}
    </section>
  );
}
