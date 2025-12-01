<template>
  <!-- <div class="aside-container">
    <a href='/'><img class="logo" src="/logo.svg" /></a>
    <el-menu router default-active="1" class="flex-1">
      <el-menu-item index="1" route="/list">管理</el-menu-item>
      <el-menu-item index="2" route="/customer">客户</el-menu-item>
    </el-menu>
  </div> -->
  <div
    class="flex flex-col gap-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark p-4 w-64"
  >
    <div class="flex items-center gap-3 px-3 py-2">
      <a href="/"><img class="logo" src="/logo.webp" /></a>
    </div>
    <div class="flex flex-col justify-between flex-grow">
      <div class="flex flex-col gap-2">
        <!-- <el-menu>
          <el-menu-item
            v-for="route in accessibleRoutes"
            :key="route.name"
            :index="route.path"
          >
            {{ route.meta.title }}
          </el-menu-item>
        </el-menu> -->
        <a
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-[#111418] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" v-for="route in accessibleRoutes"
          :href="route.path"
        >
          <p class="text-sm font-medium leading-normal">{{ route.meta.title }}</p>
        </a>
      </div>
      <!-- 底部 -->
      <div class="flex flex-col gap-1">
        <div
          class="flex gap-3 p-3 border-t border-gray-200 dark:border-gray-700 mt-4"
        >
          <div
            class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            data-alt="Admin user avatar"
            style="
              background-image: url(&quot;https://lh3.googleusercontent.com/aida-public/AB6AXuAPVU9SK3sLCsuplthRoWD5dusglvaFBWzz32Md0YHq8-7hh9vfF703BGRRAcapOr07yW229Ozt1WZSpKUlQYHa2FGDBS57t1nli_gOweXXza63gu4W7iocdyJB97rpDwanQ79_-FAGubt2GqqcfA9o9nEJyh9-NftxZEbiwx9sVAh5jZixIyONNuULQLC9pdH45WFuPVVxBC4aTg6oeg15eOZ3BRiK-37ChkCPCMt5D1qeDPjQCfGW34Z-U76ii1S_sGAuSVb1Bwwj&quot;);
            "
          ></div>
          <div class="flex flex-col">
            <h1
              class="text-[#111418] dark:text-white text-sm font-medium leading-tight"
            >
              {{ user.role === "administrator" ? "管理员" : "用户" }}
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
          @click="clearUser"
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
import { computed } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { useRouter } from "vue-router";

const { user, clearUser } = useGlobalStore();
const router = useRouter();

const accessibleRoutes = computed(() => {
  return router.getRoutes().filter(route => !route.meta.hidden);
});
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
  width: 220px;
}

.el-menu-item:hover {
  color: #409eff;
}
</style>
