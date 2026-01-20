<template>
    <div class="field-item">
            <span class="field-label">标题：</span>
            <el-input v-model="fields.title"
            show-word-limit type="textarea" @input="onUpdate('title', fields.title)" />
            <el-input v-model="fields.ending_number"
            show-word-limit type="textarea" @input="onUpdate('ending_number', fields.ending_number)" />

            <el-input v-model="fields.suffix"
            show-word-limit type="textarea" @input="onUpdate('suffix', fields.suffix)" />

        
        
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