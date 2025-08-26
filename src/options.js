import { createApp } from 'vue'
import OptionsApp from './OptionsApp.vue'

// 引入 Prism.js 核心和主題
import 'prismjs'
import 'prismjs/themes/prism.css' // 基本主題
import 'prismjs/components/prism-css' // CSS 語法支持

createApp(OptionsApp).mount('#app')
