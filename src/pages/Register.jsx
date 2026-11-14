import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  ArrowRight,
  Bike,
  Eye,
  EyeOff,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import AuthShell from "../components/AuthShell";
import { NAVY, ORANGE } from "../constants/theme";
import { register } from "../services/auth";

// Komponen input dibuat lokal supaya Field.jsx di halaman lain tidak berubah.
function InputDaftar({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  disabled,
  error,
  valid,
  right,
  hint,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold" style={{ color: NAVY }}>
        {label}
      </label>

      <div
        className={`flex h-13 min-h-[52px] items-center gap-3 rounded-2xl border bg-white px-4 transition-all duration-200 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 ${
          error ? "border-red-300" : valid ? "border-emerald-200" : "border-stone-200 hover:border-stone-300"
        }`}
      >
        <Icon size={19} className="shrink-0 text-stone-400" aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? `${id}-info` : undefined}
          className="h-[52px] w-full min-w-0 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 disabled:opacity-60"
        />
        {right || (valid && <CheckCircle2 size={18} className="shrink-0 text-emerald-500" aria-hidden="true" />)}
      </div>

      {(error || hint) && (
        <p
          id={`${id}-info`}
          className={`mt-1.5 text-xs leading-5 ${error ? "text-red-600" : "text-stone-500"}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}

const emailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

function hitungKekuatan(sandi) {
  if (!sandi) return 0;
  let nilai = 0;
  if (sandi.length >= 8) nilai++;
  if (sandi.length >= 12) nilai++;
  if (/[a-z]/.test(sandi) && /[A-Z]/.test(sandi)) nilai++;
  if (/[0-9]/.test(sandi)) nilai++;
  if (/[^a-zA-Z0-9]/.test(sandi)) nilai++;
  return Math.min(nilai, 4);
}

export default function Register({ go }) {
  const [f, setF] = useState({
    nama: "",
    email: "",
    hp: "",
    pass: "",
    pass2: "",
    setuju: false,
  });
  const [tersentuh, setTersentuh] = useState({});
  const [lihatSandi, setLihatSandi] = useState(false);
  const [lihatKonfirmasi, setLihatKonfirmasi] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [berhasil, setBerhasil] = useState(false);
  const timerPindah = useRef(null);

  useEffect(() => {
    return () => {
      if (timerPindah.current) clearTimeout(timerPindah.current);
    };
  }, []);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((prev) => ({ ...prev, [key]: value }));
    setErr("");
  };

  const sentuh = (key) => () => {
    setTersentuh((prev) => ({ ...prev, [key]: true }));
  };

  const kesalahan = {
    nama: !f.nama.trim() ? "Nama lengkap wajib diisi." : "",
    email: !f.email.trim()
      ? "Email wajib diisi."
      : !emailValid(f.email)
      ? "Masukkan alamat email yang valid."
      : "",
    hp: !f.hp.trim() ? "Nomor HP / WhatsApp wajib diisi." : "",
    pass: f.pass.length < 8 ? "Kata sandi minimal 8 karakter." : "",
    pass2: !f.pass2 ? "Ulangi kata sandi." : f.pass2 !== f.pass ? "Kata sandi belum sama." : "",
    setuju: !f.setuju ? "Setujui syarat dan ketentuan untuk melanjutkan." : "",
  };

  const kekuatan = hitungKekuatan(f.pass);
  const labelKekuatan = ["", "Lemah", "Cukup", "Baik", "Kuat"][kekuatan];
  const warnaKekuatan = ["", "bg-red-400", "bg-amber-400", "bg-orange-400", "bg-emerald-500"][kekuatan];

  const submit = async (e) => {
    e.preventDefault();
    if (loading || berhasil) return;
    setErr("");
    setTersentuh({ nama: true, email: true, hp: true, pass: true, pass2: true, setuju: true });

    if (!f.nama.trim() || !f.email.trim() || !f.hp.trim()) {
      setErr("Lengkapi nama, email, dan nomor HP.");
      return;
    }
    if (!emailValid(f.email)) {
      setErr("Masukkan alamat email yang valid.");
      return;
    }
    if (f.pass.length < 8) {
      setErr("Kata sandi minimal 8 karakter.");
      return;
    }
    if (f.pass !== f.pass2) {
      setErr("Konfirmasi kata sandi tidak sama.");
      return;
    }
    if (!f.setuju) {
      setErr("Setujui syarat & ketentuan untuk melanjutkan.");
      return;
    }

    setLoading(true);
    try {
      // Tetap memakai API register PHP/MySQL yang sudah berjalan.
      const res = await register(f.nama.trim(), f.email.trim(), f.pass, f.hp.trim());
      if (!res.ok) {
        setErr(res.error || "Registrasi gagal.");
        return;
      }

      setBerhasil(true);
      // Beri waktu menampilkan visual feedback, lalu kembali ke Login seperti sebelumnya.
      timerPindah.current = setTimeout(() => go("login"), 1600);
    } catch (error) {
      setErr(error.message || "Terjadi kesalahan saat melakukan registrasi.");
    } finally {
      setLoading(false);
    }
  };

  const tombolMata = (aktif, ubah, label) => (
    <button
      type="button"
      onClick={() => ubah((prev) => !prev)}
      disabled={loading || berhasil}
      aria-label={aktif ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
      aria-pressed={aktif}
      className="shrink-0 rounded-lg p-1.5 text-stone-400 transition-colors duration-200 hover:bg-orange-50 hover:text-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 disabled:opacity-50"
    >
      {aktif ? <EyeOff size={19} /> : <Eye size={19} />}
    </button>
  );

  return (
    <AuthShell
      title="Daftar Akun Baru"
      subtitle="Buat akun pelanggan untuk mengambil antrean dan memantau servis motor Anda."
      footer={
        <>
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => go("login")}
            className="font-bold transition-opacity duration-200 hover:opacity-70 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: NAVY }}
          >
            Masuk ›
          </button>
        </>
      }
    >
      <style>{`
        @keyframes registerMasuk {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes registerGoyang {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
        }
        @keyframes registerMuncul {
          from { opacity: 0; transform: scale(.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .register-masuk { animation: registerMasuk 450ms ease-out both; }
        .register-error { animation: registerGoyang 280ms ease-in-out; }
        .register-sukses { animation: registerMuncul 320ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .register-masuk, .register-error, .register-sukses { animation: none; }
        }
      `}</style>

      <form onSubmit={submit} className="register-masuk space-y-5" noValidate>
        {berhasil && (
          <div role="status" className="register-sukses flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">Registrasi berhasil!</p>
              <p className="mt-1 text-sm">Akun pelanggan berhasil dibuat. Mengalihkan ke halaman login...</p>
            </div>
          </div>
        )}

        <InputDaftar
          id="reg-nama"
          label="Nama Lengkap"
          icon={User}
          placeholder="Contoh: Budi Santoso"
          autoComplete="name"
          value={f.nama}
          onChange={set("nama")}
          onBlur={sentuh("nama")}
          disabled={loading || berhasil}
          error={tersentuh.nama ? kesalahan.nama : ""}
          valid={Boolean(tersentuh.nama && !kesalahan.nama)}
        />

        <InputDaftar
          id="reg-email"
          label="Email"
          icon={Mail}
          type="email"
          placeholder="Contoh: budi@email.com"
          autoComplete="email"
          value={f.email}
          onChange={set("email")}
          onBlur={sentuh("email")}
          disabled={loading || berhasil}
          error={tersentuh.email ? kesalahan.email : ""}
          valid={Boolean(tersentuh.email && !kesalahan.email)}
        />

        <InputDaftar
          id="reg-hp"
          label="Nomor HP / WhatsApp"
          icon={Phone}
          type="tel"
          placeholder="Contoh: 081234567890"
          autoComplete="tel"
          value={f.hp}
          onChange={set("hp")}
          onBlur={sentuh("hp")}
          disabled={loading || berhasil}
          error={tersentuh.hp ? kesalahan.hp : ""}
          valid={Boolean(tersentuh.hp && !kesalahan.hp)}
          hint="Nomor kontak bengkel. Notifikasi antrean melalui web dapat diaktifkan setelah login."
        />

        <div>
          <InputDaftar
            id="reg-pass"
            label="Kata Sandi"
            icon={Lock}
            type={lihatSandi ? "text" : "password"}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            value={f.pass}
            onChange={set("pass")}
            onBlur={sentuh("pass")}
            disabled={loading || berhasil}
            error={tersentuh.pass ? kesalahan.pass : ""}
            right={tombolMata(lihatSandi, setLihatSandi, "kata sandi")}
          />
          {f.pass.length > 0 && (
            <div className="mt-3" aria-label={`Perkiraan kekuatan kata sandi: ${labelKekuatan}`}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs text-stone-500">Perkiraan kekuatan sandi</span>
                <span className="text-xs font-semibold" style={{ color: NAVY }}>{labelKekuatan}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4].map((nomor) => (
                  <span
                    key={nomor}
                    className={`h-1.5 rounded-full transition-colors duration-300 ${nomor <= kekuatan ? warnaKekuatan : "bg-stone-200"}`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-stone-500">Gunakan sandi panjang dan tidak mudah ditebak.</p>
            </div>
          )}
        </div>

        <InputDaftar
          id="reg-pass2"
          label="Konfirmasi Kata Sandi"
          icon={KeyRound}
          type={lihatKonfirmasi ? "text" : "password"}
          placeholder="Ulangi kata sandi"
          autoComplete="new-password"
          value={f.pass2}
          onChange={set("pass2")}
          onBlur={sentuh("pass2")}
          disabled={loading || berhasil}
          error={tersentuh.pass2 ? kesalahan.pass2 : ""}
          valid={Boolean(f.pass2 && !kesalahan.pass2)}
          right={tombolMata(lihatKonfirmasi, setLihatKonfirmasi, "konfirmasi kata sandi")}
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-1 text-sm leading-6 text-neutral-700">
            <input
              type="checkbox"
              checked={f.setuju}
              onChange={set("setuju")}
              onBlur={sentuh("setuju")}
              disabled={loading || berhasil}
              aria-invalid={Boolean(tersentuh.setuju && kesalahan.setuju)}
              className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer accent-orange-500"
            />
            <span>
              Saya menyetujui <strong style={{ color: NAVY }}>Syarat &amp; Ketentuan</strong> serta{" "}
              <strong style={{ color: NAVY }}>Kebijakan Privasi</strong> bengkel.
            </span>
          </label>
          {tersentuh.setuju && kesalahan.setuju && (
            <p className="mt-1 text-xs text-red-600">{kesalahan.setuju}</p>
          )}
        </div>

        {err && (
          <div role="alert" className="register-error flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{err}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || berhasil}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          style={{ background: ORANGE }}
        >
          {loading ? (
            <>
              <LoaderCircle size={20} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Sedang mendaftar...
            </>
          ) : berhasil ? (
            <>
              <CheckCircle2 size={20} aria-hidden="true" />
              Berhasil terdaftar
            </>
          ) : (
            <>
              Daftar Sekarang
              <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
            </>
          )}
        </button>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4" style={{ color: NAVY }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <Bike size={20} aria-hidden="true" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold">
              <ShieldCheck size={16} aria-hidden="true" /> Tips Pendaftaran
            </p>
            <p className="mt-1 text-sm leading-6">
              Setelah login, daftarkan data motor untuk mengambil nomor antrean. Kamu juga bisa
              mengaktifkan notifikasi browser agar tidak ketinggalan panggilan servis.
            </p>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
