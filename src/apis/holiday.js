/**
 * 节假日/节气倒计时 API
 * 外部服务：https://cron.1919532973.workers.dev
 * 无需认证，直接调用
 *
 * 跨域说明：workers.dev 未返回 Access-Control-Allow-Origin，
 * 开发环境通过 Vite 代理（/holiday-api -> https://cron.1919532973.workers.dev）访问；
 * 生产环境仍直连（如需生产直连可用，需在 nginx 为 /holiday-api 配置反向代理）。
 */

const HOLIDAY_API_BASE = import.meta.env.DEV
  ? "/holiday-api"
  : "https://cron.1919532973.workers.dev";

/**
 * 获取即将到来的节假日/节气倒计时列表
 * GET /
 *
 * @returns {Promise<{success: boolean, count: number, data: Array<{name: string, date: string, days: string}>}>}
 *   data 示例：[{ name: "中秋节", date: "2026-09-25", days: "还有11天" }]
 */
export const getHolidayCountdown = async () => {
  try {
    const res = await fetch(HOLIDAY_API_BASE + "/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("[holiday] 获取节假日数据失败:", error);
    return {
      success: false,
      count: 0,
      data: [],
      message: error.message || "网络错误",
    };
  }
};
