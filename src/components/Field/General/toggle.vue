<template>
    <div class="__field-item">
        <div class="toggle-header">
            <label class="__field-label">
                <el-icon><Menu /></el-icon>
                <span>折叠面板</span>
                <FieldWidgetType :type="widgetType" />
            </label>
            <el-button size="small" @click="addItem">新增</el-button>
        </div>

        <div v-for="(item, index) in items" :key="item?._id || index" class="toggle-item">
            <div class="toggle-item-header" @click="toggleCollapse(index)">
                <div class="toggle-item-left">
                    <span class="toggle-index">{{ index + 1 }}</span>
                    <span class="toggle-title">{{ item.tab_title || '未命名' }}</span>
                </div>
                <div class="toggle-item-actions">
                    <el-button
                        size="small"
                        @click.stop="removeItem(index)"
                        :icon="Delete">
                        删除
                    </el-button>
                    <el-icon class="collapse-icon" :class="{ 'is-collapsed': collapsedItems.has(index) }">
                        <ArrowDown />
                    </el-icon>
                </div>
            </div>

            <div v-show="!collapsedItems.has(index)" class="toggle-item-content">
                <div class="__field-group mt-3">
                    <label class="__field-label">标题</label>
                    <el-input
                        v-model="item.tab_title"
                        placeholder="请输入标签标题"
                        @input="setItemField(index, 'tab_title', item.tab_title)"
                    />
                </div>

                <div class="__field-group mt-3">
                    <label class="__field-label">内容</label>
                    <QuillEditor
                        :node-id="`${widgetType}_tab_${index}`"
                        v-model="item.tab_content"
                        placeholder="请输入标签内容..."
                    />
                </div>
            </div>
        </div>

        <el-empty v-if="!items.length" description="暂无折叠面板内容" :image-size="60" />
    </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { Menu, Delete, ArrowDown } from "@element-plus/icons-vue";
import FieldWidgetType from "@/components/FieldWidgetType.vue";
import QuillEditor from "@/components/QuillEditor.vue";
import { genId } from "@/utils";

const props = defineProps({
    widgetType: {
        type: String,
        required: true,
    },
    fields: {
        type: Object,
        required: true,
    },
    onUpdate: {
        type: Function,
        required: true,
    },
});

const items = computed(() => {
    const v = props.fields?.tabs;
    return Array.isArray(v) ? v : [];
});

const collapsedItems = reactive(new Set());

function toggleCollapse(index) {
    if (collapsedItems.has(index)) {
        collapsedItems.delete(index);
    } else {
        collapsedItems.add(index);
    }
}

function emitItems(next) {
    props.onUpdate("tabs", next);
}

function addItem() {
    const next = items.value.slice();
    next.push({
        tab_title: "",
        tab_content: "",
        _id: genId(),
    });
    emitItems(next);
}

function removeItem(index) {
    const next = items.value.filter((_, i) => i !== index);
    emitItems(next);
}

function setItemField(index, key, value) {
    const next = items.value.slice();
    const cur = next[index] && typeof next[index] === "object" ? { ...next[index] } : {};
    cur[key] = value;
    next[index] = cur;
    emitItems(next);
}
</script>

<style scoped>
.toggle-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.toggle-item {
    border: 1px solid var(--field-border-color);
    border-radius: 6px;
    margin-bottom: 0.75rem;
    overflow: hidden;
}

.toggle-item:last-child {
    margin-bottom: 0;
}

.toggle-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    cursor: pointer;
    background: white;
    transition: background-color 0.2s;
}

.toggle-item-header:hover {
    background: var(--field-bg-hover);
}

.toggle-item-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.toggle-index {
    background: var(--el-color-primary);
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.toggle-title {
    font-weight: 500;
    color: var(--field-label-color);
}

.toggle-item-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.collapse-icon {
    transition: transform 0.3s;
    color: var(--field-label-color);
}

.collapse-icon.is-collapsed {
    transform: rotate(-90deg);
}

.toggle-item-content {
    padding: 0 0.75rem 0.75rem;
}

.mt-3 {
    margin-top: 0.75rem;
}
</style>
