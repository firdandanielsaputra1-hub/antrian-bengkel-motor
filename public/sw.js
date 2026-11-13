
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    console.error("Gagal membaca notifikasi:", error);
  }

  const title = data.title || "Bengkel Motor";

  const options = {
    body: data.body || "Ada pembaruan antrean Anda.",
    icon: "/favicon.ico",
    tag: data.tag || "antrean-bengkel",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  );

  if (target.origin !== self.location.origin) {
    return;
  }

  event.waitUntil(clients.openWindow(target.href));
});
