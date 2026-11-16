
/*
 * SERVICE WORKER - BENGKEL MOTOR
 * Menerima notifikasi antrean pelanggan
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
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || "Ada pembaruan antrean Anda.",
    icon: "/favicon.ico",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Bengkel Motor",
      options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  );

  const tujuan =
    url.origin === self.location.origin
      ? url.href
      : self.location.origin + "/";

  event.waitUntil(
    (async () => {
      const daftarTab = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const tab of daftarTab) {
        if (new URL(tab.url).origin === self.location.origin) {
          await tab.focus();
          return;
        }
      }

      return clients.openWindow(tujuan);
    })()
  );
});
