// 由于所有路由都已预先注册，不再需要动态添加路由
// 保留此函数以保持向后兼容，但不再执行任何操作
export function addProtectedRoutes(role) {
  return Promise.resolve();
}

// 重置路由（由于所有路由都已预先注册，此函数不再需要移除路由）
// 保留此函数以保持向后兼容，但不再执行任何操作
export function resetRoutes() {
  return Promise.resolve();
}

// 生成唯一ID
export function genId() {
  return Math.random().toString(36).substring(2, 10);
}