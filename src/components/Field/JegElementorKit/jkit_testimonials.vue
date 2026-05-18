<template>
  <div v-if="hasItemsField" class="__field-item">
    <div class="mb-3 flex items-center justify-between gap-3">
      <label class="__field-label">
        <el-icon><ChatDotRound /></el-icon>
        <span>评价列表</span>
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
          v-if="hasItemField(item, 'sg_testimonials_list_client_avatar')"
          class="__field-group"
        >
          <label class="__field-label">
            <el-icon><User /></el-icon>
            <span>客户头像</span>
          </label>
          <ImageWp
            :model-value="item.sg_testimonials_list_client_avatar"
            :node-id="nodeId"
            :show-size-config="true"
            :width="160"
            @update:model-value="
              (value) =>
                setItemField(index, 'sg_testimonials_list_client_avatar', value)
            "
          />
        </div>

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
            @update:model-value="
              (value) => setItemField(index, field.key, value)
            "
          />
        </div>
      </div>
    </div>

    <el-empty v-if="!items.length" description="暂无评价内容" :image-size="60" />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import {
  ArrowDown,
  ChatDotRound,
  Delete,
  Document,
  Promotion,
  User,
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

const textFields = [
  {
    key: "sg_testimonials_list_client_name",
    label: "客户名称",
    icon: Promotion,
    type: "text",
    placeholder: "请输入客户名称",
  },
  {
    key: "sg_testimonials_list_designation",
    label: "职位/称呼",
    icon: Promotion,
    type: "text",
    placeholder: "请输入职位或称呼",
  },
  {
    key: "sg_testimonials_list_review",
    label: "评价内容",
    icon: Document,
    type: "textarea",
    rows: 4,
    placeholder: "请输入评价内容",
  },
];

const hasItemsField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "sg_testimonials_list")
);

const items = computed(() =>
  Array.isArray(props.fields?.sg_testimonials_list)
    ? props.fields.sg_testimonials_list
    : []
);

function hasItemField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function getVisibleTextFields(item) {
  return textFields.filter(({ key }) => hasItemField(item, key));
}

function safeTitle(item, index) {
  const name =
    typeof item?.sg_testimonials_list_client_name === "string"
      ? item.sg_testimonials_list_client_name.trim()
      : "";
  const designation =
    typeof item?.sg_testimonials_list_designation === "string"
      ? item.sg_testimonials_list_designation.trim()
      : "";

  return name || designation || `评价 ${index + 1}`;
}

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function emitItems(next) {
  props.onUpdate("sg_testimonials_list", next);
}

function addItem() {
  emitItems([
    ...items.value,
    {
      _id: genId(),
      sg_testimonials_list_client_avatar: {
        id: "",
        url: "",
      },
      sg_testimonials_list_client_name: "",
      sg_testimonials_list_designation: "",
      sg_testimonials_list_review: "",
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
