<template>
    <div class="slides-container field-item">
        <div class="slides-header">
            <h4>
                <el-icon><PictureFilled /></el-icon>
                轮播图幻灯片
            </h4>
            <el-tag type="info">{{ fields.slides?.length || 0 }} 个幻灯片</el-tag>
        </div>
        
        <el-collapse v-model="activeSlides" accordion>
            <el-collapse-item 
                v-for="(slide, index) in fields.slides" 
                :key="slide._id || index"
                :name="`slide-${index}`">
                <template #title>
                    <div class="slide-title">
                        <el-icon class="slide-icon"><Picture /></el-icon>
                        <span>幻灯片 {{ index + 1 }}</span>
                    </div>
                </template>
                
                <div class="slide-content">
                    <!-- 标题 -->
                    <div class="field-group mb-4">
                        <label class="field-label">
                            <el-icon><Promotion /></el-icon>
                            标题
                        </label>
                        <el-input 
                            v-model="slide.heading"
                            show-word-limit 
                            type="textarea"
                            :rows="2"
                            @input="handleUpdate(index, 'heading', slide.heading)"
                            placeholder="请输入幻灯片标题" />
                    </div>
                    
                    <!-- 描述 -->
                    <div class="field-group mb-4">
                        <label class="field-label">
                            <el-icon><Document /></el-icon>
                            描述
                        </label>
                        <el-input 
                            v-model="slide.description"
                            show-word-limit 
                            type="textarea" 
                            :rows="3"
                            @input="handleUpdate(index, 'description', slide.description)"
                            placeholder="请输入幻灯片描述" />
                    </div>
                    
                    <!-- 按钮文本 -->
                    <div class="field-group mb-4">
                        <label class="field-label">
                            <el-icon><Link /></el-icon>
                            按钮文本
                        </label>
                        <el-input 
                            v-model="slide.button_text"
                            show-word-limit 
                            @input="handleUpdate(index, 'button_text', slide.button_text)"
                            placeholder="请输入按钮文本" />
                    </div>
                    
                    <!-- 背景图片 -->
                    <div class="field-group mb-4">
                        <label class="field-label">
                            <el-icon><PictureFilled /></el-icon>
                            背景图片
                        </label>
                        <div v-if="getSlideImageUrl(slide)" class="image-preview mb-3">
                            <img
                                :src="getSlideImageUrl(slide)"
                                alt="背景图"
                                @load="onSlideImgLoad($event, index)"
                            />
                        </div>
                        <el-upload 
                            action="#" 
                            :before-upload="(file) => handleSlideImageUpload(file, index)"
                            :show-file-list="false"
                            class="upload-wrapper">
                            <el-button type="primary" :icon="Upload">上传图片</el-button>
                        </el-upload>
                        <div class="field-upload-hints">
                            <p v-if="slideDims[index]" class="hint-line">{{ slideDims[index].label }}</p>
                            <p class="hint-line">{{ uploadTip }}</p>
                        </div>
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Upload as UploadIcon, Promotion, Document, Link, Picture, PictureFilled } from '@element-plus/icons-vue';
import {
    handleImageUpload,
    IMAGE_UPLOAD_DEFAULTS,
    buildImageUploadTip,
    formatNaturalSizeLabel,
} from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";

const uploadRuleOptions = { ...IMAGE_UPLOAD_DEFAULTS };
const uploadTip = buildImageUploadTip(uploadRuleOptions);
const slideDims = ref({}); // { [slideIndex]: { label: string, dims: { width, height } } }

const Upload = UploadIcon;

const props = defineProps({
    nodeId: {
        type: String,
        required: true
    },
    fields: {
        type: Object,
        required: true
    },
    onUpdate: {
        type: Function,
        required: true
    }
});

// 当前展开的幻灯片
const activeSlides = ref('slide-0');

watch(
    () => props.fields.slides,
    () => {
        slideDims.value = {};
    },
    { deep: true }
);

function onSlideImgLoad(e, slideIndex) {
    const img = e.target;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const dims = { width: img.naturalWidth, height: img.naturalHeight };
        slideDims.value = {
            ...slideDims.value,
            [slideIndex]: {
                label: formatNaturalSizeLabel(dims),
                dims,
            },
        };
    }
}

// 获取幻灯片图片URL用于预览
const getSlideImageUrl = (slide) => {
    const url = slide.background_image?.url;
    if (!url) return '';
    // 如果已经是完整URL，直接返回；否则使用 getFileFullUrl 转换
    return url.startsWith('http') ? url : getFileFullUrl(url);
};

// 处理字段更新
const handleUpdate = (slideIndex, fieldName, value) => {
    // 直接修改原数组中的对象，不创建新对象
    props.fields.slides[slideIndex][fieldName] = value;
    // 触发更新，传递原数组
    props.onUpdate('slides', props.fields.slides);
};

// 处理图片上传
const handleSlideImageUpload = async (file, slideIndex) => {
    const slideDim = slideDims.value[slideIndex];
    const opts = slideDim?.dims
        ? { strictMatch: true, refDimensions: slideDim.dims }
        : {};
    return handleImageUpload(file, (url, id) => {
        const currentSlide = props.fields.slides[slideIndex];
        if (!currentSlide.background_image) {
            currentSlide.background_image = {};
        }
        currentSlide.background_image.url = url;
        currentSlide.background_image.id = id;
        props.onUpdate('slides', props.fields.slides);
    }, opts);
};
</script>

<style scoped>
.slides-container {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    border: 1px solid #e4e7ed;
}

.slides-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
}

.slides-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.slide-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: #303133;
}

.slide-icon {
    color: #409eff;
    font-size: 1.25rem;
}

.slide-content {
    padding: 1rem 0;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #606266;
    font-size: 0.875rem;
}

.mb-4 {
    margin-bottom: 1rem;
}

.mb-2 {
    margin-bottom: 0.75rem;
}

.image-preview {
    width: 100%;
    max-width: 400px;
}

.image-preview img {
    width: 100%;
    height: auto;
    display: block;
    max-height: 300px;
    object-fit: contain;
    border-radius: 4px;
}

.upload-wrapper {
    width: 100%;
}

.upload-wrapper :deep(.el-upload) {
    width: 100%;
}

.upload-wrapper :deep(.el-button) {
    width: 100%;
}

.field-upload-hints {
    margin-top: 0.5rem;
}

.field-upload-hints .hint-line {
    margin: 0 0 0.35rem;
    font-size: 0.75rem;
    color: #909399;
    line-height: 1.45;
}

.field-upload-hints .hint-line:last-child {
    margin-bottom: 0;
}

/* 折叠面板样式 */
:deep(.el-collapse) {
    border: none;
}

:deep(.el-collapse-item) {
    margin-bottom: 0.5rem;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
}

:deep(.el-collapse-item__header) {
    padding: 1rem;
    background: #fafbfc;
    border: none;
    font-weight: 500;
    height: auto;
    line-height: 1.5;
}

:deep(.el-collapse-item__header:hover) {
    background: #f0f2f5;
}

:deep(.el-collapse-item__wrap) {
    border: none;
    background: white;
}

:deep(.el-collapse-item__content) {
    padding: 0 1rem 1rem;
}
</style>

