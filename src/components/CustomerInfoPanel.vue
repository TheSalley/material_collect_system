<template>
  <div class="profile-shell" v-loading="loading">
    <el-alert
      v-if="!siteId"
      type="warning"
      show-icon
      :closable="false"
      title="还没有绑定站点"
      description="请先选择一个站点，再填写企业基本信息。"
    />

    <template v-else>
      <el-alert
        v-if="errorMsg"
        type="error"
        show-icon
        :closable="false"
        :title="errorMsg"
      />

      <PanelCard flush class="intake-card">
        <div class="sheet-head">
          <h2>企 业 基 本 信 息 收 集 表 （ 建 站 服 务 ）</h2>
          <p>易海创腾网站部202411</p>
        </div>

        <div class="table-wrap">
          <table class="intake-table">
            <colgroup>
              <col style="width: 64px" />
              <col style="width: 132px" />
              <col style="width: 220px" />
              <col />
              <col style="width: 280px" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="col-no">序号</th>
                <th scope="col" class="col-section">板块</th>
                <th scope="col" class="col-item">项目</th>
                <th scope="col" class="col-value col-value--head">
                  填写内容
                  <small>（蓝色为示例）</small>
                </th>
                <th scope="col" class="col-usage">用途</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in ROWS" :key="row.key">
                <td class="col-no">{{ row.no }}</td>
                <td
                  v-if="row.section"
                  :rowspan="row.sectionSpan"
                  class="col-section"
                >
                  {{ row.section }}
                </td>
                <td
                  v-if="row.item"
                  :rowspan="row.itemSpan || 1"
                  class="col-item"
                >
                  {{ row.item }}
                </td>
                <td class="col-value">
                  <el-input
                    v-if="row.control === 'password'"
                    v-model="form[row.key]"
                    type="password"
                    show-password
                    :disabled="readonly"
                    :class="{ 'is-sample': isSample(row) }"
                    :aria-label="row.label"
                  />
                  <el-input
                    v-else-if="row.control === 'textarea'"
                    v-model="form[row.key]"
                    type="textarea"
                    :autosize="{
                      minRows: row.minRows || 1,
                      maxRows: row.maxRows || 6,
                    }"
                    resize="none"
                    :disabled="readonly"
                    :class="{ 'is-sample': isSample(row) }"
                    :aria-label="row.label"
                  />
                  <el-input
                    v-else
                    v-model="form[row.key]"
                    :disabled="readonly"
                    :class="{ 'is-sample': isSample(row) }"
                    :aria-label="row.label"
                  />
                </td>
                <td
                  v-if="row.usage"
                  :rowspan="row.usageSpan || 1"
                  class="col-usage"
                >
                  {{ row.usage }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <template #footer>
          <div class="sheet-footer">
            <div class="sheet-footer__state">
              <el-tag :type="statusTagType" size="small" effect="plain">
                {{ saveStateLabel }}
              </el-tag>
              <span>{{ lastSavedLabel }}</span>
            </div>

            <div v-if="!readonly" class="sheet-footer__actions">
              <el-button
                text
                :disabled="!isDirty || saving"
                @click="loadProfile"
              >
                撤销修改
              </el-button>
              <el-button
                type="primary"
                :loading="saving"
                :disabled="!isDirty"
                @click="saveProfile"
              >
                保存资料
              </el-button>
            </div>
          </div>
        </template>
      </PanelCard>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { useGlobalStore } from "@/stores/global.js";
import { loadCustomerProfile, saveCustomerProfile } from "@/apis/collection";
import PanelCard from "@/components/common/PanelCard.vue";

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false,
  },
});

const ROWS = [
  {
    key: "contact",
    no: 1,
    section: "项目管理相关",
    sectionSpan: 1,
    item: "对接人姓名，常用邮箱或电话",
    label: "对接人姓名，常用邮箱或电话",
    usage: "项目过程中给您发送通知邮件使用",
    sample: "章卓越 邮箱：semingslk@gmail.com  18471952070",
  },
  {
    key: "company_name_cn",
    no: 2,
    section: "网站页面\n展示信息",
    sectionSpan: 11,
    item: "公司全称",
    itemSpan: 2,
    label: "公司全称（中文）",
    usage: "展示在网站上的简称或品牌名（根据语种填写）",
    sample: "中文：舟济安全",
  },
  {
    key: "company_name_en",
    no: 3,
    label: "公司全称（英文）",
    usage: "展示在网站上的简称或品牌名（根据语种填写）",
    sample: "英文：Zhouji Safety",
  },
  {
    key: "logo",
    no: "",
    item: "LOGO",
    label: "LOGO",
    usage: "展示在网站上及站点地图",
    sample: "放在文件夹1",
  },
  {
    key: "vi_manual",
    no: "",
    item: "VI手册",
    label: "VI手册",
    usage: "项目中参考，制定网站的视觉及主题色调",
    sample: "无",
  },
  {
    key: "email",
    no: 4,
    item: "Email",
    label: "Email",
    usage: "展示在网站上用来接收询盘的邮箱\n（建议用企业邮箱）",
    sample: "zhoujitraffic@gmail.com",
  },
  {
    key: "mobile",
    no: 5,
    item: "手机号",
    label: "手机号",
    usage: "展示在网站上的业务员联系电话*请按此格式书写",
    sample: "8618870077676",
  },
  {
    key: "landline",
    no: 6,
    item: "座机",
    label: "座机",
    usage: "展示在网站上的公共号码座机*请按此格式书写",
    sample: "无",
  },
  {
    key: "address",
    no: 7,
    item: "公司所在地址信息（英文或建站语种）",
    label: "公司所在地址信息（英文或建站语种）",
    usage: "展示在网站上的地址信息",
    sample:
      "Room 2729, Aerospace Tower 1088 Ziyang Avenue, Nanchang City, Jiangxi Pro, CN",
  },
  {
    key: "map_embed",
    no: 8,
    item: "公司地址在谷歌地图上的定位链接",
    label: "公司地址在谷歌地图上的定位链接",
    usage: "如找不到定位，就放相近的地址\n*操作方法见下方（教程一）",
    sample: `<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1030.0921902898065!2d115.79742062136708!3d28.72007166997715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1szh-CN!2s!4v1788771228018!5m2!1szh-CN!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`,
    control: "textarea",
    minRows: 3,
    maxRows: 6,
  },
  {
    key: "im_account",
    no: 9,
    item: "Whatsapp/Skype账号",
    label: "Whatsapp/Skype账号",
    usage: "放在网站上的国外常用通讯工具账号",
    sample: "whatsapp:8618870077676",
  },
  {
    key: "social_links",
    no: 10,
    item: "社媒主页链接",
    label: "社媒主页链接",
    usage: "放在网站上点击跳转的社媒链接",
    sample: `Facebook：https://www.facebook.com/profile.php?id=61584412689732
tiktok：https://www.tiktok.com/@zhoujitraffic.ops
Instagram：https://www.instagram.com/sunnyyan2026?igsh=MTRxMm9nNzdubjEzNQ==
vk：待定
LinkedIn：https://www.linkedin.com/company/jiangxi-zhouji-traffic-facilities-co-ltd/posts/?feedView=all`,
    control: "textarea",
    minRows: 5,
    maxRows: 9,
  },
  {
    key: "industry",
    no: 11,
    section: "网站设置相关",
    sectionSpan: 10,
    item: "所属行业",
    label: "所属行业",
    usage: "根据行业类型搭建适合的网站",
    sample:
      "制造业、交通及交通运输行业、交通安全行业、个人安防行业、安全产品行业",
    control: "textarea",
    minRows: 1,
    maxRows: 3,
  },
  {
    key: "company_ppt",
    no: "",
    item: "企业介绍PPT",
    label: "企业介绍PPT",
    usage: "项目中参考企业信息",
    sample: "如有，放在文件夹3",
  },
  {
    key: "competitors",
    no: 12,
    item: "可参考的竞对网站（3个）",
    label: "可参考的竞对网站（3个）",
    usage: "供项目过程中进行参考",
    sample: `1.https://www.atstraffic.ca/
2.https://www.reflextape.com/
3.https://jackwinsafety.com/`,
    control: "textarea",
    minRows: 3,
    maxRows: 6,
  },
  {
    key: "old_site",
    no: 13,
    item: "老网站URL相关",
    itemSpan: 2,
    label: "老网站URL",
    usage: "填写老站域名",
    sample: "https://www.zhoujitraffic.com/",
  },
  {
    key: "keep_old_url",
    no: 14,
    label: "是否需要保留老站URL",
    usage:
      "如老站没流量或弃用，则填写不保留\n如需要保留，网站部会提供相应操作教程",
    sample: "是否需要保留老站URL：不需要",
  },
  {
    key: "new_domain",
    no: 15,
    item: "新网站使用的域名",
    label: "新网站使用的域名",
    usage: "该网站要使用的域名",
    sample: "待定，建议：zhoujisafety.com，zhoujireflective.com",
  },
  {
    key: "domain_login",
    no: 16,
    item: "域名后台登录方式",
    label: "域名后台登录方式",
    usage:
      "在哪个平台注册的域名，就提供哪个平台的登录账号密码（如贵司自行操作解析，请填自行操作）",
    sample: "无",
  },
  {
    key: "visitor_sources",
    no: 17,
    item: "访客主要来源",
    label: "访客主要来源",
    usage: "（主要客户是哪个国家或地区的）\n决定网站服务器所在的位置",
    sample: "欧美、中东、东南亚、非洲、大洋洲、（服务器放置在美国）",
    control: "textarea",
    minRows: 1,
    maxRows: 3,
  },
  {
    key: "smtp_email",
    no: 18,
    item: "SMTP邮箱配置\n提供一个QQ邮箱和授权码",
    itemSpan: 2,
    label: "SMTP邮箱配置",
    usage:
      "·因服务器直接转发易被拦截，所以需要QQ邮箱作为中转用来接收和代转发客户发给贵司的询盘。\n·一定要qq邮箱吗？是的\n*操作方法见下方（教程二）",
    usageSpan: 2,
    sample: "邮箱：772530504（颜总）",
  },
  {
    key: "smtp_auth_code",
    no: 19,
    label: "授权码",
    sample: "授权码：bwgveirshldbbcdc",
    control: "password",
  },
];

const FIELDS = ROWS.map((row) => row.key);
const SAMPLE_VALUES = Object.fromEntries(
  ROWS.map((row) => [row.key, row.sample]),
);

function createValues(source = {}) {
  return FIELDS.reduce((acc, key) => {
    const value = source?.[key];
    acc[key] = value == null ? "" : String(value);
    return acc;
  }, {});
}

function normalizeLoaded(data = {}) {
  const hasNewFields = FIELDS.some((key) =>
    Object.prototype.hasOwnProperty.call(data, key),
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

const { websiteInfo } = storeToRefs(useGlobalStore());
const siteId = computed(() => websiteInfo.value?.site_id);

const form = reactive(createValues());
const loading = ref(false);
const saving = ref(false);
const errorMsg = ref("");
const savedSnapshot = ref("");
const lastSavedAt = ref("");
const hasSavedRecord = ref(false);
const sampleLoaded = ref(false);

function snapshot() {
  return JSON.stringify(createValues(form));
}

const isDirty = computed(() => snapshot() !== savedSnapshot.value);

const saveStateLabel = computed(() => {
  if (loading.value) return "正在读取";
  if (saving.value) return "正在保存";
  if (props.readonly) return hasSavedRecord.value ? "只读查看" : "暂无资料";
  if (isDirty.value) return "有未保存修改";
  if (hasSavedRecord.value) return "资料已保存";
  return sampleLoaded.value ? "示例内容" : "等待填写";
});

const statusTagType = computed(() => {
  if (props.readonly) return "info";
  if (isDirty.value) return "warning";
  if (hasSavedRecord.value) return "success";
  return "info";
});

const lastSavedLabel = computed(() => {
  if (lastSavedAt.value) return `最近保存：${lastSavedAt.value}`;
  if (props.readonly && !hasSavedRecord.value) return "客户还没有提交";
  return "还没有保存记录";
});

function isSample(row) {
  return (
    !props.readonly &&
    !hasSavedRecord.value &&
    sampleLoaded.value &&
    form[row.key] === SAMPLE_VALUES[row.key]
  );
}

function assign(values) {
  Object.assign(form, createValues(values));
}

function resetState() {
  assign({});
  savedSnapshot.value = snapshot();
  lastSavedAt.value = "";
  errorMsg.value = "";
  hasSavedRecord.value = false;
  sampleLoaded.value = false;
}

function applySample() {
  assign(SAMPLE_VALUES);
  sampleLoaded.value = true;
}

function formatSavedAt(value) {
  if (!value) {
    return new Date().toLocaleString("zh-CN", { hour12: false });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", { hour12: false });
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
      errorMsg.value = res.message || "企业基本信息读取失败";
      return;
    }

    const data =
      res.data && typeof res.data === "object" && Object.keys(res.data).length
        ? res.data
        : null;

    if (data) {
      assign(normalizeLoaded(data));
      hasSavedRecord.value = true;
      sampleLoaded.value = false;
      lastSavedAt.value = res.updatedAt ? formatSavedAt(res.updatedAt) : "";
    } else {
      resetState();
      if (!props.readonly) applySample();
    }
    savedSnapshot.value = snapshot();
  } catch (error) {
    errorMsg.value = error?.message || "企业基本信息读取失败";
  } finally {
    loading.value = false;
  }
}

async function saveProfile() {
  if (props.readonly || !siteId.value || saving.value) return;

  saving.value = true;
  errorMsg.value = "";
  try {
    const res = await saveCustomerProfile(siteId.value, createValues(form));
    if (res?.code === 0) {
      savedSnapshot.value = snapshot();
      lastSavedAt.value = formatSavedAt();
      hasSavedRecord.value = true;
      sampleLoaded.value = false;
      ElMessage.success("资料已保存");
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
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.intake-card {
  flex: 1;
  min-height: 0;
}

.intake-card :deep(.panel-card__body) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sheet-head {
  flex: 0 0 auto;
  padding: 20px 24px 14px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  text-align: center;
}

.sheet-head h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.45;
}

.sheet-head p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
  text-align: left;
}

.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--color-surface);
}

.intake-table {
  width: 100%;
  min-width: 1080px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
}

.intake-table th,
.intake-table td {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  vertical-align: middle;
}

.intake-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 1px 0 var(--color-border);
}

.intake-table td {
  color: var(--color-text-primary);
  background: var(--color-surface);
}

.intake-table .col-no {
  color: var(--color-text-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: center;
  vertical-align: middle;
}

.intake-table .col-section {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  font-weight: 600;
  text-align: center;
  white-space: pre-line;
  word-break: break-word;
}

.intake-table .col-item {
  font-weight: 500;
  line-height: 1.6;
  white-space: pre-line;
  word-break: break-word;
}

.intake-table .col-value {
  padding: 6px 8px;
}

.intake-table .col-value--head {
  text-align: left;
}

.intake-table .col-value--head small {
  display: block;
  margin-top: 2px;
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 400;
}

.intake-table .col-usage {
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-line;
  word-break: break-word;
}

.intake-table :deep(.el-input__wrapper),
.intake-table :deep(.el-textarea__inner) {
  border-radius: 6px;
  background: var(--color-surface);
  box-shadow: 0 0 0 1px var(--color-border) inset;
  transition:
    box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1),
    background 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.intake-table :deep(.el-input__wrapper:hover),
.intake-table :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px var(--color-border-dark) inset;
}

.intake-table :deep(.el-input__wrapper.is-focus),
.intake-table :deep(.el-textarea__inner:focus) {
  background: var(--color-surface);
  box-shadow:
    0 0 0 1px var(--color-primary) inset,
    0 0 0 3px rgba(43, 124, 238, 0.09);
}

.intake-table :deep(.el-input__inner),
.intake-table :deep(.el-textarea__inner) {
  color: var(--color-text-primary);
  font-size: 13px;
}

.intake-table :deep(.el-textarea__inner) {
  line-height: 1.65;
}

.intake-table :deep(.is-sample .el-input__inner),
.intake-table :deep(.is-sample .el-textarea__inner) {
  color: var(--color-primary);
}

.intake-table :deep(.el-input.is-disabled .el-input__wrapper),
.intake-table :deep(.el-textarea.is-disabled .el-textarea__inner) {
  background: var(--color-surface-hover);
  box-shadow: 0 0 0 1px var(--color-border-light) inset;
}

.sheet-footer {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sheet-footer__state {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.sheet-footer__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 900px) {
  .sheet-head {
    padding: 16px;
  }

  .sheet-head h2 {
    font-size: 18px;
  }

  .sheet-footer {
    flex-wrap: wrap;
  }
}
</style>
