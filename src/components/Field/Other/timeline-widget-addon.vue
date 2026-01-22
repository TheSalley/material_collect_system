<template>
    <div class="timeline-container field-item">
        <div class="timeline-header">
            <h4>
                <el-icon><Clock /></el-icon>
                时间轴事件
            </h4>
            <el-tag type="info">{{ fields.twae_list?.length || 0 }} 个事件</el-tag>
        </div>
        
        <el-collapse v-model="activeItems" accordion>
            <el-collapse-item 
                v-for="(item, index) in fields.twae_list" 
                :key="item._id || index"
                :name="`item-${index}`">
                <template #title>
                    <div class="item-title">
                        <el-icon class="item-icon"><Clock /></el-icon>
                        <span>事件 {{ index + 1 }}</span>
                        <el-tag size="small" v-if="item.twae_date_label" type="success">
                            {{ item.twae_date_label }}
                        </el-tag>
                    </div>
                </template>
                
                <div class="item-content">
                    <!-- 故事标题 -->
                    <div class="field-group mb-4">
                        <label class="field-label">
                            <el-icon><Promotion /></el-icon>
                            故事标题
                        </label>
                        <el-input 
                            v-model="item.twae_story_title"
                            show-word-limit 
                            @input="handleUpdate(index, 'twae_story_title', item.twae_story_title)"
                            placeholder="请输入故事标题" />
                    </div>
                    
                    <!-- 描述 -->
                    <div class="field-group mb-4">
                        <label class="field-label">
                            <el-icon><Document /></el-icon>
                            描述
                        </label>
                        <el-input 
                            v-model="item.twae_description"
                            show-word-limit 
                            type="textarea" 
                            :rows="4"
                            @input="handleUpdate(index, 'twae_description', item.twae_description)"
                            placeholder="请输入事件描述（支持HTML标签）" />
                    </div>
                    
                    <!-- 年份 -->
                    <div class="field-group mb-4">
                        <label class="field-label">
                            <el-icon><Calendar /></el-icon>
                            年份
                        </label>
                        <el-input 
                            v-model="item.twae_year"
                            show-word-limit 
                            @input="handleUpdate(index, 'twae_year', item.twae_year)"
                            placeholder="请输入年份，如：2022" />
                    </div>
                    
                    <!-- 日期标签 -->
                    <div class="field-group mb-4">
                        <label class="field-label">
                            <el-icon><Calendar /></el-icon>
                            日期标签
                        </label>
                        <el-input 
                            v-model="item.twae_date_label"
                            show-word-limit 
                            @input="handleUpdate(index, 'twae_date_label', item.twae_date_label)"
                            placeholder="请输入日期标签，如：2022" />
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { Clock, Promotion, Document, Calendar } from '@element-plus/icons-vue';

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

// 当前展开的事件项
const activeItems = ref('item-0');

// 处理字段更新
const handleUpdate = (itemIndex, fieldName, value) => {
    // 直接修改原数组中的对象，不创建新对象
    props.fields.twae_list[itemIndex][fieldName] = value;
    // 触发更新，传递原数组
    props.onUpdate('twae_list', props.fields.twae_list);
};
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

