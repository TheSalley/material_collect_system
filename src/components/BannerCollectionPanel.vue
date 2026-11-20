<template>
  <div class="banner-shell" v-loading="loading">
    <section class="banner-hero">
      <div class="banner-hero__copy">
        <span class="banner-eyebrow">
          <el-icon><PictureFilled /></el-icon>
          BANNER COLLECTION
        </span>
        <h2>先给图，再给一句话</h2>
        <p>主视觉、标题、按钮文案。一起收齐，少猜一点。</p>
        <div class="banner-hero__meta">
          <span>{{ banners.length }} / {{ MAX_BANNERS }} 张</span>
          <span>建议 1920 × 800</span>
          <span>JPG / PNG / WebP</span>
        </div>
      </div>

      <div class="banner-counter">
        <strong>{{ String(banners.length).padStart(2, "0") }}</strong>
        <span>已收集 Banner</span>
      </div>
    </section>

    <el-alert
      v-if="!siteId"
      type="warning"
      show-icon
      :closable="false"
      title="还没有绑定站点"
      description="请先选择一个站点，再上传 Banner。"
    />

    <div v-else class="banner-grid">
      <main class="banner-main">
        <div v-if="banners.length" class="banner-list">
          <article
            v-for="(banner, index) in banners"
            :key="banner._key"
            class="banner-card"
          >
            <header class="banner-card__head">
              <span class="banner-number">{{
                String(index + 1).padStart(2, "0")
              }}</span>
              <div class="banner-card__title">
                <h3>{{ banner.title?.trim() || `Banner ${index + 1}` }}</h3>
                <p>{{ banner.image_url ? "图片已就位" : "还缺一张主视觉" }}</p>
              </div>
              <div v-if="!readonly" class="banner-card__tools">
                <el-button
                  text
                  circle
                  :icon="ArrowUp"
                  :disabled="index === 0"
                  aria-label="上移"
                  @click="moveBanner(index, -1)"
                />
                <el-button
                  text
                  circle
                  :icon="ArrowDown"
                  :disabled="index === banners.length - 1"
                  aria-label="下移"
                  @click="moveBanner(index, 1)"
                />
                <el-button
                  text
                  circle
                  type="danger"
                  :icon="Delete"
                  aria-label="删除"
                  @click="removeBanner(index)"
                />
              </div>
            </header>

            <div class="banner-card__body">
              <div
                class="banner-media"
                :class="{ 'banner-media--empty': !banner.image_url }"
              >
                <el-image
                  v-if="banner.image_url"
                  :src="banner.image_url"
                  :preview-src-list="[banner.image_url]"
                  :initial-index="0"
                  fit="cover"
                  class="banner-media__image"
                  preview-teleported
                />
                <div v-else class="banner-media__placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>建议横图，人物别贴边</span>
                </div>

                <div v-if="!readonly" class="banner-media__actions">
                  <el-upload
                    action="#"
                    :show-file-list="false"
                    accept="image/jpeg,image/png,image/webp"
                    :before-upload="(file) => handleUpload(file, banner)"
                  >
                    <el-button
                      type="primary"
                      size="small"
                      :icon="Upload"
                      :loading="banner._uploading"
                    >
                      {{ banner.image_url ? "更换图片" : "上传图片" }}
                    </el-button>
                  </el-upload>
                </div>

                <div v-if="banner._uploading" class="banner-media__loading">
                  <span class="banner-spinner"></span>
                  <span>正在上传</span>
                </div>
              </div>

              <div class="banner-fields">
                <div class="banner-field banner-field--title">
                  <label>主标题</label>
                  <el-input
                    v-model="banner.title"
                    maxlength="80"
                    :disabled="readonly"
                    placeholder="一句话说清重点"
                  />
                </div>

                <div class="banner-field banner-field--button">
                  <label>按钮文字</label>
                  <el-input
                    v-model="banner.button_text"
                    maxlength="24"
                    :disabled="readonly"
                    placeholder="例如：查看产品"
                  />
                </div>

                <div class="banner-field banner-field--desc">
                  <label>副标题 / 说明</label>
                  <el-input
                    v-model="banner.description"
                    type="textarea"
                    :rows="2"
                    maxlength="180"
                    show-word-limit
                    :disabled="readonly"
                    placeholder="补充一句，不要写太长"
                  />
                </div>

                <div class="banner-field banner-field--link">
                  <label>按钮链接</label>
                  <el-input
                    v-model="banner.link_url"
                    maxlength="300"
                    :disabled="readonly"
                    placeholder="/products 或 https://…"
                  >
                    <template #prefix
                      ><el-icon><Link /></el-icon
                    ></template>
                  </el-input>
                </div>
              </div>
            </div>
          </article>
        </div>

        <section v-else class="banner-empty">
          <div class="banner-empty__art" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <h3>{{ readonly ? "客户还没有提交 Banner" : "还没有 Banner" }}</h3>
          <p>
            {{
              readonly
                ? "客户还没上传。这里会显示完整内容。"
                : "先放一张主视觉。尺寸大一点更稳。"
            }}
          </p>
          <el-button
            v-if="!readonly"
            type="primary"
            :icon="Plus"
            @click="addBanner"
          >
            添加第一张
          </el-button>
        </section>

        <button
          v-if="!readonly && banners.length && banners.length < MAX_BANNERS"
          type="button"
          class="banner-add"
          @click="addBanner"
        >
          <el-icon><Plus /></el-icon>
          <span>再加一张</span>
          <small>还可以加 {{ MAX_BANNERS - banners.length }} 张</small>
        </button>

        <el-alert
          v-if="errorMsg"
          :title="errorMsg"
          type="error"
          show-icon
          :closable="false"
        />
      </main>

      <aside class="banner-side">
        <section class="banner-status" :class="`banner-status--${statusTone}`">
          <div class="banner-status__top">
            <span class="banner-status__dot"></span>
            <span>{{ saveStateLabel }}</span>
          </div>
          <p>{{ statusHint }}</p>
          <small>{{ lastSavedLabel }}</small>

          <div v-if="!readonly" class="banner-status__actions">
            <el-button
              type="primary"
              :loading="saving"
              :disabled="loading || !isDirty || hasUploading"
              @click="saveAll"
            >
              保存 Banner
            </el-button>
            <el-button
              text
              :disabled="!isDirty || saving"
              @click="reloadBanners"
            >
              撤销修改
            </el-button>
          </div>
        </section>

        <section class="banner-guide">
          <h3>上传小抄</h3>
          <ul>
            <li>
              <el-icon><Picture /></el-icon>
              <div>
                <strong>横图优先</strong>
                <span>1920 × 800 左右最稳。</span>
              </div>
            </li>
            <li>
              <el-icon><Compass /></el-icon>
              <div>
                <strong>主体留白</strong>
                <span>左右留点空间，方便裁切。</span>
              </div>
            </li>
            <li>
              <el-icon><WarningFilled /></el-icon>
              <div>
                <strong>别塞小字</strong>
                <span>手机上看不清，会直接糊。</span>
              </div>
            </li>
          </ul>
        </section>

        <section class="banner-file-tip">
          <div class="banner-file-tip__head">
            <el-icon><InfoFilled /></el-icon>
            <span>文件要求</span>
          </div>
          <p>单张不超过 12MB。支持 JPG、PNG、WebP。</p>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowDown,
  ArrowUp,
  Compass,
  Delete,
  InfoFilled,
  Link,
  Picture,
  PictureFilled,
  Plus,
  Upload,
  WarningFilled,
} from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global.js";
import { getFileFullUrl } from "@/apis/file";
import { uploadImage } from "@/apis/proxy";
import { loadBannerCollection, saveBannerCollection } from "@/apis/collection";

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
});

const MAX_BANNERS = 8;
const MAX_FILE_MB = 12;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const { websiteInfo } = storeToRefs(useGlobalStore());
const siteId = computed(() => websiteInfo.value?.site_id);

const banners = ref([]);
const loading = ref(false);
const saving = ref(false);
const errorMsg = ref("");
const savedSnapshot = ref("");
const lastSavedAt = ref("");
const hasSavedRecord = ref(false);

function makeKey() {
  return `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeBanner(banner = {}, index = 0) {
  const rawImageUrl = String(
    banner.image_url || banner.url || banner.file_url || "",
  );
  return {
    _key: banner._key || banner.client_id || makeKey(),
    _uploading: false,
    image_url: rawImageUrl ? getFileFullUrl(rawImageUrl) : "",
    attachment_id:
      banner.attachment_id ?? banner.attachmentId ?? banner.id ?? null,
    title: String(banner.title || ""),
    description: String(banner.description || banner.subtitle || ""),
    button_text: String(banner.button_text || banner.buttonText || ""),
    link_url: String(banner.link_url || banner.link || ""),
    sort_order: Number.isFinite(Number(banner.sort_order))
      ? Number(banner.sort_order)
      : index,
  };
}

function snapshotBanners() {
  return JSON.stringify(
    banners.value.map((banner) => ({
      image_url: banner.image_url,
      attachment_id: banner.attachment_id,
      title: banner.title.trim(),
      description: banner.description.trim(),
      button_text: banner.button_text.trim(),
      link_url: banner.link_url.trim(),
    })),
  );
}

const isDirty = computed(() => snapshotBanners() !== savedSnapshot.value);
const hasUploading = computed(() =>
  banners.value.some((banner) => banner._uploading),
);

const statusTone = computed(() => {
  if (loading.value) return "neutral";
  if (saving.value || hasUploading.value) return "busy";
  if (props.readonly) return "readonly";
  if (isDirty.value) return "warning";
  if (hasSavedRecord.value) return "success";
  return "neutral";
});

const saveStateLabel = computed(() => {
  if (loading.value) return "正在读取";
  if (hasUploading.value) return "图片上传中";
  if (saving.value) return "正在保存";
  if (props.readonly) return "只读查看";
  if (isDirty.value) return "有未保存修改";
  if (hasSavedRecord.value) return "Banner 已同步";
  return "等待上传";
});

const statusHint = computed(() => {
  if (loading.value) return "稍等一下，列表马上出来。";
  if (hasUploading.value) return "图片还在路上，别急着保存。";
  if (saving.value) return "保存中，很快就好。";
  if (props.readonly) return "这是客户提交的原始内容。";
  if (isDirty.value) return "改完记得点保存。";
  if (hasSavedRecord.value) return "服务端已有最新版本。";
  return "先加一张，文案可以慢慢补。";
});

const lastSavedLabel = computed(() => {
  if (lastSavedAt.value) return `最近保存：${lastSavedAt.value}`;
  return "还没有保存记录";
});

function formatSavedAt(value = "") {
  if (!value) {
    return new Date().toLocaleString("zh-CN", { hour12: false });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", { hour12: false });
}

function createEmptyBanner() {
  return normalizeBanner({}, banners.value.length);
}

function resetCollectionState() {
  banners.value = [];
  savedSnapshot.value = snapshotBanners();
  lastSavedAt.value = "";
  errorMsg.value = "";
  hasSavedRecord.value = false;
}

async function loadBanners() {
  if (!siteId.value) {
    resetCollectionState();
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await loadBannerCollection(siteId.value);
    if (!res.ok) {
      errorMsg.value = res.message || "Banner 列表读取失败";
      return;
    }
    banners.value = (Array.isArray(res.data) ? res.data : [])
      .map((banner, index) => normalizeBanner(banner, index))
      .sort((a, b) => a.sort_order - b.sort_order);
    savedSnapshot.value = snapshotBanners();
    lastSavedAt.value = res.updatedAt ? formatSavedAt(res.updatedAt) : "";
    hasSavedRecord.value = banners.value.length > 0;
  } catch (error) {
    errorMsg.value = error?.message || "Banner 列表读取失败";
  } finally {
    loading.value = false;
  }
}

async function reloadBanners() {
  if (isDirty.value) {
    try {
      await ElMessageBox.confirm("撤销后，未保存的改动会消失。", "确定撤销？", {
        confirmButtonText: "撤销",
        cancelButtonText: "继续编辑",
        type: "warning",
      });
    } catch {
      return;
    }
  }
  await loadBanners();
}

function addBanner() {
  if (banners.value.length >= MAX_BANNERS) {
    ElMessage.warning(`最多只能收集 ${MAX_BANNERS} 张 Banner`);
    return;
  }
  banners.value.push(createEmptyBanner());
}

function removeBanner(index) {
  banners.value.splice(index, 1);
}

function moveBanner(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= banners.value.length) return;
  const [item] = banners.value.splice(index, 1);
  banners.value.splice(target, 0, item);
}

function extractUploadedImage(res) {
  if (!res || res.code !== 0) return null;
  const row = Array.isArray(res.data) ? res.data[0] : res.data;
  if (!row || typeof row !== "object") return null;

  if (row.success && row.data) {
    const url = row.data.url || row.data.file_url || "";
    if (!url) return null;
    return {
      url: getFileFullUrl(url),
      attachmentId: row.data.attachment_id ?? row.data.id ?? null,
    };
  }

  const url = row.url || row.file_url || row.data?.url || "";
  if (!url) return null;
  return {
    url: getFileFullUrl(url),
    attachmentId:
      row.attachment_id ?? row.id ?? row.data?.attachment_id ?? null,
  };
}

function handleUpload(file, banner) {
  if (props.readonly) return false;
  if (!ALLOWED_TYPES.includes(file.type)) {
    ElMessage.error("仅支持 JPG、PNG、WebP");
    return false;
  }
  if (file.size / 1024 / 1024 > MAX_FILE_MB) {
    ElMessage.error(`单张图片不能超过 ${MAX_FILE_MB}MB`);
    return false;
  }

  const upload = async () => {
    banner._uploading = true;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("site_id", siteId.value);

      const res = await uploadImage(formData);
      const image = extractUploadedImage(res);
      if (!image) {
        const row = Array.isArray(res?.data) ? res.data[0] : res?.data;
        ElMessage.error(row?.message || res?.message || "图片上传失败");
        return;
      }

      banner.image_url = image.url;
      banner.attachment_id = image.attachmentId;
      ElMessage.success("图片已上传");
    } catch (error) {
      ElMessage.error(error?.message || "图片上传失败");
    } finally {
      banner._uploading = false;
    }
  };

  upload();
  return false;
}

async function saveAll() {
  if (props.readonly || !siteId.value) return;
  if (hasUploading.value) {
    ElMessage.warning("图片还在上传，请稍等一下");
    return;
  }
  if (!banners.value.length && !hasSavedRecord.value) {
    ElMessage.warning("至少先加一张 Banner");
    return;
  }

  const missingImageIndex = banners.value.findIndex(
    (banner) => !banner.image_url,
  );
  if (missingImageIndex !== -1) {
    ElMessage.warning(`第 ${missingImageIndex + 1} 张还没有图片`);
    return;
  }

  saving.value = true;
  errorMsg.value = "";
  try {
    const payload = banners.value.map((banner, index) => ({
      image_url: banner.image_url,
      attachment_id: banner.attachment_id,
      title: banner.title.trim(),
      description: banner.description.trim(),
      button_text: banner.button_text.trim(),
      link_url: banner.link_url.trim(),
      sort_order: index,
    }));

    const res = await saveBannerCollection(siteId.value, payload);
    if (res?.code === 0) {
      banners.value = payload.map((banner, index) =>
        normalizeBanner(banner, index),
      );
      savedSnapshot.value = snapshotBanners();
      lastSavedAt.value = formatSavedAt();
      hasSavedRecord.value = payload.length > 0;
      ElMessage.success("Banner 已保存");
    } else {
      ElMessage.error(res?.message || "保存失败");
    }
  } catch (error) {
    ElMessage.error(error?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}

watch(
  siteId,
  (newId, oldId) => {
    if (newId !== oldId) resetCollectionState();
    loadBanners();
  },
  { immediate: true },
);
</script>

<style scoped>
.banner-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  padding: 2px;
}

.banner-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 24px;
  align-items: end;
  overflow: hidden;
  padding: 28px 30px;
  border: 1px solid rgba(12, 32, 53, 0.14);
  border-radius: 20px;
  background:
    radial-gradient(circle at 93% 7%, rgba(94, 176, 255, 0.3), transparent 30%),
    linear-gradient(118deg, #0f2136 0%, #17324e 58%, #1e4269 100%);
  box-shadow: 0 18px 42px rgba(14, 32, 52, 0.2);
}

.banner-hero::before {
  content: "";
  position: absolute;
  right: -40px;
  bottom: -85px;
  width: 290px;
  height: 290px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  box-shadow:
    0 0 0 34px rgba(255, 255, 255, 0.025),
    0 0 0 68px rgba(255, 255, 255, 0.018);
}

.banner-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.09'/%3E%3C/svg%3E");
}

.banner-hero__copy,
.banner-counter {
  position: relative;
  z-index: 1;
}

.banner-eyebrow {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  margin-bottom: 13px;
  color: #8ecaff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.banner-hero h2 {
  margin: 0;
  color: #fff;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.banner-hero p {
  max-width: 520px;
  margin: 12px 0 0;
  color: rgba(226, 240, 255, 0.72);
  font-size: 15px;
  line-height: 1.7;
}

.banner-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.banner-hero__meta span {
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(233, 244, 255, 0.8);
  font-size: 12px;
}

.banner-counter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12px 4px;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}

.banner-counter strong {
  color: #fff;
  font-size: 54px;
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 0.95;
}

.banner-counter span {
  margin-top: 7px;
  font-size: 11px;
  letter-spacing: 0.08em;
}

.banner-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 285px;
  gap: 20px;
  align-items: start;
}

.banner-main,
.banner-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.banner-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(25, 58, 96, 0.05);
}

.banner-card__head {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 15px 18px;
  border-bottom: 1px solid #edf1f5;
  background: linear-gradient(180deg, #ffffff, #fafcff);
}

.banner-number {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 10px;
  background: #e9f2ff;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
}

.banner-card__title {
  flex: 1;
  min-width: 0;
}

.banner-card__title h3 {
  overflow: hidden;
  margin: 0 0 2px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-card__title p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 11px;
}

.banner-card__tools {
  display: flex;
  align-items: center;
  gap: 2px;
}

.banner-card__tools :deep(.el-button) {
  margin-left: 0;
}

.banner-card__body {
  display: grid;
  grid-template-columns: minmax(240px, 0.86fr) minmax(0, 1.14fr);
  gap: 18px;
  padding: 18px;
}

.banner-media {
  position: relative;
  min-height: 180px;
  overflow: hidden;
  border-radius: 13px;
  background: #f2f6fb;
}

.banner-media--empty {
  border: 1px dashed #c7d4e4;
  background:
    linear-gradient(135deg, rgba(43, 124, 238, 0.04), transparent 50%), #f8fafd;
}

.banner-media__image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 180px;
}

.banner-media__placeholder {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #94a4b7;
  text-align: center;
}

.banner-media__placeholder .el-icon {
  font-size: 28px;
}

.banner-media__placeholder span {
  font-size: 11px;
}

.banner-media__actions {
  position: absolute;
  right: 8px;
  bottom: 8px;
}

.banner-media__actions :deep(.el-button) {
  border-radius: 999px;
}

.banner-media__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: rgba(14, 32, 52, 0.66);
  color: #fff;
  font-size: 12px;
  backdrop-filter: blur(3px);
}

.banner-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: banner-spin 700ms linear infinite;
}

@keyframes banner-spin {
  to {
    transform: rotate(360deg);
  }
}

.banner-fields {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px 14px;
  align-content: start;
}

.banner-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.banner-field--title {
  grid-column: span 7;
}
.banner-field--button {
  grid-column: span 5;
}
.banner-field--desc {
  grid-column: span 12;
}
.banner-field--link {
  grid-column: span 12;
}

.banner-field label {
  color: #4a5e75;
  font-size: 11px;
  font-weight: 650;
}

.banner-fields :deep(.el-input__wrapper),
.banner-fields :deep(.el-textarea__inner) {
  border-radius: 10px;
  background: #fbfcfe;
  box-shadow: 0 0 0 1px #dfe6ef inset;
}

.banner-fields :deep(.el-input__wrapper.is-focus),
.banner-fields :deep(.el-textarea__inner:focus) {
  background: #fff;
  box-shadow:
    0 0 0 1px var(--color-primary) inset,
    0 0 0 3px rgba(43, 124, 238, 0.08);
}

.banner-empty {
  display: flex;
  min-height: 390px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 42px 24px;
  border: 1px dashed #c9d6e5;
  border-radius: 20px;
  background:
    radial-gradient(
      circle at 32% 22%,
      rgba(43, 124, 238, 0.075),
      transparent 28%
    ),
    linear-gradient(145deg, #ffffff, #f8fbff);
  text-align: center;
}

.banner-empty__art {
  position: relative;
  width: 122px;
  height: 82px;
  margin-bottom: 24px;
}

.banner-empty__art span {
  position: absolute;
  inset: 0;
  border: 1px solid #bfd2e9;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.74);
}

.banner-empty__art span:nth-child(1) {
  transform: translate(-14px, 12px) rotate(-6deg);
  opacity: 0.45;
}
.banner-empty__art span:nth-child(2) {
  transform: translate(10px, 5px) rotate(4deg);
  opacity: 0.7;
}
.banner-empty__art span:nth-child(3) {
  border-color: #8dbcf2;
  background:
    linear-gradient(135deg, rgba(43, 124, 238, 0.14), rgba(43, 124, 238, 0.02)),
    #fff;
}

.banner-empty h3 {
  margin: 0;
  color: #18334f;
  font-size: 20px;
  font-weight: 750;
}

.banner-empty p {
  margin: 8px 0 20px;
  color: #7d8fa3;
  font-size: 13px;
}

.banner-add {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 16px 18px;
  border: 1px dashed #b9cbe0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.65);
  color: #36536f;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
    background 180ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.banner-add:hover {
  border-color: var(--color-primary);
  background: #f5faff;
  transform: translateY(-1px);
}

.banner-add .el-icon {
  color: var(--color-primary);
  font-size: 18px;
}

.banner-add span {
  font-size: 13px;
  font-weight: 650;
}

.banner-add small {
  color: #91a1b3;
  font-size: 11px;
}

.banner-side {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.banner-status,
.banner-guide,
.banner-file-tip {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(25, 58, 96, 0.045);
}

.banner-status {
  padding: 18px;
}

.banner-status__top {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #35495f;
  font-size: 14px;
  font-weight: 700;
}

.banner-status__dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #9aa8b8;
  box-shadow: 0 0 0 4px rgba(154, 168, 184, 0.14);
}

.banner-status--success .banner-status__dot {
  background: var(--color-success);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.14);
}

.banner-status--warning .banner-status__dot {
  background: var(--color-warning);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.14);
}

.banner-status--busy .banner-status__dot {
  background: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(43, 124, 238, 0.14);
}

.banner-status p {
  margin: 12px 0 6px;
  color: #51677e;
  font-size: 13px;
  line-height: 1.6;
}

.banner-status small {
  color: var(--color-text-muted);
  font-size: 11px;
}

.banner-status__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin-top: 18px;
}

.banner-status__actions :deep(.el-button) {
  width: 100%;
  margin-left: 0;
  border-radius: 10px;
}

.banner-guide {
  padding: 18px;
}

.banner-guide h3 {
  margin: 0 0 14px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.banner-guide ul {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.banner-guide li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.banner-guide li > .el-icon {
  margin-top: 2px;
  color: var(--color-primary);
}

.banner-guide li div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.banner-guide strong {
  color: #35495f;
  font-size: 12px;
  font-weight: 650;
}

.banner-guide span {
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.banner-file-tip {
  padding: 14px 16px;
  border-style: dashed;
  background: #fbfcfe;
}

.banner-file-tip__head {
  display: flex;
  gap: 7px;
  align-items: center;
  color: #647a91;
  font-size: 11px;
  font-weight: 700;
}

.banner-file-tip p {
  margin: 8px 0 0;
  color: #8494a6;
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .banner-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .banner-side {
    position: static;
  }
}

@media (max-width: 900px) {
  .banner-card__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .banner-media__image {
    max-height: 280px;
  }
}

@media (max-width: 720px) {
  .banner-hero {
    grid-template-columns: 1fr;
    align-items: start;
    padding: 22px;
  }

  .banner-counter {
    align-items: flex-start;
    text-align: left;
  }

  .banner-counter strong {
    font-size: 40px;
  }

  .banner-field--title,
  .banner-field--button {
    grid-column: span 12;
  }

  .banner-add {
    grid-template-columns: auto 1fr;
  }

  .banner-add small {
    grid-column: 2;
  }
}
</style>
