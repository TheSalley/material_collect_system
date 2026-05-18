<template>
  <div v-if="shouldShowField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><DataAnalysis /></el-icon>
        <span>进度条</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div v-if="hasField('sg_progress_title')" class="__field-group mt-3">
        <label class="__field-label">标题</label>
        <el-input
          :model-value="fields.sg_progress_title"
          placeholder="请输入标题"
          show-word-limit
          @update:model-value="(value) => updateField('sg_progress_title', value)"
        />
      </div>

      <div
        v-if="hasField('sg_progress_percentage')"
        class="__field-group mt-3"
      >
        <label class="__field-label">百分比</label>
        <div class="flex items-center gap-2">
          <el-input-number
            :model-value="progressSize"
            :min="0"
            :max="100"
            @update:model-value="updateProgressSize"
          />
          <span>%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { DataAnalysis } from "@element-plus/icons-vue";
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

const progressObject = computed(() => {
  const value = props.fields.sg_progress_percentage;

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return {
    size: Number(value) || 0,
  };
});

const progressSize = computed(() => Number(progressObject.value.size) || 0);

const shouldShowField = computed(
  () => hasField("sg_progress_title") || hasField("sg_progress_percentage"),
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}

function updateProgressSize(value) {
  props.onUpdate("sg_progress_percentage", {
    ...progressObject.value,
    size: Number(value) || 0,
  });
}
</script>
