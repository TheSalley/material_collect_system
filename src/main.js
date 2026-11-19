import { createApp } from "vue";
/*
 * 顺序很重要：Element Plus 的默认变量必须先加载，
 * 否则它后面的 :root 会覆盖 style.css 里的设计 token。
 */
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import pinia from "@/stores";
import router from "@/router";

import "quill/dist/quill.core.css";

const app = createApp(App);

app.use(pinia).use(router);

// 挂载应用
app.mount("#app");
