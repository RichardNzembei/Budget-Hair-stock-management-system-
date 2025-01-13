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
    self.registration.showNotification(title, options).then(() => {
      console.log('Notification displayed:', { title, options });
    }).catch((err) => {
      console.error('Error displaying notification:', err);
    })
  );
});

// Event listener for notification click (to open a page)
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const url = 'https://budget-hair-stock-management-system-ll2i.vercel.app/'; // Replace with your Vercel URL
  console.log(`Opening window: ${url}`);

  event.waitUntil(
    clients.openWindow(url).then((windowClient) => {
      if (windowClient) {
        console.log('Window opened successfully:', windowClient);
      } else {
        console.log('No window client found, opening a new one...');
      }
    }).catch((err) => {
      console.error('Error opening window:', err);
    })
  );
});
self.addEventListener('sync', (event) => {
  if (event.tag === 'fetch-stock') {
    console.log('Background sync triggered to fetch stock data');
    event.waitUntil(fetchStockDataAndUpdateCache());
  }
});

async function fetchStockDataAndUpdateCache() {
  try {
    const response = await fetch('/api/stock');
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    const stockData = await response.json();

    const cache = await caches.open('stock-cache');
    await cache.put('/api/stock', new Response(JSON.stringify(stockData)));

    console.log('Stock data fetched and cached successfully');
  } catch (error) {
    console.error('Error fetching stock data for background sync:', error);
  }
}
