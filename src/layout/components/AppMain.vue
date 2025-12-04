<template>
  <section class="app-main">
      <router-view></router-view>
    <el-backtop />
  </section>
</template>
<style scoped>
.app-main {
  width: 100%;
  display: flex;
}

.app-scrollbar {
  /* flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 20px; */
}
</style>
