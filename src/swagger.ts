import {OpenAPIV2, OpenAPIV3} from "./openapi-types";
import SwaggerClient from "./swagger-client";
import {FetchableInterface, Dict, FetchOptions, Method} from "./utils";
import OperationObject = OpenAPIV3.OperationObject;
interface SwaggerOptions {
  spec?: OpenAPIV2.Document;
  httpClient: FetchableInterface;
  url?: string;
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

export async function buildSwaggerByUrl(options: SwaggerOptions) {
  const a = await options.httpClient.fetch(options.url,{method:"GET"})
  return new Swagger({
    ...options,
    spec: a.data
  })
}

export default class Swagger{
  private _spec: OpenAPIV2.Document;
  private _httpClient: FetchableInterface;
  private _url: string;

  constructor(options: SwaggerOptions) {
    this._spec = options.spec;
    this._httpClient = options.httpClient;
    this._url = options.url
  }

  get baseUrl(): string {
    return this._spec.host + this._spec.basePath;
  }

  async fetchSpec(url: string){
    if(!url) return;

    const response = await this.fetch(url, {
        method: "GET"
      });
    this._url = url;
    this._spec = response.data;
    return this
  }

  get spec(): OpenAPIV2.Document {
    return this._spec;
  }

  get url(): String {
    return this._url;
  }

  fetch(url: string, options: FetchOptions): Promise<any> {
    return this._httpClient.fetch(url, options);
  }

  get(tag: string): SwaggerClient {
    const operations = this.getOperationsByTag(tag);
    if (Object.keys(operations).length === 0) {
      throw new TagOperationNotFoundError();
    }
    return new SwaggerClient(operations, this);
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
