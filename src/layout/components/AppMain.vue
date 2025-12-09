<template>
  <section class="app-main overflow-y-auto h-full">
      <router-view></router-view>
    <el-backtop />
  </section>
</template>
<style scoped>
.app-main {
  width: 100%;
  display: flex;
}
</style>
