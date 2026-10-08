<template>
  <div class="__field-item" v-if="hasField('youtube_url')">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><Link /></el-icon>
        <span class="__field-label">Youtube 视频链接：</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <el-input
        v-model="fields.youtube_url"
        @input="onUpdate('youtube_url', fields.youtube_url)"
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

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}
</script>
<style scoped></style>
