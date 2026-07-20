<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { deleteDemoConfig, getDemoConfig, getDemoConfigList, saveDemoConfig } from "@/apis/index.js";
import { useGlobalStore } from "@/stores/global.js";
import { Delete, EditPen, InfoFilled, Plus, Refresh, Search, Setting } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const { websiteInfo } = useGlobalStore();

const loadingList = ref(false);
const loadingDetail = ref(false);
const saving = ref(false);
const mutatingDemo = ref(false);
const hasLoadedList = ref(false);
const blacklistDialogVisible = ref(false);
const blacklistDialogMode = ref("create");

const demoList = ref([]);
const blacklistUrls = ref([]);
const originalBlacklist = ref([]);
const currentRecord = ref(null);
const searchKeyword = ref("");

const blacklistDialogForm = reactive({
  index: -1,
  url: "",
});

const formState = reactive({
  id: null,
  demo: "",
  createdAt: "",
  updatedAt: "",
});

const routeDemo = computed(() => {
  return String(route.query.demo ?? websiteInfo?.demo_site ?? websiteInfo?.demo ?? "").trim();
});

const currentDemoName = computed(() => {
  return String(routeDemo.value || formState.demo || "").trim();
});

const listStats = computed(() => {
  return demoList.value
    .map((item) => {
      const demo = String(item?.demo || "").trim();
      const updatedAt = item?.updated_at || item?.updatedAt || "";
      return {
        ...item,
        demo,
        updatedAt,
        updatedAtText: formatDateTime(updatedAt),
        blacklistCount: normalizeBlacklistUrls(Array.isArray(item?.blacklist) ? item.blacklist : []).length,
      };
    })
    .filter((item) => item.demo);
});

const filteredDemoList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return listStats.value;

  return listStats.value.filter((item) => item.demo.toLowerCase().includes(keyword));
});

const normalizedBlacklist = computed(() => {
  return normalizeBlacklistUrls(blacklistUrls.value);
});

const blacklistRows = computed(() => {
  return blacklistUrls.value.map((item, index) => {
    const normalized = String(item || "").trim();
    return {
      key: `${index}-${normalized}`,
      normalized,
    };
  });
});

const currentDemoSummary = computed(() => {
  return listStats.value.find((item) => item.demo === currentDemoName.value) || null;
});

const blacklistCount = computed(() => normalizedBlacklist.value.length);

const isDirty = computed(() => {
  return normalizedBlacklist.value.join("\n") !== originalBlacklist.value.join("\n");
});

const blacklistDialogTitle = computed(() => {
  return blacklistDialogMode.value === "create" ? "新增黑名单图片" : "编辑黑名单图片";
});

const saveStatusText = computed(() => {
  return isDirty.value ? "待保存" : "已同步";
});

function normalizeBlacklistUrls(urls = []) {
  return urls.map((item) => String(item || "").trim()).filter(Boolean);
}

function sanitizeBlacklistUrls(urls = []) {
  return [...new Set(normalizeBlacklistUrls(urls))];
}

function normalizeDemoName(value) {
  return String(value || "").trim();
}

function isValidImageUrl(value) {
  try {
    const url = new URL(value);
    return Boolean(url.protocol === "http:" || url.protocol === "https:");
  } catch {
    return false;
  }
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).replace("T", " ").replace(".000Z", "");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function normalizeRecord(record = {}, demo = "") {
  return {
    id: record?.id ?? null,
    demo: String(record?.demo || demo || "").trim(),
    createdAt: record?.created_at || record?.createdAt || "",
    updatedAt: record?.updated_at || record?.updatedAt || "",
    imgs: Array.isArray(record?.imgs) ? record.imgs : [],
    sizes: Array.isArray(record?.sizes) ? record.sizes : [],
  };
}

function applyRecord(record, fallbackDemo = "") {
  const normalized = normalizeRecord(record, fallbackDemo);
  const nextBlacklist = sanitizeBlacklistUrls(Array.isArray(record?.blacklist) ? record.blacklist : []);

  currentRecord.value = normalized;
  formState.id = normalized.id;
  formState.demo = normalized.demo;
  formState.createdAt = normalized.createdAt;
  formState.updatedAt = normalized.updatedAt;
  blacklistUrls.value = nextBlacklist;
  originalBlacklist.value = [...nextBlacklist];
}

function applyEmptyRecord(demo = "") {
  const normalizedDemo = String(demo || "").trim();

  currentRecord.value = normalizeRecord({}, normalizedDemo);
  formState.id = null;
  formState.demo = normalizedDemo;
  formState.createdAt = "";
  formState.updatedAt = "";
  blacklistUrls.value = [];
  originalBlacklist.value = [];
}

function closeBlacklistDialog() {
  blacklistDialogVisible.value = false;
  blacklistDialogMode.value = "create";
  blacklistDialogForm.index = -1;
  blacklistDialogForm.url = "";
}

function openCreateBlacklistDialog() {
  blacklistDialogMode.value = "create";
  blacklistDialogForm.index = -1;
  blacklistDialogForm.url = "";
  blacklistDialogVisible.value = true;
}

function openEditBlacklistDialog(index) {
  blacklistDialogMode.value = "edit";
  blacklistDialogForm.index = index;
  blacklistDialogForm.url = String(blacklistUrls.value[index] || "");
  blacklistDialogVisible.value = true;
}

function submitBlacklistDialog() {
  const normalizedUrl = String(blacklistDialogForm.url || "").trim();
  if (!normalizedUrl) {
    ElMessage.warning("请输入图片地址");
    return;
  }

  if (!isValidImageUrl(normalizedUrl)) {
    ElMessage.warning("请输入有效的图片链接，需以 http:// 或 https:// 开头");
    return;
  }

  const duplicatedIndex = blacklistUrls.value.findIndex((item, index) => {
    if (blacklistDialogMode.value === "edit" && index === blacklistDialogForm.index) return false;
    return String(item || "").trim() === normalizedUrl;
  });

  if (duplicatedIndex > -1) {
    ElMessage.warning("这张图片已经在黑名单里了，无需重复添加");
    return;
  }

  if (blacklistDialogMode.value === "edit" && blacklistDialogForm.index > -1) {
    blacklistUrls.value[blacklistDialogForm.index] = normalizedUrl;
    ElMessage.success("图片地址已更新");
  } else {
    blacklistUrls.value.push(normalizedUrl);
    ElMessage.success("图片地址已加入黑名单");
  }

  closeBlacklistDialog();
}

function removeBlacklistUrl(index) {
  blacklistUrls.value.splice(index, 1);
}

async function confirmDiscardChanges(message) {
  if (!isDirty.value) return true;

  try {
    await ElMessageBox.confirm(message, "有未保存的修改", {
      type: "warning",
      confirmButtonText: "继续",
      cancelButtonText: "取消",
    });
    return true;
  } catch {
    return false;
  }
}

async function clearBlacklist() {
  if (blacklistUrls.value.length === 0) return;

  try {
    await ElMessageBox.confirm("确认清空当前 Demo 的黑名单吗？这不会立即保存到服务器。", "清空黑名单", {
      type: "warning",
      confirmButtonText: "确认清空",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }

  blacklistUrls.value = [];
}

async function loadDemoList() {
  loadingList.value = true;
  try {
    const res = await getDemoConfigList({ page: 1, page_size: 200 });
    demoList.value = res?.code === 0 && Array.isArray(res.data?.list) ? res.data.list : [];
  } catch (error) {
    demoList.value = [];
    ElMessage.error(error?.message || "获取 Demo 列表失败");
  } finally {
    loadingList.value = false;
  }
}

async function loadSelectedDemoConfig(demo) {
  const normalizedDemo = String(demo || "").trim();
  if (!normalizedDemo) {
    applyEmptyRecord("");
    return;
  }

  loadingDetail.value = true;
  try {
    const res = await getDemoConfig(normalizedDemo);
    if (res?.code === 0 && res?.data) {
      applyRecord(res.data, normalizedDemo);
      return;
    }

    applyEmptyRecord(normalizedDemo);
  } catch (error) {
    applyEmptyRecord(normalizedDemo);
    ElMessage.error(error?.message || `获取 Demo「${normalizedDemo}」配置失败`);
  } finally {
    loadingDetail.value = false;
  }
}

async function syncSelectedDemo() {
  const matchedDemo = listStats.value.some((item) => item.demo === routeDemo.value)
    ? routeDemo.value
    : (listStats.value[0]?.demo || "");

  if (!matchedDemo) {
    applyEmptyRecord("");
    return;
  }

  if (matchedDemo !== routeDemo.value) {
    await router.replace({
      name: "AdminDemoList",
      query: {
        ...route.query,
        demo: matchedDemo,
      },
    });
    return;
  }

  await loadSelectedDemoConfig(matchedDemo);
}

async function initializePage({ forceList = false } = {}) {
  if (forceList || !hasLoadedList.value) {
    await loadDemoList();
    hasLoadedList.value = true;
  }

  await syncSelectedDemo();
}

async function handleRefresh() {
  const shouldContinue = await confirmDiscardChanges("刷新后会用服务器最新配置覆盖当前未保存的修改，是否继续？");
  if (!shouldContinue) return;

  await initializePage({ forceList: true });
}

async function handleCreateDemo() {
  try {
    const { value } = await ElMessageBox.prompt("请输入新的 Demo 名称。创建后会生成一条空白配置。", "新增 Demo", {
      confirmButtonText: "创建",
      cancelButtonText: "取消",
      inputPlaceholder: "例如：demo67",
      inputValidator: (inputValue) => {
        const demoName = normalizeDemoName(inputValue);
        if (!demoName) return "请输入 Demo 名称";

        const exists = listStats.value.some((item) => item.demo.toLowerCase() === demoName.toLowerCase());
        if (exists) return "该 Demo 已存在，请更换名称";

        return true;
      },
    });

    const demoName = normalizeDemoName(value);
    if (!demoName) return;

    mutatingDemo.value = true;
    const res = await saveDemoConfig({
      demo: demoName,
      imgs: [],
      sizes: [],
      blacklist: [],
    });

    if (res?.code === 0) {
      await loadDemoList();
      await router.replace({
        name: "AdminDemoList",
        query: {
          ...route.query,
          demo: demoName,
        },
      });
      ElMessage.success(res.message || "Demo 创建成功");
      return;
    }

    ElMessage.error(res?.message || "Demo 创建失败");
  } catch (error) {
    if (error === "cancel" || error === "close") return;
    ElMessage.error(error?.message || "Demo 创建失败");
  } finally {
    mutatingDemo.value = false;
  }
}

async function handleSelectDemo(demo) {
  const normalizedDemo = String(demo || "").trim();
  if (!normalizedDemo || normalizedDemo === currentDemoName.value) return;

  const shouldContinue = await confirmDiscardChanges("切换 Demo 后，当前未保存的修改会丢失，是否继续切换？");
  if (!shouldContinue) return;

  await router.replace({
    name: "AdminDemoList",
    query: {
      ...route.query,
      demo: normalizedDemo,
    },
  });
}

async function handleDeleteDemo() {
  const demoName = currentDemoName.value;
  if (!demoName) {
    ElMessage.warning("当前没有可删除的 Demo");
    return;
  }

  const shouldContinue = await confirmDiscardChanges("删除后当前未保存的修改也会一并丢失，是否继续？");
  if (!shouldContinue) return;

  try {
    await ElMessageBox.confirm(
      `确认删除 Demo「${demoName}」吗？删除后将移除它的黑名单、截图和尺寸配置，且不可恢复。`,
      "删除 Demo",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
      },
    );
  } catch {
    return;
  }

  mutatingDemo.value = true;
  try {
    const res = await deleteDemoConfig(demoName);
    if (res?.code !== 0) {
      ElMessage.error(res?.message || "Demo 删除失败");
      return;
    }

    await loadDemoList();

    const nextDemo = listStats.value.find((item) => item.demo !== demoName)?.demo || "";
    if (nextDemo) {
      await router.replace({
        name: "AdminDemoList",
        query: {
          ...route.query,
          demo: nextDemo,
        },
      });
    } else {
      const nextQuery = { ...route.query };
      delete nextQuery.demo;
      applyEmptyRecord("");
      await router.replace({
        name: "AdminDemoList",
        query: nextQuery,
      });
    }

    ElMessage.success(res.message || "Demo 删除成功");
  } catch (error) {
    ElMessage.error(error?.message || "Demo 删除失败");
  } finally {
    mutatingDemo.value = false;
  }
}

async function handleSave() {
  const demo = currentDemoName.value;
  if (!demo) {
    ElMessage.warning("请先选择一个 Demo");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      demo,
      imgs: Array.isArray(currentRecord.value?.imgs) ? currentRecord.value.imgs : [],
      sizes: Array.isArray(currentRecord.value?.sizes) ? currentRecord.value.sizes : [],
      blacklist: sanitizeBlacklistUrls(blacklistUrls.value),
    };

    const res = await saveDemoConfig(payload);
    if (res?.code === 0) {
      await loadDemoList();
      applyRecord(res.data ? { ...res.data, blacklist: payload.blacklist } : payload, demo);
      ElMessage.success(res.message || "黑名单保存成功");
      return;
    }

    ElMessage.error(res?.message || "黑名单保存失败");
  } catch (error) {
    ElMessage.error(error?.message || "黑名单保存失败");
  } finally {
    saving.value = false;
  }
}

watch(
  routeDemo,
  async () => {
    await initializePage({ forceList: !hasLoadedList.value });
  },
  { immediate: true },
);
</script>

<template>
  <div class="demo-page">
    <header class="demo-page__header">
      <div class="demo-page__header-main">
        <span class="demo-page__eyebrow">管理后台 / Demo 配置</span>
        <div class="demo-page__title-row">
          <h1 class="demo-page__title">Demo 黑名单管理</h1>
          <el-tag effect="dark" type="primary" round>
            {{ demoList.length }} 个 Demo
          </el-tag>
          <el-tag v-if="isDirty" effect="plain" type="warning" round>
            当前有未保存修改
          </el-tag>
        </div>
        <p class="demo-page__subtitle">
          左侧切换 Demo，右侧维护黑名单 URL。截图与尺寸配置仍在
          <code>/admin/pages/:id</code>
          页面维护。
        </p>
      </div>

      <div class="demo-page__actions">
        <el-button type="primary" plain :icon="Plus" :loading="mutatingDemo" @click="handleCreateDemo">
          新增 Demo
        </el-button>
        <el-button :icon="Refresh" :loading="loadingList || loadingDetail" @click="handleRefresh">
          刷新数据
        </el-button>
        <el-button type="primary" :icon="Setting" :loading="saving" :disabled="!currentDemoName || mutatingDemo" @click="handleSave">
          保存黑名单
        </el-button>
      </div>
    </header>

    <section class="demo-overview">
      <article class="demo-stat-card">
        <span class="demo-stat-card__label">当前 Demo</span>
        <strong class="demo-stat-card__value">{{ currentDemoName || "-" }}</strong>
      </article>
      <article class="demo-stat-card">
        <span class="demo-stat-card__label">有效 URL</span>
        <strong class="demo-stat-card__value">{{ blacklistCount }}</strong>
      </article>
      <article class="demo-stat-card">
        <span class="demo-stat-card__label">配置 ID</span>
        <strong class="demo-stat-card__value">{{ formState.id || "-" }}</strong>
      </article>
      <article class="demo-stat-card">
        <span class="demo-stat-card__label">保存状态</span>
        <strong class="demo-stat-card__value">{{ saveStatusText }}</strong>
      </article>
    </section>

    <section class="demo-page__body">
      <aside class="demo-list-card" v-loading="loadingList">
        <div class="demo-list-card__head">
          <div>
            <h2 class="demo-list-card__title">Demo 列表</h2>
            <p class="demo-list-card__desc">支持按名称快速定位，点击即可切换。</p>
          </div>
          <el-tag effect="plain" type="info">{{ filteredDemoList.length }}/{{ demoList.length }}</el-tag>
        </div>

        <el-input
          v-model="searchKeyword"
          class="demo-list-card__search"
          clearable
          placeholder="搜索 Demo 名称"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div v-if="filteredDemoList.length > 0" class="demo-list">
          <button
            v-for="item in filteredDemoList"
            :key="item.id || item.demo"
            type="button"
            class="demo-list__item"
            :class="{ 'is-active': item.demo === currentDemoName }"
            @click="handleSelectDemo(item.demo)"
          >
            <div class="demo-list__item-main">
              <strong>{{ item.demo }}</strong>
              <span>{{ item.blacklistCount }} 条已保存黑名单</span>
            </div>
            <div class="demo-list__item-meta">
              <span>更新于 {{ item.updatedAtText }}</span>
            </div>
          </button>
        </div>

        <el-empty
          v-else
          :description="demoList.length ? '没有找到匹配的 Demo' : '暂时没有可配置的 Demo'"
          :image-size="72"
        />
      </aside>

      <main class="demo-editor" v-loading="loadingDetail">
        <section v-if="currentDemoName" class="demo-panel">
          <div class="demo-panel__head">
            <div>
              <h2 class="demo-panel__title">黑名单编辑区</h2>
              <p class="demo-panel__desc">通过弹窗新增或编辑图片地址，列表会直接展示缩略图，核对起来更直观。</p>
            </div>

            <div class="demo-panel__head-actions">
              <div class="demo-panel__summary">
                <el-icon class="demo-panel__summary-icon"><InfoFilled /></el-icon>
                <span>{{ isDirty ? "有修改待保存" : "当前内容已与服务器同步" }}</span>
              </div>
              <el-button
                type="danger"
                plain
                :icon="Delete"
                :loading="mutatingDemo"
                :disabled="!currentDemoName || saving"
                @click="handleDeleteDemo"
              >
                删除当前 Demo
              </el-button>
            </div>
          </div>

          <el-alert
            title="这个页面只负责黑名单配置"
            type="info"
            :closable="false"
            description="截图列表和尺寸参数请前往 /admin/pages/:id 页面维护，这里不会覆盖那些数据。"
          />

          <div class="demo-panel__meta">
            <span>Demo：<strong>{{ formState.demo || "-" }}</strong></span>
            <span>创建时间：<strong>{{ formatDateTime(formState.createdAt) }}</strong></span>
            <span>最近更新：<strong>{{ formatDateTime(formState.updatedAt) }}</strong></span>
            <span>已保存条数：<strong>{{ currentDemoSummary?.blacklistCount ?? 0 }}</strong></span>
          </div>

          <div class="demo-toolbar">
            <div class="demo-toolbar__left">
              <span class="demo-toolbar__tip">通过弹窗录入图片地址，系统会自动去掉空白并拦截重复地址。</span>
            </div>
            <div class="demo-toolbar__right">
              <el-button type="danger" plain :icon="Delete" @click="clearBlacklist" :disabled="blacklistUrls.length === 0">
                清空当前列表
              </el-button>
              <el-button size="small" type="primary" :icon="Plus" @click="openCreateBlacklistDialog">
                新增图片地址
              </el-button>
            </div>
          </div>

          <el-table
            :data="blacklistRows"
            row-key="key"
            stripe
            class="blacklist-table"
            empty-text="当前还没有黑名单 URL，点击“新增一行”开始填写。"
            style="width: 100%"
          >
            <el-table-column label="序号" width="80" align="center">
              <template #default="scope">
                <span class="blacklist-table__index">{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column label="图片预览" width="132" align="center">
              <template #default="scope">
                <div class="blacklist-table__preview-wrap">
                  <el-image
                    v-if="scope.row.normalized"
                    :src="scope.row.normalized"
                    :preview-src-list="[scope.row.normalized]"
                    fit="cover"
                    preview-teleported
                    class="blacklist-table__preview"
                  >
                    <template #error>
                      <div class="blacklist-table__preview-placeholder">加载失败</div>
                    </template>
                  </el-image>
                  <div v-else class="blacklist-table__preview-placeholder">未填写</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="图片地址" min-width="420">
              <template #default="scope">
                <div class="blacklist-table__url-cell">
                  <span class="blacklist-table__url-text">{{ scope.row.normalized || "未填写图片地址" }}</span>
                  <a
                    v-if="scope.row.normalized"
                    :href="scope.row.normalized"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="blacklist-table__link"
                  >
                    打开原图
                  </a>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" align="center">
              <template #default="scope">
                <el-button type="primary" link size="small" :icon="EditPen" @click="openEditBlacklistDialog(scope.$index)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" :icon="Delete" @click="removeBlacklistUrl(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section v-else class="demo-panel demo-panel--empty">
          <el-empty description="当前没有可编辑的 Demo 配置" :image-size="92" />
        </section>
      </main>
    </section>

    <el-dialog
      v-model="blacklistDialogVisible"
      :title="blacklistDialogTitle"
      width="520px"
      destroy-on-close
      @closed="closeBlacklistDialog"
    >
      <div class="blacklist-dialog">
        <p class="blacklist-dialog__desc">请输入需要加入黑名单的图片地址，保存后会在列表中显示缩略图预览。</p>
        <el-input
          v-model="blacklistDialogForm.url"
          placeholder="https://example.com/image.jpg"
          clearable
          @keyup.enter="submitBlacklistDialog"
        />
      </div>

      <template #footer>
        <div class="blacklist-dialog__footer">
          <el-button @click="closeBlacklistDialog">取消</el-button>
          <el-button type="primary" @click="submitBlacklistDialog">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.demo-page {
  --demo-bg: #f5f7fb;
  --demo-surface: rgba(255, 255, 255, 0.94);
  --demo-border: rgba(148, 163, 184, 0.18);
  --demo-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
  --demo-text: #0f172a;
  --demo-muted: #5b667a;
  --demo-accent: #2563eb;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 18%),
    linear-gradient(180deg, #f7fafc 0%, var(--demo-bg) 100%);
}

.demo-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 255, 0.92));
  border: 1px solid var(--demo-border);
  box-shadow: var(--demo-shadow);
}

.demo-page__header-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-page__eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.demo-page__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.demo-page__title {
  margin: 0;
  font-size: 30px;
  line-height: 1.08;
  color: var(--demo-text);
}

.demo-page__subtitle {
  margin: 0;
  max-width: 760px;
  color: var(--demo-muted);
  font-size: 14px;
  line-height: 1.65;
}

.demo-page__subtitle code {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.demo-page__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.demo-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.demo-stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 20px;
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.05);
}

.demo-stat-card__label {
  color: #64748b;
  font-size: 13px;
}

.demo-stat-card__value {
  color: var(--demo-text);
  font-size: 24px;
  line-height: 1.2;
}

.demo-page__body {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  min-height: 0;
}

.demo-list-card,
.demo-editor {
  min-height: 0;
}

.demo-list-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.05);
}

.demo-list-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.demo-list-card__title {
  margin: 0 0 6px;
  font-size: 18px;
  color: var(--demo-text);
}

.demo-list-card__desc {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.demo-list-card__search {
  margin-bottom: 2px;
}

.demo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 2px;
}

.demo-list__item {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid #d8e2f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.demo-list__item:hover,
.demo-list__item.is-active {
  transform: translateY(-1px);
  border-color: #8ec5ff;
  background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.12);
}

.demo-list__item-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.demo-list__item-main strong {
  color: var(--demo-text);
  font-size: 15px;
}

.demo-list__item-main span,
.demo-list__item-meta {
  color: #64748b;
  font-size: 12px;
}

.demo-editor {
  display: flex;
  flex-direction: column;
}

.demo-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px;
  border-radius: 24px;
  background: var(--demo-surface);
  border: 1px solid var(--demo-border);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
}

.demo-panel--empty {
  align-items: center;
  justify-content: center;
  min-height: 380px;
}

.demo-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.demo-panel__title {
  margin: 0 0 6px;
  color: var(--demo-text);
  font-size: 20px;
}

.demo-panel__desc {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.demo-panel__summary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1e3a8a;
  font-size: 13px;
}

.demo-panel__head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.demo-panel__summary-icon {
  color: var(--demo-accent);
  font-size: 16px;
}

.demo-panel__meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 12px;
}

.demo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-toolbar__tip {
  color: #64748b;
  font-size: 13px;
}

.blacklist-table {
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #dbe4f0;
}

.blacklist-table__index {
  font-variant-numeric: tabular-nums;
  color: #475569;
}

.blacklist-table__preview-wrap {
  display: flex;
  justify-content: center;
}

.blacklist-table__preview,
.blacklist-table__preview-placeholder {
  width: 84px;
  height: 84px;
  border-radius: 14px;
}

.blacklist-table__preview {
  overflow: hidden;
  border: 1px solid #dbe4f0;
  background: #fff;
}

.blacklist-table__preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
  background: linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%);
  border: 1px dashed #cbd5e1;
}

.blacklist-table__url-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.blacklist-table__url-text {
  word-break: break-all;
  color: #1e293b;
  line-height: 1.5;
}

.blacklist-table__link {
  width: fit-content;
  color: #2563eb;
  font-size: 12px;
  text-decoration: none;
}

.blacklist-table__link:hover {
  text-decoration: underline;
}

.blacklist-dialog {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.blacklist-dialog__desc {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.blacklist-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1280px) {
  .demo-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .demo-page__body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .demo-page {
    padding: 16px;
  }

  .demo-page__header {
    flex-direction: column;
  }

  .demo-page__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .demo-overview {
    grid-template-columns: 1fr;
  }

  .demo-panel,
  .demo-list-card,
  .demo-page__header {
    padding: 16px;
    border-radius: 18px;
  }
}
</style>
