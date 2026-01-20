<template>
    <div class="field-item">
        <div class="mb-4">
            <span class="field-label">进度条标题：</span>
            <el-input 
                v-model="fields.title"
                show-word-limit 
                @input="onUpdate('title', fields.title)"
                placeholder="请输入标题" />
        </div>
        
        <div class="mb-4">
            <span class="field-label">进度百分比：</span>
            <el-input-number 
                v-model="fields.percent"
                :min="0"
                :max="100"
                @change="onUpdate('percent', fields.percent)"
                placeholder="0-100" />
            <span class="ml-2">%</span>
        </div>
    </div>
</template>

<script setup>
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
.ml-2 {
    margin-left: 0.5rem;
}
</style>
