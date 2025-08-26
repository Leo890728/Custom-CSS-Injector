<template>
  <div class="w-80 min-h-96 bg-white font-sans">
    <!-- 標題列 -->
    <div class="bg-blue-600 text-white p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-lg font-semibold">CSS 注入器</h1>
        <div class="flex items-center space-x-2">
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
          <span class="text-sm">啟用注入器</span>
        </div>
      </div>
    </div>

    <!-- 目前網站資訊 -->
    <div class="bg-blue-50 border-b border-blue-100 p-4">
      <div class="flex justify-between items-center">
        <div>
          <div class="font-medium text-gray-800 text-sm">{{ siteName }}</div>
          <div class="text-blue-600 text-xs mt-1">{{ ruleCount }} 條規則</div>
        </div>
        <div class="w-2 h-2 rounded-full" :class="globalEnabled ? 'bg-green-400' : 'bg-gray-400'"></div>
      </div>
    </div>

    <!-- 規則列表 -->
    <div class="p-4">
      <div class="flex justify-between items-center mb-3">
        <span class="font-medium text-gray-700">規則列表</span>
        <button 
          class="btn btn-primary btn-sm"
          @click="addRule"
        >
          + 添加
        </button>
      </div>
      
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-if="rules.length === 0" class="text-center py-8">
          <div class="text-gray-400 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
            </svg>
          </div>
          <p class="text-gray-500 text-sm">此網站尚無 CSS 規則</p>
          <p class="text-gray-400 text-xs mt-1">點擊「+ 添加」創建新規則</p>
        </div>
        
        <div v-for="rule in rules" :key="rule.id" class="card p-3">
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <div class="font-medium text-gray-800 text-sm">{{ rule.name }}</div>
              <div class="text-gray-500 text-xs mt-1" v-if="rule.description">{{ rule.description }}</div>
            </div>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                v-model="rule.enabled" 
                @change="updateRule(rule)"
                class="sr-only"
              >
              <div :class="['toggle', rule.enabled ? 'active' : '']">
                <span class="toggle-thumb"></span>
              </div>
              <span class="text-xs text-gray-600">{{ rule.enabled ? '啟用' : '停用' }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按鈕 -->
    <div class="border-t border-gray-200 p-4">
      <div class="flex space-x-2">
        <button 
          class="btn btn-secondary flex-1"
          @click="openSettings"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          設定
        </button>
        <button 
          class="btn btn-primary flex-1"
          @click="refreshPage"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          重新載入
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import './style.css'

export default {
  name: 'PopupApp',
  setup() {
    const globalEnabled = ref(true)
    const siteName = ref('載入中...')
    const rules = ref([])

    const ruleCount = computed(() => rules.value.length)

    const loadData = async () => {
      try {
        // 載入全域設定
        const globalResult = await chrome.storage.local.get(['globalEnabled'])
        globalEnabled.value = globalResult.globalEnabled !== false

        // 取得當前網站
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        const hostname = new URL(tab.url).hostname
        siteName.value = hostname

        // 載入網站規則
        const siteResult = await chrome.storage.local.get([hostname])
        const siteData = siteResult[hostname]

        if (Array.isArray(siteData)) {
          rules.value = siteData
        } else if (siteData && typeof siteData === 'object') {
          rules.value = Object.values(siteData)
        } else {
          rules.value = []
        }
      } catch (error) {
        console.error('載入數據失敗:', error)
      }
    }

    const toggleGlobal = async () => {
      try {
        await chrome.storage.local.set({ globalEnabled: globalEnabled.value })
        
        // 通知當前分頁的 content script 更新全域狀態
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateGlobalState',
            globalEnabled: globalEnabled.value
          }).catch(() => {
            // 忽略錯誤，可能是特殊頁面無法注入 content script
          })
        }
      } catch (error) {
        console.error('更新全域設定失敗:', error)
      }
    }

    const addRule = () => {
      // 開啟設定頁面並聚焦到當前網站
      chrome.runtime.openOptionsPage()
    }

    const updateRule = async (rule) => {
      try {
        rule.updatedAt = new Date().toISOString()
        const hostname = siteName.value
        await chrome.storage.local.set({ [hostname]: rules.value })
        
        // 通知當前分頁的 content script 更新特定規則
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'toggleRule',
            ruleId: rule.id,
            enabled: rule.enabled,
            css: rule.css
          }).catch(() => {
            // 忽略錯誤，可能是特殊頁面無法注入 content script
          })
        }
      } catch (error) {
        console.error('更新規則失敗:', error)
      }
    }

    const openSettings = () => {
      chrome.runtime.openOptionsPage()
    }

    const refreshPage = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        await chrome.tabs.reload(tab.id)
        window.close()
      } catch (error) {
        console.error('重新載入失敗:', error)
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      globalEnabled,
      siteName,
      rules,
      ruleCount,
      toggleGlobal,
      addRule,
      updateRule,
      openSettings,
      refreshPage
    }
  }
}
</script>
