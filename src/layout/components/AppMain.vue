<template>
  <section class="app-main overflow-y-auto overflow-x-hidden flex-1">
    <router-view></router-view>
    <el-backtop />
  </section>
</template>
<style scoped>
.app-main {
  width: 100%;
  display: flex;
  max-width: 100%;
}
</style>
