/**
 * 客户端（客户）路由
 * meta.order 决定侧边栏展示顺序（升序）
 * meta.hidden: true 时不在侧边栏显示
 * meta.group 决定侧边栏分组标题（同组归为一组，按 groupOrder 排序）
 * meta.icon 决定侧边栏图标（映射到 element-plus/icons-vue 组件）
 */
const customerRoutes = [
  {
    path: "/",
    meta: { requiresAuth: true, role: "user", hidden: true },
    redirect: "/instruction",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "instruction",
        name: "Instruction",
        component: () => import("@/views/customer/Instruction.vue"),
        meta: { title: "教程页", role: "user", order: 1, group: "开始", groupOrder: 1, icon: "Reading" },
      },
      {
        path: "siteInfo",
        name: "SiteInfo",
        component: () => import("@/views/customer/SiteInfo.vue"),
        meta: { title: "网站信息", role: "user", order: 2, group: "站点内容", groupOrder: 2, icon: "Setting" },
      },
      {
        path: "pages/:id",
        name: "Pages",
        component: () => import("@/views/customer/Pages.vue"),
        meta: { title: "页面列表", role: "user", order: 3, group: "站点内容", groupOrder: 2, icon: "Files" },
      },
      {
        path: "productList",
        name: "ProductList",
        component: () => import("@/views/customer/ProductList.vue"),
        meta: { title: "产品列表", role: "user", order: 4, group: "站点内容", groupOrder: 2, icon: "Goods" },
      },
      {
        path: "newsList",
        name: "NewsList",
        component: () => import("@/views/customer/NewsList.vue"),
        meta: { title: "新闻列表", role: "user", order: 5, group: "站点内容", groupOrder: 2, icon: "Tickets" },
      },
      {
        path: "productUpload",
        name: "ProductUpload",
        component: () => import("@/views/customer/ProductUpload.vue"),
        meta: { title: "产品上传", hidden: true, role: "user", order: 99 },
      },
      {
        path: "newsUpload",
        name: "NewsUpload",
        component: () => import("@/views/customer/NewsUpload.vue"),
        meta: { title: "新闻上传", hidden: true, role: "user", order: 99 },
      },
    ],
  },
];

export default customerRoutes;
