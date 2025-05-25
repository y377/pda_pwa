// 版本控制
const VERSION = '2.2.1';
const CACHE_NAME = `pda-cache-${VERSION}`;
const PARTS_DATA_CACHE = `parts-data-${VERSION}`;

// 只保留 Service Worker 注册和 PWA 相关逻辑
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/pda_pwa/sw.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration.scope);
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本已安装，显示更新提示
              const updateToast = document.createElement('div');
              updateToast.className = 'toast show position-fixed top-50 start-50 translate-middle';
              updateToast.style.zIndex = '9999';
              updateToast.innerHTML = `
                <div class="toast-body bg-primary text-white rounded p-3">
                  <div class="d-flex align-items-center">
                    <div class="me-3">
                      <i class="bi bi-arrow-clockwise"></i>
                    </div>
                    <div>
                      <div class="fw-bold mb-1">发现新版本</div>
                      <div class="small">点击更新以使用最新功能</div>
                    </div>
                    <button type="button" class="btn btn-light btn-sm ms-3" onclick="window.location.reload()">
                      更新
                    </button>
                  </div>
                </div>
              `;
              document.body.appendChild(updateToast);
            }
          });
        });
      })
      .catch(error => {
        console.error('Service Worker 注册失败:', error);
      });
  });
}
