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
        <div
          v-if="hasItemField(item, 'sg_accordion_list_title')"
          class="__field-group"
        >
          <label class="__field-label">
            <el-icon><Edit /></el-icon>
            <span>标题</span>
          </label>
          <el-input
            :model-value="item.sg_accordion_list_title"
            placeholder="请输入标题"
            show-word-limit
            @update:model-value="
              (value) => setItemField(index, 'sg_accordion_list_title', value)
            "
          />
        </div>

        <div
          v-if="hasItemField(item, 'sg_accordion_list_content')"
          class="__field-group"
        >
          <label class="__field-label">
            <el-icon><Document /></el-icon>
            <span>内容</span>
          </label>
          <el-input
            :model-value="item.sg_accordion_list_content"
            type="textarea"
            :rows="5"
            placeholder="请输入内容"
            show-word-limit
            @update:model-value="
              (value) => setItemField(index, 'sg_accordion_list_content', value)
            "
          />
        </div>
      </div>
    </div>

    <el-empty v-if="!items.length" description="暂无折叠面板内容" :image-size="60" />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { ArrowDown, Delete, Document, Edit, Menu } from "@element-plus/icons-vue";
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
  Object.prototype.hasOwnProperty.call(props.fields, "sg_accordion_list")
);

const items = computed(() =>
  Array.isArray(props.fields?.sg_accordion_list) ? props.fields.sg_accordion_list : []
);

function hasItemField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function safeTitle(item, index) {
  const title =
    typeof item?.sg_accordion_list_title === "string"
      ? item.sg_accordion_list_title.trim()
      : "";

  return title || `面板 ${index + 1}`;
}

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function emitItems(next) {
  props.onUpdate("sg_accordion_list", next);
}

function addItem() {
  emitItems([
    ...items.value,
    {
      _id: genId(),
      sg_accordion_list_title: "",
      sg_accordion_list_content: "",
    },
  ]);
}

function removeItem(index) {
  emitItems(items.value.filter((_, itemIndex) => itemIndex !== index));
  collapsedItems.delete(index);
}

function setItemField(index, key, value) {
  emitItems(
    items.value.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    )
  );
}
</script>
