
import { NAVY, ORANGE } from "../../constants/theme";

export default function PitCapacity({ queues = [] }) {
  const pits = [1, 2, 3];

  return (
    <section className="bg-white rounded-2xl shadow-sm p-5 xl:col-span-2">
      <h2
        className="text-lg font-extrabold mb-2"
        style={{ color: NAVY }}
      >
        Kapasitas Pit Mekanik
      </h2>

      <p className="text-sm text-neutral-500 mb-5">
        3 Pit tersedia untuk pelayanan servis
      </p>

      <div className="space-y-3">
        {pits.map((id) => {
          const antrean = queues.find(
            (q) =>
              q.status === "Sedang Dilayani" &&
              Number(q.pit_id) === id
          );

          return (
            <div
              key={id}
              className="border border-stone-200 rounded-xl p-4"
            >
              <div className="flex justify-between items-center gap-3">
                <div>
                  <p className="font-bold">
                    Pit {id}
                  </p>

                  <p className="text-xs text-neutral-500">
                    Mekanik {id}
                  </p>
                </div>

                <span
                  className="text-xs font-semibold rounded-lg px-3 py-1"
                  style={{
                    background: antrean
                      ? "#fff0e5"
                      : "#dcfce7",
                    color: antrean
                      ? ORANGE
                      : "#15803d",
                  }}
                >
                  {antrean ? "Digunakan" : "Tersedia"}
                </span>
              </div>

              {antrean && (
                <p className="text-xs text-neutral-600 mt-3">
                  {antrean.nomor} - {antrean.nama}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
