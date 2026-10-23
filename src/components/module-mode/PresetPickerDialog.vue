<template>
  <el-dialog
    :model-value="modelValue"
    title="预设素材 · 手动挑选"
    width="980px"
    top="5vh"
    :append-to-body="true"
    class="preset-picker"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @closed="handleClosed"
  >
    <div class="preset-picker__body">
      <!-- 左栏：内容包 -->
      <div class="preset-picker__packs">
        <div class="preset-picker__head">
          <h4>1. 选内容包</h4>
          <span class="preset-picker__hint">按行业浏览</span>
        </div>
        <el-radio-group v-model="activeCategory" size="small" class="preset-picker__cats">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button v-for="cat in categories" :key="cat.key" :value="cat.key">
            {{ cat.name }}
          </el-radio-button>
        </el-radio-group>
        <div class="preset-picker__packs-list">
          <button
            v-for="group in filteredGroups"
            :key="group.id"
            type="button"
            class="preset-pack"
            :class="{ 'is-active': selectedGroupId === group.id }"
            @click="selectGroup(group.id)"
          >
            <span class="preset-pack__name">{{ group.name }}</span>
            <span class="preset-pack__desc">{{ group.desc }}</span>
            <span class="preset-pack__meta">
              {{ group.images?.length || 0 }} 图 · {{ group.texts?.length || 0 }} 文
            </span>
          </button>
          <el-empty v-if="filteredGroups.length === 0" description="该行业还没有内容包" :image-size="56" />
        </div>
      </div>

      <!-- 右栏：字段选择 -->
      <div class="preset-picker__fields">
        <div class="preset-picker__head">
          <h4>2. 给每个素材挑替换</h4>
          <span class="preset-picker__hint">点图片或文案选中，没点的保持不变</span>
        </div>
        <div v-if="!selectedGroup" class="preset-picker__placeholder">先在左侧选一个内容包</div>
        <div v-else-if="currentFields.length === 0" class="preset-picker__placeholder">这个组件没有可替换的图文素材</div>
        <template v-else>
          <div v-for="f in currentFields" :key="f.key" class="preset-field">
            <div class="preset-field__head">
              <span class="preset-field__label">{{ f.label }}</span>
              <span class="preset-field__badge" :class="f.isImage ? 'is-image' : 'is-text'">{{ f.isImage ? "图片" : "文案" }}</span>
              <span v-if="f.isImage && f.stringValue" class="preset-field__cur-thumb">
                <el-image :src="f.stringValue" fit="cover" />
              </span>
              <span v-else-if="!f.isImage && f.preview" class="preset-field__cur-text">{{ f.preview }}</span>
              <span v-else class="preset-field__cur-text">（空）</span>
              <el-button v-if="selections[f.key]" type="danger" link size="small" @click="clearSelection(f.key)">清除</el-button>
            </div>
            <!-- 图片字段：从包内图片挑 -->
            <div v-if="f.isImage" class="preset-field__imgs">
              <button
                v-for="(img, i) in selectedGroup.images || []"
                :key="i"
                type="button"
                class="preset-img-opt"
                :class="{ 'is-active': selections[f.key]?.index === i }"
                :title="img.name || img.url"
                @click="selectForField(f, 'image', i)"
              >
                <el-image :src="img.url" fit="cover" />
                <span v-if="img.name" class="preset-img-opt__name">{{ img.name }}</span>
              </button>
              <span v-if="!(selectedGroup.images || []).length" class="preset-field__empty">这个包里没有图片</span>
            </div>
            <!-- 文案字段：从包内文案挑 -->
            <div v-else class="preset-field__texts">
              <button
                v-for="(t, i) in selectedGroup.texts || []"
                :key="i"
                type="button"
                class="preset-text-opt"
                :class="{ 'is-active': selections[f.key]?.index === i }"
                @click="selectForField(f, 'text', i)"
              >
                <span class="preset-text-opt__title">{{ t.title || "文案" }}</span>
                <span class="preset-text-opt__content">{{ t.content }}</span>
              </button>
              <span v-if="!(selectedGroup.texts || []).length" class="preset-field__empty">这个包里没有文案</span>
            </div>
            <div v-if="selections[f.key]" class="preset-field__picked">
              ✓ {{ selectionSummary(f) }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <template #footer>
      <div class="preset-picker__footer">
        <span class="preset-picker__count">{{ pickedCount }} / {{ currentFields.length }} 已选</span>
        <el-button @click="emit('update:modelValue', false)">取消</el-button>
        <el-button type="primary" :disabled="pickedCount === 0" @click="handleApply">应用已选素材</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { getPresetData, buildImageFieldValue } from "@/utils/presetContentData.js";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // 当前组件可替换字段：[{ key, label, nodeId, value, isImage, stringValue, preview }]
  currentFields: { type: Array, default: () => [] },
  // 预设数据（由父级打开弹窗时读取，保证管理页新增内容能同步）
  presetData: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "apply"]);

const activeCategory = ref("all");
const selectedGroupId = ref(null);
// 每个字段的手动选择：{ [fieldKey]: { type: "image"|"text", index, item } }
const selections = reactive({});

const dataSource = computed(() => props.presetData || getPresetData());
const categories = computed(() => dataSource.value.categories || []);
const groups = computed(() => dataSource.value.groups || []);

const filteredGroups = computed(() => {
  if (activeCategory.value === "all") return groups.value.filter((g) => g.enabled);
  return groups.value.filter((g) => g.enabled && g.category === activeCategory.value);
});

const selectedGroup = computed(() =>
  groups.value.find((g) => g.id === selectedGroupId.value) || null
);

function selectGroup(id) {
  selectedGroupId.value = id;
}

function selectForField(field, type, index) {
  const source = type === "image" ? selectedGroup.value.images : selectedGroup.value.texts;
  const item = source?.[index];
  if (!item) return;
  selections[field.key] = { type, index, item };
}

function clearSelection(key) {
  delete selections[key];
}

function selectionSummary(f) {
  const s = selections[f.key];
  if (!s) return "";
  if (s.type === "image") return "图片：" + (s.item.name || s.item.url);
  return "文案：" + (s.item.title ? s.item.title + " — " : "") + s.item.content;
}

const pickedCount = computed(() => Object.keys(selections).length);

function handleApply() {
  const updates = [];
  for (const field of props.currentFields) {
    const sel = selections[field.key];
    if (!sel) continue;
    if (sel.type === "image") {
      updates.push({
        nodeId: field.nodeId,
        fieldName: field.key,
        value: buildImageFieldValue(field.value, sel.item),
      });
    } else {
      updates.push({
        nodeId: field.nodeId,
        fieldName: field.key,
        value: sel.item.content,
      });
    }
  }
  if (updates.length === 0) return;
  emit("apply", updates);
  emit("update:modelValue", false);
  ElMessage.success("已把 " + updates.length + " 处预设素材填入组件");
}

function handleClosed() {
  selectedGroupId.value = null;
  activeCategory.value = "all";
  for (const k of Object.keys(selections)) delete selections[k];
}
</script>

<style scoped>
.preset-picker__body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 18px;
  height: 62vh;
  min-height: 420px;
}
.preset-picker__packs,
.preset-picker__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
.preset-picker__fields {
  overflow-y: auto;
  padding-right: 4px;
}
.preset-picker__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
}
.preset-picker__head h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.preset-picker__hint {
  font-size: 11px;
  color: #909399;
}
.preset-picker__cats {
  flex-shrink: 0;
}
.preset-picker__packs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  min-height: 0;
}
.preset-pack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}
.preset-pack:hover {
  border-color: #409eff;
}
.preset-pack.is-active {
  border-color: #409eff;
  background: #ecf5ff;
}
.preset-pack__name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.preset-pack__desc {
  font-size: 11px;
  color: #909399;
}
.preset-pack__meta {
  font-size: 11px;
  color: #409eff;
}
.preset-picker__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 1px dashed #e4e7ed;
  border-radius: 10px;
  color: #909399;
  font-size: 13px;
}
.preset-field {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preset-field__head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.preset-field__label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.preset-field__badge {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
}
.preset-field__badge.is-image {
  background: #ecf5ff;
  color: #409eff;
}
.preset-field__badge.is-text {
  background: #fdf6ec;
  color: #e6a23c;
}
.preset-field__cur-thumb {
  width: 44px;
  height: 30px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.preset-field__cur-thumb :deep(.el-image) {
  width: 100%;
  height: 100%;
}
.preset-field__cur-text {
  font-size: 11px;
  color: #909399;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preset-field__imgs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.preset-img-opt {
  position: relative;
  width: 88px;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.2s ease;
}
.preset-img-opt :deep(.el-image) {
  width: 100%;
  height: 56px;
  display: block;
}
.preset-img-opt:hover {
  border-color: #a0cfff;
}
.preset-img-opt.is-active {
  border-color: #409eff;
}
.preset-img-opt__name {
  display: block;
  font-size: 10px;
  color: #606266;
  padding: 2px 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preset-field__texts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preset-text-opt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.preset-text-opt:hover {
  border-color: #a0cfff;
}
.preset-text-opt.is-active {
  border-color: #409eff;
  background: #ecf5ff;
}
.preset-text-opt__title {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
}
.preset-text-opt__content {
  font-size: 12px;
  color: #606266;
}
.preset-field__empty {
  font-size: 12px;
  color: #c0c4cc;
}
.preset-field__picked {
  font-size: 12px;
  color: #67c23a;
}
.preset-picker__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.preset-picker__count {
  margin-right: auto;
  font-size: 12px;
  color: #909399;
}
</style>
