import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允許外部訪問
    port: 5173,      // 明確指定端口
    strictPort: true, // 如果端口被占用則失敗
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '163.13.202.125',
      'gai-bot.com',
      'www.gai-bot.com'
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 定義 @ 別名指向 src 資料夾
    },
  },
  build: {
    target: 'es2020', // 將編譯目標設定為 ES2020，以解決 import.meta 警告
  },
});

