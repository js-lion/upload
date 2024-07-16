import * as _ from "../util/index";
import S3Client from "../util/upload/s3";
import acceptVerification from "./accept";
import type {AcceptFun} from "./accept";
import type {ChangeCallback} from "../util/upload/s3";

interface Config {
  multiple?: boolean;          // 是否多选，默认单选
  accept?: string | AcceptFun;  // 文件格式限制
  maxSize: number;             // 单个文件大小限制, 单位 M
  limit: number;               // 单次允许上传的文件数量上限
  bucket: string;              // 存储桶的名称
}

export const getAcceptValue = function (value: string | AcceptFun) {
  if (value && typeof value === "string") {
    if (value.includes("image/") || value.includes("video/")) {
      return value.trim();
    }
    const list = _.compact(value.toLocaleLowerCase().split(/[、,，\s]/g));
    // 限制的文件格式越多，弹出的文件对话框越卡（需要的系统性能越多）
    if (list.length > 0 && list.length <= 3) {
      return list.map(value => `.${value}`).join(",");
    }
  }
  return "*";
}

// 上传文件
export const onUploadFile = async function (config: Config, files: File[], onChange: ChangeCallback) {
  if (!config.bucket) {
    return Promise.reject({type: "bucket"});
  }
  // 判断文件数量
  if (config.limit && config.limit > 0) {
    if (config.limit < files.length) {
      return Promise.reject({
        type: "limit",
        allow: config.limit,
        current: files.length
      });
    }
  }
  // 校验文件
  for (const file of files) {
    // 判断文件格式
    const status = await acceptVerification(config.accept, file);
    if (!status) {
      return Promise.reject({
        type: "accept",
        current: file.name
      });
    }

    // 判断文件大小
    if (config.maxSize && config.maxSize > 0) {
      const size = parseFloat((file.size / 1024 / 1024).toFixed(2));
      if (size > config.maxSize) {
        return Promise.reject({
          type: "size",
          allow: config.maxSize,
          current: size
        });
      }
    }
  }

  // 文件开始上传
  const client = new S3Client(config.bucket, files);
  client.on(onChange);
  return await client.start();
}