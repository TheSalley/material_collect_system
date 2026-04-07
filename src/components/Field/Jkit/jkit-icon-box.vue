<template>
    <div class="field-item">
        <!-- 图标标题 -->
        <div class="mb-4">
            <label class="field-label">标题</label>
            <el-input
                v-model="fields.sg_icon_text"
                @input="onUpdate('sg_icon_text', fields.sg_icon_text)"
                placeholder="请输入图标标题" />
        </div>

        <!-- 图标描述 -->
        <div class="mb-4">
            <label class="field-label">描述</label>
            <el-input
                v-model="fields.sg_icon_description"
                show-word-limit
                type="textarea"
                :rows="3"
                @input="onUpdate('sg_icon_description', fields.sg_icon_description)"
                placeholder="请输入图标描述文本" />
        </div>

        <!-- 阅读更多按钮文本 -->
        <div class="mb-4" v-if="settings?.sg_readmore_enable_button === 'yes'">
            <label class="field-label">
                <el-icon><Link /></el-icon>
                按钮文本
            </label>
            <el-input
                v-model="fields.sg_readmore_button_label"
                @input="onUpdate('sg_readmore_button_label', fields.sg_readmore_button_label)"
                placeholder="请输入按钮文本" />
        </div>

        <!-- 徽章文本 -->
        <div class="mb-4" v-if="settings?.sg_badge_show === 'yes'">
            <label class="field-label">
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
import { ChatDotSquare, Document, Link, PriceTag } from "@element-plus/icons-vue";

const props = defineProps({
    nodeId: {
        type: String,
        required: true,
    },
    fields: {
        type: Object,
        required: true,
    },
    /** 原始节点 settings（含控制字段如 sg_readmore_enable_button） */
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}
</style>
