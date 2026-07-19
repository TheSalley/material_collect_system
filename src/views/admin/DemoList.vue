<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useGlobalStore } from "@/stores/global.js";
import {
  deleteDemoConfig,
  getDemoConfig,
  getDemoConfigList,
  getFileFullUrl,
  getPageById,
  getPageConfig,
  getPages,
  saveDemoConfig,
} from "@/apis/index.js";
import { extractEditableData } from "@/utils/dataExtractor.js";
import { normalizeElementorRoots, pickFieldModule } from "@/utils/elementorFieldUi.js";
import {
  ArrowLeft,
  Delete,
  Document,
  Grid,
  PictureFilled,
  Refresh,
  Setting,
  UploadFilled,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const { websiteInfo } = useGlobalStore();

const fieldModules = import.meta.glob("/src/components/Field/**/*.vue", {
  eager: true,
});

const loadingList = ref(false);
const loadingDetail = ref(false);
const syncingFromSite = ref(false);
const savingConfig = ref(false);
const deletingConfig = ref(false);

const demoList = ref([]);
const editorPages = ref([]);
const selectedDemo = ref("");

const formState = reactive({
  id: null,
  demo: "",
  createdAt: "",
  updatedAt: "",
  blacklistText: "",
});

const routeContext = computed(() => {
  const siteId = route.query.site_id ?? websiteInfo?.site_id ?? "";
  const demoName =
    route.query.demo ??
    route.query.demo_site ??
    websiteInfo?.demo_site ??
    websiteInfo?.demo ??
    "";
  const siteName = route.query.site_name ?? websiteInfo?.site_name ?? "";
  const backPageId = route.query.back_page_id ?? "";

  return {
    siteId: String(siteId || "").trim(),
    demoName: String(demoName || "").trim(),
    siteName: String(siteName || "").trim(),
    backPageId: String(backPageId || "").trim(),
  };
});

const currentDemoName = computed(() => {
  return String(formState.demo || selectedDemo.value || routeContext.value.demoName || "").trim();
});

const blacklistItems = computed(() => {
  return formState.blacklistText
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
});

const totalSections = computed(() => {
  return editorPages.value.reduce((sum, page) => sum + page.sections.length, 0);
});

const totalImages = computed(() => {
  return editorPages.value.reduce((sum, page) => {
    return sum + page.sections.filter((section) => section.imageUrl).length;
  }, 0);
});

const totalSizes = computed(() => {
  return editorPages.value.reduce((sum, page) => {
    return (
      sum +
      page.sections.filter((section) => {
        return normalizePositiveInt(section.widthInput) || normalizePositiveInt(section.heightInput);
      }).length
    );
  }, 0);
});

const listStats = computed(() => {
  return demoList.value.map((item) => {
    return {
      ...item,
      imgCount: Array.isArray(item.imgs) ? item.imgs.length : 0,
      sizeCount: Array.isArray(item.sizes) ? item.sizes.length : 0,
    };
  });
});

function decodePageDisplayName(raw) {
  if (raw == null || raw === "") return "";
  const value = String(raw);
  if (!/%[0-9A-Fa-f]{2}/.test(value)) return value;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizePositiveInt(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
}

function formatDateTime(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").replace(".000Z", "");
}

function formatSize(width, height) {
  const normalizedWidth = normalizePositiveInt(width);
  const normalizedHeight = normalizePositiveInt(height);

  if (!normalizedWidth && !normalizedHeight) return "未设置";
  if (normalizedWidth && normalizedHeight) return `${normalizedWidth} x ${normalizedHeight}px`;
  if (normalizedWidth) return `${normalizedWidth}px`;
  return `${normalizedHeight}px`;
}

function hasFieldComponent(widgetType) {
  return pickFieldModule(fieldModules, widgetType) != null;
}

function hasRenderableEditableInTree(node, editableMap) {
  if (!node || !editableMap) return false;

  if (node.id && editableMap.has(node.id)) {
    const editableNode = editableMap.get(node.id);
    if (hasFieldComponent(editableNode?.widgetType)) return true;
  }

  if (Array.isArray(node.elements)) {
    return node.elements.some((child) => hasRenderableEditableInTree(child, editableMap));
  }

  return false;
}

function buildVisibleParts(elementorData) {
  const editableMap = extractEditableData(elementorData);
  const parts = normalizeElementorRoots(elementorData);
  return parts.filter((part) => part && hasRenderableEditableInTree(part, editableMap));
}

function buildSizeMap(list = []) {
  const map = new Map();

  for (const item of list) {
    const moduleId = item?.module_id ?? item?.moduleId ?? "";
    if (!moduleId) continue;

    map.set(String(moduleId), {
      width: normalizePositiveInt(item.width),
      height: normalizePositiveInt(item.height),
    });
  }

  return map;
}

function createSectionRecord({
  pageId,
  pageName,
  index,
  moduleId,
  sectionLabel,
  elementType,
  imageUrl,
  imageName,
  width,
  height,
}) {
  const persistedModuleId = moduleId != null && moduleId !== "" ? String(moduleId) : "";
  const normalizedLabel = sectionLabel || `板块 ${index + 1}`;

  return {
    key: `${pageId || pageName || "page"}-${persistedModuleId || index + 1}`,
    persistedModuleId,
    moduleId: persistedModuleId || `section-${index + 1}`,
    sectionIndex: index,
    sectionLabel: normalizedLabel,
    elementType: elementType || "section",
    imageUrl: imageUrl ? getFileFullUrl(imageUrl) : "",
    imageName: imageName || "",
    widthInput: width != null ? String(width) : "",
    heightInput: height != null ? String(height) : "",
  };
}

function buildSectionsFromSiteConfig(pageId, pageName, visibleParts, materials, sizeMap) {
  if (visibleParts.length > 0) {
    const sections = visibleParts.map((part, index) => {
      const material = materials[index] || null;
      const sizeInfo = sizeMap.get(String(part?.id));

      return createSectionRecord({
        pageId,
        pageName,
        index,
        moduleId: part?.id,
        sectionLabel: `板块 ${index + 1}`,
        elementType: part?.elType || "section",
        imageUrl: material?.url || material?.file_url || "",
        imageName: material?.image_name || material?.imageName || material?.page || "",
        width: sizeInfo?.width ?? null,
        height: sizeInfo?.height ?? null,
      });
    });

    const knownModuleIds = new Set(sections.map((section) => section.persistedModuleId).filter(Boolean));

    materials.forEach((material, index) => {
      const moduleId = material?.module_id ?? material?.moduleId ?? "";
      if (!moduleId || knownModuleIds.has(String(moduleId))) return;

      sections.push(
        createSectionRecord({
          pageId,
          pageName,
          index: sections.length,
          moduleId,
          sectionLabel: material?.section_label || material?.sectionLabel || `板块 ${sections.length + 1}`,
          elementType: material?.element_type || material?.elementType || "section",
          imageUrl: material?.url || material?.file_url || "",
          imageName: material?.image_name || material?.imageName || material?.page || "",
          width: sizeMap.get(String(moduleId))?.width ?? null,
          height: sizeMap.get(String(moduleId))?.height ?? null,
        }),
      );
    });

    for (const [moduleId, sizeInfo] of sizeMap.entries()) {
      if (knownModuleIds.has(moduleId)) continue;

      sections.push(
        createSectionRecord({
          pageId,
          pageName,
          index: sections.length,
          moduleId,
          sectionLabel: `板块 ${sections.length + 1}`,
          elementType: "section",
          imageUrl: "",
          imageName: "",
          width: sizeInfo?.width ?? null,
          height: sizeInfo?.height ?? null,
        }),
      );
    }

    return sections;
  }

  const sections = materials.map((material, index) => {
    const moduleId = material?.module_id ?? material?.moduleId ?? "";
    const sizeInfo = moduleId ? sizeMap.get(String(moduleId)) : null;

    return createSectionRecord({
      pageId,
      pageName,
      index,
      moduleId,
      sectionLabel: material?.section_label || material?.sectionLabel || `板块 ${index + 1}`,
      elementType: material?.element_type || material?.elementType || "section",
      imageUrl: material?.url || material?.file_url || "",
      imageName: material?.image_name || material?.imageName || material?.page || "",
      width: sizeInfo?.width ?? null,
      height: sizeInfo?.height ?? null,
    });
  });

  const knownModuleIds = new Set(sections.map((section) => section.persistedModuleId).filter(Boolean));
  for (const [moduleId, sizeInfo] of sizeMap.entries()) {
    if (knownModuleIds.has(moduleId)) continue;

    sections.push(
      createSectionRecord({
        pageId,
        pageName,
        index: sections.length,
        moduleId,
        sectionLabel: `板块 ${sections.length + 1}`,
        elementType: "section",
        imageUrl: "",
        imageName: "",
        width: sizeInfo?.width ?? null,
        height: sizeInfo?.height ?? null,
      }),
    );
  }

  return sections;
}

function ensureEditorPage(pageMap, pageId, pageName) {
  const key = `${pageId || ""}::${pageName || ""}`;
  if (!pageMap.has(key)) {
    pageMap.set(key, {
      key,
      pageId,
      pageName: pageName || pageId || "未命名页面",
      sections: [],
      _sectionMap: new Map(),
    });
  }

  return pageMap.get(key);
}

function ensureEditorSection(page, source, fallbackIndex) {
  const rawModuleId = source?.module_id ?? source?.moduleId ?? "";
  const rawSectionIndex = source?.section_index ?? source?.sectionIndex;
  const rawSectionLabel = source?.section_label ?? source?.sectionLabel ?? "";
  const sectionKey =
    (rawModuleId && `module:${rawModuleId}`) ||
    (rawSectionIndex != null && `index:${rawSectionIndex}`) ||
    `${page.key}:fallback:${fallbackIndex}`;

  if (!page._sectionMap.has(sectionKey)) {
    const numericIndex =
      rawSectionIndex != null && Number.isFinite(Number(rawSectionIndex))
        ? Number(rawSectionIndex)
        : fallbackIndex;

    const section = createSectionRecord({
      pageId: page.pageId,
      pageName: page.pageName,
      index: numericIndex,
      moduleId: rawModuleId,
      sectionLabel: rawSectionLabel,
      elementType: source?.element_type ?? source?.elementType ?? "section",
      imageUrl: "",
      imageName: "",
      width: null,
      height: null,
    });

    page._sectionMap.set(sectionKey, section);
    page.sections.push(section);
  }

  return page._sectionMap.get(sectionKey);
}

function buildEditorPagesFromStoredData(imgs = [], sizes = []) {
  const pageMap = new Map();

  imgs.forEach((item, index) => {
    const pageId = String(item?.page_id ?? item?.pageId ?? "").trim();
    const pageName = String(item?.page_name ?? item?.pageName ?? item?.page ?? pageId ?? "").trim();
    const page = ensureEditorPage(pageMap, pageId, pageName);
    const section = ensureEditorSection(page, item, index);

    section.imageUrl = item?.url || item?.file_url ? getFileFullUrl(item?.url || item?.file_url) : "";
    section.imageName = item?.image_name ?? item?.imageName ?? item?.page ?? "";
    if (item?.section_label || item?.sectionLabel) {
      section.sectionLabel = item?.section_label ?? item?.sectionLabel;
    }
    if (item?.element_type || item?.elementType) {
      section.elementType = item?.element_type ?? item?.elementType;
    }
  });

  sizes.forEach((item, index) => {
    const pageId = String(item?.page_id ?? item?.pageId ?? "").trim();
    const pageName = String(item?.page_name ?? item?.pageName ?? pageId ?? "").trim();
    const page = ensureEditorPage(pageMap, pageId, pageName);
    const section = ensureEditorSection(page, item, index);

    section.widthInput = item?.width != null ? String(item.width) : "";
    section.heightInput = item?.height != null ? String(item.height) : "";
    if (item?.section_label || item?.sectionLabel) {
      section.sectionLabel = item?.section_label ?? item?.sectionLabel;
    }
    if (item?.element_type || item?.elementType) {
      section.elementType = item?.element_type ?? item?.elementType;
    }
  });

  return Array.from(pageMap.values()).map((page) => {
    page.sections.sort((a, b) => a.sectionIndex - b.sectionIndex);
    delete page._sectionMap;
    return page;
  });
}

function serializeEditorPages() {
  const imgs = [];
  const sizes = [];

  editorPages.value.forEach((page) => {
    page.sections.forEach((section, index) => {
      const sectionIndex = Number.isFinite(Number(section.sectionIndex)) ? Number(section.sectionIndex) : index;
      const basePayload = {
        page_id: page.pageId || "",
        page_name: page.pageName || "",
        section_index: sectionIndex,
        section_label: section.sectionLabel || `板块 ${index + 1}`,
        element_type: section.elementType || "section",
      };

      if (section.persistedModuleId) {
        basePayload.module_id = section.persistedModuleId;
      }

      if (section.imageUrl) {
        imgs.push({
          ...basePayload,
          url: section.imageUrl,
          image_name: section.imageName || "",
        });
      }

      const width = normalizePositiveInt(section.widthInput);
      const height = normalizePositiveInt(section.heightInput);
      if (width || height) {
        sizes.push({
          ...basePayload,
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
        });
      }
    });
  });

  return { imgs, sizes };
}

function applyConfigRecord(record, fallbackDemo = "") {
  formState.id = record?.id ?? null;
  formState.demo = String(record?.demo || fallbackDemo || "").trim();
  formState.createdAt = record?.created_at || "";
  formState.updatedAt = record?.updated_at || "";
  formState.blacklistText = Array.isArray(record?.blacklist) ? record.blacklist.join("\n") : "";
  editorPages.value = buildEditorPagesFromStoredData(record?.imgs || [], record?.sizes || []);
  selectedDemo.value = formState.demo;
}

function applyEmptyConfig(demo = "") {
  formState.id = null;
  formState.demo = String(demo || "").trim();
  formState.createdAt = "";
  formState.updatedAt = "";
  formState.blacklistText = "";
  editorPages.value = [];
  selectedDemo.value = formState.demo;
}

async function loadDemoList() {
  loadingList.value = true;

  try {
    const res = await getDemoConfigList({ page: 1, page_size: 100 });
    demoList.value = res?.code === 0 && Array.isArray(res.data?.list) ? res.data.list : [];
  } catch (error) {
    demoList.value = [];
    ElMessage.error(error?.message || "获取 Demo 配置列表失败");
  } finally {
    loadingList.value = false;
  }
}

async function loadSelectedDemoConfig(demo) {
  const normalizedDemo = String(demo || "").trim();
  if (!normalizedDemo) {
    applyEmptyConfig("");
    return;
  }

  loadingDetail.value = true;
  selectedDemo.value = normalizedDemo;

  try {
    const res = await getDemoConfig(normalizedDemo);
    if (res?.code === 0 && res?.data) {
      applyConfigRecord(res.data, normalizedDemo);
    } else {
      applyEmptyConfig(normalizedDemo);
    }
  } catch (error) {
    applyEmptyConfig(normalizedDemo);
    ElMessage.error(error?.message || `获取 ${normalizedDemo} 配置失败`);
  } finally {
    loadingDetail.value = false;
  }
}

async function initializePage() {
  await loadDemoList();

  const targetDemo = routeContext.value.demoName || selectedDemo.value || demoList.value[0]?.demo || "";
  await loadSelectedDemoConfig(targetDemo);
}

function setRouteDemo(demo) {
  router.replace({
    name: "AdminDemoList",
    query: {
      ...route.query,
      demo,
    },
  });
}

function handleSelectDemo(demo) {
  setRouteDemo(demo);
}

function goBack() {
  const backPageId = routeContext.value.backPageId;
  if (backPageId) {
    router.push({ path: `/admin/pages/${backPageId}` });
    return;
  }

  router.push({ name: "AdminDetail", query: { id: routeContext.value.siteId } });
}

function openPageEditor(pageId) {
  router.push({ path: `/admin/pages/${pageId}` });
}

async function syncFromCurrentSite() {
  const siteId = routeContext.value.siteId;
  const demoName = currentDemoName.value || routeContext.value.demoName;

  if (!siteId) {
    ElMessage.warning("当前缺少站点 ID，无法从站点提取截图和尺寸");
    return;
  }

  if (!demoName) {
    ElMessage.warning("请先填写 Demo 名称");
    return;
  }

  syncingFromSite.value = true;

  try {
    const pagesRes = await getPages(siteId);
    if (pagesRes?.code !== 0 || !Array.isArray(pagesRes?.data)) {
      ElMessage.error(pagesRes?.message || "获取页面列表失败");
      return;
    }

    const tasks = pagesRes.data.map(async (page) => {
      const pageId = String(page?.ID ?? page?.id ?? "").trim();
      const pageName = decodePageDisplayName(page?.post_name || page?.title || pageId);
      const [configRes, pageRes] = await Promise.all([
        getPageConfig(siteId, pageId),
        getPageById(pageId, siteId),
      ]);

      const materials = Array.isArray(configRes?.data?.materials) ? configRes.data.materials : [];
      const sizeMap = buildSizeMap(Array.isArray(configRes?.data?.sizes) ? configRes.data.sizes : []);

      let visibleParts = [];
      if (pageRes?.code === 0 && pageRes?.data?.meta_value) {
        try {
          visibleParts = buildVisibleParts(JSON.parse(pageRes.data.meta_value));
        } catch {
          visibleParts = [];
        }
      }

      return {
        key: `${pageId}::${pageName}`,
        pageId,
        pageName,
        sections: buildSectionsFromSiteConfig(pageId, pageName, visibleParts, materials, sizeMap),
      };
    });

    const results = await Promise.allSettled(tasks);
    editorPages.value = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    formState.demo = demoName;

    const failedCount = results.filter((result) => result.status === "rejected").length;
    if (failedCount > 0) {
      ElMessage.warning(`已提取成功部分页面，另有 ${failedCount} 个页面加载失败`);
      return;
    }

    ElMessage.success("已从当前站点提取 Demo 截图和尺寸");
  } catch (error) {
    ElMessage.error(error?.message || "提取当前站点配置失败");
  } finally {
    syncingFromSite.value = false;
  }
}

async function handleSaveConfig() {
  const demo = currentDemoName.value;
  if (!demo) {
    ElMessage.warning("请先填写 Demo 名称");
    return;
  }

  savingConfig.value = true;

  try {
    const payload = serializeEditorPages();
    const res = await saveDemoConfig({
      demo,
      imgs: payload.imgs,
      sizes: payload.sizes,
      blacklist: blacklistItems.value,
    });

    if (res?.code === 0) {
      applyConfigRecord(res.data, demo);
      await loadDemoList();
      ElMessage.success(res.message || "Demo 配置保存成功");
      return;
    }

    ElMessage.error(res?.message || "Demo 配置保存失败");
  } catch (error) {
    ElMessage.error(error?.message || "Demo 配置保存失败");
  } finally {
    savingConfig.value = false;
  }
}

async function handleDeleteConfig() {
  const demo = currentDemoName.value;
  if (!demo) {
    ElMessage.warning("当前没有可删除的 Demo");
    return;
  }

  try {
    await ElMessageBox.confirm(`确定删除 Demo "${demo}" 的配置吗？`, "删除确认", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      closeOnClickModal: false,
    });
  } catch {
    return;
  }

  deletingConfig.value = true;

  try {
    const res = await deleteDemoConfig(demo);
    if (res?.code === 0) {
      ElMessage.success(res.message || "删除成功");
      await loadDemoList();

      const nextDemo =
        routeContext.value.demoName === demo
          ? demoList.value[0]?.demo || ""
          : routeContext.value.demoName || demoList.value[0]?.demo || "";

      if (nextDemo && nextDemo !== demo) {
        setRouteDemo(nextDemo);
      } else {
        applyEmptyConfig("");
      }
      return;
    }

    ElMessage.error(res?.message || "删除失败");
  } catch (error) {
    ElMessage.error(error?.message || "删除失败");
  } finally {
    deletingConfig.value = false;
  }
}

watch(
  () => `${routeContext.value.demoName}__${routeContext.value.siteId}`,
  () => {
    initializePage();
  },
  { immediate: true },
);
</script>

<template>
  <div class="demo-config-page">
    <header class="demo-config-header">
      <div>
        <div class="demo-config-header__title">
          <el-icon class="demo-config-header__icon"><PictureFilled /></el-icon>
          <h1>Demo 截图尺寸配置</h1>
        </div>
        <p class="demo-config-header__desc">
          可以直接查看某个 Demo 已保存的截图与尺寸，也可以从当前站点一键提取后保存成 Demo 配置。
        </p>
      </div>

      <div class="demo-config-header__actions">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <el-button :icon="Refresh" :loading="loadingList || loadingDetail" @click="initializePage">
          刷新
        </el-button>
        <el-button
          type="primary"
          :icon="UploadFilled"
          :loading="syncingFromSite"
          @click="syncFromCurrentSite"
        >
          一键获取当前站点
        </el-button>
        <el-button
          type="success"
          :icon="Setting"
          :loading="savingConfig"
          @click="handleSaveConfig"
        >
          保存 Demo 配置
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :loading="deletingConfig"
          @click="handleDeleteConfig"
        >
          删除配置
        </el-button>
      </div>
    </header>

    <section class="demo-config-body">
      <aside class="demo-config-sidebar" v-loading="loadingList">
        <div class="demo-config-sidebar__header">
          <h2>Demo 列表</h2>
          <span>{{ demoList.length }} 个</span>
        </div>

        <div v-if="listStats.length > 0" class="demo-config-list">
          <button
            v-for="item in listStats"
            :key="item.id || item.demo"
            type="button"
            class="demo-config-list__item"
            :class="{ 'is-active': item.demo === currentDemoName }"
            @click="handleSelectDemo(item.demo)"
          >
            <div class="demo-config-list__item-title">
              <strong>{{ item.demo }}</strong>
            </div>
            <div class="demo-config-list__item-meta">
              <span>{{ item.imgCount }} 张图</span>
              <span>{{ item.sizeCount }} 个尺寸</span>
            </div>
            <div class="demo-config-list__item-time">
              {{ formatDateTime(item.updated_at) }}
            </div>
          </button>
        </div>

        <el-empty
          v-else
          description="暂无 Demo 配置"
          :image-size="72"
        />
      </aside>

      <main class="demo-config-main" v-loading="loadingDetail">
        <section class="demo-config-panel">
          <div class="demo-config-panel__head">
            <div>
              <h2>基本信息</h2>
              <p>当前站点：{{ routeContext.siteName || "-" }} / 站点 ID：{{ routeContext.siteId || "-" }}</p>
            </div>
          </div>

          <div class="demo-config-form">
            <label class="demo-config-field demo-config-field--wide">
              <span>Demo 名称</span>
              <el-input v-model="formState.demo" placeholder="请输入 demo 名称，例如 demo67" />
            </label>

            <div class="demo-config-stats">
              <div class="demo-stat-card">
                <span>页面数</span>
                <strong>{{ editorPages.length }}</strong>
              </div>
              <div class="demo-stat-card">
                <span>截图数</span>
                <strong>{{ totalImages }}</strong>
              </div>
              <div class="demo-stat-card">
                <span>尺寸数</span>
                <strong>{{ totalSizes }}</strong>
              </div>
              <div class="demo-stat-card">
                <span>板块数</span>
                <strong>{{ totalSections }}</strong>
              </div>
            </div>

            <label class="demo-config-field demo-config-field--wide">
              <span>黑名单</span>
              <el-input
                v-model="formState.blacklistText"
                type="textarea"
                :rows="5"
                placeholder="每行一个 URL"
              />
            </label>

            <div class="demo-config-meta">
              <span>创建时间：{{ formatDateTime(formState.createdAt) }}</span>
              <span>更新时间：{{ formatDateTime(formState.updatedAt) }}</span>
            </div>
          </div>
        </section>

        <section class="demo-config-panel">
          <div class="demo-config-panel__head">
            <div>
              <h2>截图与尺寸</h2>
              <p>这里展示当前 Demo 配置中的页面、板块截图和尺寸信息。</p>
            </div>
          </div>

          <el-empty
            v-if="editorPages.length === 0"
            description="当前 Demo 暂无截图和尺寸数据，可以先点击“一键获取当前站点”"
          />

          <div v-else class="demo-page-list">
            <article v-for="page in editorPages" :key="page.key" class="demo-page-card">
              <div class="demo-page-card__header">
                <div>
                  <div class="demo-page-card__title">
                    <el-icon><Document /></el-icon>
                    <h3>{{ page.pageName || "未命名页面" }}</h3>
                  </div>
                  <div class="demo-page-card__meta">
                    <span>页面 ID：{{ page.pageId || "-" }}</span>
                    <span>{{ page.sections.length }} 个板块</span>
                  </div>
                </div>

                <el-button
                  v-if="page.pageId"
                  :icon="PictureFilled"
                  @click="openPageEditor(page.pageId)"
                >
                  去页面配置
                </el-button>
              </div>

              <div class="demo-section-grid">
                <section
                  v-for="section in page.sections"
                  :key="section.key"
                  class="demo-section-card"
                >
                  <div class="demo-section-card__head">
                    <div class="demo-section-card__title">
                      <el-icon><Grid /></el-icon>
                      <span>{{ section.sectionLabel }}</span>
                    </div>
                    <el-tag size="small" effect="plain">{{ section.elementType }}</el-tag>
                  </div>

                  <div class="demo-section-card__preview">
                    <el-image
                      v-if="section.imageUrl"
                      :src="section.imageUrl"
                      :preview-src-list="[section.imageUrl]"
                      fit="cover"
                      class="demo-section-card__image"
                      preview-teleported
                    />
                    <el-empty
                      v-else
                      description="未配置截图"
                      :image-size="60"
                    />
                  </div>

                  <div class="demo-section-card__meta">
                    <div class="demo-section-card__meta-row">
                      <span>模块 ID</span>
                      <strong>{{ section.persistedModuleId || "-" }}</strong>
                    </div>
                    <div class="demo-section-card__meta-row">
                      <span>当前尺寸</span>
                      <strong>{{ formatSize(section.widthInput, section.heightInput) }}</strong>
                    </div>
                    <div
                      v-if="section.imageName"
                      class="demo-section-card__meta-row demo-section-card__meta-row--wrap"
                    >
                      <span>截图标识</span>
                      <strong>{{ section.imageName }}</strong>
                    </div>
                  </div>

                  <div class="demo-section-card__form">
                    <label class="demo-section-card__field">
                      <span>宽度</span>
                      <el-input
                        v-model="section.widthInput"
                        type="number"
                        min="1"
                        placeholder="px"
                      />
                    </label>

                    <label class="demo-section-card__field">
                      <span>高度</span>
                      <el-input
                        v-model="section.heightInput"
                        type="number"
                        min="1"
                        placeholder="px"
                      />
                    </label>
                  </div>
                </section>
              </div>
            </article>
          </div>
        </section>
      </main>
    </section>
  </div>
</template>

<style scoped>
.demo-config-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%);
}

.demo-config-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
}

.demo-config-header__title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.demo-config-header__title h1 {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  line-height: 1.15;
}

.demo-config-header__icon {
  color: #2563eb;
  font-size: 28px;
}

.demo-config-header__desc {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.demo-config-header__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.demo-config-body {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 20px;
  min-height: 0;
}

.demo-config-sidebar,
.demo-config-main {
  min-height: 0;
}

.demo-config-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
}

.demo-config-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.demo-config-sidebar__header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
}

.demo-config-sidebar__header span {
  color: #64748b;
  font-size: 13px;
}

.demo-config-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.demo-config-list__item {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #dbe4f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.demo-config-list__item:hover,
.demo-config-list__item.is-active {
  transform: translateY(-1px);
  border-color: #93c5fd;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.12);
}

.demo-config-list__item-title {
  margin-bottom: 8px;
  color: #0f172a;
}

.demo-config-list__item-meta,
.demo-config-list__item-time {
  display: flex;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
}

.demo-config-list__item-time {
  margin-top: 6px;
}

.demo-config-main {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.demo-config-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
}

.demo-config-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.demo-config-panel__head h2 {
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 20px;
}

.demo-config-panel__head p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.demo-config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-config-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #475569;
  font-size: 14px;
}

.demo-config-field--wide {
  width: 100%;
}

.demo-config-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.demo-stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #d9e6f7;
}

.demo-stat-card span {
  color: #64748b;
  font-size: 12px;
}

.demo-stat-card strong {
  color: #0f172a;
  font-size: 22px;
}

.demo-config-meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 12px;
}

.demo-page-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.demo-page-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid #dbe4f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.demo-page-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.demo-page-card__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.demo-page-card__title h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
}

.demo-page-card__meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 12px;
}

.demo-section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.demo-section-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #dbe4f0;
  background: #ffffff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.demo-section-card:hover {
  transform: translateY(-2px);
  border-color: #93c5fd;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.12);
}

.demo-section-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.demo-section-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-weight: 600;
}

.demo-section-card__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  padding: 12px;
  border-radius: 14px;
  background: #eff6ff;
  border: 1px dashed #bfdbfe;
}

.demo-section-card__image {
  width: 100%;
  height: 170px;
  border-radius: 10px;
  overflow: hidden;
}

.demo-section-card__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-section-card__meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #475569;
  font-size: 13px;
}

.demo-section-card__meta-row strong {
  color: #0f172a;
  text-align: right;
}

.demo-section-card__meta-row--wrap strong {
  word-break: break-all;
}

.demo-section-card__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.demo-section-card__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #475569;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .demo-config-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .demo-config-page {
    padding: 16px;
  }

  .demo-config-header,
  .demo-page-card__header {
    flex-direction: column;
  }

  .demo-config-header__actions {
    justify-content: flex-start;
  }

  .demo-section-card__form {
    grid-template-columns: 1fr;
  }
}
</style>
