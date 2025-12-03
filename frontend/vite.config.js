// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 👇 GitHub Pages에서 /CloudYCC/ 경로 아래에 뜨도록 설정
  base: '/CloudYCC/',
});
