import Swagger from "../src/swagger";
import SwaggerClient, {RequiredParameterMissError, OperationNotFoundError} from "../src/swagger-client";
import axios from "axios";

describe('SwaggerClient', () => {
  test('get client from swagger', () => {
    const swagger = new Swagger({
      spec: {
        swagger: '2.0',
        info: {
          version: '1.0.0',
          title: 'My test',
          description: 'The swagger spec description'
        },
        tags: [{
          name: 'store',
        }],
        paths: {
          'store/{store_uuid}': {
            'get': {
              tags: ['store']
            }
          }
        }
      },
      httpClient: axios
    });

    const client = swagger.get('store');
    expect(client).toBeInstanceOf(SwaggerClient);
  });

  test('get client url simple params', () => {
    const swagger = new Swagger({
      spec: {
        swagger: '2.0',
        info: {
          version: '1.0.0',
          title: 'My test',
          description: 'The swagger spec description'
        },
        tags: [{
          name: 'store',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http", "https"],
        paths: {
          '/store/{store_uuid}': {
            "get": {
              "consumes": ["application/json"],
              "summary": "获取商店评分",
              "operationId": "getStoreScoreByUuid",
              "tags": ["store"],
              "parameters" : [ {
                "in" : "path",
                "name" : "store_uuid",
                "description" : "the store uuid",
                "required" : true,
                "type" : "string"
              }],
            }
          }
        }
      },
      httpClient: axios
    });

    const client = swagger.get('store');

    const params = {
      store_uuid: "1"
    };
    const url = client.buildUrl("getStoreScoreByUuid", params);
    const options = client.buildRequestOptions("getStoreScoreByUuid", params);

    expect(url).toEqual('http://www.example.com/store/1.0.0/store/1');
    expect(options).toEqual({
      method: 'get',
      body: {},
      headers: {
        'content-type': "application/json",
      }
    })
  });

  test('required error throw', () => {
    const swagger = new Swagger({
      spec: {
        swagger: '2.0',
        info: {
          version: '1.0.0',
          title: 'My test',
          description: 'The swagger spec description'
        },
        tags: [{
          name: 'store',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http", "https"],
        paths: {
          '/store/{store_uuid}': {
            "get": {
              "consumes": ["application/json"],
              "summary": "获取商店评分",
              "operationId": "getStoreScoreByUuid",
              "tags": ["store"],
              "parameters" : [ {
                "in" : "path",
                "name" : "store_uuid",
                "description" : "the store uuid",
                "required" : true,
                "type" : "string"
              }],
            }
          }
        }
      },
      httpClient: axios
    });

    const client = swagger.get('store');

    const params = {
      store: "1"
    };

    expect(() => client.buildUrl("getStoreScoreByUuid", params)).toThrow(RequiredParameterMissError);
  });

  test('operation key is the path', () => {
    const swagger = new Swagger({
      spec: {
        swagger: '2.0',
        info: {
          version: '1.0.0',
          title: 'My test',
          description: 'The swagger spec description'
        },
        tags: [{
          name: 'store',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http", "https"],
        paths: {
          '/store/{store_uuid}': {
            "get": {
              "consumes": ["application/json"],
              "summary": "获取商店评分",
              "tags": ["store"],
              "parameters" : [ {
                "in" : "path",
                "name" : "store_uuid",
                "description" : "the store uuid",
                "required" : true,
                "type" : "string"
              }],
            }
          }
        }
      },
      httpClient: axios
    });

    const client = swagger.get('store');

    const params = {
      store_uuid: "1"
    };

    const url = client.buildUrl("/store/{store_uuid}", params);
    const options = client.buildRequestOptions("/store/{store_uuid}", params);

    expect(url).toEqual('http://www.example.com/store/1.0.0/store/1');
    expect(options).toEqual({
      method: 'get',
      body: {},
      headers: {
        'content-type': "application/json",
      }
    })
  });

  test('operation not found error throw', () => {
    const swagger = new Swagger({
      spec: {
        swagger: '2.0',
        info: {
          version: '1.0.0',
          title: 'My test',
          description: 'The swagger spec description'
        },
        tags: [{
          name: 'store',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http", "https"],
        paths: {
          '/store/{store_uuid}': {
            "get": {
              "consumes": ["application/json"],
              "summary": "获取商店评分",
              "tags": ["store"],
              "parameters" : [ {
                "in" : "path",
                "name" : "store_uuid",
                "description" : "the store uuid",
                "required" : true,
                "type" : "string"
              }],
            }
          }
        }
      },
      httpClient: axios
    });

    const client = swagger.get('store');

    const params = {
      store_uuid: "1"
    };

    expect(() => client.buildUrl("updateStore", params)).toThrow(OperationNotFoundError);
  });

  test('params in body with token header', () => {
    const swagger = new Swagger({
      spec: {
        swagger: '2.0',
        info: {
          version: '1.0.0',
          title: 'My test',
          description: 'The swagger spec description'
        },
        tags: [{
          name: 'store',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http"],
        paths: {
          '/store/{store_uuid}': {
            "post": {
              "consumes": ["application/json"],
              "operationId": "updateStore",
              "tags": ["store"],
              "parameters" : [ {
                "in" : "body",
                "name" : "store",
              }, {
                "in" : "header",
                "name" : "token",
                "type": "string"
              }],
            }
          },
          '/store': {
            'post': {
              'tags': ['store'],
              'operationId': 'addStore',
              "consumes": ["application/json"],
              'produces': ['application/json'],
              'parameters': [{
                'name': 'body',
                'in': 'body',
                'required': true,
                'schema': {
                  '$ref': '#/definitions/QualityStandardItem'
                }
              }, {
                "in" : "header",
                "name" : "token",
                "type": "string"
              }],
              'responses': {
                '200': {
                  'description': 'successful operation',
                  'schema': {
                    '$ref': '#/definitions/ApiResponse'
                  }
                },
                '400': {
                  'description': 'Invalid ID supplied'
                },
                '404': {
                  'description': 'qualityStandardItem not found'
                }
              }
            }
          }
        }
      },
      httpClient: axios
    });

    const client = swagger.get('store');

    const params = {
      body: {
        name: "store name",
        address: "Street 1, Ningbo, Zhejiang"
      },
      token: "myaccesstoken",
    };

    const options = client.buildRequestOptions("updateStore", params);
    expect(options).toEqual({
      method: "post",
      headers: {
        "content-type": "application/json",
        "token": 'myaccesstoken',
      },
      body: {
        name: "store name",
        address: "Street 1, Ningbo, Zhejiang"
      }
    });

    const options2 = client.buildRequestOptions("addStore", {
      body: {
        name: "store name",
        address: "Street 1, Ningbo, Zhejiang",
        createdBy: "wangxianbin"
      },
      token: "myaccesstoken1",
    });

    expect(options2).toEqual({
      method: "post",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "token": 'myaccesstoken1',
      },
      body: {
        name: "store name",
        address: "Street 1, Ningbo, Zhejiang",
        createdBy: "wangxianbin"
      }
    });
  });

  test('url build test', () => {
    const swagger = new Swagger({
      spec: {
        swagger: '2.0',
        info: {
          version: '1.0.0',
          title: 'My test',
          description: 'The swagger spec description'
        },
        tags: [{
          name: 'store',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http"],
        paths: {
          '/store/{store_uuid}': {
            "post": {
              "consumes": ["application/json"],
              "operationId": "updateStore",
              "tags": ["store"],
              "parameters" : [ {
                "in" : "path",
                "name" : "store_uuid",
              }, {
                "in" : "query",
                "name" : "name",
              }, {
                "in" : "header",
                "name" : "token",
                "type": "string"
              }],
            }
          }
        }
      },
      httpClient: axios
    });

    expect(swagger.get("store").buildUrl("updateStore", {
      body: {
        address: "Street 1, Ningbo, Zhejiang"
      },
      store_uuid: "1",
      name: "store name",
      token: "myaccesstoken",
    })).toEqual('http://www.example.com/store/1.0.0/store/1?name=store%20name');

    expect(swagger.get("store").buildUrl("updateStore", {
      body: {
        address: "Street 1, Ningbo, Zhejiang"
      },
      store_uuid: "1",
      token: "myaccesstoken",
    })).toEqual('http://www.example.com/store/1.0.0/store/1');

    expect(() => {
      swagger.get("store").buildUrl("updateStore", {
        body: {
          address: "Street 1, Ningbo, Zhejiang"
        },
        name: "store name",
        token: "myaccesstoken",
      })
    }).toThrow(RequiredParameterMissError);

  });

  test('default parameters test', () => {
    const swagger = new Swagger({
      spec: {
        swagger: '2.0',
        info: {
          version: '1.0.0',
          title: 'My test',
          description: 'The swagger spec description'
        },
        tags: [{
          name: 'store',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http", "https"],
        paths: {
          '/store/{store_uuid}': {
            "post": {
              "consumes": ["application/json"],
              "operationId": "updateStore",
              "tags": ["store"],
              "parameters" : [ {
                "in" : "path",
                "name" : "store_uuid",
              }, {
                "in" : "query",
                "name" : "name",
              }, {
                "in" : "header",
                "name" : "token",
                "type": "string"
              }],
            }
          }
        }
      },
      httpClient: axios,
      defaultParams: {
        schema: "https"
      }
    });

    expect(swagger.get("store").buildUrl("updateStore", {
      body: {
        address: "Street 1, Ningbo, Zhejiang"
      },
      store_uuid: "1",
      name: "store name",
      token: "myaccesstoken",
    })).toEqual('https://www.example.com/store/1.0.0/store/1?name=store%20name');
  })
});
