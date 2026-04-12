<template>
    <div class="__field-item">
        <!-- 标题文本 -->
        <div class="mb-4">
            <label class="__field-label">标题文本</label>
            <el-input
                v-model="fields.sg_title_text"
                @input="onUpdate('sg_title_text', fields.sg_title_text)"
                placeholder="请输入标题文本" />
        </div>

        <!-- 副标题（条件显示） -->
        <div class="mb-4" v-if="settings?.sg_subtitle_enable === 'yes'">
            <label class="__field-label">副标题</label>
            <el-input
                v-model="fields.sg_subtitle_heading"
                @input="onUpdate('sg_subtitle_heading', fields.sg_subtitle_heading)"
                placeholder="请输入副标题" />
        </div>

        <!-- 描述（条件显示） -->
        <div class="mb-4" v-if="settings?.sg_description_enable === 'yes'">
            <label class="__field-label">描述</label>
            <el-input
                v-model="fields.sg_description"
                @input="onUpdate('sg_description', fields.sg_description)"
                placeholder="请输入描述" />
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

.__field-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}
</style>
