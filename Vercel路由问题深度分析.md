# Vercel路由问题深度分析

## 问题描述

**现象**: 本地测试 `http://localhost:3000/api/?url=...` 正常工作，但部署到Vercel后访问 `https://policy-new2.vercel.app/api/?url=...` 出现 `FUNCTION_INVOCATION_FAILED` 错误。

## 根本原因分析

### 1. 环境差异对比

| 环境 | 启动方式 | 路由处理 | 全局前缀 | 实际路径 |
|------|----------|----------|----------|----------|
| **本地开发** | `npm run start:dev` | NestJS直接处理 | `/api` | `/api/?url=...` |
| **Vercel部署** | Serverless Function | Vercel重写 + NestJS | 无 | `/?url=...` |

### 2. 路由映射详细分析

#### 本地环境路由流程
```
用户请求: http://localhost:3000/api/?url=...
↓
NestJS应用: 直接接收请求
↓
全局前缀处理: app.setGlobalPrefix('api')
↓
路由匹配: /api/ → RootProxyController @All('/')
↓
结果: ✅ 成功匹配
```

#### Vercel环境路由流程（修复前）
```
用户请求: https://policy-new2.vercel.app/api/?url=...
↓
Vercel重写规则: /api/(.*) → /api/index (Serverless Function)
↓
Serverless Function: api/index.js 处理请求
↓
如果设置了全局前缀: app.setGlobalPrefix('api')
↓
实际路由变成: /api/api/?url=... (双重前缀!)
↓
路由匹配: 找不到 /api/api/ 的处理器
↓
结果: ❌ 404 → Function崩溃
```

#### Vercel环境路由流程（修复后）
```
用户请求: https://policy-new2.vercel.app/api/?url=...
↓
Vercel重写规则: /api/(.*) → /api/index (Serverless Function)
↓
Serverless Function: api/index.js 处理请求
↓
无全局前缀: 直接处理原始路径
↓
实际路由: /?url=... (Vercel已处理前缀)
↓
路由匹配: / → RootProxyController @All('/')
↓
结果: ✅ 成功匹配
```

### 3. Vercel.json配置分析

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

**关键理解**:
- Vercel的重写规则已经将 `/api/xxx` 路径重写为 `/api/index`
- Serverless Function接收到的实际请求路径是经过处理的
- 如果在Function中再次添加全局前缀，会造成路径冲突

## 技术细节深入

### 1. Serverless Function包装机制

Vercel将NestJS应用包装在Serverless Function中：

```javascript
// api/index.js
module.exports = async (req, res) => {
  // req.url 已经是Vercel处理后的路径
  const nestApp = await createNestApplication();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};
```

**关键点**:
- `req.url` 是Vercel重写后的路径
- 对于 `/api/?url=...` 请求，`req.url` 实际是 `/?url=...`
- 这是因为Vercel的重写规则已经处理了 `/api` 前缀

### 2. NestJS路由解析机制

```typescript
// 本地环境
app.setGlobalPrefix('api'); // 所有路由加上 /api 前缀

@Controller() // 空路径
export class RootProxyController {
  @All('/') // 处理根路径
  handleRootProxy() {
    // 完整路径: /api/ (全局前缀 + 控制器路径 + 方法路径)
  }
}
```

```typescript
// Vercel环境（修复后）
// 不设置全局前缀

@Controller() // 空路径
export class RootProxyController {
  @All('/') // 处理根路径
  handleRootProxy() {
    // 完整路径: / (无前缀 + 控制器路径 + 方法路径)
  }
}
```

### 3. 请求头和上下文分析

**本地环境请求**:
```http
GET /api/?url=https://httpbin.org/get HTTP/1.1
Host: localhost:3000
```

**Vercel环境请求**:
```http
# 用户发起的请求
GET /api/?url=https://httpbin.org/get HTTP/1.1
Host: policy-new2.vercel.app

# Vercel重写后传递给Function的请求
GET /?url=https://httpbin.org/get HTTP/1.1
Host: policy-new2.vercel.app
```

## 解决方案对比

### 方案1: 移除Serverless Function中的全局前缀（已采用）

**优点**:
- 简单直接，只需修改一行代码
- 符合Vercel的设计理念
- 不影响本地开发环境

**缺点**:
- 本地和Vercel环境配置不一致

**实现**:
```javascript
// api/index.js
async function createNestApplication() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors({...});
    // 注意：不要设置全局前缀，因为Vercel已经通过重写规则处理了路径
    // app.setGlobalPrefix('api'); // 这会导致双重前缀
    await app.init();
  }
  return app;
}
```

### 方案2: 调整Vercel重写规则（备选）

**优点**:
- 保持代码一致性
- 更明确的路径处理

**缺点**:
- 需要修改部署配置
- 可能影响其他路由

**实现**:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index?path=$1"
    }
  ]
}
```

### 方案3: 动态环境检测（复杂）

**实现**:
```javascript
// api/index.js
const isVercel = process.env.VERCEL === '1';

async function createNestApplication() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors({...});
    
    // 只在非Vercel环境设置全局前缀
    if (!isVercel) {
      app.setGlobalPrefix('api');
    }
    
    await app.init();
  }
  return app;
}
```

## 调试方法

### 1. 本地Vercel环境模拟

```bash
# 安装Vercel CLI
npm i -g vercel

# 本地运行Vercel环境
vercel dev

# 测试路由
curl "http://localhost:3000/api/?url=https://httpbin.org/get"
```

### 2. 添加调试日志

```javascript
// api/index.js
module.exports = async (req, res) => {
  console.log('=== Vercel Function Debug ===');
  console.log('Original URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  
  try {
    const nestApp = await createNestApplication();
    return nestApp.getHttpAdapter().getInstance()(req, res);
  } catch (error) {
    console.error('Function Error:', error);
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Vercel Function日志查看

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 `policy-new2`
3. 点击 "Functions" 标签
4. 查看实时日志和错误信息

## 常见误区

### ❌ 误区1: 认为Vercel和本地环境应该完全一致
**现实**: Vercel的Serverless架构与本地直接运行NestJS有本质差异

### ❌ 误区2: 忽略Vercel重写规则的影响
**现实**: Vercel的重写规则会改变传递给Function的请求路径

### ❌ 误区3: 过度依赖全局前缀
**现实**: 在Serverless环境中，路径处理应该更加灵活

## 最佳实践建议

### 1. 环境隔离配置
- 本地开发: 使用全局前缀，便于API组织
- Vercel部署: 移除全局前缀，适应Serverless架构

### 2. 统一测试策略
- 本地测试: `npm run start:dev`
- Vercel测试: `vercel dev`
- 部署前验证: 两种环境都要测试

### 3. 文档化差异
- 明确记录环境差异
- 提供针对性的测试用例
- 建立部署检查清单

## 总结

Vercel部署问题的根本原因是**路由前缀配置冲突**：

1. **本地环境**: NestJS直接处理请求，需要全局前缀区分API路由
2. **Vercel环境**: 重写规则已处理路径，再加全局前缀会造成双重前缀
3. **解决方案**: 在Serverless Function中移除全局前缀设置

这不是代码错误，而是**架构差异**导致的配置问题。理解这个差异是正确部署NestJS到Vercel的关键。

---

**文档版本**: v1.0  
**创建时间**: 2024年8月14日  
**问题状态**: 🔧 已分析，解决方案已实施  
**下一步**: 重新部署验证修复效果