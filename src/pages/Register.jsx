import { useState } from "react";
import { User, Mail, Phone, Lock, KeyRound, ArrowRight, Bike } from "lucide-react";
import Field from "../components/Field";
import AuthShell from "../components/AuthShell";
import { NAVY, ORANGE } from "../constants/theme";
import { register } from "../services/auth";

export default function Register({ go }) {
  const [f, setF] = useState({ nama: "", email: "", hp: "", pass: "", pass2: "", setuju: false });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (!f.nama || !f.email || !f.hp) return setErr("Lengkapi nama, email, dan nomor HP.");
    if (f.pass.length < 8) return setErr("Kata sandi minimal 8 karakter.");
    if (f.pass !== f.pass2) return setErr("Konfirmasi kata sandi tidak sama.");
    if (!f.setuju) return setErr("Setujui syarat & ketentuan untuk melanjutkan.");

    const res = register(f);
    if (!res.ok) return setErr(res.error);

    setErr("");
    go("login");
  };

  return (
    <AuthShell
      title="Daftar Akun Baru"
      subtitle="Lengkapi data untuk booking servis dan pantau antrean motor Anda secara real-time."
      footer={<>Sudah punya akun? <button onClick={() => go("login")} className="font-bold" style={{ color: NAVY }}>Masuk ›</button></>}
    >
      <form onSubmit={submit}>
        <Field label="Nama Lengkap" icon={User} placeholder="contoh: Budi Santoso" value={f.nama} onChange={set("nama")} />
        <Field label="Email" icon={Mail} type="email" placeholder="contoh: budi@email.com" value={f.email} onChange={set("email")} />
        <Field label="Nomor HP / WhatsApp" aside="Notifikasi WA" icon={Phone} type="tel" placeholder="contoh: 0812-3456-7890"
          hint="Untuk pengiriman tiket & panggilan giliran servis" value={f.hp} onChange={set("hp")} />
        <Field label="Kata Sandi" icon={Lock} type="password" placeholder="Minimal 8 karakter" value={f.pass} onChange={set("pass")} />
        <Field label="Konfirmasi Kata Sandi" icon={KeyRound} type="password" placeholder="Ulangi kata sandi" value={f.pass2} onChange={set("pass2")} />

        <label className="flex items-start gap-3 text-sm text-neutral-700 mb-4">
          <input type="checkbox" checked={f.setuju} onChange={set("setuju")} className="mt-1 w-4 h-4" />
          <span>Saya menyetujui <b style={{ color: NAVY }}>Syarat &amp; Ketentuan</b> serta <b style={{ color: NAVY }}>Kebijakan Privasi</b> bengkel.</span>
        </label>

        {err && <p role="alert" className="text-sm text-red-600 mb-3">{err}</p>}

        <button className="w-full h-14 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:opacity-90" style={{ background: ORANGE }}>
          Daftar Sekarang <ArrowRight size={20} />
        </button>

        <div className="mt-5 rounded-2xl p-4 flex gap-3" style={{ background: "#D6E4FB" }}>
          <div className="w-10 h-10 shrink-0 bg-white rounded-xl flex items-center justify-center" style={{ color: NAVY }}><Bike size={20} /></div>
          <p className="text-sm leading-6" style={{ color: NAVY }}>
            <b className="text-neutral-900">Tips Servis Kilat 💡</b><br />
            Setelah mendaftar, Anda bisa langsung menambahkan data motor (contoh: <b className="text-neutral-900">Honda Vario B 6421 UXR</b>) untuk ambil antrean servis otomatis.
          </p>
        </div>
      </form>
    </AuthShell>
  );
}