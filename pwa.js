// 检测浏览器类型
if (navigator.userAgent.includes("OPR")) {
  const toast = document.createElement("div");
  toast.className = "toast show position-fixed top-0 start-50 translate-middle-x mt-3";
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
        <div class="toast-header bg-warning">
          <strong class="me-auto">浏览器提示</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          建议使用 Chrome 浏览器获得最佳体验
        </div>
      `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// 版本信息
const APP_VERSION = "2.2.0"; // 与 sw.js 中的版本保持一致

// 注册 Service Worker
if ("serviceWorker" in navigator) {
  let refreshing = false;

  // 检测更新
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("检测到新的 Service Worker");
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  // 注册 Service Worker
  navigator.serviceWorker
    .register("/pda_pwa/sw.js")
    .then((registration) => {
      console.log("Service Worker 注册成功:", registration.scope);

      // 检查更新
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        console.log("Service Worker 更新中...");

        newWorker.addEventListener("statechange", () => {
          console.log("Service Worker 状态变化:", newWorker.state);
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            console.log("新版本可用");
            // 显示更新提示
            const toast = document.createElement("div");
            toast.className = "toast show position-fixed top-0 start-50 translate-middle-x mt-3";
            toast.setAttribute("role", "alert");
            toast.innerHTML = `
                <div class="toast-header bg-primary text-white">
                  <strong class="me-auto">应用更新 v${APP_VERSION}</strong>
                  <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                  <p>新版本已就绪，更新内容：</p>
                  <ul class="mb-2">
                    <li>优化更新检测机制</li>
                    <li>改进缓存管理</li>
                    <li>增强稳定性</li>
                  </ul>
                  <button class="btn btn-primary btn-sm" onclick="window.location.reload()">立即更新</button>
                </div>
              `;
            document.body.appendChild(toast);
            // 10秒后自动关闭
            setTimeout(() => toast.remove(), 10000);
          }
        });
      });

      // 定期检查更新
      setInterval(() => {
        console.log("检查更新...");
        registration.update().catch((error) => {
          console.error("检查更新失败:", error);
        });
      }, 1000 * 60 * 5); // 每5分钟检查一次
    })
    .catch((error) => {
      console.error("Service Worker 注册失败:", error);
      showToast("应用初始化失败，请刷新页面重试", "danger");
    });
}

// 加载配件数据
async function loadPartsData() {
  try {
    const response = await fetch("/pda_pwa/parts-data");
    if (response.ok) {
      const data = await response.json();
      console.log("加载配件数据成功:", data);
      return data;
    }
  } catch (error) {
    console.error("加载配件数据失败:", error);
  }
  // 如果加载失败，使用默认数据
  return {
    brandMap: {
      AOC线缆: ["HG GENUINE", "INNOLIGHT", "Hisense", "WTD"],
      光模块: ["HG GENUINE", "INNOLIGHT", "Hisense", "Huawei", "Finisar", "WTD"],
      内存: ["Samsung", "Hynix", "Micron"],
      硬盘: ["Seagate", "Western Digital", "Intel", "Samsung", "Micron", "KIOXIA", "Solidigm"],
      CPU: ["Intel"],
    },
    pnDataMap: {
      光模块: {
        "HG GENUINE": ["MTRS-01X11-G", "MQD-12F1C", "MQD-56F2C", "MTRQ-4S101"],
        INNOLIGHT: ["T-OL8CNT-N00", "T-DQ8FNS-N01", "T-DQ8FNS-N00", "TR-FC13T-N00", "TR-ZC13T-N00", "T-DQ4CNT-N00", "TR-FC13R-N00"],
        WTD: ["RTXM500-410", "RTXM420-431", "RTXM500-560", "RTXM600-230", "OEO-M100-73-13-Q28", "OEO-M100-62-13-Q28", "RTXM228-551", "RTXM228-401", "RTXM290-806", "RTXM420-550"],
        Finisar: ["FTCD8613E1PCM", "FTLX8574D3BCL", "FTCD8613E2PCM-BY", "FTCE4717E1PCB-BY", "FTLX1475D3BCL"],
        Huawei: ["OM3680SX200", "OM3660FX102"],
        Hisense: ["LMQ8811-PC+", "LMS3821L-PCS", "LTF8502-BC+", "LMS3826-PC+", "LTA1328-PC+"],
        Crealights: ["B5CLOS800SR8"],
        H3C: ["SFP-XG-LX-SM1310"],
      },
      AOC线缆: {
        "HG GENUINE": ["ATRP-B005", "ATRP-B007", "ATRP-B010", "ATRP-B020"],
        INNOLIGHT: ["C-PD2FNM005-N00", "C-PD2FNM007-N00", "C-PD2FNM010-N00"],
        Hisense: ["DMM8211-DC05", "DMM8211-DC07", "DMM8211-DC10", "DMM8211-DC20"],
        WTD: ["RTXM520-105", "RTXM520-107", "RTXM520-110", "RTXM520-120", "RTXM500-905", "RTXM500-910"],
      },
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
      { brand: "Western Digital", pn: "HUS728T8TALE6L4", Type: "HDD/8TB" },
    ],
    cpuPnList: [
      { brand: "Intel", pn: "Intel(R) Xeon(R) Platinum 8336C CPU @ 2.30GHz", Type: "CPU" },
      { brand: "Intel", pn: "Intel(R) Xeon(R) Platinum 8457C CPU @ 2.60GHz", Type: "CPU" },
      { brand: "Intel", pn: "Intel(R) Xeon(R) Platinum 8582C CPU @ 2.60GHz", Type: "CPU" },
    ],
  };
}

// 初始化 PWA
document.addEventListener("DOMContentLoaded", async () => {
  const partsData = await loadPartsData();
  // 将数据传递给 pda.js
  window.partsData = partsData;
});
