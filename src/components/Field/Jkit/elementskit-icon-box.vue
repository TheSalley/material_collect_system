<template>
    <div class="field-item">
        <div class="mb-4">
            <label class="field-label">
                <el-icon><Promotion /></el-icon>
                标题文本
            </label>
            <el-input 
                v-model="fields.ekit_icon_box_title_text"
                show-word-limit 
                type="textarea"
                :rows="2"
                @input="onUpdate('ekit_icon_box_title_text', fields.ekit_icon_box_title_text)"
                placeholder="请输入标题文本" />
        </div>
        
        <div class="mb-4">
            <label class="field-label">
                <el-icon><Document /></el-icon>
                描述文本
            </label>
            <el-input 
                v-model="fields.ekit_icon_box_description_text"
                show-word-limit 
                type="textarea" 
                :rows="3"
                @input="onUpdate('ekit_icon_box_description_text', fields.ekit_icon_box_description_text)"
                placeholder="请输入描述文本" />
        </div>
        
        <div class="mb-4">
            <label class="field-label">
                <el-icon><Link /></el-icon>
                按钮文本
            </label>
            <el-input 
                v-model="fields.ekit_icon_box_btn_text"
                show-word-limit 
                @input="onUpdate('ekit_icon_box_btn_text', fields.ekit_icon_box_btn_text)"
                placeholder="请输入按钮文本" />
        </div>
    </div>
</template>

<script setup>
import { Promotion, Document, Link } from '@element-plus/icons-vue';

const props = defineProps({
    nodeId: {
        type: String,
        required: true
    },
    fields: {
        type: Object,
        required: true
    },
    onUpdate: {
        type: Function,
        required: true
    }
});
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1rem;
}

.field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}
</style>
