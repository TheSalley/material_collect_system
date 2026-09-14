/**
 * 管理端路由
 * meta.order 决定侧边栏展示顺序（升序）
 * meta.hidden: true 时不在侧边栏显示
 */
const adminRoutes = [
  {
    path: "/admin",
    meta: { requiresAuth: true, role: "admin", hidden: true },
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/admin/Dashboard.vue"),
        meta: { title: "面板", role: "admin", order: 1 },
      },
      {
        path: "list",
        name: "AdminList",
        component: () => import("@/views/admin/List.vue"),
        meta: { title: "站点管理", role: "admin", order: 2 },
      },
      {
        path: "userList",
        name: "UserList",
        component: () => import("@/views/admin/UserList.vue"),
        meta: { title: "用户管理", role: "admin", order: 3 },
      },
      {
        path: "mediaLibrary",
        name: "AdminMediaLibrary",
        component: () => import("@/views/admin/MediaLibrary.vue"),
        meta: { title: "媒体库", role: "admin", order: 4 },
      },
      {
        path: "demoList",
        name: "AdminDemoList",
        component: () => import("@/views/admin/DemoList.vue"),
        meta: { title: "Demo 截图尺寸", role: "admin", order: 5 },
      },
      {
        path: "detail",
        name: "AdminDetail",
        component: () => import("@/views/admin/Detail.vue"),
        meta: { title: "详情页", hidden: true, role: "admin", order: 99 },
      },
      {
        path: "pages/:id",
        name: "AdminPages",
        component: () => import("@/views/customer/Pages.vue"),
        meta: { title: "页面列表", hidden: true, role: "admin", order: 99 },
      },
    ],
  },
];

export default adminRoutes;
