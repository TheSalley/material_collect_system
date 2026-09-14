<template>
  <div v-if="hasTabsField" class="__field-item">
    <div class="mb-3 flex items-center justify-between gap-3">
      <label class="__field-label">
        <el-icon>
          <Menu />
        </el-icon>
        <span>折叠面板</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <el-button size="small" type="primary" plain @click="addItem">
        新增
      </el-button>
    </div>

    <div
      v-for="(item, index) in items"
      :key="item?._id || index"
      class="mb-3 overflow-hidden rounded-lg border border-gray-200 last:mb-0"
    >
      <div
        class="flex cursor-pointer items-center justify-between gap-3 bg-white p-3 transition-colors hover:bg-[var(--field-bg-hover)]"
        @click="toggleCollapse(index)"
      >
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="inline-flex min-w-6 items-center justify-center rounded bg-[var(--el-color-primary)] px-2 py-0.5 text-xs leading-5 text-white"
          >
            {{ index + 1 }}
          </span>
          <span class="truncate font-medium text-[var(--field-label-color)]">
            {{ item.tab_title || "未命名" }}
          </span>
        </div>

        <div class="flex shrink-0 items-center gap-3">
          <el-button
            size="small"
            :icon="Delete"
            @click.stop="removeItem(index)"
          >
            删除
          </el-button>
          <el-icon
            class="text-[var(--field-label-color)] transition-transform"
            :class="{ '-rotate-90': collapsedItems.has(index) }"
          >
            <ArrowDown />
          </el-icon>
        </div>
      </div>

      <div v-show="!collapsedItems.has(index)" class="space-y-3 p-3">
        <div class="__field-group">
          <label class="__field-label">标题</label>
          <el-input
            :model-value="item.tab_title"
            placeholder="请输入标题"
            @update:model-value="
              (value) => setItemField(index, 'tab_title', value)
            "
          />
        </div>

        <div class="__field-group">
          <label class="__field-label">内容</label>
          <QuillEditor
            :node-id="editorNodeId(index)"
            :model-value="item.tab_content"
            placeholder="请输入内容..."
            @update:model-value="
              (value) => setItemField(index, 'tab_content', value)
            "
          />
        </div>
      </div>
    </div>

    <el-empty
      v-if="!items.length"
      description="暂无折叠面板内容"
      :image-size="60"
    />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { Menu, Delete, ArrowDown } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import QuillEditor from "@/components/QuillEditor.vue";
import { genId } from "@/utils";

const props = defineProps({
  nodeId: {
    type: String,
    default: "",
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

const hasTabsField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "tabs")
);

const items = computed(() =>
  Array.isArray(props.fields?.tabs) ? props.fields.tabs : []
);

const collapsedItems = reactive(new Set());

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function emitItems(next) {
  props.onUpdate("tabs", next);
}

function addItem() {
  emitItems([
    ...items.value,
    {
      tab_title: "",
      tab_content: "",
      _id: genId(),
    },
  ]);
}

function removeItem(index) {
  emitItems(items.value.filter((_, itemIndex) => itemIndex !== index));
  collapsedItems.delete(index);
}

function setItemField(index, key, value) {
  const next = items.value.map((item, itemIndex) =>
    itemIndex === index ? { ...item, [key]: value } : item
  );
  emitItems(next);
}

function editorNodeId(index) {
  return `${props.nodeId || props.widgetType}_tab_${index}`;
}
</script>
