import { ok, tryCatchAsync } from 'node-result';
import type { TResultAsync } from 'node-result';
import type { DynamoDB } from 'aws-sdk';

export class DynamoDocumentClient {
  @tryCatchAsync
  static async get(
    client: DynamoDB.DocumentClient,
    tableName: DynamoDB.DocumentClient.TableName,
    where: DynamoDB.DocumentClient.Key,
    options: {
      fields?: string[];
      fieldsMap?: DynamoDB.DocumentClient.ExpressionAttributeNameMap;
      consistent?: boolean;
      capacity?: DynamoDB.DocumentClient.ReturnConsumedCapacity;
    } = {}
  ): TResultAsync<DynamoDB.DocumentClient.AttributeMap | null, Error> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: tableName,
      Key: where
    };
    if (options.fields) params.ProjectionExpression = options.fields.join(',');
    if (options.fieldsMap) params.ExpressionAttributeNames = options.fieldsMap;
    if (options.consistent) params.ConsistentRead = options.consistent;
    if (options.capacity) params.ReturnConsumedCapacity = options.capacity;
    const { Item, ConsumedCapacity } = await client.get(params).promise();
    return ok({ item: Item || null, capacity: ConsumedCapacity || null });
  }

  @tryCatchAsync
  static async getFromIndex(
    client: DynamoDB.DocumentClient,
    tableName: DynamoDB.DocumentClient.TableName,
    indexName: DynamoDB.DocumentClient.IndexName,
    where: {
      pk: { name: DynamoDB.DocumentClient.AttributeName; value: DynamoDB.DocumentClient.AttributeValue };
      sk?: { name: DynamoDB.DocumentClient.AttributeName; value: DynamoDB.DocumentClient.AttributeValue };
    }
  ): TResultAsync<DynamoDB.DocumentClient.ItemList | null, Error> {
    const params: Required<
      Pick<
        DynamoDB.DocumentClient.QueryInput,
        'TableName' | 'IndexName' | 'KeyConditionExpression' | 'ExpressionAttributeNames' | 'ExpressionAttributeValues'
      >
    > = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: '#PK = :pk',
      ExpressionAttributeNames: {
        '#PK': where.pk.name
      },
      ExpressionAttributeValues: {
        ':pk': where.pk.value
      }
    };
    if (where.sk) {
      params.KeyConditionExpression += ` AND #SK = :sk`;
      params.ExpressionAttributeNames['#SK'] = where.sk.name;
      params.ExpressionAttributeValues[':sk'] = where.sk.value;
    }
    const { Items } = await client.query(params).promise();
    return ok(Items || null);
  }

  @tryCatchAsync
  static async update(
    client: DynamoDB.DocumentClient,
    tableName: DynamoDB.DocumentClient.TableName,
    where: DynamoDB.DocumentClient.Key,
    data: { [key: string]: unknown }
  ): TResultAsync<DynamoDB.DocumentClient.AttributeMap, Error> {
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: where,
      AttributeUpdates: {},
      ReturnValues: 'UPDATED_NEW'
    };
    const attributes: DynamoDB.DocumentClient.AttributeUpdates = {};
    const keys = Object.keys(data);
    if (keys.length > 0) {
      keys.forEach((key) => {
        attributes[key] =
          data[key] !== void 0
            ? {
                Action: 'PUT',
                Value: data[key]
              }
            : {
                Action: 'DELETE'
              };
      });
      params.AttributeUpdates = attributes;
      const { Attributes } = await client.update(params).promise();
      if (Attributes) return ok(Attributes);
    }
    return ok({});
  }
}
