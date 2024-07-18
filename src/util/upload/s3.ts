/**
 * @file 支持 AWS S3 协议的文件存储服务
 * @author svon.me@gmail.com
 */

import * as _ from "../index";
// @ts-ignore
import * as R2Config from "./r2";
import {Result, Status} from "./res";

import {Upload} from "@aws-sdk/lib-storage";
import safeGet from "@fengqiaogang/safe-get";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  HeadObjectCommand,
  S3Client,
  UploadPartCommand
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

export type ChangeCallback = (file: File, progress: number, res?: Result) => void;

class FileChunk {
  constructor(public start: number, public end: number, public index: number) {
  }
}

const getFileMeta = function (file: File) {
  const name: string = encodeURIComponent(file.name);
  return {
    // 文件基础信息
    // Key Value 均为 String 类型
    name,                 // 名称
    size: String(file.size),                 // 大小
    type: String(file.type),                 // 类型
    lastmodified: String(file.lastModified), // 最后修改时间
  }
}

const fileMd5 = function (file: File): string {
  const meta = getFileMeta(file);
  const value = _.UUIDV5(meta.name, meta.size, meta.type, meta.lastmodified);
  return value ? value : _.UUID();
}

const filePath = function (file: File): string {
  const md5: string = fileMd5(file);
  const name: string = _.MD5(file.name);
  const index: number = file.name.lastIndexOf(".");
  const suffix: string = file.name.slice(index + 1);
  return `${md5}/${name}.${suffix}`;
}

const getContentDisposition = function (file: File) {
  if (file && file.name) {
    return `attachment; filename="${encodeURIComponent(decodeURIComponent(file.name))}"`
  }
  return "attachment";
}

export default class Client extends S3Client {
  private readonly files: File[] = [];        // 需要上传的文件列表
  public chunkSize: number = 5 * 1024 * 1024; // 切片大小
  public chunkCount: number = 4;

  private event = new Set<ChangeCallback>();

  constructor(public Bucket: string, files: File[]) {
    const config = {
      region: R2Config.region,
      endpoint: R2Config.host,
      credentials: {
        accessKeyId: R2Config.accessKey,
        secretAccessKey: R2Config.secretKey,
      },
    };
    super(config);
    this.files = files;
  }

  // 绑定回调事件
  on(callback: ChangeCallback) {
    if (callback) {
      this.event.add(callback);
    }
  }

  private onChange(file: File, progress: number = 0, res?: Result) {
    for (const callback of this.event) {
      callback(file, Math.min(progress, 100), res);
    }
  }

  async hasObject(file: File, path: string = filePath(file)): Promise<Result | undefined> {
    try {
      const command = new HeadObjectCommand({
        Key: path,
        Bucket: this.Bucket,
      });
      const res = await this.send(command);
      const ETag = safeGet<string>(res, "ETag");
      return new Result(file, path, ETag);
    } catch (error) {
      // todo
    }
  }

  // 单文件直接上传
  async simpleUpload(file: File): Promise<Result> {
    this.onChange(file, 0);
    const path: string = filePath(file);
    // 判断文件是否存在
    const hasValue = await this.hasObject(file);
    if (hasValue) {
      this.onChange(file, 100, hasValue);
      // 直接返回文件信息
      return hasValue;
    }
    const http: Upload = new Upload({
      client: this,
      params: {
        Key: path,
        Body: file,
        ContentType: file.type,
        ContentLength: file.size,
        ContentDisposition: getContentDisposition(file),
        Bucket: this.Bucket,
        Metadata: getFileMeta(file),
      }
    });
    try {
      const res = await http.done();
      const ETag = safeGet<string>(res, "ETag");
      const value = new Result(file, path, ETag);
      this.onChange(file, 100, value);
      return value;
    } catch (e) {
      const res = new Result(file, void 0, void 0, Status.abnormal);
      this.onChange(file, 0, res);
      // todo
      return Promise.reject(e);
    }
  }


  private async getClient(file: File, path: string = filePath(file)) {
    const command = new CreateMultipartUploadCommand({
      Key: path,
      Bucket: this.Bucket,
      ContentType: file.type,
      ContentDisposition: getContentDisposition(file),
      Metadata: getFileMeta(file),
    });
    // 创建临时的切片文件上传空间
    const box = await this.send(command);
    return {
      chunks: () => {
        const size = file.size;
        const list: Array<FileChunk> = [];
        const chunkSize = this.chunkSize;
        const totalChunks = Math.ceil(size / chunkSize);
        let end = 0;
        for (let i = 0; i < totalChunks; i++) {
          const start = end;
          end = Math.min(start + chunkSize, size);
          list.push(new FileChunk(start, end, i + 1));
        }
        return list;
      },
      url: (partNumber: number) => {
        const part = new UploadPartCommand({
          Key: path,
          Bucket: this.Bucket,
          UploadId: box.UploadId,
          PartNumber: partNumber
        });
        return getSignedUrl(this, part, {expiresIn: 60 * 5});
      },
      merge: (parts: object[]) => {
        // 对切片列表进行排序
        const list = parts.sort(function (a: object, b: object) {
          const number1 = Number(safeGet(a, "PartNumber"));
          const number2 = Number(safeGet(b, "PartNumber"));
          return number1 - number2;
        });
        const command = new CompleteMultipartUploadCommand({
          Key: path,
          Bucket: this.Bucket,
          UploadId: box.UploadId,
          MultipartUpload: {Parts: list},
        });
        return this.send(command);
      },
      upload: async (item: FileChunk): Promise<object> => {
        const value = file.slice(item.start, item.end);
        const commandChunk = new UploadPartCommand({
          Key: path,
          Body: value,
          UploadId: box.UploadId,
          PartNumber: item.index,
          Bucket: this.Bucket
        });
        try {
          const res = await this.send(commandChunk);
          const ETag = safeGet<string>(res, "ETag")!;
          return {ETag, PartNumber: String(item.index)};
        } catch (e) {
          // todo
          return Promise.reject(e);
        }
      }
    }
  }

  // 大文件切分片上传
  async multipartUpload(file: File) {
    const size = file.size;
    if (size <= this.chunkSize) {
      return this.simpleUpload(file);
    }
    const path: string = filePath(file);
    // 判断文件是否已上传
    const hasValue = await this.hasObject(file, path);
    if (hasValue) {
      // 直接返回文件信息
      return hasValue;
    }

    this.onChange(file, 0);

    const result: object[] = [];
    const client = await this.getClient(file, path);
    const chunkList = client.chunks();

    const batchUpload = async (tasks: FileChunk[]) => {
      const executing = new Set();
      const abnormal: FileChunk[] = [];  // 记录上传失败的切片

      // 定义一个函数来处理单个任务
      const enqueue = async (task: FileChunk) => {
        // 开始处理任务，并将Promise添加到执行集合
        const p = client.upload(task).then(value => {
          result.push(value);
          const progress = (result.length / chunkList.length * 100).toFixed(2);
          this.onChange(file, Number(progress));
        });
        executing.add(p); // 将任务添加到执行集合
        p.catch(() => abnormal.push(task));
        p.finally(() => executing.delete(p));

        // 如果当前正在执行的任务数达到并行限制，等待任意一个任务完成
        if (executing.size >= this.chunkCount) {
          await Promise.race(executing);
        }
      };
      // 遍历所有任务，依次开始处理
      for (const task of tasks) {
        await enqueue(task);
      }
      // 等待所有任务完成
      while (executing.size > 0) {
        await Promise.race(executing);
      }
      if (abnormal.length > 0) {
        return batchUpload(abnormal);
      }
    }
    // 开始批量上传
    await batchUpload(chunkList);
    try {
      await client.merge(result);
      const res = new Result(file, path);
      this.onChange(file, 100, res);
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async start() {
    const list: Result[] = [];
    const abnormal: File[] = [];
    let abnormalAgainCount: number = 3;
    const count = this.files.length;
    const upload = async (files: File[]) => {
      for (let i = 0; i < count; i++) {
        const file = files[i];
        try {
          const res = await this.multipartUpload(file);
          list.push(res);
        } catch (e) {
          abnormal.push(file)
        }
      }
      if (abnormal.length > 0) {
        abnormalAgainCount -= 1;
      }
    }
    do {
      await upload(this.files);
    } while (abnormal.length > 0 && abnormalAgainCount > 0);
    return list;
  }
}