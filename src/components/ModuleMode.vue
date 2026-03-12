<template>
  <div v-for="(module, moduleIndex) in state.originData" :key="module.id" class="flex justify-between gap-4 px-10 py-10 border-b border-gray-200">
    <div class="w-1/2 __border-shadow sticky top-0 h-fit">
      <el-button class="absolute right-0 top-0" type="primary" @click="() => openUploadDialog(moduleIndex)">上传截图</el-button>
      <img :src="moduleImages[moduleIndex]?.file_url" alt="module picture" v-if="moduleImages[moduleIndex]" />
      <el-empty v-else description="未上传截图" />
    </div>
    <div class="w-1/2 __border-shadow">
      <div v-if="state?.moduleId">
        <div v-for="(part, index) in [module]" :key="index" class="mb-4">
          <el-collapse accordion class="px-4">
            <el-collapse-item v-if="!part.settings?.hide_desktop" :title="`模块-${index + 1}-${part.id}`" :name="`part-${index}`">
              <span></span>
              <div v-for="(topNode, index1) in part.elements" :key="topNode.id">
                <DataExtractor v-if="!topNode.settings?.hide_desktop" 
                  :current-node="topNode" 
                  @update:node="
                  (updatedNode) => handleNodeUpdate(moduleIndex, index1, updatedNode)
                " />
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      <el-empty description="非Elementor" v-else />
    </div>
  </div>

  <!-- 上传图片弹窗 -->
  <el-dialog v-model="dialogVisible" title="图片上传" width="800">
    <el-upload drag action="#" :before-upload="handleBeforeUpload">
      <el-icon class="el-icon--upload">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path fill="currentColor"
            d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0 1 64 624c0-123.136 93.12-223.488 212.608-237.248A239.81 239.81 0 0 1 512 192a239.87 239.87 0 0 1 235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 0 1-240 240c-5.376 0-10.56-1.28-16-1.6v1.6z">
          </path>
        </svg>
      </el-icon>
      <div class="el-upload__text">拖动文件或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">
          jpg/png files with a size less than 10M
        </div>
      </template>
    </el-upload>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import {
  getPageById,
  upload_bind_img,
  get_bind_img,
  getFileFullUrl,
} from "@/apis/index.js";
import DataExtractor from "./DataExtractor.vue";
import { useGlobalStore } from "@/stores/global";

const dialogVisible = ref(false);
const moduleImages = ref({}); // 存储每个模块的图片
let currentModuleIndex = null; // 当前上传图片的模块索引

const props = defineProps({
  pageId: {
    type: [Number, String],
    required: true,
  },
});

const state = reactive({
  moduleData: null,
  originData: null,
  moduleId: null,
  meta_id: null,
  ImageList: [],
});

onMounted(async () => { });

function handleNodeUpdate(moduleIndex, index1, updatedNode) {
  state.moduleData[moduleIndex].elements[index1] = updatedNode;
}

const openUploadDialog = (moduleIndex) => {
  currentModuleIndex = moduleIndex;
  dialogVisible.value = true;
};

const handleBeforeUpload = (file) => {
  const isImage = file.type === "image/jpeg" || file.type === "image/png";
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    ElMessage.error("仅支持上传 jpg/png 格式的图片！");
    return false;
  }
  if (!isLt10M) {
    ElMessage.error("图片大小不能超过 10MB!");
    return false;
  }
  customUpload(file);
  return false;
};

const customUpload = async (file) => {
  if (currentModuleIndex === null) {
    ElMessage.error("未选择模块");
    return;
  }
  try {
    const { websiteInfo } = useGlobalStore();
    const site_id = websiteInfo?.site_id;
    if (!site_id) {
      ElMessage.error("未选择站点");
      return;
    }
    const currentModule = state.originData[currentModuleIndex];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("site_id", site_id);
    formData.append("elementor_id", String(currentModule.id));

    const res = await upload_bind_img(formData);

    if (res.code === 0) {
      const res2 = await get_bind_img(site_id, currentModule.id);
      if (res2?.code === 0 && res2?.data?.list?.[0]) {
        const item = res2.data.list[0];
        moduleImages.value[currentModuleIndex] = { ...item, file_url: getFileFullUrl(item.file_url) };
      }
      ElMessage.success("图片上传成功！");
      dialogVisible.value = false;
    } else {
      ElMessage.error("上传失败：" + (res.message || "未知错误"));
    }
  } catch (err) {
    ElMessage.error("上传失败：" + (err?.message || "未知错误"));
  }
};

watch(
  () => props.pageId,
  async (newId, oldId) => {
    if (newId) {
      const loadingInstance = ElLoading.service({ fullscreen: true });
      const { websiteInfo } = useGlobalStore();
      const site_id = websiteInfo?.site_id;
      const res1 = await getPageById(newId, site_id);
      if (res1.code === 0 && res1.data.post_id) {
        state.moduleId = res1.data.post_id;
        state.moduleData = JSON.parse(res1.data.meta_value);
        state.originData = JSON.parse(res1.data.meta_value);
        state.meta_id = res1.data.meta_id;

        if (site_id) {
          for (let i = 0; i < state.originData.length; i++) {
            const module = state.originData[i];
            const res2 = await get_bind_img(site_id, module.id);
            if (res2?.code === 0 && res2?.data?.list?.[0]) {
              const item = res2.data.list[0];
              moduleImages.value[i] = { ...item, file_url: getFileFullUrl(item.file_url) };
            }
          }
        }
      }
      nextTick(() => {
        loadingInstance.close();
      });
    }
  },
  { immediate: true }
);

defineExpose({
  state,
});
</script>