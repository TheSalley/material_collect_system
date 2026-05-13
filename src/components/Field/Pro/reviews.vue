<template>
  <div v-if="hasSlidesField" class="__field-item">
    <div class="mb-3 flex items-center justify-between gap-3">
      <label class="__field-label">
        <el-icon><ChatDotRound /></el-icon>
        <span>评论列表</span>
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
            {{ item.name || item.title || "未命名" }}
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
        <div v-if="hasItemField(item, 'image')" class="__field-group">
          <label class="__field-label">图片</label>
          <ImageWp
            :model-value="item.image"
            :node-id="nodeId"
            :show-size-config="true"
            :width="120"
            @update:model-value="(value) => setItemField(index, 'image', value)"
          />
        </div>

        <div
          v-for="field in getVisibleTextFields(item)"
          :key="field.key"
          class="__field-group"
        >
          <label class="__field-label">{{ field.label }}</label>
          <el-input
            :model-value="item[field.key]"
            :placeholder="field.placeholder"
            :rows="field.rows"
            :type="field.type"
            show-word-limit
            @update:model-value="(value) => setItemField(index, field.key, value)"
          />
        </div>
      </div>
    </div>

    <el-empty
      v-if="!items.length"
      description="暂无评论内容"
      :image-size="60"
    />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { ArrowDown, ChatDotRound, Delete } from "@element-plus/icons-vue";
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

const textFields = [
  {
    key: "name",
    label: "姓名",
    type: "text",
    rows: undefined,
    placeholder: "请输入姓名",
  },
  {
    key: "title",
    label: "标题",
    type: "text",
    rows: undefined,
    placeholder: "请输入标题",
  },
  {
    key: "content",
    label: "内容",
    type: "textarea",
    rows: 4,
    placeholder: "请输入评论内容",
  },
];

const hasSlidesField = computed(() => hasItemField(props.fields, "slides"));

const items = computed(() =>
  Array.isArray(props.fields?.slides) ? props.fields.slides : []
);

function hasItemField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function getVisibleTextFields(item) {
  return textFields.filter(({ key }) => hasItemField(item, key));
}

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function emitItems(next) {
  props.onUpdate("slides", next);
}

function addItem() {
  emitItems([...items.value, createReviewItem()]);
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

function createReviewItem() {
  return {
    content: "",
    name: "",
    title: "",
    image: {
      url: "",
    },
    _id: genId(),
    rating: "",
    selected_social_icon: {
      value: "fab fa-twitter",
      library: "fa-brands",
    },
    link: {
      url: "",
      is_external: "",
      nofollow: "",
      custom_attributes: "",
    },
  };
}
</script>
