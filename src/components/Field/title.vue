<template v-if="currentNode?.settings?.title">
    <div class="field-item">
        <span class="field-label">标题：</span>
        <el-input v-model="localSettings.title" minlength="1" min="1" maxlength="100" placeholder="Please input"
            show-word-limit type="textarea" @input="handleFieldUpdate('title', localSettings.title)" />
    </div>
</template>
<script setup>
import { ref, watch } from "vue";
</script>
<style scoped></style>