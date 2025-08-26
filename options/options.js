class OptionsManager {
  constructor() {
    this.globalEnabled = true;
    this.websites = [];
    this.currentWebsite = '';
    this.currentRules = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.bindEvents();
    this.updateUI();
  }

  async loadData() {
    try {
      // 載入全域設定
      const globalResult = await chrome.storage.local.get(['globalEnabled']);
      this.globalEnabled = globalResult.globalEnabled !== false;

      // 載入所有網站數據
      const allData = await chrome.storage.local.get();
      this.websites = Object.keys(allData).filter(key =>
        key !== 'globalEnabled' &&
        typeof allData[key] === 'object' &&
        (Array.isArray(allData[key]) || Object.keys(allData[key]).length > 0)
      );
    } catch (error) {
      console.error('載入數據失敗:', error);
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

    // 搜尋
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterWebsites(e.target.value);
      });
    }

    // 添加網站按鈕
    const addWebsiteBtn = document.getElementById('addWebsiteBtn');
    if (addWebsiteBtn) {
      addWebsiteBtn.addEventListener('click', () => {
        this.showAddWebsiteModal();
      });
    }

    // 模態框事件
    this.bindModalEvents();

    // 添加規則按鈕
    const addRuleBtn = document.getElementById('addRuleBtn');
    if (addRuleBtn) {
      addRuleBtn.addEventListener('click', () => {
        this.addNewRule();
      });
    }

    // 儲存全部按鈕
    const saveAllBtn = document.getElementById('saveAllBtn');
    if (saveAllBtn) {
      saveAllBtn.addEventListener('click', () => {
        this.saveAllRules();
      });
    }
  }

  bindModalEvents() {
    const modal = document.getElementById('addWebsiteModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const confirmBtn = document.getElementById('confirmAddBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideAddWebsiteModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideAddWebsiteModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmAddWebsite();
      });
    }

    // 點擊背景關閉模態框
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideAddWebsiteModal();
        }
      });
    }

    // Enter 鍵確認
    const websiteUrlInput = document.getElementById('websiteUrl');
    if (websiteUrlInput) {
      websiteUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.confirmAddWebsite();
        }
      });
    }
  }

  async toggleGlobal(enabled) {
    this.globalEnabled = enabled;
    try {
      await chrome.storage.local.set({ globalEnabled: enabled });
      this.showNotification('全域設定已更新');
    } catch (error) {
      console.error('更新全域設定失敗:', error);
      this.showNotification('更新失敗', 'error');
    }
  }

  filterWebsites(query) {
    const filteredWebsites = this.websites.filter(website =>
      website.toLowerCase().includes(query.toLowerCase())
    );
    this.renderWebsitesList(filteredWebsites);
  }

  showAddWebsiteModal() {
    const modal = document.getElementById('addWebsiteModal');
    const input = document.getElementById('websiteUrl');
    if (modal) {
      modal.style.display = 'flex';
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  }

  hideAddWebsiteModal() {
    const modal = document.getElementById('addWebsiteModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  async confirmAddWebsite() {
    const input = document.getElementById('websiteUrl');
    if (!input) return;

    const url = input.value.trim();
    if (!url) {
      this.showNotification('請輸入網站網址', 'error');
      return;
    }

    const hostname = this.extractHostname(url);
    if (!hostname) {
      this.showNotification('無效的網址格式', 'error');
      return;
    }

    if (this.websites.includes(hostname)) {
      this.showNotification('該網站已存在', 'error');
      return;
    }

    try {
      // 創建空的規則數組
      await chrome.storage.local.set({ [hostname]: [] });
      this.websites.push(hostname);
      this.hideAddWebsiteModal();
      this.updateUI();
      this.selectWebsite(hostname);
      this.showNotification('網站添加成功');
    } catch (error) {
      console.error('添加網站失敗:', error);
      this.showNotification('添加失敗', 'error');
    }
  }

  extractHostname(url) {
    try {
      // 如果沒有協議，添加 http://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      // 如果 URL 解析失敗，嘗試直接作為域名處理
      const match = url.match(/^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/);
      return match ? url : null;
    }
  }

  async selectWebsite(hostname) {
    console.log('Selecting website:', hostname); // 調試日誌
    this.currentWebsite = hostname;

    try {
      const result = await chrome.storage.local.get([hostname]);
      const siteData = result[hostname];

      console.log('Site data for', hostname, ':', siteData); // 調試日誌

      if (Array.isArray(siteData)) {
        this.currentRules = siteData;
      } else if (siteData && typeof siteData === 'object') {
        // 轉換舊格式
        this.currentRules = Object.values(siteData);
      } else {
        this.currentRules = [];
      }

      console.log('Current rules:', this.currentRules); // 調試日誌

      // 更新界面顯示 - 這是關鍵的修復
      this.updateMainContent();

    } catch (error) {
      console.error('載入網站規則失敗:', error);
      this.currentRules = [];
      this.updateMainContent(); // 即使出錯也要更新界面
    }
  }

  addNewRule() {
    const newRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '新 CSS 規則',
      description: '',
      css: '/* 在此輸入您的CSS */\n.example {\n  color: #333;\n  background: white;\n}',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.currentRules.push(newRule);
    this.updateRulesEditor();
    this.scrollToRule(newRule.id);
  }

  async saveAllRules() {
    if (!this.currentWebsite) return;

    try {
      await chrome.storage.local.set({
        [this.currentWebsite]: this.currentRules
      });

      // 儲存後更新左側網站列表中的規則數量
      this.updateWebsiteRuleCount(this.currentWebsite);

      this.showNotification('規則已儲存');
    } catch (error) {
      console.error('儲存規則失敗:', error);
      this.showNotification('儲存失敗', 'error');
    }
  }

  async deleteRule(ruleId) {
    if (!confirm('確定要刪除此規則嗎？')) return;

    this.currentRules = this.currentRules.filter(rule => rule.id !== ruleId);
    this.updateRulesEditor();
    await this.saveAllRules();
  }

  updateUI() {
    // 更新全域開關
    const globalToggle = document.getElementById('globalEnabled');
    if (globalToggle) {
      globalToggle.checked = this.globalEnabled;
    }

    // 更新網站列表
    this.renderWebsitesList(this.websites);

    // 更新歡迎畫面或編輯器
    this.updateMainContent();
  }

  renderWebsitesList(websites) {
    const websitesList = document.getElementById('websitesList');
    const emptyState = document.getElementById('emptyState');

    if (!websitesList) return;

    if (websites.length === 0) {
      websitesList.innerHTML = `
        <div class="empty-state">
          <p>尚未添加任何網站</p>
          <p class="hint">點擊「+ 添加網站」開始</p>
        </div>
      `;
      return;
    }

    // 先生成基本的 HTML 結構，規則數量稍後更新
    const websitesHTML = websites.map(website => `
      <div class="website-item ${website === this.currentWebsite ? 'active' : ''}" 
           data-website="${website}">
        <div class="website-info">
          <div class="website-name">${this.escapeHtml(website)}</div>
          <div class="website-rules-count" data-website="${website}">載入中...</div>
        </div>
        <button class="delete-website-btn" data-website="${website}" title="刪除網站">
          <span>&times;</span>
        </button>
      </div>
    `).join('');

    websitesList.innerHTML = websitesHTML;

    // 綁定網站選擇事件
    websites.forEach(website => {
      const item = websitesList.querySelector(`[data-website="${website}"]`);
      if (item) {
        item.addEventListener('click', (e) => {
          if (!e.target.closest('.delete-website-btn')) {
            console.log('Clicked website:', website); // 調試日誌
            this.selectWebsite(website);
            this.updateWebsiteSelection(website);
          }
        });

        const deleteBtn = item.querySelector('.delete-website-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteWebsite(website);
          });
        }

        // 異步載入規則數量
        this.getRulesCount(website).then(count => {
          const countElement = item.querySelector('.website-rules-count');
          if (countElement) {
            countElement.textContent = `${count} 條規則`;
          }
        });
      }
    });
  }

  async getRulesCount(website) {
    try {
      const result = await chrome.storage.local.get([website]);
      const siteData = result[website];

      if (Array.isArray(siteData)) {
        return siteData.length;
      } else if (siteData && typeof siteData === 'object') {
        return Object.keys(siteData).length;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async updateWebsiteRuleCount(website) {
    try {
      // 找到對應的網站項目元素
      const countElement = document.querySelector(`[data-website="${website}"] .website-rules-count`);
      if (countElement) {
        const count = await this.getRulesCount(website);
        countElement.textContent = `${count} 條規則`;
      }
    } catch (error) {
      console.error('更新網站規則數量失敗:', error);
    }
  }

  updateWebsiteSelection(selectedWebsite) {
    const items = document.querySelectorAll('.website-item');
    items.forEach(item => {
      if (item.dataset.website === selectedWebsite) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  updateMainContent() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const rulesEditor = document.getElementById('rulesEditor');

    if (this.currentWebsite) {
      if (welcomeScreen) welcomeScreen.style.display = 'none';
      if (rulesEditor) rulesEditor.style.display = 'block';
      this.updateRulesEditor();
    } else {
      if (welcomeScreen) welcomeScreen.style.display = 'block';
      if (rulesEditor) rulesEditor.style.display = 'none';
    }
  }

  updateRulesEditor() {
    const currentWebsiteTitle = document.getElementById('currentWebsiteTitle');
    const rulesList = document.getElementById('rulesList');

    if (currentWebsiteTitle) {
      currentWebsiteTitle.textContent = this.currentWebsite;
    }

    if (!rulesList) return;

    if (this.currentRules.length === 0) {
      rulesList.innerHTML = `
        <div class="empty-rules">
          <p>此網站尚無 CSS 規則</p>
          <p class="hint">點擊「+ 新增規則」開始</p>
        </div>
      `;
      return;
    }

    const rulesHTML = this.currentRules.map(rule => this.createRuleHTML(rule)).join('');
    rulesList.innerHTML = rulesHTML;

    // 綁定規則事件
    this.bindRuleEvents();
  }

  createRuleHTML(rule) {
    return `
      <div class="rule-card" data-rule-id="${rule.id}">
        <div class="rule-header">
          <input type="text" class="rule-name-input" value="${this.escapeHtml(rule.name)}" 
                 placeholder="規則名稱">
          <div class="rule-actions">
            <label class="rule-toggle">
              <input type="checkbox" ${rule.enabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <button class="delete-rule-btn" title="刪除規則">&times;</button>
          </div>
        </div>
        
        <div class="rule-description">
          <input type="text" class="rule-description-input" value="${this.escapeHtml(rule.description || '')}" 
                 placeholder="規則描述（可選）">
        </div>
        
        <div class="rule-editor">
          <label>CSS ：</label>
          <textarea class="css-editor" rows="10" placeholder="/* 在此輸入您的CSS */">${this.escapeHtml(rule.css || '')}</textarea>
        </div>
        
        <div class="rule-footer">
          <small class="rule-meta">
            建立：${this.formatDate(rule.createdAt)} | 
            更新：${this.formatDate(rule.updatedAt)}
          </small>
        </div>
      </div>
    `;
  }

  bindRuleEvents() {
    const ruleCards = document.querySelectorAll('.rule-card');

    ruleCards.forEach(card => {
      const ruleId = card.dataset.ruleId;
      const rule = this.currentRules.find(r => r.id === ruleId);
      if (!rule) return;

      // 名稱輸入
      const nameInput = card.querySelector('.rule-name-input');
      if (nameInput) {
        nameInput.addEventListener('input', (e) => {
          rule.name = e.target.value;
          rule.updatedAt = new Date().toISOString();
        });
      }

      // 描述輸入
      const descInput = card.querySelector('.rule-description-input');
      if (descInput) {
        descInput.addEventListener('input', (e) => {
          rule.description = e.target.value;
          rule.updatedAt = new Date().toISOString();
        });
      }

      // CSS 編輯器
      const cssEditor = card.querySelector('.css-editor');
      if (cssEditor) {
        cssEditor.addEventListener('input', (e) => {
          rule.css = e.target.value;
          rule.updatedAt = new Date().toISOString();
        });
      }

      // 啟用開關
      const toggle = card.querySelector('input[type="checkbox"]');
      if (toggle) {
        toggle.addEventListener('change', (e) => {
          rule.enabled = e.target.checked;
          rule.updatedAt = new Date().toISOString();
        });
      }

      // 刪除按鈕
      const deleteBtn = card.querySelector('.delete-rule-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          this.deleteRule(ruleId);
        });
      }
    });
  }

  async deleteWebsite(website) {
    if (!confirm(`確定要刪除網站 "${website}" 及其所有規則嗎？`)) return;

    try {
      await chrome.storage.local.remove([website]);
      this.websites = this.websites.filter(w => w !== website);

      if (this.currentWebsite === website) {
        this.currentWebsite = '';
        this.currentRules = [];
      }

      this.updateUI();
      this.showNotification('網站已刪除');
    } catch (error) {
      console.error('刪除網站失敗:', error);
      this.showNotification('刪除失敗', 'error');
    }
  }

  scrollToRule(ruleId) {
    setTimeout(() => {
      const ruleCard = document.querySelector(`[data-rule-id="${ruleId}"]`);
      if (ruleCard) {
        ruleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const notificationClose = document.getElementById('notificationClose');

    if (!notification || !notificationText) return;

    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'flex';

    // 自動隱藏
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);

    // 手動關閉
    if (notificationClose) {
      notificationClose.onclick = () => {
        notification.style.display = 'none';
      };
    }
  }

  formatDate(dateString) {
    if (!dateString) return '未知';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '未知';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});
