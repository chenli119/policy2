"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyController = void 0;
const common_1 = require("@nestjs/common");
const express_1 = require("express");
const proxy_service_1 = require("./proxy.service");
let ProxyController = class ProxyController {
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async handleOptions(res) {
        res.status(200).end();
    }
    async handleGet(url, req, res, headers) {
        return this.forwardRequest('GET', url, headers, null, req, res);
    }
    async handlePost(url, body, req, res, headers) {
        return this.forwardRequest('POST', url, headers, body, req, res);
    }
    async handlePut(url, body, req, res, headers) {
        return this.forwardRequest('PUT', url, headers, body, req, res);
    }
    async handleDelete(url, req, res, headers) {
        return this.forwardRequest('DELETE', url, headers, null, req, res);
    }
    async handlePatch(url, body, req, res, headers) {
        return this.forwardRequest('PATCH', url, headers, body, req, res);
    }
    async forwardRequest(method, url, headers, body, req, res) {
        try {
            const response = await this.proxyService.forwardRequest(url, method, headers, body);
            res.status(response.status);
            const responseHeaders = ['content-type', 'content-length', 'cache-control', 'etag', 'last-modified'];
            responseHeaders.forEach(header => {
                const value = response.headers[header];
                if (value) {
                    res.setHeader(header, value);
                }
            });
            res.send(response.data);
        }
        catch (error) {
            throw error;
        }
    }
};
exports.ProxyController = ProxyController;
__decorate([
    (0, common_1.Options)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "handleOptions", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _b : Object, typeof (_c = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "handleGet", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __param(4, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_d = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _d : Object, typeof (_e = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "handlePost", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __param(4, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_f = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _f : Object, typeof (_g = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _g : Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "handlePut", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_h = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _h : Object, typeof (_j = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _j : Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "handleDelete", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __param(4, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_k = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _k : Object, typeof (_l = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _l : Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "handlePatch", null);
exports.ProxyController = ProxyController = __decorate([
    (0, common_1.Controller)('proxy'),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService])
], ProxyController);
//# sourceMappingURL=proxy.controller.js.map