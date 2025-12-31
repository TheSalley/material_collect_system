<template>
  <div class="flex justify-between gap-4 px-10 py-10">
    <div class="w-1/2 __border-shadow sticky top-0 h-fit">
      <el-button class="absolute right-0 top-0" type="primary" @click="dialogVisible = true">上传截图</el-button>
      <img :src="pagePic.file_url" alt="page picture" v-if="pagePic" />
      <el-empty v-else description="未上传截图" />
    </div>
    <div class="w-1/2 __border-shadow">
      <div v-if="state?.pageId">
        <div v-for="(part, index) in state.originData" :key="index" class="mb-4">
          <el-collapse accordion class="px-4">
            <el-collapse-item v-if="!part.settings?.hide_desktop" :title="`板块-${index + 1}-${part.id}`" :name="`part-${index}`">
              <span></span>
              <div v-for="(topNode, index1) in part.elements" :key="topNode.id">
                <DataExtractor v-if="!topNode.settings?.hide_desktop" 
                  :current-node="topNode" 
                  @update:node="
                  (updatedNode) => handleNodeUpdate(index, index1, updatedNode)
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
  updatePageById,
  upload_bind_img,
  get_bind_img,
} from "@/apis/index.js";
import DataExtractor from "./DataExtractor.vue";
import { useGlobalStore } from "@/stores/global";

const dialogVisible = ref(false);
const pagePic = ref(null);

const props = defineProps({
  pageId: {
    type: [Number, String],
    required: true,
  },
});

const state = reactive({
  pageData: null,
  originData: null,
  pageId: null,
  meta_id: null,
  ImageList: [],
});

onMounted(async () => { });

function handleNodeUpdate(index, index1, updatedNode) {
  state.pageData[index].elements[index1] = updatedNode;
}

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
  try {
    const { user } = useGlobalStore();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("demo", user.demo);
    formData.append("bind_mode", user.mode);
    formData.append("bind_id", props.pageId);

    const res = await upload_bind_img(formData);

    if (res.code === 0) {
      pagePic.value = res.data;
      ElMessage.success("图片上传成功！");
      dialogVisible.value = false;
    } else {
      ElMessage.error("上传失败：" + res.message);
    }
  } catch (err) {
    ElMessage.error("上传失败：" + err.message);
  }
};

watch(
  () => props.pageId,
  async (newId, oldId) => {
    if (newId) {
      const loadingInstance = ElLoading.service({ fullscreen: true });
      const { user } = useGlobalStore();
      const [res1, res2] = await Promise.all([
        getPageById(props.pageId),
        get_bind_img(user.demo, props.pageId, user.mode),
      ]);
      if (res1.code === 0 && res1.data.post_id) {
        state.pageId = res1.data.post_id;
        state.pageData = JSON.parse(res1.data.meta_value);
        state.originData = JSON.parse(res1.data.meta_value);
        state.meta_id = res1.data.meta_id;
      }
      if (res2.code === 0) {
        pagePic.value = res2.data;
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