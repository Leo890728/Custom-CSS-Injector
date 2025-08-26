import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 複製 background.js 和 content.js 到 dist
const copyFiles = () => {
  const files = ['background.js', 'content.js']
  const distDir = path.join(__dirname, 'dist')
  
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir)
  }

  files.forEach(file => {
    const srcPath = path.join(__dirname, file)
    const destPath = path.join(distDir, file)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
      console.log(`Copied ${file} to dist/`)
    }
  })

  // 複製生產環境的 manifest.json
  const manifestPath = path.join(__dirname, 'manifest.json')
  const distManifestPath = path.join(distDir, 'manifest.json')
  fs.copyFileSync(manifestPath, distManifestPath)
  console.log('Copied manifest.json to dist/')
}

copyFiles()
