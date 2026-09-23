/**
 * 管理端路由
 * meta.order 决定侧边栏展示顺序（升序）
 * meta.hidden: true 时不在侧边栏显示
 * meta.group 决定侧边栏分组标题（同组归为一组，按 groupOrder 排序）
 * meta.icon 决定侧边栏图标（映射到 element-plus/icons-vue 组件）
 */
const adminRoutes = [
  {
    path: "/admin",
    meta: { requiresAuth: true, role: "admin", hidden: true },
    redirect: "/admin/dashboard",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/admin/Dashboard.vue"),
        meta: { title: "面板", role: "admin", order: 1, group: "总览", groupOrder: 1, icon: "Grid" },
      },
      {
        path: "list",
        name: "AdminList",
        component: () => import("@/views/admin/List.vue"),
        meta: { title: "站点管理", role: "admin", order: 2, group: "内容管理", groupOrder: 2, icon: "FolderOpened" },
      },
      {
        path: "userList",
        name: "UserList",
        component: () => import("@/views/admin/UserList.vue"),
        meta: { title: "用户管理", role: "admin", order: 3, group: "内容管理", groupOrder: 2, icon: "User" },
      },
      {
        path: "mediaLibrary",
        name: "AdminMediaLibrary",
        component: () => import("@/views/admin/MediaLibrary.vue"),
        meta: { title: "媒体库", role: "admin", order: 4, group: "内容管理", groupOrder: 2, icon: "Picture" },
      },
      {
        path: "demoList",
        name: "AdminDemoList",
        component: () => import("@/views/admin/DemoList.vue"),
        meta: { title: "Demo 截图尺寸", role: "admin", order: 5, group: "工具", groupOrder: 3, icon: "Monitor" },
      },
      {
        path: "preset",
        name: "PresetContent",
        component: () => import("@/views/admin/PresetContent.vue"),
        meta: { title: "预设内容", role: "admin", order: 6, group: "内容管理", groupOrder: 2, icon: "Collection" },
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
