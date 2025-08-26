<template>
  <div :class="['card border rounded-lg shadow-sm', isDarkTheme ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white']">
    <div :class="['p-4 border-b', isDarkTheme ? 'border-slate-700' : 'border-gray-200']">
      <div class="flex justify-between items-center">
        <input 
          type="text" 
          :class="['flex-1 text-lg font-semibold bg-transparent border-none outline-none mr-4 focus:px-2 focus:py-1 focus:rounded', isDarkTheme ? 'text-slate-200 focus:bg-slate-800' : 'text-gray-800 focus:bg-gray-50']" 
          v-model="localRule.name"
          @input="handleUpdate"
          placeholder="規則名稱"
        >
        <div class="flex items-center space-x-3">
          <label class="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="localRule.enabled"
              @change="handleImmediateUpdate"
              class="sr-only"
            >
            <div :class="['toggle', localRule.enabled ? 'active' : '']">
              <span class="toggle-thumb"></span>
            </div>
          </label>
          <button 
            class="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors" 
            @click="handleDelete" 
            title="刪除規則"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div :class="['px-4 py-3 border-b', isDarkTheme ? 'border-slate-700' : 'border-gray-100']">
      <input 
        type="text" 
        :class="['input w-full px-3 py-2 text-sm border rounded-lg transition-colors outline-none', isDarkTheme ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500']"
        v-model="localRule.description"
        @input="handleUpdate"
        placeholder="規則描述（可選）"
      >
    </div>
    
    <div class="p-4">
      <label :class="['block text-sm font-medium mb-3', isDarkTheme ? 'text-slate-300' : 'text-gray-700']">CSS 樣式：</label>
      <div :class="['relative rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white', isDarkTheme ? 'dark' : '']">
        <!-- 程式碼區塊標題 -->
        <div :class="['relative z-40 px-4 py-2 text-xs font-medium rounded-t-lg border-b flex items-center justify-between', isDarkTheme ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200']">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="ml-4">CSS</span>
          </div>
          <div class="text-xs opacity-75">
            {{ localRule.css ? localRule.css.split('\n').length : 0 }} 行
          </div>
        </div>
        
        <!-- 編輯器容器 -->
        <div :class="['relative border rounded-lg transition-all duration-200', isDarkTheme ? 'bg-slate-900 border-slate-700 focus-within:border-blue-400 focus-within:shadow-[0_0_0_2px_rgb(96_165_250)]' : 'bg-white border-slate-200 focus-within:border-blue-500 focus-within:shadow-[0_0_0_2px_rgb(59_130_246)]']">
          <!-- 行號 -->
          <div v-if="showLineNumbers" :class="['absolute left-0 top-0 bottom-0 p-4 pb-0 text-sm font-mono leading-relaxed pointer-events-none select-none border-r min-w-12 text-right z-30 overflow-hidden rounded-l-lg', isDarkTheme ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200']">
            <div v-for="n in lineCount" :key="n" class="h-[22px] flex items-start">{{ n }}</div>
          </div>
          
          <!-- 語法突顯背景層 -->
          <pre 
            ref="highlightedCode"
            :class="['absolute inset-0 p-4 m-0 pointer-events-none overflow-hidden z-10 font-mono text-sm leading-relaxed whitespace-pre', isDarkTheme ? 'bg-slate-900' : 'bg-transparent', showLineNumbers ? 'pl-16' : '']"
          ><code class="language-css" v-html="highlightedCSS"></code></pre>
          
          <!-- 透明的編輯器 -->
          <textarea 
            :class="['relative z-20 w-full bg-transparent text-transparent font-mono text-sm leading-relaxed border-0 rounded-none p-4 resize-y min-h-36 outline-none tab-2 whitespace-pre overflow-wrap-break-word', isDarkTheme ? 'caret-slate-300' : 'caret-slate-700', showLineNumbers ? 'pl-16' : '']"
            v-model="localRule.css"
            @input="handleUpdate"
            @scroll="handleScroll"
            @keydown="handleKeyDown"
            placeholder="/* 在此輸入您的 CSS 樣式 */
.example {
  color: #333333;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .example {
    padding: 12px;
  }
}"
            ref="cssTextarea"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          ></textarea>
        </div>
        
        <!-- 底部工具欄 -->
        <div :class="['px-4 py-2 text-xs flex justify-between items-center rounded-b-lg border-t', isDarkTheme ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200']">
          <div class="flex items-center space-x-4">
            <button 
              @click="toggleLineNumbers" 
              :class="['transition-colors duration-200', isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700']"
              title="切換行號顯示"
            >
              行號: {{ showLineNumbers ? '開' : '關' }}
            </button>
            <button 
              @click="formatCSS" 
              :class="['transition-colors duration-200', isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700']"
              title="格式化 CSS"
            >
              格式化
            </button>
            <button 
              @click="toggleTheme" 
              :class="['transition-colors duration-200', isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700']"
              title="切換主題"
            >
              {{ isDarkTheme ? '淺色' : '深色' }}
            </button>
          </div>
          <div>
            字符數: {{ localRule.css ? localRule.css.length : 0 }}
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
    const cssTextarea = ref(null)
    const highlightedCode = ref(null)
    const isDarkTheme = ref(false)
    const debounceTimer = ref(null)

    const lineCount = computed(() => {
      return localRule.value.css ? localRule.value.css.split('\n').length : 1
    })

    // 語法突顯的 HTML
    const highlightedCSS = computed(() => {
      if (!localRule.value.css) return ''
      
      try {
        return Prism.highlight(localRule.value.css, Prism.languages.css, 'css')
      } catch (error) {
        console.warn('語法突顯失敗:', error)
        return localRule.value.css
      }
    })

    watch(() => props.rule, (newRule) => {
      localRule.value = { ...newRule }
    }, { deep: true })

    onMounted(() => {
      // 確保 Prism 已經載入
      if (highlightedCode.value) {
        Prism.highlightAllUnder(highlightedCode.value)
      }
    })

    const handleUpdate = () => {
      // 清除之前的計時器
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
      }
      
      // 設置新的計時器，800ms 後執行儲存
      debounceTimer.value = setTimeout(() => {
        emit('update', { ...localRule.value })
        console.log('規則已儲存:', localRule.value.name)
      }, 800)
      
      // 立即更新語法突顯（不需要防抖動）
      nextTick(() => {
        if (highlightedCode.value) {
          Prism.highlightAllUnder(highlightedCode.value)
        }
      })
    }

    const handleImmediateUpdate = () => {
      // 立即儲存，用於非文字輸入的操作
      if (debounceTimer.value) {
        clearTimeout(debounceTimer.value)
        debounceTimer.value = null
      }
      
      emit('update', { ...localRule.value })
      
      // 重新突顯顯示
      nextTick(() => {
        if (highlightedCode.value) {
          Prism.highlightAllUnder(highlightedCode.value)
        }
      })
    }

    const handleDelete = () => {
      emit('delete', localRule.value.id)
    }

    const toggleLineNumbers = () => {
      showLineNumbers.value = !showLineNumbers.value
    }

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value
      // 主題切換邏輯可以在這裡添加
      console.log('主題切換:', isDarkTheme.value ? '深色' : '淺色')
    }

    const formatCSS = () => {
      if (!localRule.value.css) return
      
      // 簡單的 CSS 格式化
      let formatted = localRule.value.css
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/\s*}\s*/g, '\n}\n\n')
        .replace(/,\s*/g, ',\n')
        .trim()
      
      // 移除多餘的空行
      formatted = formatted.replace(/\n\n\n+/g, '\n\n')
      
      localRule.value.css = formatted
      handleImmediateUpdate()
    }

    const handleScroll = (event) => {
      // 同步語法突顯層的滾動
      if (highlightedCode.value) {
        // 使用 transform 來同步滾動位置
        const scrollTop = event.target.scrollTop
        const scrollLeft = event.target.scrollLeft
        highlightedCode.value.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`
      }
      
      // 同步行號的滾動
      const lineNumbersEl = event.target.parentElement.querySelector('.code-line-numbers')
      if (lineNumbersEl) {
        lineNumbersEl.scrollTop = event.target.scrollTop
      }
    }

    const handleKeyDown = (event) => {
      // 處理 Tab 鍵
      if (event.key === 'Tab') {
        event.preventDefault()
        
        const textarea = event.target
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        
        if (event.shiftKey) {
          // Shift + Tab：移除縮排
          const lines = localRule.value.css.split('\n')
          const startLine = localRule.value.css.substring(0, start).split('\n').length - 1
          const endLine = localRule.value.css.substring(0, end).split('\n').length - 1
          
          let newText = ''
          let offsetStart = 0
          let offsetEnd = 0
          
          for (let i = 0; i < lines.length; i++) {
            if (i >= startLine && i <= endLine) {
              if (lines[i].startsWith('  ')) {
                lines[i] = lines[i].substring(2)
                if (i === startLine) offsetStart = -2
                if (i === endLine) offsetEnd = -2
              }
            }
          }
          
          newText = lines.join('\n')
          localRule.value.css = newText
          
          // 恢復選取範圍
          nextTick(() => {
            textarea.selectionStart = Math.max(0, start + offsetStart)
            textarea.selectionEnd = Math.max(0, end + offsetEnd)
          })
        } else {
          // Tab：添加縮排
          if (start === end) {
            // 沒有選取文字，插入兩個空格
            const newText = localRule.value.css.substring(0, start) + '  ' + localRule.value.css.substring(end)
            localRule.value.css = newText
            
            // 移動游標位置
            nextTick(() => {
              textarea.selectionStart = textarea.selectionEnd = start + 2
            })
          } else {
            // 有選取文字，對選取的行添加縮排
            const lines = localRule.value.css.split('\n')
            const startLine = localRule.value.css.substring(0, start).split('\n').length - 1
            const endLine = localRule.value.css.substring(0, end).split('\n').length - 1
            
            for (let i = startLine; i <= endLine; i++) {
              lines[i] = '  ' + lines[i]
            }
            
            const newText = lines.join('\n')
            localRule.value.css = newText
            
            // 調整選取範圍
            nextTick(() => {
              textarea.selectionStart = start + 2
              textarea.selectionEnd = end + 2 * (endLine - startLine + 1)
            })
          }
        }
        
        handleImmediateUpdate()
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '未知'

      try {
        const date = new Date(dateString)
        return date.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch {
        return '未知'
      }
    }

    return {
      localRule,
      showLineNumbers,
      cssTextarea,
      highlightedCode,
      lineCount,
      highlightedCSS,
      isDarkTheme,
      handleUpdate,
      handleImmediateUpdate,
      handleDelete,
      toggleLineNumbers,
      toggleTheme,
      formatCSS,
      handleScroll,
      handleKeyDown,
      formatDate
    }
  }
}
</script>
