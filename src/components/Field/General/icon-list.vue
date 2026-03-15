<template>
    <div class="field-item">
        <div v-for="item in fields.icon_list" :key="item.id">
            <span class="field-label">标题：</span>
            <el-input v-model="item.text" show-word-limit @input="onUpdate('icon_list', fields.icon_list)" />
        </div>
    </div>
</template>
<script setup>
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
</script>
<style scoped></style>