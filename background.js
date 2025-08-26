// 背景 script - 服務工作者
chrome.runtime.onInstalled.addListener(() => {
  console.log('CSS注入器已安裝');

  // 初始化預設設定
  chrome.storage.local.get(['globalEnabled'], (result) => {
    if (result.globalEnabled === undefined) {
      chrome.storage.local.set({ globalEnabled: true });
    }
  });
});

// 監聽來自內容 script 和彈出視窗的訊息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    switch (request.action) {
      case 'getStorageData':
        chrome.storage.local.get(request.keys || null, (result) => {
          sendResponse({ success: true, data: result });
        });
        return true; // 表示異步回應

      case 'setStorageData':
        chrome.storage.local.set(request.data, () => {
          sendResponse({ success: true });
        });
        return true;

      case 'removeStorageData':
        chrome.storage.local.remove(request.keys, () => {
          sendResponse({ success: true });
        });
        return true;

      case 'clearStorage':
        chrome.storage.local.clear(() => {
          // 重新設定預設值
          chrome.storage.local.set({ globalEnabled: true }, () => {
            sendResponse({ success: true });
          });
        });
        return true;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Background script error:', error);
    sendResponse({ success: false, error: error.message });
  }
});

// 標籤頁更新時重新注入CSS（可選功能）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      const hostname = url.hostname;

      // 只處理 http 和 https 協議
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        // 通知內容 script 重新載入CSS
        chrome.tabs.sendMessage(tabId, {
          action: 'refreshCSS'
        }).catch(() => {
          // 忽略錯誤，可能是特殊頁面無法注入內容 script 
        });
      }
    } catch (error) {
      // 忽略無效URL
    }
  }
});
