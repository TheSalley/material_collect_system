/**
 * usePageDragSort
 * 页面设置列表的行拖拽排序（站点级）。基于 Pointer Events 手写，不依赖第三方库。
 *
 * 手感要点：
 * - 整行可拖：在行上任意位置按下就能拖（开关、按钮等交互元素除外）
 * - 4px 起拖阈值：普通点击、点开关不会误触发拖拽
 * - 跟手插入线：指针到目标行上半插到它前面，下半插到它后面
 * - 边缘自动滚动：指针贴近可视区上下边缘时列表自己滚，长列表不用松手
 * - 拖动行半透明、光标 grabbing、拖动中禁止选中文字
 * - 只允许同 allow 段内互换，跨段落点不显示插入线
 *
 * @param {Object} options
 * @param {import('vue').Ref<Array>|Array} options.listRef 列表（元素需含唯一 idOf(row)）
 * @param {(row:any)=>any} options.idOf 取行唯一 id（默认 row.pageId ?? row.id）
 * @param {(a:any,b:any)=>boolean} options.sameGroup 两行能否互换（默认按 row.allow 比较）
 * @param {(from:number,to:number)=>void} options.onDrop 放置回调，to 为落点最终下标
 * @param {string} [options.gripSelector] 触摸端只认这个手柄（默认 .drag-grip）
 */
import { ref, onBeforeUnmount } from "vue";

/** 这些元素上的按下交给它们自己处理，不启动拖拽 */
const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "label",
  "[role='switch']",
  ".el-switch",
  ".el-button",
  ".el-input",
  ".el-checkbox",
  ".el-radio",
  ".el-table__expand-icon",
].join(",");

export function usePageDragSort({
  listRef,
  idOf,
  sameGroup,
  onDrop,
  gripSelector = ".drag-grip",
  threshold = 4,
  edgeSize = 56,
  maxSpeed = 20,
} = {}) {
  const getId = idOf || ((row) => row?.pageId ?? row?.id);
  const canDragTogether =
    sameGroup || ((a, b) => Boolean(a?.allow) === Boolean(b?.allow));
  const getList = () => (Array.isArray(listRef) ? listRef : listRef?.value || []);

  /** 正在拖的行下标，-1 表示没在拖 */
  const draggingIndex = ref(-1);
  /** 落点：{ index, position: 'before' | 'after' } | null */
  const dropTarget = ref(null);

  let active = false;
  // 已按下但还没过阈值：{ index, id, x, y }
  let pending = null;
  let rowEls = [];
  let rects = [];
  let scroller = null;
  let rafId = 0;
  let pointerY = 0;
  let lastKey = "";
  let prevCursor = "";
  let prevSelect = "";

  /** 行位置缓存，滚动或起拖时刷新 */
  function measure() {
    rects = rowEls.map((el) => el.getBoundingClientRect());
  }

  /** 从行往上找真正会滚的容器（PanelCard / 页面容器都可能是） */
  function findScroller(el) {
    let node = el?.parentElement;
    while (node && node !== document.body) {
      const { overflowY } = getComputedStyle(node);
      const scrollable = overflowY === "auto" || overflowY === "scroll";
      if (scrollable && node.scrollHeight > node.clientHeight + 1) return node;
      node = node.parentElement;
    }
    return null;
  }

  /** 按指针纵坐标算落点，同段校验不过就当没有落点 */
  function updateTarget(y) {
    const list = getList();
    let target = null;
    for (let i = 0; i < rects.length; i += 1) {
      const rect = rects[i];
      if (y < rect.top || y >= rect.bottom) continue;
      const isAfter = y - rect.top > rect.height / 2;
      target = { index: i, position: isAfter ? "after" : "before" };
      break;
    }
    // 落在首行上方 / 末行下方，也算贴边落点
    if (!target && rects.length) {
      if (y < rects[0].top) target = { index: 0, position: "before" };
      else if (y >= rects[rects.length - 1].bottom) {
        target = { index: rects.length - 1, position: "after" };
      }
    }
    if (target) {
      const from = draggingIndex.value;
      const dragRow = list[from];
      const overRow = list[target.index];
      const reject =
        !dragRow ||
        !overRow ||
        target.index === from ||
        !canDragTogether(dragRow, overRow);
      if (reject) target = null;
    }
    const key = target ? `${target.index}:${target.position}` : "";
    if (key === lastKey) return;
    lastKey = key;
    dropTarget.value = target;
  }

  /** 指针贴边时匀速滚动，越靠边越快 */
  function autoScrollTick() {
    if (!active) return;
    if (scroller) {
      const rect = scroller.getBoundingClientRect();
      let delta = 0;
      if (pointerY < rect.top + edgeSize) {
        const ratio = Math.min(1, (rect.top + edgeSize - pointerY) / edgeSize);
        delta = -maxSpeed * ratio;
      } else if (pointerY > rect.bottom - edgeSize) {
        const ratio = Math.min(1, (pointerY - rect.bottom + edgeSize) / edgeSize);
        delta = maxSpeed * ratio;
      }
      if (delta) {
        const before = scroller.scrollTop;
        scroller.scrollTop = before + delta;
        if (scroller.scrollTop !== before) {
          measure();
          updateTarget(pointerY);
        }
      }
    }
    rafId = requestAnimationFrame(autoScrollTick);
  }

  function onScroll() {
    measure();
    updateTarget(pointerY);
  }

  function startDrag() {
    active = true;
    draggingIndex.value = pending.index;
    dropTarget.value = null;
    lastKey = "";
    measure();
    scroller = findScroller(rowEls[0]);
    if (scroller) scroller.addEventListener("scroll", onScroll, { passive: true });
    // 拖动中：光标变抓取、禁止选中文字，避免蓝色选区乱闪
    prevCursor = document.body.style.cursor;
    prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    document.getSelection()?.removeAllRanges?.();
    rafId = requestAnimationFrame(autoScrollTick);
  }

  function onPointerMove(event) {
    if (active) {
      event.preventDefault();
      pointerY = event.clientY;
      updateTarget(event.clientY);
      return;
    }
    if (!pending) return;
    const movedX = Math.abs(event.clientX - pending.x);
    const movedY = Math.abs(event.clientY - pending.y);
    if (movedX < threshold && movedY < threshold) return;
    startDrag();
    event.preventDefault();
    pointerY = event.clientY;
    updateTarget(event.clientY);
  }

  function onPointerUp() {
    if (!active) {
      cleanup();
      return;
    }
    const from = draggingIndex.value;
    const target = dropTarget.value;
    let to = -1;
    if (target) {
      to = target.position === "after" ? target.index + 1 : target.index;
      // 往下拖时，先移除本源，落点会前移一位
      if (to > from) to -= 1;
    }
    cleanup();
    if (from !== -1 && to !== -1 && to !== from) onDrop?.(from, to);
  }

  function cleanup() {
    active = false;
    pending = null;
    draggingIndex.value = -1;
    dropTarget.value = null;
    lastKey = "";
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (scroller) scroller.removeEventListener("scroll", onScroll);
    scroller = null;
    rowEls = [];
    rects = [];
    document.body.style.cursor = prevCursor;
    document.body.style.userSelect = prevSelect;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  }

  /** 绑定到表格容器上即可，行下标按 DOM 顺序算 */
  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target;
    if (!target?.closest) return;
    // 开关、按钮、输入框上的按下交给它们自己
    if (target.closest(INTERACTIVE_SELECTOR)) return;
    const tr = target.closest("tbody tr");
    if (!tr) return;
    // 触摸端只认手柄，保证列表本身还能上下滑
    if (event.pointerType === "touch" && !target.closest(gripSelector)) return;

    const list = getList();
    rowEls = Array.from(tr.parentElement?.rows || []);
    const index = rowEls.indexOf(tr);
    if (index < 0 || !list[index]) return;

    pending = {
      index,
      id: getId(list[index]),
      x: event.clientX,
      y: event.clientY,
    };
    pointerY = event.clientY;
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  onBeforeUnmount(cleanup);

  return { draggingIndex, dropTarget, onPointerDown, cancel: cleanup };
}
