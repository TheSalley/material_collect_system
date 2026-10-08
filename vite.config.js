import { resolve } from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  server: {
    proxy: {
      // 节假日/节气 API：cron.1919532973.workers.dev 响应无 CORS 头，
      // 浏览器直连会被跨域拦截，开发环境统一走本地代理
      "/holiday-api": {
        target: "https://cron.1919532973.workers.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/holiday-api/, ""),
      },
    },
  },
});
