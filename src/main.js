import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import pinia from "@/stores";
import router from "@/router";

import "quill/dist/quill.core.css";

const app = createApp(App);

app.use(pinia).use(router);

app.mount("#app");
