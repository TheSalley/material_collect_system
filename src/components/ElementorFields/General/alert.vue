<template>
    <div class="__field-item">
        <div class="mb-4">
            <span class="__field-label">提醒标题：</span>
            <el-input 
                v-model="fields.alert_title"
                show-word-limit 
                @input="onUpdate('alert_title', fields.alert_title)"
                placeholder="请输入标题" />
        </div>
        
        <div class="mb-4">
            <span class="__field-label">提醒描述：</span>
            <el-input 
                v-model="fields.alert_description"
                show-word-limit 
                type="textarea" 
                :rows="3"
                @input="onUpdate('alert_description', fields.alert_description)"
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
