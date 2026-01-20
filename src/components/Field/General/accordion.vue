<template>
    <div class="field-item">
        <div v-for="(item, index) in fields.tabs" :key="index">
            <span class="field-label">标题：</span>
            <el-input v-model="item.tab_title"
            show-word-limit type="textarea" @input="onUpdate('tabs', fields.tabs)" />
            <div class="field-label">内容</div>
            <QuillEditor 
                :node-id="`${props.nodeId}_tab_${index}`"
                v-model:modelValue="item.tab_content"
                @update:model-value="onUpdate('tabs', fields.tabs)"
                placeholder="请输入标签内容..." />
        </div>
    </div>
</template>
<script setup>
import QuillEditor from "../../QuillEditor.vue";

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