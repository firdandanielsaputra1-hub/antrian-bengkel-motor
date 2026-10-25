import { useState } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import { NAVY } from "../constants/theme";

export default function Field({ label, icon: Icon, type = "text", placeholder, hint, aside, value, onChange }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-semibold text-neutral-900">{label}</label>
        {aside && <span className="text-xs font-semibold" style={{ color: NAVY }}>{aside}</span>}
      </div>
      <div className="flex items-center gap-3 bg-stone-100 rounded-2xl px-4 h-14 focus-within:ring-2 focus-within:ring-orange-400">
        <Icon size={20} className="text-neutral-500 shrink-0" />
        <input
          type={isPass && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-neutral-800 placeholder-neutral-400"
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)} aria-label="Tampilkan kata sandi" className="text-neutral-500">
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {hint && (
        <p className="flex items-center gap-1.5 text-xs text-neutral-600 mt-2">
          <Info size={14} style={{ color: NAVY }} /> {hint}
        </p>
      )}
    </div>
  );
}