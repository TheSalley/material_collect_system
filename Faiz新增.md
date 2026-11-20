# 需求：页面设置 —— 页面拖拽排序

> 页面：`#/admin/detail?id=<site_id>` → 「页面设置」Tab
> 目标：管理员可拖拽调整页面顺序；**已启用（allow=true）的页面自动排在最上方**；用户侧侧边栏「页面列表」按该顺序展示。

---

## 1. 背景与现状

- 页面编辑入口：`src/views/admin/Detail.vue` 的 `pages` Tab（`activeSubTab === 'pages'`）。
- 页面数据来源：`getPages(siteId)`（`src/apis/proxy.js`，WordPress 页面列表），字段至少含 `ID` / `post_name`。
- 页面启用状态：`getPagePermissions({ id, site_id })`（`src/apis/user.js`），返回 `{ page_id, allow }[]`；切换时 `setPagePermission`。
- 用户侧消费：`src/utils/userSitePages.js` 的 `refreshUserSitePageListWithPermissions()` 拉页面 + 权限 → 过滤 `allow===true` → 写入 `globalStore.sitePageList`。
- 侧边栏渲染：`src/layout/components/SideBarMenu.vue`，`v-for="page in sitePageList"`，**按数组顺序**展示。
- **现状缺陷**：没有「排序」概念，顺序完全依赖 `getPages` 返回顺序（WordPress 默认顺序），管理员无法调整，用户侧看到的顺序也不可控。

---

## 2. 功能需求

### 2.1 页面设置列表支持拖拽排序

1. 在「页面设置」表格的**首列新增「排序」操作列**（拖拽手柄图标），支持行拖拽排序。
   - 交互参考项目已有 `SortPartsDialog.vue`（HTML5 拖拽：`draggable`、`dragstart`、`dragover`、`drop`），保持手感一致。
   - 拖拽过程有视觉反馈：拖起行半透明、目标位置高亮插入线。
2. 拖拽结束后**自动保存**新顺序（无需另点保存按钮），保存成功给轻提示；失败回滚到原顺序并提示。
3. 排序为**站点级**（同一 `site_id` 下所有页面共用一个顺序）。

### 2.2 「启用的页面自动排在最上方」

1. **列表是单一列表，不做视觉分区**（不分组、不加分隔）。
2. 排序规则（整个列表统一排序）：**先按 allow 排（启用在上、未启用在下），同 allow 状态下按管理员自定义顺序排**。
   - 当某页面被**启用**时，它自动上移到「启用段」；被**禁用**时下移到「未启用段」；同一段内的相对顺序沿用管理员拖拽后的顺序。
3. 拖拽规则：
   - 允许自由拖拽（整条列表都可拖）。
   - 松手后按拖拽结果重排；但展示时仍以「启用优先」为第一排序键——即：**拖拽改变的是同段内的相对顺序**，若把未启用页面拖到启用页面上方，落位后它仍会因 allow=false 回到「未启用段」顶部（视觉上表现为只能在所属段内调整相对次序）。
   - 说明：不做「跨段永久占位」，段位由 allow 决定。

### 2.3 用户侧顺序

- 用户侧「页面列表」子菜单**按保存的顺序展示**（启用页面已过滤，只剩 allow=true 的，所以就是它们的相对顺序）。
- 需要 `refreshUserSitePageListWithPermissions()` 读取排序数据并对 `sitePageList` 排序。

---

## 3. 数据与存储设计

> ⚠️ **重要约束**：页面排序是**站点级**数据（一个站点一条排序），**不能**用 `page_config`（那套按 `site_id + page_id` 存取、面向单个页面的数据）。必须用独立的站点级排序接口/存储。

### 3.1 排序数据结构

站点级的页面 ID 有序数组：

```json
{
  "site_id": "site_f23a1483a49541309904c0b36df2ff2f",
  "order": [123, 456, 789],
  "updated_at": "2026-xx-xxT..."
}
```

`order` 是页面 ID 的有序数组。不在数组里的页面视为「未排序」，排在已排序页面之后（按原 `getPages` 顺序）。

### 3.2 存储方案：新增站点级排序接口

**接口定义（后端 / collect 服务实现）：**
- `GET /api/user/page_order?site_id=<site_id>` → `{ code:0, data: { order: number[] } }`
- `POST /api/user/set_page_order` body `{ site_id, order: number[] }` → `{ code:0, message }`

**前端封装**（放 `src/apis/user.js`，与 `set_page_permission` 等同属站点级页面接口）：
```js
export const getPageOrder = async (site_id) => { ... }   // GET  /api/user/page_order
export const setPageOrder = async ({ site_id, order }) => { ... } // POST /api/user/set_page_order
```

- 存储键为 `site_id`，一个站点一条排序记录，读写都是整条覆盖。
- 若后端已有等价接口，优先复用，仅调整前端封装。
- 后端存储方式（表 / KV / JSON 字段）由后端定，前端只认上述两个端点。

---

## 4. 前端改动清单

| 文件 | 改动 |
|---|---|
| `src/apis/user.js` | 新增 `getPageOrder(site_id)`、`setPageOrder({ site_id, order })` 两个站点级接口封装（不动 page_config / collection.js） |
| `src/utils/userSitePages.js` | `refreshUserSitePageListWithPermissions` 读取站点排序，按 order 排序 `sitePageList` |
| `src/views/admin/Detail.vue` | ① 加载时 `getPageOrder` 合并进 `pageList`；② 表格新增「拖拽排序」列与手柄；③ 启用优先 + 自定义顺序排序展示（单一列表）；④ 拖拽结束 `setPageOrder` 并同步内存顺序；⑤ 页面启用状态变化后重排 |

### 4.1 Detail.vue 具体要点

- 加载 `loadPagesAndPermissions()`：
  - 并行拉 `getPages` + `getPagePermissions` + `getPageOrder(site_id)`。
  - `pageList` 排序：**第一排序键 allow（true 在前），第二排序键 order 中的 index**（无 index 的按 `getPages` 原始顺序），保持单一列表、不分区。
- 新增 `draggingIndex` / `dragOverIndex` 状态 + 拖拽处理函数（参考 `SortPartsDialog`）。
- 拖拽结束：取拖拽后的整体顺序 → 调 `setPageOrder({ site_id, order })`；成功后按「allow 优先 + 新 order」重排内存。
- 启用/禁用（`onPagePermissionChange`）成功后，按同一排序规则重排（启用页自动上移）。

### 4.2 展示建议

- 「排序」列：宽 ~70px，居中，放拖拽手柄图标（`Rank` / 六点网格 SVG）。
- **单一列表，不分组、不加分隔行**；启用与未启用只是排序结果不同，视觉上用现有「授权状态」列区分即可。
- 行 cursor：`move`；拖拽中 `opacity:.5`；目标行顶部 2px 主色插入线。

---

## 5. 边界与异常

1. **未绑定客户**：`customerUserId == null` 时无法改 allow，但排序仍可调整（排序只依赖 site_id），保留可用。
2. **页面新增/删除**：`getPages` 出现新页面 → 不在 order 里 → 排最后；页面被删 → order 里的失效 id 自动忽略。
3. **保存失败**：回滚 UI 到拖拽前顺序，`ElMessage.error`。
4. **空列表**：无页面时拖拽区 disabled。
5. **并发**：同一站点多人编辑以最后一次保存为准（简单覆盖，不做乐观锁）。

---

## 6. 验收标准

- [ ] 管理员在「页面设置」可拖动页面行调整顺序，松手即保存。
- [ ] 启用（allow=true）的页面始终显示在列表上方；禁用后掉到下方（单一列表，不分组）。
- [ ] 拖拽改变同段内相对顺序；段位由 allow 决定（拖到启用段上方不会让其变启用）。
- [ ] 用户侧侧边栏「页面列表」顺序 = 管理员保存的顺序（过滤掉未启用页面后）。
- [ ] 刷新页面后顺序保持（已持久化到站点级排序接口）。
- [ ] 保存失败有提示且回滚。
- [ ] **未改动原 page_config 相关代码**。

---

## 7. 备注 / 待确认

1. **存储**：采用**独立站点级排序接口**（`GET /api/user/page_order` / `POST /api/user/set_page_order`），按 `site_id` 存一条排序，**完全不使用 page_config**。请确认后端/collect 服务可按此端点实现（或给出你已有的等价接口名）。
2. **跨段拖拽**：单一列表可自由拖，但落位后按 allow 决定段位（表现为只能在所属段内调整相对次序）。是否符合预期？
3. 排序是否需要对**管理员自己**的侧边栏页面列表也生效？（管理员在 `#/admin/pages/:id` 也走 `Pages` → 侧边栏同为 `sitePageList`，排序会一并生效。）
