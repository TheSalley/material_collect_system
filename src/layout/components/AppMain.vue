<template>
  <section class="app-main">
    <div class="app-scrollbar">
      <router-view></router-view>
    </div>
    <el-backtop />
  </section>
</template>
<style scoped>
.app-main {
  width: 100%;
  display: flex;
}

.app-scrollbar {
  flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  .app-container-grow {
    flex-grow: 1;
  }
}
</style>
