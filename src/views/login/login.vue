<template>
  <div
    class="login-page w-full min-h-[100dvh] relative overflow-hidden bg-[#0a0f17]"
  >
    <div class="login-scrim absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

    <div class="relative z-10 w-full min-h-[100dvh] flex items-center justify-center px-4">
      <div
        class="login-card w-full max-w-md bg-gradient-to-b from-primary/10 to-white backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12"
        :class="{ 'is-ready': ready }"
      >
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-6 login-reveal" style="--d: 120ms">
            <img src="/logo.svg" alt="Logo" class="h-16 w-auto" />
          </div>
          <h1 class="text-3xl font-bold text-text-primary mb-2 login-reveal" style="--d: 240ms">
            素材收集系统
          </h1>
          <p class="text-text-secondary text-sm login-reveal" style="--d: 360ms">
            欢迎回来，请登录您的账户
          </p>
        </div>

        <!-- 登录表单（原生元素，无 Element Plus） -->
        <form class="space-y-6 login-reveal" style="--d: 480ms" @submit.prevent="handleLogin" novalidate>
          <!-- 用户名 -->
          <div class="field" :class="{ 'is-error': errors.username }">
            <div class="field__control">
              <span class="field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
                </svg>
              </span>
              <input
                v-model="form.username"
                type="text"
                class="field__input"
                placeholder="请输入用户名"
                autocomplete="username"
                :disabled="loading"
                @input="errors.username = ''"
                @blur="validateField('username')"
              />
              <button
                v-if="form.username"
                type="button"
                class="field__clear"
                aria-label="清除用户名"
                :disabled="loading"
                @click="form.username = ''"
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.username" class="field__error">{{ errors.username }}</p>
          </div>

          <!-- 密码 -->
          <div class="field" :class="{ 'is-error': errors.password }">
            <div class="field__control">
              <span class="field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17 9V7a5 5 0 0 0-10 0v2H5.5A1.5 1.5 0 0 0 4 10.5v9A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 18.5 9H17ZM9 7a3 3 0 0 1 6 0v2H9V7Zm3 9.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" />
                </svg>
              </span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="field__input"
                placeholder="请输入密码"
                autocomplete="current-password"
                :disabled="loading"
                @input="errors.password = ''"
                @blur="validateField('password')"
                @keydown.enter.prevent="handleLogin"
              />
              <button
                type="button"
                class="field__toggle"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                :disabled="loading"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 5c-5 0-9 4-10 7 1 3 5 7 10 7s9-4 10-7c-1-3-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M2 4.27 4.28 2 22 19.72 19.73 22l-3.1-3.1A11.6 11.6 0 0 1 12 19C7 19 3 15 2 12a13.3 13.3 0 0 1 3.36-4.6L2 4.27ZM12 5c5 0 9 4 10 7a12.9 12.9 0 0 1-2.9 4L15.7 12.6A4 4 0 0 0 11.4 8.3L9.1 6.05A11.7 11.7 0 0 1 12 5Z" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="field__error">{{ errors.password }}</p>
          </div>

          <!-- 内联错误条 -->
          <transition name="fade">
            <div v-if="errorMsg" class="alert-error" role="alert">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                <path d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V8h2v5Z" />
              </svg>
              <span>{{ errorMsg }}</span>
            </div>
          </transition>

          <!-- 按钮组 -->
          <div class="w-full flex gap-3">
            <button type="submit" class="btn btn--primary flex-1" :disabled="loading">
              <span v-if="!loading" class="btn__inner">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                登录
              </span>
              <span v-else class="btn__inner">
                <span class="spinner" aria-hidden="true"></span>登录中…
              </span>
            </button>
            <button type="button" class="btn btn--default" :disabled="loading" @click="resetForm">
              <span class="btn__inner">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4v6h6M20 20v-6h-6M20 9a8 8 0 0 0-14.9-2M4 15a8 8 0 0 0 14.9 2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                重置
              </span>
            </button>
          </div>
        </form>

        <!-- 底部提示 -->
        <div class="mt-6 text-center login-reveal" style="--d: 720ms">
          <p class="text-xs text-text-muted">
            请使用您的账户凭据登录系统
          </p>
        </div>
      </div>
    </div>

    <div
      class="absolute bottom-6 left-0 right-0 z-10 text-center text-xs text-text-inverse/70"
    >
      版本号：{{ APP_VERSION }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { login } from "@/apis/index.js";
import { refreshUserSitePageListWithPermissions } from "@/utils/userSitePages.js";
import { useRouter, useRoute } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import { normalizeRole } from "@/router/permissions.js";
import { APP_VERSION } from "@/config/index";

const router = useRouter();
const route = useRoute();
const globalStore = useGlobalStore();

const form = ref({ username: "", password: "" });
const errors = ref({ username: "", password: "" });
const errorMsg = ref("");
const showPassword = ref(false);
const loading = ref(false);
const ready = ref(false);

// 首帧后再挂 ready，触发入场动效
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ready.value = true;
    });
  });
});

function validateField(field) {
  const val = String(form.value[field] || "");
  if (field === "username") {
    if (!val) return (errors.value.username = "请输入用户名");
    if (val.length < 3) return (errors.value.username = "用户名至少3个字符");
    errors.value.username = "";
  }
  if (field === "password") {
    if (!val) return (errors.value.password = "请输入密码");
    if (val.length < 3) return (errors.value.password = "密码至少3位");
    errors.value.password = "";
  }
}

function validateAll() {
  validateField("username");
  validateField("password");
  return !errors.value.username && !errors.value.password;
}

const handleLogin = async () => {
  errorMsg.value = "";
  if (!validateAll()) return;

  loading.value = true;
  try {
    const res = await login({
      username: form.value.username,
      password: form.value.password,
    });
    if (res.code === 0) {
      globalStore.user = res.data.user;
      globalStore.access_token = res.data.access_token;
      globalStore.isLogin = true;
      globalStore.sites = res.data.sites || [];
      if (globalStore.sites.length > 0) {
        globalStore.setWebsiteInfo(globalStore.sites[0]);
      } else {
        globalStore.setWebsiteInfo(null);
      }

      const role = normalizeRole(res.data.user?.role);
      if (role === "user" && globalStore.websiteInfo?.site_id) {
        await refreshUserSitePageListWithPermissions(globalStore);
      }

      const defaultPath = role === "admin" ? "/admin/dashboard" : "/instruction";
      const redirectPath = route.query.redirect;
      const isValidRedirect =
        typeof redirectPath === "string" &&
        redirectPath &&
        redirectPath !== "/" &&
        redirectPath !== "/login";
      const targetPath = isValidRedirect ? redirectPath : defaultPath;
      router.replace(targetPath);
    } else {
      errorMsg.value = res.message || "登录失败，请检查账号或密码";
    }
  } catch (e) {
    errorMsg.value = e?.message || "网络异常，请稍后重试";
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value.username = "";
  form.value.password = "";
  errors.value = { username: "", password: "" };
  errorMsg.value = "";
};
</script>

<style scoped>
/* 原生输入框：外观贴近原 Element Plus，白卡内的浅色风格 */
.field__control {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border-radius: var(--radius-field, 8px);
  background: #fff;
  box-shadow: 0 0 0 1px var(--color-border) inset;
  transition: box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.field__control:hover {
  box-shadow: 0 0 0 1px var(--color-border-dark) inset;
}
.field__control:focus-within {
  box-shadow: 0 0 0 1.5px var(--color-primary) inset;
}
.field.is-error .field__control {
  box-shadow: 0 0 0 1.5px var(--color-danger) inset;
}
.field__icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-text-muted);
}
.field__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 14px;
  font-family: inherit;
}
.field__input::placeholder {
  color: var(--color-text-muted);
}
.field__clear,
.field__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: 50%;
  transition: color 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.field__clear:hover,
.field__toggle:hover {
  color: var(--color-text-secondary);
}
.field__clear:disabled,
.field__toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.field {
  position: relative;
}
.field__error {
  position: absolute;
  left: 2px;
  bottom: -18px;
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  color: var(--color-danger);
}

/* 内联错误条 */
.alert-error {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  border-radius: var(--radius-field, 8px);
  font-size: 13px;
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.28);
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  border-radius: var(--radius-button, 6px);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.16s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.btn__inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn--primary {
  color: #fff;
  background: var(--color-primary);
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.btn--default {
  color: var(--color-text-secondary);
  background: #fff;
  border-color: var(--color-border);
}
.btn--default:hover:not(:disabled) {
  color: var(--color-primary);
  border-color: var(--color-primary-light);
  background: var(--color-primary-light);
}
.btn:active:not(:disabled) {
  transform: scale(0.98);
}
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ============================================================
   电影感动效（纯 CSS，保持原布局不变）
   ============================================================ */

/* 背景缓慢推拉：把背景图当镜头，缓慢拉近 + 轻微平移 */
.login-page {
  background-size: cover;
}
.login-page::before {
  content: "";
  position: absolute;
  inset: -6%;
  z-index: 0;
  background-image: url("/login-bg.webp");
  background-size: cover;
  background-position: center;
  transform: scale(1.06);
  animation: lb-kenburns 32s ease-in-out infinite alternate;
  will-change: transform;
}
/* 原内联背景保留在上层会遮住伪元素，这里让遮罩层之上再做氛围 */
.login-scrim {
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(6, 10, 16, 0.28) 0%, rgba(6, 10, 16, 0.12) 45%, rgba(6, 10, 16, 0.5) 100%),
    rgba(0, 0, 0, 0.18);
}

@keyframes lb-kenburns {
  0%   { transform: scale(1.06) translate(0, 0); }
  100% { transform: scale(1.14) translate(-1.6%, -1.4%); }
}

/* 卡片入场：淡入 + 上浮 + 轻缩放 */
.login-card {
  opacity: 0;
  transform: translateY(24px) scale(0.985);
  transition:
    opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.85s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.login-card.is-ready {
  opacity: 1;
  transform: translateY(0) scale(1);
}
/* 卡片微弱呼吸光晕，让它"有生命" */
.login-card.is-ready {
  animation: lb-card-glow 6s ease-in-out 1s infinite alternate;
}
@keyframes lb-card-glow {
  0%   { box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5); }
  100% { box-shadow: 0 28px 70px -12px rgba(20, 60, 140, 0.42); }
}

/* 元素错时入场：上浮 + 淡入 */
.login-reveal {
  opacity: 0;
  transform: translateY(14px);
}
.login-card.is-ready .login-reveal {
  animation: lb-reveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--d, 0ms);
}
@keyframes lb-reveal {
  to { opacity: 1; transform: translateY(0); }
}

/* 输入框聚焦：光带从中间向两侧扫出的电影感 */
.login-card .field__control {
  position: relative;
  overflow: hidden;
}
.login-card .field__control .field__input,
.login-card .field__control .field__icon,
.login-card .field__control .field__clear,
.login-card .field__control .field__toggle {
  position: relative;
  z-index: 1;
}

/* 登录按钮：微弱流光扫过（悬停触发一次） */
.btn--primary {
  position: relative;
  overflow: hidden;
}
.btn--primary::after {
  content: "";
  position: absolute;
  top: 0;
  left: -60%;
  width: 45%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-16deg);
  pointer-events: none;
  opacity: 0;
}
.btn--primary:hover:not(:disabled)::after {
  animation: lb-shine 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes lb-shine {
  0%   { left: -60%; opacity: 0; }
  25%  { opacity: 1; }
  100% { left: 130%; opacity: 0; }
}

/* 无障碍：减少动效时全部静止 */
@media (prefers-reduced-motion: reduce) {
  .login-page::before {
    animation: none !important;
    transform: scale(1.06);
  }
  .login-card,
  .login-card.is-ready {
    opacity: 1;
    transform: none;
    transition: none;
    animation: none !important;
  }
  .login-reveal,
  .login-card.is-ready .login-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
  }
  .btn--primary::after {
    display: none;
  }
  .btn,
  .field__control,
  .field__clear,
  .field__toggle,
  .fade-enter-active,
  .fade-leave-active,
  .spinner {
    transition: none;
    animation: none;
  }
  .btn:active:not(:disabled) {
    transform: none;
  }
}
</style>
