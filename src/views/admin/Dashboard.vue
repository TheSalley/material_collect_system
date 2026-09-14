<script setup>
import { ref, onMounted } from "vue";
import { Calendar, TrendCharts } from "@element-plus/icons-vue";
import StatCard from "@/components/common/StatCard.vue";
import PanelCard from "@/components/common/PanelCard.vue";
import { getHolidayCountdown } from "@/apis/holiday.js";

const summary = {
  dateLabel: "2026-07-22 Wed",
  syncRate: "96.4%",
};

// 节假日倒计时
const holidayList = ref([]);
const holidayLoading = ref(false);

async function fetchHolidays() {
  holidayLoading.value = true;
  try {
    const res = await getHolidayCountdown();
    if (res.success) {
      holidayList.value = res.data || [];
    }
  } finally {
    holidayLoading.value = false;
  }
}

onMounted(() => {
  fetchHolidays();
});

const metricCards = [
  {
    label: "站点总数",
    value: "128",
    trend: "+12.6%",
    trendDirection: "up",
    hint: "过去 30 天新增 14 个站点",
    accent: "var(--color-success)",
  },
  {
    label: "待处理页面",
    value: "43",
    trend: "-8.1%",
    trendDirection: "down",
    hint: "比上周少 4 页，积压正在下降",
    accent: "var(--color-warning)",
  },
  {
    label: "已同步截图",
    value: "1,286",
    trend: "+18.3%",
    trendDirection: "up",
    hint: "今天已完成 173 次截图同步",
    accent: "var(--color-primary)",
  },
  {
    label: "尺寸保存率",
    value: "84%",
    trend: "+5.4%",
    trendDirection: "up",
    hint: "仍有 26 个板块未补齐建议尺寸",
    accent: "var(--color-info)",
  },
];

const weeklyTrend = [
  { day: "Thu", total: 82, pageSaveHeight: 52, screenshotHeight: 64, sizeHeight: 40 },
  { day: "Fri", total: 96, pageSaveHeight: 70, screenshotHeight: 78, sizeHeight: 48 },
  { day: "Sat", total: 61, pageSaveHeight: 34, screenshotHeight: 42, sizeHeight: 26 },
  { day: "Sun", total: 58, pageSaveHeight: 28, screenshotHeight: 36, sizeHeight: 24 },
  { day: "Mon", total: 118, pageSaveHeight: 86, screenshotHeight: 92, sizeHeight: 74 },
  { day: "Tue", total: 127, pageSaveHeight: 94, screenshotHeight: 100, sizeHeight: 80 },
  { day: "Wed", total: 109, pageSaveHeight: 76, screenshotHeight: 89, sizeHeight: 71 },
];

const sourceShare = [
  { label: "媒体库选图", value: "41%", percent: "41%", color: "linear-gradient(90deg, var(--color-success), #5eead4)" },
  { label: "本地上传", value: "28%", percent: "28%", color: "linear-gradient(90deg, var(--color-primary), #7dd3fc)" },
  { label: "Demo 继承", value: "19%", percent: "19%", color: "linear-gradient(90deg, var(--color-info), #a5f3fc)" },
  { label: "客户补传", value: "12%", percent: "12%", color: "linear-gradient(90deg, var(--color-warning), #fcd34d)" },
];

const siteProgress = [
  {
    site: "GLOHE Lighting",
    owner: "责任人：Mia",
    stage: "收尾联调",
    tagType: "success",
    progress: 92,
    detail: "剩余 3 个板块待确认最终尺寸",
    color: "var(--color-success)",
  },
  {
    site: "Nordic Build",
    owner: "责任人：Alex",
    stage: "截图整理",
    tagType: "primary",
    progress: 71,
    detail: "首页和案例页截图已完成",
    color: "var(--color-primary)",
  },
  {
    site: "Solara Kitchen",
    owner: "责任人：Emma",
    stage: "内容翻译",
    tagType: "warning",
    progress: 48,
    detail: "法语稿已回填，俄语仍待审核",
    color: "var(--color-warning)",
  },
  {
    site: "Urban Peak",
    owner: "责任人：Liam",
    stage: "等待客户",
    tagType: "info",
    progress: 35,
    detail: "客户尚未补齐产品主图",
    color: "var(--color-text-muted)",
  },
];

const activities = [
  {
    time: "09:15",
    title: "GLOHE Lighting 已完成 Demo 尺寸回填",
    desc: "首页 Hero、产品矩阵和 CTA 区块的建议尺寸已批量获取。",
  },
  {
    time: "10:40",
    title: "Nordic Build 新增 26 张媒体库素材",
    desc: "主要来自案例页和 About 页面，等待运营确认是否同步到 Demo。",
  },
  {
    time: "13:20",
    title: "Solara Kitchen 翻译任务进入审核",
    desc: "法语内容已同步，俄语版本预计今天晚些时候提交。",
  },
  {
    time: "16:05",
    title: "Urban Peak 客户退回 2 张产品图",
    desc: "原因是分辨率不足，当前项目自动转入待补传状态。",
  },
];
</script>

<template>
  <div class="dashboard-page">
    <!-- Hero 区域：保留自定义深色渐变设计 -->
    <header class="dashboard-hero">
      <div>
        <p class="dashboard-eyebrow">Admin Dashboard</p>
        <h1 class="dashboard-title">素材协作看板</h1>
        <p class="dashboard-subtitle">
          这里先使用静态演示数据，方便页面联调和布局确认。后续可以把各板块替换成真实接口。
        </p>
      </div>

      <div class="dashboard-hero__meta">
        <div class="dashboard-badge">
          <el-icon><Calendar /></el-icon>
          <span>{{ summary.dateLabel }}</span>
        </div>
        <div class="dashboard-badge dashboard-badge--success">
          <el-icon><TrendCharts /></el-icon>
          <span>今日同步成功率 {{ summary.syncRate }}</span>
        </div>
      </div>
    </header>

    <!-- 统计卡片：接入 StatCard 公共组件 -->
    <section class="metric-grid">
      <StatCard
        v-for="item in metricCards"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :hint="item.hint"
        :accent="item.accent"
      >
        <template #actions>
          <span class="metric-trend" :class="{ 'is-down': item.trendDirection === 'down' }">
            {{ item.trend }}
          </span>
        </template>
      </StatCard>
    </section>

    <!-- 主内容区：接入 PanelCard 公共组件 -->
    <section class="dashboard-main">
      <PanelCard class="panel--wide">
        <template #header>
          <div>
            <h2 class="panel__title">近 7 日交付节奏</h2>
            <p class="panel__desc">按天展示页面保存量、截图同步量和尺寸回填量。</p>
          </div>
          <div class="panel__legend">
            <span><i class="legend-dot legend-dot--primary"></i>页面保存</span>
            <span><i class="legend-dot legend-dot--info"></i>截图同步</span>
            <span><i class="legend-dot legend-dot--warning"></i>尺寸回填</span>
          </div>
        </template>

        <div class="trend-chart">
          <div v-for="item in weeklyTrend" :key="item.day" class="trend-chart__group">
            <div class="trend-chart__bars">
              <div class="trend-chart__track">
                <div class="trend-chart__bar trend-chart__bar--primary" :style="{ height: `${item.pageSaveHeight}%` }"></div>
              </div>
              <div class="trend-chart__track">
                <div class="trend-chart__bar trend-chart__bar--info" :style="{ height: `${item.screenshotHeight}%` }"></div>
              </div>
              <div class="trend-chart__track">
                <div class="trend-chart__bar trend-chart__bar--warning" :style="{ height: `${item.sizeHeight}%` }"></div>
              </div>
            </div>
            <div class="trend-chart__footer">
              <strong>{{ item.total }}</strong>
              <span>{{ item.day }}</span>
            </div>
          </div>
        </div>
      </PanelCard>

      <PanelCard>
        <template #header>
          <div>
            <h2 class="panel__title">流量来源占比</h2>
            <p class="panel__desc">演示素材来源和当前工作量分布。</p>
          </div>
        </template>

        <div class="source-list">
          <div v-for="item in sourceShare" :key="item.label" class="source-item">
            <div class="source-item__meta">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div class="source-item__progress">
              <div class="source-item__progress-bar" :style="{ width: item.percent, background: item.color }"></div>
            </div>
          </div>
        </div>

        <div class="quality-card">
          <span class="quality-card__label">站点健康度</span>
          <strong class="quality-card__value">92 / 100</strong>
          <p class="quality-card__hint">
            演示数据中，主要风险集中在尺寸未保存和待补截图页面。
          </p>
        </div>
      </PanelCard>

      <PanelCard>
        <template #header>
          <div>
            <h2 class="panel__title">站点推进列表</h2>
            <p class="panel__desc">用于模拟客户站点的当前制作状态。</p>
          </div>
        </template>

        <div class="site-list">
          <div v-for="item in siteProgress" :key="item.site" class="site-row">
            <div class="site-row__top">
              <div>
                <strong>{{ item.site }}</strong>
                <span>{{ item.owner }}</span>
              </div>
              <el-tag :type="item.tagType" effect="plain" round>{{ item.stage }}</el-tag>
            </div>
            <div class="site-row__bottom">
              <el-progress :percentage="item.progress" :stroke-width="10" :show-text="false" :color="item.color" />
              <div class="site-row__foot">
                <span>{{ item.progress }}%</span>
                <span>{{ item.detail }}</span>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>

      <PanelCard>
        <template #header>
          <div>
            <h2 class="panel__title">最近动态</h2>
            <p class="panel__desc">这里是给看板预留的事件流区域。</p>
          </div>
        </template>

        <div class="activity-list">
          <div v-for="item in activities" :key="`${item.time}-${item.title}`" class="activity-item">
            <div class="activity-item__dot"></div>
            <div class="activity-item__content">
              <div class="activity-item__head">
                <strong>{{ item.title }}</strong>
                <span>{{ item.time }}</span>
              </div>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </PanelCard>

      <PanelCard>
        <template #header>
          <div>
            <h2 class="panel__title">节假日倒计时</h2>
            <p class="panel__desc">即将到来的节假日和节气</p>
          </div>
        </template>

        <div class="holiday-list" v-loading="holidayLoading">
          <div v-for="item in holidayList" :key="item.name" class="holiday-item">
            <div class="holiday-item__info">
              <strong>{{ item.name }}</strong>
              <span>{{ item.date }}</span>
            </div>
            <el-tag type="primary" effect="plain" round>{{ item.days }}</el-tag>
          </div>
          <div v-if="!holidayLoading && holidayList.length === 0" class="holiday-empty">
            暂无节假日数据
          </div>
        </div>
      </PanelCard>
    </section>
  </div>
</template>

<style scoped>
.dashboard-page {
  width: 100%;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(16, 185, 129, 0.1), transparent 28%),
    radial-gradient(circle at top right, rgba(43, 124, 238, 0.1), transparent 24%),
    linear-gradient(180deg, var(--color-background-light) 0%, #eef4f7 100%);
  overflow-y: auto;
  overflow-x: hidden;
}

/* Hero 区域：保留自定义深色渐变设计 */
.dashboard-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 24px;
  padding: 28px 32px;
  border-radius: var(--radius-card);
  background: linear-gradient(135deg, #07253a 0%, #0f3d5e 58%, #155d74 100%);
  color: var(--color-text-inverse);
  box-shadow: 0 24px 60px rgba(10, 37, 58, 0.18);
}

.dashboard-eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(226, 244, 255, 0.72);
}

.dashboard-title {
  margin: 0;
  font-size: 34px;
  line-height: 1.1;
  font-weight: 800;
}

.dashboard-subtitle {
  margin: 14px 0 0;
  max-width: 620px;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(232, 245, 255, 0.8);
}

.dashboard-hero__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

.dashboard-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-badge);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  font-size: 13px;
  color: var(--color-text-inverse);
}

.dashboard-badge--success {
  background: rgba(16, 185, 129, 0.16);
}

/* 统计卡片趋势标签 */
.metric-trend {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-success);
}

.metric-trend.is-down {
  color: var(--color-danger);
}

/* 主内容网格 */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 20px;
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.9fr);
  gap: 18px;
  margin-top: 20px;
}

.panel--wide {
  align-self: start;
}

.panel__title {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-primary);
}

.panel__desc {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.panel__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: var(--radius-badge);
}

.legend-dot--primary {
  background: var(--color-primary);
}

.legend-dot--info {
  background: var(--color-info);
}

.legend-dot--warning {
  background: var(--color-warning);
}

/* 柱状图 */
.trend-chart {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 14px;
  align-items: end;
  margin-top: 28px;
  min-height: 300px;
}

.trend-chart__group {
  display: flex;
  flex-direction: column;
  justify-content: end;
  height: 100%;
}

.trend-chart__bars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  align-items: end;
  height: 240px;
}

.trend-chart__track {
  display: flex;
  align-items: end;
  height: 100%;
  border-radius: var(--radius-badge);
  background: linear-gradient(180deg, rgba(226, 232, 240, 0.22), rgba(226, 232, 240, 0.65));
  overflow: hidden;
}

.trend-chart__bar {
  width: 100%;
  border-radius: var(--radius-badge);
  min-height: 10px;
}

.trend-chart__bar--primary {
  background: linear-gradient(180deg, #6ba5f3 0%, var(--color-primary) 100%);
}

.trend-chart__bar--info {
  background: linear-gradient(180deg, #67e8f9 0%, var(--color-info) 100%);
}

.trend-chart__bar--warning {
  background: linear-gradient(180deg, #fcd34d 0%, var(--color-warning) 100%);
}

.trend-chart__footer {
  margin-top: 14px;
  text-align: center;
}

.trend-chart__footer strong {
  display: block;
  font-size: 18px;
  color: var(--color-text-primary);
}

.trend-chart__footer span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 流量来源 */
.source-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.source-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.source-item__meta strong {
  color: var(--color-text-primary);
}

.source-item__progress {
  height: 10px;
  border-radius: var(--radius-badge);
  overflow: hidden;
  background: var(--color-border-light);
}

.source-item__progress-bar {
  height: 100%;
  border-radius: inherit;
}

/* 健康度卡片 */
.quality-card {
  margin-top: 26px;
  padding: 20px;
  border-radius: var(--radius-card);
  background: linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-primary-light) 100%);
}

.quality-card__label {
  display: block;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.quality-card__value {
  display: block;
  margin-top: 12px;
  font-size: 30px;
  color: var(--color-text-primary);
}

.quality-card__hint {
  margin: 10px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

/* 站点推进列表 */
.site-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.site-row {
  padding: 18px;
  border-radius: var(--radius-field);
  background: var(--color-surface-hover);
}

.site-row__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.site-row__top strong {
  display: block;
  color: var(--color-text-primary);
  font-size: 15px;
}

.site-row__top span {
  display: block;
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.site-row__bottom {
  margin-top: 14px;
}

.site-row__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: 12px;
}

/* 最近动态 */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 24px;
}

.activity-item {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  gap: 12px;
}

.activity-item__dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: var(--radius-badge);
  background: linear-gradient(135deg, var(--color-primary), var(--color-success));
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.activity-item__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.activity-item__head strong {
  color: var(--color-text-primary);
  font-size: 14px;
}

.activity-item__head span {
  color: var(--color-text-muted);
  font-size: 12px;
  white-space: nowrap;
}

.activity-item__content p {
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.7;
}

/* 响应式 */
@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-hero {
    flex-direction: column;
    padding: 22px;
  }

  .dashboard-title {
    font-size: 28px;
  }

  .dashboard-hero__meta {
    justify-content: flex-start;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .trend-chart {
    gap: 8px;
    min-height: 260px;
  }

  .trend-chart__bars {
    gap: 5px;
    height: 190px;
  }
}
/* 节假日倒计时 */
.holiday-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.holiday-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.holiday-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(43, 124, 238, 0.1);
}

.holiday-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.holiday-item__info strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.holiday-item__info span {
  font-size: 12px;
  color: var(--color-text-muted);
}

.holiday-empty {
  text-align: center;
  padding: 24px;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
