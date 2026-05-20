<template>
  <div v-if="hasListField" class="__field-item">
    <div class="mb-3 flex items-center justify-between gap-3">
      <label class="__field-label">
        <el-icon><Clock /></el-icon>
        <span>时间轴事件</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <el-button size="small" type="primary" plain @click="addItem">
        添加事件
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
            {{ item.twae_story_title || "未命名" }}
          </span>
          <el-tag
            v-if="hasMeaningfulText(item.twae_date_label)"
            size="small"
            type="success"
          >
            {{ item.twae_date_label }}
          </el-tag>
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
          v-for="field in getVisibleTextFields(item)"
          :key="field.key"
          class="__field-group"
        >
          <label class="__field-label">
            <el-icon><component :is="field.icon" /></el-icon>
            <span>{{ field.label }}</span>
          </label>
          <el-input
            :model-value="item[field.key]"
            :placeholder="field.placeholder"
            :rows="field.rows"
            :type="field.type"
            show-word-limit
            @update:model-value="(value) => setItemField(index, field.key, value)"
          />
        </div>

        <div
          v-if="hasMeaningfulRichText(item.twae_description)"
          class="__field-group"
        >
          <label class="__field-label">
            <el-icon><Document /></el-icon>
            <span>描述</span>
          </label>
          <QuillEditor
            :node-id="editorNodeId(index)"
            :model-value="item.twae_description || ''"
            placeholder="请输入事件描述..."
            @update:model-value="(value) => setItemField(index, 'twae_description', value)"
          />
        </div>

        <div v-if="hasMeaningfulImage(item.twae_image)" class="__field-group">
          <label class="__field-label">
            <el-icon><Picture /></el-icon>
            <span>图片</span>
          </label>
          <ImageWp
            :model-value="item.twae_image"
            :node-id="nodeId"
            :show-size-config="true"
            :width="160"
            @update:model-value="(value) => setItemField(index, 'twae_image', value)"
          />
        </div>
      </div>
    </div>

    <el-empty
      v-if="!items.length"
      description="暂无时间轴事件"
      :image-size="60"
    />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import {
  ArrowDown,
  Calendar,
  Clock,
  Delete,
  Document,
  Picture,
  Promotion,
} from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import ImageWp from "@/components/Common/imageWp.vue";
import QuillEditor from "@/components/QuillEditor.vue";
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
  settings: {
    type: Object,
    default: () => ({}),
  },
  onUpdate: {
    type: Function,
    required: true,
  },
});

const collapsedItems = reactive(new Set());

const textFields = [
  {
    key: "twae_story_title",
    label: "故事标题",
    icon: Promotion,
    type: "text",
    rows: undefined,
    placeholder: "请输入故事标题",
  },
  {
    key: "twae_date_label",
    label: "日期标签",
    icon: Calendar,
    type: "text",
    rows: undefined,
    placeholder: "请输入日期标签",
  },
];

const hasListField = computed(() => hasField(props.fields, "twae_list"));

const items = computed(() =>
  Array.isArray(props.fields?.twae_list) ? props.fields.twae_list : []
);

function hasField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function getVisibleTextFields(item) {
  return textFields.filter(({ key }) => hasMeaningfulText(item?.[key]));
}

function hasMeaningfulText(value) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== undefined && value !== null && value !== "";
}

function hasMeaningfulRichText(value) {
  if (typeof value !== "string") {
    return false;
  }

  const plainText = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .trim();

  return plainText.length > 0;
}

function hasMeaningfulImage(value) {
  if (!value) return false;

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const urlCandidates = [
      value.url,
      value.src,
      value.path,
      value.link,
      value.thumb,
      value.image?.url,
      value.sizes?.full?.url,
      value.sizes?.large?.url,
      value.sizes?.medium?.url,
    ];

    if (
      urlCandidates.some(
        (candidate) =>
          typeof candidate === "string" && candidate.trim().length > 0
      )
    ) {
      return true;
    }

    const id = value.id;
    if (id === undefined || id === null) return false;

    const normalizedId = String(id).trim();
    return normalizedId !== "" && normalizedId !== "0";
  }

  return false;
}

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function emitItems(next) {
  props.onUpdate("twae_list", next);
}

function addItem() {
  emitItems([
    ...items.value,
    {
      _id: genId(),
      twae_story_title: "",
      twae_description: "",
      twae_date_label: "",
      twae_image: { id: "", url: "" },
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

function editorNodeId(index) {
  return `${props.nodeId || props.widgetType}_timeline_${index}`;
}
</script>
