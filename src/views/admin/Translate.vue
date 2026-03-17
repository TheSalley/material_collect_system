<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面标题区域 -->
    <div class="px-6 pt-6 flex-shrink-0">
      <div class="flex flex-col gap-2">
        <h1 class="flex items-center gap-3 text-3xl font-semibold text-gray-900 dark:text-white">
          <el-icon class="text-blue-500 text-4xl"><Document /></el-icon>
          翻译
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">调用接口将文本翻译为目标语言</p>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="flex-1 flex flex-col m-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm overflow-hidden min-h-0">
      <div class="flex-1 p-6 md:p-10 overflow-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-6 flex flex-col gap-4">
            <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">源文本</h3>
                <div class="flex items-center gap-2">
                  <el-select v-model="targetLang" size="default" style="width: 140px">
                    <el-option label="英文" value="en" />
                    <el-option label="中文" value="zh" />
                    <el-option label="日文" value="ja" />
                    <el-option label="韩文" value="ko" />
                    <el-option label="德文" value="de" />
                    <el-option label="法文" value="fr" />
                    <el-option label="西班牙文" value="es" />
                  </el-select>
                  <el-button type="primary" :loading="loading" :disabled="!canTranslate" @click="onTranslate">
                    翻译
                  </el-button>
                </div>
              </div>
              <el-input
                v-model="text"
                type="textarea"
                :rows="10"
                class="mt-4"
                placeholder="请输入需要翻译的文本（最多 5000 字符）"
                maxlength="5000"
                show-word-limit
              />
            </div>
          </div>

          <div class="lg:col-span-6 flex flex-col gap-4">
            <div class="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">翻译结果</h3>
                <el-button :disabled="!result" @click="copyResult">复制</el-button>
              </div>
              <el-input
                v-model="result"
                type="textarea"
                :rows="10"
                class="mt-4"
                placeholder="翻译结果会显示在这里"
                readonly
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { translate } from "@/apis/index.js";
import { Document } from "@element-plus/icons-vue";

const text = ref("");
const result = ref("");
const targetLang = ref("en");
const loading = ref(false);

const canTranslate = computed(() => Boolean(text.value?.trim()));

async function onTranslate() {
  if (!canTranslate.value) return;
  loading.value = true;
  try {
    const res = await translate({ text: text.value, target_language: targetLang.value });
    if (res?.code === 0) {
      result.value = res?.data?.translated_text || res?.data?.text || res?.data || "";
      if (!result.value) ElMessage.warning("接口返回为空");
    } else {
      ElMessage.error(res?.message || "翻译失败");
    }
  } catch (e) {
    ElMessage.error(e?.message || "翻译失败");
  } finally {
    loading.value = false;
  }
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(result.value || "");
    ElMessage.success("已复制");
  } catch {
    ElMessage.warning("复制失败，请手动复制");
  }
}
</script>

<style scoped>
</style>

