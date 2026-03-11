<template>
  <div class="quill-editor-wrapper" ref="wrapperRef">
    <div :id="editorId" class="quill-editor"></div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png"
      class="hidden"
    />
    <el-dialog
      v-model="sourceDialogVisible"
      title="HTML 源码"
      width="640px"
      destroy-on-close
      @closed="sourceDialogVisible = false"
    >
      <el-input
        v-model="sourceContent"
        type="textarea"
        :rows="16"
        placeholder="编辑 HTML 源码"
        class="font-mono text-sm"
      />
      <template #footer>
        <el-button @click="sourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applySource">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { handleImageUpload } from "@/utils/imageUpload";

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
const fileInput = ref(null);
const wrapperRef = ref(null);
const sourceDialogVisible = ref(false);
const sourceContent = ref("");

function openSourceDialog() {
  if (quill) {
    sourceContent.value = quill.root.innerHTML || "";
    sourceDialogVisible.value = true;
  }
}

function applySource() {
  if (quill) {
    const html = sourceContent.value || "";
    quill.root.innerHTML = html;
    emit("update:modelValue", html);
  }
  sourceDialogVisible.value = false;
}

onMounted(() => {
  quill = new Quill(`#${editorId}`, {
    theme: "snow",
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "link"],
          [{ color: [] }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["image"],
        ],
        handlers: {
          image() {
            if (!fileInput.value) return;
            fileInput.value.click();
          },
        },
      },
    },
    placeholder: props.placeholder,
  });

  // 在工具栏末尾加入「HTML 源码」按钮（与自带工具同一行）
  const toolbar = wrapperRef.value?.querySelector?.(".ql-toolbar");
  if (toolbar) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ql-source ql-picker";
    btn.setAttribute("title", "HTML 源码");
    btn.innerHTML = "<span>HTML</span>";
    btn.addEventListener("click", openSourceDialog);
    toolbar.appendChild(btn);
  }

  quill.root.innerHTML = props.modelValue || "";

  quill.on("text-change", () => {
    const content = quill.root.innerHTML;
    emit("update:modelValue", content);
  });

  if (fileInput.value) {
    fileInput.value.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await handleImageUpload(file, (url) => {
        if (!quill || !url) return;
        const range = quill.getSelection(true) || { index: quill.getLength() };
        quill.insertEmbed(range.index, "image", url, "user");
        quill.setSelection(range.index + 1, 0, "user");
      });
      // 重置 input，避免同一文件无法再次选择
      e.target.value = "";
    });
  }
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
.quill-editor-wrapper {
  width: 100%;
}
.quill-editor-wrapper :deep(.ql-toolbar .ql-source) {
  width: auto;
  padding: 0 8px;
  font-size: 12px;
}
.quill-editor {
  min-height: 300px;
  background: white;
  width: 100%;
}
.hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
</style>