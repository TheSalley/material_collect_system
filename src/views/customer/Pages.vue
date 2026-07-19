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
          <!-- 翻译工具（仅 admin 可见） -->
          <div
            v-if="isAdmin"
            class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-600"
          >
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
              :loading="isTranslating"
              @click="toggleTranslate"
              size="default"
            >
              一键翻译
            </el-button>
          </div>

          <!-- 保存尺寸按钮（仅 admin 可见） -->
          <el-button
            v-if="pageData?.id && isAdmin"
            @click="handleSaveSizes"
            :loading="isSavingSizes"
            size="large"
          >
            保存尺寸
          </el-button>
          <el-button
            v-if="pageData?.id && isAdmin"
            :icon="PictureFilled"
            @click="goToDemoList"
            size="large"
          >
            Demo 截图尺寸
          </el-button>
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

    <!-- 页面数据：模块模式沿用整区滚动；页面编辑模式由 PageMode 内左右列各自滚动 -->
    <div
      class="flex-1 min-h-0 overflow-hidden flex flex-col"
      v-if="pageData?.id"
    >
      <!-- <template v-if="websiteInfo.mode === 1"> -->
        <ModuleMode ref="ModuleModeNode" :pageId="pageData.id" />
      <!-- </template> -->
      <!-- <template v-else> -->
        <!-- <PageMode ref="PageModeNode" :pageId="pageData.id" /> -->
      <!-- </template> -->
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
import { computed, reactive, ref, watch, nextTick, provide } from "vue";
import { useGlobalStore } from "@/stores/global.js";
import { updatePageById, translate, getBlacklistConfig } from "@/apis/index";
import { ElLoading, ElMessage } from "element-plus";
import ModuleMode from "@/components/ModuleMode.vue";
import { useRoute, useRouter } from "vue-router";
import {
  Document, House, ArrowRight, Check, Sort, PictureFilled
} from '@element-plus/icons-vue';

const router = useRouter();

let pageData = ref(null);
const ModuleModeNode = ref(null);
const { user, websiteInfo, isAdmin } = useGlobalStore();
const route = useRoute();

// 翻译配置（旧版：通过 provide 给子组件/字段用）
const translateConfig = reactive({
  sourceLanguage: "en",
  targetLanguage: "fr",
});
const isTranslating = ref(false);
const isSavingSizes = ref(false);
provide("translateConfig", translateConfig);
provide("isTranslate", isTranslating);

const blacklist = ref([]);
provide("blacklist", blacklist);

const currentDemo = computed(() => {
  return websiteInfo?.demo_site || websiteInfo?.demo || "";
});

async function fetchBlacklist(demo) {
  const demoName = typeof demo === "string" ? demo.trim() : "";
  if (!demoName) {
    blacklist.value = [];
    return;
  }

  try {
    const res = await getBlacklistConfig(demoName);
    blacklist.value = res.code === 0 && Array.isArray(res.data?.blacklist)
      ? res.data.blacklist
      : [];
  } catch {
    blacklist.value = [];
  }
}

watch(
  currentDemo,
  (demo) => {
    fetchBlacklist(demo);
  },
  { immediate: true },
);

function sameLang() {
  return translateConfig.sourceLanguage && translateConfig.sourceLanguage === translateConfig.targetLanguage;
}

// 切换翻译状态（旧版：扫描 DOM 的 __field-item 输入框/文本域/Quill）
async function toggleTranslate() {
  if (sameLang()) {
    ElMessage({
      message: "源语言和目标语言不能相同",
      type: "warning",
    });
    return;
  }

  // 等待 DOM 更新完成
  await nextTick();

  const elementsToTranslate = [];
  const translationMap = new Map(); // 原始文本/HTML -> 翻译文本

  // 获取所有 input 元素
  const inputs = document.querySelectorAll('.__field-item input[type="text"]');
  inputs.forEach((input, index) => {
    if (input.value && input.value.trim()) {
      elementsToTranslate.push({
        element: input,
        text: input.value.trim(),
        originalText: input.value.trim(),
        type: 'input',
        index,
      });
    }
  });

  // 获取所有 textarea 元素
  const textareas = document.querySelectorAll('.__field-item textarea');
  textareas.forEach((textarea, index) => {
    if (textarea.value && textarea.value.trim()) {
      elementsToTranslate.push({
        element: textarea,
        text: textarea.value.trim(),
        originalText: textarea.value.trim(),
        type: 'textarea',
        index,
      });
    }
  });

  // 获取所有 class 为 ql-editor 的元素
  const qlEditors = document.querySelectorAll('.__field-item .ql-editor');
  qlEditors.forEach((editor, index) => {
    const htmlContent = editor.innerHTML || '';
    const textContent = editor.innerText || editor.textContent || '';
    if (textContent.trim()) {
      elementsToTranslate.push({
        element: editor,
        text: textContent.trim(),         // 用纯文本去翻译
        originalText: htmlContent,        // 用原 HTML 做映射 key
        type: 'ql-editor',
        index,
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

  const loadingInstance = ElLoading.service({
    fullscreen: true,
    text: `正在翻译 0/${elementsToTranslate.length} 个元素...`,
  });

  let successCount = 0;
  let failCount = 0;

  try {
    for (let i = 0; i < elementsToTranslate.length; i++) {
      const item = elementsToTranslate[i];
      loadingInstance.setText(`正在翻译 ${i + 1}/${elementsToTranslate.length} 个元素...`);

      try {
        const payload = {
          text: item.text,
          target_language: translateConfig.targetLanguage,
          source_language: translateConfig.sourceLanguage,
          format_type: item.type === "ql-editor" ? "text" : "text",
        };
        const translateRes = await translate(payload);

        if (translateRes?.code === 0 && translateRes?.data?.translated_text) {
          const translatedText = translateRes.data.translated_text;
          translationMap.set(item.originalText, translatedText);

          // 写回 DOM 并触发 Vue 更新
          if (item.type === 'input' || item.type === 'textarea') {
            item.element.value = translatedText;
            item.element.dispatchEvent(new InputEvent('input', {
              bubbles: true,
              cancelable: true,
              composed: true,
            }));
            item.element.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (item.type === 'ql-editor') {
            const htmlText = translatedText.replace(/\n/g, '<br>');
            item.element.innerHTML = htmlText;
            item.element.dispatchEvent(new Event('input', { bubbles: true }));
            item.element.dispatchEvent(new Event('blur', { bubbles: true }));
          }

          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`翻译错误 (元素 ${i + 1}):`, error);
        failCount++;
      }

      if (i < elementsToTranslate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 翻译完成后，强制同步映射到 pageData（确保保存生效）
    await syncDomToVueData(translationMap);

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

// 同步 DOM 翻译结果到 Vue 的 pageData（旧版：用 translationMap 精确替换）
async function syncDomToVueData(translationMap) {
  const targetNode = ModuleModeNode.value;
  if (!targetNode?.state?.pageData && !targetNode?.state?.originData) return;
  await nextTick();
  const data = targetNode.state.pageData ?? targetNode.state.originData;
  updateDataWithTranslation(data, translationMap);
}

function updateDataWithTranslation(data, translationMap) {
  if (!Array.isArray(data)) return;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.settings) {
      if (item.settings.title && translationMap.has(item.settings.title)) {
        item.settings.title = translationMap.get(item.settings.title);
      }
      if (item.settings.editor && translationMap.has(item.settings.editor)) {
        item.settings.editor = translationMap.get(item.settings.editor);
      }
      if (item.settings.content && translationMap.has(item.settings.content)) {
        item.settings.content = translationMap.get(item.settings.content);
      }
    }
    if (item.elements && item.elements.length > 0) {
      updateDataWithTranslation(item.elements, translationMap);
    }
  }
}

async function handleSaveSizes() {
  const fn = ModuleModeNode.value?.saveSectionSizes;
  if (typeof fn !== "function") {
    ElMessage({ message: "当前页面不支持保存尺寸", type: "warning" });
    return;
  }
  isSavingSizes.value = true;
  try {
    await fn();
  } finally {
    isSavingSizes.value = false;
  }
}

function goToDemoList() {
  const siteId = websiteInfo?.site_id;
  const demoName = currentDemo.value;

  if (!siteId) {
    ElMessage({ message: "缂哄皯绔欑偣 ID锛屾棤娉曟墦寮€ Demo 鍒楄〃", type: "warning" });
    return;
  }

  if (!demoName) {
    ElMessage({ message: "褰撳墠绔欑偣鏈厤缃?Demo 鍚嶇О", type: "warning" });
    return;
  }

  router.push({
    name: "AdminDemoList",
    query: {
      site_id: String(siteId),
      demo: demoName,
      site_name: websiteInfo?.site_name || "",
      back_page_id: String(route.params.id || ""),
    },
  });
}

async function handleSave() {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  try {
    // ModuleModeNode 在模板中实际挂载（PageMode 被注释），优先使用
    const targetNode = ModuleModeNode.value;
    const finalData = targetNode?.getFinalData?.();

    if (!finalData) {
      ElMessage({ message: "没有数据可保存", type: "warning" });
      loadingInstance.close();
      return;
    }

    const res = await updatePageById({
      site_id: websiteInfo.site_id,
      id: String(targetNode.state.moduleId),
      data: finalData,
    });

    console.log('保存结果:', res);
    
    if (res.code === 0) {
      ElMessage({ message: res.message || "保存成功", type: "success" });
    } else {
      ElMessage({ message: res.message || "保存失败", type: "error" });
    }
  } catch (error) {
    console.error('保存错误:', error);
    ElMessage({ message: "保存失败", type: "error" });
  } finally {
    nextTick(() => { loadingInstance.close(); });
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
