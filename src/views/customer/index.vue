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

    <!-- 主内容卡片 -->
    <div class="flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <div class="flex-1 flex items-center justify-center p-12">
        <div class="text-center max-w-md">
          <el-icon class="text-6xl text-gray-300 dark:text-gray-600 mb-6">
            <Tools />
          </el-icon>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            功能开发中
          </h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            网站信息管理功能正在开发中，敬请期待
          </p>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <el-icon class="text-blue-500"><Lightbulb /></el-icon>
              计划功能
            </h3>
            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <el-icon class="text-green-500 mt-0.5"><CircleCheck /></el-icon>
                <span>网站图标 (Icon) 管理</span>
              </li>
              <li class="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <el-icon class="text-green-500 mt-0.5"><CircleCheck /></el-icon>
                <span>网站标题 (Title) 设置</span>
              </li>
              <li class="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <el-icon class="text-green-500 mt-0.5"><CircleCheck /></el-icon>
                <span>网站描述 (Description) 配置</span>
              </li>
              <li class="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <el-icon class="text-green-500 mt-0.5"><CircleCheck /></el-icon>
                <span>其他网站基本信息管理</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { InfoFilled, Tools, Lightbulb, CircleCheck } from '@element-plus/icons-vue';
</script>
