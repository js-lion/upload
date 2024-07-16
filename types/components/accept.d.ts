/**
 * @file 文件格式判断
 * @author svon.me@gmail.com
 */
export type AcceptFun = (file: File) => boolean | Promise<boolean>;
export default function (accept?: string | AcceptFun, file?: File): Promise<boolean>;
