"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let ProxyService = class ProxyService {
    async forwardRequest(targetUrl, method, headers = {}, body) {
        try {
            this.validateUrl(targetUrl);
            const config = {
                method: method.toLowerCase(),
                url: targetUrl,
                headers: this.prepareHeaders(headers),
                timeout: 30000,
                maxRedirects: 5,
                validateStatus: () => true,
            };
            if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
                config.data = body;
            }
            const response = await (0, axios_1.default)(config);
            return response;
        }
        catch (error) {
            console.error('代理请求失败:', error.message);
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                throw new common_1.BadRequestException({
                    error: '目标服务器无法访问',
                    message: '请检查URL是否正确或目标服务是否可用',
                    targetUrl
                });
            }
            if (error.code === 'ETIMEDOUT') {
                throw new common_1.InternalServerErrorException({
                    error: '请求超时',
                    message: '目标服务器响应超时',
                    targetUrl
                });
            }
            throw new common_1.InternalServerErrorException({
                error: '代理请求失败',
                message: error.message,
                targetUrl,
                timestamp: new Date().toISOString()
            });
        }
    }
    validateUrl(url) {
        if (!url) {
            throw new common_1.BadRequestException({
                error: '缺少url参数',
                usage: '请使用 ?url=目标URL 的格式'
            });
        }
        try {
            const parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new common_1.BadRequestException({
                    error: 'URL协议不支持',
                    message: '只支持 http:// 和 https:// 协议',
                    provided: url
                });
            }
        }
        catch (error) {
            throw new common_1.BadRequestException({
                error: 'URL格式无效',
                message: '请提供有效的URL格式',
                provided: url
            });
        }
    }
    prepareHeaders(originalHeaders) {
        const headers = {
            'User-Agent': 'CORS-Proxy-NestJS/1.0'
        };
        const allowedHeaders = [
            'authorization',
            'content-type',
            'accept',
            'accept-language',
            'cache-control',
            'x-requested-with'
        ];
        allowedHeaders.forEach(header => {
            const value = originalHeaders[header] || originalHeaders[header.toLowerCase()];
            if (value) {
                headers[header] = value;
            }
        });
        return headers;
    }
};
exports.ProxyService = ProxyService;
exports.ProxyService = ProxyService = __decorate([
    (0, common_1.Injectable)()
], ProxyService);
//# sourceMappingURL=proxy.service.js.map