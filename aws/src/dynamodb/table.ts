import { DynamoDB } from 'aws-sdk';
import * as winston from 'winston';

export const ensureTable = async ({ config, data }: { config: DynamoDB.Types.CreateTableInput, data }) => {
    const db = new DynamoDB({ apiVersion: '2012-08-10' });
    try {
        const response = await db.createTable(config)
            .promise();

        winston.debug('table: createTable', response.TableDescription);

        await db.waitFor('tableExists', { TableName: config.TableName })
            .promise();

        winston.debug('table: tableExists');

        // TODO could use batch API
        const promises = data.map((item) =>
            new DynamoDB.DocumentClient()
                .put({
                    TableName: config.TableName,
                    Item: item
                })
                .promise()
        );
        await Promise.all(promises);

        winston.debug('table: put');

        return response.TableDescription;
    } catch (e) {
        if (e.code !== 'ResourceInUseException') {
            throw e;
        }
        const table = await db.describeTable({ TableName: config.TableName })
            .promise();

        winston.debug('table: describeTable', table.Table);

        return table.Table;
    }
};

export const pruneTables = async ({ filter = (_tableName: string) => false }) => {
    const db = new DynamoDB({ apiVersion: '2012-08-10' });

    const listResponse = await db.listTables()
        .promise();

    winston.debug('table: listResponse', listResponse.TableNames);

    const tableNamesToPrune = listResponse.TableNames
        .filter(tableName => filter(tableName));

    winston.debug('table: tableNamesToPrune', tableNamesToPrune);

    const promises = tableNamesToPrune.map(tableName =>
        db.deleteTable({ TableName: tableName })
            .promise()
    );

    await Promise.all(promises);
};
