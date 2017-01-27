const CACHE_NAME = 'honesty-store-v1';
const OFFLINE_URL = '/offline';
const urlsToCache = [
    '/',
    OFFLINE_URL
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => void cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method === 'GET' &&
        event.request.headers.get('accept').indexOf('text/html') !== -1) {
        event.respondWith(
            fetch(event.request).catch(function (e) {
                console.error('Fetch failed; returning offline page instead.', e);
                return caches.open(CACHE_NAME)
                    .then((cache) => cache.match(OFFLINE_URL));
            })
        );
    }
});