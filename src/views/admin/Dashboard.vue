<template>
  <section class="dashboard-page">
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

    <section class="metric-grid">
      <article
        v-for="item in metricCards"
        :key="item.label"
        class="metric-card"
        :style="{ '--metric-accent': item.accent }"
      >
        <div class="metric-card__head">
          <span class="metric-card__label">{{ item.label }}</span>
          <span class="metric-card__trend" :class="{ 'is-down': item.trendDirection === 'down' }">
            {{ item.trend }}
          </span>
        </div>
        <strong class="metric-card__value">{{ item.value }}</strong>
        <p class="metric-card__hint">{{ item.hint }}</p>
      </article>
    </section>

    <section class="dashboard-main">
      <article class="panel panel--wide">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">近 7 日交付节奏</h2>
            <p class="panel__desc">按天展示页面保存量、截图同步量和尺寸回填量。</p>
          </div>
          <div class="panel__legend">
            <span><i class="legend-dot legend-dot--navy"></i>页面保存</span>
            <span><i class="legend-dot legend-dot--cyan"></i>截图同步</span>
            <span><i class="legend-dot legend-dot--gold"></i>尺寸回填</span>
          </div>
        </div>

        <div class="trend-chart">
          <div
            v-for="item in weeklyTrend"
            :key="item.day"
            class="trend-chart__group"
          >
            <div class="trend-chart__bars">
              <div class="trend-chart__track">
                <div
                  class="trend-chart__bar trend-chart__bar--navy"
                  :style="{ height: `${item.pageSaveHeight}%` }"
                ></div>
              </div>
              <div class="trend-chart__track">
                <div
                  class="trend-chart__bar trend-chart__bar--cyan"
                  :style="{ height: `${item.screenshotHeight}%` }"
                ></div>
              </div>
              <div class="trend-chart__track">
                <div
                  class="trend-chart__bar trend-chart__bar--gold"
                  :style="{ height: `${item.sizeHeight}%` }"
                ></div>
              </div>
            </div>
            <div class="trend-chart__footer">
              <strong>{{ item.total }}</strong>
              <span>{{ item.day }}</span>
            </div>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">流量来源占比</h2>
            <p class="panel__desc">演示素材来源和当前工作量分布。</p>
          </div>
        </div>

        <div class="source-list">
          <div
            v-for="item in sourceShare"
            :key="item.label"
            class="source-item"
          >
            <div class="source-item__meta">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div class="source-item__progress">
              <div
                class="source-item__progress-bar"
                :style="{ width: item.percent, background: item.color }"
              ></div>
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
      </article>

      <article class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">站点推进列表</h2>
            <p class="panel__desc">用于模拟客户站点的当前制作状态。</p>
          </div>
        </div>

        <div class="site-list">
          <div
            v-for="item in siteProgress"
            :key="item.site"
            class="site-row"
          >
            <div class="site-row__top">
              <div>
                <strong>{{ item.site }}</strong>
                <span>{{ item.owner }}</span>
              </div>
              <el-tag :type="item.tagType" effect="plain" round>
                {{ item.stage }}
              </el-tag>
            </div>
            <div class="site-row__bottom">
              <el-progress
                :percentage="item.progress"
                :stroke-width="10"
                :show-text="false"
                :color="item.color"
              />
              <div class="site-row__foot">
                <span>{{ item.progress }}%</span>
                <span>{{ item.detail }}</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel__head">
          <div>
            <h2 class="panel__title">最近动态</h2>
            <p class="panel__desc">这里是给看板预留的事件流区域。</p>
          </div>
        </div>

        <div class="activity-list">
          <div
            v-for="item in activities"
            :key="`${item.time}-${item.title}`"
            class="activity-item"
          >
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
      </article>
    </section>
  </section>
</template>

<script setup>
import { Calendar, TrendCharts } from "@element-plus/icons-vue";

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
    accent: "#0f766e",
  },
  {
    label: "待处理页面",
    value: "43",
    trend: "-8.1%",
    trendDirection: "down",
    hint: "比上周少 4 页，积压正在下降",
    accent: "#f59e0b",
  },
  {
    label: "已同步截图",
    value: "1,286",
    trend: "+18.3%",
    trendDirection: "up",
    hint: "今天已完成 173 次截图同步",
    accent: "#2563eb",
  },
  {
    label: "尺寸保存率",
    value: "84%",
    trend: "+5.4%",
    trendDirection: "up",
    hint: "仍有 26 个板块未补齐建议尺寸",
    accent: "#7c3aed",
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
  { label: "媒体库选图", value: "41%", percent: "41%", color: "linear-gradient(90deg, #0f766e, #14b8a6)" },
  { label: "本地上传", value: "28%", percent: "28%", color: "linear-gradient(90deg, #2563eb, #38bdf8)" },
  { label: "Demo 继承", value: "19%", percent: "19%", color: "linear-gradient(90deg, #7c3aed, #c084fc)" },
  { label: "客户补传", value: "12%", percent: "12%", color: "linear-gradient(90deg, #d97706, #fbbf24)" },
];

const siteProgress = [
  {
    site: "GLOHE Lighting",
    owner: "责任人：Mia",
    stage: "收尾联调",
    tagType: "success",
    progress: 92,
    detail: "剩余 3 个板块待确认最终尺寸",
    color: "#10b981",
  },
  {
    site: "Nordic Build",
    owner: "责任人：Alex",
    stage: "截图整理",
    tagType: "primary",
    progress: 71,
    detail: "首页和案例页截图已完成",
    color: "#3b82f6",
  },
  {
    site: "Solara Kitchen",
    owner: "责任人：Emma",
    stage: "内容翻译",
    tagType: "warning",
    progress: 48,
    detail: "法语稿已回填，俄语仍待审核",
    color: "#f59e0b",
  },
  {
    site: "Urban Peak",
    owner: "责任人：Liam",
    stage: "等待客户",
    tagType: "info",
    progress: 35,
    detail: "客户尚未补齐产品主图",
    color: "#94a3b8",
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

<style scoped>
.dashboard-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: 100%;
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(20, 184, 166, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 24%),
    linear-gradient(180deg, #f7fafc 0%, #eef4f7 100%);
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
  gap: 24px;
  padding: 28px 32px;
  border-radius: 28px;
  background: linear-gradient(135deg, #07253a 0%, #0f3d5e 58%, #155d74 100%);
  color: #f8fbff;
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
  min-width: 0;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(232, 245, 255, 0.8);
}

.dashboard-hero__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
  gap: 12px;
}

.dashboard-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  font-size: 13px;
  color: #f8fbff;
}

.dashboard-badge--success {
  background: rgba(16, 185, 129, 0.16);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
  min-width: 0;
  gap: 18px;
  margin-top: 20px;
}

.metric-card {
  min-width: 0;
  padding: 22px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: var(--metric-accent);
}

.metric-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-card__label {
  color: #64748b;
  font-size: 13px;
}

.metric-card__trend {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
}

.metric-card__trend.is-down {
  color: #dc2626;
}

.metric-card__value {
  display: block;
  margin-top: 18px;
  font-size: 34px;
  line-height: 1;
  color: #0f172a;
}

.metric-card__hint {
  margin: 12px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.9fr);
  width: 100%;
  min-width: 0;
  gap: 18px;
  margin-top: 20px;
}

.panel {
  width: 100%;
  min-width: 0;
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.panel--wide {
  align-self: start;
}

.panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  min-width: 0;
  gap: 16px;
}

.panel__title {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}

.panel__desc {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.panel__legend {
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  gap: 12px;
  color: #64748b;
  font-size: 12px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 999px;
}

.legend-dot--navy {
  background: #1d4ed8;
}

.legend-dot--cyan {
  background: #06b6d4;
}

.legend-dot--gold {
  background: #f59e0b;
}

.trend-chart {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  width: 100%;
  min-width: 0;
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
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(226, 232, 240, 0.22), rgba(226, 232, 240, 0.65));
  overflow: hidden;
}

.trend-chart__bar {
  width: 100%;
  border-radius: 999px;
  min-height: 10px;
}

.trend-chart__bar--navy {
  background: linear-gradient(180deg, #60a5fa 0%, #1d4ed8 100%);
}

.trend-chart__bar--cyan {
  background: linear-gradient(180deg, #67e8f9 0%, #0891b2 100%);
}

.trend-chart__bar--gold {
  background: linear-gradient(180deg, #fcd34d 0%, #d97706 100%);
}

.trend-chart__footer {
  margin-top: 14px;
  text-align: center;
}

.trend-chart__footer strong {
  display: block;
  font-size: 18px;
  color: #0f172a;
}

.trend-chart__footer span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.source-item__meta {
  display: flex;
  justify-content: space-between;
  min-width: 0;
  gap: 12px;
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
}

.source-item__meta strong {
  color: #0f172a;
}

.source-item__progress {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: #e2e8f0;
}

.source-item__progress-bar {
  height: 100%;
  border-radius: inherit;
}

.quality-card {
  margin-top: 26px;
  padding: 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%);
}

.quality-card__label {
  display: block;
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.quality-card__value {
  display: block;
  margin-top: 12px;
  font-size: 30px;
  color: #0f172a;
}

.quality-card__hint {
  margin: 10px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

.site-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.site-row {
  padding: 18px;
  border-radius: 18px;
  background: #f8fafc;
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
  color: #0f172a;
  font-size: 15px;
}

.site-row__top span {
  display: block;
  margin-top: 4px;
  color: #64748b;
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
  color: #64748b;
  font-size: 12px;
}

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
  border-radius: 999px;
  background: linear-gradient(135deg, #0ea5e9, #14b8a6);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.12);
}

.activity-item__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.activity-item__head strong {
  color: #0f172a;
  font-size: 14px;
}

.activity-item__head span {
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
}

.activity-item__content p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-main {
    grid-template-columns: 1fr;
  }

}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 18px;
  }

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

  .metric-card__head,
  .source-item__meta,
  .site-row__foot {
    flex-wrap: wrap;
  }

  .trend-chart {
    gap: 8px;
    min-height: 260px;
  }

  .trend-chart__bars {
    gap: 5px;
    height: 190px;
  }

  .panel,
  .metric-card {
    padding: 18px;
  }
}
</style>
