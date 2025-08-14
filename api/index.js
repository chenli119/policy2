const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/src/app.module');

let app;

/**
 * 初始化NestJS应用
 * @returns {Promise<any>} NestJS应用实例
 */
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

/**
 * Vercel Serverless Function处理器
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @returns {Promise<void>}
 */
module.exports = async (req, res) => {
  try {
    const nestApp = await createNestApplication();
    const httpAdapter = nestApp.getHttpAdapter();
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control');
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(200).end();
    }
    
    // 从查询参数中获取原始路径
    const originalPath = req.query.path || '';
    const queryString = new URLSearchParams(req.query);
    queryString.delete('path'); // 移除path参数
    
    // 重构请求URL
    req.url = `/${originalPath}${queryString.toString() ? '?' + queryString.toString() : ''}`;
    
    // 将Vercel请求转发给NestJS
    return httpAdapter.getInstance()(req, res);
  } catch (error) {
    console.error('NestJS应用启动错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};