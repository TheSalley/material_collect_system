<template>
  <div class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <span>高亮标题</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <div class="__field-group" v-if="hasField('before_text')">
        <label class="__field-label">
          <el-icon>
            <Promotion />
          </el-icon>
          <span>普通文本</span>
        </label>
        <el-input
          v-model="fields.before_text"
          @input="onUpdate('before_text', fields.before_text)"
        />
      </div>
      <div class="__field-group" v-if="hasField('highlighted_text')">
        <label class="__field-label">
          <el-icon>
            <Promotion />
          </el-icon>
          <span>高亮文本</span>
        </label>
        <el-input
          v-model="fields.highlighted_text"
          @input="onUpdate('highlighted_text', fields.highlighted_text)"
        />
      </div>
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

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}
</script>
