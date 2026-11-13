import { api } from "./api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (char) =>
    char.charCodeAt(0)
  );
}

export async function aktifkanPushNotification() {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    throw new Error(
      "Browser ini tidak mendukung Web Push Notification."
    );
  }

  if (!window.isSecureContext) {
    throw new Error("Notifikasi membutuhkan HTTPS.");
  }

  const izin = await Notification.requestPermission();

  if (izin !== "granted") {
    throw new Error("Izin notifikasi belum diberikan.");
  }

  const hasil = await api("push/public-key.php");

  const publicKey = hasil.publicKey;

  if (!publicKey) {
    throw new Error("Public key tidak ditemukan.");
  }

  await navigator.serviceWorker.register("/sw.js");

  const registration = await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await api("push/subscribe.php", {
    method: "POST",
    body: JSON.stringify(subscription.toJSON()),
  });

  return true;
}