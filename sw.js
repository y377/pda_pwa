// 版本控制
const VERSION = '2.2.0';  // 修改版本号
const CACHE_NAME = `pda-cache-${VERSION}`;
const PARTS_DATA_CACHE = `parts-data-${VERSION}`;

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

// 配件数据
const partsData = {
  brandMap: {
    'AOC线缆': ['HG GENUINE', 'INNOLIGHT', 'Hisense', 'WTD'],
    '光模块': ['HG GENUINE', 'INNOLIGHT', 'Hisense', 'Huawei', 'Finisar', 'WTD'],
    '内存': ['Samsung', 'Hynix', 'Micron'],
    '硬盘': ['Seagate', 'Western Digital', 'Intel', 'Samsung', 'Micron', 'KIOXIA', 'Solidigm'],
    'CPU': ['Intel']
  },
  pnDataMap: {
    '光模块': {
      'HG GENUINE': ['MTRS-01X11-G', 'MQD-12F1C', 'MQD-56F2C', 'MTRQ-4S101'],
      'INNOLIGHT': ['T-OL8CNT-N00', 'T-DQ8FNS-N01', 'T-DQ8FNS-N00', 'TR-FC13T-N00', 'TR-ZC13T-N00', 'T-DQ4CNT-N00', 'TR-FC13R-N00'],
      'WTD': ['RTXM500-410', 'RTXM420-431', 'RTXM500-560', 'RTXM600-230', 'OEO-M100-73-13-Q28', 'OEO-M100-62-13-Q28', 'RTXM228-551', 'RTXM228-401', 'RTXM290-806', 'RTXM420-550'],
      'Finisar': ['FTCD8613E1PCM', 'FTLX8574D3BCL', 'FTCD8613E2PCM-BY', 'FTCE4717E1PCB-BY', 'FTLX1475D3BCL'],
      'Huawei': ['OM3680SX200', 'OM3660FX102'],
      'Hisense': ['LMQ8811-PC+', 'LMS3821L-PCS', 'LTF8502-BC+', 'LMS3826-PC+', 'LTA1328-PC+'],
      'Crealights': ['B5CLOS800SR8'],
      'H3C': ['SFP-XG-LX-SM1310']
    },
    'AOC线缆': {
      'HG GENUINE': ['ATRP-B005', 'ATRP-B007', 'ATRP-B010', 'ATRP-B020'],
      'INNOLIGHT': ['C-PD2FNM005-N00', 'C-PD2FNM007-N00', 'C-PD2FNM010-N00'],
      'Hisense': ['DMM8211-DC05', 'DMM8211-DC07', 'DMM8211-DC10', 'DMM8211-DC20'],
      'WTD': ['RTXM520-105', 'RTXM520-107', 'RTXM520-110', 'RTXM520-120', 'RTXM500-905', 'RTXM500-910']
    }
  },
  diskPnList: [
    { brand: "Intel", pn: "SSDPF2KX076T1", Type: "NVMe/7.68TB" },
    { brand: "Intel", pn: "SSDPF2KX038T1", Type: "NVMe/3.84TB" },
    { brand: "KIOXIA", pn: "KCD81RUG3T84", Type: "NVMe/3.84TB" },
    { brand: "KIOXIA", pn: "KCD81RUG7T68", Type: "NVMe/7.68TB" },
    { brand: "KIOXIA", pn: "KCD81RUG1T92", Type: "NVMe/1.92TB" },
    { brand: "Samsung", pn: "MZQL21T9HCJR-00B7C", Type: "NVMe/1.92TB" },
    { brand: "Samsung", pn: "MZQL23T8HCLS-00B7C", Type: "NVMe/3.84TB" },
    { brand: "Seagate", pn: "ST20000NM007D", Type: "HDD/20TB" },
    { brand: "Seagate", pn: "ST8000NM017B", Type: "HDD/8TB" },
    { brand: "Union Memory", pn: "UP2A63T8SD004LX", Type: "NVMe/3.84TB" },
    { brand: "Western Digital", pn: "WUH722020BLE604", Type: "HDD/20TB" },
    { brand: "Western Digital", pn: "HUS728T8TALE6L4", Type: "HDD/8TB" }
  ],
  cpuPnList: [
    { brand: "Intel", pn: "Intel(R) Xeon(R) Platinum 8336C CPU @ 2.30GHz", Type: "CPU" },
    { brand: "Intel", pn: "Intel(R) Xeon(R) Platinum 8457C CPU @ 2.60GHz", Type: "CPU" },
    { brand: "Intel", pn: "Intel(R) Xeon(R) Platinum 8582C CPU @ 2.60GHz", Type: "CPU" }
  ]
};

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
          return cache.put('/pda_pwa/parts-data', new Response(JSON.stringify(partsData)));
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
