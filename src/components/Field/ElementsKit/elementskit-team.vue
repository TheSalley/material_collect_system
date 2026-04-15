<template>
    <div class="__field-item">
        <div class="__field-group">
            <label class="__field-label">
                <el-icon><Picture /></el-icon>
                <span>成员图片</span>
            </label>
            <div v-if="imageUrl" class="w-full max-w-[400px] mb-3">
                <img :src="imageUrl" alt="预览图" class="w-full h-auto object-contain rounded" />
            </div>
            <el-upload
                action="#"
                :before-upload="handleBeforeUpload"
                :show-file-list="false"
                class="w-full"
            >
                <el-button type="primary" :icon="Upload" class="w-full">上传图片</el-button>
            </el-upload>
            <div class="__field-upload-hints">
                <p v-if="naturalSizeInfo.label" class="__hint-line">{{ naturalSizeInfo.label }}</p>
                <p class="__hint-line">{{ uploadTip }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Upload as UploadIcon, Picture } from '@element-plus/icons-vue';
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

const imageUrl = computed(() => {
    const img = props.fields.ekit_team_image;
    if (!img) return '';
    const url = img?.url;
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed.startsWith('http') ? trimmed : getFileFullUrl(trimmed);
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
    return handleImageUpload(file, (url, id) => {
        if (!props.fields.ekit_team_image) {
            props.fields.ekit_team_image = {};
        }
        props.fields.ekit_team_image.url = url;
        props.fields.ekit_team_image.id = id;
        props.onUpdate('ekit_team_image', props.fields.ekit_team_image);
    }, opts);
};
</script>

<style scoped></style>
