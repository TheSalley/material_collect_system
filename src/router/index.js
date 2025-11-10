import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        component: () => import("@/views/customer/index.vue"),
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        component: () => import("@/views/admin/index.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
