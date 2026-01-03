<template>
    <div class="field-item">
        123
        <!-- 主标题配置 -->
        <div class="field-group">
            <span class="field-label">主标题前缀：</span>
            <el-input v-model="localSettingsRef.sg_title_before" 
                     placeholder="输入主标题前缀"
                     @input="handleInput('sg_title_before')" />
        </div>
        
        <div class="field-group">
            <span class="field-label">主标题焦点部分：</span>
            <el-input v-model="localSettingsRef.sg_title_focused" 
                     placeholder="输入主标题焦点部分"
                     @input="handleInput('sg_title_focused')" />
        </div>
        
        <!-- 副标题配置 -->
        <div class="field-group">
            <span class="field-label">副标题：</span>
            <el-input v-model="localSettingsRef.sg_subtitle_heading" 
                     type="textarea"
                     :rows="3"
                     placeholder="输入副标题"
                     @input="handleInput('sg_subtitle_heading')" />
        </div>
        
        <!-- 其他文案配置 -->
        <div class="field-group">
            <span class="field-label">阴影内容：</span>
            <el-input v-model="localSettingsRef.sg_shadow_content" 
                     placeholder="输入阴影内容"
                     @input="handleInput('sg_shadow_content')" />
        </div>
        
        <div class="field-group">
            <span class="field-label">标题文本：</span>
            <el-input v-model="localSettingsRef.sg_title_text" 
                     placeholder="输入标题文本"
                     @input="handleInput('sg_title_text')" />
        </div>
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
    },
    nodeId: {
        type: String,
        required: true
    }
});

const isTranslate = inject('isTranslate', ref(false));
const translateConfig = inject('translateConfig', { sourceLanguage: 'zh', targetLanguage: 'en' });

// 初始化默认设置
const defaultSettings = {
    sg_title_before: "",
    sg_title_focused: "",
    sg_subtitle_heading: "",
    sg_shadow_content: "",
    sg_title_text: ""
};

const localSettingsRef = ref({ 
    ...defaultSettings, 
    ...props.localSettings 
});

let inputTimeouts = {};
let isTranslating = false;

// 防抖处理输入
const handleInput = (field) => {
    // 清除之前的定时器
    if (inputTimeouts[field]) {
        clearTimeout(inputTimeouts[field]);
    }
    
    // 设置新的定时器，延迟300ms后更新
    inputTimeouts[field] = setTimeout(() => {
        props.onUpdate(field, localSettingsRef.value[field]);
    }, 300);
};

watch(() => props.localSettings, (newVal) => {
    localSettingsRef.value = { ...defaultSettings, ...newVal };
}, { deep: true });

// 监听翻译状态变化，但只在状态变为true时触发一次
watch(isTranslate, async (newVal, oldVal) => {
    // 只有当状态从false变为true时才触发翻译，并且当前没有正在翻译
    if (newVal === true && oldVal === false && !isTranslating) {
        isTranslating = true;
        try {
            // 翻译主标题前缀
            if (localSettingsRef.value.sg_title_before) {
                const beforeRes = await translate({
                    sourceText: localSettingsRef.value.sg_title_before,
                    sourceLanguage: translateConfig.sourceLanguage,
                    targetLanguage: translateConfig.targetLanguage
                });
                
                if (beforeRes.code === 0) {
                    localSettingsRef.value.sg_title_before = beforeRes.data.translatedText;
                }
            }
            
            // 翻译主标题焦点部分
            if (localSettingsRef.value.sg_title_focused) {
                const focusedRes = await translate({
                    sourceText: localSettingsRef.value.sg_title_focused,
                    sourceLanguage: translateConfig.sourceLanguage,
                    targetLanguage: translateConfig.targetLanguage
                });
                
                if (focusedRes.code === 0) {
                    localSettingsRef.value.sg_title_focused = focusedRes.data.translatedText;
                }
            }
            
            // 翻译副标题
            if (localSettingsRef.value.sg_subtitle_heading) {
                const subtitleRes = await translate({
                    sourceText: localSettingsRef.value.sg_subtitle_heading,
                    sourceLanguage: translateConfig.sourceLanguage,
                    targetLanguage: translateConfig.targetLanguage
                });
                
                if (subtitleRes.code === 0) {
                    localSettingsRef.value.sg_subtitle_heading = subtitleRes.data.translatedText;
                }
            }
            
            // 翻译阴影内容
            if (localSettingsRef.value.sg_shadow_content) {
                const shadowRes = await translate({
                    sourceText: localSettingsRef.value.sg_shadow_content,
                    sourceLanguage: translateConfig.sourceLanguage,
                    targetLanguage: translateConfig.targetLanguage
                });
                
                if (shadowRes.code === 0) {
                    localSettingsRef.value.sg_shadow_content = shadowRes.data.translatedText;
                }
            }
            
            // 翻译标题文本
            if (localSettingsRef.value.sg_title_text) {
                const textRes = await translate({
                    sourceText: localSettingsRef.value.sg_title_text,
                    sourceLanguage: translateConfig.sourceLanguage,
                    targetLanguage: translateConfig.targetLanguage
                });
                
                if (textRes.code === 0) {
                    localSettingsRef.value.sg_title_text = textRes.data.translatedText;
                }
            }
            
            // 批量更新所有翻译后的字段
            const updatedFields = {};
            Object.keys(localSettingsRef.value).forEach(key => {
                updatedFields[key] = localSettingsRef.value[key];
            });
            
            props.onUpdate('', updatedFields);
            
        } catch (error) {
            console.error("翻译标题组件出错:", error);
        } finally {
            isTranslating = false;
        }
    }
});
</script>

<style scoped>
.field-item {
    padding: 16px;
}

.field-group {
    margin-bottom: 16px;
}

.field-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #606266;
}
</style>