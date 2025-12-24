<template>
  <main class="flex-1 flex flex-col">
    <header
      class="bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm sticky top-0 z-10 px-6 lg:px-8 border-b border-border-light dark:border-border-dark h-[6.25rem] flex items-center"
    >
      <div class="flex justify-between items-center w-full">
        <div class="flex flex-col gap-1">
          <p class="text-xl font-semibold text-gray-900 dark:text-white">
            客户详情
          </p>
          <div class="flex flex-wrap gap-1.5 items-center">
            <a
              class="text-gray-500 dark:text-gray-400 text-sm font-medium leading-normal hover:text-primary"
              href="#"
              >客户管理</a
            >
            <span
              class="material-symbols-outlined text-gray-400 dark:text-gray-500 text-base"
              style="font-size: 16px"
              >></span
            >
            <span
              class="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal"
              >{{ user.nickname }}</span
            >
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <div class="flex items-center gap-2">
            <span>从:</span>
            <el-select v-model="translateConfig.sourceLanguage" placeholder="请选择源语言" style="width: 120px">
              <el-option label="中文" value="zh" />
              <el-option label="英语" value="en" />
              <el-option label="日语" value="ja" />
              <el-option label="韩语" value="ko" />
            </el-select>
          </div>
          <div class="flex items-center gap-2">
            <span>到:</span>
            <el-select v-model="translateConfig.targetLanguage" placeholder="请选择目标语言" style="width: 120px">
              <el-option label="中文" value="zh" />
              <el-option label="英语" value="en" />
              <el-option label="日语" value="ja" />
              <el-option label="韩语" value="ko" />
            </el-select>
          </div>
          <el-button type="success" @click="toggleTranslate">一键翻译</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </div>
    </header>
    <!-- 页面数据 -->
    <div v-if="pageData?.id">
      <template v-if="user.mode === 1">
        <TW :pageId="pageData.id" :is-translate="isTranslating" :source-language="translateConfig.sourceLanguage" :target-language="translateConfig.targetLanguage" />
      </template>
      <template v-else>
        <PageMode ref="PageModeNode" :pageId="pageData.id" :is-translate="isTranslating" :source-language="translateConfig.sourceLanguage" :target-language="translateConfig.targetLanguage" />
      </template>
    </div>
  </main>
</template>
<script setup>
import { ref, reactive, onMounted, watch, nextTick } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { updatePageById, translate } from "@/apis/index";
import TW from "@/components/TW.vue";
import PageMode from "@/components/PageMode.vue";
import { useRoute } from "vue-router";

let pageData = ref(null);
const PageModeNode = ref(null);
const { user } = useGlobalStore();
const route = useRoute();

// 翻译配置
const translateConfig = reactive({
  sourceLanguage: 'zh',
  targetLanguage: 'en'
});

// 是否正在翻译状态
const isTranslating = ref(false);

// 切换翻译状态
function toggleTranslate() {
  if (translateConfig.sourceLanguage === translateConfig.targetLanguage) {
    ElMessage({
      message: "源语言和目标语言不能相同",
      type: "warning",
    });
    return;
  }
  isTranslating.value = true;
}

async function handleSave() {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  try {
    console.log(PageModeNode.value.state.pageData);
    return;
    const res = await updatePageById({
      meta_value: JSON.stringify(PageModeNode.value.state.pageData),
      post_id: Number(PageModeNode.value.state.pageId),
    });
    
    nextTick(() => {
      loadingInstance.close();
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
    ElMessage({
      message: "保存失败",
      type: "error",
    });
    nextTick(() => {
      loadingInstance.close();
    });
  }
}

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId) {
      pageData.value = JSON.parse(user.page_list).find(
        (item) => item.id === route.params.id
      );
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