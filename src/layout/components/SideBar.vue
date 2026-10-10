<template>
  <div
    class="sidebar-shell flex flex-col border-r border-gray-200/70 dark:border-gray-700/60 p-4 w-64 h-screen overflow-hidden"
  >
    <a class="flex flex-col items-center gap-3 py-2" href="/">
      <img class="" src="/logo.webp" />
      <div>网站素材收集系统</div>
    </a>
    <div class="flex flex-col justify-between flex-1 min-h-0">
      <!-- 菜单区（分组 + 子菜单 + 页面列表） -->
      <SideBarMenu
        :routes="accessibleRoutes"
        :active-menu="activeMenu"
        :is-user-role="isUserRole"
      />
      <!-- 底部用户卡 + 三点菜单 -->
      <div class="flex flex-col gap-1 sidebar-footer">
        <UserAvator :is-user-role="isUserRole" />
      </div>
    </div>
  </div>
</template>

<script setup>
// SideBar
// 侧边栏骨架：Logo + 菜单区 + 底部用户卡
import SideBarMenu from "./SideBarMenu.vue";
import UserAvator from "./UserAvator.vue";
import { useSidebarMenu } from "@/composables/useSidebarMenu";

const { isUserRole, accessibleRoutes, activeMenu } = useSidebarMenu();
</script>

<style scoped>
/* 侧边栏整体：柔和渐变背景（避开纯平），非线性动效 */
.sidebar-shell {
  background: linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 55%, #eef2f8 100%);
  transition: background 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.dark .sidebar-shell {
  background: linear-gradient(180deg, #131b26 0%, #10161f 60%, #0d131b 100%);
}

.sidebar-footer {
  flex: 0 0 auto;
}
</style>