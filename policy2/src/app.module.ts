import { Module } from '@nestjs/common';
import { ProxyController } from './proxy/proxy.controller';
import { ProxyService } from './proxy/proxy.service';
import { RootProxyController } from './root-proxy.controller';

/**
 * 应用主模块
 * 配置代理相关的控制器和服务
 */
@Module({
  imports: [],
  controllers: [ProxyController, RootProxyController],
  providers: [ProxyService],
})
export class AppModule {}