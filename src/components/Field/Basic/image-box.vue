<template>
    <div class="__field-item">
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><Promotion /></el-icon>
                标题
            </label>
            <el-input 
                v-model="fields.title_text"
                show-word-limit 
                type="textarea"
                :rows="2"
                @input="onUpdate('title_text', fields.title_text)"
                placeholder="请输入图片盒子标题" />
        </div>
        
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><Document /></el-icon>
                描述
            </label>
            <el-input 
                v-model="fields.description_text"
                show-word-limit 
                type="textarea" 
                :rows="3"
                @input="onUpdate('description_text', fields.description_text)"
                placeholder="请输入图片盒子描述" />
        </div>
    </div>
</template>

<script setup>
import { Promotion, Document } from '@element-plus/icons-vue';

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

.__field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>
