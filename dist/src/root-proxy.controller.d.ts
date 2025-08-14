import { Request, Response } from 'express';
import { ProxyService } from './proxy/proxy.service';
export declare class RootProxyController {
    private readonly proxyService;
    constructor(proxyService: ProxyService);
    handleRootProxy(url: string, req: Request, res: Response, headers: Record<string, string>, body?: any): Promise<void>;
    private forwardRequest;
}
