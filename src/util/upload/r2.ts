/*
   令牌值 = HEvgdpNEpP931FHZcQKCrBoJjEoeONjG6bzLtohY
   密钥 ID = 1ea3da8d2ae7e6e77acd1f713e64382c
   机密访问密钥 = fd262505de1dd221ca6ec1df6d9700ca934f2a78765d8a96e89043b6d1a34e8f
   为 S3 客户端使用管辖权地特定的终结点：
    https://be9673e066773ba239c31b3befeaa983.r2.cloudflarestorage.com
    https://be9673e066773ba239c31b3befeaa983.eu.r2.cloudflarestorage.com （欧盟）
*/

// export const accountId: string = "be9673e066773ba239c31b3befeaa983";

export const Bucket: string = "file";
export const accountId: string = "be9673e066773ba239c31b3befeaa983";

export const region: string = "APAC";
export const host: string = `https://${accountId}.r2.cloudflarestorage.com`;
export const accessKey: string = "1ea3da8d2ae7e6e77acd1f713e64382c";
export const secretKey: string = "fd262505de1dd221ca6ec1df6d9700ca934f2a78765d8a96e89043b6d1a34e8f";
