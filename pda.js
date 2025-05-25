const orderNo = document.getElementById("orderNo");
const typeSelect = document.getElementById("type");
const switchLocation = document.getElementById("switchLocation");
const portNo = document.getElementById("portNo");
const serverSN = document.getElementById("serverSN");
const serverSNRow = document.getElementById("serverSNRow");
const switchInfoRow = document.getElementById("switchInfoRow");

const newBrand = document.getElementById("newBrand");
const oldBrand = document.getElementById("oldBrand");
const newPN = document.getElementById("newPN");
const oldPN = document.getElementById("oldPN");
const newSN = document.getElementById("newSN");
const oldSN = document.getElementById("oldSN");

const newPnOptions = document.getElementById("newPnOptions");
const oldPnOptions = document.getElementById("oldPnOptions");

const countNewPN = document.getElementById("countNewPN");
const countNewSN = document.getElementById("countNewSN");
const countOldPN = document.getElementById("countOldPN");
const countOldSN = document.getElementById("countOldSN");
const checkNewPN = document.getElementById("checkNewPN");
const checkOldPN = document.getElementById("checkOldPN");
const preview = document.getElementById("preview");
const copyBtn = document.getElementById("copyBtn");

const orderNoDisplay = document.getElementById("orderNoDisplay");

let restoring = false;

orderNo.addEventListener("input", function () {
  const val = orderNo.value.trim();
  const num = val.match(/(\d+)(?!.*\d)/)?.[0] || "";
  orderNoDisplay.textContent = num ? `${num}` : ""; //单号识别：${num}
});

function showToast(msg, type = "primary") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show my-2`;
  toast.role = "alert";
  toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 1200);
}

function updateBrandOptions() {
  if (!window.partsData || !window.partsData.brandMap) return;
  const type = typeSelect.value;
  const brandMap = window.partsData.brandMap;
  const section = document.getElementById("brandSection");
  if (!type || !brandMap[type]) {
    newBrand.innerHTML = "";
    oldBrand.innerHTML = "";
    section.classList.add("d-none");
    return;
  }
  newBrand.innerHTML = "<option selected>请选择</option>" + brandMap[type].map((b) => `<option value="${b}">${b}</option>`).join("");
  oldBrand.innerHTML = "<option selected>请选择</option>" + brandMap[type].map((b) => `<option value="${b}">${b}</option>`).join("");
  section.classList.remove("d-none");
  updatePnOptions(type, newBrand.value, newPnOptions);
  updatePnOptions(type, oldBrand.value, oldPnOptions);
}

// 添加等待数据加载函数
function waitForData() {
  return new Promise((resolve) => {
    if (window.partsData && window.partsData.brandMap) {
      resolve();
    } else {
      const checkData = () => {
        if (window.partsData && window.partsData.brandMap) {
          resolve();
        } else {
          setTimeout(checkData, 100);
        }
      };
      checkData();
    }
  });
}

// 修改页面加载事件
// 先渲染品牌下拉，再绑定事件，最后恢复表单

document.addEventListener('DOMContentLoaded', async () => {
  await waitForData();
  updateBrandOptions();
  bindEvents();
  loadFormData();
});

// 修改 loadFormData 函数
async function loadFormData() {
  // 等待数据加载完成
  await waitForData();
  
  restoring = true;
  try {
    // 1. 恢复类型
    const typeVal = localStorage.getItem("pda_type") || "请选择";
    typeSelect.value = typeVal;
    
    // 2. 恢复品牌
    const newBrandVal = localStorage.getItem("pda_newBrand") || "请选择";
    const oldBrandVal = localStorage.getItem("pda_oldBrand") || "请选择";
    newBrand.value = newBrandVal;
    oldBrand.value = oldBrandVal;

    // 3. 恢复输入框
    [
      [orderNo, "pda_orderNo"],
      [switchLocation, "pda_switchLocation"],
      [portNo, "pda_portNo"],
      [serverSN, "pda_serverSN"],
      [newSN, "pda_newSN"],
      [oldSN, "pda_oldSN"],
    ].forEach(([el, key]) => {
      const val = localStorage.getItem(key) || "";
      el.value = val;
    });

    // 4. 恢复PN
    if (typeSelect.value === "硬盘") {
      switchPnInput(true);
      updatePnOptions("硬盘", newBrand.value, newPnOptions);
      updatePnOptions("硬盘", oldBrand.value, oldPnOptions);

      [
        ["new", "pda_newPN", "newPNSelect"],
        ["old", "pda_oldPN", "oldPNSelect"],
      ].forEach(([type, key, selectId]) => {
        const val = localStorage.getItem(key) || "";
        const select = document.getElementById(selectId);
        if (select) {
          select.value = val;
        }
      });
    } else {
      [
        ["new", "pda_newPN", "newPNSelect"],
        ["old", "pda_oldPN", "oldPNSelect"],
      ].forEach(([type, key, selectId]) => {
        const val = localStorage.getItem(key) || "";
        const input = document.getElementById(type === "new" ? "newPN" : "oldPN");
        const select = document.getElementById(selectId);
        if (select && select.style.display !== "none") {
          select.value = val;
        } else {
          input.value = val;
        }
      });
    }

    // 最后触发一次更新
    typeSelect.dispatchEvent(new Event("change"));
  } finally {
    restoring = false;
    update();
  }
}

// 修改事件绑定函数
function bindEvents() {
  if (typeSelect) {
    typeSelect.addEventListener("change", async () => {
      const type = typeSelect.value;
      const isOptical = type === "光模块";
      if (serverSNRow) serverSNRow.classList.toggle("d-none", isOptical);
      if (switchInfoRow) switchInfoRow.classList.toggle("d-none", !isOptical);
      await updateBrandOptions();
      update();
      switchPnInput(type); // 传type字符串
    });
  }

  if (newBrand && oldBrand) {
    [newBrand, oldBrand].forEach((select, index) => {
      select.addEventListener("change", () => {
        const type = typeSelect.value;
        const datalist = index === 0 ? newPnOptions : oldPnOptions;
        updatePnOptions(type, select.value, datalist);
        // 如果是硬盘类型，需要更新select的选项
        if (type === "硬盘") {
          const selectId = index === 0 ? "newPNSelect" : "oldPNSelect";
          const pnSelect = document.getElementById(selectId);
          if (pnSelect) {
            const list = window.partsData.diskPnList.filter((item) => item.brand === select.value);
            pnSelect.innerHTML = `<option value="">请选择硬盘PN</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}【${item.Type}】</option>`).join("");
          }
        }
        update();
      });
    });
  }

  [orderNo, serverSN, switchLocation, portNo, newPN, newSN, oldPN, oldSN].forEach((el) => el.addEventListener("input", update));

  if (copyBtn)
    copyBtn.addEventListener("click", () => {
      const text = preview.innerText.trim();
      navigator.clipboard
        .writeText(text)
        .then(() => {
          showToast("已复制到剪贴板");
        })
        .catch(() => {
          showToast("复制失败，请手动复制", "danger");
        });
    });
}

// 生成硬盘PN下拉选项
function renderDiskPnOptions(datalist, brand) {
  const list = window.partsData.diskPnList.filter((item) => item.brand === brand);
  datalist.innerHTML = `<option value="">请选择硬盘PN</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}【${item.Type}】</option>`).join("");
}

// 新增：切换PN输入框为select或input
function switchPnInput(type) {
  const isDisk = type === "硬盘";
  const isCpu = type === "CPU";
  // 新件PN
  const newPnParent = newPN.parentElement;
  let newPnSelect = document.getElementById("newPNSelect");
  if (isDisk || isCpu) {
    if (!newPnSelect) {
      newPnSelect = document.createElement("select");
      newPnSelect.id = "newPNSelect";
      newPnSelect.className = newPN.className;
      newPnSelect.addEventListener("change", update);
      newPnParent.appendChild(newPnSelect);
    }
    // 填充选项
    const brand = newBrand.value;
    if (isDisk) {
      const list = window.partsData.diskPnList.filter((item) => item.brand === brand);
      newPnSelect.innerHTML = `<option value="">请选择硬盘PN</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}【${item.Type}】</option>`).join("");
    } else {
      const list = window.partsData.cpuPnList.filter((item) => item.brand === brand);
      newPnSelect.innerHTML = `<option value="">请选择CPU型号</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}</option>`).join("");
    }
    newPnSelect.style.display = "";
    newPN.style.display = "none";
  } else {
    if (newPnSelect) newPnSelect.style.display = "none";
    newPN.style.display = "";
  }
  // 旧件PN
  const oldPnParent = oldPN.parentElement;
  let oldPnSelect = document.getElementById("oldPNSelect");
  if (isDisk || isCpu) {
    if (!oldPnSelect) {
      oldPnSelect = document.createElement("select");
      oldPnSelect.id = "oldPNSelect";
      oldPnSelect.className = oldPN.className;
      oldPnSelect.addEventListener("change", update);
      oldPnParent.appendChild(oldPnSelect);
    }
    // 填充选项
    const brand = oldBrand.value;
    if (isDisk) {
      const list = window.partsData.diskPnList.filter((item) => item.brand === brand);
      oldPnSelect.innerHTML = `<option value="">请选择硬盘PN</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}【${item.Type}】</option>`).join("");
    } else {
      const list = window.partsData.cpuPnList.filter((item) => item.brand === brand);
      oldPnSelect.innerHTML = `<option value="">请选择CPU型号</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}</option>`).join("");
    }
    oldPnSelect.style.display = "";
    oldPN.style.display = "none";
  } else {
    if (oldPnSelect) oldPnSelect.style.display = "none";
    oldPN.style.display = "";
  }
}

// 监听硬盘PN select 的变化，实时更新预览
function bindPNSelectUpdate() {
  ["newPNSelect", "oldPNSelect"].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) {
      sel.removeEventListener("change", update); // 防止重复绑定
      sel.addEventListener("change", update);
    }
  });
}

// 修改updatePnOptions函数
function updatePnOptions(type, brand, datalist) {
  if (restoring) return;
  if (type === "硬盘") {
    renderDiskPnOptions(datalist, brand);
    // 同步select
    const isNew = datalist === newPnOptions;
    const select = document.getElementById(isNew ? "newPNSelect" : "oldPNSelect");
    if (select) {
      const list = window.partsData.diskPnList.filter((item) => item.brand === brand);
      select.innerHTML = `<option value="">请选择硬盘PN</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}【${item.Type}】</option>`).join("");
    }
  } else if (type === "CPU") {
    renderCpuPnOptions(datalist, brand);
    // 同步select
    const isNew = datalist === newPnOptions;
    const select = document.getElementById(isNew ? "newPNSelect" : "oldPNSelect");
    if (select) {
      const list = window.partsData.cpuPnList.filter((item) => item.brand === brand);
      select.innerHTML = `<option value="">请选择CPU型号</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}</option>`).join("");
    }
  } else {
    const list = (window.partsData.pnDataMap[type] && window.partsData.pnDataMap[type][brand]) || [];
    datalist.innerHTML = list.map((pn) => `<option value="${pn}">`).join("");
  }
}

// 生成CPU PN下拉选项
function renderCpuPnOptions(datalist, brand) {
  const list = window.partsData.cpuPnList.filter((item) => item.brand === brand);
  datalist.innerHTML = `<option value="">请选择CPU型号</option>` + list.map((item) => `<option value="${item.pn}">${item.pn}</option>`).join("");
}

function formatSamsungMemoryPn(pn) {
  const index = pn.indexOf("M");
  return index !== -1 ? pn.slice(index) : pn;
}

function update() {
  if (restoring) return;
  const type = typeSelect.value;
  const order = orderNo.value.trim().match(/\d+/)?.[0] || "";
  const isOptical = type === "光模块";
  const switchLoc = switchLocation.value.trim();
  const port = portNo.value.trim();
  const server = serverSN.value.trim();
  const brand1 = newBrand.value || "";
  const brand2 = oldBrand.value || "";

  // 优先取 select 的值
  let pn1 = "";
  let pn2 = "";
  const newPnSelect = document.getElementById("newPNSelect");
  const oldPnSelect = document.getElementById("oldPNSelect");
  if (type === "硬盘" || type === "CPU") {
    pn1 = (newPnSelect && newPnSelect.style.display !== "none") ? newPnSelect.value : newPN.value.trim();
    pn2 = (oldPnSelect && oldPnSelect.style.display !== "none") ? oldPnSelect.value : oldPN.value.trim();
  } else {
    pn1 = newPN.value.trim();
    pn2 = oldPN.value.trim();
  }
  let sn1 = newSN.value.trim();
  let sn2 = oldSN.value.trim();

  // 清除提示
  checkNewPN.textContent = "";
  checkOldPN.textContent = "";
  checkNewPN.className = "";
  checkOldPN.className = "";

  // Samsung 内存格式化逻辑
  if (type === "内存") {
    if (brand1 === "Samsung" && pn1.length > 0) {
      const formatted = formatSamsungMemoryPn(pn1);
      pn1 = formatted;
      newPN.value = formatted;
    }
    if (brand2 === "Samsung" && pn2.length > 0) {
      const formatted = formatSamsungMemoryPn(pn2);
      pn2 = formatted;
      oldPN.value = formatted;
    }
  }

  // ✅ 字符数统计（必须在格式化之后）
  countNewPN.textContent = `字符数：${pn1.length}`;
  countNewSN.textContent = `字符数：${sn1.length}`;
  countOldPN.textContent = `字符数：${pn2.length}`;
  countOldSN.textContent = `字符数：${sn2.length}`;

  // Samsung 格式校验提示
  if (type === "内存") {
    if (brand1 === "Samsung" && pn1 && !pn1.startsWith("M")) {
      checkNewPN.textContent = "请检查内存PN";
      checkNewPN.className = "text-danger me-2";
    }
    if (brand2 === "Samsung" && pn2 && !pn2.startsWith("M")) {
      checkOldPN.textContent = "请检查内存PN";
      checkOldPN.className = "text-danger me-2";
    }
  }

  // 优化：只要新旧PN都已选择且不为"请选择硬盘PN"时就校验一致性
  if (type === "内存" || type === "硬盘") {
    if (pn1 && pn2 && pn1 !== "" && pn2 !== "" && pn1 !== "请选择硬盘PN" && pn2 !== "请选择硬盘PN") {
      if (pn1 === pn2) {
        checkNewPN.textContent = "PN一致";
        checkOldPN.textContent = "PN一致";
        checkNewPN.className = "text-success me-2";
        checkOldPN.className = "text-success me-2";
      } else {
        checkNewPN.textContent = "PN不一致";
        checkOldPN.textContent = "PN不一致";
        checkNewPN.className = "text-danger me-2";
        checkOldPN.className = "text-danger me-2";
      }
    } else {
      checkNewPN.textContent = "";
      checkOldPN.textContent = "";
      checkNewPN.className = "";
      checkOldPN.className = "";
    }
  }

  // 文本预览生成（顶格写法）
  const text = `上新下旧：更换「${type || '请选择'}」
单号：${order}
${isOptical ? "位置：" + switchLoc + " " + port : "服务器SN：" + server}
新件品牌：${brand1}
新件SN：${sn1}
新件PN：${pn1}
旧件品牌：${brand2}
旧件SN：${sn2}
旧件PN：${pn2}`;

  preview.textContent = text;
  hljs.highlightElement(preview);
  saveFormData();
}

// 修改 sendToFeishu 函数
function sendToFeishu() {
  const type = typeSelect.value;
  const orderInput = orderNo.value.trim();

  // 检查是否为完整url
  const urlMatch = orderInput.match(/https?:\/\/[\S]+/);
  if (!urlMatch) {
    showToast("请粘贴完整的单号链接", "warning");
    return;
  }
  const orderUrl = urlMatch[0];
  const orderNum = orderUrl.match(/(\d+)(?!.*\d)/)?.[0] || "";
  if (!orderNum) {
    showToast("链接中未找到单号数字", "warning");
    return;
  }

  const isOptical = type === "光模块";
  const switchLoc = switchLocation.value.trim();
  const port = portNo.value.trim();
  const server = serverSN.value.trim();
  const brand1 = newBrand.value || "";
  const brand2 = oldBrand.value || "";
  let pn1 = type === "硬盘" ? document.getElementById("newPNSelect")?.value || "" : newPN.value.trim();
  let sn1 = newSN.value.trim();
  let pn2 = type === "硬盘" ? document.getElementById("oldPNSelect")?.value || "" : oldPN.value.trim();
  let sn2 = oldSN.value.trim();

  const contentArr = [
    [{ tag: "text", text: `上新下旧：更换「${type}」` }],
    [
      { tag: "text", text: "单号：" },
      { tag: "a", text: orderNum, href: orderUrl },
    ],
    [{ tag: "text", text: isOptical ? `位置：${switchLoc} ${port}` : `服务器SN：${server}` }],
    [{ tag: "text", text: `新件品牌：${brand1}` }],
    [{ tag: "text", text: `新件SN：${sn1}` }],
    [{ tag: "text", text: `新件PN：${pn1}` }],
    [{ tag: "text", text: `旧件品牌：${brand2}` }],
    [{ tag: "text", text: `旧件SN：${sn2}` }],
    [{ tag: "text", text: `旧件PN：${pn2}` }],
  ];

  const feishuPost = {
    post: {
      zh_cn: {
        title: "配件更换通知",
        content: contentArr,
      },
    },
  };

  fetch("https://test.jsjs.net", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ feishuPost }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "网络错误");
      }
      return res.json();
    })
    .then(() => {
      showToast("已发送 ✅", "success");
    })
    .catch(() => {
      showToast("发送失败 ❌", "danger");
    });
}

// 修改 sendApplyNotify 函数
function sendApplyNotify() {
  const orderInput = orderNo.value.trim();
  const urlMatch = orderInput.match(/https?:\/\/[\S]+/);
  if (!urlMatch) {
    showToast("请粘贴完整的单号链接", "warning");
    return;
  }
  const orderUrl = urlMatch[0];
  const orderNum = orderUrl.match(/(\d+)(?!.*\d)/)?.[0] || "";
  if (!orderNum) {
    showToast("链接中未找到单号数字", "warning");
    return;
  }
  const brand2 = oldBrand.value.trim();
  const pn2 = oldPN.value.trim();
  const sn2 = oldSN.value.trim();
  if (!brand2 || !sn2 || !pn2) {
    showToast("旧件品牌、旧件SN、旧件PN均为必填项", "warning");
    return;
  }
  fetch("https://test.jsjs.net", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "apply",
      orderNum,
      orderUrl,
      brand2,
      sn2,
      pn2,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "网络错误");
      }
      return res.json();
    })
    .then(() => {
      showToast("申领通知已发送 ✅", "success");
    })
    .catch(() => {
      showToast("申领通知发送失败 ❌", "danger");
    });
}

// 获取PN值（兼容input和select）
function getPNValue(type) {
  const input = document.getElementById(type === "new" ? "newPN" : "oldPN");
  const select = document.getElementById(type === "new" ? "newPNSelect" : "oldPNSelect");
  if (select && select.style.display !== "none") {
    return select.value;
  }
  return input.value;
}

// 保存表单数据
function saveFormData() {
  if (restoring) return;
  [
    ["pda_orderNo", orderNo.value],
    ["pda_switchLocation", switchLocation.value],
    ["pda_portNo", portNo.value],
    ["pda_serverSN", serverSN.value],
    ["pda_newSN", newSN.value],
    ["pda_oldSN", oldSN.value],
    ["pda_newPN", getPNValue("new")],
    ["pda_oldPN", getPNValue("old")],
  ].forEach(([key, val]) => {
    if (val && val !== "请选择" && val !== "请选择硬盘PN") {
      localStorage.setItem(key, val);
    } else {
      localStorage.removeItem(key);
    }
  });
  [
    ["pda_type", typeSelect.value],
    ["pda_newBrand", newBrand.value],
    ["pda_oldBrand", oldBrand.value],
  ].forEach(([key, val]) => {
    if (val && val !== "请选择") {
      localStorage.setItem(key, val);
    } else {
      localStorage.removeItem(key);
    }
  });
}

// 监听所有表单项的变化，自动保存
[orderNo, switchLocation, portNo, serverSN, newSN, oldSN, newPN, oldPN, typeSelect, newBrand, oldBrand].forEach((el) => {
  if (el) {
    el.addEventListener("input", saveFormData);
    el.addEventListener("change", saveFormData);
    el.addEventListener("paste", function () {
      setTimeout(saveFormData, 0);
    });
  }
});

// select PN 变化也要保存（动态生成的select也要绑定）
function bindPNSelectSave() {
  ["newPNSelect", "oldPNSelect"].forEach((id) => {
    const sel = document.getElementById(id);
    if (sel) {
      sel.onchange = saveFormData;
    }
  });
}
document.addEventListener("change", function (e) {
  if (e.target && (e.target.id === "newPNSelect" || e.target.id === "oldPNSelect")) {
    saveFormData();
  }
});

// 重置按钮
function resetForm() {
  if (confirm("确定要重置所有数据吗？")) {
    ["pda_orderNo", "pda_type", "pda_switchLocation", "pda_portNo", "pda_serverSN", "pda_newBrand", "pda_oldBrand", "pda_newPN", "pda_oldPN", "pda_newSN", "pda_oldSN"].forEach((key) =>
      localStorage.removeItem(key)
    );
    // 清空表单
    orderNo.value = "";
    orderNoDisplay.textContent = ""; // 清除单号显示
    switchLocation.value = "";
    portNo.value = "";
    serverSN.value = "";
    newSN.value = "";
    oldSN.value = "";
    newPN.value = "";
    oldPN.value = "";
    typeSelect.value = "请选择";
    newBrand.value = "请选择";
    oldBrand.value = "请选择";
    // 触发类型选择事件以更新UI
    typeSelect.dispatchEvent(new Event("change"));
    showToast("表单已重置", "success");
  }
}
