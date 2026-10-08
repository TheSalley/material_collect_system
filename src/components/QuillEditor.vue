<template>
  <div class="quill-editor-wrapper">
    <div ref="editorRef" class="quill-editor min-h-[120px]"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "请输入内容...",
  },
});

const emit = defineEmits(["update:modelValue"]);

let quill = null;
const editorRef = ref(null);

onMounted(() => {
  if (!editorRef.value) return;

  quill = new Quill(editorRef.value, {
    theme: "snow",
    modules: {
      toolbar: {
        container: [
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
    // 避免在内容相同时重复触发更新
    if (content !== props.modelValue) {
      emit("update:modelValue", content);
    }
  });
});

// 监听外部值的变化，同步到编辑器
watch(
  () => props.modelValue,
  (newVal) => {
    if (quill && newVal !== quill.root.innerHTML) {
      // 使用 Quill 的 API 来设置内容，而不是直接操作 innerHTML
      // 这可以避免光标跳动的问题
      const delta = quill.clipboard.convert(newVal || "");
      quill.setContents(delta, 'silent');
    }
  },
);
</script>

<style scoped></style>
