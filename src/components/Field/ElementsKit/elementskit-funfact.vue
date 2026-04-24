<template>
  <div class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><DataAnalysis /></el-icon>
        <span>数字变化</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <div class="__field-group mt-3" v-if="fields.ekit_funfact_number">
        <label class="__field-label">结束数字</label>
        <el-input
          v-model="fields.ekit_funfact_number"
          type="number"
          placeholder="例如：100"
          @input="onUpdate('ekit_funfact_number', fields.ekit_funfact_number)"
        />
      </div>
      <div class="__field-group mt-3" v-if="fields.ekit_funfact_number_suffix && fields.ekit_funfact_number_suffix !== ''">
        <label class="__field-label">后缀</label>
        <el-input
          v-model="fields.ekit_funfact_number_suffix"
          placeholder="例如：+ / %"
          @input="onUpdate('ekit_funfact_number_suffix', fields.ekit_funfact_number_suffix)"
        />
      </div>
      <div class="__field-group mt-3" v-if="fields.ekit_funfact_title_text !== ''">
        <label class="__field-label">标题</label>
        <el-input
          v-model="fields.ekit_funfact_title_text"
          placeholder="请输入文本"
          @input="onUpdate('ekit_funfact_title_text', fields.ekit_funfact_title_text)"
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
</script>
