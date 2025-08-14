import { Controller, Get, Post, Put, Delete, Patch, Options, Query, Req, Res, Body, Headers, All } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy/proxy.service';

/**
 * 根路径代理控制器
 * 处理根路径下的所有HTTP方法代理请求 (/?url=...)
 */
@Controller()
export class RootProxyController {
  constructor(private readonly proxyService: ProxyService) {}
  
  /**
   * 处理所有HTTP方法的根路径请求
   * @param url 目标URL
   * @param req Express请求对象
   * @param res Express响应对象
   * @param headers 请求头
   * @param body 请求体
   */
  @All(['/', '/api'])
  async handleRootProxy(
    @Query('url') url: string,
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
    @Body() body?: any
  ) {
    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return this.forwardRequest(req.method, url, headers, body, req, res);
  }
  
  /**
   * 统一的请求转发处理方法
   * @param method HTTP方法
   * @param url 目标URL
   * @param headers 请求头
   * @param body 请求体
   * @param req Express请求对象
   * @param res Express响应对象
   */
  private async forwardRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body: any,
    req: Request,
    res: Response
  ) {
    try {
      // 调用代理服务转发请求
      const response = await this.proxyService.forwardRequest(url, method, headers, body);
      
      // 设置响应状态码
      res.status(response.status);
      
      // 转发响应头
      const responseHeaders = ['content-type', 'content-length', 'cache-control', 'etag', 'last-modified'];
      responseHeaders.forEach(header => {
        const value = response.headers[header];
        if (value) {
          res.setHeader(header, value);
        }
      });
      
      // 发送响应数据
      res.send(response.data);
      
    } catch (error) {
      // 错误已经在service中处理，直接抛出
      throw error;
    }
  }
}