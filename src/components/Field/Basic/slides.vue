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
                        <div v-if="slide.background_image?.url" class="image-preview mb-2">
                            <img :src="slide.background_image.url" alt="背景图" />
                            <div class="image-overlay">
                                <span class="image-url">{{ slide.background_image.url }}</span>
                            </div>
                        </div>
                        <el-upload 
                            action="#" 
                            :before-upload="(file) => handleImageUpload(file, index)"
                            :show-file-list="false">
                            <el-button type="primary" :icon="Upload">
                                {{ slide.background_image?.url ? '更换图片' : '上传图片' }}
                            </el-button>
                            <template #tip>
                                <div class="el-upload__tip">
                                    支持 jpg/png 格式，大小不超过 10MB
                                </div>
                            </template>
                        </el-upload>
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { Upload as UploadIcon, Promotion, Document, Link, Picture, PictureFilled } from '@element-plus/icons-vue';
import { uploadImage } from "@/apis";

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

// 处理字段更新
const handleUpdate = (slideIndex, fieldName, value) => {
    // 直接修改原数组中的对象，不创建新对象
    props.fields.slides[slideIndex][fieldName] = value;
    // 触发更新，传递原数组
    props.onUpdate('slides', props.fields.slides);
};

// 处理图片上传
const handleImageUpload = async (file, slideIndex) => {
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

    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadImage(formData);

        if (res.code === 0 && res.data[0].success) {
            ElMessage.success("图片上传成功！");
            
            // 直接修改原对象，不创建新对象
            const currentSlide = props.fields.slides[slideIndex];
            if (!currentSlide.background_image) {
                currentSlide.background_image = {};
            }
            currentSlide.background_image.url = res.data[0].data.url;
            currentSlide.background_image.id = res.data[0].data.attachment_id;
            
            // 触发更新，传递原数组
            props.onUpdate('slides', props.fields.slides);
        } else {
            ElMessage.error("上传失败：" + res.message);
        }
    } catch (err) {
        ElMessage.error("上传失败：" + err.message);
    }

    return false;
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
    position: relative;
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview:hover .image-overlay {
    opacity: 1;
}

.image-preview img {
    width: 100%;
    height: auto;
    display: block;
}

.image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 0.75rem;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.image-url {
    color: white;
    font-size: 0.75rem;
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

