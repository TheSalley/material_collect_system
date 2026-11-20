<template>
  <div class="app-wrapper flex h-screen overflow-hidden">
    <SideBar class="flex-shrink-0" />
    <div class="flex-1 px-4 pt-4 h-full overflow-hidden flex flex-col">
      <AppMain />
      <div class="app-footer mt-auto w-full text-center text-xs text-text-muted py-2">
        版本号：{{ APP_VERSION }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from "vue";
import SideBar from "./components/SideBar.vue";
import AppMain from "./components/AppMain.vue";
import { APP_VERSION } from "@/config/index";
import { useGlobalStore } from "@/stores/global";
import { getMyPermissions } from "@/apis/index.js";

const globalStore = useGlobalStore();

// 每次进入布局都刷新一次菜单权限，保证管理员调整角色权限后刷新即生效
onMounted(async () => {
  if (!globalStore.access_token) return;
  const res = await getMyPermissions();
  if (res?.code === 0 && res.data) {
    globalStore.setMenus(res.data.menus || []);
  }
});
</script>
<style>
.app-wrapper {
  position: relative;
  width: 100%;
}
</style>
