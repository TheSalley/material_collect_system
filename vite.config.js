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
      // importStyle: false —— 已在 main.js 全量引入 index.css。
      // 开启按需注入时，组件样式会在运行时插到 style.css 之后，
      // 用 Element 默认变量覆盖我们自定义的设计 token。
      resolvers: [ElementPlusResolver({ importStyle: false })],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: false })],
    }),
  ],
});
