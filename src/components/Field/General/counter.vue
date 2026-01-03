<template>
    <div class="field-item">
            <span class="field-label">标题：</span>
            <el-input v-model="localSettingsRef.title" minlength="1" min="1" maxlength="100"
            show-word-limit type="textarea" @input="handleTitleInput" />
            <el-input v-model="localSettingsRef.ending_number" minlength="1" min="1" maxlength="100"
            show-word-limit type="textarea" @input="handleNumberInput" />

            <el-input v-model="localSettingsRef.suffix" minlength="1" min="1" maxlength="100"
            show-word-limit type="textarea" @input="handleSuffixInput" />

        
        
    </div>
</template>
<script setup>
import { ref, watch, inject } from "vue";
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
let titleTimeout = null;
let numberTimeout = null;
let suffixTimeout = null;
let isTranslating = false;

// 防抖处理输入
const handleTitleInput = () => {
    if (titleTimeout) clearTimeout(titleTimeout);
    titleTimeout = setTimeout(() => {
        props.onUpdate('title', localSettingsRef.title);
    }, 300);
};

const handleNumberInput = () => {
    if (numberTimeout) clearTimeout(numberTimeout);
    numberTimeout = setTimeout(() => {
        props.onUpdate('ending_number', localSettingsRef.ending_number);
    }, 300);
};

const handleSuffixInput = () => {
    if (suffixTimeout) clearTimeout(suffixTimeout);
    suffixTimeout = setTimeout(() => {
        props.onUpdate('suffix', localSettingsRef.suffix);
    }, 300);
};

watch(() => props.localSettings, (newVal) => {
    localSettingsRef.value = { ...newVal };
}, { deep: true });

// 监听翻译状态变化，但只在状态变为true时触发一次
watch(isTranslate, async (newVal, oldVal) => {
    // 只有当状态从false变为true时才触发翻译，并且当前没有正在翻译
    if (newVal === true && oldVal === false && !isTranslating) {
        isTranslating = true;
        try {
            // 翻译标题
            if (localSettingsRef.value.title) {
                const titleRes = await translate({
                    sourceText: localSettingsRef.value.title,
                    sourceLanguage: translateConfig.sourceLanguage,
                    targetLanguage: translateConfig.targetLanguage
                });
                
                if (titleRes.code === 0) {
                    localSettingsRef.value.title = titleRes.data.translatedText;
                    props.onUpdate('title', titleRes.data.translatedText);
                }
            }
            
            // 翻译后缀（如果有文本内容）
            if (localSettingsRef.value.suffix && localSettingsRef.value.suffix.trim()) {
                const suffixRes = await translate({
                    sourceText: localSettingsRef.value.suffix,
                    sourceLanguage: translateConfig.sourceLanguage,
                    targetLanguage: translateConfig.targetLanguage
                });
                
                if (suffixRes.code === 0) {
                    localSettingsRef.value.suffix = suffixRes.data.translatedText;
                    props.onUpdate('suffix', suffixRes.data.translatedText);
                }
            }
        } catch (error) {
            console.error("翻译计数器组件出错:", error);
        } finally {
            isTranslating = false;
        }
    }
});
</script>
<style scoped></style>