<template>
  <div v-if="hasLabelField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><Link /></el-icon>
        <span>按钮</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div class="__field-group">
        <label class="__field-label">按钮文本</label>
        <el-input
          :model-value="fields.sg_content_label"
          placeholder="请输入按钮文本"
          show-word-limit
          @update:model-value="(value) => updateField('sg_content_label', value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Link } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
  },
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

const hasLabelField = computed(() => {
  const value = props.fields?.sg_content_label;

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== undefined && value !== null && value !== "";
});

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
