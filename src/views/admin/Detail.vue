<template>
  <div class="w-full h-full min-h-full bg-gray-50 dark:bg-gray-800 flex flex-col overflow-hidden">
    <!-- 页面头部 -->
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-600 px-6 py-4 flex-shrink-0">
      <div class="flex justify-between items-center w-full">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <el-icon class="text-blue-500 text-2xl"><UserFilled /></el-icon>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">客户详情</h1>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <a 
              href="#" 
              @click.prevent="router.push({ name: 'AdminList' })"
              class="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <el-icon><House /></el-icon>
              站点管理
            </a>
            <el-icon class="text-gray-400 dark:text-gray-500"><ArrowRight /></el-icon>
            <span class="text-gray-700 dark:text-gray-300 font-medium">{{ displayCustomerTitle }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <el-button 
            :icon="ArrowLeft"
            @click="router.push({ name: 'AdminList' })"
          >
            返回
          </el-button>
          <el-button
            v-if="activeSubTab !== 'pages'"
            type="primary"
            :icon="Check"
            @click="handleSave"
            size="large"
          >
            保存更改
          </el-button>
          <el-tooltip
            v-else
            content="页面权限通过右侧开关即时保存，无需点击保存"
            placement="bottom"
          >
            <el-button type="primary" :icon="Check" size="large" disabled>
              页面权限已即时保存
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="flex-1 overflow-auto min-h-0">
      <div class="p-6 space-y-6">
        <!-- 客户信息卡片 -->
        <div class="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <el-icon class="text-blue-500"><InfoFilled /></el-icon>
            客户信息
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon><User /></el-icon>
                <span>客户名称</span>
              </div>
              <p class="text-gray-900 dark:text-white text-base font-medium">
                {{ displayCustomerName }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon><Key /></el-icon>
                <span>客户ID</span>
              </div>
              <p class="text-gray-900 dark:text-white text-base font-medium font-mono">
                {{ displayCustomerUserId }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon><CircleCheck /></el-icon>
                <span>账户状态</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="customerAccountStatus !== 'unbound'"
                  :class="[
                    'w-2.5 h-2.5 rounded-full',
                    customerAccountStatus === 'active' ? 'bg-green-500' : 'bg-red-500',
                  ]"
                ></span>
                <el-tag
                  v-if="customerAccountStatus === 'unbound'"
                  type="info"
                  size="small"
                  effect="plain"
                  round
                >
                  未绑定客户账号
                </el-tag>
                <el-tag
                  v-else
                  :type="customerAccountStatus === 'active' ? 'success' : 'danger'"
                  size="small"
                  effect="dark"
                  round
                >
                  {{ customerAccountStatus === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <el-icon><Calendar /></el-icon>
                <span>到期时间</span>
              </div>
              <p class="text-gray-900 dark:text-white text-base font-medium">
                {{ displayExpireAt }}
              </p>
            </div>
          </div>
        </div>

        <!-- 页面 / 站点 / 内容 Tab 区域 -->
        <div class="flex flex-col">
          <div class="border-b border-gray-200 dark:border-gray-600 mb-6">
            <nav class="flex space-x-8">
              <!-- 站点信息 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2"
                :class="activeSubTab === 'site' 
                  ? 'border-blue-500 text-blue-500 font-semibold' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-colors'"
                @click="activeSubTab = 'site'"
              >
                <el-icon :class="activeSubTab === 'site' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'">
                  <InfoFilled />
                </el-icon>
                <span class="text-base">站点信息</span>
              </button>
              <!-- 页面设置 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2"
                :class="activeSubTab === 'pages' 
                  ? 'border-blue-500 text-blue-500 font-semibold' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-colors'"
                @click="activeSubTab = 'pages'"
              >
                <el-icon :class="activeSubTab === 'pages' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'">
                  <Document />
                </el-icon>
                <span class="text-base">页面设置</span>
              </button>
              <!-- 新闻 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2"
                :class="activeSubTab === 'news' 
                  ? 'border-blue-500 text-blue-500 font-semibold' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-colors'"
                @click="activeSubTab = 'news'"
              >
                <el-icon :class="activeSubTab === 'news' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'">
                  <Document />
                </el-icon>
                <span class="text-base">新闻</span>
              </button>
              <!-- 产品 Tab -->
              <button
                type="button"
                class="flex items-center gap-2 px-1 pb-4 border-b-2"
                :class="activeSubTab === 'product' 
                  ? 'border-blue-500 text-blue-500 font-semibold' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:border-blue-400 transition-colors'"
                @click="activeSubTab = 'product'"
              >
                <el-icon :class="activeSubTab === 'product' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'">
                  <Box />
                </el-icon>
                <span class="text-base">产品</span>
              </button>
            </nav>
          </div>

          <!-- 页面设置：页面列表表格（页面授权 POST /api/user/set_page_permission） -->
          <div
            v-if="activeSubTab === 'pages'"
            class="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden"
          >
            <el-alert
              v-if="!pagesPermissionBootstrapping && customerUserId == null"
              type="warning"
              class="m-4 mb-0"
              show-icon
              :closable="false"
              title="未找到绑定当前站点的客户账号"
              description="请先在「用户管理」中为该客户绑定本站点后，再在此处设置页面访问权限。"
            />
            <div class="overflow-x-auto p-4 pt-4">
              <el-table
                v-loading="pagesPermissionBootstrapping"
                :data="pageList"
                :stripe="true"
                :highlight-current-row="true"
                class="w-full"
                empty-text="暂无页面数据"
              >
                <el-table-column prop="ID" label="ID" width="180">
                  <template #default="scope">
                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ scope.row.ID }}</span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="post_name" label="页面名称" min-width="200">
                  <template #default="scope">
                    <div class="flex items-center gap-2">
                      <el-icon class="text-blue-500"><Document /></el-icon>
                      <span class="font-medium text-gray-900 dark:text-white">{{ scope.row.post_name || '-' }}</span>
                    </div>
                  </template>
                </el-table-column>
                
                <el-table-column label="授权状态" width="120" align="center">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.allow ? 'success' : 'danger'"
                      size="small"
                      effect="dark"
                      round
                    >
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
                      <el-button 
                        type="primary" 
                        size="small"
                        :icon="Edit"
                        @click="edit(scope.row)"
                      >
                        编辑
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 站点信息：复用 SiteInfoPanel -->
          <div v-else-if="activeSubTab === 'site'">
            <SiteInfoPanel />
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
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { getPages, getUserList, getPagePermissions, setPagePermission } from "@/apis/index.js";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import SiteInfoPanel from "@/components/SiteInfoPanel.vue";
import NewsListPanel from "@/components/NewsListPanel.vue";
import ProductListPanel from "@/components/ProductListPanel.vue";
import { useGlobalStore } from "@/stores/global.js";
import {
  UserFilled, ArrowLeft, ArrowRight, Check, House,
  InfoFilled, User, Key, CircleCheck, CircleClose,
  Calendar, Document, Edit, Box
} from '@element-plus/icons-vue';

const { user } = useGlobalStore();

// 二级 Tab：site / pages / news / product（页面返回时恢复上次 tab，避免总跳回页面设置）
const activeSubTab = ref(sessionStorage.getItem("detail_activeSubTab") || "pages");

watch(activeSubTab, (val) => {
  sessionStorage.setItem("detail_activeSubTab", val);
});

let pageList = reactive([]);
const router = useRouter();

const { websiteInfo } = useGlobalStore();

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
    users.find(
      (u) =>
        Array.isArray(u.site_ids) &&
        u.site_ids.some((sid) => String(sid) === String(siteId))
    ) || null
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
    const [pagesRes, listRes] = await Promise.all([
      getPages(siteId),
      getUserList(),
    ]);

    const users = listRes.code === 0 && Array.isArray(listRes.data) ? listRes.data : [];
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
    } else {
      ElMessage.error(res.message || "设置失败");
    }
  } catch (e) {
    ElMessage.error("设置失败：" + (e?.message || "网络错误"));
  } finally {
    permissionRowLoading[pageId] = false;
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

<style scoped>
/* 表格样式优化 */
:deep(.el-table__header) {
  background: #f9fafb;
}

:deep(.el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

:deep(.el-table__row) {
  transition: all 0.2s;
}

:deep(.el-table__row:hover) {
  background: #f0f9ff;
}

:deep(.el-table__row:hover td) {
  background: #f0f9ff;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

/* 暗色模式表格 */
@media (prefers-color-scheme: dark) {
  :deep(.el-table__header) {
    background: #4b5563;
  }
  
  :deep(.el-table__header th) {
    background: #4b5563;
    color: #f9fafb;
    border-bottom-color: #6b7280;
  }
}
</style>
