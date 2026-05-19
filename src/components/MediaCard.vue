<script setup>
import { shallowRef } from "vue";
import { Picture, View, Document, Delete } from "@element-plus/icons-vue";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { deleteMedia } from "@/apis/media";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["preview", "deleted"]);
const deleting = shallowRef(false);

const IMAGE_FIELDS = ["url", "src", "image", "img", "thumbnail", "cover"];

function getImageUrl(item) {
  if (!item || typeof item !== "object") return null;
  for (const key of Object.keys(item)) {
    if (IMAGE_FIELDS.some(f => key.toLowerCase().includes(f))) {
      const val = item[key];
      if (typeof val === "string" && /^https?:\/\//i.test(val)) return val;
    }
  }
  return null;
}

function getImageExt(item) {
  const url = getImageUrl(item);
  if (!url) return "FILE";
  const m = url.match(/\.([a-z0-9]+)(\?|$)/i);
  return m ? m[1].toUpperCase() : "IMG";
}

function getField(item, key) {
  if (!item || typeof item !== "object") return null;
  return item[key] ?? item[key.replace(/_/g, "")] ?? null;
}

function getMediaId(item) {
  return getField(item, "id");
}

function formatDate(str) {
  if (!str) return "-";
  const d = new Date(str);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function openPreview() {
  const imageUrl = getImageUrl(props.item);
  if (!imageUrl) return;
  emit("preview", imageUrl);
}

async function handleDelete() {
  const id = getMediaId(props.item);
  if (id == null || id === "") {
    ElMessage.warning("缺少素材 ID，无法删除");
    return;
  }

  try {
    await ElMessageBox.confirm("确定要删除该素材吗？此操作不可恢复。", "删除素材", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      closeOnClickModal: false,
    });
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error("删除失败：" + (error?.message || ""));
    }
    return;
  }

  deleting.value = true;
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    lock: true,
    text: "正在删除素材...",
  });
  try {
    const res = await deleteMedia({ id });
    if (res?.code === 0) {
      ElMessage.success(res.message || "删除成功");
      emit("deleted", props.item);
    } else {
      ElMessage.error(res?.message || res?.msg || "删除失败");
    }
  } catch (error) {
    ElMessage.error("删除失败：" + (error?.message || ""));
  } finally {
    loadingInstance.close();
    deleting.value = false;
  }
}
</script>

<template>
  <div class="media-card group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-600">
    <div
      class="relative aspect-[4/3] bg-gray-100 dark:bg-gray-600 overflow-hidden"
      :class="{ 'cursor-zoom-in': getImageUrl(item) }"
      @click="openPreview"
    >
      <template v-if="getImageUrl(item)">
        <el-image
          :src="getImageUrl(item)"
          fit="cover"
          class="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </template>
      <template v-else>
        <div class="w-full h-full flex items-center justify-center">
          <el-icon class="text-5xl text-gray-300 dark:text-gray-500"><Document /></el-icon>
        </div>
      </template>

      <div class="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
        <el-button
          v-if="getImageUrl(item)"
          class="pointer-events-auto"
          circle
          size="large"
          type="primary"
          :icon="View"
          @click.stop="openPreview"
        />
        <el-button
          class="pointer-events-auto"
          circle
          size="large"
          type="danger"
          :icon="Delete"
          :loading="deleting"
          @click.stop="handleDelete"
        />
      </div>

      <div
        v-if="getImageUrl(item)"
        class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm"
      >
        {{ getImageExt(item) }}
      </div>
    </div>

    <div class="p-3">
      <div class="flex flex-wrap gap-1">
        <el-tag v-if="getField(item, 'demo')" size="small" type="info" effect="plain" class="!text-[10px]">
          {{ getField(item, 'demo') }}
        </el-tag>
        <el-tag v-if="getField(item, 'page')" size="small" type="warning" effect="plain" class="!text-[10px]">
          {{ getField(item, 'page') }}
        </el-tag>
        <el-tag v-if="getField(item, 'created_at')" size="small" type="info" effect="plain" class="!text-[10px]">
          {{ formatDate(getField(item, 'created_at')) }}
        </el-tag>
      </div>
    </div>
  </div>
</template>
