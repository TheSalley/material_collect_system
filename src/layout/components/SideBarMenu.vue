<script setup>
// SideBarMenu
// 侧边栏菜单区：按角色渲染可访问菜单（分组 + 子菜单 + 页面列表）
import { useGlobalStore } from "@/stores/global.js";
import { iconMap } from "@/utils/sidebarIcons";

const { websiteInfo, sitePageList } = useGlobalStore();

defineProps({
  routes: { type: Array, required: true },
  activeMenu: { type: String, required: true },
  isUserRole: { type: Boolean, default: false },
});

// 获取子路由菜单项的 index
function getChildMenuIndex(menuRoute, child) {
  const base = menuRoute.path === "/" ? "" : menuRoute.path;
  const fullPath = `${base}/${child.path}`.replace(/\/+/g, "/");
  // 动态路由 pages/:id 替换为当前站点 id，避免跳转到字面量 /pages/:id
  if (child.path === "pages/:id" && websiteInfo?.site_id) {
    return `${base ? base + "/" : "/"}pages/${websiteInfo.site_id}`.replace(/\/+/g, "/");
  }
  return fullPath;
}

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
</script>

<template>
  <div class="flex flex-col sidebar-menu-scroll">
    <template v-for="menuRoute in routes" :key="menuRoute.path">
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
</template>

<style scoped>
.sidebar-menu-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 12px;
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
</style>