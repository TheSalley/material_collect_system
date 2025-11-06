import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  { path: "/", component: () => import("@/views/customer/index.vue") },
  { path: "/admin", component: () => import("@/views/admin/index.vue") },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
