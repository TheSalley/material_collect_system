<template>
    <div class="field-item">
        <!-- 成员图片 -->
        <div class="mb-4">
            <label class="field-label">成员图片</label>
            <div class="image-row">
                <div class="image-preview" v-if="imageUrl">
                    <img :src="imageUrl" alt="预览" />
                </div>
                <el-upload
                    action="#"
                    :before-upload="handleImageUpload"
                    :show-file-list="false"
                    class="image-upload-btn"
                >
                    <el-button type="primary" :icon="Upload" :loading="uploading">
                        {{ imageUrl ? '更换图片' : '上传图片' }}
                    </el-button>
                </el-upload>
            </div>
        </div>

        <!-- 成员名称 -->
        <div class="mb-4">
            <label class="field-label">成员名称</label>
            <el-input
                v-model="fields.sg_member_name"
                @input="onUpdate('sg_member_name', fields.sg_member_name)"
                placeholder="请输入成员名称" />
        </div>

        <!-- 成员描述 -->
        <div class="mb-4" v-if="settings?.sg_member_show_description === 'yes'">
            <label class="field-label">成员描述</label>
            <el-input
                v-model="fields.sg_member_description"
                show-word-limit
                type="textarea"
                :rows="3"
                @input="onUpdate('sg_member_description', fields.sg_member_description)"
                placeholder="请输入成员描述" />
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { Upload } from "@element-plus/icons-vue";
import { uploadImageFile } from "@/utils/imageUpload";
import { ElMessage } from "element-plus";

const props = defineProps({
    nodeId: {
        type: String,
        required: true,
    },
    fields: {
        type: Object,
        required: true,
    },
    settings: {
        type: Object,
        default: () => ({}),
    },
    onUpdate: {
        type: Function,
        required: true,
    },
});

const uploading = ref(false);

const imageUrl = computed(() => {
    const img = props.fields.sg_member_image;
    if (!img) return "";
    const url = img?.url;
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("http") ? trimmed : `https://szkeran.yhct.top${trimmed}`;
});

async function handleImageUpload(file) {
    const ok = file.type.startsWith("image/");
    if (!ok) {
        ElMessage.error("请上传图片文件");
        return false;
    }
    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
        ElMessage.error(`图片大小不能超过 ${maxMB}MB`);
        return false;
    }
    uploading.value = true;
    try {
        const result = await uploadImageFile(file);
        if (result) {
            props.fields.sg_member_image = {
                id: result.id || "",
                url: result.url || "",
            };
            props.onUpdate("sg_member_image", props.fields.sg_member_image);
            ElMessage.success("图片上传成功");
        }
    } catch (e) {
        console.error("图片上传失败:", e);
        ElMessage.error("图片上传失败");
    } finally {
        uploading.value = false;
    }
    return false;
}
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1rem;
}

.field-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.image-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.image-preview {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    border: 1px dashed #dcdfe6;
    overflow: hidden;
    flex-shrink: 0;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-upload-btn {
    flex-shrink: 0;
}
</style>
