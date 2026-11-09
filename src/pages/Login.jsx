
import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Field from "../components/Field";
import AuthShell from "../components/AuthShell";
import { NAVY, ORANGE } from "../constants/theme";
import { login } from "../services/auth";

export default function Login({ go, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
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
            className="font-bold"
            style={{ color: NAVY }}
          >
            Daftar ›
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <Field
          label="Email"
          icon={Mail}
          type="email"
          placeholder="contoh: budi@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Field
          label="Kata Sandi"
          icon={Lock}
          type="password"
          placeholder="Masukkan kata sandi"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {err && (
          <p
            role="alert"
            className="text-sm text-red-600 mb-3"
          >
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
          style={{ background: ORANGE }}
        >
          {loading ? (
            "Sedang masuk..."
          ) : (
            <>
              Masuk <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
