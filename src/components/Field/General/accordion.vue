<template>
    <div class="field-item">
        <div v-for="(item, index) in localSettingsRef.tabs" :key="index">
            <span class="field-label">标题：</span>
            <el-input v-model="item.tab_title" minlength="1" min="1" maxlength="100"
            show-word-limit type="textarea" @input="onUpdate('tabs', localSettingsRef.tabs)" />
            <div class="field-label">内容</div>
            <QuillEditor 
                :node-id="`${props.nodeId}_tab_${index}`"
                v-model:modelValue="item.tab_content"
                @update:model-value="onUpdate('tabs', localSettingsRef.tabs)"
                placeholder="请输入标签内容..." />
        </div>
    </div>
</template>
<script setup>
import { ref, watch, inject } from "vue";
import { translate } from "@/apis/index.js";
import QuillEditor from "../../QuillEditor.vue";

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
    nodeId: {
        type: String,
        required: true
    }
});

const isTranslate = inject('isTranslate', ref(false));
const translateConfig = inject('translateConfig', { sourceLanguage: 'zh', targetLanguage: 'en' });

const localSettingsRef = ref({ ...props.localSettings });
const isTranslating = ref(false);

watch(() => props.localSettings, (newVal) => {
    localSettingsRef.value = { ...newVal };
}, { deep: true });

// 监听翻译状态变化，但只在状态变为true时触发一次
watch(isTranslate, async (newVal, oldVal) => {
  // 只有当状态从false变为true时才触发翻译，并且当前没有正在进行的翻译
  if (newVal === true && oldVal === false && !isTranslating.value) {
    isTranslating.value = true;
    try {
      // 遍历所有标签页进行翻译
      for (let i = 0; i < localSettingsRef.value.tabs?.length; i++) {
        const tab = localSettingsRef.value.tabs[i];
        
        // 翻译标题
        if (tab.tab_title) {
          const titleRes = await translate({
            sourceText: tab.tab_title,
            sourceLanguage: translateConfig.sourceLanguage,
            targetLanguage: translateConfig.targetLanguage
          });
          
          if (titleRes.code === 0) {
            localSettingsRef.value.tabs[i].tab_title = titleRes.data.translatedText;
          }
        }
        
        // 翻译内容
        if (tab.tab_content) {
          const contentRes = await translate({
            sourceText: tab.tab_content,
            sourceLanguage: translateConfig.sourceLanguage,
            targetLanguage: translateConfig.targetLanguage
          });
          
          if (contentRes.code === 0) {
            localSettingsRef.value.tabs[i].tab_content = contentRes.data.translatedText;
          }
        }
      }
      
      // 更新数据
      props.onUpdate('tabs', localSettingsRef.value.tabs);
    } catch (error) {
      console.error("翻译标签页出错:", error);
    } finally {
      isTranslating.value = false;
    }
  }
});
</script>
<style scoped></style>