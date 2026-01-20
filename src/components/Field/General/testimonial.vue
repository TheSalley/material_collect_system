<template>
    <div class="field-item">
        <div class="mb-4">
            <span class="field-label">推荐内容：</span>
            <el-input 
                v-model="fields.testimonial_content"
                show-word-limit 
                type="textarea" 
                :rows="4"
                @input="onUpdate('testimonial_content', fields.testimonial_content)"
                placeholder="请输入推荐内容" />
        </div>
        
        <div class="mb-4">
            <span class="field-label">推荐人姓名：</span>
            <el-input 
                v-model="fields.testimonial_name"
                show-word-limit 
                @input="onUpdate('testimonial_name', fields.testimonial_name)"
                placeholder="请输入姓名" />
        </div>
        
        <div class="mb-4">
            <span class="field-label">推荐人职位：</span>
            <el-input 
                v-model="fields.testimonial_job"
                show-word-limit 
                @input="onUpdate('testimonial_job', fields.testimonial_job)"
                placeholder="请输入职位" />
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
