<template>
  <div class="field-item">
    <span class="field-label">文本：</span>
    <div :id="'editor_' + nodeId" class="min-h-[200px]"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, computed, watch } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

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

// 从fields中获取编辑器内容
const content = computed(() => props.fields.editor || "");

let quill = null;
let applyingFromOutside = false;

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
  
  quill.root.innerHTML = content.value;
  quill.on("text-change", () => {
    if (applyingFromOutside) return;
    const html = quill.root.innerHTML;
    // 与其它 Field 组件一致：同步写回 fields，再向上通知写回数据源
    props.fields.editor = html;
    props.onUpdate("editor", html);
  });
});

watch(
  () => content.value,
  (next) => {
    if (!quill) return;
    const current = quill.root?.innerHTML ?? "";
    const desired = next ?? "";
    if (current === desired) return;
    applyingFromOutside = true;
    try {
      quill.clipboard.dangerouslyPasteHTML(desired);
    } finally {
      applyingFromOutside = false;
    }
  }
);

onBeforeUnmount(() => {
  quill = null;
});
</script>