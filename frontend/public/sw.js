// Service Worker for Push Notifications
const CACHE_NAME = 'twilchat-v1';

self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('Push received:', event);

    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: data.icon || '/logo192.png',
            badge: data.badge || '/logo192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Open Chat',
                    icon: '/logo192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/logo192.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            self.clients.openWindow('/')
        );
    }
});

self.addEventListener('fetch', (event) => {
    // Basic fetch handling - you can enhance this for offline support
    event.respondWith(fetch(event.request));
});