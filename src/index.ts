import { ResultOk, tryCatchWrapperAsync, ReturningResultAsync } from 'node-result';
import { DynamoDB } from 'aws-sdk';

export class DynamoDocumentClient {
  @tryCatchWrapperAsync
  static async get(
    client: DynamoDB.DocumentClient,
    tableName: DynamoDB.DocumentClient.TableName,
    where: DynamoDB.DocumentClient.Key
  ): ReturningResultAsync<DynamoDB.DocumentClient.AttributeMap | null, Error> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: tableName,
      Key: where
    };
    const { Item } = await client.get(params).promise();
    return ResultOk(Item || null);
  }

  @tryCatchWrapperAsync
  static async getFromIndex(
    client: DynamoDB.DocumentClient,
    tableName: DynamoDB.DocumentClient.TableName,
    indexName: DynamoDB.DocumentClient.IndexName,
    where: {
      pk: { name: DynamoDB.DocumentClient.AttributeName; value: DynamoDB.DocumentClient.AttributeValue };
      sk?: { name: DynamoDB.DocumentClient.AttributeName; value: DynamoDB.DocumentClient.AttributeValue };
    }
  ): ReturningResultAsync<DynamoDB.DocumentClient.ItemList | null, Error> {
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
    return ResultOk(Items || null);
  }

  @tryCatchWrapperAsync
  static async update(
    client: DynamoDB.DocumentClient,
    tableName: DynamoDB.DocumentClient.TableName,
    where: DynamoDB.DocumentClient.Key,
    data: { [key: string]: unknown }
  ): ReturningResultAsync<DynamoDB.DocumentClient.AttributeMap, Error> {
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: where,
      AttributeUpdates: {},
      ReturnValues: 'UPDATED_NEW'
    };
    const attributes: DynamoDB.DocumentClient.AttributeUpdates = {};
    const keys = Object.keys(data);
    if (keys.length > 0) {
      for (const key of keys) {
        if (data[key]) {
          attributes[key] = {
            Action: 'PUT',
            Value: data[key]
          };
        } else {
          attributes[key] = {
            Action: 'DELETE'
          };
        }
      }
      params.AttributeUpdates = attributes;
      const { Attributes } = await client.update(params).promise();
      if (Attributes) {
        return ResultOk(Attributes);
      }
    }
    return ResultOk({});
  }
}
