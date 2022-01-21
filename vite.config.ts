import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  css: {
    preprocessorOptions: {
      scss: {
        charset: false,
      },
    },
  },
  server: {
    port: 8080
  }
});
