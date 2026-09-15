/**
 * useDemoConfig
 * ModuleMode Demo 配置管理 composable（最复杂的部分，40+ 函数）
 *
 * 职责：
 * - Demo 配置状态管理（demoConfigState: imgs/sizes/blacklist）
 * - 板块截图管理（moduleImages，与 useModuleParts 共享）
 * - 尺寸配置管理（sectionSizes，provide 给子组件）
 * - Demo 截图绑定/解绑/同步
 * - Demo 尺寸绑定/解绑/同步
 * - 页面配置加载/保存
 *
 * 依赖（通过参数传入，保持 composable 纯净化）：
 * @param {Object} options
 * @param {Ref} options.websiteInfo - 当前站点信息 ref
 * @param {Ref|ComputedRef} options.pageId - 页面 ID ref/computed
 * @param {Ref} options.moduleImages - 模块截图 ref（与 useModuleParts 共享）
 * @param {Function} options.getModuleImage - 获取模块截图的函数（来自 useModuleParts）
 * @param {ComputedRef} options.visibleParts - 可见板块列表 computed
 */
import { ref, provide } from "vue";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import {
  getDemoConfig,
  saveDemoConfig,
  getPageConfig,
  savePageConfig,
  savePageSizes,
  getFileFullUrl,
} from "@/apis/index.js";
import {
  moduleImageKey,
  normalizeComparableUrl,
  buildSizeConfigKey,
  parseSizeConfigKey,
  getSizeRecord,
  normalizeDemoSizeRecords,
  extractSizeImageCandidate,
  isSameImageSource,
  replaceSizeRecordByKey,
  replaceDemoImageRecordByModuleId,
  removeDemoImageRecordByModuleId,
  removeSizeRecordByKey,
} from "@/utils/moduleModeUtils.js";

export function useDemoConfig({
  websiteInfo,
  pageId,
  moduleImages,
  getModuleImage,
  visibleParts,
}) {
  // ── 状态 ─────────────────────────────────────────────────────────────────────

  /** Demo 配置状态 */
  const demoConfigState = ref({
    imgs: [],
    sizes: [],
    blacklist: [],
  });

  /** 正在绑定 Demo 截图的 key */
  const bindingDemoImageKey = ref("");

  /** 正在绑定 Demo 尺寸的 key */
  const bindingDemoSizeKey = ref("");

  /** 按模块 elementor id 存尺寸配置，与 visibleParts 顺序无关、与右侧板块一一对应 */
  const sectionSizes = ref({});

  /** 正在移除截图的 key（用于 loading 状态） */
  const removingImageKey = ref(null);

  // ── provide（给子组件使用） ──────────────────────────────────────────────────

  provide("sectionSizes", sectionSizes);
  provide("bindDemoSize", toggleDemoSizeByNodeId);
  provide("bindDemoSizeLoadingKey", bindingDemoSizeKey);
  provide("isDemoSizeBound", isDemoSizeBound);

  // ── 基础函数 ─────────────────────────────────────────────────────────────────

  function currentDemoName() {
    const demo = websiteInfo.value?.demo_site || "";
    return String(demo || "").trim();
  }

  function cloneDemoConfigRecord(record = {}, demoName = "") {
    return {
      demo: demoName,
      imgs: Array.isArray(record?.imgs) ? [...record.imgs] : [],
      sizes: normalizeDemoSizeRecords(record?.sizes),
      blacklist: Array.isArray(record?.blacklist) ? [...record.blacklist] : [],
    };
  }

  function syncDemoConfigState(record = {}, demoName = "") {
    demoConfigState.value = cloneDemoConfigRecord(record, demoName);
  }

  async function fetchDemoConfigState() {
    const demoName = currentDemoName();
    if (!demoName) {
      syncDemoConfigState({}, "");
      return;
    }

    try {
      const res = await getDemoConfig(demoName);
      if (res?.code === 0) {
        syncDemoConfigState(res.data || {}, demoName);
        return;
      }
    } catch {
      // noop
    }

    syncDemoConfigState({}, demoName);
  }

  // ── 尺寸 URL 解析 ────────────────────────────────────────────────────────────

  function buildModuleImageUrlPayload(moduleId) {
    const currentImage = getModuleImage(moduleId);
    const rawUrl = String(currentImage?.url || currentImage?.file_url || "").trim();
    if (!rawUrl) return "";
    return rawUrl.startsWith("http") ? rawUrl : getFileFullUrl(rawUrl);
  }

  function resolveSizeImageUrl(sizeInfo = {}, moduleId = "", fallbackUrl = "") {
    const candidates = [fallbackUrl, buildModuleImageUrlPayload(moduleId), sizeInfo?.image_url];

    for (const candidate of candidates) {
      const url = normalizeComparableUrl(candidate);
      if (url) return url;
    }

    return "";
  }

  function resolveDemoSizeModuleId(sizeInfo = {}, fallbackIndex = -1, visibleModuleIds = null) {
    const directModuleId = String(sizeInfo?.module_id || "").trim();
    if (directModuleId && (!visibleModuleIds || visibleModuleIds.has(directModuleId))) {
      return directModuleId;
    }

    const sizeImageUrl = extractSizeImageCandidate(sizeInfo);
    if (sizeImageUrl) {
      const matchedPartByCurrentImage = visibleParts.value.find((part) =>
        isSameImageSource(sizeImageUrl, buildModuleImageUrlPayload(part?.id))
      );
      if (matchedPartByCurrentImage) {
        const matchedId = String(matchedPartByCurrentImage.id || "");
        if (matchedId && (!visibleModuleIds || visibleModuleIds.has(matchedId))) {
          return matchedId;
        }
      }

      const demoImages = Array.isArray(demoConfigState.value?.imgs) ? demoConfigState.value.imgs : [];
      const matchedDemoImageIndex = demoImages.findIndex((item) =>
        isSameImageSource(sizeImageUrl, item?.url || item?.file_url)
      );

      if (matchedDemoImageIndex >= 0) {
        const matchedDemoImage = demoImages[matchedDemoImageIndex];
        const matchedDemoModuleId = String(matchedDemoImage?.module_id || "").trim();
        if (matchedDemoModuleId && (!visibleModuleIds || visibleModuleIds.has(matchedDemoModuleId))) {
          return matchedDemoModuleId;
        }

        const matchedPartByIndex = visibleParts.value[matchedDemoImageIndex];
        const matchedIndexModuleId = String(matchedPartByIndex?.id || "").trim();
        if (matchedIndexModuleId && (!visibleModuleIds || visibleModuleIds.has(matchedIndexModuleId))) {
          return matchedIndexModuleId;
        }
      }
    }

    if (fallbackIndex >= 0) {
      const fallbackPart = visibleParts.value[fallbackIndex];
      const fallbackModuleId = String(fallbackPart?.id || "").trim();
      if (fallbackModuleId && (!visibleModuleIds || visibleModuleIds.has(fallbackModuleId))) {
        return fallbackModuleId;
      }
    }

    return "";
  }

  // ── Demo 配置核心更新函数 ────────────────────────────────────────────────────

  async function updateDemoConfig(mutator, successMessage, fields = ["imgs", "sizes", "blacklist"]) {
    const demoName = currentDemoName();
    if (!demoName) {
      ElMessage.warning("当前站点还没有绑定 Demo，无法同步");
      return { ok: false };
    }

    try {
      const detailRes = await getDemoConfig(demoName);
      const payload = cloneDemoConfigRecord(detailRes?.code === 0 ? detailRes.data : {}, demoName);

      await mutator(payload);

      const savePayload = { demo: demoName };
      fields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(payload, field)) {
          savePayload[field] = payload[field];
        }
      });

      const saveRes = await saveDemoConfig(savePayload);
      if (saveRes?.code === 0) {
        const nextState = saveRes?.data
          ? { ...payload, ...saveRes.data }
          : payload;
        syncDemoConfigState(nextState, demoName);
        ElMessage.success(saveRes.message || successMessage);
        return { ok: true, data: nextState };
      }

      ElMessage.error(saveRes?.message || "同步 Demo 配置失败");
      return { ok: false };
    } catch (error) {
      ElMessage.error(error?.message || "同步 Demo 配置失败");
      return { ok: false };
    }
  }

  // ── Payload 构建函数 ─────────────────────────────────────────────────────────

  function buildPageMaterialsPayload() {
    // 按板块顺序返回数组，保证索引对应关系
    return visibleParts.value.map((part) => {
      const key = String(part.id);
      const m = moduleImages.value[key];
      if (!m?.id || !m?.url) return null;
      const rawUrl = m.url || m.file_url;
      return {
        id: m.id,
        demo: m.demo,
        page: m.page || "",
        url: rawUrl.startsWith("http") ? rawUrl : getFileFullUrl(rawUrl),
      };
    });
  }

  function buildDemoImagePayloadByModuleId(moduleId) {
    const currentImage = getModuleImage(moduleId);
    const rawUrl = String(currentImage?.url || currentImage?.file_url || "").trim();
    if (!moduleId || !rawUrl) return null;

    return {
      module_id: String(moduleId),
      url: rawUrl.startsWith("http") ? rawUrl : getFileFullUrl(rawUrl),
    };
  }

  /** 输出数组结构，供 POST /api/page_config/save_sizes */
  function buildPageSizesPayload() {
    const sizes = sectionSizes.value;
    if (!sizes) return [];

    const result = Object.entries(sizes).reduce((acc, [sizeKey, sizeInfo]) => {
      const { moduleId, imageUrl: keyImageUrl } = parseSizeConfigKey(sizeKey);
      const w = Number(sizeInfo?.width);
      const h = Number(sizeInfo?.height);

      // Only include if there is at least one valid size
      if ((!Number.isNaN(w) && w > 0) || (!Number.isNaN(h) && h > 0)) {
        const out = { module_id: moduleId };
        if (!Number.isNaN(w) && w > 0) {
          out.width = Math.round(w);
        }
        if (!Number.isNaN(h) && h > 0) {
          out.height = Math.round(h);
        }
        const imageUrl = normalizeComparableUrl(keyImageUrl) || resolveSizeImageUrl(sizeInfo, moduleId);
        if (imageUrl) {
          out.image_url = imageUrl;
        }
        acc.push(out);
      }
      return acc;
    }, []);

    return result;
  }

  function buildDemoSizePayloadByNodeId(nodeId, imageUrlOverride = "") {
    const key = buildSizeConfigKey(nodeId, imageUrlOverride);
    if (!key) return null;

    const { value: sizeInfo } = getSizeRecord(sectionSizes.value, nodeId, imageUrlOverride);
    const width = Number(sizeInfo?.width);
    const height = Number(sizeInfo?.height);
    const payload = { module_id: String(nodeId || "").trim() };

    if (!Number.isNaN(width) && width > 0) {
      payload.width = Math.round(width);
    }
    if (!Number.isNaN(height) && height > 0) {
      payload.height = Math.round(height);
    }
    const imageUrl = resolveSizeImageUrl(sizeInfo, key, imageUrlOverride);
    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    return payload.width || payload.height ? payload : null;
  }

  // ── Demo 记录查询 ─────────────────────────────────────────────────────────────

  function findDemoImageRecord(moduleId, partIndex) {
    const targetId = String(moduleId || "");
    const demoImages = Array.isArray(demoConfigState.value?.imgs) ? demoConfigState.value.imgs : [];
    const matchedByModuleId = demoImages.find((item) => String(item?.module_id || "") === targetId);
    if (matchedByModuleId) return matchedByModuleId;
    return partIndex != null ? demoImages[partIndex] || null : null;
  }

  // ── 页面配置加载/保存 ─────────────────────────────────────────────────────────

  function applyPageConfigState(materials = [], sizes = []) {
    sectionSizes.value = {};
    if (Array.isArray(sizes)) {
      for (const s of sizes) {
        if (s && s.module_id) {
          const key = String(s.module_id);
          const imageUrl = resolveSizeImageUrl(s, key);
          const sizeKey = buildSizeConfigKey(key, imageUrl);
          let w = s.width != null ? Number(s.width) : null;
          let h = s.height != null ? Number(s.height) : null;
          if (w != null && Number.isNaN(w)) w = null;
          if (h != null && Number.isNaN(h)) h = null;
          if (w !== null || h !== null) {
            sectionSizes.value[sizeKey] = {
              width: w,
              height: h,
              image_url: imageUrl,
            };
          }
        }
      }
    }

    const nextImages = {};
    visibleParts.value.forEach((part, idx) => {
      const key = String(part.id);
      const found = Array.isArray(materials) ? materials[idx] : null;
      if (!found || !found.url) return;
      nextImages[key] = {
        id: found.id,
        url: found.url,
        demo: found.demo,
        page: found.page,
        file_url: getFileFullUrl(found.url),
      };
    });
    moduleImages.value = nextImages;
  }

  async function refreshPageConfigState(pageIdVal = pageId.value) {
    const site_id = websiteInfo.value?.site_id;
    if (!site_id || !pageIdVal) {
      moduleImages.value = {};
      sectionSizes.value = {};
      return { ok: false };
    }

    try {
      const res = await getPageConfig(site_id, String(pageIdVal));
      if (res?.code === 0) {
        const { materials = [], sizes = [] } = res.data || {};
        applyPageConfigState(materials, sizes);
        return { ok: true, data: res.data || {} };
      }
    } catch {
      // noop
    }

    moduleImages.value = {};
    sectionSizes.value = {};
    return { ok: false };
  }

  // ── Demo 绑定状态查询 ─────────────────────────────────────────────────────────

  function isDemoScreenshotBound(moduleId, partIndex) {
    const currentImage = getModuleImage(moduleId);
    const demoImage = findDemoImageRecord(moduleId, partIndex);
    if (!currentImage || !demoImage) return false;

    const currentUrl = normalizeComparableUrl(currentImage.url || currentImage.file_url);
    const demoUrl = normalizeComparableUrl(demoImage.url || demoImage.file_url);

    return Boolean(currentUrl) && currentUrl === demoUrl;
  }

  function isDemoSizeBound(nodeId, imageUrl = "") {
    const currentSize = buildDemoSizePayloadByNodeId(nodeId, imageUrl);
    if (!currentSize) return false;

    const currentKey = buildSizeConfigKey(nodeId, imageUrl);
    const currentModuleId = String(nodeId || "").trim();
    const hasImageUrl = Boolean(normalizeComparableUrl(imageUrl));
    const matched = normalizeDemoSizeRecords(demoConfigState.value?.sizes).find((item) => {
      const itemModuleId = String(item?.module_id || "").trim();
      const itemImageUrl = normalizeComparableUrl(item?.image_url || item?.url || item?.file_url || item?.imageUrl);
      const itemKey = buildSizeConfigKey(itemModuleId, itemImageUrl);

      if (hasImageUrl) {
        return Boolean(currentKey && itemKey && itemKey === currentKey);
      }

      if (currentKey && itemKey && itemKey === currentKey) return true;
      if (currentKey && itemModuleId === currentModuleId && !itemImageUrl) return true;
      return false;
    });

    if (!matched) return false;

    const currentWidth = currentSize.width ?? null;
    const currentHeight = currentSize.height ?? null;
    const currentImageUrl = resolveSizeImageUrl(currentSize, nodeId, imageUrl);
    const matchedWidth = matched?.width != null ? Number(matched.width) : null;
    const matchedHeight = matched?.height != null ? Number(matched.height) : null;
    const matchedImageUrl = resolveSizeImageUrl(matched, nodeId);

    if (currentImageUrl || matchedImageUrl) {
      return currentWidth === matchedWidth && currentHeight === matchedHeight && currentImageUrl === matchedImageUrl;
    }

    return currentWidth === matchedWidth && currentHeight === matchedHeight;
  }

  // ── 截图移除 ──────────────────────────────────────────────────────────────────

  /** 移除模块截图（含确认弹窗、API 调用、失败回滚） */
  async function removeModuleImage(moduleId) {
    const key = moduleImageKey(moduleId);
    if (!key || !moduleImages.value[key]) return;

    try {
      await ElMessageBox.confirm("确定要移除该板块截图吗？", "移除截图", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        closeOnClickModal: false,
      });
    } catch (error) {
      if (error !== "cancel" && error !== "close") {
        ElMessage.error("移除截图失败：" + (error?.message || ""));
      }
      return;
    }

    const site_id = websiteInfo.value?.site_id;
    const currentPageId = pageId.value;
    if (!site_id || !currentPageId) {
      ElMessage.warning("缺少站点或页面信息");
      return;
    }

    const previousImages = moduleImages.value;
    const nextImages = { ...previousImages };
    delete nextImages[key];
    moduleImages.value = nextImages;
    removingImageKey.value = key;

    try {
      const res = await savePageConfig(site_id, String(currentPageId), buildPageMaterialsPayload());
      if (res?.code === 0) {
        ElMessage.success(res.message || "截图已移除");
      } else {
        moduleImages.value = previousImages;
        ElMessage.error(res?.message || "移除截图失败");
      }
    } catch (error) {
      moduleImages.value = previousImages;
      ElMessage.error("移除截图失败：" + (error?.message || ""));
    } finally {
      removingImageKey.value = null;
    }
  }

  // ── 尺寸保存 ──────────────────────────────────────────────────────────────────

  async function saveSectionSizes() {
    const site_id = websiteInfo.value?.site_id;
    if (!site_id || !pageId.value) {
      ElMessage.warning("缺少站点或页面信息");
      return;
    }
    const loadingInstance = ElLoading.service({
      fullscreen: true,
      text: "正在保存尺寸...",
    });
    try {
      const res = await savePageSizes(site_id, String(pageId.value), buildPageSizesPayload());
      if (res?.code === 0) {
        ElMessage.success(res.message || "尺寸保存成功");
      } else {
        ElMessage.error(res?.message || "尺寸保存失败");
      }
    } catch (e) {
      ElMessage.error("尺寸保存失败：" + (e?.message || ""));
    } finally {
      loadingInstance.close();
    }
  }

  // ── Demo 截图绑定/解绑 ────────────────────────────────────────────────────────

  async function bindDemoScreenshot(moduleId, partIndex) {
    const imageKey = moduleImageKey(moduleId);
    const imagePayload = buildDemoImagePayloadByModuleId(moduleId);
    if (!imageKey) {
      return;
    }
    if (!imagePayload) {
      ElMessage.warning("当前板块还没有可绑定的截图");
      return;
    }

    bindingDemoImageKey.value = imageKey;
    try {
      await updateDemoConfig((payload) => {
        payload.imgs = replaceDemoImageRecordByModuleId(payload.imgs, imagePayload, partIndex);
      }, "当前板块截图已绑定到 Demo", ["imgs"]);
    } finally {
      bindingDemoImageKey.value = "";
    }
  }

  async function toggleDemoScreenshot(moduleId, partIndex) {
    if (!isDemoScreenshotBound(moduleId, partIndex)) {
      return await bindDemoScreenshot(moduleId, partIndex);
    }

    const imageKey = moduleImageKey(moduleId);
    if (!imageKey) {
      return { ok: false };
    }

    bindingDemoImageKey.value = imageKey;
    try {
      return await updateDemoConfig((payload) => {
        payload.imgs = removeDemoImageRecordByModuleId(payload.imgs, moduleId, partIndex);
      }, "已取消 Demo 截图绑定", ["imgs"]);
    } finally {
      bindingDemoImageKey.value = "";
    }
  }

  async function bindAllDemoScreenshots() {
    const site_id = websiteInfo.value?.site_id;
    if (!site_id || !pageId.value) {
      ElMessage.warning("缺少站点或页面信息");
      return { ok: false };
    }

    let materials = [];

    try {
      const res = await getPageConfig(site_id, String(pageId.value));
      materials = Array.isArray(res?.data?.materials) ? res.data.materials : [];
    } catch (error) {
      ElMessage.error(error?.message || "获取页面截图配置失败");
      return { ok: false };
    }

    const normalizedMaterials = materials.map((item) => {
      if (!item?.url) return null;
      return {
        ...item,
        url: String(item.url || "").startsWith("http") ? item.url : getFileFullUrl(item.url),
      };
    });

    const count = normalizedMaterials.filter(Boolean).length;
    if (count === 0) {
      ElMessage.warning("当前页面还没有已保存的截图配置");
      return { ok: false };
    }

    return await updateDemoConfig((payload) => {
      payload.imgs = normalizedMaterials
        .map((item, index) => {
          const part = visibleParts.value[index];
          if (!item?.url || !part?.id) return null;
          return {
            module_id: String(part.id),
            url: item.url,
          };
        })
        .filter(Boolean);
    }, `已同步 ${count} 张截图到 Demo`, ["imgs"]);
  }

  // ── Demo 尺寸绑定/解绑 ────────────────────────────────────────────────────────

  async function bindDemoSizeByNodeId(nodeId, imageUrl = "") {
    const sizePayload = buildDemoSizePayloadByNodeId(nodeId, imageUrl);
    if (!sizePayload) {
      ElMessage.warning("请先填写建议尺寸后再绑定 Demo");
      return { ok: false };
    }

    bindingDemoSizeKey.value = buildSizeConfigKey(nodeId, imageUrl);
    try {
      return await updateDemoConfig((payload) => {
        payload.sizes = replaceSizeRecordByKey(payload.sizes, sizePayload);
        const currentKey = buildSizeConfigKey(nodeId, imageUrl);
        const legacyKey = String(nodeId || "").trim();
        const currentSize = sectionSizes.value?.[currentKey] || sectionSizes.value?.[legacyKey];
        if (currentKey) {
          sectionSizes.value[currentKey] = {
            ...(currentSize || {}),
            image_url: sizePayload.image_url || "",
          };
          if (legacyKey && legacyKey !== currentKey && sectionSizes.value?.[legacyKey] && !currentSize) {
            sectionSizes.value[legacyKey] = {
              ...sectionSizes.value[legacyKey],
              image_url: sizePayload.image_url || "",
            };
          }
        }
      }, "当前建议尺寸已绑定到 Demo", ["sizes"]);
    } finally {
      bindingDemoSizeKey.value = "";
    }
  }

  async function toggleDemoSizeByNodeId(nodeId, imageUrl = "") {
    if (!isDemoSizeBound(nodeId, imageUrl)) {
      return await bindDemoSizeByNodeId(nodeId, imageUrl);
    }

    bindingDemoSizeKey.value = buildSizeConfigKey(nodeId, imageUrl);
    try {
      return await updateDemoConfig((payload) => {
        payload.sizes = removeSizeRecordByKey(payload.sizes, nodeId, imageUrl);
      }, "已取消 Demo 尺寸绑定", ["sizes"]);
    } finally {
      bindingDemoSizeKey.value = "";
    }
  }

  async function bindAllDemoSizes() {
    const sizes = buildPageSizesPayload();
    if (sizes.length === 0) {
      ElMessage.warning("当前页面还没有可同步的图片尺寸");
      return { ok: false };
    }

    return await updateDemoConfig((payload) => {
      payload.sizes = sizes;
    }, `已同步 ${sizes.length} 条图片尺寸到 Demo`, ["sizes"]);
  }

  // ── 应用 Demo 配置到当前页面 ──────────────────────────────────────────────────

  async function applyDemoScreenshots(demoImages = []) {
    const site_id = websiteInfo.value?.site_id;
    if (!site_id || !pageId.value) {
      ElMessage.warning("缺少站点或页面信息");
      return { ok: false };
    }

    const imageList = Array.isArray(demoImages) ? demoImages : [];
    const normalizedMaterials = visibleParts.value.map((part) => {
      const item = imageList.find((entry) => String(entry?.module_id || "") === String(part?.id || ""));
      const rawUrl = String(item?.url || item?.file_url || "").trim();
      if (!rawUrl) return null;

      const fullUrl = rawUrl.startsWith("http") ? rawUrl : getFileFullUrl(rawUrl);
      return {
        id: item?.id,
        demo: item?.demo || currentDemoName(),
        page: item?.page || "",
        url: fullUrl,
        file_url: fullUrl,
        moduleId: String(part.id),
      };
    });

    const count = normalizedMaterials.filter(Boolean).length;
    if (count === 0) {
      ElMessage.warning("当前 Demo 没有可用截图");
      return { ok: false };
    }

    try {
      const payload = normalizedMaterials.map((item) => {
        if (!item) return null;
        return {
          id: item.id,
          demo: item.demo,
          page: item.page,
          url: item.url,
        };
      });

      const res = await savePageConfig(site_id, String(pageId.value), payload);
      if (res?.code === 0) {
        const nextImages = {};
        normalizedMaterials.forEach((item) => {
          if (!item?.moduleId) return;
          nextImages[String(item.moduleId)] = {
            id: item.id,
            demo: item.demo,
            page: item.page,
            url: item.url,
            file_url: item.file_url,
          };
        });
        moduleImages.value = nextImages;
        ElMessage.success(res.message || `已获取 ${count} 张 Demo 截图`);
        return { ok: true };
      }

      ElMessage.error(res?.message || "获取 Demo 截图失败");
      return { ok: false };
    } catch (error) {
      ElMessage.error(error?.message || "获取 Demo 截图失败");
      return { ok: false };
    }
  }

  async function applyDemoSizes(demoSizes = []) {
    if (!pageId.value) {
      ElMessage.warning("缺少页面信息");
      return { ok: false };
    }

    const visibleModuleIds = new Set(
      visibleParts.value
        .map((part) => String(part?.id || ""))
        .filter(Boolean)
    );

    const currentSizes = { ...sectionSizes.value };
    const nextSizes = Object.entries(currentSizes).reduce((acc, [moduleId, value]) => {
      const { moduleId: plainModuleId, imageUrl } = parseSizeConfigKey(moduleId);
      if (!visibleModuleIds.has(String(plainModuleId || ""))) {
        acc[moduleId] = value;
      }
      return acc;
    }, {});

    const normalizedDemoSizes = normalizeDemoSizeRecords(demoSizes);

    for (const [index, item] of normalizedDemoSizes.entries()) {
      const moduleId = resolveDemoSizeModuleId(item, index, visibleModuleIds);
      if (!moduleId) continue;
      const imageUrl = resolveSizeImageUrl(item, moduleId);
      const sizeKey = buildSizeConfigKey(moduleId, imageUrl);

      const width = item?.width != null ? Number(item.width) : null;
      const height = item?.height != null ? Number(item.height) : null;
      const hasWidth = Number.isFinite(width) && width > 0;
      const hasHeight = Number.isFinite(height) && height > 0;
      if (!hasWidth && !hasHeight) continue;

      nextSizes[sizeKey] = {
        width: hasWidth ? Math.round(width) : null,
        height: hasHeight ? Math.round(height) : null,
        image_url: imageUrl,
      };
    }

    const payload = Object.entries(nextSizes).reduce((acc, [moduleId, size]) => {
      const width = size?.width != null ? Number(size.width) : null;
      const height = size?.height != null ? Number(size.height) : null;
      const hasWidth = Number.isFinite(width) && width > 0;
      const hasHeight = Number.isFinite(height) && height > 0;

      if (!hasWidth && !hasHeight) return acc;

      const { moduleId: plainModuleId, imageUrl: keyImageUrl } = parseSizeConfigKey(moduleId);
      const record = { module_id: plainModuleId };
      if (hasWidth) {
        record.width = Math.round(width);
      }
      if (hasHeight) {
        record.height = Math.round(height);
      }
      const imageUrl = resolveSizeImageUrl(size, plainModuleId);
      if (imageUrl) {
        record.image_url = imageUrl;
      }
      acc.push(record);
      return acc;
    }, []);

    if (payload.length === 0) {
      ElMessage.warning("当前 Demo 没有可用图片尺寸");
      return { ok: false };
    }

    sectionSizes.value = nextSizes;
    ElMessage.success(`已获取 ${payload.length} 条 Demo 图片尺寸`);
    return { ok: true };
  }

  // ── 返回 ──────────────────────────────────────────────────────────────────────

  return {
    // 状态
    demoConfigState,
    bindingDemoImageKey,
    bindingDemoSizeKey,
    sectionSizes,
    removingImageKey,
    // 基础函数
    currentDemoName,
    cloneDemoConfigRecord,
    syncDemoConfigState,
    fetchDemoConfigState,
    // 尺寸 URL 解析
    buildModuleImageUrlPayload,
    resolveSizeImageUrl,
    resolveDemoSizeModuleId,
    // 核心更新
    updateDemoConfig,
    // Payload 构建
    buildPageMaterialsPayload,
    buildDemoImagePayloadByModuleId,
    buildPageSizesPayload,
    buildDemoSizePayloadByNodeId,
    // Demo 记录查询
    findDemoImageRecord,
    // 页面配置
    applyPageConfigState,
    refreshPageConfigState,
    // Demo 绑定状态
    isDemoScreenshotBound,
    isDemoSizeBound,
    // 尺寸保存
    saveSectionSizes,
    // 截图移除
    removeModuleImage,
    // Demo 截图绑定
    bindDemoScreenshot,
    toggleDemoScreenshot,
    bindAllDemoScreenshots,
    // Demo 尺寸绑定
    bindDemoSizeByNodeId,
    toggleDemoSizeByNodeId,
    bindAllDemoSizes,
    // 应用 Demo 配置
    applyDemoScreenshots,
    applyDemoSizes,
  };
}
