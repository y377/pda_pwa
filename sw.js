// 版本控制
const VERSION = '2.2.2';
const CACHE_NAME = 'pda-cache'; // 不带版本号

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

// 激活事件：每次激活都清除所有旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// fetch 事件，只处理静态资源
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 对于 Cloudflare Worker 数据接口，cache-first
  if (url.hostname === 'pn.jsjs.net' && url.pathname === '/pn') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      )
    );
    return;
  }

  // 对于 HTML 和 JS 文件，使用 network-first 策略
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // 对于其他静态资源，使用 cache-first 策略
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            });
        })
    );
  }
});

// 错误处理
self.addEventListener('error', event => {
});

self.addEventListener('unhandledrejection', event => {
}); 
