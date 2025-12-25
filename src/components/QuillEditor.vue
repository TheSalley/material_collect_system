<template>
  <div :id="editorId" class="quill-editor"></div>
</template>

<script setup>
import { onMounted, watch, nextTick } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  nodeId: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: "请输入内容..."
  }
});

const emit = defineEmits(["update:modelValue"]);

const editorId = `quill-editor-${props.nodeId}`;

let quill = null;

onMounted(() => {
  quill = new Quill(`#${editorId}`, {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "link"],
        [{ color: [] }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
    placeholder: props.placeholder,
  });

  // 设置初始内容
  quill.root.innerHTML = props.modelValue;

  // 监听内容变化
  quill.on("text-change", () => {
    const content = quill.root.innerHTML;
    emit("update:modelValue", content);
  });
});

// 监听外部值的变化，同步到编辑器
watch(() => props.modelValue, async (newVal) => {
  if (quill && newVal !== quill.root.innerHTML) {
    await nextTick();
    quill.root.innerHTML = newVal || "";
  }
});
</script>

<style scoped>
.quill-editor {
  min-height: 300px;
  background: white;
}
</style>