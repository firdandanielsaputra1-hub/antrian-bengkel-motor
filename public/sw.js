
import { api } from "./api";

// Mengubah VAPID Public Key ke Uint8Array
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

// Fungsi untuk mengaktifkan notifikasi pelanggan
export async function aktifkanPushNotification() {
  // Periksa dukungan browser
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error(
      "Browser tidak mendukung Push Notification."
    );
  }

  // Push hanya boleh melalui HTTPS
  if (!window.isSecureContext) {
    throw new Error(
      "Notifikasi memerlukan koneksi HTTPS."
    );
  }

  // Periksa izin notifikasi
  if (Notification.permission === "denied") {
    throw new Error(
      "Notifikasi diblokir. Aktifkan melalui pengaturan browser."
    );
  }

  // Meminta izin dari pengguna
  if (Notification.permission !== "granted") {
    const izin = await Notification.requestPermission();

    if (izin !== "granted") {
      throw new Error(
        "Izin notifikasi belum diberikan."
      );
    }
  }

  // Mengambil Public Key dari backend PHP
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

  if (!publicKey) {
    throw new Error(
      "VAPID Public Key tidak ditemukan."
    );
  }

  // Daftarkan Service Worker
  const registration =
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

  await navigator.serviceWorker.ready;

  // Periksa subscription yang sudah ada
  let subscription =
    await registration.pushManager.getSubscription();

  const keyBaru = urlBase64ToUint8Array(publicKey);

  if (subscription) {
    const keyLama =
      subscription.options?.applicationServerKey;

    if (keyLama) {
      const lama = new Uint8Array(keyLama);

      const cocok =
        lama.length === keyBaru.length &&
        lama.every((v, i) => v === keyBaru[i]);

      if (!cocok) {
        await subscription.unsubscribe();
        subscription = null;
      }
    }
  }

  // Daftarkan perangkat jika belum ada
  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBaru,
      });
  }

  // Simpan subscription ke MySQL melalui PHP
  const simpan = await api("push/subscribe.php", {
    method: "POST",
    body: JSON.stringify(subscription.toJSON()),
  });

  if (simpan?.ok === false) {
    throw new Error(
      simpan.message ||
      "Gagal menyimpan notifikasi."
    );
  }

  return true;
}
