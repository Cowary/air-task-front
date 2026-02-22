import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Базовый путь для приложения
  // '/' - для корня домена
  // Если приложение будет размещено в подпапке, измените на '/ваша-папка/'
  base: '/',

  // Настройки сервера разработки
  server: {
    // Порт, на котором запускается dev-сервер
    port: 5173,

    // Проксирование API-запросов к backend-серверу
    // Это позволяет избежать проблем с CORS при разработке
    proxy: {
      // Все запросы к /api будут перенаправляться на backend
      '/api': {
        // Адрес backend-сервера
        target: 'http://localhost:8090',
        // Не изменять заголовок Origin
        changeOrigin: true,
      }
    }
  },

  // Настройки для production-сборки
  build: {
    // Папка для скомпилированных файлов
    outDir: 'dist',
    // Очищать папку перед сборкой
    emptyOutDir: true,
  }
})
