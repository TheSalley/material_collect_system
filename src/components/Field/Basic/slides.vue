<template>
  <div class="field-item slides-container">
    <div class="slides-header">
      <span class="field-label">轮播图管理</span>
    </div>
    
    <el-collapse v-model="activeCollapse" class="slides-list">
      <el-collapse-item 
        v-for="(slide, index) in slidesList" 
        :key="slide._id || index"
        :name="index"
        :title="`幻灯片 ${index + 1}`"
      >
        <template #title>
          <span class="slide-title">{{ slide.heading ? stripHtml(slide.heading) : `幻灯片 ${index + 1}` }}</span>
        </template>

        <div class="slide-editor">
          <!-- 标题编辑 -->
          <div class="field-row">
            <span class="field-label">标题：</span>
            <div :id="'heading-editor-' + nodeId + '-' + index" class="editor-wrapper"></div>
          </div>

          <!-- 描述编辑 -->
          <div class="field-row">
            <span class="field-label">描述：</span>
            <div :id="'description-editor-' + nodeId + '-' + index" class="editor-wrapper"></div>
          </div>

          <!-- 背景图片上传 -->
          <div class="field-row">
            <span class="field-label">背景图片：</span>
            <div class="image-upload-container">
              <el-upload 
                action="#" 
                :before-upload="(file) => handleBeforeUpload(file, index)"
                :show-file-list="false"
              >
                <div class="image-preview" v-if="slide.background_image?.url">
                  <img :src="slide.background_image.url" alt="背景图片" />
                  <div class="image-overlay">
                    <span>点击更换图片</span>
                  </div>
                </div>
                <el-button v-else type="primary">上传图片</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    jpg/png files with a size less than 10MB
                  </div>
                </template>
              </el-upload>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, inject, nextTick } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { translate } from "@/apis/index.js";
import { uploadImage } from "@/apis";

const props = defineProps({
  currentNode: {
    type: Object,
    required: true
  },
  nodeId: {
    type: String,
    required: true
  },
  localSettings: {
    type: Object,
    default: () => ({})
  },
  onUpdate: {
    type: Function,
    required: true
  }
});

const isTranslate = inject('isTranslate', ref(false));
const translateConfig = inject('translateConfig', { sourceLanguage: 'zh', targetLanguage: 'en' });

// 获取 slides 数组
const slidesList = computed(() => {
  return props.localSettings.slides || [];
});

const activeCollapse = ref([]);
const quillInstances = ref({}); // 存储 Quill 实例
let isTranslating = false;

// 去除 HTML 标签
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

// 初始化 Quill 编辑器
const initQuillEditor = (editorId, content, fieldName, slideIndex) => {
  if (quillInstances.value[editorId]) {
    return; // 已经初始化过了
  }

  const quill = new Quill(`#${editorId}`, {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "link"],
        [{ color: [] }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
    placeholder: fieldName === 'heading' ? "请输入标题" : "请输入描述",
  });

  quill.root.innerHTML = content || '';
  
  quill.on("text-change", () => {
    updateSlideField(slideIndex, fieldName, quill.root.innerHTML);
  });

  quillInstances.value[editorId] = quill;
};

// 更新 slide 字段
const updateSlideField = (slideIndex, fieldName, value) => {
  const slides = [...slidesList.value];
  if (!slides[slideIndex]) {
    return;
  }
  slides[slideIndex] = {
    ...slides[slideIndex],
    [fieldName]: value
  };
  props.onUpdate('slides', slides);
};

// 图片上传处理
const handleBeforeUpload = (file, slideIndex) => {
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
  customUpload(file, slideIndex);
  return false;
};

const customUpload = async (file, slideIndex) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImage(formData);

    if (res.code === 0 && res.data[0].success) {
      ElMessage.success("图片上传成功！");
      const updatedImage = {
        url: res.data[0].data.url,
        id: res.data[0].data.attachment_id,
        size: "",
        alt: "",
        source: "library"
      };
      updateSlideField(slideIndex, 'background_image', updatedImage);
    } else {
      ElMessage.error("上传失败：" + res.message);
    }
  } catch (err) {
    ElMessage.error("上传失败：" + err.message);
  }
};

// 监听 slides 变化，初始化编辑器
watch(
  () => slidesList.value,
  async (newSlides) => {
    if (newSlides && newSlides.length > 0) {
      // 等待 DOM 更新后初始化编辑器
      await nextTick();
      // 再等待一下确保折叠面板完全展开
      setTimeout(() => {
        newSlides.forEach((slide, index) => {
          const headingEditorId = `heading-editor-${props.nodeId}-${index}`;
          const descriptionEditorId = `description-editor-${props.nodeId}-${index}`;
          
          const headingEl = document.getElementById(headingEditorId);
          const descriptionEl = document.getElementById(descriptionEditorId);
          
          if (headingEl && !quillInstances.value[headingEditorId] && headingEl.children.length === 0) {
            initQuillEditor(headingEditorId, slide.heading || '', 'heading', index);
          }
          
          if (descriptionEl && !quillInstances.value[descriptionEditorId] && descriptionEl.children.length === 0) {
            initQuillEditor(descriptionEditorId, slide.description || '', 'description', index);
          }
        });
      }, 200);
    }
  },
  { immediate: true, deep: true }
);

// 监听折叠面板展开，初始化编辑器
watch(
  () => activeCollapse.value,
  async (newVal) => {
    if (Array.isArray(newVal) && newVal.length > 0) {
      await nextTick();
      setTimeout(() => {
        newVal.forEach((index) => {
          const slide = slidesList.value[index];
          if (!slide) return;
          
          const headingEditorId = `heading-editor-${props.nodeId}-${index}`;
          const descriptionEditorId = `description-editor-${props.nodeId}-${index}`;
          
          const headingEl = document.getElementById(headingEditorId);
          const descriptionEl = document.getElementById(descriptionEditorId);
          
          if (headingEl && !quillInstances.value[headingEditorId] && headingEl.children.length === 0) {
            initQuillEditor(headingEditorId, slide.heading || '', 'heading', index);
          }
          
          if (descriptionEl && !quillInstances.value[descriptionEditorId] && descriptionEl.children.length === 0) {
            initQuillEditor(descriptionEditorId, slide.description || '', 'description', index);
          }
        });
      }, 100);
    }
  },
  { deep: true }
);

// 监听翻译状态
watch(isTranslate, async (newVal, oldVal) => {
  if (newVal === true && oldVal === false && !isTranslating) {
    isTranslating = true;
    try {
      for (let index = 0; index < slidesList.value.length; index++) {
        const slide = slidesList.value[index];
        
        // 翻译标题
        if (slide.heading && slide.heading.trim()) {
          const headingText = stripHtml(slide.heading);
          if (headingText.trim()) {
            try {
              const res = await translate({
                sourceText: headingText,
                sourceLanguage: translateConfig.sourceLanguage,
                targetLanguage: translateConfig.targetLanguage
              });
              
              if (res.code === 0 && res.data.translatedText) {
                const headingEditorId = `heading-editor-${props.nodeId}-${index}`;
                if (quillInstances.value[headingEditorId]) {
                  quillInstances.value[headingEditorId].root.innerHTML = res.data.translatedText;
                  updateSlideField(index, 'heading', res.data.translatedText);
                }
              }
            } catch (error) {
              console.error(`翻译标题出错 (slide ${index}):`, error);
            }
          }
        }
        
        // 翻译描述
        if (slide.description && slide.description.trim()) {
          const descriptionText = stripHtml(slide.description);
          if (descriptionText.trim()) {
            try {
              const res = await translate({
                sourceText: descriptionText,
                sourceLanguage: translateConfig.sourceLanguage,
                targetLanguage: translateConfig.targetLanguage
              });
              
              if (res.code === 0 && res.data.translatedText) {
                const descriptionEditorId = `description-editor-${props.nodeId}-${index}`;
                if (quillInstances.value[descriptionEditorId]) {
                  quillInstances.value[descriptionEditorId].root.innerHTML = res.data.translatedText;
                  updateSlideField(index, 'description', res.data.translatedText);
                }
              }
            } catch (error) {
              console.error(`翻译描述出错 (slide ${index}):`, error);
            }
          }
        }
        
        // 添加小延迟，避免请求过快
        if (index < slidesList.value.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error("翻译过程出错:", error);
    } finally {
      isTranslating = false;
    }
  }
});

onMounted(() => {
  // 初始化时展开第一个幻灯片
  if (slidesList.value.length > 0) {
    activeCollapse.value = [0];
  }
});

onBeforeUnmount(() => {
  // 清理所有 Quill 实例
  Object.values(quillInstances.value).forEach(quill => {
    if (quill) {
      quill = null;
    }
  });
  quillInstances.value = {};
});
</script>

<style scoped>
.slides-container {
  padding: 16px;
}

.slides-header {
  margin-bottom: 16px;
}

.field-label {
  font-weight: 500;
  color: #606266;
  margin-right: 12px;
  white-space: nowrap;
}

.slides-list {
  margin-top: 16px;
}

.slide-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slide-editor {
  padding: 16px 0;
}

.field-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}

.field-row:last-child {
  margin-bottom: 0;
}

.editor-wrapper {
  flex: 1;
  min-height: 200px;
}

.image-upload-container {
  flex: 1;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-overlay span {
  color: white;
  font-size: 14px;
}

:deep(.el-collapse-item__header) {
  display: flex;
  align-items: center;
}

:deep(.el-collapse-item__content) {
  padding: 16px;
}
</style>