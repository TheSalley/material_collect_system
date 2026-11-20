<script setup>
import { computed, reactive, ref, watch, nextTick, provide } from "vue";
import { storeToRefs } from "pinia";
import { useGlobalStore } from "@/stores/global.js";
import { updatePageById, translate, getBlacklistConfig, getDemoConfig } from "@/apis/index";
import { ElLoading, ElMessage } from "element-plus";
import ModuleMode from "@/components/ModuleMode.vue";
import { useRoute, useRouter } from "vue-router";
import { Document, House, ArrowRight, Check, Sort, Upload, CircleCheck, CircleClose, Picture } from "@element-plus/icons-vue";
import PageContainer from "@/components/common/PageContainer.vue";

const router = useRouter();

let pageData = ref(null);
const ModuleModeNode = ref(null);
const globalStore = useGlobalStore();
const { user, websiteInfo, isAdmin } = storeToRefs(globalStore);
const route = useRoute();

// 翻译配置（旧版：通过 provide 给子组件/字段用）
const translateConfig = reactive({
  sourceLanguage: "en",
  targetLanguage: "fr",
});
const isTranslating = ref(false);
const isSavingSizes = ref(false);
const isBindingAllDemoScreenshots = ref(false);
const isBindingAllDemoSizes = ref(false);
const isSyncingSizes = ref(false);
const sizeJsonInputRef = ref(null);

// 同步尺寸上传窗口 + 进度
const syncDialogVisible = ref(false);
const syncProgress = ref(0);
const syncStage = ref("");
const syncFileName = ref("");
const syncResult = ref(null); // { type: 'success'|'error'|'warning', message }
let syncProgressTimer = null;

function startSyncProgress() {
  syncProgress.value = 0;
  syncStage.value = "准备中…";
  clearInterval(syncProgressTimer);
  // 阶段间缓爬进度（读取/匹配/保存都是异步，用一个平滑计时器兜底）
  syncProgressTimer = setInterval(() => {
    // 45% 之前由真实阶段推进，之后缓爬到 90%，等结果返回补到 100%
    if (syncProgress.value < 90) {
      const remain = 90 - syncProgress.value;
      syncProgress.value = Math.min(90, syncProgress.value + Math.max(1, remain * 0.06));
    }
  }, 120);
}

function stopSyncProgress() {
  clearInterval(syncProgressTimer);
  syncProgressTimer = null;
}

function setSyncStage(percent, text) {
  if (percent != null) syncProgress.value = Math.max(syncProgress.value, percent);
  if (text) syncStage.value = text;
}
provide("translateConfig", translateConfig);
provide("isTranslate", isTranslating);

const blacklist = ref([]);
provide("blacklist", blacklist);

const currentDemo = computed(() => {
  return websiteInfo.value?.demo_site || "";
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

  await nextTick();

  const elementsToTranslate = [];
  const translationMap = new Map();

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

  const qlEditors = document.querySelectorAll('.__field-item .ql-editor');
  qlEditors.forEach((editor, index) => {
    const htmlContent = editor.innerHTML || '';
    const textContent = editor.innerText || editor.textContent || '';
    if (textContent.trim()) {
      elementsToTranslate.push({
        element: editor,
        text: textContent.trim(),
        originalText: htmlContent,
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

function openSortDialog() {
  ModuleModeNode.value?.openSortDialog?.();
}

// ── 同步尺寸：上传 JSON，按 moduleId 匹配填入截图目标尺寸 ──────────────────────
function triggerSyncSizes() {
  const node = ModuleModeNode.value;
  if (typeof node?.applySizesFromJson !== "function") {
    ElMessage({ message: "当前页面暂不支持同步尺寸", type: "warning" });
    return;
  }
  sizeJsonInputRef.value?.click();
}

async function onSyncSizesFileChange(event) {
  const file = event?.target?.files?.[0];
  // 复位 input，允许重复选同一个文件
  if (event?.target) event.target.value = "";
  if (!file) return;

  // 打开上传窗口，开始进度
  syncDialogVisible.value = true;
  syncFileName.value = file.name;
  syncResult.value = null;
  startSyncProgress();

  isSyncingSizes.value = true;
  try {
    setSyncStage(10, "读取文件…");
    const text = await file.text();
    setSyncStage(45, "解析 JSON…");

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      setSyncStage(100, "解析失败");
      syncResult.value = { type: "error", message: "JSON 解析失败，请检查文件格式" };
      return;
    }

    const records = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
    if (!records) {
      setSyncStage(100, "格式错误");
      syncResult.value = { type: "error", message: "JSON 格式不正确，应为对象数组" };
      return;
    }

    setSyncStage(55, "匹配板块并保存…");
    const res = await ModuleModeNode.value?.applySizesFromJson?.(records);

    if (!res) {
      setSyncStage(100, "页面未就绪");
      syncResult.value = { type: "error", message: "同步失败：页面未就绪" };
      return;
    }

    if (res.matched === 0) {
      setSyncStage(100, "没有匹配到板块");
      syncResult.value = {
        type: "warning",
        message: `共 ${res.total} 条，没有匹配到当前页面的板块（moduleId 对不上）`,
        matchedList: [],
        unmatched: res.unmatched || [],
      };
      return;
    }

    const extra = res.unmatched?.length
      ? `，${res.unmatched.length} 条板块不在当前页面已忽略`
      : "";
    const prefix = `已同步并保存 ${res.matched}/${res.total} 条尺寸${extra}`;

    if (res.saveOk === false) {
      setSyncStage(100, "保存失败");
      syncResult.value = {
        type: "error",
        message: `${prefix}，但保存失败：${res.saveMessage || "未知错误"}`,
        matchedList: res.matchedList || [],
        unmatched: res.unmatched || [],
      };
    } else {
      setSyncStage(100, "完成");
      syncResult.value = {
        type: "success",
        message: `${prefix}，${res.saveMessage || "尺寸已保存"}`,
        matchedList: res.matchedList || [],
        unmatched: res.unmatched || [],
      };
    }
  } finally {
    stopSyncProgress();
    isSyncingSizes.value = false;
  }
}

async function handleBindAllDemoScreenshots() {
  const fn = ModuleModeNode.value?.applyDemoScreenshots;
  if (typeof fn !== "function") {
    ElMessage({ message: "当前页面不支持同步 Demo 截图", type: "warning" });
    return;
  }

  const demoName = String(currentDemo.value || "").trim();
  if (!demoName) {
    ElMessage({ message: "当前站点还未绑定 Demo，无法获取截图", type: "warning" });
    return;
  }

  isBindingAllDemoScreenshots.value = true;
  try {
    const res = await getDemoConfig(demoName);
    if (res?.code !== 0) {
      ElMessage({ message: res?.message || "获取 Demo 截图失败", type: "error" });
      return;
    }

    await fn(Array.isArray(res?.data?.imgs) ? res.data.imgs : []);
  } catch (error) {
    ElMessage({ message: error?.message || "获取 Demo 截图失败", type: "error" });
  } finally {
    isBindingAllDemoScreenshots.value = false;
  }
}

async function handleBindAllDemoSizes() {
  const fn = ModuleModeNode.value?.applyDemoSizes;
  if (typeof fn !== "function") {
    ElMessage({ message: "当前页面不支持同步 Demo 图片尺寸", type: "warning" });
    return;
  }

  const demoName = String(currentDemo.value || "").trim();
  if (!demoName) {
    ElMessage({ message: "当前站点还未绑定 Demo，无法获取图片尺寸", type: "warning" });
    return;
  }

  isBindingAllDemoSizes.value = true;
  try {
    const res = await getDemoConfig(demoName);
    if (res?.code !== 0) {
      ElMessage({ message: res?.message || "获取 Demo 图片尺寸失败", type: "error" });
      return;
    }

    await fn(res?.data?.sizes);
  } catch (error) {
    ElMessage({ message: error?.message || "获取 Demo 图片尺寸失败", type: "error" });
  } finally {
    isBindingAllDemoSizes.value = false;
  }
}

async function handleSave() {
  const loadingInstance = ElLoading.service({ fullscreen: true });
  try {
    const targetNode = ModuleModeNode.value;
    const finalData = targetNode?.getFinalData?.();
    const siteId = websiteInfo.value?.site_id;

    if (!finalData) {
      ElMessage({ message: "没有数据可保存", type: "warning" });
      loadingInstance.close();
      return;
    }
    if (!siteId) {
      ElMessage({ message: "站点信息未加载，site_id 为空", type: "warning" });
      loadingInstance.close();
      return;
    }
    const res = await updatePageById({
      site_id: siteId,
      id: String(targetNode.state.moduleId),
      data: finalData,
    });

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
    if (newId) {
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

<template>
  <PageContainer>
    <template #header>
      <div class="flex justify-between items-center w-full flex-wrap gap-4">
        <div class="flex flex-col gap-2 min-w-0">
          <div class="flex items-center gap-3">
            <el-icon class="text-primary text-2xl"><Document /></el-icon>
            <h1 class="text-2xl font-semibold text-text-primary">页面编辑</h1>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <a
              href="#"
              @click.prevent="router.push({ name: 'CustomerHome' })"
              class="text-text-muted hover:text-primary transition-colors flex items-center gap-1"
            >
              <el-icon><House /></el-icon>
              网站信息
            </a>
            <el-icon class="text-text-muted"><ArrowRight /></el-icon>
            <span class="text-text-secondary font-medium truncate">{{ websiteInfo.nickname || '页面编辑' }}</span>
          </div>
        </div>

        <!-- 工具栏 -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- 翻译工具（仅 admin 可见） -->
          <div
            v-if="isAdmin"
            class="flex items-center gap-3 bg-surface-hover rounded-lg px-4 py-2 border border-border"
          >
            <div class="flex items-center gap-2">
              <el-icon class="text-text-muted"><Sort /></el-icon>
              <span class="text-sm text-text-secondary whitespace-nowrap">从:</span>
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
            <el-icon class="text-text-muted"><ArrowRight /></el-icon>
            <div class="flex items-center gap-2">
              <span class="text-sm text-text-secondary whitespace-nowrap">到:</span>
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
          <!-- <el-button
            v-if="pageData?.id && isAdmin"
            @click="handleSaveSizes"
            :loading="isSavingSizes"
            size="large"
          >
            保存尺寸
          </el-button> -->
          <!-- 同步尺寸：上传 JSON 按 moduleId 填入截图目标尺寸（仅 admin 可见） -->
          <el-button
            v-if="pageData?.id && isAdmin"
            @click="triggerSyncSizes"
            :loading="isSyncingSizes"
            :icon="Upload"
            size="large"
          >
            同步尺寸
          </el-button>
          <input
            ref="sizeJsonInputRef"
            type="file"
            accept="application/json,.json"
            class="hidden"
            @change="onSyncSizesFileChange"
          />
          <!-- <el-button
            v-if="pageData?.id && isAdmin"
            @click="handleBindAllDemoScreenshots"
            :loading="isBindingAllDemoScreenshots"
            size="large"
          >
            一键获取截图
          </el-button> -->
          <!-- <el-button
            v-if="pageData?.id && isAdmin"
            @click="handleBindAllDemoSizes"
            :loading="isBindingAllDemoSizes"
            size="large"
          >
            一键获取图片尺寸
          </el-button> -->
          <el-button v-if="pageData?.id && isAdmin" :icon="Sort" @click="openSortDialog" size="large">
            板块排序
          </el-button>
          <el-button type="primary" :icon="Check" @click="handleSave" size="large">保存</el-button>
        </div>
      </div>
    </template>

    <!-- 页面数据：模块模式沿用整区滚动 -->
    <div class="flex-1 min-h-0 overflow-hidden flex flex-col" v-if="pageData?.id">
      <ModuleMode ref="ModuleModeNode" :pageId="pageData.id" />
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <el-icon class="text-6xl text-border-dark mb-4">
          <Document />
        </el-icon>
        <p class="text-text-muted">请选择要编辑的页面</p>
      </div>
    </div>

    <!-- 同步尺寸上传窗口（带进度条） -->
    <el-dialog
      v-model="syncDialogVisible"
      title="同步尺寸"
      width="760px"
      top="6vh"
      align-center
      :close-on-click-modal="false"
      :show-close="!isSyncingSizes"
      class="sync-dialog-wrap"
    >
      <div class="sync-dialog">
        <div class="sync-dialog__file">
          <el-icon class="text-primary"><Upload /></el-icon>
          <span class="sync-dialog__name" :title="syncFileName">{{ syncFileName || "未选择文件" }}</span>
        </div>

        <el-progress
          :percentage="Math.round(syncProgress)"
          :status="syncResult ? (syncResult.type === 'success' ? 'success' : syncResult.type === 'error' ? 'exception' : 'warning') : undefined"
          :stroke-width="10"
          striped
          :striped-flow="!!isSyncingSizes"
        />
        <p class="sync-dialog__stage">{{ syncStage }}</p>

        <el-alert
          v-if="syncResult"
          :type="syncResult.type"
          :title="syncResult.message"
          show-icon
          :closable="false"
        />

        <!-- 匹配明细 -->
        <div
          v-if="syncResult && syncResult.type !== 'error' && (syncResult.matchedList?.length || syncResult.unmatched?.length)"
          class="sync-dialog__detail"
        >
          <div class="sync-dialog__detail-title">
            <span>匹配成功</span>
            <span class="sync-dialog__detail-count">
              <em class="is-ok">{{ syncResult.matchedList?.length || 0 }}</em> 条匹配
              <template v-if="syncResult.unmatched?.length">
                · <em class="is-bad">{{ syncResult.unmatched.length }}</em> 条未匹配
              </template>
            </span>
          </div>

          <!-- 匹配成功：卡片网格（带缩略图） -->
          <div class="sync-grid pretty-scroll">
            <div
              v-for="(item, i) in syncResult.matchedList"
              :key="'m-' + item.moduleId + '-' + i"
              class="sync-card"
            >
              <div class="sync-card__thumb">
                <el-image
                  v-if="item.previewUrl"
                  :src="item.previewUrl"
                  :preview-src-list="[item.previewUrl]"
                  fit="cover"
                  class="sync-card__img"
                  preview-teleported
                  hide-on-click-modal
                >
                  <template #error>
                    <div class="sync-card__img-fallback">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div v-else class="sync-card__img-fallback">
                  <el-icon><Picture /></el-icon>
                </div>
                <el-tag v-if="!item.hasShot" size="small" type="warning" effect="dark" class="sync-card__noflag">
                  本页无截图
                </el-tag>
              </div>
              <div class="sync-card__body">
                <div class="sync-card__head">
                  <span class="sync-card__name">
                    <span class="sync-card__no">板块{{ item.partNo ?? "?" }}</span>
                    <span v-if="item.title" class="sync-card__title" :title="item.title">{{ item.title }}</span>
                  </span>
                  <el-icon class="sync-card__ok"><CircleCheck /></el-icon>
                </div>
                <div class="sync-card__size">
                  <template v-if="item.width && item.height">{{ item.width }} × {{ item.height }}</template>
                  <template v-else-if="item.width">宽 {{ item.width }}</template>
                  <template v-else-if="item.height">高 {{ item.height }}</template>
                  <span class="sync-card__unit">px</span>
                </div>
                <div class="sync-card__meta">
                  <span class="sync-card__id" :title="item.moduleId">{{ item.moduleId }}</span>
                  <el-tag v-if="item.status" size="small" type="warning" effect="plain">{{ item.status }}</el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 未匹配 -->
          <div v-if="syncResult.unmatched?.length" class="sync-unmatched">
            <div class="sync-unmatched__title">
              <el-icon class="is-bad"><CircleClose /></el-icon>
              未匹配（moduleId 不在当前页面）
            </div>
            <div class="sync-unmatched__list">
              <el-tag
                v-for="(id, i) in syncResult.unmatched"
                :key="'u-' + id + '-' + i"
                size="small"
                type="info"
                effect="plain"
              >
                {{ id }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button
          v-if="!isSyncingSizes"
          type="primary"
          @click="syncDialogVisible = false"
        >
          关闭
        </el-button>
        <el-button v-else disabled loading>同步中…</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style scoped>
:deep(.el-tabs__content) {
  overflow-y: auto;
}

.sync-dialog {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sync-dialog__file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-field);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}
.sync-dialog__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.sync-dialog__stage {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.sync-dialog__detail {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.sync-dialog__detail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  background: var(--color-surface-hover);
  border-bottom: 1px solid var(--color-border-light);
}
.sync-dialog__detail-count {
  font-weight: 400;
  font-size: 12px;
  color: var(--color-text-muted);
}
.sync-dialog__detail-count em {
  font-style: normal;
  font-weight: 700;
}
.sync-dialog__detail-count em.is-ok {
  color: var(--color-success);
}
.sync-dialog__detail-count em.is-bad {
  color: var(--color-danger);
}

/* 匹配成功卡片网格 */
.sync-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  padding: 14px;
  max-height: 52vh;
  overflow-y: auto;
}
.sync-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-field);
  overflow: hidden;
  background: var(--color-surface);
  transition: box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.sync-card:hover {
  box-shadow: var(--shadow-card-hover);
}
.sync-card__thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  background: var(--color-surface-active);
}
.sync-card__img {
  width: 100%;
  height: 100%;
  display: block;
  cursor: zoom-in;
}
.sync-card__img-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: var(--color-text-muted);
}
.sync-card__noflag {
  position: absolute;
  top: 6px;
  left: 6px;
}
.sync-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
}
.sync-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.sync-card__name {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}
.sync-card__no {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
}
.sync-card__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.sync-card__ok {
  flex-shrink: 0;
  color: var(--color-success);
  font-size: 15px;
}
.sync-card__size {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}
.sync-card__unit {
  margin-left: 2px;
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-muted);
}
.sync-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.sync-card__id {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--color-text-muted);
}

/* 未匹配 */
.sync-unmatched {
  padding: 10px 14px 14px;
  border-top: 1px solid var(--color-border-light);
}
.sync-unmatched__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.sync-unmatched__title .is-bad {
  color: var(--color-danger);
}
.sync-unmatched__list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
