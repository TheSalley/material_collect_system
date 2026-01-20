<template>
    <div class="field-item">
        <div class="mb-4">
            <span class="field-label">标题文本：</span>
            <el-input 
                v-model="fields.ekit_icon_box_title_text"
                show-word-limit 
                type="textarea" 
                @input="onUpdate('ekit_icon_box_title_text', fields.ekit_icon_box_title_text)"
                placeholder="请输入标题文本" />
        </div>
        
        <div class="mb-4">
            <span class="field-label">描述文本：</span>
            <el-input 
                v-model="fields.ekit_icon_box_description_text"
                show-word-limit 
                type="textarea" 
                :rows="3"
                @input="onUpdate('ekit_icon_box_description_text', fields.ekit_icon_box_description_text)"
                placeholder="请输入描述文本" />
        </div>
        
        <div class="mb-4">
            <span class="field-label">按钮文本：</span>
            <el-input 
                v-model="fields.ekit_icon_box_btn_text"
                show-word-limit 
                type="textarea" 
                @input="onUpdate('ekit_icon_box_btn_text', fields.ekit_icon_box_btn_text)"
                placeholder="请输入按钮文本" />
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
