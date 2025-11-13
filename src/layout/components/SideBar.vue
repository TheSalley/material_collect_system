<template>
  <div class="aside-container">
    <a href="/"><img class="logo" src="/logo.svg" /></a>
    <el-menu router default-active="1" class="flex-1">
      <el-menu-item index="1" route="/list">管理</el-menu-item>
      <el-menu-item index="2" route="/customer">客户</el-menu-item>
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
  width: 100%;
}

.el-menu {
  width: 220px;
}

.el-menu-item:hover {
  color: #409eff;
}
</style>
