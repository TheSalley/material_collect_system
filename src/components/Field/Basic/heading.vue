<template>
    <div class="field-item" v-if="!(fields.__dynamic__ && fields.__dynamic__.title)">
        <div class="field-group">
            <label class="field-label">
                <el-icon><Promotion /></el-icon>
                标题
            </label>
            <el-input 
                v-model="fields.title"
                show-word-limit 
                type="textarea"
                :rows="2"
                placeholder="请输入标题内容"
                @input="onUpdate('title', fields.title)" />
        </div>
    </div>
</template>

<script setup>
import { Promotion } from '@element-plus/icons-vue';

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
    font-size: 0.9rem;
}
</style>