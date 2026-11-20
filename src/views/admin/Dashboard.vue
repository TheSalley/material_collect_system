<script setup>
import { Calendar, TrendCharts, Grid } from "@element-plus/icons-vue";
import StatCard from "@/components/common/StatCard.vue";
import PanelCard from "@/components/common/PanelCard.vue";
import PageContainer from "@/components/common/PageContainer.vue";

const summary = {
  dateLabel: "2026-07-22 Wed",
  syncRate: "96.4%",
};

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
  <PageContainer title="面板" subtitle="站点进度、截图同步与尺寸回填概览" :icon="Grid" class="dashboard-container">
    <template #actions>
      <div class="dashboard-badge">
        <el-icon><Calendar /></el-icon>
        <span>{{ summary.dateLabel }}</span>
      </div>
      <div class="dashboard-badge dashboard-badge--success">
        <el-icon><TrendCharts /></el-icon>
        <span>今日同步成功率 {{ summary.syncRate }}</span>
      </div>
    </template>

    <div class="dashboard-scroll pretty-scroll">
      <!-- 统计卡片：接入 StatCard 公共组件 -->
      <section class="metric-grid">
        <StatCard v-for="item in metricCards" :key="item.label" :label="item.label" :value="item.value" :hint="item.hint" :accent="item.accent">
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
      </section>
    </div>
  </PageContainer>
</template>

<style scoped>
.dashboard-container {
  min-height: 0;
  overflow: hidden;
}

/* 顶部操作区徽章：与全局浅色工具栏保持一致 */
.dashboard-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--radius-field);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 12px;
  line-height: 1;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.dashboard-badge .el-icon {
  font-size: 13px;
  color: var(--color-primary);
}

.dashboard-badge--success {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.dashboard-badge--success .el-icon {
  color: var(--color-success);
}

/* 内容滚动区：视口内滚动，与其他 admin 页面一致 */
.dashboard-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
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
  gap: 16px;
  margin-top: 16px;
}

.dashboard-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 16px;
  align-items: start;
}

.panel--wide {
  align-self: start;
}

.panel__title {
  margin: 0;
  font-size: 17px;
  color: var(--color-text-primary);
}

.panel__desc {
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
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
</style>
