<template>
  <div v-if="shouldShowField" class="__field-item space-y-4">
    <div v-if="hasImageField" class="__field-group">
      <label class="__field-label">
        <el-icon><Picture /></el-icon>
        <span>图片</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <ImageWp
        :model-value="fields.image"
        :node-id="nodeId"
        :show-size-config="true"
        @update:model-value="handleImageUpdate"
      />
    </div>

    <div v-if="hasHotspotField" class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <label class="__field-label">
          <el-icon><Location /></el-icon>
          <span>热点</span>
        </label>
        <el-button size="small" type="primary" plain @click="addItem">
          新增
        </el-button>
      </div>

      <div
        v-for="(item, index) in items"
        :key="item?._id || index"
        class="overflow-hidden rounded-lg border border-gray-200"
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
              {{ item.hotspot_label || "未命名" }}
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
            <label class="__field-label">标签</label>
            <el-input
              :model-value="item.hotspot_label"
              placeholder="请输入热点标签"
              @update:model-value="
                (value) => setItemField(index, 'hotspot_label', value)
              "
            />
          </div>

          <div class="__field-group">
            <label class="__field-label">提示内容</label>
            <QuillEditor
              :node-id="editorNodeId(index)"
              :model-value="item.hotspot_tooltip_content"
              placeholder="请输入提示内容..."
              @update:model-value="
                (value) =>
                  setItemField(index, 'hotspot_tooltip_content', value)
              "
            />
          </div>
        </div>
      </div>

      <el-empty
        v-if="!items.length"
        description="暂无热点内容"
        :image-size="60"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { ArrowDown, Delete, Location, Picture } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import ImageWp from "@/components/Common/imageWp.vue";
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

const collapsedItems = reactive(new Set());

const hasImageField = computed(() => hasField(props.fields, "image"));
const hasHotspotField = computed(() => hasField(props.fields, "hotspot"));
const shouldShowField = computed(
  () => hasImageField.value || hasHotspotField.value
);

const items = computed(() =>
  Array.isArray(props.fields?.hotspot) ? props.fields.hotspot : []
);

function hasField(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function toggleCollapse(index) {
  collapsedItems.has(index)
    ? collapsedItems.delete(index)
    : collapsedItems.add(index);
}

function handleImageUpdate(imageData) {
  props.onUpdate("image", imageData);
}

function emitItems(next) {
  props.onUpdate("hotspot", next);
}

function addItem() {
  emitItems([...items.value, createHotspotItem()]);
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
  return `${props.nodeId || props.widgetType}_hotspot_${index}`;
}

function createHotspotItem() {
  return {
    _id: genId(),
    hotspot_label: "",
    hotspot_link: {
      url: "",
      is_external: "",
      nofollow: "",
      custom_attributes: "",
    },
    hotspot_icon: {
      value: "",
      library: "",
    },
    hotspot_icon_position: "start",
    hotspot_icon_spacing: {
      unit: "px",
      size: "5",
      sizes: [],
    },
    hotspot_custom_size: "no",
    hotspot_width: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_height: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_tooltip_content: "",
    hotspot_horizontal: "left",
    hotspot_offset_x: {
      unit: "%",
      size: "50",
      sizes: [],
    },
    hotspot_offset_x_laptop: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_offset_x_tablet: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_offset_x_mobile: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_vertical: "top",
    hotspot_offset_y: {
      unit: "%",
      size: "50",
      sizes: [],
    },
    hotspot_offset_y_laptop: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_offset_y_tablet: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_offset_y_mobile: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_tooltip_position: "no",
    hotspot_position: "",
    hotspot_position_laptop: "",
    hotspot_position_tablet: "",
    hotspot_position_mobile: "",
    hotspot_tooltip_width: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_tooltip_width_laptop: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_tooltip_width_tablet: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_tooltip_width_mobile: {
      unit: "px",
      size: "",
      sizes: [],
    },
    hotspot_tooltip_text_wrap: "",
  };
}
</script>
