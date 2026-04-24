<template>
    <div class="__field-item" v-if="fields.look === 'line_text' && fields.text !== ''">
        <div class="__field-group">
            <label class="__field-label">
                <el-icon>
                    <Promotion />
                </el-icon>
                <span>分割线内容</span>
                <FieldWidgetType :type="widgetType" />
            </label>
            <el-input v-model="fields.text" placeholder="请输入分割线内容" @input="onUpdate('text', fields.text)" />
        </div>
    </div>
</template>

<script setup>
import { Promotion } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";

const props = defineProps({
    widgetType: {
        type: String,
        required: true,
    },
    fields: {
        type: Object,
        required: true,
    },
    onUpdate: {
        type: Function,
        required: true,
    },
});
</script>
