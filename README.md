# hotpot-swagger-client
Simple swagger client by typescript

## Usage

The manager instance initialization

```typescript
const swagger = new Swagger({
  spec: {...},
});
```

Swagger can build the client instance by swagger 'tags' defined in spec.

```typescript
const client = swagger.get('order')

const params = {
  body: {
    ...
  },
  query: {
    ...
  }
};

const res = await client.exec('getOrder', params)

// or 

const res = await client.getOrder(params)
```

Swagger custom fetch

```typescript
interface FetchableInterface {
  fetch(url, options): Promise<any>;
}

class myHttpClient implements FetchableInterface {
  fetch(url, options): Promise<any> {
    throw new Error()
  }
}

const swagger = new Swagger({
  spec: {...},
  httpClient: myHttpClient
});
```

Model mapping
```typescript
swagger.mappings({
  'order': [
    {from: 'addressLine', to: 'address'},
    {from: 'addressLine', to: 'address', process: (address) => {
      return address[0] + address[1]
    }},
  ]
})
```
