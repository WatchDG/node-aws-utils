# node-aws-utils

## install dependencies

```shell
yarn install
# or
npm install
```

## build

```shell
yarn run build
# or
npm run build
```

## Dynamo

### get item

```ts
import {DynamoDB} from "aws-sdk";
import {DynamoDocumentClient} from "node-aws-utils";

(async () => {
    const tableName = 'store';
    const where = {id: 1};
    const dynamo = new DynamoDB.DocumentClient();
    const storeData = (await DynamoDocumentClient.get(dynamo, tableName, where)).unwrap();
    console.log(storeData);
    // object or null
})();
```

### put or update item

```ts
import {DynamoDB} from "aws-sdk";
import {DynamoDocumentClient} from "node-aws-utils";

(async () => {
    const tableName = 'store';
    const where = {id: 1};
    const data = {email: 'user@store.com'};
    const dynamo = new DynamoDB.DocumentClient();
    const updatedData = (await DynamoDocumentClient.update(dynamo, tableName, where, data)).unwrap();
    console.log(updatedData);
    // object or empty object
})();
```