import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import pinia from "@/stores";
import router from "@/router";
import { addProtectedRoutes } from "@/utils";
import { useGlobalStore } from "@/stores/global";

import "quill/dist/quill.core.css";

const app = createApp(App);

app.use(pinia).use(router);

// 应用启动时，如果用户已登录，先添加路由
async function initApp() {
  const globalStore = useGlobalStore();
  const { user, access_token } = globalStore;
  
  // 如果用户已登录，先添加路由
  if (access_token && user) {
    try {
      const role = (user.role ?? "user").toString().toLowerCase();
      await addProtectedRoutes(role);
    } catch (err) {
      console.error("初始化路由失败:", err);
    }
  }
  
  // 挂载应用
  app.mount("#app");
}

initApp();