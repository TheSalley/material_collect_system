/**
 * useModuleParts
 * ModuleMode 板块高亮 + 截图管理 composable
 *
 * 职责：
 * - 板块高亮索引（activePartIndex）与手风琴联动
 * - 编辑区滚动定位
 * - 模块截图管理（moduleImages，上传/移除/查询）
 *
 * 依赖（通过参数传入，保持 composable 纯净化）：
 * @param {Object} options
 * @param {Ref} options.websiteInfo - 当前站点信息 ref
 * @param {Ref|ComputedRef} options.pageId - 页面 ID ref/computed
 * @param {Function} options.buildPageMaterialsPayload - 构建页面素材 payload 的函数
 */
import { ref, computed, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { savePageConfig } from "@/apis/index.js";
import { moduleImageKey } from "@/utils/moduleModeUtils.js";

export function useModuleParts({ websiteInfo, pageId, buildPageMaterialsPayload }) {
  // ── 板块高亮联动 ─────────────────────────────────────────────────────────────

  /** 同步高亮：点击左侧截图或与右侧手风琴联动 */
  const activePartIndex = ref(null);

  /** 与 el-collapse 双向同步（单源：仍以 activePartIndex 为准） */
  const activeCollapseName = computed({
    get() {
      const i = activePartIndex.value;
      if (i === null || i === undefined) return undefined;
      return `part-${i}`;
    },
    set(v) {
      if (v === undefined || v === null || v === "") {
        activePartIndex.value = null;
        return;
      }
      const m = /^part-(\d+)$/.exec(String(v));
      activePartIndex.value = m ? Number(m[1]) : null;
    },
  });

  /** 编辑区滚动容器 ref */
  const editorScrollRef = ref(null);

  // ── 截图管理 ─────────────────────────────────────────────────────────────────

  /** 按模块 elementor id 存截图，与 visibleParts 顺序无关、与右侧板块一一对应 */
  const moduleImages = ref({});

  // ── 函数 ─────────────────────────────────────────────────────────────────────

  /** 点击预览板块，设置高亮索引 */
  function handlePreviewClick(index) {
    activePartIndex.value = index;
  }

  /** 获取模块截图 */
  function getModuleImage(id) {
    const k = moduleImageKey(id);
    return k ? moduleImages.value[k] : null;
  }

  

  // ── 滚动定位 ─────────────────────────────────────────────────────────────────

  /** 滚动编辑区到指定板块（精确计算可视区域） */
  function scrollEditorToActivePart(index) {
    if (index == null) return;
    const scrollEl = editorScrollRef.value;
    const itemEl = scrollEl?.querySelector(
      `.module-parts-collapse > .el-collapse-item:nth-child(${index + 1})`
    );
    if (!scrollEl || !itemEl) return;
    const se = scrollEl.getBoundingClientRect();
    const ie = itemEl.getBoundingClientRect();
    const margin = 10;
    const outAbove = ie.top < se.top + margin;
    const outBelow = ie.bottom > se.bottom - margin;
    if (outAbove || outBelow) {
      const delta = ie.top - se.top - margin;
      scrollEl.scrollTop += delta;
    }
  }

  /** 延迟滚动（等折叠动画/layout 稳定再滚，避免错位） */
  function scheduleScrollToActivePart(index) {
    if (index == null) return;
    const run = () => scrollEditorToActivePart(index);
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          run();
          setTimeout(run, 120);
        });
      });
    });
  }

  // ── watch：高亮变化时滚动 ────────────────────────────────────────────────────

  watch(
    () => activePartIndex.value,
    (index) => {
      scheduleScrollToActivePart(index);
    },
    { flush: "post" }
  );

  return {
    // 状态
    activePartIndex,
    activeCollapseName,
    editorScrollRef,
    moduleImages,
    // 函数
    handlePreviewClick,
    getModuleImage,
    scrollEditorToActivePart,
    scheduleScrollToActivePart,
  };
}
