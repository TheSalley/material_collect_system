<template>
  <div
    v-if="visible"
    class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-600"
  >
    <div class="flex items-center gap-2">
      <el-icon class="text-gray-500 dark:text-gray-400"><Sort /></el-icon>
      <span class="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">从:</span>
      <el-select
        v-model="localSourceLanguage"
        placeholder="源语言"
        size="default"
        style="width: 120px"
      >
        <el-option
          v-for="lang in languageList"
          :key="lang.value"
          :label="lang.label"
          :value="lang.value"
        />
      </el-select>
    </div>
    <el-icon class="text-gray-400 dark:text-gray-500"><ArrowRight /></el-icon>
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">到:</span>
      <el-select
        v-model="localTargetLanguage"
        placeholder="目标语言"
        size="default"
        style="width: 120px"
      >
        <el-option
          v-for="lang in languageList"
          :key="lang.value"
          :label="lang.label"
          :value="lang.value"
        />
      </el-select>
    </div>
    <el-button
      type="success"
      :icon="Sort"
      :loading="loading"
      @click="handleTranslate"
      size="default"
    >
      一键翻译
    </el-button>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from "vue";
import { languageList } from "@/config/index.js";
import { Sort, ArrowRight } from "@element-plus/icons-vue";

const STORAGE_KEY = "translate-tool-preferences";

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "translate"]);

// 从 localStorage 读取保存的语言偏好
const getSavedLanguages = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to read language preferences:", e);
  }
  return null;
};

// 保存语言偏好到 localStorage
const saveLanguages = (source, target) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sourceLanguage: source, targetLanguage: target }));
  } catch (e) {
    console.warn("Failed to save language preferences:", e);
  }
};

// 默认语言配置
const defaultSourceLanguage = "en";
const defaultTargetLanguage = "zh"; // 改为中文，更符合中文用户习惯

// 本地副本，确保 v-model 正常工作，优先使用保存的设置
const savedPrefs = getSavedLanguages();

const localSourceLanguage = computed({
  get: () => {
    // 优先级：props.modelValue > saved > default
    if (props.modelValue?.sourceLanguage) {
      return props.modelValue.sourceLanguage;
    }
    if (savedPrefs?.sourceLanguage) {
      return savedPrefs.sourceLanguage;
    }
    return defaultSourceLanguage;
  },
  set: (val) => {
    emit("update:modelValue", { ...props.modelValue, sourceLanguage: val });
    // 同时保存到 localStorage
    const currentTarget = props.modelValue?.targetLanguage || savedPrefs?.targetLanguage || defaultTargetLanguage;
    saveLanguages(val, currentTarget);
  },
});

const localTargetLanguage = computed({
  get: () => {
    // 优先级：props.modelValue > saved > default
    if (props.modelValue?.targetLanguage) {
      return props.modelValue.targetLanguage;
    }
    if (savedPrefs?.targetLanguage) {
      return savedPrefs.targetLanguage;
    }
    return defaultTargetLanguage;
  },
  set: (val) => {
    emit("update:modelValue", { ...props.modelValue, targetLanguage: val });
    // 同时保存到 localStorage
    const currentSource = props.modelValue?.sourceLanguage || savedPrefs?.sourceLanguage || defaultSourceLanguage;
    saveLanguages(currentSource, val);
  },
});

function handleTranslate() {
  emit("translate");
}
</script>

<style scoped>
/* 组件样式 */
</style>
