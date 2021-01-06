import { ResultOK, ResultFAIL } from "node-result";
import { DynamoDB } from "aws-sdk";
export declare class DynamoDocumentClient {
    static update(client: DynamoDB.DocumentClient, tableName: DynamoDB.DocumentClient.TableName, where: DynamoDB.DocumentClient.Key, data: DynamoDB.DocumentClient.AttributeUpdates): Promise<ResultOK<DynamoDB.DocumentClient.AttributeMap> | ResultFAIL<Error>>;
}
