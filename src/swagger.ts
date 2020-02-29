import {OpenAPIV2, OpenAPIV3} from "./openapi-types";
import SwaggerClient from "./swagger-client";
import {FetchableInterface, Dict} from "./utils";
import OperationObject = OpenAPIV3.OperationObject;

interface SwaggerOptions {
  spec: OpenAPIV2.Document;
  httpClient: FetchableInterface;
}

export interface OperationsDict {
  path: string;
  tag?: string;
  method: 'get' | 'put' | 'post' | 'del' | 'delete' | 'options' | 'head' | 'patch' ;
  operation: OpenAPIV2.OperationObject;
}

export default class Swagger {
  private _spec: OpenAPIV2.Document;

  constructor(options: SwaggerOptions) {
    this._spec = options.spec;
  }

  get(tag: string): SwaggerClient {
    return new SwaggerClient(this.getOperationsByTag(tag), this);
  }

  getOperationsByTag(tag: string): Dict<OperationsDict> {
    return Object.keys(this._spec.paths).reduce((res: any, path: string) => {
      return Object.keys(this._spec.paths[path]).reduce((r: any, method: string) => {
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
      }, {})
    }, {})
  }
}
