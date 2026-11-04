import { getPageConfig, savePageConfig } from "./file";

/**
 * 客户资料与 Banner 收集复用 page_config 的通用 JSON 存储。
 * 使用高位保留 page_id，兼容后端把 page_id 存成整数的场景。
 */
export const CUSTOMER_PROFILE_PAGE_ID = "900000001";
export const BANNER_COLLECTION_PAGE_ID = "900000002";

const COLLECTION_VERSION = 1;

function hasSiteId(siteId) {
  return (
    siteId !== null && siteId !== undefined && String(siteId).trim() !== ""
  );
}

function pickMaterials(res) {
  if (!res || res.code !== 0) return null;
  return Array.isArray(res.data?.materials) ? res.data.materials : [];
}

/**
 * 读取客户基础信息。
 * 同时兼容两种历史数据结构：{ profile: {...} } 和直接保存的资料对象。
 */
export async function loadCustomerProfile(siteId) {
  if (!hasSiteId(siteId)) {
    return { ok: false, message: "缺少站点信息" };
  }

  const res = await getPageConfig(siteId, CUSTOMER_PROFILE_PAGE_ID);
  const materials = pickMaterials(res);
  if (materials === null) {
    return { ok: false, message: res?.message || "客户资料读取失败" };
  }

  const record = materials[0];
  if (!record || typeof record !== "object") {
    return { ok: true, data: null };
  }

  return {
    ok: true,
    data:
      record.profile && typeof record.profile === "object"
        ? record.profile
        : record,
    updatedAt: record.updated_at || "",
  };
}

/**
 * 保存客户基础信息。
 */
export async function saveCustomerProfile(siteId, profile) {
  if (!hasSiteId(siteId)) {
    return { code: -1, message: "缺少站点信息" };
  }

  return await savePageConfig(siteId, CUSTOMER_PROFILE_PAGE_ID, [
    {
      __collection__: "customer_profile",
      version: COLLECTION_VERSION,
      profile,
      updated_at: new Date().toISOString(),
    },
  ]);
}

/**
 * 读取 Banner 收集列表。
 */
export async function loadBannerCollection(siteId) {
  if (!hasSiteId(siteId)) {
    return { ok: false, message: "缺少站点信息" };
  }

  const res = await getPageConfig(siteId, BANNER_COLLECTION_PAGE_ID);
  const materials = pickMaterials(res);
  if (materials === null) {
    return { ok: false, message: res?.message || "Banner 列表读取失败" };
  }

  const record = materials[0];
  const banners = Array.isArray(record?.banners)
    ? record.banners
    : Array.isArray(record)
      ? record
      : [];

  return { ok: true, data: banners, updatedAt: record?.updated_at || "" };
}

/**
 * 保存 Banner 收集列表。
 */
export async function saveBannerCollection(siteId, banners) {
  if (!hasSiteId(siteId)) {
    return { code: -1, message: "缺少站点信息" };
  }

  return await savePageConfig(siteId, BANNER_COLLECTION_PAGE_ID, [
    {
      __collection__: "banner_collection",
      version: COLLECTION_VERSION,
      banners,
      updated_at: new Date().toISOString(),
    },
  ]);
}
