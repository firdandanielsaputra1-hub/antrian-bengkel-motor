import { useEffect, useState } from "react";
import { Wrench, UserPlus, RefreshCw } from "lucide-react";
import { getDaftarMekanik, tambahMekanik } from "../services/mekanikAdmin";

const formKosong = {
  nama: "",
  email: "",
  password: "",
  hp: "",
  pit_nomor: "",
};

export default function KelolaMekanik() {
  const [form, setForm] = useState(formKosong);
  const [daftar, setDaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const muatMekanik = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getDaftarMekanik();
      setDaftar(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatMekanik();
  }, []);

  const ubahForm = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const simpanMekanik = async (e) => {
    e.preventDefault();
    if (busy) return;

    if (!form.pit_nomor) {
      alert("Pilih pit terlebih dahulu.");
      return;
    }

    setBusy(true);

    try {
      const res = await tambahMekanik({
        ...form,
        pit_nomor: Number(form.pit_nomor),
      });

      alert(res.message || "Mekanik berhasil ditambahkan.");

      setForm(formKosong);
      await muatMekanik();
    } catch (err) {
      alert("Gagal menambah mekanik: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const pitTerpakai = daftar.map((m) =>
    Number(m.pit_nomor)
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">
          Kelola Mekanik
        </h1>

        <p className="text-sm text-neutral-500 mt-1">
          Tambahkan akun mekanik dan tentukan pit kerja.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-5">
            <UserPlus size={20} />
            Tambah Mekanik
          </h2>

          <form onSubmit={simpanMekanik} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">
                Nama Mekanik
              </label>

              <input
                name="nama"
                value={form.nama}
                onChange={ubahForm}
                placeholder="Nama lengkap mekanik"
                required
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={ubahForm}
                placeholder="Email untuk login"
                required
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={ubahForm}
                minLength={8}
                placeholder="Minimal 8 karakter"
                required
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Nomor HP
              </label>

              <input
                name="hp"
                value={form.hp}
                onChange={ubahForm}
                placeholder="Nomor HP mekanik"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Penempatan Pit
              </label>

              <select
                name="pit_nomor"
                value={form.pit_nomor}
                onChange={ubahForm}
                required
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="">Pilih Pit</option>

                {[1, 2, 3].map((pit) => (
                  <option
                    key={pit}
                    value={pit}
                    disabled={pitTerpakai.includes(pit)}
                  >
                    Pit {pit}
                    {pitTerpakai.includes(pit)
                      ? " - Sudah ditempati"
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={busy || loading || Boolean(error)}
              className="bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {busy ? "Menyimpan..." : "Simpan Mekanik"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Wrench size={20} />
              Daftar Mekanik
            </h2>

            <button
              onClick={muatMekanik}
              className="border rounded-lg p-2"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>

          {loading && (
            <p className="text-sm text-neutral-500">
              Memuat data mekanik...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && daftar.length === 0 && (
            <p className="text-sm text-neutral-500">
              Belum ada mekanik yang didaftarkan.
            </p>
          )}

          {!loading && !error && daftar.map((m) => (
            <div
              key={m.id}
              className="border rounded-xl p-4 mb-3"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-bold">{m.nama}</p>
                  <p className="text-sm text-neutral-500">
                    {m.email}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {m.hp || "-"}
                  </p>
                </div>

                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm h-fit">
                  Pit {m.pit_nomor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
