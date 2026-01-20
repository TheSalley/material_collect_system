<template>
    <div class="field-item">
        <span class="field-label">视频链接：</span>
        <el-input v-model="fields.youtube_url"
            show-word-limit type="textarea" @input="onUpdate('youtube_url', fields.youtube_url)" />
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