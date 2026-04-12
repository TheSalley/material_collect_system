<template>
    <div class="__field-item">
        <div class="__field-group">
            <label class="__field-label">
                <el-icon>
                    <Promotion />
                </el-icon>
                <span>标题</span>
                <FieldWidgetType :type="widgetType" />
            </label>
            <el-input v-model="fields.title" placeholder="请输入标题内容" @input="onUpdate('title', fields.title)" />
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
