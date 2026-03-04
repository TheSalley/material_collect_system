<template>
  <div
    class="flex flex-col gap-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark p-4 w-64"
  >
    <div class="flex items-center gap-3 px-3 py-2">
      <a href="/"><img class="logo" src="/logo.webp" /></a>
    </div>
    <div class="flex flex-col justify-between flex-grow">
      <div class="flex flex-col gap-2">
        <el-menu :default-active="activeMenu" router>
          <template v-for="menuRoute in accessibleRoutes" :key="menuRoute.path">
            <!-- 动态页面列表：显示为子菜单 -->
            <el-sub-menu v-if="menuRoute.path.includes('/pages/:id') && menuRoute.children && menuRoute.children.length > 0" :index="menuRoute.path">
              <template #title>
                <!-- <el-icon><location /></el-icon> -->
                <span>{{ menuRoute.meta.title }}</span>
              </template>
              <el-menu-item
                v-for="sub_route in menuRoute.children.filter(child => !child.meta?.hidden)"
                :key="sub_route.id"
                :index="menuRoute.path.split(':')[0] + sub_route.id"
                >{{ sub_route.post_name }}</el-menu-item
              >
            </el-sub-menu>
            <!-- 普通路由：如果有子路由，显示子路由为独立菜单项 -->
            <template v-else-if="menuRoute.children && menuRoute.children.length > 0">
              <el-menu-item
                v-for="child in menuRoute.children.filter(child => !child.meta?.hidden)"
                :key="child.path"
                :index="getChildMenuIndex(menuRoute, child)"
              >
                <span>{{ child.meta?.title || child.name }}</span>
              </el-menu-item>
            </template>
            <!-- 没有子路由：显示为普通菜单项 -->
            <el-menu-item v-else :index="getMenuIndex(menuRoute)">
              <!-- <el-icon><icon-menu /></el-icon> -->
              <span>{{ menuRoute.meta.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
      <!-- 底部 -->
      <div class="flex flex-col gap-1">
        <div
          class="flex gap-3 p-3 border-t border-gray-200 dark:border-gray-700 mt-4"
        >
          <div
            class="__avator bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          ></div>
          <div class="flex flex-col">
            <h1
              class="text-[#111418] dark:text-white text-sm font-medium leading-tight"
            >
              {{ user.nickname }}
            </h1>
            <p
              class="text-gray-500 dark:text-gray-400 text-xs font-normal leading-tight"
            >
              {{ user?.username }}
            </p>
          </div>
        </div>
        <a
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          href="#"
          @click="logout"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23.9917 6H6V42H24"
              stroke="#e7000b"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M33 33L42 24L33 15"
              stroke="#e7000b"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M16 23.9917H42"
              stroke="#e7000b"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p class="text-sm font-medium leading-normal">登出</p>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { useRouter, useRoute } from "vue-router";
import { resetRoutes } from "@/utils/index"

const { user, clearUser } = useGlobalStore();
const router = useRouter();
const route = useRoute();

const accessibleRoutes = computed(() => {
  let arr = router.getRoutes().reverse().filter((item) => {
    if (item.meta?.hidden) return false;
    if (user.role === 'administrator' && item.path === '/pages/:id') return false;
    return true;
  });
  if (user.page_list) {
    arr.forEach((item) => {
      if (item.path === "/pages/:id") {
        item.children = JSON.parse(user.page_list);
      }
    });
    return arr;
  }
  return arr;
});

// 获取菜单项的 index
const getMenuIndex = (menuRoute) => {
  return menuRoute.path;
};

// 获取子路由菜单项的 index
const getChildMenuIndex = (menuRoute, child) => {
  // 如果是动态路由，需要特殊处理
  if (child.path.includes(':')) {
    return `${menuRoute.path}/${child.path}`;
  }
  return `${menuRoute.path}/${child.path}`;
};

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  const currentPath = route.path;
  
  // 遍历可访问的路由，找到匹配的菜单项
  for (const menuRoute of accessibleRoutes.value) {
    // 检查是否是当前路由的父路由
    if (currentPath.startsWith(menuRoute.path) || menuRoute.path === '/') {
      // 如果有子路由，检查是否匹配子路由
      if (menuRoute.children && menuRoute.children.length > 0) {
        for (const child of menuRoute.children) {
          // 跳过隐藏的子路由
          if (child.meta?.hidden) continue;
          
          const childPath = `${menuRoute.path === '/' ? '' : menuRoute.path}/${child.path}`;
          // 处理动态路由（页面列表）
          if (child.path.includes(':')) {
            const pattern = childPath.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            if (regex.test(currentPath)) {
              // 对于动态路由，返回完整的匹配路径
              return currentPath;
            }
          } else {
            // 精确匹配或路径前缀匹配
            if (currentPath === childPath || currentPath.startsWith(childPath + '/')) {
              return childPath;
            }
          }
        }
      }
      // 如果没有子路由或没有匹配的子路由，检查是否是父路由本身
      if (currentPath === menuRoute.path) {
        return menuRoute.path;
      }
    }
  }
  
  return currentPath;
});

async function logout() {
  await clearUser();
  await resetRoutes();
  
  await nextTick();
  router.replace("/login").catch(err => {
    // 如果路由跳转失败，使用传统方式
    window.location.hash = "#/login";
  });
}
</script>
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
  border-right: unset;
}

.el-menu-item:hover {
  color: #409eff;
}

.__avator {
  background-image: url("@/assets/images/avator.png");
}
</style>