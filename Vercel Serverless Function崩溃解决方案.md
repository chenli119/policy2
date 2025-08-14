# Vercel Serverless Function崩溃解决方案 (更新版)

## 错误描述

访问 `https://policy-new2.vercel.app/?url=...` 时出现：

```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
ID: hkg1::vbh9m-1755138914042-4dc6bfdb415a
```

## 问题分析

### 1. 根本原因分析
经过深入调试发现，问题的根本原因是**路由前缀配置冲突**：

- `src/main.ts` 中设置了 `app.setGlobalPrefix('api')`
- `vercel.json` 中的重写规则：`/(.*) -> /api/index`
- 如果在 `api/index.js` 中也设置 `app.setGlobalPrefix('api')`，会导致**双重前缀**问题

### 2. 路由映射分析

#### 错误的路由映射（双重前缀）
```
用户请求: /?url=...
↓ Vercel重写
Serverless Function: /api/index
↓ NestJS全局前缀
实际路由: /api/api/?url=...
↓ 控制器期望
期望路由: /?url=...
结果: 路由不匹配 → 404 → Function崩溃
```

#### 正确的路由映射
```
用户请求: /?url=...
↓ Vercel重写
Serverless Function: /api/index
↓ NestJS (无全局前缀)
实际路由: /?url=...
↓ RootProxyController
匹配成功: @All('/') 处理请求
```

## 解决方案

### 方案1：移除Serverless Function中的全局前缀（推荐）

**修改 `api/index.js`**：
```javascript
async function createNestApplication() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control']
    });
    // 注意：不要设置全局前缀，因为Vercel已经通过重写规则处理了路径
    // app.setGlobalPrefix('api'); // 这会导致双重前缀 /api/api/
    await app.init();
  }
  return app;
}
```

### 方案2：调整Vercel重写规则（备选）

**修改 `vercel.json`**：
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/api/index/$1"  // 保持原始路径
    }
  ]
}
```

## 部署步骤

### 1. 本地构建
```bash
# 确保依赖完整
npm install

# 重新构建
npm run build
```

### 2. 部署到Vercel
```bash
# 方法1: 使用Vercel CLI
npm i -g vercel
vercel --prod

# 方法2: Git推送触发自动部署
git add .
git commit -m "fix: 修复Serverless Function路由前缀冲突"
git push origin main
```

### 3. 验证部署
等待部署完成后测试以下URL：
```
# 基本测试
https://policy-new2.vercel.app/?url=https://httpbin.org/get

# 原始问题URL
https://policy-new2.vercel.app/?url=http%3A%2F%2Fboxtask.genicsoft.com%2F%2Fapi%2Flist%2Fgermanyoss%2F1%2F5
```

## 技术细节

### 环境差异分析

| 环境 | 启动方式 | 全局前缀 | 路由处理 |
|------|----------|----------|----------|
| 本地开发 | `npm run start:dev` | `api` | `/api/?url=...` |
| 本地生产 | `npm run start:prod` | `api` | `/api/?url=...` |
| Vercel | Serverless Function | 无 | `/?url=...` |

### 控制器配置

```typescript
// RootProxyController 正确配置
@Controller()  // 空路径，处理根路径
export class RootProxyController {
  @All('/')  // 匹配 / 路径
  async handleRootProxy(
    @Query('url') url: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    // 处理代理请求
  }
}
```

## 调试方法

### 1. 本地Vercel环境测试
```bash
# 安装Vercel CLI
npm i -g vercel

# 本地运行Vercel环境
vercel dev

# 测试URL
curl "http://localhost:3000/?url=https://httpbin.org/get"
```

### 2. 日志调试
在 `api/index.js` 中添加调试日志：
```javascript
module.exports = async (req, res) => {
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  
  try {
    const nestApp = await createNestApplication();
    // ... 其他代码
  } catch (error) {
    console.error('详细错误信息:', error);
    res.status(500).json({ 
      error: '服务器内部错误',
      details: error.message 
    });
  }
};
```

### 3. 检查Vercel部署日志
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 `policy-new2`
3. 查看 Functions 标签页的日志
4. 检查构建和运行时错误

## 常见问题

### Q1: 为什么本地测试正常，Vercel部署失败？
**A**: 本地环境和Vercel环境的路由处理方式不同：
- 本地：直接启动NestJS应用，使用全局前缀
- Vercel：通过Serverless Function包装，路径已被重写

### Q2: 如何确认部署是否成功？
**A**: 
1. 检查Vercel Dashboard中的部署状态
2. 测试简单的URL：`https://policy-new2.vercel.app/?url=https://httpbin.org/get`
3. 查看返回的JSON数据而不是错误页面

### Q3: 如果仍然报错怎么办？
**A**: 
1. 确认代码已正确推送到Git仓库
2. 检查Vercel是否自动部署了最新版本
3. 手动触发重新部署
4. 检查Function日志获取详细错误信息

## 预防措施

1. **环境一致性测试**：使用 `vercel dev` 在本地测试Vercel环境
2. **配置文档化**：明确记录不同环境的配置差异
3. **自动化测试**：添加端到端测试验证代理功能
4. **监控告警**：设置Vercel Function错误监控

## 相关文件

- `api/index.js` - Vercel Serverless Function入口（已修复）
- `src/main.ts` - NestJS本地启动配置
- `src/root-proxy.controller.ts` - 根路径代理控制器
- `vercel.json` - Vercel部署配置
- `dist/` - 编译输出目录

---

**最后更新**: 2024年8月14日
**问题状态**: 🔧 修复中 - 需要重新部署
**解决方法**: 移除Serverless Function中的全局前缀设置
**下一步**: 部署到Vercel并验证修复效果