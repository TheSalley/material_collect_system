<template>
  <section class="app-main">
    <div class="app-scrollbar">
      <router-view v-slot="{ Component, route }">
        <transition name="el-fade-in" mode="out-in">
          <keep-alive :include="tagsViewStore.cachedViews">
            <component
              :is="Component"
              :key="route.path"
              class="app-container-grow"
            />
          </keep-alive>
        </transition>
      </router-view>
    </div>
    <el-backtop />
  </section>
</template>
