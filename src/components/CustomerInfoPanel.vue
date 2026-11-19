<template>
  <div class="profile-shell" v-loading="loading">
    <el-alert
      v-if="!userId"
      type="warning"
      show-icon
      :closable="false"
      title="请先登录"
      description="登录后可填写企业基本信息。"
    />

    <template v-else>
      <el-alert
        v-if="errorMsg"
        type="error"
        show-icon
        :closable="false"
        :title="errorMsg"
      />

      <div class="sheet">
        <header class="sheet__bar">
          <span class="sheet__eyebrow">企业基本信息收集</span>
          <div class="sheet__actions">
            <el-button :icon="Download" plain size="small" @click="exportExcel">
              导出 Excel
            </el-button>
            <el-button
              v-if="!readonly"
              type="primary"
              size="small"
              :loading="saving"
              :disabled="!isDirty"
              @click="saveProfile"
            >
              保存资料
            </el-button>
          </div>
        </header>

        <div class="sheet__scroll">
          <div class="form">
            <section
              v-for="section in SECTIONS"
              :key="section.id"
              class="group"
            >
              <h3 class="group__title">
                {{ section.title }}
                <em>{{ section.desc }}</em>
              </h3>

              <div class="group__grid">
                <div
                  v-for="field in section.fields"
                  :key="field.key"
                  class="field"
                  :class="{ 'field--wide': field.control === 'textarea' }"
                >
                  <label class="field__label" :for="fieldId(field)">
                    {{ field.label }}
                  </label>

                  <el-input
                    :id="fieldId(field)"
                    v-if="field.control === 'password'"
                    v-model="form[field.key]"
                    type="password"
                    show-password
                    :placeholder="field.sample || field.placeholder || '请填写'"
                    :disabled="readonly"
                  />
                  <el-input
                    v-else-if="field.control === 'textarea'"
                    v-model="form[field.key]"
                    type="textarea"
                    :autosize="{
                      minRows: field.minRows || 2,
                      maxRows: field.maxRows || 5,
                    }"
                    resize="none"
                    :placeholder="field.sample || field.placeholder || '请填写'"
                    :disabled="readonly"
                  />
                  <el-input
                    v-else
                    v-model="form[field.key]"
                    :placeholder="field.sample || field.placeholder || '请填写'"
                    :disabled="readonly"
                  />

                  <p v-if="field.hint" class="field__hint">{{ field.hint }}</p>
                </div>
              </div>
            </section>

            <section class="group">
              <h3 class="group__title">
                填写教程
                <em>点开大图照着做</em>
              </h3>

              <div class="tutorial-grid">
                <figure
                  v-for="(image, index) in TUTORIAL_IMAGES"
                  :key="image.src"
                  class="tutorial"
                >
                  <el-image
                    :src="image.src"
                    :alt="image.alt"
                    :preview-src-list="TUTORIAL_SOURCES"
                    :initial-index="index"
                    fit="contain"
                    preview-teleported
                    hide-on-click-modal
                    class="tutorial__image"
                  />
                  <figcaption>{{ image.title }}</figcaption>
                </figure>
              </div>
            </section>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { Download } from "@element-plus/icons-vue";
import { useGlobalStore } from "@/stores/global.js";
import {
  loadCustomerProfile,
  saveCustomerProfile,
} from "@/apis/customerProfile.js";
import { downloadRichXlsx } from "@/utils/xlsxExport.js";
import {
  buildCustomerInfoRows,
  CUSTOMER_INFO_COLUMNS,
} from "@/utils/customerInfoExport.js";
import mapShareImage from "@/assets/images/tutorials/google-map-share.png";
import qqMailSecurityImage from "@/assets/images/tutorials/qq-mail-security.png";
import qqMailAuthCodeImage from "@/assets/images/tutorials/qq-mail-auth-code.png";

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
});

const TUTORIAL_IMAGES = [
  {
    src: mapShareImage,
    alt: "谷歌地图定位：搜索地点后点击分享，复制链接",
    title: "① 搜索地点 → ② 分享 → ③ 复制链接",
  },
  {
    src: qqMailSecurityImage,
    alt: "QQ邮箱：右上角菜单进入账号与安全",
    title: "QQ 邮箱右上角菜单 → 账号与安全",
  },
  {
    src: qqMailAuthCodeImage,
    alt: "QQ邮箱：安全设置里生成授权码",
    title: "安全设置 → 生成授权码",
  },
];

const TUTORIAL_SOURCES = TUTORIAL_IMAGES.map((image) => image.src);

const SECTIONS = [
  {
    id: "contact",
    title: "项目管理相关",
    desc: "建站过程中和我们对接用",
    fields: [
      {
        key: "contact",
        label: "对接人姓名、常用邮箱和电话",
        sample: "张三 / web@ehaitech.com / +86 12345678912",
        placeholder: "姓名 / 邮箱 / 电话",
        hint: "项目过程中给您发送通知邮件使用",
      },
    ],
  },
  {
    id: "content",
    title: "网站页面展示信息",
    desc: "访客打开网站看到的内容",
    fields: [
      {
        key: "company_name_cn",
        label: "公司全称（中文）",
        sample: "中文：易海创腾信息科技有限公司",
        hint: "展示在网站上的简称或品牌名（根据语种填写）",
      },
      {
        key: "company_name_en",
        label: "公司全称（英文）",
        sample: "英文：Yeehai Global",
        hint: "展示在网站上的简称或品牌名（根据语种填写）",
      },
      {
        key: "logo",
        label: "LOGO",
        sample: "放在文件夹1",
        placeholder: "放文件夹1，或写文件名",
        hint: "展示在网站上及站点地图",
      },
      {
        key: "vi_manual",
        label: "VI 手册",
        sample: "如有，放在文件夹2。若无，请忽略",
        placeholder: "放文件夹2",
        hint: "项目中参考，制定网站的视觉及主题色调",
      },
      {
        key: "email",
        label: "Email",
        sample: "web@ehaitech.com",
        hint: "展示在网站上用来接收询盘的邮箱（建议用企业邮箱）",
      },
      {
        key: "mobile",
        label: "手机号",
        sample: "+86 12345678912",
        hint: "展示在网站上的业务员联系电话，请按此格式书写",
      },
      {
        key: "landline",
        label: "座机",
        sample: "+86 20 12345678",
        hint: "展示在网站上的公共号码座机，请按此格式书写；没有写无",
      },
      {
        key: "address",
        label: "公司所在地址信息",
        sample:
          "Room 12, Floor 3A, Minggao City, No. 123 Yingbin Avenue, Huadu District, Guangzhou",
        hint: "展示在网站上的地址信息（英文或建站语种）",
      },
      {
        key: "map_embed",
        label: "公司地址在谷歌地图上的定位链接",
        sample: "https://maps.app.goo.gl/cTsPyCWYk2muJGXF9",
        placeholder: "https://maps.app.goo.gl/...",
        hint: "如找不到定位，就放相近的地址。操作方法见下方（教程一）",
        control: "textarea",
        minRows: 2,
        maxRows: 4,
      },
      {
        key: "im_account",
        label: "Whatsapp / Skype 账号",
        sample: "无",
        hint: "放在网站上的国外常用通讯工具账号",
      },
      {
        key: "social_links",
        label: "社媒主页链接",
        sample:
          "Facebook：\nYoutube：https://youtu.be/xxxx\nInstagram：\nTwitter：\nLinkedIn：",
        hint: "放在网站上点击跳转的社媒链接，没有的留空",
        control: "textarea",
        minRows: 4,
        maxRows: 8,
      },
    ],
  },
  {
    id: "launch",
    title: "网站设置相关",
    desc: "行业、域名、服务器和询盘配置",
    fields: [
      {
        key: "industry",
        label: "所属行业",
        sample: "咨询",
        hint: "根据行业类型搭建适合的网站",
      },
      {
        key: "company_ppt",
        label: "企业介绍 PPT",
        sample: "如有，放在文件夹3",
        placeholder: "放文件夹3",
        hint: "项目中参考企业信息；没有写无",
      },
      {
        key: "competitors",
        label: "可参考的竞对网站（3 个）",
        sample: "www.xxx.com\nwww.xxx.com\nwww.xxx.com",
        hint: "供项目过程中进行参考",
        control: "textarea",
        minRows: 3,
        maxRows: 6,
      },
      {
        key: "old_site",
        label: "是否有老站",
        sample: "是否有老站：有 / 没有 www.xxx.com",
        hint: "填写老站域名；没有老站写没有",
      },
      {
        key: "keep_old_url",
        label: "是否需要保留老站 URL",
        sample: "是否需要保留老站URL：不需要",
        hint: "如老站没流量或弃用，则填写不保留；如需要保留，网站部会提供相应操作教程",
      },
      {
        key: "new_domain",
        label: "新网站使用的域名",
        sample: "web.ehaitech.com",
        hint: "该网站要使用的域名；没定写待定",
      },
      {
        key: "visitor_sources",
        label: "访客主要来源",
        sample: "北美",
        hint: "主要客户是哪个国家或地区，决定网站服务器所在的位置",
      },
      {
        key: "domain_login",
        label: "域名后台登录方式",
        sample: "阿里云\n账号：xxx\n密码：xxx",
        hint: "在哪个平台注册的域名，就提供哪个平台的登录账号密码（如贵司自行操作解析，请填「自行操作」）",
        control: "textarea",
        minRows: 3,
        maxRows: 6,
      },
      {
        key: "smtp_email",
        label: "SMTP 中转邮箱（QQ 邮箱）",
        sample: "邮箱：",
        placeholder: "QQ邮箱地址",
        hint: "服务器直接转发易被拦截，需要 QQ 邮箱作为中转，接收并代转发客户发给您的询盘。一定要 QQ 邮箱，操作方法见下方（教程二）",
      },
      {
        key: "smtp_auth_code",
        label: "授权码",
        sample: "授权码：",
        placeholder: "16 位授权码",
        hint: "QQ 邮箱的授权码，不是 QQ 登录密码",
        control: "password",
      },
    ],
  },
];

const FIELDS = SECTIONS.flatMap((section) =>
  section.fields.map((field) => ({ ...field, section: section.title })),
);

function createValues(source = {}) {
  return FIELDS.reduce((acc, field) => {
    const value = source?.[field.key];
    acc[field.key] = value == null ? "" : String(value);
    return acc;
  }, {});
}

function normalizeLoaded(data = {}) {
  const hasNewFields = FIELDS.some((field) =>
    Object.prototype.hasOwnProperty.call(data, field.key),
  );
  if (hasNewFields) return createValues(data);

  const values = createValues();
  const legacyMap = {
    company_name_cn: data.company_name,
    email: data.email,
    mobile: data.phone,
    address: data.address,
    industry: data.industry,
    im_account: data.whatsapp,
    old_site: data.website,
    visitor_sources: data.target_markets,
  };
  Object.entries(legacyMap).forEach(([key, value]) => {
    if (value != null && String(value).trim() !== "") {
      values[key] = String(value);
    }
  });
  return values;
}

function fieldId(field) {
  return `customer-field-${field.key}`;
}

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);

/**
 * 客户基础信息归属「用户 id」（一人一条），非站点。
 */
const userId = computed(() => user.value?.id ?? null);

const form = reactive(createValues());
const loading = ref(false);
const saving = ref(false);
const errorMsg = ref("");
const savedSnapshot = ref("");

function snapshot() {
  return JSON.stringify(createValues(form));
}

const isDirty = computed(() => snapshot() !== savedSnapshot.value);

function assign(values) {
  Object.assign(form, createValues(values));
}

function resetState() {
  assign({});
  savedSnapshot.value = snapshot();
  errorMsg.value = "";
}

function estimateHeight(field) {
  const text = String(form[field.key] || field.sample || "");
  const lines = text.split("\n").length;
  const wrapped = Math.ceil(text.length / 40);
  return Math.min(Math.max(lines, wrapped, 1) * 18 + 10, 140);
}

function exportExcel() {
  const rows = buildCustomerInfoRows({
    sections: SECTIONS,
    form,
    estimateHeight,
  });

  const userLabel = user.value?.username || "";
  const stamp = new Date()
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "");

  downloadRichXlsx({
    fileName: `企业基本信息${userLabel ? "_" + userLabel : ""}_${stamp}`,
    sheetName: "企业基本信息",
    columns: CUSTOMER_INFO_COLUMNS,
    rows,
    frame: { edge: "medium", color: "FF9AA6B2" },
  });

  ElMessage.success("已导出 Excel");
}

async function loadProfile() {
  if (!userId.value) {
    resetState();
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await loadCustomerProfile();
    if (res.ok && res.data) {
      assign(normalizeLoaded(res.data));
    } else {
      resetState();
      if (!res.ok) errorMsg.value = res.message || "客户资料读取失败";
    }
    savedSnapshot.value = snapshot();
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  if (props.readonly || !userId.value || saving.value) return;

  saving.value = true;
  errorMsg.value = "";
  try {
    const res = await saveCustomerProfile(createValues(form));
    if (res.ok) {
      // 保存成功后以本地表单为准刷新快照，避免用被脱敏的响应覆盖用户刚填的授权码
      savedSnapshot.value = snapshot();
      ElMessage.success(res.message || "保存成功");
    } else {
      ElMessage.error(res.message || "保存失败");
    }
  } catch (error) {
    ElMessage.error(error?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}

watch(
  userId,
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
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

/* ---- 外壳 ---- */
.sheet {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  overflow: hidden;
}

.sheet__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--color-border);
}

.sheet__eyebrow {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.sheet__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.sheet__scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--color-surface);
}

/* ---- 表单容器 ---- */
.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1180px;
  padding: 18px 20px 26px;
  margin: 0 auto;
}

/* ---- 分区 ---- */
.group {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  overflow: hidden;
}

.group__title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  padding: 12px 18px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.group__title::before {
  content: "";
  width: 3px;
  height: 13px;
  border-radius: 2px;
  background: var(--color-primary);
  transform: translateY(1px);
}

.group__title em {
  color: var(--color-text-muted);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
}

/* ---- 字段网格（紧凑三列） ---- */
.group__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 20px;
  padding: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.field--wide {
  grid-column: 1 / -1;
}

.field__label {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.field__hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.5;
  word-break: break-word;
}

/* ---- 输入框（收窄） ---- */
.group :deep(.el-input__wrapper),
.group :deep(.el-textarea__inner) {
  border-radius: 7px;
  background: var(--color-surface);
  box-shadow: 0 0 0 1px var(--color-border) inset;
  transition: box-shadow 140ms cubic-bezier(0.22, 1, 0.36, 1);
}

.group :deep(.el-input__wrapper) {
  min-height: 32px;
  padding: 1px 10px;
}

.group :deep(.el-input__wrapper:hover),
.group :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px var(--color-border-dark) inset;
}

.group :deep(.el-input__wrapper.is-focus),
.group :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--color-primary) inset;
}

.group :deep(.el-input__inner),
.group :deep(.el-textarea__inner) {
  color: var(--color-text-primary);
  font-size: 13px;
}

.group :deep(.el-textarea__inner) {
  padding: 6px 10px;
  line-height: 1.55;
}

.group :deep(.el-input__inner::placeholder),
.group :deep(.el-textarea__inner::placeholder) {
  color: #b3c0d1;
}

.group :deep(.el-input.is-disabled .el-input__wrapper),
.group :deep(.el-textarea.is-disabled .el-textarea__inner) {
  background: var(--color-surface-hover);
  box-shadow: 0 0 0 1px var(--color-border-light) inset;
}

/* ---- 教程 ---- */
.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  padding: 18px;
}

.tutorial {
  margin: 0;
}

.tutorial__image {
  width: 100%;
  height: 150px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-hover);
  cursor: zoom-in;
  transition: border-color 140ms cubic-bezier(0.22, 1, 0.36, 1);
}

.tutorial__image:hover {
  border-color: var(--color-primary);
}

.tutorial__image :deep(img) {
  padding: 3px;
}

.tutorial figcaption {
  margin-top: 6px;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.5;
}

/* ---- 响应式 ---- */
@media (max-width: 960px) {
  .group__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .group__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .form {
    padding: 14px 12px 20px;
  }
}
</style>
