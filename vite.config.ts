import { defineConfig, Plugin } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

const BUILD_TIME_ZONE = 'Europe/Berlin';

/*
  Stamps the build time into index.html, so one can tell from a deployed page when it was built.
  The time zone is pinned, because CI runners build in UTC.
*/
const buildTimestamp = (): Plugin => ({
  name: 'build-timestamp',
  apply: 'build',
  transformIndexHtml() {
    const builtAt = new Date();

    const readable = new Intl.DateTimeFormat('de-DE', {
      timeZone: BUILD_TIME_ZONE,
      dateStyle: 'medium',
      timeStyle: 'long',
    }).format(builtAt);

    return [
      {
        tag: 'meta',
        attrs: { name: 'build-date', content: builtAt.toISOString() },
        injectTo: 'head',
      },
      {
        tag: 'meta',
        attrs: { name: 'build-date-local', content: readable },
        injectTo: 'head',
      },
    ];
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), buildTimestamp()],
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
