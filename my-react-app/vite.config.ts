import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],



  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 定義 @ 別名指向 src 資料夾
    },
  },
  build: {
    target: 'es2020', // 將編譯目標設定為 ES2020，以解決 import.meta 警告
  },
});

