import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import pinia from "@/stores";
import router from "@/router";
import { useGlobalStore } from "@/stores/global";
import { loadCustomerMenuPermissions } from "@/apis/collection";
import { normalizeRole } from "@/router/permissions";

import "quill/dist/quill.core.css";
import "element-plus/dist/index.css";

const app = createApp(App);

app.use(pinia).use(router);

/**
 * 刷新页面时 store 已持久化，但权限要重新拉一次，
 * 否则后台刚改完，客户刷新仍看到旧菜单。
 */
async function refreshCustomerMenuPermissions() {
  const store = useGlobalStore();
  if (!store.access_token || normalizeRole(store.user?.role) !== "user") {
    return;
  }
  const res = await loadCustomerMenuPermissions();
  if (res.ok) store.setCustomerMenuPermissions(res.data);
}

refreshCustomerMenuPermissions();

// 挂载应用
app.mount("#app");
