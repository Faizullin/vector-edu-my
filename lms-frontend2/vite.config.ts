import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import { defineConfig } from 'vite';

const configOuput = config().parsed!;

const getProxyUrlsDict = () => {
  const urls = ['/api', '/admin', '/lms/auth', '/static', '/protected'];
  const data: any = {};
  urls.forEach((url) => {
    data[url] = {
      target: 'http://127.0.0.1:8000', // Django server
      changeOrigin: true,
      secure: false
    };
  });
  return data;
};

const serverConfig: any = {
  port: 3000,
}
if (configOuput.VITE_APP_USE_BACKEND_PROXY) {
  serverConfig.proxy = getProxyUrlsDict();
}



// https://vite.dev/config/
export default defineConfig({
  // base: '/static/', // Only for production
  build: {
    outDir: 'dist', // keeps index.html at root of dist/
    assetsDir: 'static/assets', // put assets under /static/assets
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // django lcoalhsot:8000 proxy
  server: serverConfig,
  plugins: [react(), TanStackRouterVite()],
})
