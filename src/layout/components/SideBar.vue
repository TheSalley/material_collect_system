<template>
  <div
    class="flex flex-col gap-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark p-4 w-64 h-screen overflow-hidden"
  >
    <div class="flex items-center gap-3 px-3 py-2">
      <a href="/"><img class="logo" src="/logo.webp" /></a>
    </div>
    <div class="flex flex-col justify-between flex-1 min-h-0">
      <div class="flex flex-col gap-2 sidebar-menu-scroll">
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
              <template v-for="child in menuRoute.children.filter(child => !child.meta?.hidden)" :key="child.path">
                <!-- 用户身份且为「页面列表」且已拉取到页面数据：显示为子菜单 -->
                <el-sub-menu
                  v-if="isUserRole && child.path === 'pages/:id' && sitePageList.length > 0"
                  :index="'/pages/' + (websiteInfo?.site_id || '')"
                >
                  <template #title>
                    <span>{{ child.meta?.title || child.name }}</span>
                  </template>
                  <el-menu-item
                    v-for="page in sitePageList"
                    :key="page.id"
                    :index="'/pages/' + page.id"
                  >
                    {{ page.post_name }}
                  </el-menu-item>
                </el-sub-menu>
                <el-menu-item v-else :index="getChildMenuIndex(menuRoute, child)">
                  <span>{{ child.meta?.title || child.name }}</span>
                </el-menu-item>
              </template>
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
      <div class="flex flex-col gap-1 sidebar-footer">
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

const { user, clearUser, websiteInfo, sitePageList } = useGlobalStore();
const router = useRouter();
const route = useRoute();

// role 为 user 表示用户身份（customer 同）
const isUserRole = computed(() => {
  const r = (user?.role ?? "").toString().toLowerCase();
  return r === "user" || r === "customer";
});

const accessibleRoutes = computed(() => {
  const isUser = (user?.role ?? "").toString().toLowerCase() === "user" || (user?.role ?? "").toString().toLowerCase() === "customer";
  let arr = router.getRoutes().reverse().filter((item) => {
    // 用户身份时保留根布局路由（path 为 '' 或 '/'），否则无法展示子菜单
    if (item.meta?.hidden && !(isUser && (item.path === "/" || item.path === ""))) return false;
    if (user.role === "administrator" && item.path === "/pages/:id") return false;
    return true;
  });

  // getRoutes() 为扁平列表：父/子都会出现在同一层。
  // 用户身份下我们保留了根布局路由（/），因此需要剔除那些“同时也以顶层 route 出现”的子路由，避免菜单重复。
  if (isUser) {
    const root = arr.find((r) => r.path === "/" || r.path === "");
    if (root?.children?.length) {
      const childFullPaths = new Set(
        root.children
          .map((c) => {
            const base = root.path === "" ? "/" : root.path;
            const full = `${base === "/" ? "" : base}/${c.path}`.replace(/\/+/g, "/");
            return full.startsWith("/") ? full : `/${full}`;
          })
          .filter(Boolean)
      );
      arr = arr.filter((r) => {
        // 保留根布局本身；剔除顶层的子路由记录（如 /siteInfo、/pages/:id）
        if (r.path === "/" || r.path === "") return true;
        return !childFullPaths.has(r.path);
      });
    }
  }

  // 按 path 去重（根路径 '' 与 '/' 视为同一项），避免重复菜单
  const seen = new Set();
  arr = arr.filter((item) => {
    const key = item.path === "" ? "/" : item.path;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (user.page_list) {
    arr.forEach((item) => {
      if (item.path === "/pages/:id") {
        item.children = JSON.parse(user.page_list);
      }
    });
  }
  return arr;
});

// 获取菜单项的 index（动态路由需替换为实际 site_id）
const getMenuIndex = (menuRoute) => {
  if (menuRoute.path === "/pages/:id" && websiteInfo?.site_id) {
    return `/pages/${websiteInfo.site_id}`;
  }
  return menuRoute.path;
};

// 获取子路由菜单项的 index
const getChildMenuIndex = (menuRoute, child) => {
  const base = menuRoute.path === '/' ? '' : menuRoute.path;
  const fullPath = `${base}/${child.path}`.replace(/\/+/g, '/');
  // 动态路由 pages/:id 替换为当前站点 id，避免跳转到字面量 /pages/:id
  if (child.path === 'pages/:id' && websiteInfo?.site_id) {
    return `${base ? base + '/' : '/'}pages/${websiteInfo.site_id}`.replace(/\/+/g, '/');
  }
  return fullPath;
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
.sidebar-menu-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 12px;
}
.sidebar-footer {
  flex: 0 0 auto;
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