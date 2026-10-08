import { getMediaList } from "@/apis";

/**
 * 根据附件 ID 从媒体库解析可访问 URL（Elementor 常只存 id、url 为空）
 */
export async function resolveAttachmentPreviewUrl(siteId, attachmentId) {
  if (!siteId || attachmentId == null || attachmentId === "") return "";
  const idStr = String(attachmentId).trim();
  if (!idStr || idStr === "0") return "";

  const tryList = (list) => {
    if (!Array.isArray(list)) return "";
    const hit = list.find((m) => m && String(m.id) === idStr);
    return hit?.url && String(hit.url).trim() ? String(hit.url).trim() : "";
  };

  try {
    let res = await getMediaList({
      site_id: siteId,
      page: 1,
      page_size: 100,
      attachment_id: idStr,
    });
    if (res?.code === 0 && res.data?.list) {
      const u = tryList(res.data.list);
      if (u) return u;
    }

    for (let page = 1; page <= 8; page++) {
      res = await getMediaList({
        site_id: siteId,
        page,
        page_size: 100,
      });
      if (res?.code !== 0 || !res.data?.list?.length) break;
      const u = tryList(res.data.list);
      if (u) return u;
      if (res.data.list.length < 100) break;
    }
  } catch {
    /* ignore */
  }
  return "";
}
