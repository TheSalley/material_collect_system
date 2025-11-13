import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "list",
        component: () => import("@/views/admin/List.vue"),
      },
      {
        path: "detail",
        component: () => import("@/views/admin/Detail.vue"),
      },
      {
        path: "elementor",
        component: () => import("@/views/elementor/index.vue"),
      },
    ],
  },
  {
    path: "/customer",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        component: () => import("@/views/customer/index.vue"),
      },
    ],
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
