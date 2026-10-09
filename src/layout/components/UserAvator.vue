<script setup>
// UserAvator
// 底部用户卡 + 三点菜单：使用说明 / 设置 / 退出登录
import { useUserAvator } from "@/composables/useUserAvator";

defineProps({
  isUserRole: { type: Boolean, default: false },
});

const { user, userCardRef, menuOpen, toggleMenu, logout, goTo } = useUserAvator();
</script>

<template>
  <div ref="userCardRef" class="user-card-wrap mt-4">
    <div class="flex gap-3 p-3 border-t border-gray-200 dark:border-gray-700">
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
          @click="logout"
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
      </div>
    </transition>
  </div>
</template>

<style scoped>
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