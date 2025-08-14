import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * NestJS应用启动入口
 * 配置CORS和全局设置
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用CORS，允许所有来源
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    credentials: false,
  });
  
  // 设置全局前缀
  app.setGlobalPrefix('api');
  
  // 获取端口，Vercel会自动设置PORT环境变量
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  console.log(`🚀 CORS代理服务启动成功，端口: ${port}`);
}

bootstrap();