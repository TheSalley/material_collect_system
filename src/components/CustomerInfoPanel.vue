<template>
  <div class="profile-shell" v-loading="loading">
    <section class="profile-hero">
      <div class="profile-hero__copy">
        <span class="profile-eyebrow">
          <el-icon><Postcard /></el-icon>
          CUSTOMER PROFILE
        </span>
        <h2>先交个底，再开工</h2>
        <p>品牌、联系人、联系方式。一次说清，少问几轮。</p>
        <div class="profile-hero__meta">
          <span>{{ siteName }}</span>
          <span v-if="readonly">管理员只读视图</span>
          <span v-else>客户本人填写</span>
        </div>
      </div>

      <div class="completion-card">
        <div class="completion-card__top">
          <span>资料完整度</span>
          <strong>{{ completion }}%</strong>
        </div>
        <div class="completion-card__track">
          <span :style="{ width: `${completion}%` }"></span>
        </div>
        <p>{{ filledCount }} / {{ TOTAL_FIELDS }} 项已填写</p>
      </div>
    </section>

    <el-alert
      v-if="!siteId"
      type="warning"
      show-icon
      :closable="false"
      title="还没有绑定站点"
      description="请先选择一个站点，再填写客户资料。"
    />

    <div v-else class="profile-grid">
      <div class="profile-main">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          :disabled="readonly"
          label-position="top"
          class="profile-form"
        >
          <section class="profile-card">
            <header class="profile-card__head">
              <span class="profile-index">01</span>
              <div>
                <h3>品牌与公司</h3>
                <p>我们怎么称呼你，你做什么生意。</p>
              </div>
            </header>

            <div class="field-grid field-grid--brand">
              <el-form-item
                label="公司 / 品牌名称"
                prop="company_name"
                class="field-span-7"
              >
                <el-input
                  v-model="form.company_name"
                  maxlength="80"
                  placeholder="例如：North Peak Outdoor"
                  clearable
                >
                  <template #prefix
                    ><el-icon><OfficeBuilding /></el-icon
                  ></template>
                </el-input>
              </el-form-item>

              <el-form-item
                label="公司官网"
                prop="website"
                class="field-span-5"
              >
                <el-input
                  v-model="form.website"
                  maxlength="180"
                  placeholder="https://example.com"
                  clearable
                >
                  <template #prefix
                    ><el-icon><Link /></el-icon
                  ></template>
                </el-input>
              </el-form-item>

              <el-form-item
                label="所属行业"
                prop="industry"
                class="field-span-5"
              >
                <el-input
                  v-model="form.industry"
                  maxlength="60"
                  placeholder="户外用品 / 机械制造…"
                  clearable
                >
                  <template #prefix
                    ><el-icon><Briefcase /></el-icon
                  ></template>
                </el-input>
              </el-form-item>

              <el-form-item
                label="主要市场"
                prop="target_markets"
                class="field-span-7"
              >
                <el-input
                  v-model="form.target_markets"
                  maxlength="100"
                  placeholder="例如：北美、德国、澳洲"
                  clearable
                >
                  <template #prefix
                    ><el-icon><TrendCharts /></el-icon
                  ></template>
                </el-input>
              </el-form-item>

              <el-form-item
                label="公司地址"
                prop="address"
                class="field-span-12"
              >
                <el-input
                  v-model="form.address"
                  maxlength="200"
                  placeholder="国家 / 城市 / 街道"
                  clearable
                >
                  <template #prefix
                    ><el-icon><Location /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
            </div>
          </section>

          <section class="profile-card">
            <header class="profile-card__head">
              <span class="profile-index">02</span>
              <div>
                <h3>联系人</h3>
                <p>有急事时，我们找谁。</p>
              </div>
            </header>

            <div class="field-grid field-grid--contact">
              <el-form-item
                label="联系人姓名"
                prop="contact_name"
                class="field-span-4"
              >
                <el-input
                  v-model="form.contact_name"
                  maxlength="50"
                  placeholder="怎么称呼你"
                  clearable
                >
                  <template #prefix
                    ><el-icon><User /></el-icon
                  ></template>
                </el-input>
              </el-form-item>

              <el-form-item label="联系电话" prop="phone" class="field-span-4">
                <el-input
                  v-model="form.phone"
                  maxlength="40"
                  placeholder="含国家区号"
                  clearable
                >
                  <template #prefix
                    ><el-icon><Iphone /></el-icon
                  ></template>
                </el-input>
              </el-form-item>

              <el-form-item label="联系邮箱" prop="email" class="field-span-4">
                <el-input
                  v-model="form.email"
                  maxlength="120"
                  placeholder="name@company.com"
                  clearable
                >
                  <template #prefix
                    ><el-icon><Message /></el-icon
                  ></template>
                </el-input>
              </el-form-item>

              <el-form-item
                label="WhatsApp / 微信"
                prop="whatsapp"
                class="field-span-7"
              >
                <el-input
                  v-model="form.whatsapp"
                  maxlength="80"
                  placeholder="方便时就留一个"
                  clearable
                >
                  <template #prefix
                    ><el-icon><ChatDotRound /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
            </div>
          </section>

          <section class="profile-card profile-card--notes">
            <header class="profile-card__head">
              <span class="profile-index">03</span>
              <div>
                <h3>补充说明</h3>
                <p>忌讳、偏好、上线时间，都可以写。</p>
              </div>
            </header>

            <el-form-item
              label="还有什么想让我们知道"
              prop="notes"
              class="profile-notes-field"
            >
              <el-input
                v-model="form.notes"
                type="textarea"
                :rows="5"
                maxlength="1000"
                show-word-limit
                placeholder="例如：品牌名不要翻译；主色调不要绿色；月底前必须上线。"
              />
            </el-form-item>
          </section>

          <el-alert
            v-if="errorMsg"
            :title="errorMsg"
            type="error"
            show-icon
            :closable="false"
          />
        </el-form>
      </div>

      <aside class="profile-side">
        <section class="status-card" :class="`status-card--${statusTone}`">
          <div class="status-card__top">
            <span class="status-dot"></span>
            <span>{{ saveStateLabel }}</span>
          </div>
          <p class="status-card__hint">{{ statusHint }}</p>
          <small>{{ lastSavedLabel }}</small>

          <div v-if="!readonly" class="status-card__actions">
            <el-button
              type="primary"
              :loading="saving"
              :disabled="loading || !siteId"
              @click="saveProfile"
            >
              保存资料
            </el-button>
            <el-button text :disabled="!isDirty || saving" @click="loadProfile">
              撤销修改
            </el-button>
          </div>
        </section>

        <section class="usage-card">
          <h3>这些会用在哪</h3>
          <ul>
            <li>
              <el-icon><OfficeBuilding /></el-icon>
              <div>
                <strong>品牌称呼</strong>
                <span>避免网站写错公司名。</span>
              </div>
            </li>
            <li>
              <el-icon><Iphone /></el-icon>
              <div>
                <strong>联系方式</strong>
                <span>上线前快速确认细节。</span>
              </div>
            </li>
            <li>
              <el-icon><Compass /></el-icon>
              <div>
                <strong>市场方向</strong>
                <span>决定文案和视觉的重点。</span>
              </div>
            </li>
          </ul>
        </section>

        <section class="privacy-note">
          <el-icon><InfoFilled /></el-icon>
          <p>这些资料只给本项目团队使用，不会公开在网站上。</p>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import {
  OfficeBuilding,
  User,
  Iphone,
  Message,
  ChatDotRound,
  Link,
  Location,
  Briefcase,
  TrendCharts,
  Compass,
  Postcard,
  InfoFilled,
} from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global.js";
import { loadCustomerProfile, saveCustomerProfile } from "@/apis/collection";

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
});

const EMPTY_PROFILE = {
  company_name: "",
  contact_name: "",
  phone: "",
  email: "",
  whatsapp: "",
  website: "",
  industry: "",
  target_markets: "",
  address: "",
  notes: "",
};

const PROFILE_FIELDS = Object.keys(EMPTY_PROFILE);
const TOTAL_FIELDS = PROFILE_FIELDS.length;

const { websiteInfo } = storeToRefs(useGlobalStore());
const siteId = computed(() => websiteInfo.value?.site_id);
const siteName = computed(
  () =>
    websiteInfo.value?.site_name || websiteInfo.value?.site_id || "当前站点",
);

const formRef = ref(null);
const form = reactive({ ...EMPTY_PROFILE });
const loading = ref(false);
const saving = ref(false);
const errorMsg = ref("");
const savedSnapshot = ref("");
const lastSavedAt = ref("");
const hasSavedRecord = ref(false);

const rules = {
  company_name: [
    { required: true, message: "请填写公司或品牌名称", trigger: "blur" },
  ],
  contact_name: [
    { required: true, message: "请填写联系人姓名", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请填写联系电话", trigger: "blur" },
    {
      pattern: /^[+()\d\s-]{6,40}$/,
      message: "电话号码格式看起来不对",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请填写联系邮箱", trigger: "blur" },
    { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
  ],
  website: [
    {
      validator: (_rule, value, callback) => {
        if (!value || /^https?:\/\/\S+$/i.test(value.trim())) return callback();
        callback(new Error("官网地址请以 http:// 或 https:// 开头"));
      },
      trigger: "blur",
    },
  ],
};

function snapshotForm() {
  return JSON.stringify(
    PROFILE_FIELDS.reduce((acc, key) => {
      acc[key] = String(form[key] ?? "").trim();
      return acc;
    }, {}),
  );
}

const isDirty = computed(() => snapshotForm() !== savedSnapshot.value);

const filledCount = computed(
  () => PROFILE_FIELDS.filter((key) => String(form[key] ?? "").trim()).length,
);
const completion = computed(() =>
  Math.round((filledCount.value / TOTAL_FIELDS) * 100),
);

const statusTone = computed(() => {
  if (loading.value) return "neutral";
  if (saving.value) return "busy";
  if (props.readonly) return "readonly";
  if (isDirty.value) return "warning";
  if (hasSavedRecord.value) return "success";
  return "neutral";
});

const saveStateLabel = computed(() => {
  if (loading.value) return "正在读取";
  if (saving.value) return "正在保存";
  if (props.readonly) return "只读查看";
  if (isDirty.value) return "有未保存修改";
  if (hasSavedRecord.value) return "资料已同步";
  return "等待填写";
});

const statusHint = computed(() => {
  if (loading.value) return "稍等一下，资料马上出来。";
  if (saving.value) return "别关页面，马上就好。";
  if (props.readonly) return "这是客户提交的原始资料。";
  if (isDirty.value) return "改完记得点保存。";
  if (hasSavedRecord.value) return "服务端已有最新版本。";
  return "先填必填项，其余慢慢补。";
});

const lastSavedLabel = computed(() => {
  if (lastSavedAt.value) return `最近保存：${lastSavedAt.value}`;
  return "还没有保存记录";
});

function formatSavedAt(value) {
  if (!value) {
    return new Date().toLocaleString("zh-CN", { hour12: false });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", { hour12: false });
}

function assignProfile(profile = {}) {
  PROFILE_FIELDS.forEach((key) => {
    form[key] = String(profile?.[key] ?? "");
  });
}

function resetState() {
  assignProfile(EMPTY_PROFILE);
  savedSnapshot.value = snapshotForm();
  lastSavedAt.value = "";
  errorMsg.value = "";
  hasSavedRecord.value = false;
}

async function loadProfile() {
  if (!siteId.value) {
    resetState();
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await loadCustomerProfile(siteId.value);
    if (!res.ok) {
      errorMsg.value = res.message || "客户资料读取失败";
      return;
    }
    assignProfile(res.data || EMPTY_PROFILE);
    savedSnapshot.value = snapshotForm();
    lastSavedAt.value = res.updatedAt ? formatSavedAt(res.updatedAt) : "";
    hasSavedRecord.value = Boolean(res.data);
  } catch (error) {
    errorMsg.value = error?.message || "客户资料读取失败";
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  if (props.readonly || !siteId.value) return;

  try {
    await formRef.value?.validate();
  } catch {
    ElMessage.warning("还有必填项没填完");
    return;
  }

  saving.value = true;
  errorMsg.value = "";
  try {
    const payload = PROFILE_FIELDS.reduce((acc, key) => {
      acc[key] = String(form[key] ?? "").trim();
      return acc;
    }, {});
    const res = await saveCustomerProfile(siteId.value, payload);
    if (res?.code === 0) {
      savedSnapshot.value = snapshotForm();
      lastSavedAt.value = formatSavedAt();
      hasSavedRecord.value = true;
      ElMessage.success("客户资料已保存");
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
    if (newId !== oldId) resetState();
    loadProfile();
  },
  { immediate: true },
);
</script>

<style scoped>
.profile-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
  padding: 2px;
}

.profile-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(220px, 0.75fr);
  gap: 28px;
  align-items: end;
  overflow: hidden;
  padding: 28px 30px;
  border: 1px solid rgba(43, 124, 238, 0.16);
  border-radius: 20px;
  background:
    radial-gradient(
      circle at 88% 12%,
      rgba(43, 124, 238, 0.18),
      transparent 34%
    ),
    linear-gradient(
      118deg,
      rgba(255, 255, 255, 0.96),
      rgba(236, 244, 255, 0.88) 58%,
      rgba(245, 249, 255, 0.95)
    );
  box-shadow: 0 16px 40px rgba(28, 62, 110, 0.08);
}

.profile-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.3;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E");
}

.profile-hero__copy,
.completion-card {
  position: relative;
  z-index: 1;
}

.profile-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.profile-hero h2 {
  margin: 0;
  color: #12253d;
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.profile-hero p {
  max-width: 520px;
  margin: 12px 0 0;
  color: #4a5f78;
  font-size: 15px;
  line-height: 1.7;
}

.profile-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.profile-hero__meta span {
  padding: 5px 10px;
  border: 1px solid rgba(43, 124, 238, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  color: #35536e;
  font-size: 12px;
}

.completion-card {
  padding: 18px 20px;
  border: 1px solid rgba(18, 37, 61, 0.1);
  border-radius: 16px;
  background: rgba(16, 33, 52, 0.92);
  color: #fff;
  box-shadow: 0 14px 28px rgba(16, 33, 52, 0.18);
}

.completion-card__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.62);
}

.completion-card__top strong {
  color: #8fc7ff;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.completion-card__track {
  height: 7px;
  margin: 14px 0 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.completion-card__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7cc0ff, #d7ecff);
  transition: width 360ms cubic-bezier(0.22, 0.8, 0.2, 1);
}

.completion-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.56);
  font-size: 12px;
}

.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 290px;
  gap: 20px;
  align-items: start;
}

.profile-main,
.profile-form {
  min-width: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card {
  padding: 22px 24px 10px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98),
    rgba(249, 251, 254, 0.98)
  );
  box-shadow: 0 10px 28px rgba(25, 58, 96, 0.05);
}

.profile-card--notes {
  padding-bottom: 22px;
}

.profile-card__head {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.profile-index {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 11px;
  background: #e8f2ff;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.profile-card__head h3 {
  margin: 1px 0 3px;
  color: var(--color-text-primary);
  font-size: 17px;
  font-weight: 700;
}

.profile-card__head p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 0 16px;
}

.field-span-4 {
  grid-column: span 4;
}
.field-span-5 {
  grid-column: span 5;
}
.field-span-7 {
  grid-column: span 7;
}
.field-span-12 {
  grid-column: span 12;
}

.profile-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.profile-form :deep(.el-form-item__label) {
  padding-bottom: 7px;
  color: #42566d;
  font-size: 12px;
  font-weight: 650;
}

.profile-form :deep(.el-input__wrapper),
.profile-form :deep(.el-textarea__inner) {
  border-radius: 11px;
  background: #fbfcfe;
  box-shadow: 0 0 0 1px #dfe6ef inset;
  transition:
    box-shadow 180ms ease,
    background 180ms ease;
}

.profile-form :deep(.el-input__wrapper:hover),
.profile-form :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #c6d3e3 inset;
}

.profile-form :deep(.el-input__wrapper.is-focus),
.profile-form :deep(.el-textarea__inner:focus) {
  background: #fff;
  box-shadow:
    0 0 0 1px var(--color-primary) inset,
    0 0 0 3px rgba(43, 124, 238, 0.09);
}

.profile-form :deep(.el-input__prefix) {
  color: #91a4b8;
}

.profile-notes-field {
  margin-bottom: 0 !important;
}

.profile-side {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status-card,
.usage-card,
.privacy-note {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(25, 58, 96, 0.045);
}

.status-card {
  padding: 18px;
}

.status-card__top {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #35495f;
  font-size: 14px;
  font-weight: 700;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #9aa8b8;
  box-shadow: 0 0 0 4px rgba(154, 168, 184, 0.14);
}

.status-card--success .status-dot {
  background: var(--color-success);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.14);
}

.status-card--warning .status-dot {
  background: var(--color-warning);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.14);
}

.status-card--busy .status-dot {
  background: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(43, 124, 238, 0.14);
}

.status-card__hint {
  margin: 12px 0 6px;
  color: #51677e;
  font-size: 13px;
  line-height: 1.6;
}

.status-card small {
  color: var(--color-text-muted);
  font-size: 11px;
}

.status-card__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin-top: 18px;
}

.status-card__actions :deep(.el-button) {
  width: 100%;
  margin-left: 0;
  border-radius: 10px;
}

.usage-card {
  padding: 18px;
}

.usage-card h3 {
  margin: 0 0 14px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.usage-card ul {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.usage-card li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.usage-card li > .el-icon {
  margin-top: 2px;
  color: var(--color-primary);
}

.usage-card li div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.usage-card strong {
  color: #35495f;
  font-size: 12px;
  font-weight: 650;
}

.usage-card span {
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.privacy-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 14px 16px;
  border-style: dashed;
  background: #fbfcfe;
}

.privacy-note .el-icon {
  margin-top: 2px;
  color: #7f92a7;
}

.privacy-note p {
  margin: 0;
  color: #7a8b9d;
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .profile-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .profile-side {
    position: static;
  }
}

@media (max-width: 760px) {
  .profile-hero {
    grid-template-columns: 1fr;
    align-items: start;
    padding: 22px;
  }

  .field-span-4,
  .field-span-5,
  .field-span-7,
  .field-span-12 {
    grid-column: span 12;
  }

  .profile-card {
    padding: 20px 18px 8px;
  }
}
</style>
