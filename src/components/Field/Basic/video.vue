<template>
    <div class="field-item">
        <span class="field-label">视频链接：</span>
        <el-input v-model="localSettingsRef.youtube_url"
            show-word-limit type="textarea" @input="onUpdate('youtube_url', localSettingsRef.youtube_url)" />
    </div>
</template>
<script setup>
import { ref, watch } from "vue";

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
    }
});

const localSettingsRef = ref({ ...props.localSettings });

watch(() => props.localSettings, (newVal) => {
    localSettingsRef.value = { ...newVal };
}, { deep: true });
</script>
<style scoped></style>