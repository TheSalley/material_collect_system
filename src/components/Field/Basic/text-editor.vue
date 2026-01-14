<template>
  <div class="field-item">
    <span class="field-label">文本：</span>
    <div :id="'editor_' + nodeId" class="min-h-[200px]"></div>
  </div>
</template>

<script setup>
import { onMounted, computed, watch, inject, ref } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { translate } from "@/apis/index.js";

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  localSettings: {
    type: Object,
    default: () => ({})
  },
  onUpdate: {
    type: Function,
    required: true
  }
});

const isTranslate = inject('isTranslate', ref(false));
const translateConfig = inject('translateConfig', { sourceLanguage: 'zh', targetLanguage: 'en' });

// 从localSettings中获取编辑器内容
const content = computed(() => props.localSettings.editor || "");

let quill = null;
let isTranslating = false;

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
    props.onUpdate("editor", quill.root.innerHTML);
  });
});

// 监听翻译状态变化，但只在状态变为true时触发一次
watch(isTranslate, async (newVal, oldVal) => {
  // 只有当状态从false变为true时才触发翻译，并且当前没有正在翻译
  if (newVal === true && oldVal === false && quill && !isTranslating) {
    isTranslating = true;
    // 获取编辑器中的文本内容
    const editorContent = quill.root.innerHTML;
    if (editorContent && editorContent.trim()) {
      try {
        // 调用翻译API
        const res = await translate({
          sourceText: editorContent,
          sourceLanguage: translateConfig.sourceLanguage,
          targetLanguage: translateConfig.targetLanguage
        });
        
        if (res.code === 0) {
          // 更新编辑器内容
          quill.root.innerHTML = res.data.translatedText;
          props.onUpdate("editor", res.data.translatedText);
        }
      } catch (error) {
        console.error("翻译出错:", error);
      } finally {
        isTranslating = false;
      }
    } else {
      isTranslating = false;
    }
  }
});
</script>