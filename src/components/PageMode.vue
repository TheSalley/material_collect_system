<template>
  <div class="flex justify-between gap-4 px-10 py-10">
    <div class="w-1/2 __border-shadow sticky top-0 h-fit">
      <el-button class="absolute right-0 top-0" type="primary" @click="dialogVisible = true">上传截图</el-button>
      <img :src="pagePic.file_url" alt="page picture" v-if="pagePic" />
      <el-empty v-else description="未上传截图" />
    </div>
    <div class="w-1/2 __border-shadow">
      <div v-if="state?.pageId && state?.editableMap">
        <div v-for="(part, index) in state.originData" :key="index" class="mb-4">
          <el-collapse accordion class="px-4">
            <el-collapse-item 
              v-if="!part.settings?.hide_desktop" 
              :title="`板块-${index + 1}-${part.id}-${part.elType}`" 
              :name="`part-${index}`">
              <div v-for="topNode in part.elements" :key="topNode.id">
                <DataExtractor 
                  v-if="!topNode.settings?.hide_desktop" 
                  :original-node="topNode"
                  :editable-map="state.editableMap"
                  @update:field="handleFieldUpdate" />
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
import { ref, reactive, onMounted, nextTick, watch, toRaw } from "vue";
import {
  getPageById,
  upload_bind_img,
  get_bind_img,
} from "@/apis/index.js";
import DataExtractor from "./DataExtractor.vue";
import { useGlobalStore } from "@/stores/global";
import { extractEditableData, syncDataToOriginal, updateField, mapToObject } from "@/utils/dataExtractor.js";

const dialogVisible = ref(false);
const pagePic = ref(null);

const props = defineProps({
  pageId: {
    type: [Number, String],
    required: true,
  },
});

const state = reactive({
  pageData: null,           // 原始 Elementor 完整数据（用于保存）
  originData: null,         // 用于展示的数据（不会被修改）
  editableMap: null,        // 提取的可编辑数据 Map（轻量级）
  pageId: null,
  meta_id: null,
  ImageList: [],
});

const { websiteInfo } = useGlobalStore();

onMounted(async () => {});

/**
 * 递归查找并更新原始数据中的节点
 */
function updateNodeInOriginalData(data, nodeId, fieldName, value) {
  if (!data || !Array.isArray(data)) return false;
  
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    
    // 找到目标节点
    if (node.id === nodeId) {
      if (!node.settings) {
        node.settings = {};
      }
      node.settings[fieldName] = value;
      return true;
    }
    
    // 递归查找子元素
    if (node.elements && Array.isArray(node.elements)) {
      if (updateNodeInOriginalData(node.elements, nodeId, fieldName, value)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * 处理字段更新（新架构）
 * @param {Object} payload - { nodeId, fieldName, value }
 */
function handleFieldUpdate(payload) {
  const { nodeId, fieldName, value } = payload;
  
  if (!nodeId || !fieldName) return;
  
  try {
    // editableMap 已在 DataExtractor 中更新，这里只需同步到原始数据
    updateNodeInOriginalData(state.pageData, nodeId, fieldName, value);
    
    console.log('实时字段更新:', { nodeId, fieldName, value });
  } catch (error) {
    console.error('更新字段时出错:', error);
  }
}

/**
 * 获取最终要保存的数据（已经实时同步，直接返回）
 * @returns {Array} 完整的 Elementor 数据
 */
function getFinalData() {
  if (!state.pageData) {
    return null;
  }
  
  // 数据已经实时同步，直接返回
  return state.pageData;
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

/**
 * 提取可编辑数据
 */
function extractData(data) {
  console.log('开始提取可编辑数据...');
  const editableMap = extractEditableData(data);
  console.log('提取完成，可编辑节点数量:', editableMap.size);
  console.log('可编辑数据:', mapToObject(editableMap));
  return editableMap;
}

watch(
  () => props.pageId,
  async (newId, oldId) => {
    if (newId) {
      const loadingInstance = ElLoading.service({ fullscreen: true });
      const { user } = useGlobalStore();
      const [res1, res2] = await Promise.all([
        getPageById(props.pageId, websiteInfo.site_id),
        get_bind_img(user.demo, props.pageId, user.mode),
      ]);
      if (res1.code === 0 && res1.data.post_id) {
        state.pageId = res1.data.post_id;
        try {
          const parsedData = JSON.parse(res1.data.meta_value);
          state.pageData = parsedData;                    // 保存原始完整数据
          state.originData = parsedData;                  // 用于展示的数据
          state.meta_id = res1.data.meta_id;
          
          // 提取可编辑数据
          state.editableMap = extractData(parsedData);
        } catch (error) {
          console.error('JSON 解析错误:', error);
          console.error('原始数据:', res1.data.meta_value);
          ElMessage.error('数据格式错误，无法解析 JSON。请检查服务器返回的数据。');
          // 设置空数据，避免页面崩溃
          state.pageData = null;
          state.originData = null;
          state.editableMap = null;
        }
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
  getFinalData,  // 导出获取最终数据的方法
});
</script>