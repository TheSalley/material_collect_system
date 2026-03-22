import { getPages } from "@/apis/index.js";
import { getPagePermissions } from "@/apis/index.js";

/**
 * 用户端：拉取当前站点页面列表，并结合 GET /api/user/page_permissions 过滤侧栏「页面列表」。
 * 权限接口成功时仅展示 allow === true 的页面；失败时回退为全量页面列表，避免侧栏空白。
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
    const [pagesRes, permRes] = await Promise.all([
      getPages(siteId),
      getPagePermissions({ id: uid, site_id: siteId }),
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

    globalStore.sitePageList = rows.map((p) => ({
      id: p.ID ?? p.id,
      post_name: p.post_name ?? p.post_title ?? "",
    }));
  } catch (e) {
    console.error("[refreshUserSitePageListWithPermissions]", e);
    try {
      const pagesRes = await getPages(siteId);
      if (pagesRes?.code === 0 && Array.isArray(pagesRes.data)) {
        globalStore.sitePageList = pagesRes.data.map((p) => ({
          id: p.ID ?? p.id,
          post_name: p.post_name ?? p.post_title ?? "",
        }));
      } else {
        globalStore.sitePageList = [];
      }
    } catch {
      globalStore.sitePageList = [];
    }
  }
}
