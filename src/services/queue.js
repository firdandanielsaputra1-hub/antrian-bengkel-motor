
const KEY = "bengkel_queues";

export function getQueues() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveQueues(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("queue-updated"));
}

export function addQueue(nama, plat, servis, hp = "", motor = "") {
  const queues = getQueues();
  const tanggal = new Date().toLocaleDateString("en-CA");

  const nomorTerakhir = queues
    .filter(q => q.tanggal === tanggal)
    .reduce((max, q) => {
      const n = Number((q.nomor || "").split("-")[1]);
      return Math.max(max, Number.isFinite(n) ? n : 0);
    }, 0);

  const queue = {
    id: Date.now() + Math.random(),
    nomor: `A-${String(nomorTerakhir + 1).padStart(3, "0")}`,
    nama,
    hp,
    motor,
    plat,
    servis,
    tanggal,
    status: "Menunggu",
    pit: "-",
    dibuat: new Date().toISOString(),
    dipanggil: null
  };

  queues.push(queue);
  saveQueues(queues);
  return queue;
}

export function updateQueue(id, changes) {
  const queues = getQueues();
  const index = queues.findIndex(q => q.id === id);

  if (index === -1) return false;

  queues[index] = {
    ...queues[index],
    ...(typeof changes === "string" ? { status: changes } : changes)
  };

  saveQueues(queues);
  return true;
}

export function callNextQueue() {
  const queues = getQueues();

  if (queues.some(q => q.status === "Dipanggil")) {
    return {
      ok: false,
      message: "Selesaikan panggilan aktif terlebih dahulu."
    };
  }

  const today = new Date().toLocaleDateString("en-CA");
  const next = queues.find(
    q => q.tanggal === today && q.status === "Menunggu"
  );

  if (!next) {
    return {
      ok: false,
      message: "Tidak ada antrean yang menunggu."
    };
  }

  next.status = "Dipanggil";
  next.dipanggil = new Date().toISOString();
  saveQueues(queues);

  return { ok: true, queue: next };
}

export function speakQueue(queue) {
  if (!("speechSynthesis" in window)) {
    alert("Browser tidak mendukung suara panggilan.");
    return;
  }

  window.speechSynthesis.cancel();

  const pesan = new SpeechSynthesisUtterance(
    `Nomor antrean ${queue.nomor.replace("-", " ")}, atas nama ${queue.nama}, silakan menuju area servis.`
  );

  pesan.lang = "id-ID";
  pesan.rate = 0.85;

  window.speechSynthesis.speak(pesan);
}
