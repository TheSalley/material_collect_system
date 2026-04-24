<template>
  <div class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>图片</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <ImageWp
        :model-value="fields.image"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="handleUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { Picture } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import ImageWp from "@/components/Common/imageWp.vue";

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

function handleUpdate(newImageData) {
  props.onUpdate("image", newImageData);
}
</script>
