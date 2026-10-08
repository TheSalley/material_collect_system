<template>
  <div
    class="sidebar-shell flex flex-col border-r border-gray-200/70 dark:border-gray-700/60 p-4 w-64 h-screen overflow-hidden"
  >
    <div class="flex items-center gap-3 px-3 py-2">
      <a href="/"><img class="logo" src="/logo.webp" /></a>
    </div>
    <div class="flex flex-col justify-between flex-1 min-h-0">
      <div class="flex flex-col sidebar-menu-scroll">
        <template v-for="menuRoute in accessibleRoutes" :key="menuRoute.path">
          <div
            v-for="group in groupChildren(menuRoute)"
            :key="group.label || `nogroup-${menuRoute.path}`"
            class="menu-group"
          >
            <div v-if="group.label" class="menu-group-title">
              {{ group.label }}
            </div>
            <el-menu :default-active="activeMenu" router class="group-menu">
              <template v-for="child in group.items" :key="child.path">
                <!-- 用户身份 + 页面列表：显示为可展开的子菜单 -->
                <el-sub-menu
                  v-if="isUserRole && child.path === 'pages/:id' && sitePageList.length > 0"
                  :index="'/pages/' + (websiteInfo?.site_id || '')"
                >
                  <template #title>
                    <el-icon>
                      <component :is="iconMap[child.meta?.icon]" />
                    </el-icon>
                    <span>{{ child.meta?.title || child.name }}</span>
                  </template>
                  <el-menu-item
                    v-for="page in sitePageList"
                    :key="page.id"
                    :index="'/pages/' + page.id"
                  >
                    <span class="sub-item-text">{{ page.post_name }}</span>
                  </el-menu-item>
                </el-sub-menu>
                <!-- 普通菜单项 -->
                <el-menu-item
                  v-else
                  :index="getChildMenuIndex(menuRoute, child)"
                >
                  <el-icon>
                    <component :is="iconMap[child.meta?.icon]" />
                  </el-icon>
                  <span>{{ child.meta?.title || child.name }}</span>
                </el-menu-item>
              </template>
            </el-menu>
          </div>
        </template>
      </div>
      <!-- 底部 -->
      <div class="flex flex-col gap-1 sidebar-footer">
        <div ref="userCardRef" class="user-card-wrap mt-4">
          <div
            class="flex gap-3 p-3 border-t border-gray-200 dark:border-gray-700"
          >
            <div
              class="__avator bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            ></div>
            <div class="flex flex-col gap-0.5 min-w-0 flex-1 justify-center">
              <p
                class="text-gray-500 dark:text-gray-400 text-sm font-normal leading-tight truncate"
              >
                {{ user?.username }}
              </p>
            </div>
            <button
              class="user-dots-btn self-center"
              type="button"
              aria-label="更多操作"
              aria-haspopup="menu"
              :aria-expanded="menuOpen"
              @click="toggleMenu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"
                />
              </svg>
            </button>
          </div>

          <transition name="menu-pop">
            <div
              v-if="menuOpen"
              class="user-menu"
              role="menu"
              aria-label="用户操作"
            >
              <template v-if="!confirmOpen">
                <button
                  v-if="isUserRole"
                  class="user-menu-item"
                  role="menuitem"
                  type="button"
                  @click="goTo('/instruction')"
                >
                  使用说明
                </button>
                <button
                  v-if="isUserRole"
                  class="user-menu-item"
                  role="menuitem"
                  type="button"
                  @click="goTo('/siteInfo')"
                >
                  设置
                </button>
                <div v-if="isUserRole" class="user-menu-divider"></div>
                <button
                  class="user-menu-item danger"
                  role="menuitem"
                  type="button"
                  @click="confirmOpen = true"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
                    />
                  </svg>
                  退出登录
                </button>
              </template>
              <div v-else class="user-menu-confirm">
                <p class="confirm-title">确定退出登录吗？</p>
                <p class="confirm-sub">退出后要重新登录哦</p>
                <div class="confirm-actions">
                  <button
                    class="confirm-btn ghost"
                    type="button"
                    @click="closeMenu"
                  >
                    取消
                  </button>
                  <button
                    class="confirm-btn solid"
                    type="button"
                    @click="logout"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { useRouter, useRoute } from "vue-router";
import { resetRoutes } from "@/utils/index";
import {
  Grid,
  FolderOpened,
  User,
  Picture,
  Monitor,
  Reading,
  Setting,
  Files,
  Goods,
  Tickets,
} from "@element-plus/icons-vue";

const { user, clearUser, websiteInfo, sitePageList } = useGlobalStore();
const router = useRouter();
const route = useRoute();

const userCardRef = ref(null);
const menuOpen = ref(false);
const confirmOpen = ref(false);

// meta.icon 字符串 → element-plus 图标组件
const iconMap = {
  Grid,
  FolderOpened,
  User,
  Picture,
  Monitor,
  Reading,
  Setting,
  Files,
  Goods,
  Tickets,
};

// role 为 user 表示用户身份
const isUserRole = computed(() => {
  const r = (user?.role ?? "").toString().toLowerCase();
  return r === "user";
});

// 将父路由的 children 按 meta.group 分组（组间按 groupOrder，组内保持原 order）
function groupChildren(menuRoute) {
  if (!menuRoute.children?.length) {
    return [{ label: null, order: 0, items: [menuRoute] }];
  }
  const groups = new Map();
  const noGroup = { label: null, order: 0, items: [] };
  for (const child of menuRoute.children) {
    if (child.meta?.hidden) continue;
    const label = child.meta?.group;
    if (label == null) {
      noGroup.items.push(child);
      continue;
    }
    if (!groups.has(label)) {
      groups.set(label, {
        label,
        order: typeof child.meta?.groupOrder === "number" ? child.meta.groupOrder : 0,
        items: [],
      });
    }
    groups.get(label).items.push(child);
  }
  const arr = [...groups.values()].sort((a, b) => a.order - b.order);
  if (noGroup.items.length) arr.push(noGroup); // 未分组的放在末尾
  return arr;
}

const accessibleRoutes = computed(() => {
  const role = (user?.role ?? "user").toString().toLowerCase();
  const isAdmin = role === "admin";
  const isUser = role === "user";
  
  // 根据用户角色过滤路由
  let arr = router.getRoutes().filter((item) => {
    // 检查路由的 role meta，确保用户有权限访问
    const routeRole = item.meta?.role;
    if (routeRole) {
      if (routeRole === "admin" && !isAdmin) return false;
      if (routeRole === "user" && !isUser && !isAdmin) return false;
    }
    
    // 管理员：只显示 /admin 路由及其子路由
    if (isAdmin) {
      // 对于管理员，保留 /admin 路由（即使 hidden），因为需要显示其子路由
      if (item.path === "/admin") return true;
      // 其他隐藏的路由不显示
      if (item.meta?.hidden) return false;
      return item.path.startsWith("/admin/");
    }
    
    // 用户：只显示 / 路由（根路由）及其子路由
    if (isUser) {
      // 对于用户，保留根路由 /（即使 hidden），因为需要显示其子路由
      // getRoutes() 返回的路由中，子路由在父路由的 children 属性中，不会作为独立项
      if (item.path === "/" || item.path === "") {
        // 确保这是用户路由
        if (routeRole && routeRole !== "user") return false;
        return true;
      }
      // 其他路由都不显示（子路由会通过父路由的 children 属性访问）
      return false;
    }
    
    return false;
  });

  // 处理子路由的去重（避免父路由和子路由同时显示）
  if (isAdmin) {
    // 管理员：处理 /admin 路由的子路由去重
    const adminRoot = arr.find((r) => r.path === "/admin");
    if (adminRoot?.children?.length) {
      const childFullPaths = new Set(
        adminRoot.children
          .map((c) => {
            const full = `/admin/${c.path}`.replace(/\/+/g, "/");
            return full;
          })
          .filter(Boolean)
      );
      arr = arr.filter((r) => {
        // 保留 /admin 布局本身；剔除顶层的子路由记录（如 /admin/list、/admin/userList）
        if (r.path === "/admin") return true;
        return !childFullPaths.has(r.path);
      });
    }
  } else if (isUser) {
    // 用户：处理 / 路由的子路由去重
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

  // 按 path 去重
  const seen = new Set();
  arr = arr.filter((item) => {
    const key = item.path === "" ? "/" : item.path;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  // 处理用户页面列表
  if (user?.page_list) {
    arr.forEach((item) => {
      if (item.path === "/pages/:id" || (item.children && item.children.some(c => c.path === "pages/:id"))) {
        item.children = JSON.parse(user.page_list);
      }
    });
  }
  
  // 用户身份：侧栏显示站点信息、页面列表；产品列表/新闻列表暂时隐藏（路由仍保留，可直链访问）
  if (isUser) {
    const root = arr.find((r) => r.path === "/" || r.path === "");
    if (root?.children?.length) {
      root.children = root.children.filter((child) => {
        return (
          child.path === "siteInfo" ||
          child.path === "pages/:id" ||
          child.path === "instruction"
        );
      });
    }
  }
  
  // 按 meta.order 对子路由排序（升序，未设置 order 的保持原顺序排在后面）
  arr.forEach((item) => {
    if (item.children?.length) {
      item.children = [...item.children].sort((a, b) => {
        const orderA = typeof a.meta?.order === "number" ? a.meta.order : 999;
        const orderB = typeof b.meta?.order === "number" ? b.meta.order : 999;
        return orderA - orderB;
      });
    }
  });

  return arr;
});

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

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) confirmOpen.value = false;
}

function closeMenu() {
  menuOpen.value = false;
  confirmOpen.value = false;
}

function onDocClick(e) {
  if (!menuOpen.value) return;
  if (userCardRef.value && !userCardRef.value.contains(e.target)) {
    closeMenu();
  }
}

function onKeydown(e) {
  if (e.key === "Escape") closeMenu();
}

function goTo(path) {
  closeMenu();
  router.push(path);
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onKeydown);
});
</script>
<style scoped>
/* 侧边栏整体：柔和渐变背景（避开纯平），非线性动效 */
.sidebar-shell {
  background: linear-gradient(180deg, #fbfcfe 0%, #f4f7fb 55%, #eef2f8 100%);
  transition: background 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.dark .sidebar-shell {
  background: linear-gradient(180deg, #131b26 0%, #10161f 60%, #0d131b 100%);
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

/* 分组：每组之间留出呼吸空间，标题小号、灰色、不成等宽 */
.menu-group {
  margin-bottom: 18px;
}
.menu-group:last-child {
  margin-bottom: 4px;
}
.menu-group-title {
  padding: 6px 10px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #9aa3b2;
  text-transform: uppercase;
  user-select: none;
}
.dark .menu-group-title {
  color: #64748b;
}

.group-menu {
  border-right: unset;
  background: transparent !important;
  padding: 0 2px;
}

/* 深度定制 el-menu-item：圆角 + 图标 + 悬停/激活状态 */
.group-menu :deep(.el-menu-item) {
  height: 42px;
  line-height: 42px;
  padding: 0 12px;
  margin: 2px 0;
  border-radius: 10px;
  color: #46505e;
  font-size: 13.5px;
  font-weight: 500;
  transition: color 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.dark .group-menu :deep(.el-menu-item) {
  color: #c3cad6;
}
.group-menu :deep(.el-menu-item .el-icon) {
  font-size: 17px;
  margin-right: 10px;
  color: #7c8798;
  transition: color 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.dark .group-menu :deep(.el-menu-item .el-icon) {
  color: #6b7485;
}

.group-menu :deep(.el-menu-item:hover) {
  color: #1f6fe0;
  background: rgba(43, 124, 238, 0.08);
  transform: translateX(2px);
}
.group-menu :deep(.el-menu-item:hover .el-icon) {
  color: #1f6fe0;
}

/* 激活项：主色渐变底 + 左侧指示条 + 图标亮起 */
.group-menu :deep(.el-menu-item.is-active) {
  position: relative;
  color: #1a5fc4;
  font-weight: 600;
  background: linear-gradient(90deg, rgba(43, 124, 238, 0.16) 0%, rgba(43, 124, 238, 0.05) 100%);
  box-shadow: inset 0 0 0 1px rgba(43, 124, 238, 0.12);
}
.group-menu :deep(.el-menu-item.is-active)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, #2b7cee 0%, #4f9af5 100%);
}
.group-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #2b7cee;
}
.dark .group-menu :deep(.el-menu-item.is-active) {
  color: #6fb0f7;
  background: linear-gradient(90deg, rgba(43, 124, 238, 0.24) 0%, rgba(43, 124, 238, 0.06) 100%);
}

/* 子菜单标题：与普通项视觉同源，但更强调可展开 */
.group-menu :deep(.el-sub-menu__title) {
  height: 42px;
  line-height: 42px;
  padding: 0 12px;
  margin: 2px 0;
  border-radius: 10px;
  color: #46505e;
  font-size: 13.5px;
  font-weight: 500;
  transition: color 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.dark .group-menu :deep(.el-sub-menu__title) {
  color: #c3cad6;
}
.group-menu :deep(.el-sub-menu__title .el-icon) {
  font-size: 17px;
  margin-right: 10px;
  color: #7c8798;
}
.dark .group-menu :deep(.el-sub-menu__title .el-icon) {
  color: #6b7485;
}
.group-menu :deep(.el-sub-menu__title:hover) {
  color: #1f6fe0;
  background: rgba(43, 124, 238, 0.08);
}

/* 子菜单内子项：缩进 + 左侧层级线，体现父子关系 */
.group-menu :deep(.el-sub-menu .el-menu) {
  background: transparent !important;
}
.group-menu :deep(.el-sub-menu .el-menu-item) {
  height: 36px;
  line-height: 36px;
  padding-left: 38px !important;
  margin: 1px 0;
  font-size: 13px;
  font-weight: 400;
  position: relative;
}
.group-menu :deep(.el-sub-menu .el-menu-item)::before {
  content: "";
  position: absolute;
  left: 20px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  border-radius: 2px;
  background: #dbe2ec;
  transition: background 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.group-menu :deep(.el-sub-menu .el-menu-item:hover)::before {
  background: #2b7cee;
}
.group-menu :deep(.el-sub-menu .el-menu-item.is-active)::before {
  background: #2b7cee;
}
.group-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  color: #1a5fc4;
  font-weight: 600;
  background: rgba(43, 124, 238, 0.08);
}
.dark .group-menu :deep(.el-sub-menu .el-menu-item::before) {
  background: #2a3442;
}

.sub-item-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.__avator {
  background-image: url("@/assets/images/avator.png");
}

/* ===== 底部用户卡 + 三点菜单（ChatGPT/DeepSeek 风格） ===== */
.user-card-wrap {
  position: relative;
}

.user-dots-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 9px;
  color: #7c8798;
  border: 1px solid transparent;
  cursor: pointer;
  transition: color 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.user-dots-btn:hover {
  color: #1f6fe0;
  background: rgba(43, 124, 238, 0.08);
}
.dark .user-dots-btn {
  color: #6b7485;
}
.dark .user-dots-btn:hover {
  color: #6fb0f7;
  background: rgba(43, 124, 238, 0.16);
  border-color: rgba(43, 124, 238, 0.22);
}

/* 弹出菜单：渐变 + 噪点纹理打底（非纯平），从按钮上方展开 */
.user-menu {
  position: absolute;
  right: 12px;
  bottom: calc(100% + 10px);
  width: 200px;
  z-index: 60;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: 0 18px 40px -12px rgba(15, 23, 42, 0.28);
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"),
    linear-gradient(180deg, #ffffff 0%, #f4f7fb 100%);
}
.dark .user-menu {
  border-color: rgba(100, 116, 139, 0.35);
  box-shadow: 0 18px 40px -12px rgba(0, 0, 0, 0.55);
  background-color: #16202d;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E"),
    linear-gradient(180deg, #1a2532 0%, #131c28 100%);
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  color: #3c4452;
  background: transparent;
  cursor: pointer;
  transition: color 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.user-menu-item:hover {
  color: #1f6fe0;
  background: linear-gradient(90deg, rgba(43, 124, 238, 0.1) 0%, rgba(43, 124, 238, 0.03) 100%);
}
.user-menu-item.danger {
  color: #dc2626;
}
.user-menu-item.danger:hover {
  color: #b91c1c;
  background: linear-gradient(90deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.03) 100%);
}
.dark .user-menu-item {
  color: #c3cad6;
}
.dark .user-menu-item:hover {
  color: #6fb0f7;
  background: linear-gradient(90deg, rgba(43, 124, 238, 0.2) 0%, rgba(43, 124, 238, 0.06) 100%);
}
.dark .user-menu-item.danger {
  color: #f87171;
}
.dark .user-menu-item.danger:hover {
  color: #fca5a5;
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.06) 100%);
}

.user-menu-divider {
  height: 1px;
  margin: 5px 8px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.24) 0%, rgba(148, 163, 184, 0.08) 100%);
}

/* 退出确认 */
.user-menu-confirm {
  padding: 4px 6px 6px;
}
.confirm-title {
  padding: 6px 6px 2px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1f2937;
}
.dark .confirm-title {
  color: #e5e9f0;
}
.confirm-sub {
  padding: 0 6px 10px;
  font-size: 12px;
  color: #8a94a3;
}
.dark .confirm-sub {
  color: #79839a;
}
.confirm-actions {
  display: flex;
  gap: 8px;
}
.confirm-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.22s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.confirm-btn.ghost {
  color: #5b6472;
  background: rgba(100, 116, 139, 0.1);
}
.confirm-btn.ghost:hover {
  color: #111827;
  background: rgba(100, 116, 139, 0.18);
}
.confirm-btn.solid {
  color: #ffffff;
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px -4px rgba(220, 38, 38, 0.5);
}
.confirm-btn.solid:hover {
  transform: translateY(-1px);
  background: linear-gradient(180deg, #f05252 0%, #e02424 100%);
}
.dark .confirm-btn.ghost {
  color: #c3cad6;
}
.dark .confirm-btn.ghost:hover {
  color: #ffffff;
  background: rgba(100, 116, 139, 0.28);
}

/* 弹出动画：非线性缓动，从按钮上方滑出 */
.menu-pop-enter-active {
  transition: opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.menu-pop-leave-active {
  transition: opacity 0.15s cubic-bezier(0.4, 0, 1, 1),
    transform 0.15s cubic-bezier(0.4, 0, 1, 1);
}
.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
  transform-origin: bottom right;
}
</style>
