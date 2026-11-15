
import { useEffect, useState } from "react";
import {
  Clock3,
  Users,
  Wrench,
  Info,
  CheckCircle2,
  BellRing,
} from "lucide-react";

import { api } from "../services/api";
import { NAVY, ORANGE } from "../constants/theme";

export default function EstimasiAntrean() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let aktif = true;

    const muat = async () => {
      try {
        const hasil = await api("antrean/estimasi-saya.php");

        if (aktif) {
          setData(hasil.data || null);
          setError("");
        }
      } catch (err) {
        if (aktif) {
          setError(
            err.message || "Gagal mengambil estimasi antrean."
          );
        }
      } finally {
        if (aktif) {
          setLoading(false);
        }
      }
    };

    muat();

    const interval = setInterval(muat, 15000);

    return () => {
      aktif = false;
      clearInterval(interval);
    };
  }, []);

  // Skeleton Screen saat pertama kali memuat data
  if (loading) {
    return (
      <div
        role="status"
        className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-4 animate-pulse motion-reduce:animate-none">
          <div className="h-4 w-44 rounded-lg bg-stone-200" />
          <div className="h-8 w-24 rounded-lg bg-stone-200" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-xl bg-stone-100"
              />
            ))}
          </div>
        </div>

        <span className="sr-only">
          Sedang memuat estimasi antrean...
        </span>
      </div>
    );
  }

  // Penanganan error API
  if (error) {
    return (
      <div
        role="alert"
        className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
      >
        <p className="text-sm font-semibold text-red-700">
          Estimasi antrean belum tersedia.
        </p>
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  // Tidak menampilkan kartu jika pelanggan tidak memiliki antrean aktif
  if (!data) return null;

  const sedangMenunggu = data.status === "Menunggu";
  const sedangDipanggil = data.status === "Dipanggil";
  const sedangDilayani = data.status === "Sedang Dilayani";

  const statusStyle = sedangDipanggil
    ? "bg-blue-50 text-blue-700"
    : sedangDilayani
    ? "bg-violet-50 text-violet-700"
    : "bg-orange-50 text-orange-700";

  return (
    <section
      className="
        mb-6
        rounded-2xl
        border border-stone-200
        bg-white
        p-5 sm:p-6
        shadow-sm
        transition-shadow duration-300
        hover:shadow-md
      "
      style={{ color: NAVY }}
    >
      {/* HEADER */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-neutral-500">
            INFORMASI ANTREAN ANDA
          </p>

          <h3
            className="mt-1 text-2xl font-extrabold"
            style={{ color: NAVY }}
          >
            {data.nomor}
          </h3>
        </div>

        <span
          className={`
            inline-flex items-center gap-2
            rounded-full px-3 py-1.5
            text-xs font-bold
            ${statusStyle}
          `}
        >
          {sedangDipanggil && <BellRing size={14} />}
          {sedangDilayani && <Wrench size={14} />}
          {sedangMenunggu && <Clock3 size={14} />}
          {data.status}
        </span>
      </div>

      {/* INFORMASI ANTREAN MENUNGGU */}
      {sedangMenunggu && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* POSISI ANTREAN */}
          <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none">
            <Users
              size={21}
              style={{ color: ORANGE }}
            />

            <p className="mt-3 text-xs font-medium text-neutral-500">
              Posisi antrean
            </p>

            <p
              className="mt-1 text-xl font-extrabold"
              style={{ color: NAVY }}
            >
              {data.posisi != null
                ? `Ke-${data.posisi}`
                : "-"}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              {data.di_depan ?? 0} antrean di depan
            </p>
          </div>

          {/* ESTIMASI WAKTU */}
          <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none">
            <Clock3
              size={21}
              style={{ color: ORANGE }}
            />

            <p className="mt-3 text-xs font-medium text-neutral-500">
              Estimasi waktu tunggu
            </p>

            <p
              className="mt-1 text-xl font-extrabold"
              style={{ color: NAVY }}
            >
              {data.estimasi_min != null &&
              data.estimasi_max != null
                ? `${data.estimasi_min}–${data.estimasi_max} mnt`
                : "Belum tersedia"}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Perkiraan sementara
            </p>
          </div>

          {/* KAPASITAS PIT */}
          <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transform-none">
            <Wrench
              size={21}
              style={{ color: ORANGE }}
            />

            <p className="mt-3 text-xs font-medium text-neutral-500">
              Kapasitas pit
            </p>

            <p
              className="mt-1 text-xl font-extrabold"
              style={{ color: NAVY }}
            >
              {data.pit_tersedia ?? 0}/{data.pit_aktif ?? 0}
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Pit aktif yang belum terpakai
            </p>
          </div>
        </div>
      )}

      {/* VISUAL FEEDBACK SAAT DIPANGGIL */}
      {sedangDipanggil && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <BellRing
            size={23}
            className="shrink-0 text-blue-600"
          />

          <div>
            <p className="font-extrabold text-blue-800">
              Nomor antrean Anda sedang dipanggil!
            </p>

            <p className="mt-1 text-sm text-blue-700">
              Silakan segera menuju petugas bengkel.
            </p>
          </div>
        </div>
      )}

      {/* VISUAL FEEDBACK SAAT DILAYANI */}
      {sedangDilayani && (
        <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <CheckCircle2
            size={23}
            className="shrink-0 text-violet-600"
          />

          <div>
            <p className="font-extrabold text-violet-800">
              Motor Anda sedang dilayani.
            </p>

            <p className="mt-1 text-sm text-violet-700">
              Silakan menunggu hingga proses servis selesai.
            </p>
          </div>
        </div>
      )}

      {/* KETERANGAN */}
      {data.keterangan && (
        <div className="mt-4 flex items-start gap-2 border-t border-stone-100 pt-4">
          <Info
            size={17}
            className="mt-0.5 shrink-0 text-stone-400"
          />

          <p className="text-sm leading-relaxed text-neutral-500">
            {data.keterangan}
          </p>
        </div>
      )}
    </section>
  );
}
