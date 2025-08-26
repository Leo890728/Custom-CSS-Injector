// 內容 script  - 在網頁中運行，負責CSS注入
(function() {
  'use strict';

  let injectedStyles = new Map();

  // 初始化
  function init() {
    loadAndInjectCSS();
  }

  // 載入並注入CSS
  async function loadAndInjectCSS() {
    const hostname = window.location.hostname;

    try {
      const result = await chrome.storage.local.get([hostname, 'globalEnabled']);

      if (result.globalEnabled === false) return;

      let cssRules = result[hostname] || [];

      // 處理資料格式問題
      if (!Array.isArray(cssRules) && typeof cssRules === 'object' && cssRules !== null) {
        console.log('CSS rules for', hostname, 'is not an array:', cssRules);

        // 檢查是否為類似陣列的物件（例如 {0: {...}, 1: {...}}）
        const keys = Object.keys(cssRules);
        const isArrayLikeObject = keys.every(key => /^\d+$/.test(key));

        if (isArrayLikeObject) {
          // 轉換為真正的陣列
          cssRules = Object.values(cssRules);
          console.log('Converted array-like object to array for', hostname);

          // 修復資料 - 重新儲存為正確的陣列格式
          await chrome.storage.local.set({ [hostname]: cssRules });
          console.log('Fixed array format for', hostname);
        } else {
          // 嘗試從物件屬性中提取規則
          const values = Object.values(cssRules);
          if (values.length > 0 && values[0] && typeof values[0] === 'object') {
            cssRules = values;
            console.log('Extracted rules from object properties for', hostname);

            // 修復資料格式
            await chrome.storage.local.set({ [hostname]: cssRules });
          } else {
            console.warn('Unable to process CSS rules for', hostname, cssRules);
            return;
          }
        }
      }

      // 確保現在是陣列
      if (Array.isArray(cssRules)) {
        cssRules.forEach(rule => {
          if (rule && rule.enabled && rule.id && rule.css) {
            injectCSS(rule.id, rule.css);
          }
        });
        console.log(`Injected ${cssRules.filter(r => r && r.enabled).length} CSS rules for ${hostname}`);
      } else {
        console.warn('CSS rules for', hostname, 'is still not an array:', cssRules);
      }
    } catch (error) {
      console.error('Error loading CSS rules:', error);
    }
  }

  // 注入CSS
  function injectCSS(ruleId, css) {
    try {
      // 移除舊的樣式
      if (injectedStyles.has(ruleId)) {
        injectedStyles.get(ruleId).remove();
      }

      // 建立新的樣式元素
      const style = document.createElement('style');
      style.textContent = css;
      style.setAttribute('data-css-injector-id', ruleId);
      document.head.appendChild(style);

      injectedStyles.set(ruleId, style);
    } catch (error) {
      console.error('Error injecting CSS:', error);
    }
  }

  // 移除CSS
  function removeCSS(ruleId) {
    try {
      if (injectedStyles.has(ruleId)) {
        injectedStyles.get(ruleId).remove();
        injectedStyles.delete(ruleId);
      }
    } catch (error) {
      console.error('Error removing CSS:', error);
    }
  }

  // 監聽來自popup的訊息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      console.log('Content script received message:', request); // 調試日誌

      switch (request.action) {
        case 'updateGlobalState':
          if (request.globalEnabled === false) {
            // 移除所有注入的樣式
            injectedStyles.forEach(style => style.remove());
            injectedStyles.clear();
            console.log('Global CSS disabled, removed all styles');
          } else {
            // 重新載入CSS
            loadAndInjectCSS();
            console.log('Global CSS enabled, reloading styles');
          }
          sendResponse({ success: true, action: 'updateGlobalState' });
          break;

        case 'updateCSS':
          // 更新特定網站的CSS
          if (request.hostname === window.location.hostname) {
            // 清除舊的樣式
            injectedStyles.forEach(style => style.remove());
            injectedStyles.clear();

            // 注入新的樣式
            if (Array.isArray(request.rules)) {
              request.rules.forEach(rule => {
                if (rule && rule.enabled && rule.id && rule.css) {
                  injectCSS(rule.id, rule.css);
                }
              });
              console.log(`Updated CSS for ${request.hostname}, applied ${request.rules.filter(r => r.enabled).length} rules`);
            }
          }
          sendResponse({ success: true, action: 'updateCSS' });
          break;

        case 'refreshCSS':
          // 清除所有注入的樣式並重新載入
          console.log('Refreshing CSS...');
          injectedStyles.forEach(style => style.remove());
          injectedStyles.clear();

          // 重新載入並注入CSS
          loadAndInjectCSS().then(() => {
            console.log('CSS refresh completed');
            sendResponse({ success: true, action: 'refreshCSS', injectedCount: injectedStyles.size });
          }).catch(error => {
            console.error('CSS refresh failed:', error);
            sendResponse({ success: false, action: 'refreshCSS', error: error.message });
          });

          // 返回 true 表示異步響應
          return true;

        case 'toggleRule':
          if (request.enabled && request.css) {
            injectCSS(request.ruleId, request.css);
          } else {
            removeCSS(request.ruleId);
          }
          sendResponse({ success: true, action: 'toggleRule' });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action: ' + request.action });
      }

    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  });

  // 頁面載入完成後初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
