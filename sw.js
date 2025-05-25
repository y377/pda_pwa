// 版本控制
const VERSION = '2.2.2';
const CACHE_NAME = `pda-cache-${VERSION}`;

const urlsToCache = [
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  'https://lib.baomitu.com/twitter-bootstrap/5.3.3/css/bootstrap.min.css',
  'https://lib.baomitu.com/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css',
  'https://lib.baomitu.com/highlight.js/11.10.0/styles/github-dark.css',
  'https://lib.baomitu.com/twitter-bootstrap/5.3.3/js/bootstrap.bundle.min.js',
  'https://lib.baomitu.com/highlight.js/11.10.0/highlight.min.js'
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 激活事件
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// fetch 事件，只处理静态资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// 错误处理
self.addEventListener('error', event => {
  console.error('Service Worker 错误:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('未处理的 Promise 拒绝:', event.reason);
}); 
