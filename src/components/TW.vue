<template>
  <div class="flex justify-between gap-4 px-10 py-10">
    <div class="w-1/2 __border-shadow">
      <div v-if="state?.pageId">
        <div v-for="(part, index) in state.pageData" :key="index" class="mb-4">
          <el-image src="/src/assets/place.webp" />
        </div>
      </div>
    </div>
    <div class="w-1/2 __border-shadow">
      <div v-if="state?.pageId">
        <div v-for="(part, index) in state.pageData" :key="index" class="mb-4">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>板块-{{ index + 1 }}</span>
              </div>
            </template>
            <div v-for="(topNode, index1) in part.elements" :key="topNode.id">
              <div>顶层节点（{{ topNode.elType }} - {{ topNode.id }}）</div>
              <DataExtractor
                :current-node="topNode"
                :is-translate="isTranslate"
                :source-language="sourceLanguage"
                :target-language="targetLanguage"
                @update:node="
                  (updatedNode) => handleNodeUpdate(index, index1, updatedNode)
                "
              />
            </div>
            <template #footer></template>
          </el-card>
        </div>
      </div>
      <el-empty description="非Elementor" v-else />
    </div>
  </div>
  <div style="display: flex; justify-content: center; margin-top: 30px">
    <el-button type="primary" @click="handleSave">保存</el-button>
    <el-button type="primary" @click="handleReset">还原</el-button>
  </div>
</template>
<script setup>
import { reactive, onMounted, watch } from "vue";
import { getPageById, updatePageById, translate } from "@/apis/index.js";
import DataExtractor from "./DataExtractor.vue";

const props = defineProps({
  pageId: {
    type: [Number, String],
    required: true,
  },
  isTranslate: {
    type: Boolean,
    default: false
  },
  sourceLanguage: {
    type: String,
    default: 'zh'
  },
  targetLanguage: {
    type: String,
    default: 'en'
  }
});

const state = reactive({
  pageData: null,
  pageId: null,
  meta_id: null,
  ImageList: [],
  originStr: "",
});

onMounted(async () => {
  const page = await getPageById(props.pageId);
  if (page.code === 0 && page.data.post_id) {
    state.pageId = page.data.post_id;
    state.pageData = JSON.parse(page.data.meta_value);
    state.originStr = page.data.meta_value;
    state.meta_id = page.data.meta_id;
  }
});

// 监听isTranslate属性变化
watch(() => props.isTranslate, async (newVal) => {
  if (newVal) {
    // 触发翻译逻辑
    await handleTranslate();
  }
});

// 处理翻译逻辑
async function handleTranslate() {
  if (!state.pageData) return;
  
  ElMessage({
    message: "开始翻译...",
    type: "info"
  });
  
  try {
    // 这里应该是实际的翻译逻辑
    // 遍历所有部分进行翻译处理
    for (let i = 0; i < state.pageData.length; i++) {
      await translatePart(i);
    }
    
    ElMessage({
      message: "翻译完成",
      type: "success"
    });
  } catch (error) {
    ElMessage({
      message: "翻译失败: " + error.message,
      type: "error"
    });
  }
}

// 翻译单个部分
async function translatePart(partIndex) {
  // 这里应该是实际的翻译逻辑
  // 提取文本 -> 调用翻译API -> 应用翻译结果
  console.log(`翻译第${partIndex + 1}部分`);
}

async function handleSave() {
  console.log("@@@", state.pageData);
  return;
  let str = JSON.stringify(state.pageData);
  // let str = convertToElementorFormat(state.pageData);
  // let str = state.pageData;
  // str = str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  // console.log("strstr :", str);
  const res = await updatePageById({
    meta_value: str,
    post_id: Number(state.pageId),
  });
  if (res.code === 0) {
    ElMessage({
      message: "保存成功",
      type: "success",
    });
  } else {
    ElMessage({
      message: "保存失败",
      type: "error",
    });
  }
}

async function handleReset() {
  const res = await updatePageById({
    meta_value: state.originStr,
    post_id: state.Number(state.pageId),
  });
  if (res.code === 0) {
    ElMessage({
      message: "保存成功",
      type: "success",
    });
  } else {
    ElMessage({
      message: "保存失败",
      type: "error",
    });
  }
}

function handleNodeUpdate(index, index1, updatedNode) {
  state.pageData[index].elements[index1] = updatedNode;

  // console.log(typeof state.pageData)
  // let obj = JSON.parse(state.pageData.meta_value);
  // obj.find
  // () => (part.elements[index] = updatedNode)
}

/**
 * 将修改后的 Elementor 数据转换为其兼容的格式
 * @param {Array} data - 你的修改后数据（必须是数组，如 [{"id":"f489a6c",...}]）
 * @returns {string} 符合 Elementor 要求的 JSON 字符串（可直接存储到 _elementor_data）
 */
function convertToElementorFormat(data) {
  try {
    // 1. 基础校验：确保是数组（Elementor 数据必须用数组包裹）
    if (!Array.isArray(data)) {
      throw new Error("数据必须是数组格式（Elementor 要求外层为数组）");
    }

    // 2. 深拷贝数据，避免修改原对象
    const clonedData = JSON.parse(JSON.stringify(data));

    // 3. 递归处理所有节点，修复常见格式问题
    const processNode = (node) => {
      // 3.1 校验核心字段（Elementor 必须字段）
      if (!node.id || !node.elType) {
        throw new Error(
          `节点缺少必要字段（id 或 elType）：${JSON.stringify(node)}`
        );
      }

      // 3.2 处理 settings 字段（确保是对象，避免 null/undefined）
      if (node.settings === null || typeof node.settings !== "object") {
        node.settings = {};
      }

      // 3.3 处理 elements 数组（确保是数组，递归处理子节点）
      if (!Array.isArray(node.elements)) {
        node.elements = []; // 若不是数组，强制转为空数组
      } else {
        // 递归处理子节点，同时去除数组末尾可能的空元素
        node.elements = node.elements
          .filter((el) => el !== null && typeof el === "object") // 过滤无效元素
          .map((child) => processNode(child)); // 递归处理每个子节点
      }

      // 3.4 特殊字段处理（如 isInner 必须是布尔值）
      if (node.isInner !== undefined && typeof node.isInner !== "boolean") {
        node.isInner = false; // 默认为 false
      }

      return node;
    };

    // 4. 处理顶层数组中的所有节点
    const processedData = clonedData.map((node) => processNode(node));

    // 5. 序列化为 JSON 字符串（确保无语法错误）
    const jsonStr = JSON.stringify(processedData);

    // 6. 最终校验：确保序列化后的字符串可被解析（避免隐形错误）
    JSON.parse(jsonStr);

    return jsonStr;
  } catch (error) {
    console.error("转换为 Elementor 格式失败：", error.message);
    return null; // 转换失败返回 null
  }
}
</script>