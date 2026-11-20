# 素材收集系统 — UI 改进分析

> 分析范围：布局骨架、设计 token、登录页、侧边栏、Dashboard、列表页、媒体库、客户上传页
> 技术栈：Vue 3.5 + Element Plus 2.11 + Tailwind CSS 4 + ECharts 6
> 结论：整体骨架优于大多数后台管理模板，主要问题集中在**「token 落地不彻底」和「暗色模式是死代码」**这两点上。

---

## 一、总体评价

先说好的，避免你觉得我只挑刺：

- **Dashboard 是有设计感的**。柱状图用三段色渐变、趋势徽章、节假日倒计时、站点进度条，不是那种"四个大数字 + 空卡片"的敷衍面板。
- **侧边栏（SideBarMenu.vue）下过功夫**。激活项有左侧指示条 + 主色渐变底，子菜单有层级线，动效用了 `cubic-bezier(0.22,1,0.36,1)` 不是线性 ease——这点很符合项目"反主流"的定位。
- **有设计 token 体系**（`src/style.css` 的 `@theme`），颜色/圆角/阴影都定义好了，思路对。

问题在于：**token 定义了，但很多页面根本没用它。**

---

## 二、P0 — 影响全局、必须先解决

### 2.1 暗色模式是「死代码」，还和浅色设计打架 —— ✅ 已执行方案 A（已删除）

> 状态：2026 已按 **方案 A 彻底删除**。移除 `@custom-variant dark`、全部 `.dark *` 选择器、全部 `dark:` 工具类，并删除浅色无用的 `--color-background-dark` token。保留的 `effect="dark"`（el-tag 实心样式）、`--color-border-dark`、`--el-box-shadow-dark`、`--el-color-primary-dark-2` 是「深一档色值」，与暗色模式无关，属正常保留。

这是最扎眼的问题。查证结果：

- `main.js` 从头到尾**没有**.dark` 切换逻辑，也没有 `useDark`/`toggleDark`/`classList`。
- `style.css` 却定义了 `@custom-variant dark (&:where(.dark, .dark *))`，写了一堆 `.dark .sidebar-shell`、`.dark .group-menu` 样式。
- `login.vue`、`404.vue` 里有 `dark:bg-gray-800`、`dark:text-white` 等类，但**永远不会触发**（因为没人给 `<html>` 加 `.dark`）。

**后果**：暗色分支永远不亮，等于白写维护成本；同时如果哪天真加上 `.dark`，登录页又会瞬间变成 `bg-gray-800` 这种和全站 token 完全不同的死灰色。

**建议（二选一，别拖）**：
- **方案 A（推荐，工作量小）**：彻底删掉暗色。移除 `@custom-variant dark`、所有 `.dark *` 规则、所有 `dark:` 前缀类。项目目前明显只做浅色，删干净比留着半成品强。
- **方案 B（有预算才做）**：真正接入暗色。加一个主题切换按钮 → 给 `document.documentElement` 切 `.dark` 类 + 存 localStorage；并把暗色色值也纳入 `@theme`（现在 `--color-background-dark` 有定义却没人用）。

---

### 2.2 token 落地不彻底：硬编码颜色满地跑 —— ✅ 已批量替换

> 状态：已完成。全库 `text-gray-900/700/600/500/400`、`bg-white`、`bg-gray-50/100`、`border-gray-100/200/300` 共 239 处替换为语义 token（`text-text-primary/secondary/muted`、`bg-surface/surface-hover/surface-active`、`border-border/border-light/border-dark`）。刻意保留的仅 `UnsupportedDeviceNotice.vue` 的 `bg-white/90`（玻璃拟态需半透明），以及 `MediaCard` 图片遮罩上的 `bg-black/*` + `text-white`（叠在图片上看不清就不能动）。
>
> **第二轮补充（2026 追加，已完成）**：上一轮只清了 Tailwind 工具类，漏了 **scoped CSS 里的十六进制色**。又清了一批：`module-mode/`（EditorPanel、PreviewPanel、PresetPickerDialog、UploadDialog、SortPartsDialog）+ ElementorFields（section-background-image、flip-box、call-to-action）里 100+ 处 `#409eff`/`#303133`/`#909399`/`#ebeef5`/`#e4e7ed`/`#fafbfc`/`white` 等 Element Plus 原生色板和手写灰，统一换成 `var(--color-*)` / `var(--el-color-primary-light-5)` 等 token。

`style.css` 定义了 `--color-text-primary`、`--color-surface`、`--color-border` 等，但页面里大量直接用 Tailwind 原始色：

| 文件 | 硬编码 |
|---|---|
| `views/customer/NewsList.vue` | `text-gray-900`、`text-gray-500` |
| `views/customer/NewsUpload.vue` | `bg-white`、`border-gray-200`、`bg-gray-50`、`text-gray-900` |
| `views/customer/ProductUpload.vue` | `border-gray-300`、`bg-gray-50`、`text-gray-400` |
| `views/admin/List.vue` | `text-gray-500`、`text-gray-400`、`text-gray-900` |
| `views/admin/MediaLibrary.vue` | `text-gray-400`、`text-gray-600` |

**后果**：
1. 想统一改一次主灰色（比如从 `#4b5563` 调成 `#475569`），得全项目搜替换，token 形同虚设。
2. `bg-white`（纯白）和 `--color-surface`（`#ffffff`）虽然现在值一样，但一旦引入暗色或调整表面色，就会分叉。
3. 违反项目自己的规则："纯平背景色" 和 "Tailwind 默认色板" 都是禁止项，而 `bg-gray-50` 正是 Tailwind 默认色板。

**建议**：把高频的 `text-gray-900 → text-text-primary`、`text-gray-500 → text-text-muted`、`bg-white → bg-surface`、`border-gray-200 → border-border` 做一轮批量替换。可以在 Tailwind 里给这些 token 配 `@utility` 语义类（如 `.surface`），一次性根治。

---

## 三、P1 — 一致性与体验

### 3.1 存在两套页面头，客户页绕过了 PageContainer

`admin/List.vue` 用的是标准 `PageContainer` 的 `title`/`subtitle`/`icon` props：

```
<PageContainer title="站点管理" subtitle="..." :icon="UserFilled">
```

但 `customer/NewsList.vue`、`NewsUpload.vue`、`ProductUpload.vue` 却是**手写 header 塞进 `#header` 插槽**：

```
<h1 class="flex items-center gap-3 text-[28px] font-bold text-gray-900">
```

**后果**：同样一个"页面大标题"，一处走组件（字号 `28px` 来自 `.page-title`，颜色是 token），一处手写（字号 `text-[28px]`，颜色是 `text-gray-900`）。以后改标题字号要改两处，且视觉上换个页面就觉得"哪里不一样"。

**建议**：客户页统一改成 `PageContainer title="新闻列表" subtitle="..." :icon="Document"`，删掉手写 `<h1>`。保持一套头部语言。

### 3.2 字号体系有点碎

- 全局 `--el-font-size-base: 13px`（很紧凑，适合笔记本，理解这个取舍）。
- 但页面标题用 `text-[28px]`、Dashboard `panel__title` 用 `17px`、`PanelCard` 标题用 `16px`。
- 出现 `text-[28px]` 这种**魔法数字**（不是 tailwind 刻度，是任意值）。

**建议**：在 `@theme` 补一组字号 token（`--text-page-title: 24px`、`--text-panel-title: 16px`、`--text-body: 13px`），页面全部引用，杜绝 `text-[28px]`。

### 3.3 表格里浪费的横向空间 + 敏感信息直出

`admin/List.vue` 的表格：

- `site_id` 占 **280px**、`wp_auth_token` 占 **280px**，全是 `font-mono` 长串，占掉大半屏宽。
- **`wp_auth_token`（鉴权 token）明文展示成列** —— 这既是 UI 问题也是安全问题。
- `updated_at` 列 (`280px`) 但 label 写的 "创建时间"，字段名与 label 不符。

**建议**：
- Token 列默认打码（`••••••` + 复制按钮），或干脆移进"详情"抽屉，不占主表。
- ID 列收窄到 120px 并使用省略号 + tooltip，点击展开。
- 修复 "创建时间" 与 `updated_at` 的语义错位。

### 3.4 媒体库空状态、加载态可再打磨

`MediaLibrary.vue` 的空状态是一个大 `Picture` 图标 + 两行灰字，能用但淡。加载态是居中转圈：

```
<div v-if="loading" class="flex justify-center items-center h-64">
  <el-icon class="is-loading text-4xl text-primary"><Loading /></el-icon>
```

**建议**：
- 加载态换成网格骨架屏（`el-skeleton` 卡片），比转圈更不"抖"。
- 空状态配一张 unDraw 插画（项目规则就要求插画用 unDraw）+ 一句带语气的话，比如 "这儿还空着，传点素材呗"，符合"口语化、像朋友聊天"的文案要求。

---

## 四、P2 — 符合项目「反主流」人设的机会

项目 `AGENTS.md` 明确禁止：Hero+三卡片、完美居中、等宽多栏、纯平背景、线性动画、Emoji 图标。现状与这条规则的冲突：

| 现状 | 与规则冲突 | 建议 |
|---|---|---|
| Dashboard `metric-grid` = `repeat(4, 1fr)` 等宽四栏 | "等宽多栏（必须不对称）" | 改成 1 大 + 3 小的不对称网格，或奇数错位 |
| Dashboard `dashboard-main` = `1.35fr / 0.9fr` | 程度轻，尚可 | 可保留，但可加更明显的视觉重量差 |
| `login.vue` 卡片 `flex justify-center items-center` 完美居中 | "完美居中" 禁止 | 登录卡改为偏右下/黄金分割落位，或加装饰性错位元素 |
| 全局背景 `--color-background-light: #f6f7f8` 纯平 | "必须有噪点纹理或渐变" | 侧边栏已经有渐变了，主背景区也可叠一层极淡噪点 SVG |
| `transition: all 0.2s/0.3s ease` 多处在用 `ease` | "线性动画 ease-in-out 禁止" | 全站统一换成 `cubic-bezier(0.22,1,0.36,1)`（侧边栏已这么做，其他没跟上） |

这些不是 bug，但**离你定的设计人设还有距离**——现在的成品更像"精致版主流后台"，而不是"反主流"。

---

## 四·补 — 第三轮已完成的交互 / 响应式 / 无障碍整改

| 事项 | 状态 | 说明 |
|---|---|---|
| module-mode 响应式断点 | ✅ | `ModuleMode` 主容器 + `PreviewPanel`(55%固定栏) + `EditorPanel` 增加 `@media (max-width:1024px)` 上下堆叠，窄屏/平板不再被压成死缝 |
| 可见键盘焦点 | ✅ | `ImageUploader` 去掉裸 `outline:none`，改 `:focus-visible` 可见描边+外环；`PreviewPanel` 板块卡补 `:focus-visible` |
| 可点击 div 键盘可达 | ✅ | `PreviewPanel` 板块卡、`MediaCard` 预览区、`UploadDialog` 素材项、19 个 ElementorFields 折叠行 → 全部补 `role="button"` `tabindex` `@keydown.enter/space`，可键盘聚焦操作 |
| 缓动统一 | ✅ | 全库 `transition: * ease` 统一改为 `cubic-bezier(0.22,1,0.36,1)`（StatCard/PanelCard/DemoList/PresetContent/EditorPanel/PreviewPanel/BannerCollection/PresetPickerDialog 等） |
| scoped CSS 残余硬编码 | ✅ | 补清 `NewsList`/`ProductList` 表格样式、module-mode 的 `#f5f7fa` 等漏网色 |

> 仍**刻意保留**的十六进制色：侧边栏 / UserAvator / BannerCollectionPanel / FieldWidgetType 的一整套深蓝灰品牌色阶（`#7c8798`/`#1f6fe0`/`#1a5fc4`…），这是手调品牌色板、密度高且相互关联，硬套语义 token 反而更乱；以及 Dashboard 柱状图渐变高光、图片遮罩 `#000`、警告琥珀 `#b45309` 等语义特化色。

---

## 五、对照整改优先级

| 优先级 | 事项 | 工作量 | 收益 |
|---|---|---|---|
| P0 | 删除或接通暗色模式（二选一） | 小 | 去掉死代码/避免未来翻车 |
| P0 | 硬编码颜色批量替换为 token | 中 | 全局改色一处生效，去掉 Tailwind 默认色板 |
| P1 | 客户页头部统一走 PageContainer | 小 | 视觉一致 |
| P1 | 补字号 token，清 `text-[28px]` 魔法值 | 小 | 标题语言统一 |
| P1 | 站点表 Token 打码/收窄、修 label 错位 | 小 | 安全 + 省空间 |
| P2 | 媒体库骨架屏 + unDraw 空状态 | 小 | 体验温度 |
| P2 | Dashboard 网格去等宽、登录页去完美居中、统一缓动 | 中 | 贴合"反主流"人设 |

---

## 六、一句话总结

**底子是好的，问题在「纪律」**：设计 token 立了规矩，但一半页面在破规矩；暗色模式写了一整套却没人开灯。先花半天把「死代码」和「硬编码色」清掉，视觉一致性能上一个台阶；再花点心思把等宽网格、居中登录、`ease` 缓动改掉，才算真正配得上你给自己定的「反主流设计师」人设。
