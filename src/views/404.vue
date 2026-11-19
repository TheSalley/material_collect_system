<template>
  <div class="w-full h-full min-h-screen bg-surface-hover flex items-center justify-center relative">
    <div class="text-center px-6">
      <div class="mb-8">
        <el-icon class="text-9xl text-border-dark mb-4">
          <DocumentDelete />
        </el-icon>
        <h1 class="text-6xl font-bold text-text-primary mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-text-secondary mb-2">页面未找到</h2>
        <p class="text-text-muted mb-8">
          抱歉，您访问的页面不存在或已被移除
        </p>
      </div>
      <div class="flex gap-4 justify-center">
        <el-button 
          type="primary" 
          size="large"
          :icon="ArrowLeft"
          @click="goHome"
        >
          返回首页
        </el-button>
        <el-button 
          size="large"
          :icon="Refresh"
          @click="router.go(-1)"
        >
          返回上一页
        </el-button>
      </div>
    </div>

    <div class="absolute bottom-6 left-0 right-0 text-center text-xs text-text-muted">
      版本号：{{ APP_VERSION }}
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/stores/global';
import { ArrowLeft, Refresh, DocumentDelete } from '@element-plus/icons-vue';
import { APP_VERSION } from '@/config/index';
import { normalizeRole } from '@/router/permissions.js';

const router = useRouter();
const globalStore = useGlobalStore();

const goHome = () => {
  const role = normalizeRole(globalStore.user?.role);
  if (role === "admin") {
    router.push({ name: "AdminList", replace: true });
  } else {
    router.push({ name: "CustomerHome", replace: true });
  }
};
</script>
