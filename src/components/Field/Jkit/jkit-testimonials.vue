<template>
    <div class="__field-item">
        <div v-for="(item, index) in listItems" :key="item._id" class="testimonial-item mb-4">
            <div class="testimonial-header">
                <span class="testimonial-index">{{ index + 1 }}</span>
                <el-button
                    type="danger"
                    size="small"
                    plain
                    @click="removeItem(index)"
                    :icon="Delete">
                    删除
                </el-button>
            </div>

            <!-- 头像上传 -->
            <div class="mb-3">
                <label class="__field-label">头像</label>
                <div class="avatar-row">
                    <div class="avatar-preview">
                        <img
                            v-if="getAvatarUrl(item)"
                            :src="getAvatarUrl(item)"
                            alt="头像预览"
                        />
                        <el-icon v-else class="avatar-placeholder"><User /></el-icon>
                    </div>
                    <el-upload
                        action="#"
                        :before-upload="(file) => handleAvatarUpload(file, index)"
                        :show-file-list="false"
                        class="avatar-upload-btn"
                    >
                        <el-button type="primary" size="small" :icon="Upload" :loading="uploadingIndex === index">
                            {{ getAvatarUrl(item) ? '更换头像' : '上传头像' }}
                        </el-button>
                    </el-upload>
                </div>
            </div>

            <div class="mb-3">
                <label class="__field-label">客户名称</label>
                <el-input
                    v-model="item.sg_testimonials_list_client_name"
                    @input="updateItem(index, item)"
                    placeholder="请输入客户名称" />
            </div>

            <div class="mb-3">
                <label class="__field-label">职位/称号</label>
                <el-input
                    v-model="item.sg_testimonials_list_designation"
                    @input="updateItem(index, item)"
                    placeholder="如: Customer" />
            </div>

            <div class="mb-3">
                <label class="__field-label">评价内容</label>
                <el-input
                    v-model="item.sg_testimonials_list_review"
                    show-word-limit
                    type="textarea"
                    :rows="3"
                    @input="updateItem(index, item)"
                    placeholder="请输入评价内容" />
            </div>
        </div>

        <el-button type="primary" @click="addItem" :icon="Plus" plain>
            添加评价
        </el-button>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { Plus, Delete, Upload, User } from "@element-plus/icons-vue";
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

const uploadingIndex = ref(null);

const listItems = computed(() => {
    return props.fields.sg_testimonials_list || [];
});

function getAvatarUrl(item) {
    const avatar = item?.sg_testimonials_list_client_avatar;
    if (!avatar) return "";
    const url = avatar?.url;
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("http") ? trimmed : `https://szkeran.yhct.top${trimmed}`;
}

function updateItem(index, item) {
    const list = [...(props.fields.sg_testimonials_list || [])];
    list[index] = { ...item };
    props.onUpdate('sg_testimonials_list', list);
}

async function handleAvatarUpload(file, index) {
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
    uploadingIndex.value = index;
    try {
        const result = await uploadImageFile(file);
        if (result) {
            const list = [...(props.fields.sg_testimonials_list || [])];
            const item = { ...list[index] };
            if (!item.sg_testimonials_list_client_avatar) {
                item.sg_testimonials_list_client_avatar = {};
            }
            item.sg_testimonials_list_client_avatar.id = result.id || "";
            item.sg_testimonials_list_client_avatar.url = result.url || "";
            list[index] = item;
            props.onUpdate('sg_testimonials_list', list);
            ElMessage.success("头像上传成功");
        }
    } catch (e) {
        console.error("头像上传失败:", e);
        ElMessage.error("头像上传失败");
    } finally {
        uploadingIndex.value = null;
    }
    return false;
}

function addItem() {
    const list = [...(props.fields.sg_testimonials_list || [])];
    list.push({
        _id: generateId(),
        sg_testimonials_list_client_avatar: {},
        sg_testimonials_list_client_name: "",
        sg_testimonials_list_designation: "Customer",
        sg_testimonials_list_review: "",
    });
    props.onUpdate('sg_testimonials_list', list);
}

function removeItem(index) {
    const list = [...(props.fields.sg_testimonials_list || [])];
    list.splice(index, 1);
    props.onUpdate('sg_testimonials_list', list);
}

function generateId() {
    return Math.random().toString(36).substring(2, 10);
}
</script>

<style scoped>
.mb-3 {
    margin-bottom: 0.75rem;
}

.__field-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.testimonial-item {
    padding: 1rem;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background: #fafafa;
}

.testimonial-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.testimonial-index {
    background: #409eff;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.avatar-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.avatar-preview {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 1px dashed #dcdfe6;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    flex-shrink: 0;
}

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    font-size: 24px;
    color: #c0c4cc;
}

.avatar-upload-btn {
    flex-shrink: 0;
}
</style>
