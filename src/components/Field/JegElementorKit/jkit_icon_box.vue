<template>
  <div class="__field-item">
    <div class="flex items-center gap-2">
      <span>Icon box</span>
      <FieldWidgetType :type="widgetType" />
    </div>
    <div class="__field-group" v-if="settings?.sg_icon_text !== ''">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>标题</span>
      </label>
      <el-input
        v-model="fields.sg_icon_text"
        @input="onUpdate('sg_icon_text', fields.sg_icon_text)"
        placeholder="请输入"
      />
    </div>
    <div class="__field-group" v-if="settings?.sg_icon_description !== ''">
      <label class="__field-label">
        <el-icon><Promotion /></el-icon>
        <span>描述</span>
      </label>
      <el-input
        v-model="fields.sg_icon_description"
        show-word-limit
        type="textarea"
        :rows="3"
        @input="onUpdate('sg_icon_description', fields.sg_icon_description)"
        placeholder="请输入"
      />
    </div>
    <div
      class="__field-group"
      v-if="settings?.sg_readmore_enable_button === 'yes' && fields.sg_readmore_button_label !== ''"
    >
      <label class="__field-label">
        <el-icon><Link /></el-icon>
        按钮文本
      </label>
      <el-input
        v-model="fields.sg_readmore_button_label"
        @input="
          onUpdate('sg_readmore_button_label', fields.sg_readmore_button_label)
        "
        placeholder="请输入"
      />
    </div>
    <div class="__field-group" v-if="settings?.sg_badge_show === 'yes' && fields.sg_badge_text !== ''">
      <label class="__field-label">
        <el-icon><PriceTag /></el-icon>
        徽章文本
      </label>
      <el-input
        v-model="fields.sg_badge_text"
        @input="onUpdate('sg_badge_text', fields.sg_badge_text)"
        placeholder="请输入"
      />
    </div>
  </div>
</template>

<script setup>
import { Promotion, Link, PriceTag } from "@element-plus/icons-vue";
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
  /** 原始节点 settings（含控制字段如 sg_readmore_enable_button） */
  settings: {
    type: Object,
    default: () => ({}),
  },
  onUpdate: {
    type: Function,
    required: true,
  },
});
</script>
