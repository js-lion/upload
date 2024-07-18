import {v1 as uuidV1, v4 as uuidV4, v5 as uuidV5} from "uuid";


export const MD5 = function (value: string): string {
  return uuidV5(value, uuidV5.URL).replace(/-/ig, "");
};

// 生成唯一值
export const UUID = function () {
  let value;
  if (Math.random() > 0.45) {
    value = uuidV1();
  } else {
    value = uuidV4();
  }
  return value;
};

export const UUIDV5 = function (...args: string[]): string | undefined {
  if (args.length > 0) {
    if (args.length === 1 && typeof args[0] === "string") {
      return uuidV5(args[0], uuidV5.URL);
    }
    const text = JSON.stringify(args);
    return uuidV5(text, uuidV5.URL);
  }
  return void 0;
};

export const compact = function <T = any>(list: T[]): T[] {
  const value: T[] = [];
  for (const item of list) {
    if (item) {
      value.push(item);
    }
  }
  return value;
}

export const toLower = function (value: string): string {
  return String(value).toLocaleLowerCase();
}

export const last = function <T = any>(list: T[] | string): T | string | undefined {
  if (list && list.length > 0) {
    return list.slice(-1)[0];
  }
  return void 0;
}

export const chunk = function <T = any>(list: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < list.length; i += size) {
    // 每次从原数组中取出一个子数组
    const chunk = list.slice(i, i + size);
    result.push(chunk);
  }
  return result;
}
