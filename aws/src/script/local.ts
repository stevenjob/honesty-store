import { config, DynamoDB } from 'aws-sdk';
import { ensureTable } from '../dynamodb/table';
import { templateJSON } from '../template';

(<any>config).endpoint = 'http://localhost:8000/';

export const createLocalDatabase = async ({ tableName }) => {
    const { config, data } = await templateJSON({
        type: 'table',
        name: tableName,
        data: { }
    });
    return await ensureTable({
        config: {
            ...config,
            TableName: tableName
        },
        data
    });
};
