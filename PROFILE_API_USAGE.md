# Profile.vue API 调用说明

## 概述
Profile.vue 现在完全使用真实 API 调用，不再使用模拟数据。以下是所有 API 端点的详细说明。

## API 端点列表

### 1. 获取用户完整信息
**端点**: `GET /api/users/:id/profile`

**时机**: 组件挂载时 (onMounted)

**请求头**:
```javascript
{
  'Authorization': `Bearer ${userStore.token}`
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "用户名",
    "email": "user@example.com",
    "avatar": "https://...",
    "signature": "个性签名",
    "postsCount": 10,
    "likesCount": 50,
    "followersCount": 20,
    "followingCount": 15,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 上传头像
**端点**: `POST /api/users/avatar`

**时机**: 用户点击头像并选择图片后

**请求头**:
```javascript
{
  'Authorization': `Bearer ${userStore.token}`
}
```

**请求体**: FormData
```javascript
const formData = new FormData()
formData.append('avatar', file)
```

**响应数据**:
```json
{
  "code": 200,
  "message": "头像上传成功",
  "data": {
    "avatarUrl": "https://cdn.animehub.com/avatars/new-avatar.jpg"
  }
}
```

### 3. 更新个人资料
**端点**: `PUT /api/users/profile`

**时机**: 用户在编辑模态框中点击保存

**请求头**:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
}
```

**请求体**:
```json
{
  "username": "新昵称",
  "email": "new@example.com",
  "signature": "新签名"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "资料更新成功",
  "data": {
    "id": 1,
    "username": "新昵称",
    "email": "new@example.com",
    "signature": "新签名",
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3.1 更改密码
**端点**: `PUT /api/users/password`

**时机**: 用户在编辑资料时输入新密码

**请求头**:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
}
```

**请求体**:
```json
{
  "currentPassword": "当前密码",
  "newPassword": "新密码"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

### 4. 获取用户发布的帖子
**端点**: `GET /api/users/:id/posts`

**时机**: 
- 组件挂载时
- 切换到"我的帖子"标签页时
- 点赞后刷新列表时

**请求头**:
```javascript
{
  'Authorization': `Bearer ${userStore.token}`
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "帖子标题",
        "content": "帖子内容",
        "author": {
          "id": 1,
          "username": "用户名",
          "avatar": "https://..."
        },
        "likes": 10,
        "commentCount": 5,
        "viewCount": 100,
        "isLiked": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

### 5. 获取收藏的帖子
**端点**: `GET /api/users/favorites`

**时机**: 切换到"收藏"标签页时

**请求头**:
```javascript
{
  'Authorization': `Bearer ${userStore.token}`
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "帖子标题",
        "content": "帖子内容",
        "author": {
          "id": 2,
          "username": "作者名",
          "avatar": "https://..."
        },
        "likes": 20,
        "commentCount": 8,
        "viewCount": 150,
        "isLiked": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 20
  }
}
```

### 6. 获取用户设置
**端点**: `GET /api/users/settings`

**时机**: 组件挂载时

**请求头**:
```javascript
{
  'Authorization': `Bearer ${userStore.token}`
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "emailNotifications": true,
    "messageNotifications": true,
    "publicProfile": true
  }
}
```

### 7. 保存设置
**端点**: `PUT /api/users/settings`

**时机**: 用户在设置页面点击"保存设置"

**请求头**:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
}
```

**请求体**:
```json
{
  "emailNotifications": true,
  "messageNotifications": false,
  "publicProfile": true
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "设置已更新",
  "data": {
    "emailNotifications": true,
    "messageNotifications": false,
    "publicProfile": true
  }
}
```

### 8. 删除账号
**端点**: `DELETE /api/users/account`

**时机**: 用户在危险操作区域确认删除账号

**请求头**:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${userStore.token}`
}
```

**请求体**:
```json
{
  "password": "用户密码"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "账号已删除",
  "data": null
}
```

**说明**: 成功删除后，前端自动退出登录并跳转到登录页

## 错误处理

所有 API 调用都包含错误处理：

1. **网络错误**: 捕获并在控制台输出错误日志
2. **HTTP 错误**: 检查 `response.ok`，失败时抛出错误
3. **用户提示**: 使用 `alert()` 提示用户操作结果

示例：
```javascript
try {
  const response = await fetch('/api/profile', {
    headers: { 'Authorization': `Bearer ${userStore.token}` }
  })
  
  if (!response.ok) throw new Error('请求失败')
  
  const data = await response.json()
  // 处理数据...
} catch (error) {
  console.error('操作失败:', error)
  alert('操作失败，请重试')
}
```

## 状态管理

### 本地状态更新
成功调用 API 后，会同步更新：
1. `userProfile.value` - 个人资料本地状态
2. `userStore.user` - Pinia store 中的用户信息
3. `editForm.value` - 编辑表单数据

### 加载状态
使用以下 ref 管理加载状态：
- `loadingPosts` - 加载用户帖子时
- `loadingFavorites` - 加载收藏帖子时
- `submitting` - 提交编辑表单时

## 后端实现注意事项

1. **身份验证**: 所有端点都需要验证 JWT token
2. **文件上传**: `/api/profile/avatar` 需要处理 multipart/form-data
3. **密码修改**: 需要验证 `currentPassword` 后才能更新为 `newPassword`
4. **数据验证**: 验证邮箱格式、用户名长度、密码强度等
5. **返回格式**: 统一使用 JSON 格式返回数据
6. **错误码**: 使用标准 HTTP 状态码（200, 400, 401, 403, 500 等）

## 测试建议

### 前端测试
1. 使用 Mock Service Worker (MSW) 模拟 API 响应
2. 测试各种错误场景（网络错误、401、403、500）
3. 测试加载状态和用户反馈

### 后端测试
1. 测试身份验证失败情况
2. 测试数据验证（邮箱格式、密码长度等）
3. 测试文件上传限制（大小、格式）
4. 测试并发请求
5. 测试数据库事务

## 优化建议

1. **缓存**: 使用 SWR 或 React Query 缓存用户数据
2. **防抖**: 为搜索和过滤添加防抖
3. **乐观更新**: 立即更新 UI，后台同步 API
4. **图片优化**: 压缩头像图片，使用 WebP 格式
5. **分页**: 为帖子列表添加分页或无限滚动
