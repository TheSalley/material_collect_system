<template>
    <div class="field-item">
        <span class="field-label">按钮：</span>
        <el-input v-model="fields.text"
            show-word-limit type="textarea" @input="onUpdate('text', fields.text)" />
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
<style scoped></style>