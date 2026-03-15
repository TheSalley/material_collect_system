import { useGlobalStore } from "@/stores/global";
import router from "@/router";
import { ElMessage } from "element-plus";

export const config = {
  baseUrl: "https://apitest.yhct.site",
};

/**
 * 统一的fetch请求包装函数，处理401等错误
 */
export const fetchWithAuth = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    
    // 检查是否是401未授权错误
    if (res.status === 401 || data.code === 401) {
      const globalStore = useGlobalStore();
      
      // 清除用户信息
      globalStore.clearUser();
      
      // 跳转到登录页
      router.push('/login');
      
      // 提示用户
      ElMessage.error('登录已过期，请重新登录');
      
      return data;
    }
    
    return data;
  } catch (error) {
    console.error('请求错误:', error);
    throw error;
  }
};

/**
 * 获取认证头
 */
export const getAuthHeaders = (includeContentType = true) => {
  const globalStore = useGlobalStore();
  const headers = {
    Authorization: `Bearer ${globalStore.access_token}`,
  };
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};
