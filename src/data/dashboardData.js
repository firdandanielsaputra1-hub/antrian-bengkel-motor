export const pits = [
  { pit: "Pit 1", mek: "Mas Agus", status: "Sedang Dilayani", motor: "Yamaha NMAX (W 5678 CD)", job: "Servis CVT Penuh", pct: 70, eta: "~15m" },
  { pit: "Pit 2", mek: "Mas Joko", status: "Dipanggil", motor: "Menunggu Masuk: A-007 (Honda Beat)", job: "Siap Servis", pct: 8, eta: "" },
  { pit: "Pit 3", mek: "Pak Bambang", status: "Sedang Dilayani", motor: "Honda Vario 150 (L 9021 UT)", job: "Ganti Kampas Rem", pct: 40, eta: "~25m" },
];

export const rows = [
  { no: "A-007", nama: "Budi Santoso", hp: "0812-3456-7890", motor: "Honda Beat", plat: "L 1234 AB", svc: "Servis Rutin + Oli", dur: "45 mnt • Rp 125.000", pit: "Pit 2 (Mas Joko)", jam: "09:15 WIB", tunggu: "Tunggu 25m", status: "Dipanggil" },
  { no: "A-008", nama: "Siti Rahmawati", hp: "0813-8899-1122", motor: "Honda Scoopy", plat: "L 5543 QZ", svc: "Ganti Oli + Kampas", dur: "30 mnt • Rp 95.000", pit: "Menunggu Pit 1", jam: "09:22 WIB", tunggu: "Tunggu 18m", status: "Menunggu" },
  { no: "A-009", nama: "Hendra Setiawan", hp: "0856-7788-3344", motor: "Yamaha Aerox 155", plat: "W 9012 KL", svc: "Servis CVT + Ganti Oli", dur: "60 mnt • Rp 170.000", pit: "Menunggu Pit 3", jam: "09:30 WIB", tunggu: "Tunggu 10m", status: "Menunggu" },
  { no: "A-010", nama: "Denny Kurniawan", hp: "0878-2233-4455", motor: "Honda Beat Deluxe", plat: "L 8871 XY", svc: "Tune Up Injeksi", dur: "35 mnt • Rp 75.000", pit: "Antrian Terbuka", jam: "09:38 WIB", tunggu: "Tunggu 2m", status: "Menunggu" },
  { no: "B-002", nama: "Agus Priyanto", hp: "0821-6677-8899", motor: "Yamaha Mio M3", plat: "W 4412 OP", svc: "Keluhan Mati Mendadak", dur: "Troubleshoot Mesin", pit: "Pit Cadangan", jam: "09:05 WIB", tunggu: "Lewat 35m", status: "Dilewati", late: true },
  { no: "A-005", nama: "Rudi Hermawan", hp: "0819-3322-1100", motor: "Honda Vario 125", plat: "L 3344 CD", svc: "Servis Lengkap", dur: "60 mnt • Rp 150.000", pit: "Pit 1 (Mas Agus)", jam: "08:45 WIB", tunggu: "Durasi 55m", status: "Sedang Dilayani" },
  { no: "A-004", nama: "Linda Wijaya", hp: "0812-9900-1122", motor: "Honda Genio", plat: "L 6789 AB", svc: "Ganti Oli Mesin + Gardan", dur: "20 mnt • Rp 65.000", pit: "Pit 2 (Selesai)", jam: "08:30 WIB", tunggu: "Siap Bayar", status: "Selesai" },
];

export const badge = {
  Dipanggil: "bg-blue-100 text-blue-800",
  Menunggu: "bg-amber-100 text-amber-800",
  Dilewati: "bg-orange-100 text-orange-700",
  "Sedang Dilayani": "bg-violet-100 text-violet-800",
  Selesai: "bg-emerald-100 text-emerald-800",
};

export const action = {
  Dipanggil: null,
  Menunggu: "Siapkan Pit",
  Dilewati: "Panggil Ulang",
  "Sedang Dilayani": "Selesaikan",
  Selesai: "Cetak Nota",
};