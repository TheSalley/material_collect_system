<template>
    <div class="field-item">
        <div class="mb-4">
            <label class="field-label">数字</label>
            <el-input
                v-model="fields.sg_content_number"
                @input="onUpdate('sg_content_number', fields.sg_content_number)"
                placeholder="如: 20" />
        </div>

        <div class="mb-4">
            <label class="field-label">数字前缀</label>
            <el-input
                v-model="fields.sg_content_number_prefix"
                @input="onUpdate('sg_content_number_prefix', fields.sg_content_number_prefix)"
                placeholder="如: $、约等（可选）" />
        </div>

        <div class="mb-4">
            <label class="field-label">数字后缀</label>
            <el-input
                v-model="fields.sg_content_number_suffix"
                @input="onUpdate('sg_content_number_suffix', fields.sg_content_number_suffix)"
                placeholder="如: K、+ 等（可选）" />
        </div>

        <div class="mb-4" v-if="settings?.sg_setting_enable_super === 'yes'">
            <label class="field-label">上标符号</label>
            <el-input
                v-model="fields.sg_content_super"
                @input="onUpdate('sg_content_super', fields.sg_content_super)"
                placeholder="如: +、% 等" />
        </div>

        <div class="mb-4">
            <label class="field-label">标题文本</label>
            <el-input
                v-model="fields.sg_content_title"
                @input="onUpdate('sg_content_title', fields.sg_content_title)"
                placeholder="如: Year Experience" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    nodeId: {
        type: String,
        required: true,
    },
    fields: {
        type: Object,
        required: true,
    },
    settings: {
        type: Object,
        default: () => ({}),
    },
    onUpdate: {
        type: Function,
        required: true,
    },
});
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1rem;
}

.field-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}
</style>
