<template>
  <div class="aside-container">
    <img class="logo" src="/logo.svg" />
    <el-menu router default-active="1" class="flex-1">
      <el-menu-item index="1" route="/">运营</el-menu-item>
      <el-menu-item index="2" route="/admin">客户</el-menu-item>
    </el-menu>
  </div>
</template>

<script setup></script>
<style scoped>
.aside-container {
  display: flex;
  flex-direction: column;
  --el-menu-bg-color: #001428;
  --el-menu-text-color: #fff;
  --el-menu-active-color: #409eff;
}
.logo {
  padding-inline: 10px;
  height: 85px;
  object-fit: contain;
}

.el-menu-item:hover {
  color: #409eff;
}
</style>
