<script setup>
import { computed, nextTick, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Collection,
  CopyDocument,
  Delete,
  EditPen,
  Plus,
  Refresh,
  Search,
  UploadFilled,
  Picture,
  Tickets,
  Check,
} from "@element-plus/icons-vue";
import PageContainer from "@/components/common/PageContainer.vue";
import PanelCard from "@/components/common/PanelCard.vue";
import StatCard from "@/components/common/StatCard.vue";
import ImageUploader from "@/components/common/ImageUploader.vue";

/**
 * 预设内容（静态演示页）
 * ------------------------------------------------------------------------
 * 目的：管理员维护一批「预设内容包」，每个包内含图片素材 + 文案素材，
 *      客户端按包 id 取用（例如首页首屏、产品宣传、活动促销等场景）。
 *
 * 说明：本页当前为静态演示，数据保存在本地状态（刷新即重置），
 *      接口对接点在 handleLoad / handleSave 两处，后续接入真实后端即可。
 * ------------------------------------------------------------------------
 */

/* ---------------- 静态演示数据 ---------------- */
const initialGroups = [
  {
    id: 1,
    name: "首页首屏",
    desc: "客户端首页顶部主视觉与标题，用于开场展示",
    enabled: true,
    images: [
      { url: "https://picsum.photos/seed/home1/640/400", name: "主视觉背景" },
      { url: "https://picsum.photos/seed/home2/640/400", name: "产品横幅" },
    ],
    texts: [
      { title: "品牌主张", content: "把复杂留给我们，把简单交给你" },
      { title: "副标题", content: "一站式素材服务，随取随用" },
    ],
  },
  {
    id: 2,
    name: "产品宣传",
    desc: "产品详情页的卖点图与文案，客户端按产品分类拉取",
    enabled: true,
    images: [
      { url: "https://picsum.photos/seed/pro1/640/400", name: "核心卖点图" },
    ],
    texts: [
      { title: "卖点一", content: "加载快，肉眼几乎无感知" },
      { title: "卖点二", content: "安全稳定，数据不出端" },
    ],
  },
  {
    id: 3,
    name: "活动促销",
    desc: "营销活动页的素材，客户端活动期间调用",
    enabled: false,
    images: [],
    texts: [
      { title: "活动口号", content: "限时特惠，先到先得" },
    ],
  },
];

/* ---------------- 状态 ---------------- */
const loadingList = ref(false);
const saving = ref(false);
const searching = ref(false);
const searchKeyword = ref("");
const presetGroups = ref(JSON.parse(JSON.stringify(initialGroups)));
const activeGroupId = ref(initialGroups[0]?.id ?? null);

// 抽屉：新增 / 编辑预设内容包
const editorVisible = ref(false);
const editorMode = ref("create"); // create | edit
const editorSaving = ref(false);
const editingId = ref(null);
const editorForm = reactive({
  name: "",
  desc: "",
  enabled: true,
});
const editorImages = ref([]); // 上传的图片文件
const editorTexts = ref([]); // [{title, content}]

// 文案编辑弹窗
const textDialogVisible = ref(false);
const textDialogMode = ref("create");
const textEditIndex = ref(-1);
const textForm = reactive({ title: "", content: "" });

// 图片预览
const previewVisible = ref(false);
const previewUrl = ref("");

/* ---------------- 计算 ---------------- */
const filteredGroups = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase();
  if (!kw) return presetGroups.value;
  return presetGroups.value.filter((g) =>
    (g.name.toLowerCase().includes(kw) || g.desc.toLowerCase().includes(kw))
  );
});

const activeGroup = computed(() =>
  presetGroups.value.find((g) => g.id === activeGroupId.value) || null
);

const totalImages = computed(() =>
  presetGroups.value.reduce((sum, g) => sum + (g.images?.length || 0), 0)
);
const totalTexts = computed(() =>
  presetGroups.value.reduce((sum, g) => sum + (g.texts?.length || 0), 0)
);
const enabledCount = computed(() =>
  presetGroups.value.filter((g) => g.enabled).length
);

/* ---------------- 操作 ---------------- */
// TODO: 接入真实后端时替换为接口调用
async function handleLoad() {
  loadingList.value = true;
  try {
    // const res = await getPresetGroups(); if (res?.code === 0) presetGroups.value = res.data
    await new Promise((r) => setTimeout(r, 200));
  } finally {
    loadingList.value = false;
  }
}

// TODO: 接入真实后端时替换为接口调用
async function handleSave() {
  saving.value = true;
  try {
    // const res = await savePresetGroups(presetGroups.value)
    await new Promise((r) => setTimeout(r, 300));
    ElMessage.success("保存成功（静态演示，刷新后恢复初始数据）");
  } finally {
    saving.value = false;
  }
}

function selectGroup(id) {
  activeGroupId.value = id;
}

function openCreateEditor() {
  editorMode.value = "create";
  editingId.value = null;
  editorForm.name = "";
  editorForm.desc = "";
  editorForm.enabled = true;
  editorImages.value = [];
  editorTexts.value = [];
  editorVisible.value = true;
}

function openEditEditor() {
  const g = activeGroup.value;
  if (!g) return;
  editorMode.value = "edit";
  editingId.value = g.id;
  editorForm.name = g.name;
  editorForm.desc = g.desc;
  editorForm.enabled = g.enabled;
  editorImages.value = [];
  editorTexts.value = JSON.parse(JSON.stringify(g.texts || []));
  editorVisible.value = true;
}

async function submitEditor() {
  const name = editorForm.name.trim();
  if (!name) {
    ElMessage.warning("请填写预设内容包名称");
    return;
  }

  editorSaving.value = true;
  try {
    // 静态演示：图片先以占位图形式落库；真实场景走上传接口拿到 url 后再写入
    const newImages = editorImages.value.map((f, i) => ({
      url: `https://picsum.photos/seed/new${Date.now()}-${i}/640/400`,
      name: f.name || `图片 ${i + 1}`,
    }));

    const payload = {
      id: editingId.value || Date.now(),
      name,
      desc: editorForm.desc.trim(),
      enabled: editorForm.enabled,
      images: newImages,
      texts: editorTexts.value.filter((t) => t.title.trim() || t.content.trim()),
    };

    if (editorMode.value === "create") {
      presetGroups.value.unshift(payload);
      activeGroupId.value = payload.id;
      ElMessage.success("预设内容包已创建");
    } else {
      const idx = presetGroups.value.findIndex((g) => g.id === editingId.value);
      if (idx > -1) {
        // 编辑时保留原有图片，合并本次新增
        payload.images = [...(presetGroups.value[idx].images || []), ...newImages];
        presetGroups.value[idx] = payload;
      }
      ElMessage.success("预设内容包已更新");
    }
    editorVisible.value = false;
  } finally {
    editorSaving.value = false;
  }
}

async function deleteGroup(g) {
  try {
    await ElMessageBox.confirm(
      `确认删除预设内容包「${g.name}」吗？其中的图片和文案会一并移除。`,
      "删除预设内容包",
      { type: "warning", confirmButtonText: "确认删除", cancelButtonText: "取消" }
    );
  } catch {
    return;
  }
  presetGroups.value = presetGroups.value.filter((x) => x.id !== g.id);
  if (activeGroupId.value === g.id) {
    activeGroupId.value = presetGroups.value[0]?.id ?? null;
  }
  ElMessage.success("已删除");
}

/* 图片素材 */
function openPreview(url) {
  previewUrl.value = url;
  previewVisible.value = true;
}

async function removeImage(index) {
  if (!activeGroup.value) return;
  activeGroup.value.images.splice(index, 1);
}

/* 文案素材 */
function openTextDialog(mode, index = -1) {
  textDialogMode.value = mode;
  textEditIndex.value = index;
  if (mode === "edit" && activeGroup.value?.texts?.[index]) {
    textForm.title = activeGroup.value.texts[index].title;
    textForm.content = activeGroup.value.texts[index].content;
  } else {
    textForm.title = "";
    textForm.content = "";
  }
  textDialogVisible.value = true;
}

function submitTextDialog() {
  const title = textForm.title.trim();
  const content = textForm.content.trim();
  if (!title && !content) {
    ElMessage.warning("标题和内容至少填一项");
    return;
  }
  const item = { title, content };
  if (!activeGroup.value) return;

  if (textDialogMode.value === "edit" && textEditIndex.value > -1) {
    activeGroup.value.texts[textEditIndex.value] = item;
  } else {
    activeGroup.value.texts.push(item);
  }
  textDialogVisible.value = false;
}

async function removeText(index) {
  if (!activeGroup.value) return;
  activeGroup.value.texts.splice(index, 1);
}

function handleRefresh() {
  presetGroups.value = JSON.parse(JSON.stringify(initialGroups));
  activeGroupId.value = initialGroups[0]?.id ?? null;
  ElMessage.info("已恢复初始演示数据");
}

// 静态演示：占位图仍可正常预览
function copyGroupId(g) {
  navigator.clipboard?.writeText(String(g.id)).then(() => {
    ElMessage.success(`已复制包 id：${g.id}`);
  }).catch(() => {
    ElMessage.info(`包 id：${g.id}`);
  });
}
</script>

<template>
  <PageContainer
    title="预设内容"
    subtitle="按场景维护图片与文案素材包，客户端按包 id 直接调用"
    :icon="Collection"
  >
    <template #actions>
      <el-button type="primary" plain :icon="Plus" @click="openCreateEditor">新增内容包</el-button>
      <el-button :icon="Refresh" @click="handleRefresh">恢复演示数据</el-button>
      <el-button type="primary" :icon="Check" :loading="saving" @click="handleSave">保存</el-button>
    </template>

    <!-- 统计卡片 -->
    <div class="preset-stats">
      <StatCard label="内容包" :value="presetGroups.length" accent="var(--color-primary)" :icon="Collection" hint="客户端按包调用" />
      <StatCard label="图片素材" :value="totalImages" accent="var(--color-success)" :icon="Picture" hint="随包下发" />
      <StatCard label="文案素材" :value="totalTexts" accent="var(--color-warning)" :icon="Tickets" hint="随包下发" />
      <StatCard label="启用中" :value="`${enabledCount} / ${presetGroups.length}`" accent="var(--color-info)" :icon="Check" hint="关闭则客户端不可见" />
    </div>

    <!-- 主体：左右分栏 -->
    <div class="preset-body">
      <!-- 左侧：内容包列表 -->
      <PanelCard title="预设内容包" subtitle="点击切换要编辑的素材包" flush>
        <template #actions>
          <el-tag effect="plain" type="info">{{ filteredGroups.length }}/{{ presetGroups.length }}</el-tag>
        </template>
        <div class="preset-side">
          <el-input
            v-model="searchKeyword"
            clearable
            placeholder="搜索内容包名称"
            class="preset-search"
            :prefix-icon="Search"
          />

          <div v-if="filteredGroups.length > 0" class="preset-list" v-loading="loadingList">
            <div
              v-for="g in filteredGroups"
              :key="g.id"
              class="preset-list__item"
              :class="{ 'is-active': g.id === activeGroupId }"
              @click="selectGroup(g.id)"
            >
              <div class="preset-list__main">
                <strong>{{ g.name }}</strong>
                <span class="preset-list__desc">{{ g.desc || "暂无描述" }}</span>
              </div>
              <div class="preset-list__meta">
                <span>{{ g.images?.length || 0 }} 图 · {{ g.texts?.length || 0 }} 文</span>
                <el-tag :type="g.enabled ? 'success' : 'info'" size="small" effect="plain">
                  {{ g.enabled ? "启用" : "停用" }}
                </el-tag>
              </div>
            </div>
          </div>
          <el-empty v-else :description="searchKeyword ? '没有匹配的内容包' : '暂时没有内容包'" :image-size="72" />
        </div>
      </PanelCard>

      <!-- 右侧：素材编辑区 -->
      <PanelCard flush>
        <template #header>
          <div class="preset-editor-head">
            <div class="preset-editor-title">
              <h3>{{ activeGroup?.name || "未选择内容包" }}</h3>
              <p>{{ activeGroup?.desc || "在左侧选择或新建一个内容包开始编辑" }}</p>
            </div>
            <div class="preset-editor-actions" v-if="activeGroup">
              <el-button size="small" :icon="CopyDocument" @click="copyGroupId(activeGroup)">复制包 id</el-button>
              <el-button size="small" :icon="EditPen" @click="openEditEditor">编辑信息</el-button>
              <el-button size="small" type="danger" plain :icon="Delete" @click="deleteGroup(activeGroup)">删除</el-button>
            </div>
          </div>
        </template>

        <div v-if="activeGroup" class="preset-editor">
          <!-- 图片素材 -->
          <section class="preset-section">
            <div class="preset-section__head">
              <div>
                <h4>图片素材</h4>
                <p>客户端按包取用这些图片（主视觉、卖点图、横幅等）</p>
              </div>
              <el-button size="small" :icon="Plus" @click="openEditEditor">添加图片</el-button>
            </div>

            <div v-if="activeGroup.images.length > 0" class="preset-images">
              <div v-for="(img, i) in activeGroup.images" :key="i" class="preset-images__item">
                <el-image
                  :src="img.url"
                  fit="cover"
                  class="preset-images__thumb"
                  :preview-src-list="[img.url]"
                  preview-teleported
                  @click="openPreview(img.url)"
                />
                <div class="preset-images__mask">
                  <span class="preset-images__name">{{ img.name }}</span>
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    circle
                    plain
                    @click.stop="removeImage(i)"
                  />
                </div>
              </div>
            </div>
            <el-empty v-else description="这个包还没有图片，点右上角「添加图片」上传" :image-size="64" />
          </section>

          <!-- 文案素材 -->
          <section class="preset-section">
            <div class="preset-section__head">
              <div>
                <h4>文案素材</h4>
                <p>标题 + 内容，客户端按包渲染对应文案</p>
              </div>
              <el-button size="small" :icon="Plus" @click="openTextDialog('create')">添加文案</el-button>
            </div>

            <div v-if="activeGroup.texts.length > 0" class="preset-texts">
              <div v-for="(t, i) in activeGroup.texts" :key="i" class="preset-texts__item">
                <div class="preset-texts__content">
                  <strong>{{ t.title || "（无标题）" }}</strong>
                  <p>{{ t.content }}</p>
                </div>
                <div class="preset-texts__ops">
                  <el-button type="primary" link size="small" :icon="EditPen" @click="openTextDialog('edit', i)">编辑</el-button>
                  <el-button type="danger" link size="small" :icon="Delete" @click="removeText(i)">删除</el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="这个包还没有文案，点右上角「添加文案」填写" :image-size="64" />
          </section>
        </div>

        <el-empty v-else description="请先在左侧选择或新建内容包" :image-size="92" />
      </PanelCard>
    </div>

    <!-- 新增/编辑内容包抽屉 -->
    <el-drawer v-model="editorVisible" :title="editorMode === 'create' ? '新增预设内容包' : '编辑预设内容包'" size="440px">
      <el-form label-position="top">
        <el-form-item label="内容包名称" required>
          <el-input v-model="editorForm.name" placeholder="例如：首页首屏" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editorForm.desc" type="textarea" :rows="2" placeholder="说明这个包用于哪个客户端场景" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="editorForm.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="图片素材">
          <ImageUploader v-model="editorImages" :limit="10" list-type="picture-card" />
        </el-form-item>
        <el-form-item label="文案素材">
          <div class="editor-texts" v-if="editorTexts.length > 0">
            <div v-for="(t, i) in editorTexts" :key="i" class="editor-texts__row">
              <span class="editor-texts__label">{{ t.title || "（无标题）" }}</span>
              <el-button type="danger" link size="small" :icon="Delete" @click="editorTexts.splice(i, 1)">移除</el-button>
            </div>
          </div>
          <el-button :icon="Plus" @click="editorTexts.push({ title: '', content: '' })">新增文案行</el-button>
          <div v-for="(t, i) in editorTexts" :key="'form-' + i" class="editor-texts__form">
            <el-input v-model="t.title" placeholder="文案标题（如：品牌主张）" class="mb-2" />
            <el-input v-model="t.content" type="textarea" :rows="2" placeholder="文案内容" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="editor-footer">
          <el-button @click="editorVisible = false">取消</el-button>
          <el-button type="primary" :loading="editorSaving" @click="submitEditor">保存</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 文案编辑弹窗 -->
    <el-dialog
      v-model="textDialogVisible"
      :title="textDialogMode === 'edit' ? '编辑文案' : '新增文案'"
      width="520px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="textForm.title" placeholder="文案标题（如：品牌主张）" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="textForm.content" type="textarea" :rows="4" placeholder="文案内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="editor-footer">
          <el-button @click="textDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTextDialog">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" align-center class="preset-preview">
      <img v-if="previewUrl" :src="previewUrl" class="preset-preview__img" />
    </el-dialog>
  </PageContainer>
</template>

<style scoped>
.preset-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.preset-body {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 20px;
  min-height: 0;
  flex: 1;
}

/* 左侧列表 */
.preset-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  height: 100%;
  min-height: 0;
}
.preset-search {
  flex-shrink: 0;
}
.preset-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  min-height: 0;
  padding-right: 2px;
}
.preset-list__item {
  width: 100%;
  text-align: left;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s ease;
}
.preset-list__item:hover,
.preset-list__item.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  box-shadow: 0 4px 12px rgba(43, 124, 238, 0.12);
}
.preset-list__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.preset-list__main strong {
  color: var(--color-text-primary);
  font-size: 14px;
}
.preset-list__desc {
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.preset-list__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}
.preset-list__meta > span {
  color: var(--color-text-muted);
  font-size: 12px;
}

/* 右侧编辑区 */
.preset-editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-surface-hover);
}
.preset-editor-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.preset-editor-title p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}
.preset-editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-editor {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  overflow-y: auto;
  min-height: 0;
}
.preset-section__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.preset-section__head h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.preset-section__head p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 图片网格 */
.preset-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}
.preset-images__item {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}
.preset-images__thumb {
  width: 100%;
  height: 100%;
  display: block;
}
.preset-images__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}
.preset-images__item:hover .preset-images__mask {
  opacity: 1;
}
.preset-images__name {
  color: #fff;
  font-size: 12px;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 文案列表 */
.preset-texts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.preset-texts__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  background: var(--color-surface);
}
.preset-texts__content strong {
  color: var(--color-text-primary);
  font-size: 14px;
}
.preset-texts__content p {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
.preset-texts__ops {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 抽屉内文案 */
.editor-texts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
}
.editor-texts__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--color-surface-hover);
}
.editor-texts__label {
  color: var(--color-text-secondary);
  font-size: 13px;
}
.editor-texts__form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 预览 */
.preset-preview__img {
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

@media (max-width: 1280px) {
  .preset-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 1100px) {
  .preset-body {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .preset-stats {
    grid-template-columns: 1fr;
  }
}
</style>
