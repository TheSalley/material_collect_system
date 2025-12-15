<template>
  <div
    class="flex flex-col gap-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark p-4 w-64"
  >
    <div class="flex items-center gap-3 px-3 py-2">
      <a href="/"><img class="logo" src="/logo.webp" /></a>
    </div>
    <div class="flex flex-col justify-between flex-grow">
      <div class="flex flex-col gap-2">
        <el-menu default-active="2" router>
          <template v-for="route in accessibleRoutes" :key="route.path">
            <el-sub-menu v-if="route.children.length" :index="route.path">
              <template #title>
                <!-- <el-icon><location /></el-icon> -->
                <span>{{ route.meta.title }}</span>
              </template>
              <el-menu-item
                v-for="sub_route in route.children"
                :key="sub_route.id"
                :index="route.path.split(':')[0] + sub_route.id"
                >{{ sub_route.post_name }}</el-menu-item
              >
            </el-sub-menu>
            <el-menu-item v-else :index="route.path">
              <!-- <el-icon><icon-menu /></el-icon> -->
              <span>{{ route.meta.title }}</span>
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
import { useRouter } from "vue-router";
import { resetRoutes } from "@/utils/index"

const { user, clearUser } = useGlobalStore();
const router = useRouter();

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