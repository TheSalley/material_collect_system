<template>
  <div v-if="hasVideoField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><VideoPlay /></el-icon>
        <span>视频按钮</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <div class="__field-group">
        <label class="__field-label">视频链接</label>
        <el-input
          :model-value="fields.sg_video_url"
          placeholder="请输入视频链接"
          show-word-limit
          @update:model-value="(value) => updateField('sg_video_url', value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { VideoPlay } from "@element-plus/icons-vue";
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

const hasVideoField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "sg_video_url"),
);

function updateField(key, value) {
  props.onUpdate(key, value);
}
</script>
