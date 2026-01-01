# 快速开始指南

## 环境要求

- Node.js 16+ 
- npm 或 yarn 或 pnpm

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

或使用其他包管理器:

```bash
yarn install
# 或
pnpm install
```

### 2. 配置背景图片（可选）

将你喜欢的背景图片命名为 `background.jpg` 并放置在 `public` 目录下。

推荐图片规格:
- 分辨率: 1920x1080 或更高
- 格式: JPG 或 PNG
- 大小: 不超过 2MB

### 3. 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动。

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 5. 预览生产构建

```bash
npm run preview
```

## 项目结构

```
anime_hub/
├── public/              # 静态资源
│   ├── background.jpg   # 背景图片（需要自己添加）
│   └── favicon.svg      # 网站图标
├── src/
│   ├── api/            # API 请求封装
│   │   ├── auth.ts     # 认证相关接口
│   │   ├── posts.ts    # 帖子相关接口
│   │   ├── site.ts     # 站点信息接口
│   │   └── request.ts  # axios 封装
│   ├── components/     # 通用组件
│   │   ├── GlassCard.vue
│   │   ├── GlassButton.vue
│   │   ├── GlassInput.vue
│   │   ├── GlassModal.vue
│   │   ├── PostCard.vue
│   │   └── SiteInfo.vue
│   ├── layouts/        # 布局组件
│   │   └── MainLayout.vue
│   ├── router/         # 路由配置
│   │   └── index.ts
│   ├── stores/         # Pinia 状态管理
│   │   ├── user.ts     # 用户状态
│   │   └── post.ts     # 帖子状态
│   ├── styles/         # 全局样式
│   │   └── global.css
│   ├── types/          # TypeScript 类型定义
│   │   └── index.ts
│   ├── views/          # 页面组件
│   │   ├── Login.vue
│   │   ├── Home.vue
│   │   ├── Hot.vue
│   │   ├── Recommended.vue
│   │   ├── Support.vue
│   │   └── PostDetail.vue
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── API_DOCS.md         # API 文档
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 功能特性

### ✨ 已实现功能

- 🔐 **用户认证**: 登录、注册、登出
- 🏠 **首页**: 展示最新帖子，左侧信息栏
- 🔥 **热门页**: 展示热门帖子
- ⭐ **站长推荐**: 展示推荐内容
- 💖 **支持我们**: 开发者信息展示
- 📝 **发帖**: 创建新帖子
- 💬 **评论**: 帖子评论功能
- ❤️ **点赞**: 帖子和评论点赞
- 🎲 **今日运势**: 抽奖功能
- 📊 **站点统计**: 展示统计数据
- 🎨 **玻璃质感UI**: 现代化透明玻璃设计
- ✨ **动画效果**: 丰富的交互动画
- 📱 **响应式**: 支持移动端和桌面端

### 🎨 UI 特点

- **玻璃质感**: 所有卡片组件采用毛玻璃效果
- **动画效果**: 
  - 页面进入动画
  - 悬停动画
  - 点击反馈
  - 浮动动画
- **背景**: 可自定义的背景图片 + 粒子效果
- **主题色**: 渐变色彩搭配（粉色-紫色）
- **自定义滚动条**: 美化的滚动条样式

## 后端集成

### API 配置

后端 API 地址在 `vite.config.ts` 中配置:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080', // 修改为你的后端地址
      changeOrigin: true
    }
  }
}
```

### API 文档

详细的 API 文档请查看 [API_DOCS.md](./API_DOCS.md)

主要接口:
- `/api/auth/*` - 认证相关
- `/api/posts/*` - 帖子相关
- `/api/comments/*` - 评论相关
- `/api/site/*` - 站点信息

## 开发建议

### 1. 自定义颜色主题

在 `src/styles/global.css` 中修改 CSS 变量:

```css
:root {
  --primary-color: #ff6b9d;      /* 主色 */
  --secondary-color: #c449c2;    /* 次要色 */
  --accent-color: #00d4ff;       /* 强调色 */
}
```

### 2. 修改背景

替换 `public/background.jpg` 文件即可更换背景图片。

### 3. 调整布局

- 侧边栏宽度: 在各页面的 `.layout-grid` 中修改 `grid-template-columns`
- 内容最大宽度: 修改各页面的 `max-width` 值

### 4. 添加新功能

1. 在 `src/api/` 中添加新的 API 接口
2. 在 `src/types/` 中添加类型定义
3. 在 `src/stores/` 中添加状态管理（如需要）
4. 在 `src/views/` 中创建新页面
5. 在 `src/router/` 中添加路由配置

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

需要支持 CSS backdrop-filter 特性的现代浏览器。

## 常见问题

### Q: 背景图片不显示？

A: 确保图片文件名为 `background.jpg` 且位于 `public` 目录下。如果图片不存在，将显示默认渐变背景。

### Q: API 请求失败？

A: 检查:
1. 后端服务是否启动
2. `vite.config.ts` 中的代理配置是否正确
3. 浏览器控制台查看具体错误信息

### Q: TypeScript 报错？

A: 运行 `npm install` 确保所有依赖已安装，或尝试重启 IDE。

### Q: 样式显示异常？

A: 清除浏览器缓存或使用隐私模式测试。

## 部署

### 构建

```bash
npm run build
```

### 部署到静态托管

构建后的 `dist` 目录可以直接部署到:
- Vercel
- Netlify
- GitHub Pages
- 任何支持静态网站的平台

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 技术栈

- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: 类型安全
- **Vite**: 快速的构建工具
- **Vue Router**: 路由管理
- **Pinia**: 状态管理
- **Axios**: HTTP 客户端

## 许可

MIT License

## 联系方式

如有问题，请查看 API_DOCS.md 或联系开发团队。

---

**祝你开发愉快！** 🎉
