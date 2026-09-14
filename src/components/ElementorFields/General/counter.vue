<template>
  <div class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><DataAnalysis /></el-icon>
        <span>数字变化</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <div class="__field-group mt-3" v-if="hasField('ending_number')">
        <label class="__field-label">结束数字</label>
        <el-input
          v-model="fields.ending_number"
          type="number"
          placeholder="例如：100"
          @input="onUpdate('ending_number', fields.ending_number)"
        />
      </div>
      <div class="__field-group mt-3" v-if="hasField('suffix')">
        <label class="__field-label">后缀</label>
        <el-input
          v-model="fields.suffix"
          placeholder="例如：+ / %"
          @input="onUpdate('suffix', fields.suffix)"
        />
      </div>
      <div class="__field-group mt-3" v-if="hasField('title')">
        <label class="__field-label">标题</label>
        <el-input
          v-model="fields.title"
          placeholder="请输入文本"
          @input="onUpdate('title', fields.title)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
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

function hasField(key) {
  return Object.prototype.hasOwnProperty.call(props.fields, key);
}
</script>
