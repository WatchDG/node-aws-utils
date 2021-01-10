import { ResultOK, ResultFAIL, ResultOk, tryCatchWrapperAsync } from 'node-result';
import { DynamoDB } from 'aws-sdk';

export class DynamoDocumentClient {
  @tryCatchWrapperAsync
  static async get(
    client: DynamoDB.DocumentClient,
    tableName: DynamoDB.DocumentClient.TableName,
    where: DynamoDB.DocumentClient.Key
  ): Promise<ResultOK<DynamoDB.DocumentClient.AttributeMap | null> | ResultFAIL<Error>> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: tableName,
      Key: where
    };
    const { Item } = await client.get(params).promise();
    return ResultOk(Item || null);
  }

  @tryCatchWrapperAsync
  static async update(
    client: DynamoDB.DocumentClient,
    tableName: DynamoDB.DocumentClient.TableName,
    where: DynamoDB.DocumentClient.Key,
    data: { [key: string]: unknown }
  ): Promise<ResultOK<DynamoDB.DocumentClient.AttributeMap> | ResultFAIL<Error>> {
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
