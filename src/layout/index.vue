<template>
  <div class="app-wrapper flex min-h-screen">
    <!-- <SideBar class="sidebar-container" /> -->
    <SideBar />
    <div class="flex-1 p-6 sm:p-8 md:p-10">
      <!-- <div class="fixed-header layout-header">
        <NavigationBar />
      </div> -->
      <AppMain />
    </div>
  </div>
</template>
<script setup>
import SideBar from "./components/SideBar.vue";
import AppMain from "./components/AppMain.vue";
import NavigationBar from "./components/NavigationBar.vue";
</script>
<style>
.app-wrapper {
  position: relative;
  width: 100%;
}

.sidebar-container {
  background-color: #001428;
  transition: width 0.35s;
  width: 220px;
  height: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
  border-right: 1px solid #f0f2f5;
}

.main-container {
  min-height: 100%;
  position: relative;
}

.fixed-header {
  position: fixed !important;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - 220px);
  transition: width 0.35s;
}

.layout-header {
  position: relative;
  z-index: 9;
  background-color: #fff;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid #f0f2f5;
}

.fixed-header + .app-main {
  margin-top: 85px;
}
</style>
