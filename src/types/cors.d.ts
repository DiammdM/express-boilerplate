declare module "cors" {
  import type { RequestHandler } from "express";

  type CorsRequestOrigin = string | undefined;
  type CorsOriginCallback = (error: Error | null, allow?: boolean) => void;

  export interface CorsOptions {
    origin?:
      | boolean
      | string
      | RegExp
      | Array<boolean | string | RegExp>
      | ((origin: CorsRequestOrigin, callback: CorsOriginCallback) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    credentials?: boolean;
    optionsSuccessStatus?: number;
  }

  function cors(options?: CorsOptions): RequestHandler;

  export default cors;
}
