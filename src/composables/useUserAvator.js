// useUserAvator
// 底部用户卡三点菜单：开合、点击外部/Esc 关闭、登出
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global.js";
import { resetRoutes } from "@/utils/index";

/**
 * 用户卡三点菜单逻辑
 * - 菜单开合 / 点击外部或 Esc 关闭
 * - 登出：清空用户 + 重置路由 + 跳转登录页
 * - goTo：关闭菜单后跳转指定路由
 */
export function useUserAvator() {
  const router = useRouter();
  const { user, clearUser } = useGlobalStore();

  const userCardRef = ref(null);
  const menuOpen = ref(false);

  function toggleMenu() {
    menuOpen.value = !menuOpen.value;
  }

  function closeMenu() {
    menuOpen.value = false;
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

  onMounted(() => {
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeydown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onKeydown);
  });

  async function logout() {
    await clearUser();
    await resetRoutes();

    await nextTick();
    router.replace("/login").catch(() => {
      // 如果路由跳转失败，使用传统方式
      window.location.hash = "#/login";
    });
  }

  function goTo(path) {
    closeMenu();
    router.push(path);
  }

  return { user, userCardRef, menuOpen, toggleMenu, closeMenu, logout, goTo };
}