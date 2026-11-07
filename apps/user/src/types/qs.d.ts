declare module "qs" {
  export interface IStringifyOptions {
    delimiter?: string;
    strictNullHandling?: boolean;
    skipNulls?: boolean;
    encode?: boolean;
    encoder?: (str: any, defaultEncoder: any, charset: string, type: "key" | "value") => string;
    filter?: Array<string | number> | ((prefix: string, value: any) => any);
    arrayFormat?: "indices" | "brackets" | "repeat" | "comma";
    indices?: boolean;
    sort?: (a: any, b: any) => number;
    serializeDate?: (d: Date) => string;
    format?: "RFC1738" | "RFC3986";
    encodeValuesOnly?: boolean;
    addQueryPrefix?: boolean;
    allowDots?: boolean;
    charset?: "utf-8" | "iso-8859-1";
    charsetSentinel?: boolean;
  }

  export function stringify(obj: any, options?: IStringifyOptions): string;
  export function parse(str: string, options?: any): any;
}

