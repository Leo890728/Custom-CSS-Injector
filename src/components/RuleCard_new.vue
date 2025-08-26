<template>
  <div :class="['w-full max-w-none card-shadow rounded-lg overflow-hidden', isDarkTheme ? 'bg-slate-800 text-slate-200 shadow-slate-900/20' : 'bg-white text-gray-900 shadow-gray-200']">
    <!-- 卡片標題 -->
    <div :class="['px-4 py-3 border-b flex items-center justify-between', isDarkTheme ? 'bg-slate-750 border-slate-700' : 'bg-gray-50 border-gray-200']">
      <div class="flex items-center space-x-4">
        <input 
          v-model="localRule.name" 
          @input="handleImmediateUpdate"
          :class="['text-lg font-semibold bg-transparent border-none outline-none px-2 py-1 rounded', isDarkTheme ? 'text-slate-200 hover:bg-slate-700 focus:bg-slate-700' : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100']"
          placeholder="規則名稱"
        />
        
        <div class="flex items-center">
          <label :class="['flex items-center cursor-pointer', isDarkTheme ? 'text-slate-300' : 'text-gray-600']">
            <input 
              type="checkbox" 
              v-model="localRule.enabled" 
              @change="handleImmediateUpdate"
              class="sr-only"
            />
            <div :class="['toggle-switch', localRule.enabled ? 'toggle-enabled' : '']">
              <span class="toggle-thumb"></span>
            </div>
          </label>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button @click="handleDelete" :class="['p-2 rounded-full hover:bg-opacity-20', isDarkTheme ? 'text-slate-400 hover:text-red-400 hover:bg-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-red-500']">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- URL 輸入區域 -->
    <div :class="['px-4 py-3 border-b', isDarkTheme ? 'border-slate-700' : 'border-gray-200']">
      <label :class="['block text-sm font-medium mb-2', isDarkTheme ? 'text-slate-300' : 'text-gray-700']">網址模式：</label>
      <input 
        v-model="localRule.url" 
        @input="handleInputChange"
        :class="['w-full px-3 py-2 border rounded-lg', isDarkTheme ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500']"
        placeholder="https://example.com/*"
      />
    </div>
    
    <!-- CSS 編輯區域 -->
    <div :class="['p-4', isDarkTheme ? 'bg-slate-800' : 'bg-white']">
      <label :class="['block text-sm font-medium mb-3', isDarkTheme ? 'text-slate-300' : 'text-gray-700']">CSS 樣式：</label>
      
      <!-- 程式碼編輯器容器 -->
      <div :class="['relative border rounded-lg overflow-hidden', isDarkTheme ? 'border-slate-600 bg-slate-900' : 'border-gray-300 bg-slate-50']">
        
        <!-- 標題列 -->
        <div :class="['flex items-center justify-between px-4 py-2 border-b', isDarkTheme ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200']">
          <div class="flex items-center space-x-2">
            <div class="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            <div class="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
            <div class="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
            <span class="ml-3 font-medium">CSS</span>
          </div>
          <span class="opacity-70">{{ lineCount }} 行</span>
        </div>
        
        <!-- 程式碼編輯器 -->
        <div class="relative" :style="{ minHeight: Math.max(lineCount * 24 + 32, 200) + 'px' }">
          
          <!-- 行號 -->
          <div v-if="showLineNumbers" :class="['absolute top-0 left-0 w-12 py-4 text-sm font-mono leading-6 text-right border-r pointer-events-none z-20 select-none', isDarkTheme ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-300']" style="padding-right: 0.75rem;">
            <div v-for="n in lineCount" :key="n" class="leading-6 h-6">{{ n }}</div>
          </div>
          
          <!-- 程式碼高亮顯示層 -->
          <pre 
            ref="highlightLayer"
            :class="['absolute top-0 left-0 w-full py-4 m-0 text-sm font-mono leading-6 whitespace-pre-wrap pointer-events-none z-10 overflow-hidden', isDarkTheme ? 'text-slate-200' : 'text-slate-700', showLineNumbers ? 'pl-16 pr-4' : 'px-4']"
          ><code class="language-css" v-html="highlightedCSS"></code></pre>
          
          <!-- 實際輸入框 -->
          <textarea
            ref="codeInput"
            v-model="localRule.css"
            :class="['relative z-30 w-full bg-transparent text-transparent resize-none border-0 outline-0 py-4 text-sm font-mono leading-6 whitespace-pre-wrap', isDarkTheme ? 'caret-slate-300' : 'caret-slate-700', showLineNumbers ? 'pl-16 pr-4' : 'px-4']"
            :style="{ minHeight: Math.max(lineCount * 24 + 32, 200) + 'px' }"
            @input="handleInputChange"
            @scroll="handleScroll"
            @keydown="handleKeyDown"
            placeholder="/* 輸入您的 CSS 程式碼 */
.my-element {
  color: #333;
  background: white;
  padding: 1rem;
  border-radius: 8px;
}"
            spellcheck="false"
          ></textarea>
        </div>
        
        <!-- 工具列 -->
        <div :class="['flex items-center justify-between px-4 py-2 text-xs border-t', isDarkTheme ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200']">
          <div class="flex items-center space-x-4">
            <button @click="toggleLineNumbers" :class="['hover:opacity-70 transition-opacity', showLineNumbers ? 'font-medium' : '']">
              行號
            </button>
            <button @click="formatCode" class="hover:opacity-70 transition-opacity">
              格式化
            </button>
            <button @click="toggleTheme" class="hover:opacity-70 transition-opacity">
              {{ isDarkTheme ? '淺色' : '深色' }}
            </button>
          </div>
          <div>
            {{ localRule.css ? localRule.css.length : 0 }} 字符
          </div>
        </div>
      </div>
    </div>
    
    <div :class="['px-4 py-3 border-t rounded-b-lg', isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200']">
      <div :class="['text-xs', isDarkTheme ? 'text-slate-400' : 'text-gray-500']">
        建立：{{ formatDate(localRule.createdAt) }} | 
        更新：{{ formatDate(localRule.updatedAt) }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-css'

export default {
  name: 'RuleCard',
  props: {
    rule: {
      type: Object,
      required: true
    }
  },
  emits: ['update', 'delete'],
  setup(props, { emit }) {
    const localRule = ref({ ...props.rule })
    const showLineNumbers = ref(true)
    const isDarkTheme = ref(false)
    const debounceTimer = ref(null)
    
    // DOM references
    const codeInput = ref(null)
    const highlightLayer = ref(null)

    // 計算行數
    const lineCount = computed(() => {
      return localRule.value.css ? Math.max(localRule.value.css.split('\n').length, 1) : 1
    })

    // 語法高亮
    const highlightedCSS = computed(() => {
      if (!localRule.value.css) return ''
      
      try {
        if (Prism && Prism.languages && Prism.languages.css) {
          return Prism.highlight(localRule.value.css, Prism.languages.css, 'css')
        }
        return escapeHtml(localRule.value.css)
      } catch (error) {
        console.warn('語法高亮失敗:', error)
        return escapeHtml(localRule.value.css)
      }
    })

    // HTML 轉義
    const escapeHtml = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    }

    // 監聽 props 變化
    watch(() => props.rule, (newRule) => {
      localRule.value = { ...newRule }
    }, { deep: true })

    // 初始化
    onMounted(() => {
      if (highlightLayer.value && Prism) {
        nextTick(() => {
          Prism.highlightAllUnder(highlightLayer.value)
        })
      }
    })

    // 防抖動更新
    const handleInputChange = () => {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
      
      debounceTimer.value = setTimeout(() => {
        emit('update', { ...localRule.value })
      }, 500)
      
      // 立即更新語法高亮
      nextTick(() => {
        if (highlightLayer.value && Prism) {
          Prism.highlightAllUnder(highlightLayer.value)
        }
      })
    }

    // 立即更新（用於按鈕操作）
    const handleImmediateUpdate = () => {
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
        debounceTimer.value = null
      }
      emit('update', { ...localRule.value })
    }

    // 刪除規則
    const handleDelete = () => {
      emit('delete', localRule.value.id)
    }

    // 切換行號顯示
    const toggleLineNumbers = () => {
      showLineNumbers.value = !showLineNumbers.value
    }

    // 切換主題
    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value
    }

    // 格式化程式碼
    const formatCode = () => {
      // 簡單的 CSS 格式化
      const css = localRule.value.css
      if (css) {
        const formatted = css
          .replace(/\s*{\s*/g, ' {\n  ')
          .replace(/;\s*/g, ';\n  ')
          .replace(/\s*}\s*/g, '\n}\n\n')
          .replace(/,\s*/g, ',\n')
          .replace(/\n\s*\n/g, '\n')
          .trim()
        
        localRule.value.css = formatted
        handleImmediateUpdate()
      }
    }

    // 滾動同步
    const handleScroll = (event) => {
      if (highlightLayer.value) {
        highlightLayer.value.scrollTop = event.target.scrollTop
        highlightLayer.value.scrollLeft = event.target.scrollLeft
      }
    }

    // Tab 鍵處理
    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        const target = event.target
        const start = target.selectionStart
        const end = target.selectionEnd

        // 插入 Tab
        const value = target.value
        target.value = value.substring(0, start) + '  ' + value.substring(end)
        
        // 重新設定游標位置
        target.selectionStart = target.selectionEnd = start + 2
        
        // 觸發更新
        handleInputChange()
      }
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '無'
      return new Date(date).toLocaleString('zh-TW')
    }

    return {
      localRule,
      showLineNumbers,
      codeInput,
      highlightLayer,
      lineCount,
      highlightedCSS,
      isDarkTheme,
      handleInputChange,
      handleImmediateUpdate,
      handleDelete,
      toggleLineNumbers,
      toggleTheme,
      formatCode,
      handleScroll,
      handleKeyDown,
      formatDate
    }
  }
}
</script>
