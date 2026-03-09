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
          <!-- 翻译工具 -->
          <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-600">
            <div class="flex items-center gap-2">
              <el-icon class="text-gray-500 dark:text-gray-400"><Sort /></el-icon>
              <span class="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">从:</span>
              <el-select 
                v-model="translateConfig.sourceLanguage" 
                placeholder="源语言" 
                size="default"
                style="width: 120px"
              >
                <el-option label="中文" value="zh" />
                <el-option label="俄语" value="ru" />
                <el-option label="法语" value="fr" />
                <el-option label="英语" value="en" />
                <el-option label="日语" value="ja" />
                <el-option label="韩语" value="ko" />
                <el-option label="阿拉伯语" value="ar" />
              </el-select>
            </div>
            <el-icon class="text-gray-400 dark:text-gray-500"><ArrowRight /></el-icon>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">到:</span>
              <el-select 
                v-model="translateConfig.targetLanguage" 
                placeholder="目标语言" 
                size="default"
                style="width: 120px"
              >
                <el-option label="中文" value="zh" />
                <el-option label="俄语" value="ru" />
                <el-option label="法语" value="fr" />
                <el-option label="英语" value="en" />
                <el-option label="日语" value="ja" />
                <el-option label="韩语" value="ko" />
                <el-option label="阿拉伯语" value="ar" />
              </el-select>
            </div>
            <el-button 
              type="success" 
              :icon="Sort"
              @click="toggleTranslate"
              size="default"
            >
              一键翻译
            </el-button>
          </div>
          
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
import { ref, reactive, onMounted, watch, nextTick, provide } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { updatePageById, translate } from "@/apis/index";
import ModuleMode from "@/components/ModuleMode.vue";
import PageMode from "@/components/PageMode.vue";
import { useRoute, useRouter } from "vue-router";
import {
  Document, House, ArrowRight, Sort, Check
} from '@element-plus/icons-vue';

const router = useRouter();

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
  
  // 收集需要翻译的元素，并记录原始文本用于后续匹配
  const elementsToTranslate = [];
  const translationMap = new Map(); // 原始文本 -> 翻译文本的映射
  
  // 获取所有 input 元素
  const inputs = document.querySelectorAll('.field-item input[type="text"]');
  inputs.forEach((input, index) => {
    if (input.value && input.value.trim()) {
      elementsToTranslate.push({
        element: input,
        text: input.value.trim(),
        originalText: input.value.trim(),
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
        originalText: textarea.value.trim(),
        type: 'textarea',
        index: index
      });
    }
  });
  
  // 获取所有 class 为 ql-editor 的元素
  const qlEditors = document.querySelectorAll('.field-item .ql-editor');
  qlEditors.forEach((editor, index) => {
    // 对于富文本编辑器，获取HTML内容
    const htmlContent = editor.innerHTML || '';
    const textContent = editor.innerText || editor.textContent || '';
    if (textContent.trim()) {
      elementsToTranslate.push({
        element: editor,
        text: textContent.trim(),
        originalText: htmlContent, // 保存原始HTML
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
          
          // 记录翻译映射
          translationMap.set(item.originalText, translatedText);
          
          // 将翻译结果同步回页面
          if (item.type === 'input' || item.type === 'textarea') {
            item.element.value = translatedText;
            // 使用更强的方式触发 Vue 更新
            const inputEvent = new InputEvent('input', { 
              bubbles: true, 
              cancelable: true,
              composed: true
            });
            item.element.dispatchEvent(inputEvent);
            
            // 也触发 change 事件
            const changeEvent = new Event('change', { bubbles: true });
            item.element.dispatchEvent(changeEvent);
            
          } else if (item.type === 'ql-editor') {
            // 对于 Quill 编辑器，需要通过 Quill 实例来更新
            const quillContainer = item.element.parentElement;
            if (quillContainer && quillContainer.__quill) {
              // 如果能访问到 Quill 实例
              const quill = quillContainer.__quill;
              quill.root.innerHTML = translatedText;
              // 手动触发 text-change 事件
              quill.emitter.emit('text-change');
            } else {
              // 否则直接更新 innerHTML
              const htmlText = translatedText.replace(/\n/g, '<br>');
              item.element.innerHTML = htmlText;
              
              // 触发多个事件以确保更新
              item.element.dispatchEvent(new Event('text-change', { bubbles: true }));
              item.element.dispatchEvent(new Event('input', { bubbles: true }));
              item.element.dispatchEvent(new Event('blur', { bubbles: true }));
            }
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
    
    // 翻译完成后，强制同步DOM值到Vue数据
    await syncDomToVueData(translationMap);
    
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

// 同步DOM值到Vue数据
async function syncDomToVueData(translationMap) {
  if (!PageModeNode.value || !PageModeNode.value.state.pageData) {
    return;
  }
  
  await nextTick();
  
  // 递归更新 pageData，使用翻译映射来精确匹配
  updateDataWithTranslation(PageModeNode.value.state.pageData, translationMap);
}

// 递归更新嵌套数据，使用翻译映射进行精确匹配
function updateDataWithTranslation(data, translationMap) {
  if (!Array.isArray(data)) return;
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    
    // 更新当前节点的 settings
    if (item.settings) {
      // 检查 title 字段
      if (item.settings.title && translationMap.has(item.settings.title)) {
        item.settings.title = translationMap.get(item.settings.title);
      }
      
      // 检查 editor 字段
      if (item.settings.editor && translationMap.has(item.settings.editor)) {
        item.settings.editor = translationMap.get(item.settings.editor);
      }
      
      // 可以添加更多字段的检查
      if (item.settings.content && translationMap.has(item.settings.content)) {
        item.settings.content = translationMap.get(item.settings.content);
      }
    }
    
    // 递归处理子元素
    if (item.elements && item.elements.length > 0) {
      updateDataWithTranslation(item.elements, translationMap);
    }
  }
}

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
    console.error('保存错误:', error);
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