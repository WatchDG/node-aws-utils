import {ResultOK, ResultFAIL, ResultOk, tryCatchWrapperAsync} from "node-result";
import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";

export class DynamoDocumentClient {
    @tryCatchWrapperAsync
    static async get(client: DynamoDB.DocumentClient, tableName: DynamoDB.DocumentClient.TableName, where: DynamoDB.DocumentClient.Key): Promise<ResultOK<DynamoDB.DocumentClient.AttributeMap | null> | ResultFAIL<Error>> {
        const params: DynamoDB.DocumentClient.GetItemInput = {
            TableName: tableName,
            Key: where
        };
        const {Item} = await client.get(params).promise();
        return ResultOk(Item || null);
    }

    @tryCatchWrapperAsync
    static async update(client: DynamoDB.DocumentClient, tableName: DynamoDB.DocumentClient.TableName, where: DynamoDB.DocumentClient.Key, data: { [key: string]: any }): Promise<ResultOK<DynamoDB.DocumentClient.AttributeMap> | ResultFAIL<Error>> {
        const params: DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: tableName,
            Key: where,
            AttributeUpdates: {},
            ReturnValues: 'UPDATED_NEW',
        };
        const keys = Object.keys(data);
        if (keys.length > 0) {
            params.AttributeUpdates!['updatedAt'] = {
                Action: 'PUT',
                Value: new Date().toUTCString()
            };
            for (const key of keys) {
                if (!!data[key]) {
                    params.AttributeUpdates![key] = {
                        Action: 'PUT',
                        Value: data[key]
                    };
                } else {
                    params.AttributeUpdates![key] = {
                        Action: 'DELETE',
                    };
                }
            }
            const {Attributes} = await client.update(params).promise();
            return ResultOk(Attributes!);
        }
        return ResultOk({});
    }
}

