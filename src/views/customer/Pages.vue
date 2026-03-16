<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面头部 -->
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600 px-6 py-4 flex-shrink-0">
      <div class="flex justify-between items-center w-full flex-wrap gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <el-icon class="text-blue-500 text-2xl"><Document /></el-icon>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">页面编辑</h1>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <a 
              href="#" 
              @click.prevent="router.push({ name: 'CustomerHome' })"
              class="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <el-icon><House /></el-icon>
              网站信息
            </a>
            <el-icon class="text-gray-400 dark:text-gray-500"><ArrowRight /></el-icon>
            <span class="text-gray-700 dark:text-gray-300 font-medium">{{ websiteInfo.nickname || '页面编辑' }}</span>
          </div>
        </div>
        
        <!-- 工具栏 -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- 保存按钮 -->
          <el-button 
            type="primary" 
            :icon="Check"
            @click="handleSave"
            size="large"
          >
            保存
          </el-button>
        </div>
      </div>
    </header>

    <!-- 页面数据 -->
    <div class="flex-1 overflow-auto min-h-0" v-if="pageData?.id">
      <template v-if="websiteInfo.mode === 1">
        <ModuleMode :pageId="pageData.id" />
      </template>
      <template v-else>
        <PageMode ref="PageModeNode" :pageId="pageData.id" />
      </template>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <el-icon class="text-6xl text-gray-300 dark:text-gray-600 mb-4">
          <Document />
        </el-icon>
        <p class="text-gray-500 dark:text-gray-400">请选择要编辑的页面</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, nextTick } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { updatePageById } from "@/apis/index";
import ModuleMode from "@/components/ModuleMode.vue";
import PageMode from "@/components/PageMode.vue";
import { useRoute, useRouter } from "vue-router";
import {
  Document, House, ArrowRight, Check
} from '@element-plus/icons-vue';

const router = useRouter();

let pageData = ref(null);
const PageModeNode = ref(null);
const { user, websiteInfo } = useGlobalStore();
const route = useRoute();

async function handleSave() {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  try {
    // 数据已实时同步，直接获取即可
    const finalData = PageModeNode.value.state.pageData;
    
    if (!finalData) {
      ElMessage({
        message: "没有数据可保存",
        type: "warning",
      });
      loadingInstance.close();
      return;
    }
    
    console.log('保存数据（已实时同步）:', finalData);
    
    const res = await updatePageById({
      data: JSON.stringify(finalData),
      id: Number(PageModeNode.value.state.pageId),
      site_id: websiteInfo.site_id,
    });
    if (res.code === 0) {
      ElMessage({
        message: "保存成功",
        type: "success",
      });
    } else {
      ElMessage({
        message: "保存失败",
        type: "error",
      });
    }
  } catch (error) {
    console.error('保存错误:', error);
    ElMessage({
      message: "保存失败",
      type: "error",
    });
  } finally {
    nextTick(() => {
      loadingInstance.close();
    });
  }
}

watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log('id: ', newId, oldId);
    if (newId) {
      // pageData.value = JSON.parse(websiteInfo.page_list).find(
      //   (item) => item.id === route.params.id
      // );
      pageData.value = {
        id: newId,
      }
      
    }
    if (!newId) {
      pageData.value = null;
    }
  },
  { immediate: true }
);
</script>
<style scoped>
:deep(.el-tabs__content) {
  overflow-y: auto;
}
</style>