<template>
    <div class="field-item" v-if="!(fields.__dynamic__ && fields.__dynamic__.title)">
        <span class="field-label">标题：</span>
        <el-input v-model="fields.title"
            show-word-limit type="textarea" @input="onUpdate('title', fields.title)" />
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