<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { getDemoConfig, getDemoConfigList, saveDemoConfig } from "@/apis/index.js";
import { useGlobalStore } from "@/stores/global.js";
import { Delete, InfoFilled, Plus, Refresh, Setting } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const { websiteInfo } = useGlobalStore();

const loadingList = ref(false);
const loadingDetail = ref(false);
const saving = ref(false);

const demoList = ref([]);
const selectedDemo = ref("");
const blacklistUrls = ref([]);
const currentRecord = ref(null);

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
  return String(selectedDemo.value || formState.demo || routeDemo.value || "").trim();
});

const blacklistCount = computed(() => {
  return blacklistUrls.value.filter((item) => typeof item === "string" && item.trim()).length;
});

const blacklistText = computed({
  get() {
    return blacklistUrls.value.join("\n");
  },
  set(value) {
    blacklistUrls.value = normalizeBlacklistUrls(String(value || "").split(/\r?\n/));
  },
});

const listStats = computed(() => {
  return demoList.value.map((item) => ({
    ...item,
    blacklistCount: Array.isArray(item.blacklist) ? item.blacklist.filter(Boolean).length : 0,
    updatedAt: item.updated_at || item.updatedAt || "",
  }));
});

function normalizeBlacklistUrls(urls = []) {
  return urls.map((item) => String(item || "").trim()).filter(Boolean);
}

function formatDateTime(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").replace(".000Z", "");
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
  currentRecord.value = normalized;
  formState.id = normalized.id;
  formState.demo = normalized.demo;
  formState.createdAt = normalized.createdAt;
  formState.updatedAt = normalized.updatedAt;
  selectedDemo.value = normalized.demo;
  blacklistUrls.value = normalizeBlacklistUrls(Array.isArray(record?.blacklist) ? record.blacklist : []);
}

function applyEmptyRecord(demo = "") {
  const normalizedDemo = String(demo || "").trim();
  currentRecord.value = normalizeRecord({}, normalizedDemo);
  formState.id = null;
  formState.demo = normalizedDemo;
  formState.createdAt = "";
  formState.updatedAt = "";
  selectedDemo.value = normalizedDemo;
  blacklistUrls.value = [];
}

function addBlacklistUrl() {
  blacklistUrls.value.push("");
}

function removeBlacklistUrl(index) {
  blacklistUrls.value.splice(index, 1);
}

async function clearBlacklist() {
  if (blacklistUrls.value.length === 0) return;

  try {
    await ElMessageBox.confirm("Clear all blacklist URLs for this Demo?", "Confirm", {
      type: "warning",
      confirmButtonText: "Clear",
      cancelButtonText: "Cancel",
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
    ElMessage.error(error?.message || "Failed to load Demo list");
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
    ElMessage.error(error?.message || `Failed to load Demo config for ${normalizedDemo}`);
  } finally {
    loadingDetail.value = false;
  }
}

async function initializePage() {
  await loadDemoList();

  const preferredDemo = routeDemo.value || demoList.value[0]?.demo || "";
  if (!preferredDemo) {
    applyEmptyRecord("");
    return;
  }

  if (preferredDemo !== routeDemo.value) {
    router.replace({
      name: "AdminDemoList",
      query: {
        ...route.query,
        demo: preferredDemo,
      },
    });
  }

  await loadSelectedDemoConfig(preferredDemo);
}

function handleSelectDemo(demo) {
  const normalizedDemo = String(demo || "").trim();
  if (!normalizedDemo) return;

  router.replace({
    name: "AdminDemoList",
    query: {
      ...route.query,
      demo: normalizedDemo,
    },
  });
}

async function handleSave() {
  const demo = currentDemoName.value;
  if (!demo) {
    ElMessage.warning("Please select a Demo first");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      demo,
      imgs: Array.isArray(currentRecord.value?.imgs) ? currentRecord.value.imgs : [],
      sizes: Array.isArray(currentRecord.value?.sizes) ? currentRecord.value.sizes : [],
      blacklist: normalizeBlacklistUrls(blacklistUrls.value),
    };

    const res = await saveDemoConfig(payload);
    if (res?.code === 0) {
      await loadDemoList();
      applyRecord(res.data || { ...payload }, demo);
      blacklistUrls.value = normalizeBlacklistUrls(payload.blacklist);
      ElMessage.success(res.message || "Saved successfully");
      return;
    }

    ElMessage.error(res?.message || "Failed to save Demo config");
  } catch (error) {
    ElMessage.error(error?.message || "Failed to save Demo config");
  } finally {
    saving.value = false;
  }
}

watch(
  routeDemo,
  async () => {
    await initializePage();
  },
  { immediate: true },
);
</script>

<template>
  <div class="demo-page">
    <header class="demo-page__header">
      <div>
        <div class="demo-page__title-row">
          <h1>Demo list</h1>
          <el-tag type="info" effect="plain">{{ demoList.length }} demos</el-tag>
        </div>
        <p class="demo-page__subtitle">
          Select a Demo on the left, then edit its blacklist on the right. Screenshot and size settings live in
          <code>/admin/pages/:id</code>.
        </p>
      </div>

      <div class="demo-page__actions">
        <el-button :icon="Refresh" :loading="loadingList || loadingDetail" @click="initializePage">
          Refresh
        </el-button>
        <el-button type="primary" :icon="Setting" :loading="saving" @click="handleSave">
          Save blacklist
        </el-button>
      </div>
    </header>

    <section class="demo-page__body">
      <aside class="demo-list-card" v-loading="loadingList">
        <div class="demo-list-card__head">
          <h2>Available demos</h2>
          <span>{{ demoList.length }}</span>
        </div>

        <div v-if="listStats.length > 0" class="demo-list">
          <button
            v-for="item in listStats"
            :key="item.id || item.demo"
            type="button"
            class="demo-list__item"
            :class="{ 'is-active': item.demo === currentDemoName }"
            @click="handleSelectDemo(item.demo)"
          >
            <div class="demo-list__item-main">
              <strong>{{ item.demo }}</strong>
              <span>{{ item.blacklistCount }} blacklist URLs</span>
            </div>
            <div class="demo-list__item-meta">
              <span>{{ formatDateTime(item.updatedAt) }}</span>
            </div>
          </button>
        </div>

        <el-empty v-else description="No Demo config found" :image-size="72" />
      </aside>

      <main class="demo-editor" v-loading="loadingDetail">
        <section class="demo-panel">
          <div class="demo-panel__head">
            <div>
              <h2>Blacklist management</h2>
              <p>Edit only the blacklist here. Page screenshots and size data are managed in /admin/pages/:id.</p>
            </div>

            <div class="demo-panel__summary">
              <el-icon class="demo-panel__summary-icon"><InfoFilled /></el-icon>
              <span>Current demo: {{ currentDemoName || "-" }}, {{ blacklistCount }} URLs</span>
            </div>
          </div>

          <div class="demo-panel__meta">
            <span>Demo: <strong>{{ formState.demo || "-" }}</strong></span>
            <span>Created: <strong>{{ formatDateTime(formState.createdAt) }}</strong></span>
            <span>Updated: <strong>{{ formatDateTime(formState.updatedAt) }}</strong></span>
          </div>

          <label class="demo-field">
            <span>Blacklist text</span>
            <el-input v-model="blacklistText" type="textarea" :rows="5" placeholder="One URL per line" />
          </label>

          <div class="demo-toolbar">
            <div class="demo-toolbar__left">
              <el-button size="small" type="danger" plain :icon="Delete" @click="clearBlacklist" :disabled="blacklistUrls.length === 0">
                Clear list
              </el-button>
            </div>
            <div class="demo-toolbar__right">
              <el-button size="small" type="primary" :icon="Plus" @click="addBlacklistUrl">
                Add URL
              </el-button>
            </div>
          </div>

          <el-table
            :data="blacklistUrls"
            stripe
            class="blacklist-table"
            empty-text="No blacklist URLs yet. Click Add URL to create one."
            style="width: 100%"
          >
            <el-table-column label="No." width="80" align="center">
              <template #default="scope">
                <span class="blacklist-table__index">{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column label="URL" min-width="420">
              <template #default="scope">
                <el-input
                  v-model="blacklistUrls[scope.$index]"
                  placeholder="https://example.com/image.jpg"
                  size="small"
                  clearable
                />
              </template>
            </el-table-column>

            <el-table-column label="Action" width="110" align="center">
              <template #default="scope">
                <el-button type="danger" link size="small" :icon="Delete" @click="removeBlacklistUrl(scope.$index)">
                  Remove
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </main>
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%);
}

.demo-page__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
}

.demo-page__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.demo-page__title-row h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.1;
  color: #0f172a;
}

.demo-page__subtitle {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.demo-page__subtitle code {
  padding: 2px 6px;
  border-radius: 6px;
  background: #eff6ff;
  color: #1d4ed8;
}

.demo-page__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
}

.demo-list-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.demo-list-card__head h2 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.demo-list-card__head span {
  color: #64748b;
  font-size: 13px;
}

.demo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.demo-list__item {
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

.demo-list__item:hover,
.demo-list__item.is-active {
  transform: translateY(-1px);
  border-color: #93c5fd;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.12);
}

.demo-list__item-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.demo-list__item-main strong {
  color: #0f172a;
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
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
}

.demo-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.demo-panel__head h2 {
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 20px;
}

.demo-panel__head p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.demo-panel__summary {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #475569;
  font-size: 13px;
}

.demo-panel__summary-icon {
  color: #2563eb;
  font-size: 16px;
}

.demo-panel__meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  color: #64748b;
  font-size: 12px;
}

.demo-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #475569;
  font-size: 14px;
}

.demo-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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
</style>
