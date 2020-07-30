import Swagger, {OperationsDict} from "./swagger";
import {OpenAPIV2} from "./openapi-types";
import {Dict, FetchOptions} from "./utils";

export class OperationNotFoundError implements Error {
  message: string;
  name: string;
}

export class RequiredParameterMissError implements Error {
  message: string;
  name: string;
}

export class SchemaNotAllowError implements Error {
  message: string;
  name: string;
}

export default class SwaggerClient {
  private _operations: Dict<OperationsDict>;
  private _swagger: Swagger;
  private _defaultParams: any;

  constructor(operations: Dict<OperationsDict>, swagger: Swagger) {
    this._operations = operations;
    this._swagger = swagger;
  }

  get defaultParams(): any {
    return this._defaultParams;
  }

  set defaultParams(value: any) {
    this._defaultParams = value;
  }

  exec(operation: string, parameters: any): Promise<any> {
    const url = this.buildUrl(operation, parameters);
    const options = this.buildRequestOptions(operation, parameters);

    return this._swagger.fetch(url, options);
  }

  private _getOperation(name: string): OperationsDict {
    if (this._operations['id:' + name] !== undefined ) {
      return this._operations['id:' + name];
    }

    if (this._operations['path:' + name] === undefined) {
      console.error("OperationNotFoundError");
      throw new OperationNotFoundError();
    }

    return this._operations['path:' + name];
  }

  buildUrl(operation: string, params: any): string {
    if (this._defaultParams) {
      params = Object.assign({}, this._defaultParams, params)
    }

    const op = this._getOperation(operation);
    const spec = this._swagger.spec;

    let path = op.path;
    let schema = spec.schemes.length > 0 ? spec.schemes[0]: 'https';

    if (op.operation.parameters !== undefined) {
      op.operation.parameters.forEach((p) => {
        // @ts-ignore
        if (p.in === undefined) {
          return;
        }
        const dp: OpenAPIV2.Parameter = p as OpenAPIV2.Parameter;

        if (dp.required && dp.in !== 'body') {
          if (params[dp.name] === undefined) {
            console.error("RequiredParameterMissError");
            throw new RequiredParameterMissError();
          }
        }

        if (dp.in === 'path') {
          if (params[dp.name] === undefined) {
            console.error("RequiredParameterMissError in path");
            throw new RequiredParameterMissError();
          }
          path = path.replace(`{${dp.name}}`, params[dp.name]);
        }

        if (dp.in === 'query' && params[dp.name] !== undefined) {
          if (path.match(/\?/) === null) {
            path = `${path}?${dp.name}=${encodeURIComponent(params[dp.name])}`;
          }
          else {
            path = `${path}&${dp.name}=${encodeURIComponent(params[dp.name])}`;
          }
        }
      });
    }

    if (params['schema'] !== undefined) {
      schema = params['schema'];
    }

    return schema + '://' + this._swagger.baseUrl + path;
  }

  buildRequestOptions(operation: string, params: any): FetchOptions {
    if (this._defaultParams) {
      params = Object.assign({}, this._defaultParams, params)
    }

    const op = this._getOperation(operation);

    let headers = {};
    let body = {};

    if (op.operation.consumes !== undefined) {
      headers = Object.assign(headers, {
        'content-type': op.operation.consumes.join(";")
      })
    }

    if (op.operation.produces !== undefined) {
      headers = Object.assign(headers, {
        'accept': op.operation.produces.join(";")
      })
    }

    if (op.operation.parameters !== undefined) {
      op.operation.parameters.forEach((p) => {
        // @ts-ignore
        if (p.in === undefined) {
          return;
        }
        const dp: OpenAPIV2.Parameter = p as OpenAPIV2.Parameter;

        if (dp.in === 'body') {
          body = params['body'];
        }

        if (dp.in === 'formData' && params[dp.name] !== undefined) {
          body = Object.assign({}, body, {
            [dp.name]: params[dp.name],
          })
        }

        if (dp.in === 'header' &&  params[dp.name] !== undefined) {
          headers = Object.assign({}, headers, {
            [dp.name]: params[dp.name],
          })
        }
      });
    }

    return {
      method: op.method,
      headers,
      body
    }
  }
}
