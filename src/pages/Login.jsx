import { useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import AuthShell from "../components/AuthShell";
import { NAVY, ORANGE } from "../constants/theme";
import { login } from "../services/auth";

export default function Login({ go, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErr("");

    if (!email.trim() || !pass) {
      setErr("Isi email dan kata sandi Anda.");
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), pass);

      if (!res.ok) {
        setErr(res.error || "Login gagal.");
        return;
      }

      onLogin(res.user);
    } catch (error) {
      setErr(error.message || "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Masuk ke Akun"
      subtitle="Masuk untuk melihat antrean dan riwayat servis motor Anda."
      footer={
        <>
          Belum punya akun?{" "}
          <button
            type="button"
            onClick={() => go("register")}
            className="font-bold transition-opacity duration-200 hover:opacity-70 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: NAVY }}
          >
            Daftar ›
          </button>
        </>
      }
    >
      <style>{`
        @keyframes loginEnter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
        }
        .login-enter { animation: loginEnter 450ms ease-out both; }
        .login-error { animation: loginShake 280ms ease-in-out; }
        @media (prefers-reduced-motion: reduce) {
          .login-enter, .login-error { animation: none; }
        }
      `}</style>

      <form onSubmit={submit} className="login-enter space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-semibold" style={{ color: NAVY }}>
            Email
          </label>
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 transition-all duration-200 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 hover:border-stone-300">
            <Mail size={19} className="shrink-0 text-stone-400" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="contoh: budi@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              aria-invalid={Boolean(err)}
              className="h-14 w-full min-w-0 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-semibold" style={{ color: NAVY }}>
            Kata Sandi
          </label>
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 transition-all duration-200 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 hover:border-stone-300">
            <Lock size={19} className="shrink-0 text-stone-400" aria-hidden="true" />
            <input
              id="login-password"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              disabled={loading}
              aria-invalid={Boolean(err)}
              className="h-14 w-full min-w-0 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPass((prev) => !prev)}
              aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              aria-pressed={showPass}
              className="shrink-0 rounded-lg p-1.5 text-stone-400 transition-colors duration-200 hover:bg-orange-50 hover:text-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
            >
              {showPass ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        {err && (
          <div
            role="alert"
            className="login-error flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{err}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          style={{ background: ORANGE }}
        >
          {loading ? (
            <>
              <LoaderCircle size={20} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Sedang masuk...
            </>
          ) : (
            <>
              Masuk
              <ArrowRight
                size={20}
                className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
