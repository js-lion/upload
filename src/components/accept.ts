/**
 * @file 文件格式判断
 * @author svon.me@gmail.com
 */

import * as _ from "../util/index";

export type AcceptFun = (file: File) => boolean | Promise<boolean>;

export default async function (accept?: string | AcceptFun, file?: File): Promise<boolean> {
  // 判断条件为空，直接默认为允许上传
  if (!accept) {
    return true;
  }

  // 如果 accept 为函数，则表示自行校验
  if (file && accept && typeof accept === "function") {
    try {
      return await accept(file);
    } catch (e) {
      // 异常时默认为不允许上传
      return false;
    }
  }
  if (file && accept && typeof accept === "string") {
    // 判断是否为 * 号，表示支持任意文件
    if (accept.trim() === "*") {
      return true;
    }
    // 任意图片类型
    if (accept.trim() === "image/*" && file.type.includes("image/")) {
      return true;
    }
    // 任意视频类型
    if (accept.trim() === "video/*" && file.type.includes("video/")) {
      return true;
    }
    // 通过文件后缀进行判断
    const suffix = _.last<string>(_.toLower(file.name).split(".")); // 获取文件后缀
    const list = _.toLower(accept).split(/[、,，\s]/g);
    if (suffix && list.includes(suffix)) {
      return true;
    }
  }
  return false;
}