import { createWebHashHistory, createRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import { ref } from "vue";

const routes = [
  {
    path: "/",
    meta: { requiresAuth: true }, 
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
    meta: { requiresAuth: true }, 
    path: "/customer",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        component: () => import("@/views/customer/index.vue"),
      },
    ],
  },
    {
    path: "/login",
    children: [
      {
        path: "",
        component: () => import("@/views/login/login.vue"),
      },
    ],
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 路由守卫：检测登录状态
router.beforeEach((to, from, next) => {
  const globalStore = useGlobalStore();

  // 如果已登录且访问登录页 → 自动跳转到首页
  if (to.path === "/login" && globalStore.user.isLogin) {
    next("/");
    return;
  }

  // 如果目标路由需要登录且当前未登录 → 跳转登录页
  if (to.meta.requiresAuth && !globalStore.user.isLogin) {
    next("/login");
  } else {
    next();
  }
});

export default router;
