import {ResultOK, ResultFAIL, ResultOk, tryCatchWrapperAsync} from "node-result";
import {DynamoDB} from "aws-sdk";

export class DynamoDocumentClient {
    @tryCatchWrapperAsync
    static async update(client: DynamoDB.DocumentClient, tableName: DynamoDB.DocumentClient.TableName, where: DynamoDB.DocumentClient.Key, data: DynamoDB.DocumentClient.AttributeUpdates): Promise<ResultOK<DynamoDB.DocumentClient.AttributeMap> | ResultFAIL<Error>> {
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

