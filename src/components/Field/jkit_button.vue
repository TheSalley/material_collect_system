<template>
    <div class="field-item">
        <span class="field-label">按钮：</span>
        <el-input v-model="localSettingsRef.sg_content_label" minlength="1" min="1" maxlength="100" placeholder="Please input"
            show-word-limit type="textarea" @input="onUpdate('sg_content_label', localSettingsRef.sg_content_label)" />
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