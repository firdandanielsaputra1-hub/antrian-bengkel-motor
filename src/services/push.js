
import { api } from "./api";

// Mengubah VAPID Public Key menjadi Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    rawData,
    (char) => char.charCodeAt(0)
  );
}

// Memeriksa apakah subscription memakai VAPID key terbaru
function keySama(subscription, publicKey) {
  const keyLama =
    subscription.options?.applicationServerKey;

  if (!keyLama) {
    return true;
  }

  const lama = new Uint8Array(keyLama);

  if (lama.length !== publicKey.length) {
    return false;
  }

  return lama.every(
    (nilai, index) => nilai === publicKey[index]
  );
}

// Mengaktifkan Push Notification pelanggan
export async function aktifkanPushNotification() {
  // 1. Periksa dukungan browser
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error(
      "Browser tidak mendukung Push Notification."
    );
  }

  // 2. Periksa koneksi aman
  if (!window.isSecureContext) {
    throw new Error(
      "Notifikasi hanya bisa diaktifkan melalui HTTPS."
    );
  }

  // 3. Periksa izin notifikasi
  if (Notification.permission === "denied") {
    throw new Error(
      "Notifikasi diblokir oleh browser. " +
      "Aktifkan izin melalui pengaturan situs."
    );
  }

  // Harus dipanggil dari klik tombol pengguna
  if (Notification.permission === "default") {
    const izin = await Notification.requestPermission();

    if (izin !== "granted") {
      throw new Error(
        "Izin notifikasi belum diberikan."
      );
    }
  }

  try {
    // 4. Mengambil VAPID Public Key dari PHP
    const hasil = await api("push/public-key.php");

    if (hasil?.ok === false) {
      throw new Error(
        hasil.message || "Gagal mengambil public key."
      );
    }

    const publicKey =
      hasil?.publicKey ??
      hasil?.public_key ??
      hasil?.data?.publicKey;

    if (
      typeof publicKey !== "string" ||
      !publicKey.trim()
    ) {
      throw new Error(
        "VAPID Public Key tidak ditemukan."
      );
    }

    const applicationServerKey =
      urlBase64ToUint8Array(publicKey);

    // 5. Daftarkan Service Worker
    const registration =
      await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

    const swAktif =
      await navigator.serviceWorker.ready;

    if (!swAktif || !registration) {
      throw new Error(
        "Service Worker belum siap."
      );
    }

    // 6. Periksa subscription perangkat
    let subscription =
      await swAktif.pushManager.getSubscription();

    // Jika VAPID key berubah, perbarui subscription
    if (
      subscription &&
      !keySama(subscription, applicationServerKey)
    ) {
      await subscription.unsubscribe();
      subscription = null;
    }

    // 7. Buat subscription jika belum tersedia
    if (!subscription) {
      subscription =
        await swAktif.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
    }

    // 8. Simpan perangkat ke backend PHP
    const simpan = await api("push/subscribe.php", {
      method: "POST",
      body: JSON.stringify(subscription.toJSON()),
    });

    if (simpan?.ok === false) {
      throw new Error(
        simpan.message ||
        "Gagal menyimpan perangkat notifikasi."
      );
    }

    console.log(
      "Push Notification berhasil diaktifkan."
    );

    return true;

  } catch (error) {
    console.error(
      "Gagal mengaktifkan Push Notification:",
      error
    );

    if (error.name === "NotAllowedError") {
      throw new Error(
        "Izin notifikasi ditolak oleh browser."
      );
    }

    if (error.name === "InvalidStateError") {
      throw new Error(
        "Pendaftaran notifikasi bermasalah. " +
        "Coba muat ulang halaman."
      );
    }

    throw error;
  }
}
