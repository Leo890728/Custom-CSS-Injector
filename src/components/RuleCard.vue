<template>
  <div class="card border border-gray-200 rounded-lg shadow-sm">
    <div class="p-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <input 
          type="text" 
          class="flex-1 text-lg font-semibold text-gray-800 bg-transparent border-none outline-none mr-4 focus:bg-gray-50 focus:px-2 focus:py-1 focus:rounded" 
          v-model="localRule.name"
          @input="handleUpdate"
          placeholder="規則名稱"
        >
        <div class="flex items-center space-x-3">
          <label class="flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="localRule.enabled"
              @change="handleUpdate"
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
    
    <div class="px-4 py-3 border-b border-gray-100">
      <input 
        type="text" 
        class="input"
        v-model="localRule.description"
        @input="handleUpdate"
        placeholder="規則描述（可選）"
      >
    </div>
    
    <div class="p-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">CSS ：</label>
      <textarea 
        class="w-full border border-gray-300 rounded-md p-3 font-mono text-sm leading-relaxed resize-vertical min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        v-model="localRule.css"
        @input="handleUpdate"
        placeholder="/* 在此輸入您的CSS */"
      ></textarea>
    </div>
    
    <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
      <div class="text-xs text-gray-500">
        建立：{{ formatDate(localRule.createdAt) }} | 
        更新：{{ formatDate(localRule.updatedAt) }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

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

    watch(() => props.rule, (newRule) => {
      localRule.value = { ...newRule }
    }, { deep: true })

    const handleUpdate = () => {
      emit('update', { ...localRule.value })
    }

    const handleDelete = () => {
      emit('delete', localRule.value.id)
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
      handleUpdate,
      handleDelete,
      formatDate
    }
  }
}
</script>
