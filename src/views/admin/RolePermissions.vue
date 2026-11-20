<script setup>
// 角色权限（轻量 RBAC）：配置 admin / user 两个角色可见的侧边栏菜单
import { ref, computed, onMounted } from "vue";
import {
  Setting,
  Check,
  Refresh,
  Reading,
  User,
  Files,
  Picture,
  Goods,
  Tickets,
  Key,
  Select,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PageContainer from "@/components/common/PageContainer.vue";
import {
  getRoleMenuPermissions,
  setRoleMenuPermission,
} from "@/apis/index.js";

// 与后端 MENU_KEYS 对齐的菜单清单（key -> 中文标题 + 图标 + 分组）
const MENU_OPTIONS = [
  { key: "instruction", title: "教程页", desc: "新用户引导教程", icon: Reading, tag: "开始" },
  { key: "siteInfo", title: "网站信息", desc: "站点基础信息展示", icon: Setting, tag: "站点内容" },
  { key: "pages", title: "页面列表", desc: "WordPress 页面列表（页面级仍按用户授权）", icon: Files, tag: "站点内容" },
  { key: "customerInfo", title: "客户基础信息", desc: "客户资料维护", icon: User, tag: "客户资料" },
  { key: "bannerCollection", title: "Banner 收集", desc: "Banner 图收集", icon: Picture, tag: "客户资料" },
  { key: "productList", title: "产品列表", desc: "产品管理", icon: Goods, tag: "站点内容" },
  { key: "newsList", title: "新闻列表", desc: "新闻管理", icon: Tickets, tag: "站点内容" },
];

const ROLES = [
  {
    value: "user",
    label: "普通用户",
    sub: "user",
    desc: "客户登录后看到的菜单，默认最小化授权",
  },
  {
    value: "admin",
    label: "管理员",
    sub: "admin",
    desc: "内部运营登录，通常拥有全部菜单",
  },
];

const role = ref("user");
const checked = ref(new Set());
const loading = ref(false);
const saving = ref(false);
const savedSnapshot = ref("");

const currentRole = computed(() => ROLES.find((r) => r.value === role.value) || ROLES[0]);

const authorizedCount = computed(() => checked.value.size);
const totalCount = computed(() => MENU_OPTIONS.length);
const allChecked = computed(() => MENU_OPTIONS.every((m) => checked.value.has(m.key)));
const indeterminate = computed(() => checked.value.size > 0 && !allChecked.value);

// 是否有未保存改动（对比快照）
const dirty = computed(() => snapshotOf(checked.value) !== savedSnapshot.value);

function snapshotOf(set) {
  return MENU_OPTIONS.filter((m) => set.has(m.key))
    .map((m) => m.key)
    .sort()
    .join("|");
}

function isChecked(key) {
  return checked.value.has(key);
}

function toggle(key, val) {
  const next = new Set(checked.value);
  if (val) next.add(key);
  else next.delete(key);
  checked.value = next;
}

function toggleAll(val) {
  checked.value = val ? new Set(MENU_OPTIONS.map((m) => m.key)) : new Set();
}

async function load() {
  loading.value = true;
  try {
    const res = await getRoleMenuPermissions(role.value);
    const set = new Set();
    if (res?.code === 0 && Array.isArray(res.data)) {
      for (const row of res.data) {
        if (row?.allow) set.add(row.menu_key);
      }
    }
    checked.value = set;
    savedSnapshot.value = snapshotOf(set);
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    for (const m of MENU_OPTIONS) {
      const allow = checked.value.has(m.key);
      await setRoleMenuPermission({
        role: role.value,
        menu_key: m.key,
        allow,
      });
    }
    ElMessage.success("保存成功，用户重新进入后生效");
    savedSnapshot.value = snapshotOf(checked.value);
    await load();
  } catch (e) {
    ElMessage.error("保存失败，请重试");
  } finally {
    saving.value = false;
  }
}

function switchRole(val) {
  role.value = val;
  load();
}

onMounted(load);
</script>

<template>
  <PageContainer
    title="角色权限"
    subtitle="配置不同角色登录后可见的侧边栏菜单，未授权的菜单不会出现也无法通过地址直接访问"
    :icon="Setting"
  >
    <div class="rp-wrap">
      <!-- 角色选择：大卡片切换 -->
      <div class="rp-roles">
        <button
          v-for="r in ROLES"
          :key="r.value"
          type="button"
          class="rp-role-card"
          :class="{ 'is-active': role === r.value }"
          @click="switchRole(r.value)"
        >
          <div class="rp-role-card__top">
            <span class="rp-role-card__name">{{ r.label }}</span>
            <el-tag size="small" :type="role === r.value ? 'primary' : 'info'" effect="plain" round>
              {{ r.sub }}
            </el-tag>
          </div>
          <p class="rp-role-card__desc">{{ r.desc }}</p>
        </button>
      </div>

      <!-- 概览 + 操作 -->
      <div class="rp-bar">
        <div class="rp-bar__info">
          <el-icon class="rp-bar__icon"><Key /></el-icon>
          <span>
            正在编辑
            <strong>{{ currentRole.label }}</strong>
            的菜单，已授权
            <strong class="rp-bar__count">{{ authorizedCount }}</strong>
            / {{ totalCount }} 项
          </span>
        </div>
        <div class="rp-bar__actions">
          <el-checkbox
            :model-value="allChecked"
            :indeterminate="indeterminate"
            @change="toggleAll"
          >
            全选
          </el-checkbox>
          <el-button :icon="Refresh" @click="load" :loading="loading">刷新</el-button>
          <el-button
            type="primary"
            :icon="Check"
            :loading="saving"
            :disabled="!dirty"
            @click="save"
          >
            {{ dirty ? "保存更改" : "已保存" }}
          </el-button>
        </div>
      </div>

      <!-- 菜单权限卡片 -->
      <div class="rp-grid" v-loading="loading">
        <div
          v-for="m in MENU_OPTIONS"
          :key="m.key"
          class="rp-card"
          :class="{ 'is-on': isChecked(m.key) }"
          @click="toggle(m.key, !isChecked(m.key))"
        >
          <div class="rp-card__icon">
            <el-icon :size="20"><component :is="m.icon" /></el-icon>
          </div>
          <div class="rp-card__main">
            <div class="rp-card__title-row">
              <span class="rp-card__title">{{ m.title }}</span>
              <span class="rp-card__tag">{{ m.tag }}</span>
            </div>
            <p class="rp-card__desc">{{ m.desc }}</p>
          </div>
          <div class="rp-card__switch" @click.stop>
            <el-switch
              :model-value="isChecked(m.key)"
              @change="(val) => toggle(m.key, val)"
            />
          </div>
        </div>
      </div>

      <p class="rp-footnote">
        <el-icon><Select /></el-icon>
        勾选即授权对应菜单；普通用户权限改动后，对方重新进入系统才会生效。页面列表内的具体页面仍按每位用户的站点授权过滤。
      </p>
    </div>
  </PageContainer>
</template>

<style scoped>
.rp-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

/* 角色切换卡片 */
.rp-roles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.rp-role-card {
  text-align: left;
  padding: 14px 16px;
  border-radius: var(--radius-card);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.rp-role-card:hover {
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-1px);
}
.rp-role-card.is-active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-surface) 70%);
  box-shadow: 0 6px 20px rgba(43, 124, 238, 0.15);
}
.rp-role-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.rp-role-card__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.rp-role-card__desc {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-muted);
}

/* 概览 + 操作条 */
.rp-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-card);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
}
.rp-bar__info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.rp-bar__info strong {
  color: var(--color-primary);
}
.rp-bar__count {
  font-size: 15px;
  font-weight: 700;
}
.rp-bar__icon {
  color: var(--color-primary);
  font-size: 16px;
}
.rp-bar__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 菜单卡片网格 */
.rp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.rp-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-card);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.rp-card:hover {
  box-shadow: var(--shadow-card-hover);
}
.rp-card.is-on {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, rgba(43, 124, 238, 0.06) 0%, var(--color-surface) 60%);
}
.rp-card__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-field);
  background: var(--color-surface-active);
  color: var(--color-text-muted);
  transition: background 0.24s, color 0.24s;
}
.rp-card.is-on .rp-card__icon {
  background: var(--color-primary);
  color: #fff;
}
.rp-card__main {
  flex: 1;
  min-width: 0;
}
.rp-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.rp-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.rp-card__tag {
  font-size: 11px;
  padding: 0 7px;
  line-height: 18px;
  border-radius: var(--radius-badge);
  color: var(--color-text-muted);
  background: var(--color-surface-active);
}
.rp-card.is-on .rp-card__tag {
  color: var(--color-primary);
  background: var(--color-primary-light);
}
.rp-card__desc {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-muted);
}
.rp-card__switch {
  flex-shrink: 0;
  align-self: center;
}

/* 脚注 */
.rp-footnote {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 4px 2px 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-muted);
}
.rp-footnote .el-icon {
  margin-top: 2px;
  color: var(--color-success);
}

@media (max-width: 768px) {
  .rp-roles {
    grid-template-columns: 1fr;
  }
  .rp-grid {
    grid-template-columns: 1fr;
  }
}
</style>
