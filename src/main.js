import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import pinia from "@/stores";
import router from "@/router";
import { addProtectedRoutes } from "@/utils";
import { useGlobalStore } from "@/stores/global.js";

import "quill/dist/quill.core.css";

const app = createApp(App);

app.use(pinia).use(router);

// const { user, token } = useGlobalStore();
// if (token) {
//   addProtectedRoutes(user.role);
// }

app.mount("#app");
