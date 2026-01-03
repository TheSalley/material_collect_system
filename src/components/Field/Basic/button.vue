<template>
    <div class="field-item">
        <span class="field-label">按钮：</span>
        <el-input v-model="localSettingsRef.text" minlength="1" min="1" maxlength="20"
            show-word-limit type="textarea" @input="handleInput" />
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
let inputTimeout = null;
let isTranslating = false;

// 防抖处理输入
const handleInput = () => {
    // 清除之前的定时器
    if (inputTimeout) {
        clearTimeout(inputTimeout);
    }
    
    // 设置新的定时器，延迟300ms后更新
    inputTimeout = setTimeout(() => {
        props.onUpdate('text', localSettingsRef.text);
    }, 300);
};

watch(() => props.localSettings, (newVal) => {
    localSettingsRef.value = { ...newVal };
}, { deep: true });

// 监听翻译状态变化，但只在状态变为true时触发一次
watch(isTranslate, async (newVal, oldVal) => {
    // 只有当状态从false变为true时才触发翻译，并且当前没有正在翻译
    if (newVal === true && oldVal === false && localSettingsRef.value.text && !isTranslating) {
        isTranslating = true;
        try {
            const res = await translate({
                sourceText: localSettingsRef.value.text,
                sourceLanguage: translateConfig.sourceLanguage,
                targetLanguage: translateConfig.targetLanguage
            });
            
            if (res.code === 0) {
                localSettingsRef.value.text = res.data.translatedText;
                props.onUpdate('text', res.data.translatedText);
            }
        } catch (error) {
            console.error("翻译按钮文本出错:", error);
        } finally {
            isTranslating = false;
        }
    }
});
</script>
<style scoped></style>