import Swagger, {OperationsDict} from "./swagger";
import {OpenAPI} from "./openapi-types";
import Operation = OpenAPI.Operation;
import {Dict} from "./utils";

class OperationNotFoundError implements Error {
  message: string;
  name: string;
}

export default class SwaggerClient {
  private _operations: Dict<OperationsDict>;
  private _swagger: Swagger;

  constructor(operations: Dict<OperationsDict>, swagger: Swagger) {
    this._operations = operations;
    this._swagger = swagger;
  }

  exec(operation: string, parameters: any): Promise<any> {
    if (this._operations[operation] === undefined) {
      throw new OperationNotFoundError()
    }

    // const op: Operation = this._operations[operation];

    return ;
  }
}
