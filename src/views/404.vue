<template>
  <div class="w-full h-full min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
    <div class="text-center px-6">
      <div class="mb-8">
        <el-icon class="text-9xl text-gray-300 dark:text-gray-600 mb-4">
          <DocumentDelete />
        </el-icon>
        <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">页面未找到</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">
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
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/stores/global';
import { ArrowLeft, Refresh, DocumentDelete } from '@element-plus/icons-vue';

const router = useRouter();
const globalStore = useGlobalStore();

const goHome = () => {
  const role = (globalStore.user?.role ?? "user").toString().toLowerCase();
  if (role === "admin" || role === "administrator") {
    router.push({ name: "AdminList", replace: true });
  } else {
    router.push({ name: "CustomerHome", replace: true });
  }
};
</script>
