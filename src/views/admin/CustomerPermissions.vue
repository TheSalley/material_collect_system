<template>
  <PageContainer
    title="客户权限"
    subtitle="开哪扇门，你说了算。"
    :icon="Key"
  >
    <div class="perm-grid">
      <!-- 左侧：总开关 + 分组开关 -->
      <div class="perm-main">
        <PanelCard>
          <div class="master">
            <div class="master__text">
              <span class="master__label">全站共用一份</span>
              <span class="master__hint">
                改完保存，客户刷新就生效。
              </span>
            </div>
            <div class="master__actions">
              <button
                type="button"
                class="mini-btn"
                :disabled="!loaded"
                @click="setAll(true)"
              >
                全开
              </button>
              <button
                type="button"
                class="mini-btn"
                :disabled="!loaded"
                @click="setAll(false)"
              >
                全关
              </button>
            </div>
          </div>
        </PanelCard>

        <PanelCard class="perm-list-card">
          <template #header>
            <div class="list-head">
              <h3 class="list-head__title">客户能看到的页面</h3>
              <span class="list-head__count">
                {{ visibleItems.length }} / {{ CUSTOMER_MENU_ITEMS.length }}
              </span>
            </div>
          </template>

          <div v-loading="loading" class="perm-body">
            <section
              v-for="group in groupedItems"
              :key="group.label"
              class="perm-group"
            >
              <div class="perm-group__title">{{ group.label }}</div>
              <label
                v-for="item in group.items"
                :key="item.key"
                class="perm-row"
                :class="{ 'is-on': draft[item.key] }"
              >
                <div class="perm-row__text">
                  <span class="perm-row__name">{{ item.title }}</span>
                  <span class="perm-row__note">{{ item.note }}</span>
                </div>
                <span class="perm-row__path">{{ item.path }}</span>
                <el-switch
                  v-model="draft[item.key]"
                  :disabled="loading"
                  inline-prompt
                  active-text="开"
                  inactive-text="关"
                />
              </label>
            </section>
          </div>

          <template #footer>
            <span class="save-hint">{{ saveHint }}</span>
            <el-button :disabled="!dirty" @click="resetDraft">还原</el-button>
            <el-button
              type="primary"
              :disabled="!dirty"
              :loading="saving"
              @click="save"
            >
              保存权限
            </el-button>
          </template>
        </PanelCard>
      </div>

      <!-- 右侧：客户视角预览 -->
      <aside class="perm-aside">
        <div class="preview">
          <div class="preview__top">
            <span class="preview__dot"></span>
            <span>客户登录后看到</span>
          </div>
          <ul class="preview__list">
            <li
              v-for="item in visibleItems"
              :key="item.key"
              class="preview__item"
            >
              <span class="preview__bar"></span>
              {{ item.title }}
            </li>
            <li v-if="visibleItems.length === 0" class="preview__empty">
              一个都没有
            </li>
          </ul>
          <div class="preview__foot">
            共 {{ visibleItems.length }} 个入口
          </div>
        </div>
      </aside>
    </div>
  </PageContainer>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { Key } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PageContainer from "@/components/common/PageContainer.vue";
import PanelCard from "@/components/common/PanelCard.vue";
import {
  loadCustomerMenuPermissions,
  saveCustomerMenuPermissions,
} from "@/apis/collection.js";
import {
  CUSTOMER_MENU_ITEMS,
  DEFAULT_CUSTOMER_MENU_PERMISSIONS,
  normalizeCustomerMenuPermissions,
} from "@/config/customerMenu";

const loading = ref(true);
const loaded = ref(false);
const saving = ref(false);
const saved = ref({ ...DEFAULT_CUSTOMER_MENU_PERMISSIONS });
const draft = reactive({ ...DEFAULT_CUSTOMER_MENU_PERMISSIONS });

const groupedItems = computed(() => {
  const groups = new Map();
  for (const item of CUSTOMER_MENU_ITEMS) {
    if (!groups.has(item.group)) {
      groups.set(item.group, { label: item.group, items: [] });
    }
    groups.get(item.group).items.push(item);
  }
  return [...groups.values()];
});

const visibleItems = computed(() =>
  CUSTOMER_MENU_ITEMS.filter((item) => draft[item.key])
);

const dirty = computed(() =>
  CUSTOMER_MENU_ITEMS.some((item) => draft[item.key] !== saved.value[item.key])
);

const saveHint = computed(() => {
  if (loading.value) return "正在读权限";
  if (!dirty.value) return "改动会标出来";
  return "改完了，记得保存";
});

function setAll(allow) {
  for (const item of CUSTOMER_MENU_ITEMS) {
    draft[item.key] = allow;
  }
}

function applyPermissions(permissions) {
  const normalized = normalizeCustomerMenuPermissions(permissions);
  saved.value = { ...normalized };
  Object.assign(draft, normalized);
}

function resetDraft() {
  Object.assign(draft, saved.value);
}

async function loadPermissions() {
  loading.value = true;
  try {
    const res = await loadCustomerMenuPermissions();
    if (res.ok) {
      applyPermissions(res.data);
    } else {
      // 接口未上线时不锁死开关，允许先按默认值编辑
      applyPermissions(null);
      ElMessage.warning("权限接口未就绪，先按默认值显示");
    }
  } finally {
    loading.value = false;
    loaded.value = true;
  }
}

async function save() {
  saving.value = true;
  try {
    const res = await saveCustomerMenuPermissions({ ...draft });
    if (res.code === 0) {
      saved.value = { ...draft };
      loaded.value = true;
      ElMessage.success("已保存，客户刷新后生效");
    } else {
      ElMessage.error(res.message || "保存失败");
    }
  } finally {
    saving.value = false;
  }
}

onMounted(loadPermissions);
</script>

<style scoped>
/* 不对称布局：主区铺开，右侧预览卡固定宽度 */
.perm-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 268px;
  gap: 20px;
  align-items: start;
  flex: 1;
  min-height: 0;
}

.perm-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.master {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.master__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.master__label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #2b7cee;
}

.master__hint {
  font-size: 13px;
  color: #7d8899;
}

.master__actions {
  display: flex;
  gap: 6px;
}

.mini-btn {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid rgba(43, 124, 238, 0.22);
  background: linear-gradient(180deg, #ffffff, #f2f7fe);
  color: #2361b8;
  font-size: 12.5px;
  cursor: pointer;
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.mini-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -8px rgba(43, 124, 238, 0.55);
}

.mini-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.list-head__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.list-head__count {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #9aa3b2;
}

.perm-body {
  min-height: 240px;
}

.perm-group {
  margin-bottom: 18px;
}

.perm-group:last-child {
  margin-bottom: 0;
}

.perm-group__title {
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #9aa3b2;
}

.perm-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: linear-gradient(140deg, #ffffff 0%, #f8fafd 100%);
  cursor: pointer;
  transition: border-color 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}

.perm-row:hover {
  transform: translateX(2px);
  border-color: rgba(43, 124, 238, 0.35);
}

.perm-row.is-on {
  border-color: rgba(43, 124, 238, 0.3);
  background: linear-gradient(140deg, #ffffff 0%, #eef5ff 100%);
}

.perm-row__text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.perm-row__name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.perm-row__note {
  font-size: 12.5px;
  color: #8590a0;
}

.perm-row__path {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  color: #a3adbb;
}

.save-hint {
  margin-right: auto;
  font-size: 12.5px;
  color: #8b95a5;
}

/* 右侧预览：噪点 + 渐变，拒绝纯平 */
.perm-aside {
  position: sticky;
  top: 0;
}

.preview {
  padding: 18px 18px 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  box-shadow: 0 16px 34px -22px rgba(15, 23, 42, 0.45);
  background-color: #ffffff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E"),
    linear-gradient(160deg, #ffffff 0%, #f5f9fe 52%, #e9f1fb 100%);
}

.preview__top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #94a0b1;
  text-transform: uppercase;
}

.preview__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2b7cee;
  box-shadow: 0 0 0 4px rgba(43, 124, 238, 0.14);
}

.preview__list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.preview__item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 9px;
  font-size: 13px;
  color: #303a49;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.preview__bar {
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, #2b7cee, #6ba5f3);
}

.preview__empty {
  padding: 10px 0;
  font-size: 13px;
  color: #a1aab8;
}

.preview__foot {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed rgba(148, 163, 184, 0.4);
  font-size: 12px;
  color: #8b95a5;
}

@media (max-width: 1100px) {
  .perm-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .perm-aside {
    position: static;
  }
}
</style>
