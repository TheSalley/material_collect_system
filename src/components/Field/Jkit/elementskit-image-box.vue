<template>
    <div class="field-item">
        <div class="mb-4">
            <label class="field-label">
                <el-icon><Promotion /></el-icon>
                标题文本
            </label>
            <el-input 
                v-model="fields.ekit_image_box_title_text"
                show-word-limit 
                type="textarea"
                :rows="2"
                @input="onUpdate('ekit_image_box_title_text', fields.ekit_image_box_title_text)"
                placeholder="请输入标题文本" />
        </div>
        
        <div class="mb-4">
            <label class="field-label">
                <el-icon><Document /></el-icon>
                描述文本
            </label>
            <el-input 
                v-model="fields.ekit_image_box_description_text"
                show-word-limit 
                type="textarea" 
                :rows="3"
                @input="onUpdate('ekit_image_box_description_text', fields.ekit_image_box_description_text)"
                placeholder="请输入描述文本" />
        </div>
        
        <div class="mb-4">
            <label class="field-label">
                <el-icon><Link /></el-icon>
                按钮文本
            </label>
            <el-input 
                v-model="fields.ekit_image_box_btn_text"
                show-word-limit 
                @input="onUpdate('ekit_image_box_btn_text', fields.ekit_image_box_btn_text)"
                placeholder="请输入按钮文本" />
        </div>
        
        <div class="mb-4">
            <label class="field-label">
                <el-icon><Picture /></el-icon>
                图片
            </label>
            <div v-if="imageUrl" class="image-preview mb-2">
                <img :src="imageUrl" alt="预览图" />
                <div class="image-overlay">
                    <span class="image-url">{{ imageUrl }}</span>
                </div>
            </div>
            <el-upload 
                action="#" 
                :before-upload="handleBeforeUpload"
                :show-file-list="false">
                <el-button type="primary" :icon="Upload">
                    {{ imageUrl ? '更换图片' : '上传图片' }}
                </el-button>
                <template #tip>
                    <div class="el-upload__tip">
                        支持 jpg/png 格式，大小不超过 10MB
                    </div>
                </template>
            </el-upload>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { Upload as UploadIcon, Promotion, Document, Link, Picture } from '@element-plus/icons-vue';
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

// 获取图片URL用于预览
const imageUrl = computed(() => {
    return props.fields.ekit_image_box_image?.url || '';
});

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
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadImage(formData);

        if (res.code === 0 && res.data[0].success) {
            ElMessage.success("图片上传成功！");
            // 直接修改原对象，避免创建新对象破坏数据结构
            if (!props.fields.ekit_image_box_image) {
                props.fields.ekit_image_box_image = {};
            }
            props.fields.ekit_image_box_image.url = res.data[0].data.url;
            props.fields.ekit_image_box_image.id = res.data[0].data.attachment_id;
            props.onUpdate('ekit_image_box_image', props.fields.ekit_image_box_image);
        } else {
            ElMessage.error("上传失败：" + res.message);
        }
    } catch (err) {
        ElMessage.error("上传失败：" + err.message);
    }
};
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1rem;
}

.mb-2 {
    margin-bottom: 0.75rem;
}

.field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.image-preview {
    position: relative;
    width: 100%;
    max-width: 300px;
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
</style>

