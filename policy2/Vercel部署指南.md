# Vercel 部署指南

## 📋 部署前准备

### 1. 确保项目结构正确
```
├── src/                    # 源代码目录
│   ├── main.ts            # 应用入口
│   ├── app.module.ts      # 主模块
│   └── proxy/             # 代理模块
├── dist/                  # 构建输出（自动生成）
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── nest-cli.json          # NestJS配置
└── vercel.json            # Vercel部署配置
```

### 2. 检查 package.json 脚本
确保以下脚本存在：
```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:prod": "node dist/main"
  }
}
```

### 3. 验证 vercel.json 配置
```json
{
  "version": 2,
  "framework": null,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
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
          "value": "Content-Type, Authorization, X-Requested-With, Accept"
        }
      ]
    }
  ]
}
```

## 🚀 部署方法

### 方法一：Vercel CLI 部署（推荐）

#### 1. 安装 Vercel CLI
```bash
# 全局安装
npm i -g vercel

# 或使用 yarn
yarn global add vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```
按提示选择登录方式（GitHub、GitLab、Bitbucket 或 Email）

#### 3. 构建项目
```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

#### 4. 部署
```bash
# 在项目根目录运行
vercel
```

首次部署时会询问：
- **Set up and deploy**: 选择 `Y`
- **Which scope**: 选择你的账户
- **Link to existing project**: 选择 `N`（新项目）
- **Project name**: 输入项目名称或按回车使用默认名称
- **In which directory**: 按回车使用当前目录
- **Override settings**: 选择 `N`

#### 5. 部署完成
部署成功后，Vercel 会提供：
- **Preview URL**: 预览链接
- **Production URL**: 生产环境链接

### 方法二：GitHub 集成部署

#### 1. 推送代码到 GitHub
```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: CORS proxy service"

# 添加远程仓库
git remote add origin https://github.com/yourusername/your-repo.git

# 推送到 GitHub
git push -u origin main
```

#### 2. 在 Vercel 中导入项目
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 选择你的 GitHub 仓库
5. 配置项目设置：
   - **Framework Preset**: 选择 "Other"
   - **Root Directory**: 保持默认 `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3. 部署
点击 "Deploy" 按钮开始部署

## 🔧 部署配置详解

### 环境变量配置

如果需要设置环境变量：

1. **通过 Vercel Dashboard**
   - 进入项目设置
   - 选择 "Environment Variables"
   - 添加所需的环境变量

2. **通过 vercel.json**
```json
{
  "env": {
    "NODE_ENV": "production",
    "API_TIMEOUT": "30000"
  }
}
```

### 域名配置

#### 1. 使用 Vercel 提供的域名
默认格式：`your-project-name.vercel.app`

#### 2. 自定义域名
1. 在项目设置中选择 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

### 构建优化

#### 1. 缓存配置
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

#### 2. 函数配置
```json
{
  "functions": {
    "dist/main.js": {
      "maxDuration": 30
    }
  }
}
```

## 🔍 部署后验证

### 1. 基本功能测试
```bash
# 测试基本代理功能
curl "https://your-project.vercel.app/api/proxy?url=https://httpbin.org/get"
```

### 2. CORS 测试
在浏览器控制台中运行：
```javascript
fetch('https://your-project.vercel.app/api/proxy?url=https://api.github.com/users/octocat')
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

### 3. 不同 HTTP 方法测试
```javascript
// POST 测试
fetch('https://your-project.vercel.app/api/proxy?url=https://httpbin.org/post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: 'data' })
})
```

## 🚨 常见部署问题

### 1. 构建失败
**错误**: `Build failed`
**解决方案**:
- 检查 `package.json` 中的构建脚本
- 确保所有依赖都在 `dependencies` 中
- 检查 TypeScript 编译错误

### 2. 函数超时
**错误**: `Function execution timed out`
**解决方案**:
```json
{
  "functions": {
    "dist/main.js": {
      "maxDuration": 30
    }
  }
}
```

### 3. 路由不工作
**错误**: `404 Not Found`
**解决方案**:
- 检查 `vercel.json` 中的路由配置
- 确保构建输出目录正确

### 4. CORS 仍然不工作
**解决方案**:
- 检查 `main.ts` 中的 CORS 配置
- 验证 `vercel.json` 中的 headers 配置

## 📊 监控和日志

### 1. 查看部署日志
```bash
# 查看最新部署的日志
vercel logs

# 查看特定部署的日志
vercel logs [deployment-url]
```

### 2. 实时日志
```bash
# 查看实时函数日志
vercel logs --follow
```

### 3. Vercel Dashboard
- 访问项目的 Vercel Dashboard
- 查看 "Functions" 标签页
- 监控请求量和错误率

## 🔄 更新部署

### 自动部署
当你推送代码到 GitHub 时，Vercel 会自动触发新的部署。

### 手动部署
```bash
# 重新部署到生产环境
vercel --prod

# 部署到预览环境
vercel
```

## 💡 最佳实践

1. **使用环境变量**: 不要在代码中硬编码敏感信息
2. **设置合理的超时**: 根据目标 API 的响应时间调整
3. **监控使用情况**: 定期检查 Vercel 的使用统计
4. **版本控制**: 使用 Git 标签管理发布版本
5. **测试部署**: 在预览环境中测试后再部署到生产环境

---

**提示**: 部署成功后，你的代理服务将可以通过 `https://your-project.vercel.app/api/proxy?url=目标URL` 访问。