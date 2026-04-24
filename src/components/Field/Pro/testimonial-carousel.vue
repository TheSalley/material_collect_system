<template>
  <div class="__field-item">
    <div class="flex items-center justify-between mb-3">
      <label class="__field-label">
        <el-icon><Promotion /></el-icon>
        <span>评论列表</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <el-button size="small" @click="addItem">新增</el-button>
    </div>

    <div
      v-for="(item, index) in list"
      :key="item?._id || index"
      class="border border-gray-200 rounded-lg mb-3 overflow-hidden"
    >
      <div
        class="icon-list-item-row flex items-center justify-between p-3 cursor-pointer bg-white"
        @click="toggleCollapse(index)"
      >
        <div class="flex items-center gap-3">
          <span class="icon-list-index px-2 py-0.5 rounded text-xs">{{
            index + 1
          }}</span>
          <span class="icon-list-title">{{ item.title || "未命名" }}</span>
        </div>
        <div class="flex items-center gap-2">
          <el-button
            size="small"
            @click.stop="removeItem(index)"
            :icon="Delete"
          >
            删除
          </el-button>
          <el-icon
            class="collapse-icon"
            :class="{ 'is-collapsed': collapsedItems.has(index) }"
          >
            <ArrowDown />
          </el-icon>
        </div>
      </div>

      <div v-show="!collapsedItems.has(index)" class="p-3 pb-3">
        <div class="__field-group">
          <label class="__field-label">标题</label>
          <el-input
            :model-value="item.title"
            placeholder="请输入标题"
            @update:model-value="v => setItemField(index, 'title', v)"
          />
        </div>
        <div class="__field-group">
          <label class="__field-label">姓名</label>
          <el-input
            :model-value="item.name"
            placeholder="请输入姓名"
            @update:model-value="v => setItemField(index, 'name', v)"
          />
        </div>
        <div class="__field-group">
          <label class="__field-label">内容</label>
          <el-input
            :model-value="item.content"
            placeholder="请输入内容"
            @update:model-value="v => setItemField(index, 'content', v)"
          />
        </div>
        <div class="__field-group">
          <label class="__field-label">图片</label>
          <ImageWp
            :model-value="item.image"
            :node-id="nodeId"
            :show-size-config="true"
            :width="100"
            @update:model-value="(newValue) => setItemField(index, 'image', newValue)"
          />
        </div>
      </div>
    </div>

    <el-empty
      v-if="!list.length"
      description="暂无列表内容"
      :image-size="60"
    />
  </div>
</template>

<script setup>
import { computed, reactive, inject } from "vue";
import { Promotion, Delete, ArrowDown } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import { genId } from "@/utils";
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

const list = computed(() => (Array.isArray(props.fields?.slides) ? props.fields.slides : []));

const collapsedItems = reactive(new Set());

function toggleCollapse(index) {
  collapsedItems.has(index) ? collapsedItems.delete(index) : collapsedItems.add(index);
}

function emitItems(next) {
  props.onUpdate("slides", next);
}

function addItem() {
  emitItems([
    ...list.value,
    { title: "", name: "", content: "", _id: genId() },
  ]);
}

function removeItem(index) {
  emitItems(list.value.filter((_, i) => i !== index));
}

function setItemField(index, key, value) {
  const next = list.value.map((item, i) =>
    i === index ? { ...item, [key]: value } : item
  );
  emitItems(next);
}
</script>

<style scoped>
/* 保留自定义的过渡和颜色变量样式 */
.icon-list-item-row {
  transition: background-color 0.2s;
}

.icon-list-item-row:hover {
  background: var(--field-bg-hover);
}

.collapse-icon {
  transition: transform 0.3s;
  color: var(--field-label-color);
}

.collapse-icon.is-collapsed {
  transform: rotate(-90deg);
}

.icon-list-index {
  background: var(--el-color-primary);
  color: white;
  font-size: 12px;
}

.icon-list-title {
  font-weight: 500;
  color: var(--field-label-color);
}
</style>
