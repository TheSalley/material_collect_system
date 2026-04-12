<template>
    <div class="__field-item">
        <!-- 图标头部 -->
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><MagicStick /></el-icon>
                图标类名
            </label>
            <el-input
                v-model="fields.sg_icon_header"
                @input="onUpdate('sg_icon_header', fields.sg_icon_header)"
                placeholder="如: jki jki-planting-light" />
        </div>

        <!-- 图标文本 -->
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><ChatDotSquare /></el-icon>
                图标标题
            </label>
            <el-input
                v-model="fields.sg_icon_text"
                @input="onUpdate('sg_icon_text', fields.sg_icon_text)"
                placeholder="请输入图标标题" />
        </div>

        <!-- 图标描述 -->
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><Document /></el-icon>
                图标描述
            </label>
            <el-input
                v-model="fields.sg_icon_description"
                show-word-limit
                type="textarea"
                :rows="3"
                @input="onUpdate('sg_icon_description', fields.sg_icon_description)"
                placeholder="请输入图标描述文本" />
        </div>

        <!-- 阅读更多按钮文本 -->
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><Link /></el-icon>
                按钮文本
            </label>
            <el-input
                v-model="fields.sg_readmore_button_label"
                @input="onUpdate('sg_readmore_button_label', fields.sg_readmore_button_label)"
                placeholder="请输入按钮文本" />
        </div>

        <!-- 徽章文本 -->
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><PriceTag /></el-icon>
                徽章文本
            </label>
            <el-input
                v-model="fields.sg_badge_text"
                @input="onUpdate('sg_badge_text', fields.sg_badge_text)"
                placeholder="请输入徽章文本" />
        </div>
    </div>
</template>

<script setup>
import { MagicStick, ChatDotSquare, Document, Link, PriceTag } from '@element-plus/icons-vue';

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

.__field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}
</style>
