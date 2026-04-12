<template>
  <div class="quill-editor-wrapper" ref="wrapperRef">
    <div :id="editorId" class="quill-editor min-h-[120px]"></div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  nodeId: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: "请输入内容...",
  },
});

const emit = defineEmits(["update:modelValue"]);

const editorId = `quill-editor-${props.nodeId}`;

let quill = null;
const wrapperRef = ref(null);

onMounted(() => {
  quill = new Quill(`#${editorId}`, {
    theme: "snow",
    modules: {
      toolbar: {
        container: [
          // [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "link"],
          [{ color: [] }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
      },
    },
    placeholder: props.placeholder,
  });

  quill.root.innerHTML = props.modelValue || "";

  quill.on("text-change", () => {
    const content = quill.root.innerHTML;
    emit("update:modelValue", content);
  });
});

// 监听外部值的变化，同步到编辑器
watch(
  () => props.modelValue,
  async (newVal) => {
    if (quill && newVal !== quill.root.innerHTML) {
      await nextTick();
      quill.root.innerHTML = newVal || "";
    }
  },
);
</script>

<style scoped></style>
