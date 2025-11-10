<template>
  <div class="aside-container">
    <img class="logo" src="/logo.webp" />
    <el-menu
      router
      default-active="1"
      text-color="#FFF"
      class="flex-1"
      @open="handleOpen"
      @close="handleClose"
    >
      <el-menu-item index="1" route="/">运营</el-menu-item>
      <el-menu-item index="2" route="/admin">客户</el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from "@element-plus/icons-vue";

const handleOpen = (key, keyPath) => {
  console.log(key, keyPath);
};
const handleClose = (key, keyPath) => {
  console.log(key, keyPath);
};
</script>
<style scoped>
.aside-container {
  display: flex;
  flex-direction: column;
  --el-menu-bg-color: #001428;
}
.logo {
  height: 85px;
  object-fit:contain;
}
</style>
