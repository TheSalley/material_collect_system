<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面标题区域 -->
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex flex-col gap-2">
        <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
          <el-icon class="text-blue-500 text-4xl"><InfoFilled /></el-icon>
          网站信息
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">管理和查看网站基本信息</p>
      </div>
    </div>

    <!-- 主内容卡片：复用站点信息面板 -->
    <SiteInfoPanel />
  </div>
</template>

<script setup>
import { InfoFilled } from "@element-plus/icons-vue";
import SiteInfoPanel from "@/components/SiteInfoPanel.vue";
</script>
