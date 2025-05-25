// 版本控制
const VERSION = '2.2.2';
const CACHE_NAME = `pda-cache-${VERSION}`;

// 向页面发送调试信息
function sendDebugInfo(type, info) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_DEBUG',
        data: {
          type,
          info,
          timestamp: new Date().toISOString()
        }
      });
    });
  });
}

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
  sendDebugInfo('install', { version: VERSION });
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        sendDebugInfo('cache', { action: 'start' });
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        sendDebugInfo('cache', { action: 'complete' });
        return self.skipWaiting();
      })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  sendDebugInfo('activate', { version: VERSION });
  event.waitUntil(
    caches.keys().then(cacheNames => {
      sendDebugInfo('cleanup', { caches: cacheNames });
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            sendDebugInfo('cleanup', { action: 'delete', cache: cacheName });
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      sendDebugInfo('activate', { action: 'claim' });
      return self.clients.claim();
    })
  );
});

// fetch 事件，只处理静态资源
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  sendDebugInfo('fetch', { path: url.pathname });

  // 对于 HTML 和 JS 文件，使用 network-first 策略
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('.js')) {
    sendDebugInfo('fetch', { path: url.pathname, strategy: 'network-first' });
    event.respondWith(
      fetch(event.request)
        .then(response => {
          sendDebugInfo('fetch', { path: url.pathname, status: 'success' });
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              sendDebugInfo('fetch', { path: url.pathname, action: 'cache-update' });
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(error => {
          sendDebugInfo('fetch', { path: url.pathname, status: 'error', error: error.message });
          return caches.match(event.request);
        })
    );
  } else {
    // 对于其他静态资源，使用 cache-first 策略
    sendDebugInfo('fetch', { path: url.pathname, strategy: 'cache-first' });
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            sendDebugInfo('fetch', { path: url.pathname, status: 'cache-hit' });
            return response;
          }
          sendDebugInfo('fetch', { path: url.pathname, status: 'cache-miss' });
          return fetch(event.request)
            .then(response => {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  sendDebugInfo('fetch', { path: url.pathname, action: 'cache-update' });
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
  sendDebugInfo('error', { error: event.error.message });
});

self.addEventListener('unhandledrejection', event => {
  sendDebugInfo('error', { rejection: event.reason });
}); 
