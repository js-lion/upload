/**
 * @file 文件上传
 * @author svon.me@gmail.com
 */
export { default as S3 } from "./util/upload/s3";
export { Result, Status } from "./util/upload/res";
export { default as Upload } from "./components/upload.vue";
export type { ChangeCallback } from "./util/upload/s3";
export type { AcceptFun as Accept } from "./components/accept";
