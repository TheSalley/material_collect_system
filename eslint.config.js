import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

export default defineConfig([
  {
    // 通用 JS/ Vue 基础规则
    files: ["**/*.{js,mjs,cjs,vue}"],
    plugins: { js, prettier: pluginPrettier },
    extends: [
      "js/recommended",
      pluginPrettier.configs.recommended, // Prettier 作为 ESLint 规则
      prettier // 最后加载：关闭与 Prettier 冲突的 ESLint 规则（关键）
    ],
    languageOptions: { globals: globals.browser },
    rules: {
      "prettier/prettier": "error" // 统一在此处配置，避免重复
    }
  },
  {
    // Vue 专属规则（继承 essential 并集成 Prettier）
    ...pluginVue.configs["flat/essential"],
    extends: [
      ...pluginVue.configs["flat/essential"].extends,
      "plugin:prettier/recommended", // 先加载 Prettier 推荐规则
      prettier // 最后加载：关闭 Vue 规则与 Prettier 的冲突（关键调整）
    ],
    rules: {
      "vue/multi-word-component-names": ["error", { ignores: ["App"] }]
      // 移除重复的 "prettier/prettier"，统一在上面配置
    }
  }
]);