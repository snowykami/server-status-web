/// <reference types="node" />
export interface Status {
    meta: {
        id: string; // 服务器ID，用于标识服务器
        name: string;
        os: {
            name: string;
            version: string;
        };
        labels: string[]; // 服务器标签
        location: string; // Chongqing, China
        uptime: number; // uptime in seconds
        link: string | null; // 链接或是nil
        observed_at: number; // unix timestamp
    };
    hardware: {
        mem: {
            total: number;
            used: number;
        };
        swap: {
            total: number;
            used: number;
        };
        cpu: {
            cores: number;
            logics: number;
            percent: number; // 0-100
        };
        disks: {
            [key: string]: {
                used: number;
                total: number;
            };
        };
        net: {
            up: number;
            down: number;
            type: string; // IPv4 or IPv6 or IPv4/6
        };
    };
}

const apiRoot = import.meta.env.VITE_API_ROOT

export async function getStatuses(): Promise<Record<string, Status>> {
    const response = await fetch(`${apiRoot}/api/status`)
    return response.json()
}