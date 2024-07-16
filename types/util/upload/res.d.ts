export declare enum Status {
    wait = "wait",// 等待中 / 暂停中
    progress = "progress",// 进行中
    complete = "complete",// 上传完成
    abnormal = "abnormal"
}
export declare class Result {
    size: number;
    type: string;
    name: string;
    path?: string;
    url?: string;
    ETag?: string;
    status: Status;
    constructor(file: File, path?: string, ETag?: string, status?: Status);
}
