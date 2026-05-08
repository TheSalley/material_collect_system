<template>
  <div v-if="hasIconListField" class="__field-item">
    <div class="mb-3 flex items-center justify-between gap-3">
      <label class="__field-label">
        <el-icon>
          <Promotion />
        </el-icon>
        <span>图标列表</span>
        <FieldWidgetType :type="widgetType" />
      </label>

      <el-button size="small" type="primary" plain @click="addItem">
        新增
      </el-button>
    </div>

    <div
      v-for="(item, index) in iconList"
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
            {{ item.text || "未命名" }}
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

      <div v-show="!collapsedItems.has(index)" class="p-3">
        <div class="__field-group">
          <label class="__field-label">标题</label>
          <el-input
            :model-value="item.text"
            placeholder="请输入标题"
            @update:model-value="(value) => setItemField(index, 'text', value)"
          />
        </div>
      </div>
    </div>

    <el-empty
      v-if="!iconList.length"
      description="暂无列表内容"
      :image-size="60"
    />
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { Promotion, Delete, ArrowDown } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import { genId } from "@/utils";

const props = defineProps({
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

const hasIconListField = computed(() =>
  Object.prototype.hasOwnProperty.call(props.fields, "icon_list")
);

const iconList = computed(() =>
  Array.isArray(props.fields?.icon_list) ? props.fields.icon_list : []
);

const collapsedItems = reactive(new Set());

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function emitItems(next) {
  props.onUpdate("icon_list", next);
}

function addItem() {
  emitItems([
    ...iconList.value,
    {
      text: "",
      _id: genId(),
    },
  ]);
}

function removeItem(index) {
  emitItems(iconList.value.filter((_, itemIndex) => itemIndex !== index));
  collapsedItems.delete(index);
}

function setItemField(index, key, value) {
  const next = iconList.value.map((item, itemIndex) =>
    itemIndex === index ? { ...item, [key]: value } : item
  );
  emitItems(next);
}
</script>
