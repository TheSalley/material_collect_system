import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import pinia from "@/stores";
import router from "@/router";

import "quill/dist/quill.core.css";
import "element-plus/dist/index.css";

const app = createApp(App);

app.use(pinia).use(router);

// 挂载应用
app.mount("#app");