export declare const UUID: () => any;
export declare const UUIDV5: (...args: string[]) => string | undefined;
export declare const compact: <T = any>(list: T[]) => T[];
export declare const toLower: (value: string) => string;
export declare const last: <T = any>(list: T[] | string) => T | string | undefined;
export declare const chunk: <T = any>(list: T[], size: number) => T[][];
