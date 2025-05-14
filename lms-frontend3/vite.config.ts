import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// Helper: proxy map for Django backend
const getProxyUrlsDict = () => {
  const urls = ["/api", "/admin", "/lms/auth", "/static", "/protected"];
  const data: Record<string, any> = {};
  urls.forEach((url) => {
    data[url] = {
      target: "http://127.0.0.1:8000",
      changeOrigin: true,
      secure: false,
    };
  });
  return data;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const useBackendProxy = env.VITE_APP_USE_BACKEND_PROXY === 'true';

  console.log("VITE_APP_USE_BACKEND_PROXY", useBackendProxy);

  return {
    plugins: [
      TanStackRouterVite({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "static/assets",
    },
    server: {
      port: 3000,
      proxy: useBackendProxy ? getProxyUrlsDict() : undefined,
    },
  };
});
