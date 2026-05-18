<template>
  <div v-if="shouldShowField" class="__field-item">
    <div class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>画廊</span>
        <FieldWidgetType :type="widgetType" />
      </label>
    </div>

    <div v-if="hasFilterListField" class="mt-3">
      <div class="mb-3 flex items-center justify-between gap-3">
        <label class="__field-label">
          <el-icon><CollectionTag /></el-icon>
          <span>筛选列表</span>
        </label>

        <el-button size="small" type="primary" plain @click="addFilterItem">
          新增
        </el-button>
      </div>

      <div
        v-for="(item, index) in filterItems"
        :key="item?._id || index"
        class="mb-3 overflow-hidden rounded-lg border border-gray-200 last:mb-0"
      >
        <div
          class="flex cursor-pointer items-center justify-between gap-3 bg-white p-3 transition-colors hover:bg-[var(--field-bg-hover)]"
          @click="toggleFilterCollapse(index)"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="inline-flex min-w-6 items-center justify-center rounded bg-[var(--el-color-primary)] px-2 py-0.5 text-xs leading-5 text-white"
            >
              {{ index + 1 }}
            </span>
            <span class="truncate font-medium text-[var(--field-label-color)]">
              {{ safeFilterTitle(item, index) }}
            </span>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <el-button
              size="small"
              :icon="Delete"
              @click.stop="removeFilterItem(index)"
            >
              删除
            </el-button>
            <el-icon
              class="text-[var(--field-label-color)] transition-transform"
              :class="{ '-rotate-90': collapsedFilterItems.has(index) }"
            >
              <ArrowDown />
            </el-icon>
          </div>
        </div>

        <div v-show="!collapsedFilterItems.has(index)" class="space-y-3 p-3">
          <div
            v-if="hasItemField(item, 'sg_filter_list_name')"
            class="__field-group"
          >
            <label class="__field-label">
              <el-icon><CollectionTag /></el-icon>
              <span>筛选名称</span>
            </label>
            <el-input
              :model-value="item.sg_filter_list_name"
              placeholder="请输入筛选名称"
              show-word-limit
              @update:model-value="
                (value) => setFilterItemField(index, 'sg_filter_list_name', value)
              "
            />
          </div>
        </div>
      </div>

      <el-empty
        v-if="!filterItems.length"
        description="暂无筛选列表内容"
        :image-size="60"
      />
    </div>

    <div v-if="hasGalleryListField" class="mt-6">
      <div class="mb-3 flex items-center justify-between gap-3">
        <label class="__field-label">
          <el-icon><Picture /></el-icon>
          <span>画廊列表</span>
        </label>

        <el-button size="small" type="primary" plain @click="addGalleryItem">
          新增
        </el-button>
      </div>

      <div
        v-for="(item, index) in galleryItems"
        :key="item?._id || index"
        class="mb-3 overflow-hidden rounded-lg border border-gray-200 last:mb-0"
      >
        <div
          class="flex cursor-pointer items-center justify-between gap-3 bg-white p-3 transition-colors hover:bg-[var(--field-bg-hover)]"
          @click="toggleGalleryCollapse(index)"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="inline-flex min-w-6 items-center justify-center rounded bg-[var(--el-color-primary)] px-2 py-0.5 text-xs leading-5 text-white"
            >
              {{ index + 1 }}
            </span>
            <span class="truncate font-medium text-[var(--field-label-color)]">
              {{ safeGalleryTitle(item, index) }}
            </span>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <el-button
              size="small"
              :icon="Delete"
              @click.stop="removeGalleryItem(index)"
            >
              删除
            </el-button>
            <el-icon
              class="text-[var(--field-label-color)] transition-transform"
              :class="{ '-rotate-90': collapsedGalleryItems.has(index) }"
            >
              <ArrowDown />
            </el-icon>
          </div>
        </div>

        <div v-show="!collapsedGalleryItems.has(index)" class="space-y-3 p-3">
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
                (value) => setGalleryItemField(index, 'sg_gallery_list_image', value)
              "
            />
          </div>

          <div
            v-if="hasItemField(item, 'sg_gallery_list_control_name')"
            class="__field-group"
          >
            <label class="__field-label">
              <el-icon><CollectionTag /></el-icon>
              <span>控制名称</span>
            </label>
            <el-input
              :model-value="item.sg_gallery_list_control_name"
              placeholder="请输入控制名称"
              show-word-limit
              @update:model-value="
                (value) =>
                  setGalleryItemField(index, 'sg_gallery_list_control_name', value)
              "
            />
          </div>

          <div
            v-if="hasItemField(item, 'sg_gallery_list_item_name')"
            class="__field-group"
          >
            <label class="__field-label">
              <el-icon><Promotion /></el-icon>
              <span>项目名称</span>
            </label>
            <el-input
              :model-value="item.sg_gallery_list_item_name"
              placeholder="请输入项目名称"
              show-word-limit
              @update:model-value="
                (value) =>
                  setGalleryItemField(index, 'sg_gallery_list_item_name', value)
              "
            />
          </div>
        </div>
      </div>

      <el-empty
        v-if="!galleryItems.length"
        description="暂无画廊列表内容"
        :image-size="60"
      />
    </div>
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

const collapsedFilterItems = reactive(new Set());
const collapsedGalleryItems = reactive(new Set());

const hasFilterListField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "sg_filter_list"),
);

const hasGalleryListField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "sg_gallery_list"),
);

const shouldShowField = computed(
  () => hasFilterListField.value || hasGalleryListField.value,
);

const filterItems = computed(() =>
  Array.isArray(props.fields?.sg_filter_list) ? props.fields.sg_filter_list : [],
);

const galleryItems = computed(() =>
  Array.isArray(props.fields?.sg_gallery_list)
    ? props.fields.sg_gallery_list
    : [],
);

function hasItemField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function safeFilterTitle(item, index) {
  const title =
    typeof item?.sg_filter_list_name === "string"
      ? item.sg_filter_list_name.trim()
      : "";

  return title || `筛选 ${index + 1}`;
}

function safeGalleryTitle(item, index) {
  const itemName =
    typeof item?.sg_gallery_list_item_name === "string"
      ? item.sg_gallery_list_item_name.trim()
      : "";

  return itemName || `画廊项 ${index + 1}`;
}

function toggleFilterCollapse(index) {
  collapsedFilterItems.has(index)
    ? collapsedFilterItems.delete(index)
    : collapsedFilterItems.add(index);
}

function toggleGalleryCollapse(index) {
  collapsedGalleryItems.has(index)
    ? collapsedGalleryItems.delete(index)
    : collapsedGalleryItems.add(index);
}

function emitFilterItems(next) {
  props.onUpdate("sg_filter_list", next);
}

function emitGalleryItems(next) {
  props.onUpdate("sg_gallery_list", next);
}

function addFilterItem() {
  emitFilterItems([
    ...filterItems.value,
    {
      _id: genId(),
      sg_filter_list_name: "",
    },
  ]);
}

function addGalleryItem() {
  emitGalleryItems([
    ...galleryItems.value,
    {
      _id: genId(),
      sg_gallery_list_image: {
        id: "",
        url: "",
      },
      sg_gallery_list_control_name: "",
      sg_gallery_list_item_name: "",
    },
  ]);
}

function removeFilterItem(index) {
  emitFilterItems(filterItems.value.filter((_, itemIndex) => itemIndex !== index));
  collapsedFilterItems.delete(index);
}

function removeGalleryItem(index) {
  emitGalleryItems(
    galleryItems.value.filter((_, itemIndex) => itemIndex !== index),
  );
  collapsedGalleryItems.delete(index);
}

function setFilterItemField(index, key, value) {
  emitFilterItems(
    filterItems.value.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    ),
  );
}

function setGalleryItemField(index, key, value) {
  emitGalleryItems(
    galleryItems.value.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    ),
  );
}
</script>
