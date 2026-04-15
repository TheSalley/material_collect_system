<template>
    <div class="__field-item">
        <!-- 标题 -->
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><EditPen /></el-icon>
                标题
            </label>
            <el-input
                v-model="localFields.ekit_progressbar_title"
                show-word-limit
                :maxlength="200"
                @input="onUpdate('ekit_progressbar_title', localFields.ekit_progressbar_title)"
                placeholder="请输入标题"
            />
        </div>

        <!-- 百分比 -->
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><DataLine /></el-icon>
                百分比 (0-100)
            </label>
            <el-input-number
                v-model="localFields.ekit_progressbar_percentage"
                :min="0"
                :max="100"
                :step="1"
                @change="onUpdate('ekit_progressbar_percentage', localFields.ekit_progressbar_percentage)"
                placeholder="百分比"
                class="w-full"
            />
        </div>

        <!-- 实时预览 -->
        <div class="mb-4">
            <label class="__field-label">
                <el-icon><View /></el-icon>
                预览
            </label>
            <div class="progress-preview">
                <div v-if="title" class="progress-title mb-2">{{ title }}</div>
                <div class="progress-bar-wrapper">
                    <div class="progress-track">
                        <div
                            class="progress-fill"
                            :style="{ width: percentage + '%' }"
                        ></div>
                    </div>
                    <div v-if="showPercentage" class="progress-percent-badge">
                        {{ percentage }}%
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { EditPen, DataLine, View } from '@element-plus/icons-vue';

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

// 本地副本，避免直接修改 props
const localFields = reactive({
    ekit_progressbar_title: props.fields.ekit_progressbar_title || "",
    ekit_progressbar_percentage: Number(props.fields.ekit_progressbar_percentage) || 0,
});

// 同步外部字段变化到本地
watch(
    () => [props.fields.ekit_progressbar_title, props.fields.ekit_progressbar_percentage],
    ([newTitle, newPercent]) => {
        localFields.ekit_progressbar_title = newTitle || "";
        localFields.ekit_progressbar_percentage = Number(newPercent) || 0;
    },
    { immediate: true, deep: true }
);

// 计算属性用于预览
const title = computed(() => localFields.ekit_progressbar_title.trim());
const percentage = computed(() => {
    const p = localFields.ekit_progressbar_percentage;
    return Math.max(0, Math.min(100, Number(p) || 0));
});
const showPercentage = computed(() => percentage.value > 0);
</script>

<style scoped>
/* 进度条预览 */
.progress-preview {
    padding: 1rem;
    background: #fafbfc;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
}

.progress-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #303133;
    margin: 0;
}

.progress-bar-wrapper {
    position: relative;
    margin-top: 0.5rem;
}

.progress-track {
    width: 100%;
    height: 8px;
    background: #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-percent-badge {
    position: absolute;
    right: -50px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.75rem;
    font-weight: 600;
    color: #409eff;
    background: #ecf5ff;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
}
</style>
