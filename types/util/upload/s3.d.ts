/**
 * @file 支持 AWS S3 协议的文件存储服务
 * @author svon.me@gmail.com
 */
import { Result } from "./res";
import { S3Client } from "@aws-sdk/client-s3";
export type ChangeCallback = (file: File, progress: number, res?: Result) => void;
export default class Client extends S3Client {
    private readonly files;
    chunkSize: number;
    chunkCount: number;
    private event;
    constructor(files: File[]);
    on(callback: ChangeCallback): void;
    private onChange;
    hasObject(file: File, path?: string): Promise<Result | undefined>;
    simpleUpload(file: File): Promise<Result>;
    private getClient;
    multipartUpload(file: File): Promise<Result>;
    start(): Promise<Result[]>;
}
