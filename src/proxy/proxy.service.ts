import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

/**
 * 代理服务类
 * 负责处理HTTP请求的转发和响应
 */
@Injectable()
export class ProxyService {
  
  /**
   * 转发HTTP请求到目标URL
   * @param targetUrl 目标URL
   * @param method HTTP方法
   * @param headers 请求头
   * @param body 请求体
   * @returns Promise<AxiosResponse> 响应数据
   */
  async forwardRequest(
    targetUrl: string,
    method: string,
    headers: Record<string, string> = {},
    body?: any
  ): Promise<AxiosResponse> {
    try {
      // 验证URL格式
      this.validateUrl(targetUrl);
      
      // 准备请求配置
      const config: AxiosRequestConfig = {
        method: method.toLowerCase() as any,
        url: targetUrl,
        headers: this.prepareHeaders(headers),
        timeout: 30000, // 30秒超时
        maxRedirects: 5,
        validateStatus: () => true, // 接受所有状态码
      };
      
      // 如果有请求体，添加到配置中
      if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
        config.data = body;
      }
      
      // 发起请求
      const response = await axios(config);
      
      return response;
      
    } catch (error) {
      console.error('代理请求失败:', error.message);
      
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new BadRequestException({
          error: '目标服务器无法访问',
          message: '请检查URL是否正确或目标服务是否可用',
          targetUrl
        });
      }
      
      if (error.code === 'ETIMEDOUT') {
        throw new InternalServerErrorException({
          error: '请求超时',
          message: '目标服务器响应超时',
          targetUrl
        });
      }
      
      throw new InternalServerErrorException({
        error: '代理请求失败',
        message: error.message,
        targetUrl,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * 验证URL格式
   * @param url 要验证的URL
   */
  private validateUrl(url: string): void {
    if (!url) {
      throw new BadRequestException({
        error: '缺少url参数',
        usage: '请使用 ?url=目标URL 的格式'
      });
    }
    
    try {
      const parsedUrl = new URL(url);
      
      // 只允许HTTP和HTTPS协议
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new BadRequestException({
          error: 'URL协议不支持',
          message: '只支持 http:// 和 https:// 协议',
          provided: url
        });
      }
      
    } catch (error) {
      throw new BadRequestException({
        error: 'URL格式无效',
        message: '请提供有效的URL格式',
        provided: url
      });
    }
  }
  
  /**
   * 准备请求头
   * @param originalHeaders 原始请求头
   * @returns 处理后的请求头
   */
  private prepareHeaders(originalHeaders: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'CORS-Proxy-NestJS/1.0'
    };
    
    // 允许转发的请求头
    const allowedHeaders = [
      'authorization',
      'content-type',
      'accept',
      'accept-language',
      'cache-control',
      'x-requested-with'
    ];
    
    // 转发允许的请求头
    allowedHeaders.forEach(header => {
      const value = originalHeaders[header] || originalHeaders[header.toLowerCase()];
      if (value) {
        headers[header] = value;
      }
    });
    
    return headers;
  }
}