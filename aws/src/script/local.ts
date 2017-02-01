import { config, DynamoDB } from 'aws-sdk';
import { ensureTable } from '../dynamodb/table';
import dirToTable from '../table/tables';

export const createLocalDatabase = async ({ tableName }) => {
    const { config, data } = dirToTable({
        dir: tableName,
        readCapacityUnits: 10,
        writeCapacityUnits: 10,
    });
    return await ensureTable({
        config: {
            ...config,
            TableName: tableName
        },
        data
    });
};
