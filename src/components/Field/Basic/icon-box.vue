<template>
    <div class="__field-item">
        <div class="mb-4">
            <span class="__field-label">标题：</span>
            <el-input 
                v-model="fields.title_text"
                show-word-limit 
                type="textarea" 
                @input="onUpdate('title_text', fields.title_text)"
                placeholder="请输入标题" />
        </div>
        
        <div class="mb-4">
            <span class="__field-label">描述：</span>
            <el-input 
                v-model="fields.description_text"
                show-word-limit 
                type="textarea" 
                :rows="3"
                @input="onUpdate('description_text', fields.description_text)"
                placeholder="请输入描述" />
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
</style>
