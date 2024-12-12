const PUBLIC_VAPID_KEY = 'BE5ilGf0inEseYpOWIFo4sLo593HXBq0Wa8evNkHE9Kf5XnF0Kagb4xzbY1jCrG-SF4DqvF1XDspjzRfZG5ioKY';

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
    self.registration.showNotification(title, options)
  );
});

// Event listener for notification click (to open a page)
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://budget-hair-stock-management-system.vercel.app/') // Replace with your Vercel URL
  );
});
