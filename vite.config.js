import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  // 确保静态资源正确复制
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 保持资源文件结构
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
