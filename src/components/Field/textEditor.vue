<template>
  <div class="field-item">
    <span class="field-label">文本：</span>
    <div :id="'editor_' + nodeId" class="min-h-[300px]"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ""
  },
  onUpdate: {
    type: Function,
    required: true
  }
});

let quill = null;

onMounted(() => {
  quill = new Quill(`#editor_${props.nodeId}`, {
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
    placeholder: "请输入文案",
  });
  
  quill.root.innerHTML = props.content;
  quill.on("text-change", () => {
    props.onUpdate("editor", quill.root.innerHTML);
  });
});
</script>