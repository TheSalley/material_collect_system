<template>
  <div class="app-wrapper flex h-screen overflow-hidden">
    <SideBar class="flex-shrink-0" />
    <div class="flex-1 px-6 pt-6 h-full overflow-hidden flex flex-col">
      <AppMain />
      <div class="app-footer mt-auto w-full text-center text-xs text-gray-500 dark:text-gray-400 py-2">
        版本号：{{ APP_VERSION }}
      </div>
    </div>
  </div>
</template>
<script setup>
import SideBar from "./components/SideBar.vue";
import AppMain from "./components/AppMain.vue";
import { APP_VERSION } from "@/config/index";
</script>
<style>
.app-wrapper {
  position: relative;
  width: 100%;
}
</style>
