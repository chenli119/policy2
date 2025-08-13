# CORS 代理服务 (NestJS)

一个基于 NestJS 的 CORS 代理服务，用于解决前端跨域问题，可部署到 Vercel。

## 功能特点

- 🚀 支持所有 HTTP 方法 (GET, POST, PUT, DELETE 等)
- 🔒 自动处理 CORS 头部
- 📦 支持 JSON 和文本响应
- ⚡ 基于 NestJS 框架，支持 TypeScript
- 🛡️ 基本的 URL 验证和错误处理

## 使用方法

### 基本用法

```
https://your-vercel-domain.vercel.app/api/proxy?url=目标URL
```

### 示例

```javascript
// 原本跨域的请求
fetch('https://api.example.com/data') // ❌ 跨域错误

// 使用代理服务
fetch('https://your-proxy.vercel.app/api/proxy?url=https://api.example.com/data') // ✅ 成功
```

### 支持的请求类型

#### GET 请求
```javascript
fetch('https://your-proxy.vercel.app/api/proxy?url=https://api.example.com/users')
```

#### POST 请求
```javascript
fetch('https://your-proxy.vercel.app/api/proxy?url=https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'John', email: 'john@example.com' })
})
```

## 部署到 Vercel

### 方法一：通过 Vercel CLI

1. 安装 Vercel CLI
```bash
npm i -g vercel
```

2. 构建项目
```bash
npm run build
```

3. 在项目目录中运行
```bash
vercel
```

4. 按照提示完成部署

### 方法二：通过 GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中导入项目
3. 选择你的 GitHub 仓库
4. 点击部署

## 本地开发

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run start:dev
```

3. 访问 `http://localhost:3000/api/proxy?url=目标URL`

## 构建和生产部署

1. 构建项目
```bash
npm run build
```

2. 启动生产服务器
```bash
npm run start:prod
```

## 错误处理

服务会返回以下错误信息：

- `400`: 缺少 url 参数或 URL 格式无效
- `500`: 代理请求失败

## 安全注意事项

⚠️ **重要提醒**：此代理服务允许访问任何 URL，在生产环境中使用时请考虑：

1. 添加域名白名单限制
2. 实现请求频率限制
3. 添加身份验证
4. 监控和日志记录

## 许可证

MIT License