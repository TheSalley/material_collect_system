<template>
  <div v-if="hasItemsField" class="__field-item">
    <div class="mb-3 flex items-center justify-between gap-3">
      <label class="__field-label">
        <el-icon><Menu /></el-icon>
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
            {{ safeTitle(item, index) }}
          </span>
        </div>

        <div class="flex shrink-0 items-center gap-2" @click.stop>
          <el-button
            size="small"
            :icon="ArrowUp"
            :disabled="index === 0"
            @click="moveItem(index, -1)"
          />
          <el-button
            size="small"
            :icon="ArrowDown"
            :disabled="index === items.length - 1"
            @click="moveItem(index, 1)"
          />
          <el-button
            size="small"
            type="danger"
            :icon="Delete"
            @click="removeItem(index)"
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
          <label class="__field-label">
            <el-icon><Edit /></el-icon>
            <span>标题</span>
          </label>
          <el-input
            :model-value="item?.acc_title || ''"
            placeholder="请输入标题"
            @update:model-value="
              (value) => setItemField(index, 'acc_title', value)
            "
          />
        </div>

        <div class="__field-group">
          <label class="__field-label">
            <el-icon><Document /></el-icon>
            <span>内容</span>
          </label>
          <el-input
            :model-value="item?.acc_content || ''"
            type="textarea"
            :rows="5"
            placeholder="请输入内容..."
            @update:model-value="
              (value) => setItemField(index, 'acc_content', value)
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
import {
  ArrowDown,
  ArrowUp,
  Delete,
  Document,
  Edit,
  Menu,
} from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
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

const collapsedItems = reactive(new Set());

const hasItemsField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "ekit_accordion_items")
);

const items = computed(() => {
  const value = props.fields?.ekit_accordion_items;
  return Array.isArray(value) ? value : [];
});

function emitItems(next) {
  props.onUpdate("ekit_accordion_items", next);
}

function safeTitle(item, index) {
  const title =
    typeof item?.acc_title === "string" ? item.acc_title.trim() : "";
  return title || `手风琴 ${index + 1}`;
}

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function setItemField(index, key, value) {
  emitItems(
    items.value.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    )
  );
}

function removeItem(index) {
  emitItems(items.value.filter((_, itemIndex) => itemIndex !== index));
  collapsedItems.delete(index);
}

function moveItem(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.value.length) return;

  const next = items.value.slice();
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  emitItems(next);
}

function addItem() {
  emitItems([
    ...items.value,
    {
      _id: genId(),
      acc_title: "",
      acc_content: "",
    },
  ]);
}
</script>
