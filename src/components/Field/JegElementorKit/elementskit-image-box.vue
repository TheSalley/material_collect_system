<template>
    <div class="__field-item">
        <div class="mb-4">
            <label class="__field-label">
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
            <label class="__field-label">
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
            <label class="__field-label">
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
            <label class="__field-label">
                <el-icon><Picture /></el-icon>
                图片
            </label>
            <div v-if="imageUrl" class="image-preview mb-3">
                <img :src="imageUrl" alt="预览图" />
            </div>
            <el-upload 
                action="#" 
                :before-upload="handleBeforeUpload"
                :show-file-list="false"
                class="upload-wrapper">
                <el-button type="primary" :icon="Upload">上传图片</el-button>
            </el-upload>
            <div class="field-upload-hints">
                <p v-if="naturalSizeInfo.label" class="hint-line">{{ naturalSizeInfo.label }}</p>
                <p class="hint-line">{{ uploadTip }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Upload as UploadIcon, Promotion, Document, Link, Picture } from '@element-plus/icons-vue';
import {
    handleImageUpload,
    IMAGE_UPLOAD_DEFAULTS,
    buildImageUploadTip,
    getImageNaturalSizeFromUrl,
    formatNaturalSizeLabel,
} from "@/utils/imageUpload";
import { getFileFullUrl } from "@/apis";

const uploadRuleOptions = { ...IMAGE_UPLOAD_DEFAULTS };
const uploadTip = buildImageUploadTip(uploadRuleOptions);
const naturalSizeInfo = ref({ label: "", dims: null });

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
    const url = props.fields.ekit_image_box_image?.url;
    if (!url) return '';
    // 如果已经是完整URL，直接返回；否则使用 getFileFullUrl 转换
    return url.startsWith('http') ? url : getFileFullUrl(url);
});

watch(
    () => imageUrl.value,
    async (url) => {
        naturalSizeInfo.value = { label: "", dims: null };
        if (!url) return;
        const dim = await getImageNaturalSizeFromUrl(url);
        naturalSizeInfo.value = {
            label: formatNaturalSizeLabel(dim),
            dims: dim,
        };
    },
    { immediate: true }
);

const handleBeforeUpload = (file) => {
    const opts = naturalSizeInfo.value.dims
        ? { strictMatch: true, refDimensions: naturalSizeInfo.value.dims }
        : {};
    handleImageUpload(file, (url, id) => {
        const imageData = {
            ...props.fields.ekit_image_box_image,
            url: url,
            id: id,
        };
        props.onUpdate('ekit_image_box_image', imageData);
    }, opts);
    return false;
};
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1rem;
}

.mb-2 {
    margin-bottom: 0.75rem;
}

.__field-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
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
</style>

