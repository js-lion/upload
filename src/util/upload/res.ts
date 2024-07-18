export enum Status {
  wait = "wait",         // 等待中 / 暂停中
  progress = "progress", // 进行中
  complete = "complete", // 上传完成
  abnormal = "abnormal", // 异常情况
}

export class Result {
  size: number;
  type: string;
  name: string;
  path?: string;
  ETag?: string;
  status: Status;

  constructor(file: File, path?: string, ETag?: string, status: Status = Status.complete) {
    this.size = file.size;
    this.type = file.type;
    this.name = file.name;
    this.ETag = ETag;
    this.status = status;

    if (path && /^\//.test(path)) {
      this.path = `${path}?name=${encodeURIComponent(file.name)}`;
    } else if (path) {
      this.path = `/${path}?name=${encodeURIComponent(file.name)}`;
    }
  }
}