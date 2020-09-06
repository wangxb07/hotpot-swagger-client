import {OpenAPIV2, OpenAPIV3} from "./openapi-types";
import SwaggerClient from "./swagger-client";
import {Dict, FetchOptions, Method} from "./utils";
import OperationObject = OpenAPIV3.OperationObject;
import {AxiosInstance} from "axios";


interface DefaultParams {
  schema: string
}

interface SwaggerOptions {
  spec?: OpenAPIV2.Document;
  httpClient: AxiosInstance;
  url?: string;
  defaultParams?: DefaultParams
}

export interface OperationsDict {
  path: string;
  tag?: string;
  method: Method ;
  operation: OpenAPIV2.OperationObject;
}

export class TagOperationNotFoundError implements Error {
  message: string;
  name: string;
}

export default class Swagger {
  private _spec: OpenAPIV2.Document;
  private _httpClient: AxiosInstance;
  private _url: string;
  private _defaultParams: DefaultParams;

  constructor(options: SwaggerOptions) {
    this._spec = options.spec;
    this._httpClient = options.httpClient;

    if (options.defaultParams) {
      this._defaultParams = options.defaultParams;
    }
  }

  get baseUrl(): string {
    return this._spec.host + this._spec.basePath;
  }

  get spec(): OpenAPIV2.Document {
    return this._spec;
  }

  fetch(url: string, options: FetchOptions): Promise<any> {
    options.url = url;
    return this._httpClient.request(options);
  }

  get(tag: string): SwaggerClient {
    const operations = this.getOperationsByTag(tag);
    if (Object.keys(operations).length === 0) {
      console.error("TagOperationNotFoundError");
      throw new TagOperationNotFoundError();
    }
    const c = new SwaggerClient(operations, this);
    if (this._defaultParams) {
      c.defaultParams = this._defaultParams;
    }
    return c
  }

  getOperationsByTag(tag: string): Dict<OperationsDict> {
    return Object.keys(this._spec.paths).reduce((result: any, path: string) => {
      const res = Object.keys(this._spec.paths[path]).reduce((r: any, method: string) => {
        const op: OperationObject = this._spec.paths[path][method];

        if (op.tags.findIndex(t => tag === t) >= 0) {
          if (op.operationId) {
            return Object.assign({}, r, {
              [`id:${op.operationId}`]: {
                path, tag, method,
                operation: op,
              }
            })
          }
          return Object.assign({}, r, {
            [`path:${path}`]: {
              path, tag, method,
              operation: op,
            }
          })
        }

        return r;
      }, {});
      return Object.assign({}, result, res)
    }, {})
  }
}
