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
              >{{ websiteInfo.nickname }}</span
            >
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <div class="flex items-center gap-2">
            <span>从:</span>
            <el-select v-model="translateConfig.sourceLanguage" placeholder="请选择源语言" style="width: 120px">
              <el-option label="中文" value="zh" />
              <el-option label="法语" value="fr" />
              <el-option label="英语" value="en" />
              <el-option label="日语" value="ja" />
              <el-option label="韩语" value="ko" />
            </el-select>
          </div>
          <div class="flex items-center gap-2">
            <span>到:</span>
            <el-select v-model="translateConfig.targetLanguage" placeholder="请选择目标语言" style="width: 120px">
              <el-option label="中文" value="zh" />
              <el-option label="法语" value="fr" />
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
      <template v-if="websiteInfo.mode === 1">
        <ModuleMode :pageId="pageData.id" />
      </template>
      <template v-else>
        <PageMode ref="PageModeNode" :pageId="pageData.id" />
      </template>
    </div>
  </main>
</template>
<script setup>
import { ref, reactive, onMounted, watch, nextTick, provide } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { updatePageById, translate } from "@/apis/index";
import ModuleMode from "@/components/ModuleMode.vue";
import PageMode from "@/components/PageMode.vue";
import { useRoute } from "vue-router";

let pageData = ref(null);
const PageModeNode = ref(null);
const { user, websiteInfo } = useGlobalStore();
const route = useRoute();

// 翻译配置
const translateConfig = reactive({
  sourceLanguage: 'en',
  targetLanguage: 'fr'
});

// 是否正在翻译状态
const isTranslating = ref(false);

provide('translateConfig', translateConfig);
provide('isTranslate', isTranslating);

// 切换翻译状态
async function toggleTranslate() {
  if (translateConfig.sourceLanguage === translateConfig.targetLanguage) {
    ElMessage({
      message: "源语言和目标语言不能相同",
      type: "warning",
    });
    return;
  }
  
  // 等待 DOM 更新完成
  await nextTick();
  
  // 收集需要翻译的元素
  const elementsToTranslate = [];
  
  // 获取所有 input 元素
  const inputs = document.querySelectorAll('.field-item input[type="text"]');
  inputs.forEach((input, index) => {
    if (input.value && input.value.trim()) {
      elementsToTranslate.push({
        element: input,
        text: input.value.trim(),
        type: 'input',
        index: index
      });
    }
  });
  
  // 获取所有 textarea 元素
  const textareas = document.querySelectorAll('.field-item textarea');
  textareas.forEach((textarea, index) => {
    if (textarea.value && textarea.value.trim()) {
      elementsToTranslate.push({
        element: textarea,
        text: textarea.value.trim(),
        type: 'textarea',
        index: index
      });
    }
  });
  
  // 获取所有 class 为 ql-editor 的元素
  const qlEditors = document.querySelectorAll('.field-item .ql-editor');
  qlEditors.forEach((editor, index) => {
    const text = editor.innerText || editor.textContent || '';
    if (text.trim()) {
      elementsToTranslate.push({
        element: editor,
        text: text.trim(),
        type: 'ql-editor',
        index: index
      });
    }
  });
  
  if (elementsToTranslate.length === 0) {
    ElMessage({
      message: "未找到需要翻译的内容",
      type: "warning",
    });
    return;
  }
  
  // 显示加载提示
  const loadingInstance = ElLoading.service({ 
    fullscreen: true,
    text: `正在翻译 0/${elementsToTranslate.length} 个元素...`
  });
  
  let successCount = 0;
  let failCount = 0;
  
  try {
    // 逐个翻译每个元素
    for (let i = 0; i < elementsToTranslate.length; i++) {
      const item = elementsToTranslate[i];
      
      // 更新加载提示
      loadingInstance.setText(`正在翻译 ${i + 1}/${elementsToTranslate.length} 个元素...`);
      
      try {
        // 单独调用翻译接口
        const translateRes = await translate({
          sourceText: item.text,
          sourceLanguage: translateConfig.sourceLanguage,
          targetLanguage: translateConfig.targetLanguage
        });
        
        if (translateRes.code === 0 && translateRes.data && translateRes.data.translatedText) {
          const translatedText = translateRes.data.translatedText;
          
          // 将翻译结果同步回页面
          if (item.type === 'input') {
            item.element.value = translatedText;
            // 触发 input 事件，确保 Vue 响应式更新
            item.element.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (item.type === 'textarea') {
            item.element.value = translatedText;
            // 触发 input 事件，确保 Vue 响应式更新
            item.element.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (item.type === 'ql-editor') {
            // 对于 Quill 编辑器，设置 innerHTML 并触发相应事件
            // 将纯文本转换为 HTML（保留换行）
            const htmlText = translatedText.replace(/\n/g, '<br>');
            item.element.innerHTML = htmlText;
            // 触发 Quill 的 text-change 事件
            const textChangeEvent = new Event('text-change', { bubbles: true });
            item.element.dispatchEvent(textChangeEvent);
            // 也触发 input 事件以确保 Vue 响应式更新
            item.element.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          successCount++;
        } else {
          console.error(`翻译失败 (元素 ${i + 1}):`, translateRes.message || '未知错误');
          failCount++;
        }
      } catch (error) {
        console.error(`翻译错误 (元素 ${i + 1}):`, error);
        failCount++;
      }
      
      // 添加小延迟，避免请求过快
      if (i < elementsToTranslate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // 显示翻译结果
    if (successCount > 0) {
      ElMessage({
        message: `成功翻译 ${successCount} 个元素${failCount > 0 ? `，失败 ${failCount} 个` : ''}`,
        type: failCount > 0 ? "warning" : "success",
      });
    } else {
      ElMessage({
        message: "翻译失败，请稍后重试",
        type: "error",
      });
    }
  } catch (error) {
    console.error('翻译过程发生错误:', error);
    ElMessage({
      message: "翻译过程中发生错误",
      type: "error",
    });
  } finally {
    loadingInstance.close();
  }
}

async function handleSave() {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  try {
    console.log(PageModeNode.value.state.pageData);
    // return;
    const res = await updatePageById({
      data: JSON.stringify(PageModeNode.value.state.pageData),
      id: Number(PageModeNode.value.state.pageId),
      site_id: websiteInfo.site_id,
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