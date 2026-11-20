import { getPages } from "@/apis/index.js";
import { getPagePermissions } from "@/apis/index.js";
import { getPageOrder } from "@/apis/index.js";

/**
 * 按站点级排序 order 对页面数组排序：
 * 在 order 里的按索引排在前；不在 order 里的保持原始顺序排在后面。
 */
function sortByOrder(list, order) {
  if (!Array.isArray(order) || order.length === 0) return list;
  const indexMap = new Map();
  order.forEach((id, i) => {
    if (!indexMap.has(Number(id))) indexMap.set(Number(id), i);
  });
  const big = Number.MAX_SAFE_INTEGER;
  return [...list].sort((a, b) => {
    const ia = indexMap.has(Number(a.id)) ? indexMap.get(Number(a.id)) : big;
    const ib = indexMap.has(Number(b.id)) ? indexMap.get(Number(b.id)) : big;
    return ia - ib;
  });
}

/**
 * 用户端：拉取当前站点页面列表，并结合 GET /api/user/page_permissions 过滤侧栏「页面列表」。
 * 权限接口成功时仅展示 allow === true 的页面；失败时回退为全量页面列表，避免侧栏空白。
 * 另按 GET /api/user/page_order 的站点级排序展示。
 *
 * @param {import("pinia").Store} globalStore - useGlobalStore() 实例
 */
export async function refreshUserSitePageListWithPermissions(globalStore) {
  const user = globalStore.user;
  const siteId = globalStore.websiteInfo?.site_id;
  const uid = user?.id;

  if (!siteId || uid == null) {
    globalStore.sitePageList = [];
    return;
  }

  try {
    const [pagesRes, permRes, orderRes] = await Promise.all([
      getPages(siteId),
      getPagePermissions({ id: uid, site_id: siteId }),
      getPageOrder(siteId),
    ]);

    if (pagesRes?.code !== 0 || !Array.isArray(pagesRes.data)) {
      globalStore.sitePageList = [];
      return;
    }

    const allowMap = new Map();
    let usePermissionFilter = false;
    if (permRes?.code === 0 && Array.isArray(permRes.data)) {
      usePermissionFilter = true;
      for (const row of permRes.data) {
        if (row == null || row.page_id == null) continue;
        allowMap.set(Number(row.page_id), !!row.allow);
      }
    }

    let rows = pagesRes.data;
    if (usePermissionFilter) {
      rows = rows.filter((p) => {
        const pid = Number(p.ID ?? p.id);
        return allowMap.get(pid) === true;
      });
    }

    let list = rows.map((p) => ({
      id: p.ID ?? p.id,
      post_name: decodeURIComponent(p.post_name ?? p.post_title ?? ""),
    }));

    const order = orderRes?.code === 0 ? orderRes.data?.order : [];
    list = sortByOrder(list, order);

    globalStore.sitePageList = list;
  } catch (e) {
    console.error("[refreshUserSitePageListWithPermissions]", e);
    try {
      const pagesRes = await getPages(siteId);
      if (pagesRes?.code === 0 && Array.isArray(pagesRes.data)) {
        globalStore.sitePageList = pagesRes.data.map((p) => ({
          id: p.ID ?? p.id,
          post_name: decodeURIComponent(p.post_name ?? p.post_title ?? ""),
        }));
      } else {
        globalStore.sitePageList = [];
      }
    } catch {
      globalStore.sitePageList = [];
    }
  }
}
