<script setup>
import { ref, reactive, onMounted, computed, watch, provide } from "vue";
import { getPages, getUserList, getPagePermissions, setPagePermission, getBlacklistConfig, getPageOrder, setPageOrder } from "@/apis/index.js";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import SiteInfoPanel from "@/components/SiteInfoPanel.vue";
import NewsListPanel from "@/components/NewsListPanel.vue";
import ProductListPanel from "@/components/ProductListPanel.vue";
import CustomerInfoPanel from "@/components/CustomerInfoPanel.vue";
import BannerCollectionPanel from "@/components/BannerCollectionPanel.vue";
import { useGlobalStore } from "@/stores/global.js";
import PageContainer from "@/components/common/PageContainer.vue";
import PanelCard from "@/components/common/PanelCard.vue";
import { usePageDragSort } from "@/composables/usePageDragSort.js";
import {
  UserFilled, ArrowLeft, ArrowRight, Check, House,
  InfoFilled, User, Key, CircleCheck, CircleClose,
  Calendar, Document, Edit, Box, Postcard, PictureFilled, Rank
} from '@element-plus/icons-vue';

const { user } = useGlobalStore();

// 二级 Tab：site / pages / news / product（页面返回时恢复上次 tab，避免总跳回页面设置）
const activeSubTab = ref(sessionStorage.getItem("detail_activeSubTab") || "pages");

watch(activeSubTab, (val) => {
  sessionStorage.setItem("detail_activeSubTab", val);
});

let pageList = reactive([]);
const router = useRouter();

// ===== 页面拖拽排序（站点级）=====
// 当前站点页面排序（page id 有序数组），来自 getPageOrder
const pageOrder = ref([]);
const savingOrder = ref(false);

// 行拖拽：整行可拖、4px 起拖、跟手插入线、边缘自动滚动（细节见 composable）
const { draggingIndex, dropTarget, onPointerDown: onRowPointerDown } = usePageDragSort({
  listRef: pageList,
  idOf: (row) => row.pageId,
  sameGroup: (a, b) => !!a?.allow === !!b?.allow,
  onDrop: (from, to) => applyPageDrop(from, to),
});

/** 拖拽视觉：源行抬起半透明，落点行上下贴插入线 */
function pageRowClassName({ rowIndex }) {
  if (rowIndex === draggingIndex.value) return "is-dragging-row";
  const target = dropTarget.value;
  if (!target || target.index !== rowIndex) return "";
  return target.position === "after" ? "is-drop-after" : "is-drop-before";
}

/** 按「allow 优先（启用在前），其次 order 索引（不在 order 的按原始顺序在后）」排序 pageList */
function sortPageListByAllowAndOrder() {
  const orderArr = pageOrder.value || [];
  const indexMap = new Map();
  orderArr.forEach((id, i) => {
    if (!indexMap.has(Number(id))) indexMap.set(Number(id), i);
  });
  const baseIndexMap = new Map();
  pageList.forEach((p, i) => baseIndexMap.set(Number(p.pageId), i));
  const big = Number.MAX_SAFE_INTEGER;
  const sorted = [...pageList].sort((a, b) => {
    // 第一键：allow 启用在前
    const allowA = a.allow ? 0 : 1;
    const allowB = b.allow ? 0 : 1;
    if (allowA !== allowB) return allowA - allowB;
    // 第二键：order 索引，无则退原始顺序
    const ia = indexMap.has(Number(a.pageId)) ? indexMap.get(Number(a.pageId)) : big;
    const ib = indexMap.has(Number(b.pageId)) ? indexMap.get(Number(b.pageId)) : big;
    if (ia !== ib) return ia - ib;
    return (baseIndexMap.get(Number(a.pageId)) ?? 0) - (baseIndexMap.get(Number(b.pageId)) ?? 0);
  });
  pageList.splice(0, pageList.length, ...sorted);
}

const { websiteInfo } = useGlobalStore();

/** 黑名单图片 URL 列表（通过 provide 注入给下级组件） */
const blacklist = ref([]);
provide("blacklist", blacklist);

/** 获取当前站点的 demo 名称 */
const currentDemo = computed(() => {
  return websiteInfo?.demo_site || websiteInfo?.demo || "";
});

/** 获取当前 Demo 的黑名单列表 */
async function fetchBlacklist() {
  const demo = currentDemo.value;
  if (!demo) {
    console.warn("[Detail] 未找到 demo_site，跳过黑名单加载");
    return;
  }
  try {
    const res = await getBlacklistConfig(demo);
    if (res.code === 0) {
      blacklist.value = Array.isArray(res.data?.blacklist) ? res.data.blacklist : [];
    }
  } catch {
    // 静默失败，黑名单为空不影响页面使用
  }
}

// 当 websiteInfo 变化时重新加载黑名单（处理异步/刷新场景）
watch(currentDemo, (demo) => {
  if (demo) fetchBlacklist();
}, { immediate: true });

/** 绑定当前站点的客户用户（来自用户列表，用于展示名称/ID/状态） */
const customerProfile = ref(null);

/** 绑定当前站点的客户用户 id（用于 set_page_permission 的 id） */
const customerUserId = ref(null);
const pagesPermissionBootstrapping = ref(true);
/** 每页开关 loading：key 为 pageId */
const permissionRowLoading = reactive({});

/** 展示名：优先绑定客户用户名/昵称，其次站点名称 */
const displayCustomerName = computed(() => {
  const u = customerProfile.value;
  if (u) {
    const name = u.nickname || u.username;
    if (name) return name;
  }
  return websiteInfo?.site_name || "—";
});

/** 面包屑标题：有客户用客户名，否则站点名 */
const displayCustomerTitle = computed(() => {
  const u = customerProfile.value;
  if (u?.nickname || u?.username) return u.nickname || u.username;
  return websiteInfo?.site_name || "客户详情";
});

/** 客户用户 ID（数字 id），无绑定时为 — */
const displayCustomerUserId = computed(() => {
  const id = customerProfile.value?.id ?? websiteInfo?.user_id ?? websiteInfo?.customer_user_id;
  return id != null && id !== "" ? String(id) : "—";
});

/**
 * 账户状态：用户接口 is_deleted === 0 为正常；无绑定客户为 unbound
 */
const customerAccountStatus = computed(() => {
  if (!customerProfile.value) return "unbound";
  const deleted = customerProfile.value.is_deleted;
  return deleted === 0 ? "active" : "disabled";
});

/** 到期时间：若站点/用户对象有字段则展示，否则 — */
const displayExpireAt = computed(() => {
  const w = websiteInfo;
  if (!w) return "—";
  const t =
    w.expire_at ??
    w.expires_at ??
    w.expired_at ??
    w.end_at ??
    customerProfile.value?.expire_at ??
    customerProfile.value?.expires_at;
  if (t == null || t === "") return "—";
  if (typeof t === "string") return t;
  try {
    return new Date(t).toLocaleString("zh-CN", { hour12: false });
  } catch {
    return String(t);
  }
});

/** 将接口返回的 URL 编码页面名（如 %e5%85%b3...）解码为可读文本 */
function decodePageDisplayName(raw) {
  if (raw == null || raw === "") return raw;
  const s = String(raw);
  if (!/%[0-9A-Fa-f]{2}/.test(s)) return s;
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/**
 * GET /api/user/page_permissions 返回的列表转为 Map<pageId, allow>
 */
function buildAllowMapFromPermissionList(list) {
  const map = new Map();
  if (!Array.isArray(list)) return map;
  for (const item of list) {
    if (item == null || item.page_id == null) continue;
    map.set(Number(item.page_id), !!item.allow);
  }
  return map;
}

/**
 * 拉取全部用户（兼容分页结构 { list, total } 与旧数组结构）
 */
async function fetchAllUsers() {
  const all = [];
  const pageSize = 100;
  let page = 1;
  for (;;) {
    const res = await getUserList({ page, page_size: pageSize });
    const data = res?.code === 0 ? res.data : null;
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.list)
        ? data.list
        : [];
    if (list.length === 0) break;
    all.push(...list);
    const total = Number(data?.total ?? 0);
    // 有 total 按 total 判断；无 total 时看是否拉满一页
    const hasMore = total > 0 ? all.length < total : list.length >= pageSize;
    if (!hasMore || page >= 100) break;
    page += 1;
  }
  return all;
}

/**
 * 从用户列表中解析绑定当前站点的客户用户（用于 id）
 */
function pickBoundUserForSite(users, siteId) {
  if (!Array.isArray(users) || !siteId) return null;
  const direct =
    websiteInfo?.user_id ??
    websiteInfo?.customer_user_id ??
    websiteInfo?.bind_user_id;
  if (direct != null && direct !== "") {
    const u = users.find((x) => Number(x.id) === Number(direct));
    if (u) return u;
  }
  return (
    users.find((u) => {
      if (
        Array.isArray(u.site_ids) &&
        u.site_ids.some((sid) => String(sid) === String(siteId))
      ) {
        return true;
      }
      return (
        Array.isArray(u.sites) &&
        u.sites.some((s) => String(s?.site_id) === String(siteId))
      );
    }) || null
  );
}

async function loadPagesAndPermissions() {
  pagesPermissionBootstrapping.value = true;
  pageList.splice(0, pageList.length);
  customerUserId.value = null;
  customerProfile.value = null;

  const siteId = websiteInfo?.site_id;
  if (!siteId) {
    pagesPermissionBootstrapping.value = false;
    return;
  }

  try {
    const [pagesRes, users, orderRes] = await Promise.all([
      getPages(siteId),
      fetchAllUsers(),
      getPageOrder(String(siteId)).catch(() => ({ code: -1 })),
    ]);
    pageOrder.value =
      orderRes?.code === 0 && Array.isArray(orderRes.data?.order)
        ? orderRes.data.order.map(Number)
        : [];
    const boundUser = pickBoundUserForSite(users, siteId);
    customerProfile.value = boundUser || null;
    if (boundUser?.id != null) {
      customerUserId.value = Number(boundUser.id);
    }

    let allowMap = new Map();
    if (customerUserId.value != null) {
      try {
        const permRes = await getPagePermissions({
          id: customerUserId.value,
          site_id: siteId,
        });
        if (permRes.code === 0 && Array.isArray(permRes.data)) {
          allowMap = buildAllowMapFromPermissionList(permRes.data);
        } else {
          ElMessage.warning(permRes.message || "获取页面授权失败，开关将按未授权显示");
        }
      } catch (e) {
        ElMessage.warning(
          "获取页面授权失败：" + (e?.message || "网络错误") + "，已按未授权显示"
        );
      }
    }

    if (pagesRes.code === 0 && Array.isArray(pagesRes.data)) {
      for (const p of pagesRes.data) {
        const pageId = Number(p.ID ?? p.id);
        pageList.push({
          ...p,
          post_name: decodePageDisplayName(p.post_name),
          pageId,
          allow: allowMap.has(pageId) ? allowMap.get(pageId) : false,
        });
      }
      sortPageListByAllowAndOrder();
    }
  } catch (e) {
    ElMessage.error("加载页面或权限失败：" + (e?.message || "未知错误"));
  } finally {
    pagesPermissionBootstrapping.value = false;
  }
}

onMounted(() => {
  loadPagesAndPermissions();
});

/** 切换页面授权：即时调用 POST /api/user/set_page_permission */
async function onPagePermissionChange(row, allow) {
  const siteId = websiteInfo?.site_id;
  const uid = customerUserId.value;
  const pageId = row.pageId;
  if (siteId == null || uid == null || pageId == null) {
    ElMessage.warning("无法设置：缺少站点或客户信息");
    return;
  }

  permissionRowLoading[pageId] = true;
  try {
    const res = await setPagePermission({
      id: uid,
      site_id: String(siteId),
      page_id: Number(pageId),
      allow: !!allow,
    });
    if (res.code === 0) {
      row.allow = res.data?.allow ?? !!allow;
      ElMessage.success(res.message || "设置成功");
      // 启用/禁用后按「启用优先 + 自定义顺序」重排
      sortPageListByAllowAndOrder();
    } else {
      ElMessage.error(res.message || "设置失败");
    }
  } catch (e) {
    ElMessage.error("设置失败：" + (e?.message || "网络错误"));
  } finally {
    permissionRowLoading[pageId] = false;
  }
}


/** 放置：仅调整同段内相对顺序，落位后按 allow 优先重排并保存 */
async function applyPageDrop(from, to) {
  if (from === -1 || to === -1 || from === to) return;
  // 只允许在「同 allow 段」内调整（跨段拖拽会被 allow 排序键复原）
  if (!!pageList[from].allow !== !!pageList[to].allow) {
    return;
  }

  const before = pageList.map((p) => p.pageId);
  // 先在当前显示顺序中移动该行
  const moved = [...pageList];
  const [item] = moved.splice(from, 1);
  moved.splice(to, 0, item);
  // 计算新的 order：仅保留同段内的相对调整
  // 用显示顺序里的「全部 pageId」作为保存顺序（后端只存数组，读取时按 allow+order 展示）
  const newOrder = moved.map((p) => Number(p.pageId));

  pageList.splice(0, pageList.length, ...moved);
  pageOrder.value = newOrder;
  sortPageListByAllowAndOrder();

  const siteId = websiteInfo?.site_id;
  if (!siteId) return;
  savingOrder.value = true;
  try {
    const res = await setPageOrder({ site_id: String(siteId), order: newOrder });
    if (res.code === 0) {
      ElMessage.success("排序已保存");
    } else {
      throw new Error(res.message || "保存失败");
    }
  } catch (e) {
    // 回滚到拖拽前顺序
    pageOrder.value = before;
    const restore = [...pageList].sort((a, b) => {
      const ia = before.indexOf(Number(a.pageId));
      const ib = before.indexOf(Number(b.pageId));
      return (ia < 0 ? 99999 : ia) - (ib < 0 ? 99999 : ib);
    });
    pageList.splice(0, pageList.length, ...restore);
    sortPageListByAllowAndOrder();
    ElMessage.error("排序保存失败：" + (e?.message || "网络错误"));
  } finally {
    savingOrder.value = false;
  }
}

function edit(row) {
  // 根据用户角色决定跳转路径
  const role = (user?.role ?? "user").toString().toLowerCase();
  if (role === "admin") {
    // admin 用户跳转到 /admin/pages/:id
    router.push({ path: `/admin/pages/${row.ID}` });
  } else {
    // user 用户跳转到 /pages/:id
    router.push({ path: `/pages/${row.ID}` });
  }
}

async function handleSave() {
  if (activeSubTab.value === "pages") {
    ElMessage.info("页面权限已通过开关保存，无需再点保存");
    return;
  }
  ElMessage.info("当前页签暂无批量保存项");
}
</script>

<template>
  <PageContainer>
    <template #header>
      <div class="flex justify-between items-center w-full flex-wrap gap-4">
        <div class="flex flex-col gap-2 min-w-0">
          <div class="flex items-center gap-3">
            <el-icon class="text-primary text-2xl"><UserFilled /></el-icon>
            <h1 class="text-2xl font-semibold text-text-primary">客户详情</h1>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <a
              href="#"
              @click.prevent="router.push({ name: 'AdminList' })"
              class="text-text-muted hover:text-primary transition-colors flex items-center gap-1"
            >
              <el-icon><House /></el-icon>
              站点管理
            </a>
            <el-icon class="text-text-muted"><ArrowRight /></el-icon>
            <span class="text-text-secondary font-medium truncate">{{ displayCustomerTitle }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <el-button :icon="ArrowLeft" @click="router.push({ name: 'AdminList' })">返回</el-button>
          <el-button
            v-if="!['pages', 'profile', 'banners'].includes(activeSubTab)"
            type="primary"
            :icon="Check"
            @click="handleSave"
            size="large"
          >
            保存更改
          </el-button>
          <el-tooltip
            v-else-if="activeSubTab === 'pages'"
            content="页面权限通过右侧开关即时保存，无需点击保存"
            placement="bottom"
          >
            <el-button type="primary" :icon="Check" size="large" disabled>
              页面权限已即时保存
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <div class="flex-1 overflow-auto min-h-0 pretty-scroll">
      <div class="p-6 space-y-6">
        <!-- 客户信息卡片 -->
        <PanelCard title="客户信息">
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon class="text-primary"><InfoFilled /></el-icon>
              <h3 class="text-base font-semibold text-text-primary">客户信息</h3>
            </div>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-text-muted text-sm">
                <el-icon><User /></el-icon>
                <span>客户名称</span>
              </div>
              <p class="text-text-primary text-base font-medium">{{ displayCustomerName }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-text-muted text-sm">
                <el-icon><Key /></el-icon>
                <span>客户ID</span>
              </div>
              <p class="text-text-primary text-base font-medium font-mono">{{ displayCustomerUserId }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-text-muted text-sm">
                <el-icon><CircleCheck /></el-icon>
                <span>账户状态</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="customerAccountStatus !== 'unbound'"
                  :class="[
                    'w-2.5 h-2.5 rounded-full',
                    customerAccountStatus === 'active' ? 'bg-success' : 'bg-danger',
                  ]"
                ></span>
                <el-tag v-if="customerAccountStatus === 'unbound'" type="info" size="small" effect="plain" round>
                  未绑定客户账号
                </el-tag>
                <el-tag v-else :type="customerAccountStatus === 'active' ? 'success' : 'danger'" size="small" effect="dark" round>
                  {{ customerAccountStatus === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-text-muted text-sm">
                <el-icon><Calendar /></el-icon>
                <span>到期时间</span>
              </div>
              <p class="text-text-primary text-base font-medium">{{ displayExpireAt }}</p>
            </div>
          </div>
        </PanelCard>

        <!-- 页面 / 站点 / 内容 Tab 区域 -->
        <div class="flex flex-col">
          <div class="border-b border-border mb-6">
            <nav class="flex flex-wrap gap-x-8 gap-y-2">
              <!-- 站点信息 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2 transition-colors"
                :class="activeSubTab === 'site'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-muted hover:text-primary hover:border-primary-light'"
                @click="activeSubTab = 'site'"
              >
                <el-icon :class="activeSubTab === 'site' ? 'text-primary' : 'text-text-muted'">
                  <InfoFilled />
                </el-icon>
                <span class="text-base">站点信息</span>
              </button>
              <!-- 客户资料 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2 transition-colors"
                :class="activeSubTab === 'profile'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-muted hover:text-primary hover:border-primary-light'"
                @click="activeSubTab = 'profile'"
              >
                <el-icon :class="activeSubTab === 'profile' ? 'text-primary' : 'text-text-muted'">
                  <Postcard />
                </el-icon>
                <span class="text-base">客户资料</span>
              </button>
              <!-- Banner 收集 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2 transition-colors"
                :class="activeSubTab === 'banners'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-muted hover:text-primary hover:border-primary-light'"
                @click="activeSubTab = 'banners'"
              >
                <el-icon :class="activeSubTab === 'banners' ? 'text-primary' : 'text-text-muted'">
                  <PictureFilled />
                </el-icon>
                <span class="text-base">Banner</span>
              </button>
              <!-- 页面设置 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2 transition-colors"
                :class="activeSubTab === 'pages'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-muted hover:text-primary hover:border-primary-light'"
                @click="activeSubTab = 'pages'"
              >
                <el-icon :class="activeSubTab === 'pages' ? 'text-primary' : 'text-text-muted'">
                  <Document />
                </el-icon>
                <span class="text-base">页面设置</span>
              </button>
              <!-- 新闻 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2 transition-colors"
                :class="activeSubTab === 'news'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-muted hover:text-primary hover:border-primary-light'"
                @click="activeSubTab = 'news'"
              >
                <el-icon :class="activeSubTab === 'news' ? 'text-primary' : 'text-text-muted'">
                  <Document />
                </el-icon>
                <span class="text-base">新闻</span>
              </button>
              <!-- 产品 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2 transition-colors"
                :class="activeSubTab === 'product'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-muted hover:text-primary hover:border-primary-light'"
                @click="activeSubTab = 'product'"
              >
                <el-icon :class="activeSubTab === 'product' ? 'text-primary' : 'text-text-muted'">
                  <Box />
                </el-icon>
                <span class="text-base">产品</span>
              </button>
            </nav>
          </div>

          <!-- 页面设置：页面列表表格（页面授权 POST /api/user/set_page_permission） -->
          <div v-if="activeSubTab === 'pages'">
            <PanelCard flush>
              <el-alert
                v-if="!pagesPermissionBootstrapping && customerUserId == null"
                type="warning"
                class="m-4 mb-0"
                show-icon
                :closable="false"
                title="未找到绑定当前站点的客户账号"
                description="请先在「用户管理」中为该客户绑定本站点后，再在此处设置页面访问权限。"
              />
              <div class="overflow-x-auto p-4 pt-4" @pointerdown="onRowPointerDown">
                <el-table
                  v-loading="pagesPermissionBootstrapping"
                  :data="pageList"
                  :stripe="true"
                  :highlight-current-row="true"
                  :row-class-name="pageRowClassName"
                  class="w-full page-drag-table"
                  empty-text="暂无页面数据"
                >
                  <el-table-column label="排序" width="70" align="center">
                    <template #default>
                      <span class="drag-grip" title="按住拖动排序">
                        <el-icon><Rank /></el-icon>
                      </span>
                    </template>
                  </el-table-column>

                  <el-table-column prop="ID" label="ID" width="180">
                    <template #default="scope">
                      <span class="font-mono text-xs text-text-muted">{{ scope.row.ID }}</span>
                    </template>
                  </el-table-column>

                  <el-table-column prop="post_name" label="页面名称" min-width="200">
                    <template #default="scope">
                      <div class="flex items-center gap-2">
                        <el-icon class="text-primary"><Document /></el-icon>
                        <span class="font-medium text-text-primary">{{ scope.row.post_name || '-' }}</span>
                      </div>
                    </template>
                  </el-table-column>

                  <el-table-column label="授权状态" width="120" align="center">
                    <template #default="scope">
                      <el-tag :type="scope.row.allow ? 'success' : 'danger'" size="small" effect="dark" round>
                        <el-icon class="mr-1">
                          <CircleCheck v-if="scope.row.allow" />
                          <CircleClose v-else />
                        </el-icon>
                        {{ scope.row.allow ? "启用" : "禁用" }}
                      </el-tag>
                    </template>
                  </el-table-column>

                  <el-table-column fixed="right" label="操作" width="200" align="center">
                    <template #default="scope">
                      <div class="flex items-center justify-center gap-3">
                        <el-switch
                          :model-value="scope.row.allow"
                          :loading="!!permissionRowLoading[scope.row.pageId]"
                          :disabled="customerUserId == null || pagesPermissionBootstrapping"
                          :active-color="'#13ce66'"
                          :inactive-color="'#ff4949'"
                          @change="(val) => onPagePermissionChange(scope.row, val)"
                        />
                        <el-button type="primary" size="small" :icon="Edit" @click="edit(scope.row)">编辑</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </PanelCard>
          </div>

          <!-- 站点信息：复用 SiteInfoPanel -->
          <div v-else-if="activeSubTab === 'site'">
            <SiteInfoPanel />
          </div>

          <!-- 客户资料：客户提交内容只读查看 -->
          <div v-else-if="activeSubTab === 'profile'">
            <CustomerInfoPanel readonly />
          </div>

          <!-- Banner 收集：客户提交内容只读查看 -->
          <div v-else-if="activeSubTab === 'banners'">
            <BannerCollectionPanel readonly />
          </div>

          <!-- 新闻：新闻列表 -->
          <div v-else-if="activeSubTab === 'news'" class="min-h-0">
            <NewsListPanel embedded />
          </div>

          <!-- 产品：产品列表 -->
          <div v-else-if="activeSubTab === 'product'" class="min-h-0">
            <ProductListPanel embedded />
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
/* 表格样式优化 */
:deep(.el-table__header) {
  background: var(--color-surface-hover);
}

:deep(.el-table__header th) {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  font-weight: 600;
  border-bottom: 2px solid var(--color-border);
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background: var(--color-primary-light);
}

:deep(.el-table__row:hover td) {
  background: var(--color-primary-light);
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

/* 拖拽排序 */
.page-drag-table :deep(tbody tr) {
  cursor: grab;
}

/* 抬起的那一行：半透明 + 轻微下沉阴影 */
.page-drag-table :deep(.el-table__row.is-dragging-row) {
  opacity: 0.45;
}

.page-drag-table :deep(.el-table__row.is-dragging-row td) {
  background: var(--color-primary-light) !important;
}

/* 插入线：贴在落点行的上边或下边，贯穿整行 */
.page-drag-table :deep(.el-table__row.is-drop-before td) {
  box-shadow: inset 0 2px 0 0 var(--color-primary);
}

.page-drag-table :deep(.el-table__row.is-drop-after td) {
  box-shadow: inset 0 -2px 0 0 var(--color-primary);
}

.drag-grip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 4px;
  border-radius: 4px;
  color: var(--color-text-muted);
  cursor: grab;
  touch-action: none;
  transition:
    color 0.16s cubic-bezier(0.22, 1, 0.36, 1),
    background-color 0.16s cubic-bezier(0.22, 1, 0.36, 1);
}

.drag-grip:hover {
  color: var(--color-primary);
  background: rgba(43, 124, 238, 0.08);
}
</style>
