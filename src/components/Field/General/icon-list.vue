<template>
    <div class="field-item">
        <div v-for="item in localSettingsRef.icon_list">
            <span class="field-label">标题：</span>
            <el-input v-model="item.text"
            show-word-limit type="textarea" @input="onUpdate('icon_list', localSettingsRef.icon_list)" />
        </div>
        
        
    </div>
</template>
<script setup>
import { ref, watch, watchEffect, inject } from "vue";
import { translate } from "@/apis/index.js";

const props = defineProps({
    currentNode: {
        type: Object,
        required: true
    },
    localSettings: {
        type: Object,
        required: true
    },
    onUpdate: {
        type: Function,
        required: true
    }
});

const isTranslate = inject('isTranslate', ref(false));
const translateConfig = inject('translateConfig', { sourceLanguage: 'zh', targetLanguage: 'en' });

const localSettingsRef = ref({ ...props.localSettings });

// 移除 watch，避免用户输入时被覆盖
// 数据流是单向的：用户输入 -> onUpdate -> 父组件更新
// 不需要从父组件同步回来，因为用户输入的值已经是最新的

// 监听翻译状态变化，但只在状态变为true时触发一次
watch(isTranslate, async (newVal, oldVal) => {
  // 只有当状态从false变为true时才触发翻译
  if (newVal === true && oldVal === false && localSettingsRef.value.title) {
    try {
      // 调用翻译API
      // 注意：这里需要指定源语言和目标语言
      // 示例调用，实际应根据用户选择的语言进行翻译
      const res = await translate({
        sourceText: localSettingsRef.value.title,
        sourceLanguage: translateConfig.sourceLanguage,
        targetLanguage: translateConfig.targetLanguage
      });
      
      if (res.code === 0) {
        localSettingsRef.value.title = res.data.translatedText;
        props.onUpdate('title', res.data.translatedText);
      }
    } catch (error) {
      console.error("翻译标题出错:", error);
    }
  }
});
</script>
<style scoped></style>