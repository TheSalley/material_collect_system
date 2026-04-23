<template>
  <div class="__field-item">
    <div class="flex items-center justify-between mb-3">
      <label class="__field-label">
        <el-icon><Promotion /></el-icon>
        <span>列表</span>
        <FieldWidgetType :type="widgetType" />
      </label>
      <el-button size="small" @click="addItem">新增</el-button>
    </div>

    <div
      v-for="(item, index) in iconList"
      :key="item?._id || index"
      class="border border-gray-200 rounded-lg mb-3 overflow-hidden"
    >
      <div
        class="icon-list-item-row flex items-center justify-between p-3 cursor-pointer bg-white"
        @click="toggleCollapse(index)"
      >
        <div class="flex items-center gap-3">
          <span class="icon-list-index px-2 py-0.5 rounded text-xs">{{
            index + 1
          }}</span>
          <span class="icon-list-title">{{ item.title || "未命名" }}</span>
        </div>
        <div class="flex items-center gap-2">
          <el-button
            size="small"
            @click.stop="removeItem(index)"
            :icon="Delete"
          >
            删除
          </el-button>
          <el-icon
            class="collapse-icon"
            :class="{ 'is-collapsed': collapsedItems.has(index) }"
          >
            <ArrowDown />
          </el-icon>
        </div>
      </div>

      <div v-show="!collapsedItems.has(index)" class="p-3 pb-3">
        <div class="__field-group mt-3">
          <label class="__field-label">标题</label>
          <el-input
            v-model="item.title"
            placeholder="请输入标题"
            @input="setItemField(index, 'title', item.title)"
          />
        </div>
        <div class="__field-group mt-3">
          <label class="__field-label">标题</label>
          <el-input
            v-model="item.name"
            placeholder="请输入姓名"
            @input="setItemField(index, 'name', item.name)"
          />
        </div>
        <div class="__field-group mt-3">
          <label class="__field-label">标题</label>
          <el-input
            v-model="item.content"
            placeholder="请输入内容"
            @input="setItemField(index, 'content', item.content)"
          />
        </div>
        <div class="__field-group mt-3">
          <label class="__field-label">图片</label>
          <div v-if="item?.image?.url" class="w-full max-w-[100px] mb-3">
            <img :src="item.image.url" alt="预览图" />
          </div>
          <!-- <el-upload
            action="#"
            :before-upload="handleBeforeUpload"
            :show-file-list="false"
            :accept="IMAGE_UPLOAD_DEFAULTS.accept"
          >
            <el-button type="primary" :icon="Upload">上传图片</el-button>
          </el-upload> -->
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

const iconList = computed(() => {
  const v = props.fields?.slides;
  return Array.isArray(v) ? v : [];
});

const collapsedItems = reactive(new Set());

function toggleCollapse(index) {
  if (collapsedItems.has(index)) {
    collapsedItems.delete(index);
  } else {
    collapsedItems.add(index);
  }
}

function emitItems(next) {
  props.onUpdate("slides", next);
}

function addItem() {
  const next = iconList.value.slice();
  next.push({
    title: "",
    name: "",
    content: "",
    _id: genId(),
  });
  emitItems(next);
}

function removeItem(index) {
  const next = iconList.value.filter((_, i) => i !== index);
  emitItems(next);
}

function setItemField(index, key, value) {
  const next = iconList.value.slice();
  const cur =
    next[index] && typeof next[index] === "object" ? { ...next[index] } : {};
  cur[key] = value;
  next[index] = cur;
  emitItems(next);
}
</script>

<style scoped>
/* 保留自定义的过渡和颜色变量样式 */
.icon-list-item-row {
  transition: background-color 0.2s;
}

.icon-list-item-row:hover {
  background: var(--field-bg-hover);
}

.collapse-icon {
  transition: transform 0.3s;
  color: var(--field-label-color);
}

.collapse-icon.is-collapsed {
  transform: rotate(-90deg);
}

.icon-list-index {
  background: var(--el-color-primary);
  color: white;
  font-size: 12px;
}

.icon-list-title {
  font-weight: 500;
  color: var(--field-label-color);
}
</style>
