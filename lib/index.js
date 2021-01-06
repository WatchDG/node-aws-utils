"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDocumentClient = void 0;
const node_result_1 = require("node-result");
class DynamoDocumentClient {
    static async update(client, tableName, where, data) {
        const params = {
            TableName: tableName,
            Key: where,
            AttributeUpdates: {},
            ReturnValues: 'UPDATED_NEW',
        };
        const keys = Object.keys(data);
        if (keys.length > 0) {
            params.AttributeUpdates['updatedAt'] = {
                Action: 'PUT',
                Value: new Date().toUTCString()
            };
            for (const key of keys) {
                if (!!data[key]) {
                    params.AttributeUpdates[key] = {
                        Action: 'PUT',
                        Value: data[key]
                    };
                }
                else {
                    params.AttributeUpdates[key] = {
                        Action: 'DELETE',
                    };
                }
            }
            const { Attributes } = await client.update(params).promise();
            return node_result_1.ResultOk(Attributes);
        }
        return node_result_1.ResultOk({});
    }
}
__decorate([
    node_result_1.tryCatchWrapperAsync
], DynamoDocumentClient, "update", null);
exports.DynamoDocumentClient = DynamoDocumentClient;
