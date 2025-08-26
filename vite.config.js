import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup/popup.html'),
        options: resolve(__dirname, 'options/options.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.html')) {
            return '[name].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
