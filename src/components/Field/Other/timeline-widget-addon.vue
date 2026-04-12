<template>
    <div class="timeline-container __field-item">
        <div class="timeline-header">
            <h4>
                <el-icon><Clock /></el-icon>
                时间轴事件
            </h4>
            <el-button type="primary" size="small" @click="addItem" :icon="Plus" plain>
                添加事件
            </el-button>
        </div>
        
        <el-collapse v-model="activeItems" accordion>
            <el-collapse-item 
                v-for="(item, index) in listItems" 
                :key="item._id || index"
                :name="`item-${index}`">
                <template #title>
                    <div class="item-title">
                        <el-icon class="item-icon"><Clock /></el-icon>
                        <span>事件 {{ index + 1 }}</span>
                        <el-tag size="small" v-if="item.twae_date_label" type="success">
                            {{ item.twae_date_label }}
                        </el-tag>
                        <el-tag size="small" v-if="item.twae_year" type="warning">
                            {{ item.twae_year }}
                        </el-tag>
                    </div>
                </template>

                <div class="item-content">
                    <!-- 故事标题 -->
                    <div class="__field-group mb-4">
                        <label class="__field-label">
                            <el-icon><Promotion /></el-icon>
                            故事标题
                        </label>
                        <el-input 
                            v-model="item.twae_story_title"
                            show-word-limit 
                            @input="updateItem(index, item)"
                            placeholder="请输入故事标题" />
                    </div>
                    
                    <!-- 描述 -->
                    <div class="__field-group mb-4">
                        <label class="__field-label">
                            <el-icon><Document /></el-icon>
                            描述
                        </label>
                        <el-input 
                            v-model="item.twae_description"
                            show-word-limit 
                            type="textarea" 
                            :rows="4"
                            @input="updateItem(index, item)"
                            placeholder="请输入事件描述（支持HTML标签）" />
                    </div>
                    
                    <!-- 年份 -->
                    <div class="__field-group mb-4">
                        <label class="__field-label">
                            <el-icon><Calendar /></el-icon>
                            年份
                        </label>
                        <el-input 
                            v-model="item.twae_year"
                            @input="updateItem(index, item)"
                            placeholder="请输入年份，如：2022" />
                    </div>
                    
                    <!-- 日期标签 -->
                    <div class="__field-group mb-4">
                        <label class="__field-label">
                            <el-icon><Calendar /></el-icon>
                            日期标签
                        </label>
                        <el-input 
                            v-model="item.twae_date_label"
                            @input="updateItem(index, item)"
                            placeholder="请输入日期标签，如：2022" />
                    </div>

                    <!-- 图片上传 -->
                    <div class="__field-group mb-4">
                        <label class="__field-label">
                            <el-icon><Picture /></el-icon>
                            图片
                        </label>
                        <div class="image-row">
                            <div class="image-preview" v-if="getImageUrl(item)">
                                <img :src="getImageUrl(item)" alt="预览" />
                            </div>
                            <el-upload
                                action="#"
                                :before-upload="(file) => handleImageUpload(file, index)"
                                :show-file-list="false"
                                class="image-upload-btn"
                            >
                                <el-button type="primary" size="small" :icon="Upload" :loading="uploadingIndex === index">
                                    {{ getImageUrl(item) ? '更换图片' : '上传图片' }}
                                </el-button>
                            </el-upload>
                        </div>
                    </div>

                    <!-- 删除按钮 -->
                    <div class="__field-group">
                        <el-button type="danger" plain @click="removeItem(index)" :icon="Delete">
                            删除此事件
                        </el-button>
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>

        <el-empty v-if="!listItems.length" description="暂无事件，点击上方按钮添加" />
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { Clock, Promotion, Document, Calendar, Picture, Plus, Delete, Upload } from '@element-plus/icons-vue';
import { uploadImageFile } from "@/utils/imageUpload";
import { ElMessage } from "element-plus";

const props = defineProps({
    nodeId: {
        type: String,
        required: true
    },
    fields: {
        type: Object,
        required: true
    },
    settings: {
        type: Object,
        default: () => ({})
    },
    onUpdate: {
        type: Function,
        required: true
    }
});

const uploadingIndex = ref(null);
const activeItems = ref('item-0');

const listItems = computed(() => {
    return props.fields.twae_list || [];
});

function getImageUrl(item) {
    const img = item?.twae_image;
    if (!img) return "";
    const url = img?.url;
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("http") ? trimmed : `https://szkeran.yhct.top${trimmed}`;
}

function updateItem(index, item) {
    const list = [...(props.fields.twae_list || [])];
    list[index] = { ...item };
    props.onUpdate('twae_list', list);
}

async function handleImageUpload(file, index) {
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
            const list = [...(props.fields.twae_list || [])];
            const item = { ...list[index] };
            if (!item.twae_image) {
                item.twae_image = {};
            }
            item.twae_image.id = result.id || "";
            item.twae_image.url = result.url || "";
            list[index] = item;
            props.onUpdate('twae_list', list);
            ElMessage.success("图片上传成功");
        }
    } catch (e) {
        console.error("图片上传失败:", e);
        ElMessage.error("图片上传失败");
    } finally {
        uploadingIndex.value = null;
    }
    return false;
}

function addItem() {
    const list = [...(props.fields.twae_list || [])];
    list.push({
        _id: generateId(),
        twae_story_title: "",
        twae_description: "",
        twae_date_label: "",
        twae_year: "",
        twae_image: { id: "", url: "" },
    });
    props.onUpdate('twae_list', list);
    activeItems.value = `item-${list.length - 1}`;
}

function removeItem(index) {
    const list = [...(props.fields.twae_list || [])];
    list.splice(index, 1);
    props.onUpdate('twae_list', list);
}

function generateId() {
    return Math.random().toString(36).substring(2, 10);
}
</script>

<style scoped>
.timeline-container {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    border: 1px solid #e4e7ed;
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
}

.timeline-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.item-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: #303133;
}

.item-icon {
    color: #409eff;
    font-size: 1.25rem;
}

.item-content {
    padding: 1rem 0;
}

.__field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.__field-label {
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
