import { config, fetchWithAuth } from "@/utils/http";

/**
 * 客户基础信息接口
 *
 * 归属键为「用户 id」（一人一条），每个输入项对应一个独立字段。
 *
 * - GET  /api/customer_profile/get?user_id=  读取
 * - POST /api/customer_profile/save          保存（全量覆盖）
 *
 * 普通用户只能读写本人；管理员可传 user_id 读写指定用户。
 */

/**
 * 读取客户基础信息。
 * @param {number|string} [userId] 仅管理员可传他人 id；普通用户传空即读本人
 * @returns {Promise<{ok:boolean, data:object|null, message?:string}>}
 */
export async function loadCustomerProfile(userId) {
  const query = new URLSearchParams();
  if (userId !== undefined && userId !== null && String(userId).trim() !== "") {
    query.append("user_id", String(userId));
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  const res = await fetchWithAuth(
    config.baseUrl + "/api/customer_profile/get" + suffix,
    { method: "GET" },
  );

  if (!res || res.code !== 0) {
    return { ok: false, data: null, message: res?.message || "客户资料读取失败" };
  }
  return { ok: true, data: res.data ?? null };
}

/**
 * 保存客户基础信息（全量覆盖 22 个字段）。
 * @param {object} payload { user_id?, contact, company_name_cn, ... }
 * @returns {Promise<{ok:boolean, data:object|null, message?:string}>}
 */
export async function saveCustomerProfile(payload) {
  const res = await fetchWithAuth(config.baseUrl + "/api/customer_profile/save", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });

  if (!res || res.code !== 0) {
    return { ok: false, data: null, message: res?.message || "客户资料保存失败" };
  }
  return { ok: true, data: res.data ?? null, message: res.message || "保存成功" };
}
