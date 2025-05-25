// 版本控制
const VERSION = '2.2.1';
const CACHE_NAME = `pda-cache-${VERSION}`;
const PARTS_DATA_CACHE = `parts-data-${VERSION}`;

// 注册 Service Worker 并实现用户可见的更新提示
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/pda_pwa/sw.js')
      .then(registration => {
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast();
            }
          });
        });
      })
      .catch(() => {});
  });
}

// 弹窗提示用户有新版本，点击按钮刷新
function showUpdateToast() {
  if (document.getElementById('pwa-update-toast')) return; // 防止重复弹出
  const toast = document.createElement('div');
  toast.id = 'pwa-update-toast';
  toast.style.position = 'fixed';
  toast.style.top = '50%';
  toast.style.left = '50%';
  toast.style.transform = 'translate(-50%, -50%)';
  toast.style.background = '#0d6efd';
  toast.style.color = '#fff';
  toast.style.padding = '2rem 1.5rem 1.5rem 1.5rem';
  toast.style.borderRadius = '1rem';
  toast.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  toast.style.zIndex = '99999';
  toast.style.textAlign = 'center';
  toast.innerHTML = `
    <div style="font-size:1.2rem;font-weight:bold;margin-bottom:0.5rem;">发现新版本</div>
    <div style="margin-bottom:1rem;">点击下方按钮立即更新以体验最新功能</div>
    <button id="pwa-update-btn" style="background:#fff;color:#0d6efd;border:none;padding:0.5rem 1.5rem;border-radius:0.5rem;font-weight:bold;font-size:1rem;cursor:pointer;">更新</button>
  `;
  document.body.appendChild(toast);
  document.getElementById('pwa-update-btn').onclick = () => {
    window.location.reload();
  };
}
