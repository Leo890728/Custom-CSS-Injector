// Popup 頁面 JavaScript
class PopupManager {
  constructor() {
    this.globalEnabled = true;
    this.currentHostname = '';
    this.currentRules = [];
    this.init();
  }

  async init() {
    await this.loadGlobalState();
    await this.loadCurrentSite();
    this.bindEvents();
    this.updateUI();
  }

  async loadGlobalState() {
    try {
      const result = await chrome.storage.local.get(['globalEnabled']);
      this.globalEnabled = result.globalEnabled !== false;
    } catch (error) {
      console.error('載入全域狀態失敗:', error);
    }
  }

  async loadCurrentSite() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) return;

      const url = new URL(tab.url);
      this.currentHostname = url.hostname;

      // 載入該網站的 CSS 規則
      const result = await chrome.storage.local.get([this.currentHostname]);
      const siteData = result[this.currentHostname];

      if (siteData && Array.isArray(siteData)) {
        this.currentRules = siteData;
      } else if (siteData && typeof siteData === 'object') {
        // 處理舊格式數據
        this.currentRules = Object.values(siteData);
      } else {
        this.currentRules = [];
      }
    } catch (error) {
      console.error('載入當前網站失敗:', error);
      this.currentHostname = '未知網站';
      this.currentRules = [];
    }
  }

  bindEvents() {
    // 全域開關
    const globalToggle = document.getElementById('globalEnabled');
    if (globalToggle) {
      globalToggle.addEventListener('change', (e) => {
        this.toggleGlobal(e.target.checked);
      });
    }

    // 添加規則按鈕
    const addRuleBtn = document.getElementById('addRuleBtn');
    if (addRuleBtn) {
      addRuleBtn.addEventListener('click', () => {
        this.openOptions();
      });
    }

    // 設定按鈕
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openOptions();
      });
    }

    // 重新載入按鈕
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshCSS();
      });
    }
  }

  async toggleGlobal(enabled) {
    this.globalEnabled = enabled;
    try {
      await chrome.storage.local.set({ globalEnabled: enabled });
      this.updateUI();

      // 通知內容 script 更新狀態
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateGlobalState',
          globalEnabled: enabled
        }).catch(() => {
          // 忽略消息發送失敗（可能頁面還沒載入內容 script）
        });
      }
    } catch (error) {
      console.error('切換全域狀態失敗:', error);
    }
  }

  async toggleRule(ruleId, enabled) {
    const rule = this.currentRules.find(r => r.id === ruleId);
    if (!rule) return;

    rule.enabled = enabled;
    rule.updatedAt = new Date().toISOString();

    try {
      await chrome.storage.local.set({
        [this.currentHostname]: this.currentRules
      });

      // 通知內容 script 更新 CSS
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateCSS',
          hostname: this.currentHostname,
          rules: this.currentRules
        }).catch(() => {
          // 忽略消息發送失敗
        });
      }
    } catch (error) {
      console.error('切換規則狀態失敗:', error);
    }
  }

  async refreshCSS() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        console.log('Refreshing CSS for tab:', tab.id, 'hostname:', this.currentHostname);

        // 重新載入當前網站數據
        await this.loadCurrentSite();

        // 先更新 popup UI
        this.updateUI();

        // 通知內容 script 重新載入 CSS，並等待回應
        try {
          const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'refreshCSS',
            hostname: this.currentHostname,
            rules: this.currentRules
          });
          console.log('CSS refresh response:', response);
        } catch (messageError) {
          console.log('Message failed, trying to inject content script and retry...');

          // 如果消息發送失敗，可能是內容 script 沒有載入，嘗試注入
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });

            // 等待一下再重試
            setTimeout(async () => {
              try {
                await chrome.tabs.sendMessage(tab.id, {
                  action: 'refreshCSS',
                  hostname: this.currentHostname,
                  rules: this.currentRules
                });
                console.log('Retry message sent successfully');
              } catch (retryError) {
                console.log('Retry also failed:', retryError);
              }
            }, 100);
          } catch (injectError) {
            console.log('Failed to inject content script:', injectError);
          }
        }

        // 強制重新載入頁面作為備選方案
        if (this.currentRules.length > 0) {
          try {
            await chrome.tabs.reload(tab.id);
          } catch (reloadError) {
            console.log('Page reload failed:', reloadError);
          }
        }
      }
    } catch (error) {
      console.error('重新載入 CSS 失敗:', error);
    }
  }

  openOptions() {
    chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    window.close();
  }

  updateUI() {
    // 更新全域開關
    const globalToggle = document.getElementById('globalEnabled');
    if (globalToggle) {
      globalToggle.checked = this.globalEnabled;
    }

    // 更新網站資訊
    const siteName = document.getElementById('siteName');
    const ruleCount = document.getElementById('ruleCount');
    if (siteName) {
      siteName.textContent = this.currentHostname || '未知網站';
    }
    if (ruleCount) {
      ruleCount.textContent = `${this.currentRules.length} 條規則`;
    }

    // 更新規則列表
    this.updateRulesList();
  }

  updateRulesList() {
    const rulesList = document.getElementById('rulesList');
    const noRules = document.getElementById('noRules');

    if (!rulesList) return;

    if (this.currentRules.length === 0) {
      if (noRules) {
        noRules.style.display = 'block';
      }
      rulesList.innerHTML = `
        <div class="no-rules">
          <p>此網站尚無 CSS 規則</p>
          <p class="hint">點擊「+ 添加」創建新規則</p>
        </div>
      `;
      return;
    }

    if (noRules) {
      noRules.style.display = 'none';
    }

    rulesList.innerHTML = this.currentRules.map(rule => this.createRuleHTML(rule)).join('');

    // 為每個規則綁定開關事件
    this.currentRules.forEach((rule) => {
      const checkbox = document.getElementById(`rule-${rule.id}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          this.toggleRule(rule.id, e.target.checked);
        });
      }
    });
  }

  createRuleHTML(rule) {
    const preview = this.getPreviewText(rule.css);
    return `
      <div class="rule-item">
        <div class="rule-info">
          <div class="rule-name">${this.escapeHtml(rule.name)}</div>
          <div class="rule-preview">${this.escapeHtml(preview)}</div>
        </div>
        <div class="rule-toggle">
          <input type="checkbox" id="rule-${rule.id}" ${rule.enabled ? 'checked' : ''}>
        </div>
      </div>
    `;
  }

  getPreviewText(css) {
    if (!css) return '空規則';

    // 移除注釋和多餘空白
    const cleaned = css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 截取前 50 個字符
    return cleaned.length > 50 ? cleaned.substring(0, 50) + '...' : cleaned;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
