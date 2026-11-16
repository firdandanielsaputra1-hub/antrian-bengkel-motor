
/*
 * Service Worker - Bengkel Motor
 * Menampilkan notifikasi antrean pelanggan
 */

self.addEventListener("push", (event) => {
  let data = {
    title: "Bengkel Motor",
    body: "Ada informasi terbaru mengenai antrean Anda.",
    url: "/",
  };

  if (event.data) {
    try {
      const pesan = event.data.json();

      if (pesan && typeof pesan === "object") {
        data = { ...data, ...pesan };
      }
    } catch (error) {
      data.body = event.data.text();
    }
  }

  const judul = data.title || "Bengkel Motor";

  const options = {
    body: data.body || "Ada pembaruan antrean Anda.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "antrean-" + Date.now(),
    data: {
      url: data.url || "/",
    },
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(judul, options)
  );
});

// Ketika pelanggan mengetuk notifikasi
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const tujuan = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  );

  // Hanya izinkan navigasi ke website sendiri
  const urlAman =
    tujuan.origin === self.location.origin
      ? tujuan.href
      : self.location.origin + "/";

  event.waitUntil(
    (async () => {
      const semuaTab = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const tab of semuaTab) {
        if (new URL(tab.url).origin === self.location.origin) {
          if ("navigate" in tab) {
            await tab.navigate(urlAman);
          }

          return tab.focus();
        }
      }

      return clients.openWindow(urlAman);
    })()
  );
});
