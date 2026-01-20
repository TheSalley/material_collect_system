<template>
    <div class="field-item">
        <div class="mb-4">
            <span class="field-label">Shortcode：</span>
            <el-input 
                v-model="fields.shortcode"
                show-word-limit 
                type="textarea" 
                :rows="2"
                @input="onUpdate('shortcode', fields.shortcode)"
                placeholder="请输入 shortcode，例如: [contact-form-7]" />
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
