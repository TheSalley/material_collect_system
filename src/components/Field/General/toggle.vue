<template>
    <div class="field-item">
        <div v-for="(item, index) in localSettingsRef.tabs" :key="index">
            <span class="field-label">标题：</span>
            <el-input v-model="item.tab_title"
            show-word-limit type="textarea" @input="handleTitleInput(index)" />
            <div class="field-label">内容</div>
            <QuillEditor 
                :node-id="`${props.nodeId}_tab_${index}`"
                v-model:modelValue="item.tab_content"
                @update:model-value="handleContentInput(index)"
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
const titleTimeouts = {};
const contentTimeouts = {};
let isTranslating = false;

// 防抖处理标题输入
const handleTitleInput = (index) => {
    if (titleTimeouts[index]) clearTimeout(titleTimeouts[index]);
    titleTimeouts[index] = setTimeout(() => {
        props.onUpdate('tabs', localSettingsRef.value.tabs);
    }, 300);
};

// 防抖处理内容输入
const handleContentInput = (index) => {
    if (contentTimeouts[index]) clearTimeout(contentTimeouts[index]);
    contentTimeouts[index] = setTimeout(() => {
        props.onUpdate('tabs', localSettingsRef.value.tabs);
    }, 300);
};

// 移除 watch，避免用户输入时被覆盖
// 数据流是单向的：用户输入 -> onUpdate -> 父组件更新
// 不需要从父组件同步回来，因为用户输入的值已经是最新的

// 监听翻译状态变化，但只在状态变为true时触发一次
watch(isTranslate, async (newVal, oldVal) => {
    // 只有当状态从false变为true时才触发翻译，并且当前没有正在翻译
    if (newVal === true && oldVal === false && !isTranslating) {
        isTranslating = true;
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
                
                // 如果有内容需要翻译，也进行翻译
                if (tab.content) {
                    const contentRes = await translate({
                        sourceText: tab.content,
                        sourceLanguage: translateConfig.sourceLanguage,
                        targetLanguage: translateConfig.targetLanguage
                    });
                    
                    if (contentRes.code === 0) {
                        localSettingsRef.value.tabs[i].content = contentRes.data.translatedText;
                    }
                }
            }
            
            // 更新数据
            props.onUpdate('tabs', localSettingsRef.value.tabs);
        } catch (error) {
            console.error("翻译标签页出错:", error);
        } finally {
            isTranslating = false;
        }
    }
});
</script>
<style scoped></style>