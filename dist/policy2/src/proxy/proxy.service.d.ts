import { AxiosResponse } from 'axios';
export declare class ProxyService {
    forwardRequest(targetUrl: string, method: string, headers?: Record<string, string>, body?: any): Promise<AxiosResponse>;
    private validateUrl;
    private prepareHeaders;
}
