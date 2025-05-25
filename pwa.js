// 版本控制
const VERSION = '2.2.2';
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
              checkUpdate();
            }
          });
        });
      })
      .catch(() => {});
  });
}

// 检查更新
async function checkUpdate() {
  try {
    const response = await fetch('/pda_pwa/manifest.json');
    const manifest = await response.json();
    const currentVersion = localStorage.getItem('app-version');
    
    if (manifest.version !== currentVersion) {
      // 获取更新日志
      const changelog = manifest.changelog || '优化性能和用户体验';
      
      // 创建 Offcanvas 更新提示
      const updateOffcanvas = document.createElement('div');
      updateOffcanvas.className = 'offcanvas offcanvas-bottom show';
      updateOffcanvas.setAttribute('tabindex', '-1');
      updateOffcanvas.setAttribute('aria-labelledby', 'updateOffcanvasLabel');
      updateOffcanvas.innerHTML = `
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="updateOffcanvasLabel">发现新版本 ${manifest.version}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div class="changelog mb-3">
            <h6 class="text-muted mb-2">更新内容：</h6>
            <div class="ps-3">${changelog.replace(/\n/g, '<br>')}</div>
          </div>
          <button class="btn btn-primary w-100 update-btn">立即更新</button>
        </div>
      `;
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        .offcanvas-bottom {
          height: auto;
          max-height: 50vh;
        }
        .offcanvas-header {
          border-bottom: 1px solid #dee2e6;
        }
        .changelog {
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .update-btn {
          font-weight: 500;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(updateOffcanvas);
      
      // 添加遮罩
      const backdrop = document.createElement('div');
      backdrop.className = 'offcanvas-backdrop fade show';
      document.body.appendChild(backdrop);
      
      // 点击更新按钮
      updateOffcanvas.querySelector('.update-btn').onclick = () => {
        localStorage.setItem('app-version', manifest.version);
        window.location.reload();
      };
      
      // 点击关闭按钮
      updateOffcanvas.querySelector('.btn-close').onclick = () => {
        updateOffcanvas.remove();
        backdrop.remove();
      };
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('检查更新失败:', error);
    return false;
  }
}
