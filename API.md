# API 接口文档

## 基础信息

- **基础URL**: `http://localhost:3501`
- **认证方式**: Bearer Token (JWT)
- **请求头**: `Authorization: Bearer {access_token}`

## 通用响应格式

```json
{
  "code": 0,        // 0 表示成功，其他值表示错误
  "data": {},       // 响应数据
  "message": "操作成功"  // 提示信息
}
```

## 错误码说明

- `0`: 成功
- `401`: 未登录或 token 无效
- `403`: 无权限
- `404`: 资源不存在
- `409`: 资源冲突（如用户名已存在）
- `422`: 参数错误
- `500`: 服务器错误
- `501`: 服务未配置
- `502`: WordPress 代理错误

---

## 2. 认证接口

### 2.1 用户登录

**请求路径**: `POST /api/auth/login`

**请求参数**:
```json
{
  "username": "string",  // 必填，用户名
  "password": "string"   // 必填，密码
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "access_token": "string",
    "refresh_token": "string",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    },
    "site_ids": ["site_xxx"],
    "sites": [
      {
        "site_id": "site_xxx",
        "site_name": "示例站点"
      }
    ]
  },
  "message": "登录成功"
}
```

### 2.2 刷新 Token

**请求路径**: `POST /api/auth/refresh`

**请求参数**:
```json
{
  "refresh_token": "string"  // 必填，刷新令牌
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "access_token": "string"
  },
  "message": "刷新成功"
}
```

### 2.3 获取当前用户信息

**请求路径**: `GET /api/auth/me`

**请求头**: `Authorization: Bearer {access_token}`

**请求参数**: 无

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    },
    "site_ids": ["site_xxx"],
    "sites": [...]
  },
  "message": "获取成功"
}
```

### 2.4 修改密码

**请求路径**: `POST /api/auth/change_password`

**请求头**: `Authorization: Bearer {access_token}`

**请求参数**:
```json
{
  "old_password": "string",  // 必填，原密码
  "new_password": "string"   // 必填，新密码
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "修改成功"
}
```

## 3. 用户管理接口

### 3.1 获取用户列表

**请求路径**: `GET /api/user/list`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数** (Query):
- `id` (可选): 用户ID
- `username` (可选): 用户名（模糊查询）

**返回结果**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "is_deleted": 0,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "sites": [
        {
          "site_id": "site_xxx",
          "site_name": "示例站点"
        }
      ]
    }
  ],
  "message": "获取成功"
}
```

### 3.2 获取已删除用户列表

**请求路径**: `GET /api/user/deleted`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数**: 无

**返回结果**: 同 3.1

### 3.3 获取用户详情

**请求路径**: `GET /api/user/:id`

**请求头**: `Authorization: Bearer {access_token}`

**请求参数** (Path):
- `id`: 用户ID

**返回结果**: 同 3.1（单个用户对象）

### 3.4 创建用户

**请求路径**: `POST /api/user/add`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数**:
```json
{
  "username": "string",      // 必填，用户名
  "password": "string",        // 必填，密码
  "role": "admin|user",       // 可选，角色，默认 user
  "site_ids": ["site_xxx"]    // 可选，站点ID数组
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "id": 1
  },
  "message": "创建成功"
}
```

### 3.5 更新用户

**请求路径**: `POST /api/user/update`

**请求头**: `Authorization: Bearer {access_token}`

**请求参数**:
```json
{
  "id": 1,                    // 可选，用户ID（不填则更新当前用户）
  "username": "string",       // 可选，用户名
  "password": "string",        // 可选，新密码
  "role": "admin|user",       // 可选，角色（仅admin可修改）
  "site_ids": ["site_xxx"]    // 可选，站点ID数组（仅admin可修改）
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "更新成功"
}
```

### 3.6 删除用户

**请求路径**: `POST /api/user/delete`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数**:
```json
{
  "id": 1  // 必填，用户ID
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "删除成功"
}
```

### 3.7 取消用户站点授权

**请求路径**: `POST /api/user/revoke_sites`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数**:
```json
{
  "id": 1,                    // 必填，用户ID
  "site_ids": ["site_xxx"]    // 必填，站点ID数组
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "revoked_site_ids": ["site_xxx"],
    "affected": 1
  },
  "message": "取消授权成功"
}
```

### 3.8 恢复已删除用户

**请求路径**: `POST /api/user/restore`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数**:
```json
{
  "id": 1  // 必填，用户ID
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "恢复成功"
}
```

---

## 4. 站点管理接口

### 4.1 创建站点

**请求路径**: `POST /api/site/create`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数**:
```json
{
  "site_name": "string",      // 必填，站点名称
  "demo_site": "string",      // 可选，所属Demo
  "site_status": 0            // 可选，站点状态：0-建站中，1-可上线，默认0
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "site_id": "site_xxx",
    "site_name": "示例站点",
    "demo_site": null,
    "site_status": 0,
    "plugin_token": "pt_xxx"
  },
  "message": "创建成功"
}
```

### 4.2 绑定站点URL

**请求路径**: `POST /api/site/bind_url`

**请求参数**:
```json
{
  "plugin_token": "string",  // 必填，插件对接凭证
  "site_url": "string"       // 必填，站点URL
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "site_id": "site_xxx",
    "site_url": "https://example.com"
  },
  "message": "绑定成功"
}
```

### 4.3 删除站点

**请求路径**: `POST /api/site/delete`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数**:
```json
{
  "site_id": "string"  // 必填，站点ID
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "site_id": "site_xxx"
  },
  "message": "删除成功"
}
```

### 4.4 获取站点列表

**请求路径**: `GET /api/site/list`

**请求头**: `Authorization: Bearer {access_token}`

**请求参数** (Query):
- `keyword` (可选): 名称/URL 模糊查询
- `demo_site` (可选): 所属Demo筛选
- `site_status` (可选): 站点状态筛选（0或1）
- `include_deleted` (可选): 是否包含已删除（仅admin，1/true/yes）

**返回结果**:
```json
{
  "code": 0,
  "data": [
    {
      "site_id": "site_xxx",
      "site_name": "示例站点",
      "site_status": 0,
      "wp_base_url": "https://example.com",
      "wp_auth_type": "api_key",
      "demo_site": null,
      "is_deleted": 0,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "users": [...]  // 仅admin返回
    }
  ],
  "message": "获取成功"
}
```

---

## 5. 文件管理接口

### 5.1 上传文件

**请求路径**: `POST /api/file/upload`

**请求头**: `Authorization: Bearer {access_token}`

**权限要求**: admin

**请求参数** (FormData):
- `site_id` (必填): 站点ID
- `page_id` (可选): 页面ID（Elementor page_id）
- `component_id` (可选): 组件ID
- `file` (必填): 文件（支持 .png, .jpg, .jpeg, .webp，最大10MB）

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "site_id": "site_xxx",
    "page_id": "123",
    "component_id": "456",
    "file_url": "http://localhost:3501/uploads/site_xxx/20240101/xxx.png"
  },
  "message": "上传成功"
}
```

### 5.2 查询文件列表

**请求路径**: `GET /api/file/get`

**请求头**: `Authorization: Bearer {access_token}`

**请求参数** (Query):
- `site_id` (必填): 站点ID
- `page_id` (可选): 页面ID
- `component_id` (可选): 组件ID
- `page` (可选): 页码，默认1
- `page_size` (可选): 每页数量，默认20，最大100

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1,
        "site_id": "site_xxx",
        "elementor_id": "123",
        "page_id": "123",
        "component_id": "456",
        "file_url": "http://localhost:3501/uploads/site_xxx/20240101/xxx.png",
        "meta": {},
        "created_by": 1,
        "is_deleted": 0,
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "page": 1,
    "page_size": 20,
    "total": 100
  },
  "message": "获取成功"
}
```

---

## 6. WordPress 代理接口

所有代理接口都需要：
- **请求头**: `Authorization: Bearer {access_token}`
- **权限**: 需要站点权限（admin 或有该站点授权）

### 6.1 获取页面列表

**请求路径**: `GET /api/proxy/get_pages`

**请求参数** (Query):
- `site_id` (必填): 站点ID

**返回结果**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 123,
      "title": "页面标题",
      "status": "publish"
    }
  ],
  "message": "获取成功"
}
```

### 6.2 获取 Elementor 数据

**请求路径**: `GET /api/proxy/elementor_data/:id`

**请求参数**:
- Path: `id` - 页面ID
- Query: `site_id` (必填) - 站点ID

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "meta_value": "..."
  },
  "message": "获取成功"
}
```

### 6.3 获取 Elementor JSON 数据

**请求路径**: `GET /api/proxy/elementor_data_json/:id`

**请求参数**: 同 6.2

**返回结果**:
```json
{
  "code": 0,
  "data": [...],
  "message": "获取成功"
}
```

### 6.4 获取 Elementor ElType 列表

**请求路径**: `GET /api/proxy/elementor_data_eltype/:id`

**请求参数**: 同 6.2

**返回结果**:
```json
{
  "code": 0,
  "data": [
    {
      "id": "xxx",
      "el_type": "section",
      "widget_type": "",
      "depth": 0,
      "path": "0"
    }
  ],
  "message": "获取成功"
}
```

### 6.5 更新 Elementor 数据

**请求路径**: `POST /api/proxy/update_elementor_data`

**请求参数**:
```json
{
  "site_id": "string",  // 必填
  "id": 123,           // 必填，页面ID
  "data": {}           // 必填，Elementor JSON 数据
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "更新成功"
}
```

### 6.6 上传图片到 WordPress

**请求路径**: `POST /api/proxy/upload_image`

**请求参数** (FormData):
- `site_id` (必填): 站点ID
- `file` (必填): 图片文件

**返回结果**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 456,
      "url": "https://example.com/wp-content/uploads/xxx.jpg"
    }
  ],
  "message": "上传成功"
}
```

### 6.7 获取媒体列表

**请求路径**: `GET /api/proxy/media_list`

**请求参数** (Query):
- `site_id` (必填): 站点ID
- `page` (可选): 页码，默认1
- `page_size` (可选): 每页数量，默认20

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 456,
        "url": "https://example.com/wp-content/uploads/xxx.jpg",
        "title": "图片标题"
      }
    ],
    "page": 1,
    "page_size": 20,
    "total": 100
  },
  "message": "获取成功"
}
```

### 6.8 删除媒体

**请求路径**: `POST /api/proxy/media_delete`

**请求参数**:
```json
{
  "site_id": "string",      // 必填
  "attachment_id": 456      // 必填，媒体ID
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "删除成功"
}
```

### 6.9 设置站点图标

**请求路径**: `POST /api/proxy/site_icon`

**请求参数** (FormData 或 JSON):
- `site_id` (必填): 站点ID
- `file` (可选): 图片文件（FormData）
- `attachment_id` (可选): 附件ID（JSON）

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "attachment_id": 456,
    "icon_url": "https://example.com/wp-content/uploads/xxx.jpg"
  },
  "message": "设置成功"
}
```

### 6.10 获取站点图标

**请求路径**: `GET /api/proxy/site_icon`

**请求参数** (Query):
- `site_id` (必填): 站点ID

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "attachment_id": 456,
    "icon_url": "https://example.com/wp-content/uploads/xxx.jpg"
  },
  "message": "获取成功"
}
```

### 6.11 设置站点标题

**请求路径**: `POST /api/proxy/site_title`

**请求参数**:
```json
{
  "site_id": "string",  // 必填
  "title": "string"     // 必填，网站标题
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "更新成功"
}
```

### 6.12 获取站点标题

**请求路径**: `GET /api/proxy/site_title`

**请求参数** (Query):
- `site_id` (必填): 站点ID

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "title": "网站标题"
  },
  "message": "获取成功"
}
```

### 6.13 更新 SMTP 配置

**请求路径**: `POST /api/proxy/smtp_config`

**请求参数**:
```json
{
  "site_id": "string",           // 必填
  "from_email": "string",        // 可选
  "from_name": "string",         // 可选
  "mailer": "other_smtp|smtp",   // 可选
  "smtp_host": "string",          // 可选
  "smtp_encryption": "none|ssl|tls",  // 可选
  "smtp_port": 587,               // 可选
  "smtp_auto_tls": "true|false",  // 可选
  "smtp_auth": "true|false",      // 可选
  "smtp_user": "string",          // 可选
  "smtp_pass": "string"           // 可选
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "更新成功"
}
```

### 6.14 测试 SMTP

**请求路径**: `POST /api/proxy/smtp_test`

**请求参数**:
```json
{
  "site_id": "string",  // 必填
  "to": "string"        // 必填，测试收件邮箱
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": null,
  "message": "发送成功"
}
```

### 6.15 获取 Post Types

**请求路径**: `GET /api/proxy/post_types`

**请求参数** (Query):
- `site_id` (必填): 站点ID

**返回结果**:
```json
{
  "code": 0,
  "data": [
    {
      "name": "post",
      "label": "文章"
    },
    {
      "name": "product",
      "label": "产品"
    }
  ],
  "message": "获取成功"
}
```

### 6.16 创建内容

**请求路径**: `POST /api/proxy/content_create`

**请求参数**:
```json
{
  "site_id": "string",           // 必填
  "post_type": "string",         // 必填，如 "post", "product"
  "title": "string",             // 必填，标题
  "content": "string",           // 可选，正文（HTML）
  "post_date": "YYYY-MM-DD HH:mm:ss",  // 可选，发布时间
  "category_ids": [1, 2],        // 可选，分类ID数组
  "tag_ids": [3, 4],             // 可选，标签ID数组
  "featured_image_id": 456,      // 可选，封面图ID
  "gallery_ids": [456, 789]      // 可选，图库ID数组
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "id": 123,
    "permalink": "https://example.com/post/123"
  },
  "message": "创建成功"
}
```

---

## 7. 翻译接口

### 7.1 翻译文本

**请求路径**: `POST /api/proxy/translate`

**请求头**: `Authorization: Bearer {access_token}`

**请求参数**:
```json
{
  "text": "string",                    // 必填，要翻译的文本（最大5000字符）
  "target_language": "string",         // 必填，目标语言（如 en, zh）
  "source_language": "string",         // 可选，源语言（默认 auto）
  "format_type": "text|html",          // 可选，格式类型（默认 text）
  "mode": "general|professional",      // 可选，翻译模式（默认 general）
  "scene": "string",                   // 可选，场景（专业翻译必选）：title, description, communication, medical, social, finance
  "context": "string"                  // 可选，上下文
}
```

**返回结果**:
```json
{
  "code": 0,
  "data": {
    "translated_text": "翻译后的文本"
  },
  "message": "翻译成功"
}
```

---

## 注意事项

1. **认证**: 除登录、刷新token、绑定站点URL外，其他接口都需要在请求头中携带 `Authorization: Bearer {access_token}`

2. **权限**:
   - `admin`: 管理员，拥有所有权限
   - `user`: 普通用户，只能访问被授权的站点

3. **站点权限**: 普通用户只能操作被授权的站点，管理员可以操作所有站点

4. **文件上传**: 
   - 支持格式：.png, .jpg, .jpeg, .webp
   - 最大大小：10MB（可通过环境变量 `UPLOAD_MAX_SIZE_MB` 配置）

5. **WordPress 代理**: 所有代理接口都需要目标站点已绑定URL并配置插件对接Token

6. **翻译服务**: 需要配置阿里云翻译服务（通过环境变量配置）
