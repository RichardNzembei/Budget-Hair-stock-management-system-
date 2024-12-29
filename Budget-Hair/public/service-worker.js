const PUBLIC_VAPID_KEY = 'BLXNZaVwiz5mh3WI_Zqf-e77TvVs80zxJX0KL8MZEB2KRcAvPANCekrwj8vbGrNT6nMGmwu1zxbBOdMd8S6kaGM';

// Event listener for push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon/web-app-manifest-192x192.png',
    badge: '/favicon/web-app-manifest-192x192.png',
  };

  console.log('Notification data:', { title, options });

  event.waitUntil(
    self.registration.showNotification(title, options).catch((error) => {
      console.error('Error displaying notification:', error);
    })
  );
});

// Event listener for notification click (to open a page)
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const client = clientList.find((client) => client.url === 'https://budget-hair-stock-management-system-ll2i.vercel.app/');
      
      if (client) {
        client.focus();
      } else {
        clients.openWindow('https://budget-hair-stock-management-system-ll2i.vercel.app/');
      }
    }).catch((error) => {
      console.error('Error handling notification click:', error);
    })
  );
});
