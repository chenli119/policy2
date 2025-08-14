import { Controller, Get, Post, Put, Delete, Patch, Options, Query, Req, Res, Body, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

/**
 * 代理控制器
 * 处理所有HTTP方法的代理请求
 */
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}
  
  /**
   * 处理OPTIONS预检请求
   * @param res Express响应对象
   */
  @Options()
  async handleOptions(@Res() res: Response) {
    res.status(200).end();
  }
  
  /**
   * 处理GET请求
   * @param url 目标URL
   * @param req Express请求对象
   * @param res Express响应对象
   * @param headers 请求头
   */
  @Get()
  async handleGet(
    @Query('url') url: string,
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>
  ) {
    return this.forwardRequest('GET', url, headers, null, req, res);
  }
  
  /**
   * 处理POST请求
   * @param url 目标URL
   * @param body 请求体
   * @param req Express请求对象
   * @param res Express响应对象
   * @param headers 请求头
   */
  @Post()
  async handlePost(
    @Query('url') url: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>
  ) {
    return this.forwardRequest('POST', url, headers, body, req, res);
  }
  
  /**
   * 处理PUT请求
   * @param url 目标URL
   * @param body 请求体
   * @param req Express请求对象
   * @param res Express响应对象
   * @param headers 请求头
   */
  @Put()
  async handlePut(
    @Query('url') url: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>
  ) {
    return this.forwardRequest('PUT', url, headers, body, req, res);
  }
  
  /**
   * 处理DELETE请求
   * @param url 目标URL
   * @param req Express请求对象
   * @param res Express响应对象
   * @param headers 请求头
   */
  @Delete()
  async handleDelete(
    @Query('url') url: string,
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>
  ) {
    return this.forwardRequest('DELETE', url, headers, null, req, res);
  }
  
  /**
   * 处理PATCH请求
   * @param url 目标URL
   * @param body 请求体
   * @param req Express请求对象
   * @param res Express响应对象
   * @param headers 请求头
   */
  @Patch()
  async handlePatch(
    @Query('url') url: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>
  ) {
    return this.forwardRequest('PATCH', url, headers, body, req, res);
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