<template>
  <div v-if="hasItemsField" class="__field-item">
    <div class="mb-3 flex items-center justify-between gap-3">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>作品画廊</span>
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
          v-if="hasItemField(item, 'sg_gallery_list_image')"
          class="__field-group"
        >
          <label class="__field-label">
            <el-icon><Picture /></el-icon>
            <span>图片</span>
          </label>
          <ImageWp
            :model-value="item.sg_gallery_list_image"
            :node-id="nodeId"
            :show-size-config="true"
            :width="180"
            @update:model-value="
              (value) => setItemField(index, 'sg_gallery_list_image', value)
            "
          />
        </div>

        <div
          v-if="hasItemField(item, 'sg_gallery_list_title')"
          class="__field-group"
        >
          <label class="__field-label">
            <el-icon><Promotion /></el-icon>
            <span>标题</span>
          </label>
          <el-input
            :model-value="item.sg_gallery_list_title"
            placeholder="请输入标题"
            show-word-limit
            @update:model-value="
              (value) => setItemField(index, 'sg_gallery_list_title', value)
            "
          />
        </div>

        <div
          v-if="hasItemField(item, 'sg_gallery_list_subtitle')"
          class="__field-group"
        >
          <label class="__field-label">
            <el-icon><CollectionTag /></el-icon>
            <span>副标题</span>
          </label>
          <el-input
            :model-value="item.sg_gallery_list_subtitle"
            placeholder="请输入副标题"
            show-word-limit
            @update:model-value="
              (value) => setItemField(index, 'sg_gallery_list_subtitle', value)
            "
          />
        </div>
      </div>
    </div>

    <el-empty v-if="!items.length" description="暂无作品画廊内容" :image-size="60" />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import {
  ArrowDown,
  CollectionTag,
  Delete,
  Picture,
  Promotion,
} from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import ImageWp from "@/components/Common/imageWp.vue";
import { genId } from "@/utils";

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

const collapsedItems = reactive(new Set());

const hasItemsField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "sg_gallery_list"),
);

const items = computed(() =>
  Array.isArray(props.fields?.sg_gallery_list) ? props.fields.sg_gallery_list : []
);

function hasItemField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function safeTitle(item, index) {
  const title =
    typeof item?.sg_gallery_list_title === "string"
      ? item.sg_gallery_list_title.trim()
      : "";

  return title || `作品 ${index + 1}`;
}

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function emitItems(next) {
  props.onUpdate("sg_gallery_list", next);
}

function addItem() {
  emitItems([
    ...items.value,
    {
      _id: genId(),
      sg_gallery_list_image: {
        id: "",
        url: "",
      },
      sg_gallery_list_title: "",
      sg_gallery_list_subtitle: "",
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
