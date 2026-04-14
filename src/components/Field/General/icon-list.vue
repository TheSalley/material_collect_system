<template>
  <div class="__field-item">
    <div class="icon-list-header">
      <label class="__field-label">
        <el-icon><Promotion /></el-icon>
        <span>列表</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <el-button size="small" @click="addItem">新增</el-button>
    </div>

    <div v-for="(item, index) in iconList" :key="item?._id || index" class="icon-list-item">
      <div class="icon-list-item-row" @click="toggleCollapse(index)">
        <div class="icon-list-item-left">
          <span class="icon-list-index">{{ index + 1 }}</span>
          <span class="icon-list-title">{{ item.text || '未命名' }}</span>
        </div>
        <div class="icon-list-item-actions">
          <el-button
            size="small"
            @click.stop="removeItem(index)"
            :icon="Delete">
            删除
          </el-button>
          <el-icon class="collapse-icon" :class="{ 'is-collapsed': collapsedItems.has(index) }">
            <ArrowDown />
          </el-icon>
        </div>
      </div>

      <div v-show="!collapsedItems.has(index)" class="icon-list-item-content">
        <div class="__field-group mt-3">
          <label class="__field-label">标题</label>
          <el-input
            v-model="item.text"
            placeholder="请输入标题"
            @input="setItemField(index, 'text', item.text)"
          />
        </div>
      </div>
    </div>

    <el-empty v-if="!iconList.length" description="暂无列表内容" :image-size="60" />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { Promotion, Delete, ArrowDown } from "@element-plus/icons-vue";
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

const iconList = computed(() => {
  const v = props.fields?.icon_list;
  return Array.isArray(v) ? v : [];
});

const collapsedItems = reactive(new Set());

function toggleCollapse(index) {
  if (collapsedItems.has(index)) {
    collapsedItems.delete(index);
  } else {
    collapsedItems.add(index);
  }
}

function emitItems(next) {
  props.onUpdate("icon_list", next);
}

function genId() {
  return Math.random().toString(36).substring(2, 10);
}

function addItem() {
  const next = iconList.value.slice();
  next.push({
    text: "",
    _id: genId(),
  });
  emitItems(next);
}

function removeItem(index) {
  const next = iconList.value.filter((_, i) => i !== index);
  emitItems(next);
}

function setItemField(index, key, value) {
  const next = iconList.value.slice();
  const cur = next[index] && typeof next[index] === "object" ? { ...next[index] } : {};
  cur[key] = value;
  next[index] = cur;
  emitItems(next);
}
</script>

<style scoped>
.icon-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.icon-list-item {
  border: 1px solid var(--field-border-color);
  border-radius: 6px;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.icon-list-item:last-child {
  margin-bottom: 0;
}

.icon-list-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  cursor: pointer;
  background: white;
  transition: background-color 0.2s;
}

.icon-list-item-row:hover {
  background: var(--field-bg-hover);
}

.icon-list-item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-list-index {
  background: var(--el-color-primary);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.icon-list-title {
  font-weight: 500;
  color: var(--field-label-color);
}

.icon-list-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.collapse-icon {
  transition: transform 0.3s;
  color: var(--field-label-color);
}

.collapse-icon.is-collapsed {
  transform: rotate(-90deg);
}

.icon-list-item-content {
  padding: 0 0.75rem 0.75rem;
}

.mt-3 {
  margin-top: 0.75rem;
}
</style>
