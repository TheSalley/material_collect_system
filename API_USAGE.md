# API 接口使用情况统计

## ✅ 已在页面使用的接口

### 认证接口 (2.x)
- ✅ **2.1 用户登录** (`login`) - `src/views/login/login.vue`
- ❌ **2.2 刷新 Token** (`refreshToken`) - 未使用
- ❌ **2.3 获取当前用户信息** (`getCurrentUser`) - 未使用
- ❌ **2.4 修改密码** (`changePassword`) - 未使用

### 用户管理接口 (3.x)
- ✅ **3.1 获取用户列表** (`getUserList`) - `src/views/admin/UserList.vue`
- ❌ **3.2 获取已删除用户列表** (`getDeletedUserList`) - 未使用
- ❌ **3.3 获取用户详情** (`getUserDetail`) - 未使用
- ✅ **3.4 创建用户** (`createUser`) - `src/views/admin/UserList.vue`
- ✅ **3.5 更新用户** (`updateUser`) - `src/views/admin/UserList.vue`
- ✅ **3.6 删除用户** (`deleteUser`) - `src/views/admin/UserList.vue`
- ❌ **3.7 取消用户站点授权** (`revokeUserSites`) - 未使用
- ❌ **3.8 恢复已删除用户** (`restoreUser`) - 未使用
- ✅ **updateUserPageList** (向后兼容) - `src/views/admin/Detail.vue`

### 站点管理接口 (4.x)
- ✅ **4.1 创建站点** (`createSite`) - `src/views/admin/List.vue`
- ❌ **4.2 绑定站点URL** (`bindSiteUrl`) - 未使用
- ✅ **4.3 删除站点** (`deleteSite`) - `src/views/admin/List.vue`
- ✅ **4.4 获取站点列表** (`getSiteList`/`getList`) - `src/views/admin/List.vue`, `src/views/admin/UserList.vue`

### 文件管理接口 (5.x)
- ✅ **5.1 上传文件** (`uploadFile`/`upload_bind_img`) - `src/components/PageMode.vue`, `src/components/ModuleMode.vue`
- ✅ **5.2 查询文件列表** (`getFileList`/`get_bind_img`) - `src/components/PageMode.vue`, `src/components/ModuleMode.vue`

### WordPress 代理接口 (6.x)
- ✅ **6.1 获取页面列表** (`getPages`) - `src/views/login/login.vue`, `src/views/admin/Detail.vue`
- ✅ **6.2 获取 Elementor 数据** (`getElementorData`/`getPageById`) - `src/components/PageMode.vue`, `src/components/ModuleMode.vue`
- ❌ **6.3 获取 Elementor JSON 数据** (`getElementorDataJson`) - 未使用
- ❌ **6.4 获取 Elementor ElType 列表** (`getElementorDataElType`) - 未使用
- ✅ **6.5 更新 Elementor 数据** (`updateElementorData`/`updatePageById`) - `src/views/customer/Pages.vue`
- ✅ **6.6 上传图片到 WordPress** (`uploadImage`) - `src/views/customer/ProductUpload.vue`, `src/views/customer/NewsUpload.vue`, `src/utils/imageUpload.js`
- ❌ **6.7 获取媒体列表** (`getMediaList`) - 未使用
- ❌ **6.8 删除媒体** (`deleteMedia`) - 未使用
- ✅ **6.9 设置站点图标** (`setSiteIcon`/`updateSiteIcon`) - `src/views/customer/index.vue`
- ✅ **6.10 获取站点图标** (`getSiteIcon`) - `src/views/customer/index.vue`
- ✅ **6.11 设置站点标题** (`setSiteTitle`/`updateSiteTitle`) - `src/views/customer/index.vue`
- ✅ **6.12 获取站点标题** (`getSiteTitle`) - `src/views/customer/index.vue`
- ❌ **6.13 更新 SMTP 配置** (`updateSmtpConfig`) - 未使用
- ❌ **6.14 测试 SMTP** (`testSmtp`) - 未使用
- ❌ **6.15 获取 Post Types** (`getPostTypes`) - 未使用
- ✅ **6.16 创建内容** (`createContent`/`contentCreate`) - `src/views/customer/ProductUpload.vue`, `src/views/customer/NewsUpload.vue`

### 翻译接口 (7.x)
- ✅ **7.1 翻译文本** (`translate`) - `src/views/customer/Pages.vue`

## 📊 统计

- **总接口数**: 35
- **已使用**: 18 (51%)
- **未使用**: 17 (49%)

## 🔍 未使用的接口详情

### 认证相关 (3个)
1. `refreshToken` - 刷新 Token（可能需要用于 token 过期自动刷新）
2. `getCurrentUser` - 获取当前用户信息（可能需要用于用户信息展示）
3. `changePassword` - 修改密码（可能需要用于用户设置页面）

### 用户管理相关 (4个)
1. `getDeletedUserList` - 获取已删除用户列表（可能需要用于用户回收站功能）
2. `getUserDetail` - 获取用户详情（可能需要用于用户详情页）
3. `revokeUserSites` - 取消用户站点授权（可能需要用于用户管理中的站点授权管理）
4. `restoreUser` - 恢复已删除用户（可能需要用于用户回收站恢复功能）

### 站点管理相关 (1个)
1. `bindSiteUrl` - 绑定站点URL（可能需要用于站点创建后的URL绑定流程）

### WordPress 代理相关 (9个)
1. `getElementorDataJson` - 获取 Elementor JSON 数据（可能需要用于更高级的 Elementor 数据操作）
2. `getElementorDataElType` - 获取 Elementor ElType 列表（可能需要用于 Elementor 组件类型分析）
3. `getMediaList` - 获取媒体列表（可能需要用于媒体库管理）
4. `deleteMedia` - 删除媒体（可能需要用于媒体库删除功能）
5. `updateSmtpConfig` - 更新 SMTP 配置（可能需要用于站点邮件配置）
6. `testSmtp` - 测试 SMTP（可能需要用于 SMTP 配置测试）
7. `getPostTypes` - 获取 Post Types（可能需要用于内容类型选择）

## 💡 建议

这些未使用的接口可能是：
1. **预留功能** - 未来可能需要使用的功能
2. **可选功能** - 某些高级功能可能不需要
3. **待开发功能** - 页面功能还未实现

如果需要，可以在相应的页面中集成这些接口。
