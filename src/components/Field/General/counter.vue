<template>
    <div class="field-item">
            <span class="field-label">标题：</span>
            <el-input v-model="localSettingsRef.title" minlength="1" min="1" maxlength="100"
            show-word-limit type="textarea" @input="onUpdate('title', localSettingsRef.title)" />
            <el-input v-model="localSettingsRef.ending_number" minlength="1" min="1" maxlength="100"
            show-word-limit type="textarea" @input="onUpdate('ending_number', localSettingsRef.ending_number)" />

            <el-input v-model="localSettingsRef.suffix" minlength="1" min="1" maxlength="100"
            show-word-limit type="textarea" @input="onUpdate('suffix', localSettingsRef.suffix)" />

        
        
    </div>
</template>
<script setup>
import { ref, watch, watchEffect } from "vue";
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
    },
    isTranslate: {
        type: Boolean,
        default: false
    },
    sourceLanguage: {
        type: String,
        default: 'zh'
    },
    targetLanguage: {
        type: String,
        default: 'en'
    }
});

const localSettingsRef = ref({ ...props.localSettings });

watch(() => props.localSettings, (newVal) => {
    localSettingsRef.value = { ...newVal };
}, { deep: true });

// 监听翻译状态变化
watchEffect(async () => {
  if (props.isTranslate && localSettingsRef.value.title) {
    try {
      // 调用翻译API
      // 注意：这里需要指定源语言和目标语言
      // 示例调用，实际应根据用户选择的语言进行翻译
      const res = await translate({
        sourceText: localSettingsRef.value.title,
        sourceLanguage: props.sourceLanguage,
        targetLanguage: props.targetLanguage
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