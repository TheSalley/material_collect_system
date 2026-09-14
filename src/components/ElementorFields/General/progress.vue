<template>
  <div v-if="shouldShowField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><DataAnalysis /></el-icon>
        <span>进度条</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <div v-if="hasField('title')" class="__field-group mt-3">
        <label class="__field-label">标题</label>
        <el-input
          :model-value="fields.title"
          placeholder="请输入标题"
          show-word-limit
          @update:model-value="(value) => updateField('title', value)"
        />
      </div>

      <div v-if="hasField('inner_text')" class="__field-group mt-3">
        <label class="__field-label">进度文字</label>
        <el-input
          :model-value="fields.inner_text"
          placeholder="请输入进度文字"
          show-word-limit
          @update:model-value="(value) => updateField('inner_text', value)"
        />
      </div>

      <div v-if="hasField('percent')" class="__field-group mt-3">
        <label class="__field-label">百分比</label>
        <div class="flex items-center gap-2">
          <el-input-number
            :model-value="percentSize"
            :min="0"
            :max="100"
            @update:model-value="updatePercentSize"
          />
          <span>{{ percentUnit }}</span>
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

const percentObject = computed(() => {
  const value = props.fields.percent;

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return {
    unit: "%",
    size: Number(value) || 0,
    sizes: [],
  };
});

const percentSize = computed(() => Number(percentObject.value.size) || 0);

const percentUnit = computed(() => percentObject.value.unit || "%");

const shouldShowField = computed(
  () =>
    hasField("title") ||
    hasField("inner_text") ||
    hasField("percent"),
);

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}

function updateField(key, value) {
  props.onUpdate(key, value);
}

function updatePercentSize(value) {
  props.onUpdate("percent", {
    ...percentObject.value,
    size: Number(value) || 0,
  });
}
</script>
