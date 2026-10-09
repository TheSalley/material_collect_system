// useSidebarMenu
// 侧边栏菜单数据：按角色过滤可访问路由、计算当前激活菜单项
import { computed } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { useRouter, useRoute } from "vue-router";

/**
 * 侧边栏菜单数据逻辑
 * - accessibleRoutes：根据角色（admin/user）过滤出可访问的菜单路由
 * - activeMenu：根据当前路由计算出激活的菜单 index
 */
export function useSidebarMenu() {
  const { user } = useGlobalStore();
  const router = useRouter();
  const route = useRoute();

  // role 为 user 表示用户身份
  const isUserRole = computed(() => {
    const r = (user?.role ?? "").toString().toLowerCase();
    return r === "user";
  });

  // 根据角色过滤路由，得到侧边栏可访问的菜单路由
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
        if (item.path === "/pages/:id" || (item.children && item.children.some((c) => c.path === "pages/:id"))) {
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

  // 计算当前激活的菜单项
  const activeMenu = computed(() => {
    const currentPath = route.path;

    // 遍历可访问的路由，找到匹配的菜单项
    for (const menuRoute of accessibleRoutes.value) {
      // 检查是否是当前路由的父路由
      if (currentPath.startsWith(menuRoute.path) || menuRoute.path === "/") {
        // 如果有子路由，检查是否匹配子路由
        if (menuRoute.children && menuRoute.children.length > 0) {
          for (const child of menuRoute.children) {
            // 跳过隐藏的子路由
            if (child.meta?.hidden) continue;

            const childPath = `${menuRoute.path === "/" ? "" : menuRoute.path}/${child.path}`;
            // 处理动态路由（页面列表）
            if (child.path.includes(":")) {
              const pattern = childPath.replace(/:[^/]+/g, "[^/]+");
              const regex = new RegExp(`^${pattern}$`);
              if (regex.test(currentPath)) {
                // 对于动态路由，返回完整的匹配路径
                return currentPath;
              }
            } else {
              // 精确匹配或路径前缀匹配
              if (currentPath === childPath || currentPath.startsWith(childPath + "/")) {
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

  return { isUserRole, accessibleRoutes, activeMenu };
}