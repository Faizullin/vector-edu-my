import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

import path from 'path';

const resolvePath = (str) => path.resolve(__dirname, str);

const getProxyUrlsDict = () => {
  const urls = ['/api', '/admin', '/lms/auth', '/static', '/protected'];
  const data = {};
  urls.forEach((url) => {
    data[url] = {
      target: 'http://127.0.0.1:8000', // Django server
      changeOrigin: true,
      secure: false
    };
  });
  return data;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  const PORT = 3000;

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000
      port: PORT,
      host: true,

      proxy: {
        ...getProxyUrlsDict()
      }
    },
    preview: {
      open: true,
      host: true
    },
    define: {
      global: 'window'
    },
    resolve: {
      alias: [
        // { find: '', replacement: path.resolve(__dirname, 'src') },
        // {
        //   find: /^~(.+)/,
        //   replacement: path.join(process.cwd(), 'node_modules/$1')
        // },
        // {
        //   find: /^src(.+)/,
        //   replacement: path.join(process.cwd(), 'src/$1')
        // }
        // {
        //   find: 'assets',
        //   replacement: path.join(process.cwd(), 'src/assets')
        // },
        {
          find: '@',
          replacement: path.join(process.cwd(), 'src')
        }
      ]
    },
    css: {
      preprocessorOptions: {
        scss: {
          charset: false
        },
        less: {
          charset: false
        }
      },
      charset: false,
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              }
            }
          }
        ]
      }
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        input: {
          main: resolvePath('index.html'),
          legacy: resolvePath('index.html')
        }
      }
    },
    base: API_URL,
    plugins: [react(), tsconfigPaths()]
  };
});
