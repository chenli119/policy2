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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootProxyController = void 0;
const common_1 = require("@nestjs/common");
const proxy_service_1 = require("./proxy/proxy.service");
let RootProxyController = class RootProxyController {
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async handleRootProxy(url, req, res, headers, body) {
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        return this.forwardRequest(req.method, url, headers, body, req, res);
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
exports.RootProxyController = RootProxyController;
__decorate([
    (0, common_1.All)(['/', '/api']),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Headers)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RootProxyController.prototype, "handleRootProxy", null);
exports.RootProxyController = RootProxyController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService])
], RootProxyController);
//# sourceMappingURL=root-proxy.controller.js.map