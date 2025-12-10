<template>
    <div class="field-item">
        <span class="field-label">标题：</span>
        <el-input v-model="localSettingsRef.title" minlength="1" min="1" maxlength="100" placeholder="Please input"
            show-word-limit type="textarea" @input="onUpdate('title', localSettingsRef.title)" />
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