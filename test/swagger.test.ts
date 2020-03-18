import Swagger, {TagOperationNotFoundError} from "../src/swagger";
import AxiosHttpClient from "../src/plugins/axios-http-client";
import SwaggerClient from "../src/swagger-client";
import {buildSwaggerByUrl} from "../src/swagger"

describe('Swagger', () => {
  test('can be instantiated', () => {
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
        paths: {}
      },
      httpClient: new AxiosHttpClient()
    });

    expect(swagger).toBeInstanceOf(Swagger);
  });

  test('get operations by tag', () => {
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
        },{
          name: 'search',
        }],
        paths: {
          "/store/{store_uuid}/score": {
            "get": {
              "summary": "获取商店评分",
              "operationId": "getStoreScoreByUuid",
              "tags": ["store"],
              "consumes": ["application/json"],
            }
          },
          "/store/search": {
            "post": {
              "summary": "根据关键词搜索商店",
              "operationId": "searchStore",
              "tags": ["search"],
            }
          },
          "/store/{store_uuid}/recommend" : {
            "get" : {
              "summary" : "获取商家推荐",
              "tags" : [ "search" ]
            }
          }
        }
      },
      httpClient: new AxiosHttpClient()
    });

    const storeOperations = swagger.getOperationsByTag('store');
    const searchOperations = swagger.getOperationsByTag('search');
    expect(Object.keys(storeOperations).length).toEqual(1);
    expect(Object.keys(searchOperations).length).toEqual(2);

    expect(storeOperations['id:getStoreScoreByUuid']).toBeDefined();
    expect(storeOperations['id:getStoreScoreByUuid'].method).toEqual('get');
    expect(storeOperations['id:getStoreScoreByUuid'].path).toEqual('/store/{store_uuid}/score');
    expect(storeOperations['id:getStoreScoreByUuid'].operation).toEqual({
      "summary": "获取商店评分",
      "operationId": "getStoreScoreByUuid",
      "tags": ["store"],
      "consumes": ["application/json"],
    });

    expect(searchOperations['path:/store/{store_uuid}/recommend']).toBeDefined();
    expect(searchOperations['path:/store/{store_uuid}/recommend'].operation).toEqual({
      "summary" : "获取商家推荐",
      "tags" : [ "search" ]
    });
  });

  test('get base url', () => {
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
        },{
          name: 'search',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http", "https"],
        paths: {}
      },
      httpClient: new AxiosHttpClient()
    });

    expect(swagger.baseUrl).toEqual("www.example.com/store/1.0.0");
  });

  test('get client tag not found operations', () => {
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
        },{
          name: 'search',
        }],
        host: "www.example.com",
        basePath: "/store/1.0.0",
        schemes: ["http", "https"],
        paths: {}
      },
      httpClient: new AxiosHttpClient()
    });

    expect(() => swagger.get('search')).toThrow(TagOperationNotFoundError);
  });
  
  test("url",async () => {
    const swagger = await buildSwaggerByUrl({
      url: "http://petstore.swagger.io/v2/swagger.json",
      httpClient: new AxiosHttpClient()
    })
    expect(swagger.get('pet')).toBeInstanceOf(SwaggerClient)
  })

});
