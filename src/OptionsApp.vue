<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 標題 -->
    <header class="bg-blue-600 text-white shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold">CSS 注入器設定</h1>
          <div class="flex items-center space-x-3">
            <input 
              type="checkbox" 
              id="globalToggle"
              v-model="globalEnabled" 
              @change="toggleGlobal"
              class="sr-only"
            >
            <label 
              for="globalToggle" 
              :class="['toggle cursor-pointer', globalEnabled ? 'active' : '']"
            >
              <span class="toggle-thumb"></span>
            </label>
            <span class="text-sm font-medium">啟用注入器</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要內容 -->
    <div class="max-w-7xl mx-auto flex">
      <!-- 左側網站列表 -->
      <div class="w-80 bg-white border-r border-gray-200 min-h-screen">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">網站列表</h3>
            <button 
              class="btn btn-primary btn-sm"
              @click="showAddWebsiteModal"
            >
              + 添加網站
            </button>
          </div>

          <div class="relative">
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="filterWebsites"
              placeholder="搜尋網站..." 
              class="input pl-10"
            >
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="p-4 overflow-y-auto" style="max-height: calc(100vh - 200px);">
          <div v-if="filteredWebsites.length === 0" class="text-center py-12">
            <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <p class="text-gray-500">尚未添加任何網站</p>
            <p class="text-gray-400 text-sm mt-1">點擊「+ 添加網站」開始</p>
          </div>
          
          <div class="space-y-2">
            <div 
              v-for="website in filteredWebsites" 
              :key="website"
              :class="[
                'group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                website === currentWebsite 
                  ? 'bg-blue-50 border-blue-200 text-blue-900' 
                  : 'hover:bg-gray-50 border-gray-200'
              ]"
              @click="selectWebsite(website)"
            >
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate flex items-center">
                  {{ website }}
                  <span v-if="website === 'ilearn.fcu.edu.tw'" class="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">範例</span>
                </div>
                <div class="text-sm text-gray-500">{{ getWebsiteRulesCount(website) }} 條規則</div>
              </div>
              <button 
                class="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity" 
                @click.stop="deleteWebsite(website)" 
                title="刪除網站"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側規則編輯 -->
      <div class="flex-1 bg-white">
        <div v-if="!currentWebsite" class="flex items-center justify-center h-full">
          <div class="text-center max-w-md">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
            </svg>
            <h2 class="text-2xl font-medium text-gray-900 mb-4">歡迎使用 CSS 注入器</h2>
            <p class="text-gray-600 mb-6">選擇左側的網站來管理 CSS 規則，或添加新網站開始使用。</p>
            
            <!-- 快速開始範例 -->
            <div v-if="websites.includes('ilearn.fcu.edu.tw')" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 class="text-lg font-medium text-green-900 mb-2">🎯 快速開始</h3>
              <p class="text-green-800 text-sm mb-3">我們已經為您準備了逢甲大學 iLearn 的深色主題範例</p>
              <button 
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                @click="selectWebsite('ilearn.fcu.edu.tw')"
              >
                查看 iLearn 深色主題範例
              </button>
            </div>
            
            <div class="space-y-3">
              <button 
                class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                @click="showAddWebsiteModal"
              >
                + 添加新網站
              </button>
              <p class="text-sm text-gray-500">開始為您常用的網站自訂CSS樣式</p>
            </div>
          </div>
        </div>

        <div v-else class="h-full flex flex-col">
          <div class="border-b border-gray-200 p-6">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-medium text-gray-900">{{ currentWebsite }}</h3>
              <div class="flex space-x-3">
                <button class="btn btn-primary" @click="addNewRule">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  新增規則
                </button>
                <button class="btn btn-secondary" @click="saveAllRules">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  儲存全部
                </button>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="currentRules.length === 0" class="text-center py-12">
              <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-gray-500">此網站尚無 CSS 規則</p>
              <p class="text-gray-400 text-sm mt-1">點擊「+ 新增規則」開始</p>
            </div>
            
            <div class="space-y-6">
              <RuleCard 
                v-for="rule in currentRules"
                :key="rule.id"
                :rule="rule"
                @update="updateRule"
                @delete="deleteRule"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加網站對話框 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="hideAddWebsiteModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" @click.stop>
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">添加新網站</h3>
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors" 
            @click="hideAddWebsiteModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            網站網址或域名：
          </label>
          <input 
            type="text" 
            v-model="newWebsiteUrl"
            @keyup.enter="confirmAddWebsite"
            placeholder="例如：example.com 或 https://example.com" 
            class="input"
            ref="websiteUrlInput"
          >
          <p class="text-sm text-gray-500 mt-2">
            只需輸入域名部分，例如：google.com、github.com
          </p>
        </div>
        
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button class="btn btn-secondary" @click="hideAddWebsiteModal">取消</button>
          <button class="btn btn-primary" @click="confirmAddWebsite">添加</button>
        </div>
      </div>
    </div>

    <!-- 通知 -->
    <Notification 
      v-if="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="hideNotification"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import RuleCard from './components/RuleCard.vue'
import Notification from './components/Notification.vue'
import './style.css'

export default {
  name: 'OptionsApp',
  components: {
    RuleCard,
    Notification
  },
  setup() {
    const globalEnabled = ref(true)
    const websites = ref([])
    const currentWebsite = ref('')
    const currentRules = ref([])
    const searchQuery = ref('')
    const showModal = ref(false)
    const newWebsiteUrl = ref('')
    const websiteUrlInput = ref(null)
    const notification = ref({ show: false, message: '', type: 'success' })

    const filteredWebsites = computed(() => {
      if (!searchQuery.value) return websites.value
      return websites.value.filter(website =>
        website.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const createDefaultExample = async () => {
      const exampleSite = 'ilearn.fcu.edu.tw'
      const exampleRule = {
        id: `rule_example_${Date.now()}`,
        name: 'iLearn 深色主題',
        description: '為逢甲大學iLearn平台應用深色主題樣式，提供更舒適的學習體驗',
        css: `/* 定義 CSS 變數 */
:root {
  --bg-dark: #1a1a1e;
  --bg-darker: #121212;
  --bg-container: #2a2a2c;
  --text-light: #efeff0;
  --text-highlight: #e50015;
  --text-navbar: #121214;
}

/* 在此輸入您的CSS */
#page {
  background: var(--bg-darker) !important;
}

.page-header-headings > h1 {
  color: var(--text-light) !important;
}

.navbar {
  background-color: var(--bg-dark) !important;
}

#page-navbar {
  color: var(--text-navbar);
}

.main-inner {
  background-color: var(--bg-dark) !important;
}

#region-main > div[role="main"] {
  background-color: var(--bg-dark) !important;
}

#block-region-content > section {
  background-color: var(--bg-dark) !important;
}

.card-title {
  color: var(--text-light);
}

input[role="searchbox"] {
  background-color: var(--bg-dark);
}

.course-info-container {
  background-color: var(--bg-container);
}

.align-items-start {
  background-color: var(--bg-container);
  border-radius: 0 0 8px 8px;
}

.align-items-start .card-footer {
  background-color: var(--bg-container) !important;
}

.progress {
  background-color: var(--bg-darker);
}

.card-footer p {
  color: var(--text-light) !important;
}

.multiline {
  color: var(--text-highlight);
}

a[role="menuitem"] {
  color: var(--text-light) !important;
}

a[role="menuitem"]:hover {
  background-color: var(--bg-container) !important;
}

.dropdown-menu {
  background-color: var(--bg-container) !important;
}

i[title="切換通知選單"] {
  color: var(--text-light) !important;
}

i[title="切換訊息選單"] {
  color: var(--text-light) !important;
}

.sectionname {
  color: var(--text-light) !important;
}`,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 檢查是否已存在範例
      const result = await chrome.storage.local.get([exampleSite])
      if (!result[exampleSite] || result[exampleSite].length === 0) {
        // 建立範例網站和規則
        await chrome.storage.local.set({
          [exampleSite]: [exampleRule]
        })
        console.log('已建立 iLearn 深色主題範例')
      }
    }

    const loadData = async () => {
      try {
        // 建立預設範例（如果不存在）
        await createDefaultExample()

        // 載入全域設定
        const globalResult = await chrome.storage.local.get(['globalEnabled'])
        globalEnabled.value = globalResult.globalEnabled !== false

        // 載入所有網站數據
        const allData = await chrome.storage.local.get()
        websites.value = Object.keys(allData).filter(key =>
          key !== 'globalEnabled' &&
          typeof allData[key] === 'object' &&
          (Array.isArray(allData[key]) || Object.keys(allData[key]).length > 0)
        )

        // 載入所有網站的規則數量
        await loadWebsiteRulesCounts()
      } catch (error) {
        console.error('載入數據失敗:', error)
      }
    }

    const toggleGlobal = async () => {
      try {
        await chrome.storage.local.set({ globalEnabled: globalEnabled.value })
        showNotification('全域設定已更新')
      } catch (error) {
        console.error('更新全域設定失敗:', error)
        showNotification('更新失敗', 'error')
      }
    }

    const selectWebsite = async (hostname) => {
      currentWebsite.value = hostname

      try {
        const result = await chrome.storage.local.get([hostname])
        const siteData = result[hostname]

        if (Array.isArray(siteData)) {
          currentRules.value = siteData
        } else if (siteData && typeof siteData === 'object') {
          currentRules.value = Object.values(siteData)
        } else {
          currentRules.value = []
        }
      } catch (error) {
        console.error('載入網站規則失敗:', error)
        currentRules.value = []
      }
    }

    const websiteRulesCounts = ref(new Map())

    const getWebsiteRulesCount = (website) => {
      return websiteRulesCounts.value.get(website) || 0
    }

    const updateWebsiteRulesCount = async (website) => {
      try {
        const result = await chrome.storage.local.get([website])
        const siteData = result[website]
        let count = 0
        
        if (Array.isArray(siteData)) {
          count = siteData.length
        } else if (siteData && typeof siteData === 'object') {
          count = Object.keys(siteData).length
        }
        
        websiteRulesCounts.value.set(website, count)
      } catch (error) {
        console.error('更新規則數量失敗:', error)
      }
    }

    const loadWebsiteRulesCounts = async () => {
      for (const website of websites.value) {
        await updateWebsiteRulesCount(website)
      }
    }

    const filterWebsites = () => {
      // 過濾邏輯已在 computed 中處理
    }

    const showAddWebsiteModal = async () => {
      showModal.value = true
      newWebsiteUrl.value = ''
      await nextTick()
      if (websiteUrlInput.value) {
        websiteUrlInput.value.focus()
      }
    }

    const hideAddWebsiteModal = () => {
      showModal.value = false
      newWebsiteUrl.value = ''
    }

    const confirmAddWebsite = async () => {
      const url = newWebsiteUrl.value.trim()
      if (!url) {
        showNotification('請輸入網站網址', 'error')
        return
      }

      const hostname = extractHostname(url)
      if (!hostname) {
        showNotification('無效的網址格式', 'error')
        return
      }

      if (websites.value.includes(hostname)) {
        showNotification('該網站已存在', 'error')
        return
      }

      try {
        await chrome.storage.local.set({ [hostname]: [] })
        websites.value.push(hostname)
        websiteRulesCounts.value.set(hostname, 0) // 設置新網站的規則數量為0
        hideAddWebsiteModal()
        selectWebsite(hostname)
        showNotification('網站添加成功')
      } catch (error) {
        console.error('添加網站失敗:', error)
        showNotification('添加失敗', 'error')
      }
    }

    const extractHostname = (url) => {
      try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'http://' + url
        }
        const urlObj = new URL(url)
        return urlObj.hostname
      } catch {
        const match = url.match(/^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/)
        return match ? url : null
      }
    }

    const deleteWebsite = async (website) => {
      if (!confirm(`確定要刪除網站 "${website}" 及其所有規則嗎？`)) return

      try {
        await chrome.storage.local.remove([website])
        websites.value = websites.value.filter(w => w !== website)
        websiteRulesCounts.value.delete(website) // 移除規則數量記錄

        if (currentWebsite.value === website) {
          currentWebsite.value = ''
          currentRules.value = []
        }

        showNotification('網站已刪除')
      } catch (error) {
        console.error('刪除網站失敗:', error)
        showNotification('刪除失敗', 'error')
      }
    }

    const addNewRule = async () => {
      const newRule = {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: '新 CSS 規則',
        description: '',
        css: '/* 在此輸入您的CSS */\n.example {\n  color: #333;\n  background: white;\n}',
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      currentRules.value.push(newRule)
      
      // 立即儲存新規則並更新計數
      await saveAllRules()
    }

    const updateRule = async (updatedRule) => {
      const index = currentRules.value.findIndex(rule => rule.id === updatedRule.id)
      if (index !== -1) {
        updatedRule.updatedAt = new Date().toISOString()
        currentRules.value[index] = updatedRule
        
        // 自動保存更新的規則
        await saveAllRules()
      }
    }

    const deleteRule = async (ruleId) => {
      if (!confirm('確定要刪除此規則嗎？')) return

      currentRules.value = currentRules.value.filter(rule => rule.id !== ruleId)
      await saveAllRules()
      
      // 更新當前網站的規則數量
      if (currentWebsite.value) {
        await updateWebsiteRulesCount(currentWebsite.value)
      }
    }

    const saveAllRules = async () => {
      if (!currentWebsite.value) return

      try {
        await chrome.storage.local.set({
          [currentWebsite.value]: currentRules.value
        })
        
        // 更新當前網站的規則數量
        await updateWebsiteRulesCount(currentWebsite.value)
        
        showNotification('規則已儲存')
      } catch (error) {
        console.error('儲存規則失敗:', error)
        showNotification('儲存失敗', 'error')
      }
    }

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type }
      setTimeout(() => {
        notification.value.show = false
      }, 3000)
    }

    const hideNotification = () => {
      notification.value.show = false
    }

    onMounted(() => {
      loadData()
    })

    return {
      globalEnabled,
      websites,
      currentWebsite,
      currentRules,
      searchQuery,
      filteredWebsites,
      showModal,
      newWebsiteUrl,
      websiteUrlInput,
      notification,
      websiteRulesCounts,
      toggleGlobal,
      selectWebsite,
      getWebsiteRulesCount,
      updateWebsiteRulesCount,
      loadWebsiteRulesCounts,
      filterWebsites,
      showAddWebsiteModal,
      hideAddWebsiteModal,
      confirmAddWebsite,
      deleteWebsite,
      addNewRule,
      updateRule,
      deleteRule,
      saveAllRules,
      hideNotification
    }
  }
}
</script>
