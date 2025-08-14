import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
export declare class ProxyController {
    private readonly proxyService;
    constructor(proxyService: ProxyService);
    handleOptions(res: Response): Promise<void>;
    handleGet(url: string, req: Request, res: Response, headers: Record<string, string>): Promise<void>;
    handlePost(url: string, body: any, req: Request, res: Response, headers: Record<string, string>): Promise<void>;
    handlePut(url: string, body: any, req: Request, res: Response, headers: Record<string, string>): Promise<void>;
    handleDelete(url: string, req: Request, res: Response, headers: Record<string, string>): Promise<void>;
    handlePatch(url: string, body: any, req: Request, res: Response, headers: Record<string, string>): Promise<void>;
    private forwardRequest;
}
