<template>
    <div class="field-item">
        <div class="field-group">
            <label class="field-label">
                <el-icon><Link /></el-icon>
                按钮文本
            </label>
            <el-input 
                v-model="fields.text"
                show-word-limit 
                placeholder="请输入按钮文本"
                @input="onUpdate('text', fields.text)" />
        </div>
    </div>
</template>

<script setup>
import { Link } from '@element-plus/icons-vue';

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
.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>