<script setup>
import { computed } from "vue";
import { Menu, Delete, ArrowUp, ArrowDown, Plus, Document, Edit, CircleCheck } from "@element-plus/icons-vue";
import { genId } from "@/utils";

const props = defineProps({
  nodeId: {
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

const items = computed(() => {
  const v = props.fields?.ekit_accordion_items;
  return Array.isArray(v) ? v : [];
});

function emitItems(next) {
  props.onUpdate("ekit_accordion_items", next);
}

function safeTitle(it, idx) {
  const t = typeof it?.acc_title === "string" ? it.acc_title.trim() : "";
  return t || `手风琴 ${idx + 1}`;
}

function setItemField(idx, key, value) {
  const next = items.value.slice();
  const cur = next[idx] && typeof next[idx] === "object" ? { ...next[idx] } : {};
  cur[key] = value;
  next[idx] = cur;
  emitItems(next);
}

function removeAt(idx) {
  const next = items.value.filter((_, i) => i !== idx);
  emitItems(next);
}

function move(idx, dir) {
  const next = items.value.slice();
  const to = idx + dir;
  if (to < 0 || to >= next.length) return;
  const [it] = next.splice(idx, 1);
  next.splice(to, 0, it);
  emitItems(next);
}

function addItem() {
  const next = items.value.slice();
  next.push({
    acc_title: "新标题",
    acc_content: "<p>请输入内容</p>",
    ekit_acc_is_active: "",
    _id: genId(),
  });
  emitItems(next);
}
</script>

<template>
  <div class="__field-item">
    <div class="header">
      <label class="__field-label">
        <el-icon><Menu /></el-icon>
        手风琴（Elementskit）
      </label>
      <el-button type="primary" :icon="Plus" size="small" @click="addItem">新增一项</el-button>
    </div>

    <div v-if="items.length" class="list">
      <el-collapse accordion>
        <el-collapse-item v-for="(it, idx) in items" :key="it?._id || idx" :name="it?._id || idx">
          <template #title>
            <div class="row-title">
              <span class="row-title__text">{{ safeTitle(it, idx) }}</span>
              <div class="row-title__actions" @click.stop>
                <el-button
                  size="small"
                  :icon="ArrowUp"
                  :disabled="idx === 0"
                  @click="move(idx, -1)"
                />
                <el-button
                  size="small"
                  :icon="ArrowDown"
                  :disabled="idx === items.length - 1"
                  @click="move(idx, 1)"
                />
                <el-button size="small" type="danger" :icon="Delete" @click="removeAt(idx)" />
              </div>
            </div>
          </template>

          <div class="form">
            <div class="mb-3">
              <label class="sub-label">
                <el-icon><Edit /></el-icon>
                标题
              </label>
              <el-input
                :model-value="it?.acc_title || ''"
                placeholder="请输入标题"
                @input="(v) => setItemField(idx, 'acc_title', v)"
              />
            </div>

            <div class="mb-3">
              <label class="sub-label">
                <el-icon><Document /></el-icon>
                内容（HTML）
              </label>
              <el-input
                :model-value="it?.acc_content || ''"
                type="textarea"
                :rows="5"
                placeholder="请输入内容（支持 HTML）"
                @input="(v) => setItemField(idx, 'acc_content', v)"
              />
            </div>

            <div class="mb-1">
              <label class="sub-label">
                <el-icon><CircleCheck /></el-icon>
                默认展开
              </label>
              <el-switch
                :model-value="it?.ekit_acc_is_active === 'yes'"
                @change="(v) => setItemField(idx, 'ekit_acc_is_active', v ? 'yes' : '')"
              />
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div v-else class="empty">
      <el-empty description="暂无手风琴内容" :image-size="72" />
    </div>
  </div>
</template>

<style scoped>
.__field-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.__field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #303133;
}

.__field-label .el-icon {
  color: var(--el-color-primary);
  font-size: 1.1rem;
}

.list {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.row-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}

.row-title__text {
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-title__actions {
  display: flex;
  gap: 0.4rem;
}

.form {
  padding: 0.25rem 0;
}

.sub-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #606266;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.empty {
  padding: 0.25rem 0;
}
</style>

