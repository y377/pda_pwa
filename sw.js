// 版本控制
const VERSION = '2.2.1';  // 修改版本号
const CACHE_NAME = `pda-cache-${VERSION}`;
const PARTS_DATA_CACHE = `parts-data-${VERSION}`;

// 加载全局配件数据
importScripts('parts-data.js');
// 现在 sw.js 里可以直接用 self.partsData

// 安全配置
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self' https://lib.baomitu.com; script-src 'self' 'unsafe-inline' https://lib.baomitu.com; style-src 'self' 'unsafe-inline' https://lib.baomitu.com; img-src 'self' data: https:; connect-src 'self' https://test.jsjs.net",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

const urlsToCache = [
  '/pda_pwa/index.html',
  '/pda_pwa/manifest.json',
  '/pda_pwa/favicon.png',
  '/pda_pwa/icons/icon-72x72.png',
  '/pda_pwa/icons/icon-96x96.png',
  '/pda_pwa/icons/icon-128x128.png',
  '/pda_pwa/icons/icon-144x144.png',
  '/pda_pwa/icons/icon-152x152.png',
  '/pda_pwa/icons/icon-192x192.png',
  '/pda_pwa/icons/icon-384x384.png',
  '/pda_pwa/icons/icon-512x512.png',
  'https://lib.baomitu.com/twitter-bootstrap/5.3.3/css/bootstrap.min.css',
  'https://lib.baomitu.com/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css',
  'https://lib.baomitu.com/highlight.js/11.10.0/styles/github-dark.css',
  'https://lib.baomitu.com/twitter-bootstrap/5.3.3/js/bootstrap.bundle.min.js',
  'https://lib.baomitu.com/highlight.js/11.10.0/highlight.min.js'
];

// 安装事件
self.addEventListener('install', event => {
  console.log('Service Worker 安装中...', VERSION);
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('缓存静态资源...');
          return cache.addAll(urlsToCache);
        }),
      // 缓存配件数据
      caches.open(PARTS_DATA_CACHE)
        .then(cache => {
          console.log('缓存配件数据...');
          return fetch('https://pn.jsjs.net/pn')
            .then(res => res.clone().json())
            .then(data => cache.put('/pda_pwa/parts-data', new Response(JSON.stringify(data))));
        })
    ]).then(() => {
      console.log('Service Worker 安装完成，准备激活');
      return self.skipWaiting();
    })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  console.log('Service Worker 激活中...', VERSION);
  event.waitUntil(
    Promise.all([
      // 立即接管所有客户端
      self.clients.claim().then(() => {
        console.log('Service Worker 已接管所有客户端');
      }),
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        console.log('清理旧缓存...', cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.startsWith('pda-cache-') || cacheName !== CACHE_NAME) {
              console.log('删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  // 处理配件数据请求
  if (event.request.url.endsWith('/parts-data')) {
    event.respondWith(
      caches.match('/pda_pwa/parts-data')
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // 处理其他请求
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // 检查是否是有效的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 克隆响应，因为响应流只能使用一次
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});

// 错误处理
self.addEventListener('error', event => {
  console.error('Service Worker 错误:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('未处理的 Promise 拒绝:', event.reason);
}); 
