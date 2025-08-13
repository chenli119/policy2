# Vercel 配置说明 (vercel.json)

## 📋 配置文件概述

`vercel.json` 是 Vercel 部署配置文件，用于定义项目的构建、路由、环境变量和其他部署相关设置。

## 🔧 当前配置详解

### 基础配置

```json
{
  "version": 2,
  "framework": null
}
```

- **version**: 使用 Vercel 配置版本 2
- **framework**: 设置为 `null`，因为我们使用自定义的 NestJS 配置

### 构建配置

```json
{
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

- **builds**: 指定构建入口文件和运行时
  - `src`: 构建后的主文件路径
  - `use`: 使用 Node.js 运行时
- **buildCommand**: 构建命令，执行 NestJS 编译
- **outputDirectory**: 构建输出目录
- **installCommand**: 依赖安装命令

### 路由配置

```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ]
}
```

- **routes**: 将所有请求路由到 NestJS 应用
- 使用正则表达式 `(.*)` 匹配所有路径

### 函数配置 (新增)

```json
{
  "functions": {
    "dist/main.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

- **maxDuration**: 函数最大执行时间 30 秒
- **memory**: 分配 1024MB 内存
- 适合处理代理请求的资源需求

### 环境变量

```json
{
  "env": {
    "NODE_ENV": "production"
  }
}
```

- 设置生产环境变量
- NestJS 会根据此变量优化性能

### CORS 头部配置

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Requested-With, Accept, Cache-Control"
        },
        {
          "key": "Access-Control-Max-Age",
          "value": "86400"
        }
      ]
    }
  ]
}
```

#### CORS 配置说明
- **Access-Control-Allow-Origin**: 允许所有域名访问
- **Access-Control-Allow-Methods**: 支持的 HTTP 方法
- **Access-Control-Allow-Headers**: 允许的请求头
- **Access-Control-Max-Age**: 预检请求缓存时间 (24小时)

### 缓存配置 (新增)

```json
{
  "headers": [
    {
      "source": "/api/proxy",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

- 对代理 API 禁用缓存
- 确保每次请求都是最新数据

### 重写规则 (新增)

```json
{
  "rewrites": [
    {
      "source": "/",
      "destination": "/index.html"
    }
  ]
}
```

- 将根路径重写到测试页面
- 方便用户直接访问测试界面

## 🚀 优化说明

### 性能优化

1. **内存分配**: 增加到 1024MB，适合处理并发代理请求
2. **超时设置**: 30秒超时，匹配代理服务的超时配置
3. **预检缓存**: 24小时缓存 OPTIONS 请求，减少网络开销

### 安全优化

1. **请求头过滤**: 只允许必要的请求头
2. **缓存控制**: 代理请求不缓存，避免数据过期
3. **环境隔离**: 明确设置生产环境

### 用户体验优化

1. **根路径重写**: 直接访问域名显示测试页面
2. **完整的 CORS 支持**: 支持所有常用的 HTTP 方法
3. **错误处理**: 通过 NestJS 统一处理错误响应

## 🔍 配置验证

### 部署前检查

1. **构建命令**: 确保 `npm run build` 能正常执行
2. **输出目录**: 验证 `dist/main.js` 文件存在
3. **依赖完整**: 检查 `package.json` 中的依赖

### 部署后测试

```bash
# 测试基本功能
curl "https://your-domain.vercel.app/api/proxy?url=https://httpbin.org/get"

# 测试 CORS
curl -H "Origin: https://example.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     "https://your-domain.vercel.app/api/proxy"
```

## 📝 常见问题

### Q: 为什么设置 framework 为 null？
A: 因为 NestJS 不是 Vercel 的预设框架，需要使用自定义配置。

### Q: 可以修改内存和超时设置吗？
A: 可以，根据实际需求调整：
- 内存: 128MB - 3008MB
- 超时: 1秒 - 900秒 (Hobby 计划最多 10秒)

### Q: 如何添加自定义域名？
A: 在 Vercel Dashboard 的项目设置中添加域名，无需修改此配置文件。

### Q: 可以添加环境变量吗？
A: 可以在 `env` 部分添加，或在 Vercel Dashboard 中配置。

## 🔄 配置更新

当需要更新配置时：

1. 修改 `vercel.json` 文件
2. 提交到 Git 仓库
3. Vercel 会自动重新部署
4. 或使用 `vercel --prod` 手动部署

## 📊 监控和调试

### 查看函数日志
```bash
vercel logs --follow
```

### 检查函数性能
- 访问 Vercel Dashboard
- 查看 Functions 标签页
- 监控执行时间和内存使用

---

**注意**: 此配置已针对 CORS 代理服务进行优化，如果修改用途，请相应调整配置参数。