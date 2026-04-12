<template>
  <div class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><Link /></el-icon>
        <span>按钮文案</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <el-input
        v-model="fields.text"
        placeholder="请输入"
        @input="onUpdate('text', fields.text)"
      />
    </div>
  </div>
</template>

<script setup>
import { Link } from "@element-plus/icons-vue";
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

<style scoped></style>
